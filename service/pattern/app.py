# service/pattern/app.py
from fastapi import FastAPI, UploadFile, File, Form, Request, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, HTMLResponse
from fastapi.staticfiles import StaticFiles
import shutil
import os
import uuid
import traceback
from collections import OrderedDict
import markdown
from typing import Tuple, Dict, Any, List, Optional

from motif import extract, draw, service as motif_service

app = FastAPI(title="yProv Motif API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"]
)

BASE_DIR = os.path.join(os.path.dirname(__file__), "data")
GRAPHS_DIR = os.path.join(BASE_DIR, "graphs")
IMAGES_DIR = os.path.join(BASE_DIR, "images")
OUTPUTS_DIR = os.path.join(BASE_DIR, "outputs")

app.mount("/patterns", StaticFiles(directory=IMAGES_DIR), name="patterns")
app.mount("/outputs", StaticFiles(directory=OUTPUTS_DIR), name="outputs")

os.makedirs(GRAPHS_DIR, exist_ok=True)
os.makedirs(IMAGES_DIR, exist_ok=True)

CACHE_MAX = 10
pattern_cache: "OrderedDict[str, Dict[str, Any]]" = OrderedDict()

# CACHE FUNCTION
def cacheKey(stored_filename: str, k: int) -> Tuple[str, str]:
    file_id = stored_filename.split("_", 1)[0]
    return f"{file_id}:{k}", file_id

def oneCache_entry():
    key, entry = pattern_cache.popitem(last=False)
    basenames = entry.get("basenames", [])
    for b in basenames:
        try:
            p = os.path.join(IMAGES_DIR, b)
            if os.path.exists(p):
                os.remove(p)
        except Exception:
            pass

# BUILD MOTIF FUNCTION
def build_motif(entry: Dict[str, Any], k: int, min_occurrences: int):
    motifs = []
    motif_list = entry.get("motif_list", [])
    counts = entry.get("counts", [])
    instances = entry.get("instances_list", [])
    basenames = entry.get("basenames", [])

    length = max(len(motif_list), len(counts), len(instances), len(basenames))
    for i in range(length):
        count = counts[i] if i < len(counts) else 0
        if count < min_occurrences:
            continue

        motifs.append({
            "image": f"/patterns/{basenames[i]}" if i < len(basenames) else None,
            "occurrences": count,
            "instances": instances[i] if i < len(instances) else []
        })
    return motifs

# CLEAR DIRECTORY FUNCTION
def clear_directory():
    deleted = {"graphs": 0, "images": 0}
    try:
        for fname in os.listdir(GRAPHS_DIR):
            fpath = os.path.join(GRAPHS_DIR, fname)
            try:
                if os.path.isfile(fpath) or os.path.islink(fpath):
                    os.remove(fpath)
                    deleted["graphs"] += 1
                elif os.path.isdir(fpath):
                    shutil.rmtree(fpath)
            except Exception:
                pass

        for fname in os.listdir(IMAGES_DIR):
            fpath = os.path.join(IMAGES_DIR, fname)
            try:
                if os.path.isfile(fpath) or os.path.islink(fpath):
                    os.remove(fpath)
                    deleted["images"] += 1
                elif os.path.isdir(fpath):
                    shutil.rmtree(fpath)
            except Exception:
                pass
    except Exception:
        print("Error clearing data dirs:", traceback.format_exc())
    return deleted

####################
# WEB REQUESTS
####################

# HEALTH: CHECK STATUS
@app.get("/health")
async def health_check():
    return {"status": "ok", "message": "Motif API is running"}

# UPLOAD: UPLOAD FILE PROVENACE
@app.post("/api/graphs/upload")
async def upload_graph(file: UploadFile = File(...)):
    uid = str(uuid.uuid4())
    stored_filename = f"{uid}_{file.filename}"
    graph_path = os.path.join(GRAPHS_DIR, stored_filename)

    with open(graph_path, "wb") as f:
        shutil.copyfileobj(file.file, f)

    return JSONResponse({
        "status": "ok",
        "id": uid,
        "filename": stored_filename
    })

# HOMEPAGE FOR MOTIF API
from fastapi.responses import HTMLResponse
import markdown
import os

@app.get("/api/graphs")
async def api_home():
    readme_path = os.path.join(os.path.dirname(__file__), "README.md")
    if not os.path.exists(readme_path):
        return HTMLResponse("<h1>Motif API</h1><p>README.md non trovato</p>", status_code=500)
    with open(readme_path, "r", encoding="utf-8") as f:
        md = f.read()
    try:
        files = os.listdir(GRAPHS_DIR)
    except Exception:
        files = []
    if files:
        graphs_md = "\n".join(f"- **{f}**  \n  ID: `{f.split('_', 1)[0]}`" for f in files)
    else:
        graphs_md = "_Nessun file caricato_"
    header = "## File Caricati"
    if header in md:
        parts = md.split(header, 1)
        md = parts[0] + header + "\n\n" + graphs_md + "\n\n" + parts[1]
    else:
        md = md + "\n\n## File Caricati\n\n" + graphs_md
    html_body = markdown.markdown(md, extensions=["fenced_code", "tables", "toc", "codehilite"])
    full = f"""<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <title>Motif API</title>
  <style>
    body {{
      max-width: 900px;
      margin: 40px auto;
      font-family: system-ui, -apple-system, BlinkMacSystemFont;
      line-height: 1.6;
    }}
    code {{
      background: #f4f4f4;
      padding: 2px 6px;
      border-radius: 4px;
    }}
    pre {{
      background: #f4f4f4;
      padding: 12px;
      border-radius: 8px;
      overflow-x: auto;
    }}
  </style>
</head>
<body>
{html_body}
</body>
</html>
"""
    return HTMLResponse(content=full)



