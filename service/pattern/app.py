from fastapi import FastAPI, UploadFile, File, Form, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
import shutil
import os
import uuid
import traceback

from motif import extract, draw, service as motif_service

app = FastAPI(title="yProv Motif API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"]
)

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
        # elimina files in graphs
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

@app.post("/motif/extract")
async def extract_motif(
    file: UploadFile = File(...),
    k: int = Form(3),
    min_occurrences: int = Form(1)
):
    try:
        uid = str(uuid.uuid4())
        filename = f"{uid}_{file.filename}"
        graph_path = os.path.join(GRAPHS_DIR, filename)

        with open(graph_path, "wb") as f:
            shutil.copyfileobj(file.file, f)

        motif_list, counts, instances_list = extract.apply_motif(
            graph_path, k=k, min_occurrences=min_occurrences
        )

        motif_image_basenames = draw.draw_motifs(motif_list, counts, IMAGES_DIR, k=k, min_occurs=min_occurrences)

        response = motif_service.build_response(instances_list, counts, motif_image_basenames, k, min_occurrences)

        return JSONResponse(content=response)

    except Exception as e:
        return JSONResponse(status_code=500, content={"error": "Motif extraction failed", "details": str(e)})

@app.on_event("shutdown")
def on_shutdown_cleanup():
    try:
        print("Server shutting down — clearing data dirs...")
        deleted = clear_data_dirs()
        print("Deleted on shutdown:", deleted)
    except Exception:
        print("Error during shutdown cleanup:", traceback.format_exc())
