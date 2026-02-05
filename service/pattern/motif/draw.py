# service/pattern/motif/draw.py
import os
import graph_tool.all as gt
from typing import List, Optional

BOX_SIZE = 700

def draw_motifs(motif_list: List[gt.Graph], counts: List[int], output_dir: str, k: int, min_occurs: int, file_id: Optional[str] = None) -> List[str]:
    os.makedirs(output_dir, exist_ok=True)
    basenames = []

    safe_file_prefix = f"{file_id}_" if file_id else ""
    min_part = f"min{min_occurs}" if min_occurs is not None else "min_all"

    for i, motif in enumerate(motif_list):
        basename = f"{safe_file_prefix}motif_k{k}_{min_part}_{i}.png"
        motif_file = os.path.join(output_dir, basename)

        n = motif.num_vertices()
        if n <= 0:
            basenames.append(basename)
            continue

        K = 1.2 * (n ** 0.5)
        node_size = max(40.0, 140.0 / (n ** 0.5))
        font_size = max(14, int(40 / (n ** 0.4)))
        edge_width = max(2.5, 6.0 / (n ** 0.3))
        arrow_size = max(18, int(45 / (n ** 0.3)))

        pos = gt.sfdp_layout(motif, K=K, epsilon=0.03, cooling_step=0.96)

        v_size = motif.new_vertex_property("float")
        for v in motif.vertices():
            v_size[v] = node_size

        gt.graph_draw(
            motif,
            pos=pos,
            vertex_size=v_size,
            vertex_pen_width=3.0,
            vertex_pen_color=[0, 0, 0, 0.85],
            vertex_fill_color=motif.vertex_properties.get('color', [0.2, 0.6, 0.95, 1]),
            vertex_shape=motif.vertex_properties.get('shape', 'circle'),
            vertex_text=motif.vertex_index,
            vertex_font_size=font_size,
            vertex_text_color=[0, 0, 0, 1],
            edge_pen_width=edge_width,
            edge_color=[0.15, 0.15, 0.15, 1],
            edge_marker_size=arrow_size,
            edge_text=None,
            output=motif_file,
            output_size=(BOX_SIZE, BOX_SIZE),
            fit_view=True,
            bg_color=None
        )

        basenames.append(basename)

    return basenames
