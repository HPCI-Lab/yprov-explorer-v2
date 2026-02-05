# service/pattern/app.py
from fastapi import FastAPI, UploadFile, File, Form, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
import shutil
import os
import uuid
import traceback
from collections import OrderedDict
from typing import Tuple, Dict, Any

from motif import extract, draw, service as motif_service

app = FastAPI(title="yProv Motif API")

# Middleware with general approach
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"]
)

# Work Directory
BASE_DIR = "data"
GRAPHS_DIR = os.path.join(BASE_DIR, "graphs")
IMAGES_DIR = os.path.join(BASE_DIR, "images")

os.makedirs(GRAPHS_DIR, exist_ok=True)
os.makedirs(IMAGES_DIR, exist_ok=True)

app.mount("/patterns", StaticFiles(directory=IMAGES_DIR), name="patterns")

@app.get("/health")
async def health_check():
    return {"status": "ok", "message": "Motif API is running"}

def clear_data_dirs():
    deleted = {"graphs": 0, "images": 0}
    try:
        # delete graphs file
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

        # delete images
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

@app.delete("/motif/cleanup")
async def cleanup_endpoint():
    try:
        deleted = clear_data_dirs()
        return JSONResponse({"status": "ok", "deleted": deleted})
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": "Cleanup failed", "details": str(e)})

@app.post("/motif/upload")
async def upload_graph(file: UploadFile = File(...)):
    try:
        uid = str(uuid.uuid4())
        filename = f"{uid}_{file.filename}"
        graph_path = os.path.join(GRAPHS_DIR, filename)

        with open(graph_path, "wb") as f:
            shutil.copyfileobj(file.file, f)

        return JSONResponse({"status": "ok", "filename": filename})
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": "Upload failed", "details": str(e)})


CACHE_MAX = 10
pattern_cache = OrderedDict()  # type: OrderedDict[str, Dict[str, Any]]

def cache_key_from_filename_and_k(stored_filename: str, k: int) -> Tuple[str, str]:
    file_id = stored_filename.split("_", 1)[0]
    return f"{file_id}:{k}", file_id

def evict_one_cache_entry():
    key, entry = pattern_cache.popitem(last=False)
    basenames = entry.get("basenames", [])
    for b in basenames:
        try:
            p = os.path.join(IMAGES_DIR, b)
            if os.path.exists(p):
                os.remove(p)
        except Exception:
            pass


@app.post("/motif/extract_saved")
async def extract_saved(
    stored_filename: str = Form(...),
    k: int = Form(3),
    min_occurrences: int = Form(1)
):
    try:
        graph_path = os.path.join(GRAPHS_DIR, stored_filename)
        if not os.path.exists(graph_path):
            return JSONResponse(status_code=400, content={"error": "File not found", "details": f"{stored_filename} not in graphs directory"})

        key, file_id = cache_key_from_filename_and_k(stored_filename, k)

        if key in pattern_cache:
            entry = pattern_cache.pop(key)
            pattern_cache[key] = entry
            response = motif_service.build_response(entry["instances_list"], entry["counts"], entry["basenames"], k, 0)
            return JSONResponse(content=response)

        motif_list_all, counts_all, instances_list_all = extract.apply_motif(graph_path, k=k, min_occurrences=None)

        basenames = draw.draw_motifs(motif_list_all, counts_all, IMAGES_DIR, k=k, min_occurs=0, file_id=file_id)

        entry = {
            "motif_list": motif_list_all,
            "counts": counts_all,
            "instances_list": instances_list_all,
            "basenames": basenames
        }
        pattern_cache[key] = entry
        if len(pattern_cache) > CACHE_MAX:
            evict_one_cache_entry()

        response = motif_service.build_response(instances_list_all, counts_all, basenames, k, 0)
        return JSONResponse(content=response)

    except Exception as e:
        return JSONResponse(status_code=500, content={"error": "Motif extraction failed", "details": str(e)})


@app.post("/motif/filter_saved")
async def filter_saved(
    stored_filename: str = Form(...),
    k: int = Form(3),
    min_occurrences: int = Form(1)
):
    try:
        graph_path = os.path.join(GRAPHS_DIR, stored_filename)
        if not os.path.exists(graph_path):
            return JSONResponse(status_code=400, content={"error": "File not found", "details": f"{stored_filename} not in graphs directory"})

        key, file_id = cache_key_from_filename_and_k(stored_filename, k)

        if key not in pattern_cache:
            motif_list_all, counts_all, instances_list_all = extract.apply_motif(graph_path, k=k, min_occurrences=None)
            basenames = draw.draw_motifs(motif_list_all, counts_all, IMAGES_DIR, k=k, min_occurs=0, file_id=file_id)
            entry = {
                "motif_list": motif_list_all,
                "counts": counts_all,
                "instances_list": instances_list_all,
                "basenames": basenames
            }
            pattern_cache[key] = entry
            if len(pattern_cache) > CACHE_MAX:
                evict_one_cache_entry()

        entry = pattern_cache.pop(key)
        pattern_cache[key] = entry

        counts_all = entry["counts"]
        instances_all = entry["instances_list"]
        basenames = entry["basenames"]

        response = motif_service.build_response(instances_all, counts_all, basenames, k, 0)
        return JSONResponse(content=response)

    except Exception as e:
        return JSONResponse(status_code=500, content={"error": "Filter failed", "details": str(e)})


@app.on_event("shutdown")
def on_shutdown_cleanup():
    try:
        print("Server shutting down — clearing data dirs...")
        deleted = clear_data_dirs()
        print("Deleted on shutdown:", deleted)
    except Exception:
        print("Error during shutdown cleanup:", traceback.format_exc())