# POST: SHOW ALL PATTERNS FROM A PROVENACE FILE - used for extract operation 
@app.post("/api/graphs/{stored_filename}/pattern")
async def pattern_extract(
    stored_filename: str,
    k: int = Query(...),
    min_occurrences: int = Query(1),
    min_count: int = Query(None)
):
    if min_count is not None:
        min_occurrences = min_count

    graph_path = os.path.join(GRAPHS_DIR, stored_filename)
    if not os.path.exists(graph_path):
        return JSONResponse(status_code=404, content={"detail": "File not found"})

    key, file_id = cacheKey(stored_filename, k)

    if key not in pattern_cache:
        motif_list, counts, instances = extract.apply_motif(
            graph_path,
            k=k,
            min_occurrences=None
        )
        basenames = draw.draw_motifs(
            motif_list,
            counts,
            IMAGES_DIR,
            k=k,
            min_occurs=0,
            file_id=file_id
        )
        pattern_cache[key] = {
            "motif_list": motif_list,
            "counts": counts,
            "instances_list": instances,
            "basenames": basenames
        }
        if len(pattern_cache) > CACHE_MAX:
            oneCache_entry()

    entry = pattern_cache[key]
    motif_list = []
    counts = entry.get("counts", [])
    instances = entry.get("instances_list", [])
    basenames = entry.get("basenames", [])
    length = max(len(counts), len(instances), len(basenames))
    for i in range(length):
        count = counts[i] if i < len(counts) else 0
        if count < min_occurrences:
            continue
        motif = {
            "motif_id": f"#{i+1}",
            "image": f"/patterns/{basenames[i]}" if i < len(basenames) else None,
            "k": k,
            "occurrences": count,
            "instances": instances[i] if i < len(instances) else []
        }
        motif_list.append(motif)

    return JSONResponse(content=motif_list)

# GET: SHOW ALL PATTERNS FROM A PROVENACE FILE
@app.get("/api/graphs/{stored_filename}/pattern")
async def patternList(
    stored_filename: str,
    k: int = Query(None),
    min_count: int = Query(1)
):
    if not any(f == stored_filename for f in os.listdir(GRAPHS_DIR)):
        return JSONResponse(status_code=404, content={"detail": "File not found"})

    file_id = stored_filename.split("_", 1)[0]
    results = []
    # if k provided, restrict to that k only
    keys = [k] if k is not None else sorted(
        set(int(key.split(":",1)[1]) for key in pattern_cache.keys() if key.startswith(f"{file_id}:"))
    )
    for kk in keys:
        key = f"{file_id}:{kk}"
        entry = pattern_cache.get(key)
        if not entry:
            continue
        counts = entry.get("counts", [])
        instances = entry.get("instances_list", [])
        basenames = entry.get("basenames", [])
        length = max(len(counts), len(instances), len(basenames))
        for i in range(length):
            count = counts[i] if i < len(counts) else 0
            if count < min_count:
                continue
            results.append({
                "motif_id": f"#{i+1}",
                "image": f"/patterns/{basenames[i]}" if i < len(basenames) else None,
                "k": kk,
                "occurrences": count,
                "instances": instances[i] if i < len(instances) else []
            })
    results.sort(key=lambda x: (x["k"], x["motif_id"]))
    return JSONResponse(content=results)

# SHOW ALL INSTANCES FROM A SINGLE PATTERN
@app.get("/api/graphs/{stored_filename}/pattern/{motif_id}")
async def getPattern(
    stored_filename: str,
    motif_id: str,
    k: int = Query(None)
):
    if not any(f == stored_filename for f in os.listdir(GRAPHS_DIR)):
        return JSONResponse(status_code=404, content={"detail": "File not found"})

    file_id = stored_filename.split("_", 1)[0]
    candidates = []
    if k is not None:
        key = f"{file_id}:{k}"
        entry = pattern_cache.get(key)
        if entry:
            candidates.append((k, entry))
    else:
        for key, entry in pattern_cache.items():
            if key.startswith(f"{file_id}:"):
                try:
                    _, kstr = key.split(":", 1)
                    kk = int(kstr)
                    candidates.append((kk, entry))
                except Exception:
                    continue

    if not candidates:
        return JSONResponse(status_code=404, content={"detail": "No patterns cached for this graph"})

    for kk, entry in candidates:
        motif_list = entry.get("motif_list", [])
        counts = entry.get("counts", [])
        instances = entry.get("instances_list", [])
        basenames = entry.get("basenames", [])
        if motif_id.startswith("#"):
            try:
                idx = int(motif_id.lstrip("#")) - 1
            except Exception:
                continue
        else:
            try:
                idx = int(motif_id) - 1
            except Exception:
                continue
        if idx < 0:
            continue
        if idx < max(len(counts), len(instances), len(basenames)):
            return JSONResponse(content={
                "motif_id": motif_id,
                "image": f"/patterns/{basenames[idx]}" if idx < len(basenames) else None,
                "k": kk,
                "occurrences": counts[idx] if idx < len(counts) else 0,
                "instances": instances[idx] if idx < len(instances) else []
            })

    return JSONResponse(status_code=404, content={"detail": "Motif not found"})



# CLEAN UP DIRECTORY
@app.delete("/motif/cleanup")
async def cleanup_endpoint():
    deleted = clear_directory()
    return JSONResponse({"status": "ok", "deleted": deleted})

@app.on_event("shutdown")
def on_shutdown_cleanup():
    clear_directory()
