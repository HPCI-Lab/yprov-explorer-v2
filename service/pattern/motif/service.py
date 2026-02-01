# service/pattern/motif/service.py
from typing import List, Dict

def build_response(instances_list: List[List[List[str]]], counts: List[int], basenames: List[str], k: int, min_occurs: int) -> Dict:
    response = {}
    for i, insts in enumerate(instances_list):
        motif_name = f"Motif #{i+1}"
        image_basename = basenames[i] if i < len(basenames) else ""
        response[motif_name] = {
            "occurrences": counts[i] if i < len(counts) else 0,
            "image": f"/patterns/{image_basename}",
            "instances": insts
        }
    return response
