import graph_tool.all as gt
import json
import os
from typing import Any, List, Tuple


# ---------------------- COSTANTI ----------------------
ENTITY = 'entity'
ACTIVITY = 'activity'
AGENT = 'agent'
REDUCED = 'reduced'

vertex_colors = {
    ENTITY: [0.988, 0.792, 0.275, 1],
    ACTIVITY: [0.447, 0.337, 0.690, 1],
    AGENT: [0.804, 0.565, 0.369, 1],
    REDUCED: [0.541, 0.361, 0.875, 1]
}

vertex_shapes = {
    ENTITY: 'square',
    ACTIVITY: 'circle',
    AGENT: 'heptagon',
    REDUCED: 'double_circle'
}

node_types = [ENTITY, ACTIVITY, AGENT]
edge_types = [
    'used', 'wasGeneratedBy', 'wasAssociatedWith', 'wasAttributedTo',
    'actedOnBehalfOf', 'wasInformedBy', 'wasDerivedFrom'
]

source_dest = {
    'used': ('prov:activity', 'prov:entity'),
    'wasGeneratedBy': ('prov:entity', 'prov:activity'),
    'wasAssociatedWith': ('prov:activity', 'prov:agent'),
    'wasAttributedTo': ('prov:entity', 'prov:agent'),
    'actedOnBehalfOf': ('prov:delegate', 'prov:responsible'),
    'wasInformedBy': ('prov:informed', 'prov:informant'),
    'wasDerivedFrom': ('prov:generatedEntity', 'prov:usedEntity')
}

RELATION = 'relation'

# ---------------------- FUNZIONI PRINCIPALI ----------------------

def from_prov_json(file_path: str) -> gt.Graph:
    """Parse JSON di provenance e costruisce un grafo graph-tool"""
    with open(file_path, 'r') as f:
        json_dict: dict[str, Any] = json.load(f)

    graph = gt.Graph()
    relation = graph.new_edge_property('string')
    edges = []

    for edge_type in edge_types:
        if edge_type not in json_dict:
            continue
        source_key, dest_key = source_dest[edge_type]
        for key, attrs in json_dict[edge_type].items():
            if isinstance(attrs, list):
                if len(attrs) == 0:
                    continue
                attrs = attrs[0]
            source = attrs[source_key]
            dest = attrs[dest_key]
            edges.append((source, dest, edge_type))

    vertex_ids = graph.add_edge_list(edges, eprops=[relation], hashed=True)
    id_to_vertex = {v_id: v_index for v_index, v_id in enumerate(vertex_ids)}

    # proprietà dei vertici
    vertices = {}
    vertex_types = graph.new_vertex_property('string')
    for vertex_type in node_types:
        if vertex_type not in json_dict:
            continue
        for key, attrs in json_dict[vertex_type].items():
            vertices[key] = attrs
            if key in id_to_vertex:
                vertex_types[id_to_vertex[key]] = vertex_type

    # proprietà aggiuntive
    vertex_additional_types = graph.new_vertex_property('string')
    vertex_level = graph.new_vertex_property('int')
    vertex_source = graph.new_vertex_property('string')
    vertex_aggregates = graph.new_vertex_property('vector<string>')
    vertex_color = graph.new_vertex_property('vector<float>')
    vertex_shape = graph.new_vertex_property('string')

    for v in graph.vertices():
        json_vertex = vertices[vertex_ids[v]]
        if isinstance(json_vertex, list) and len(json_vertex) > 0:
            json_vertex = json_vertex[0]
        v_type = vertex_types[v]
        if 'prov:type' in json_vertex:
            vertex_additional_types[v] = json_vertex['prov:type']
        if 'analytics4yprov:level' in json_vertex:
            vertex_level[v] = json_vertex['analytics4yprov:level']
            vertex_color[v] = vertex_colors[REDUCED]
            vertex_shape[v] = vertex_shapes[REDUCED]
        else:
            vertex_level[v] = 0
            vertex_color[v] = vertex_colors[v_type]
            vertex_shape[v] = vertex_shapes[v_type]
        if 'analytics4yprov:source' in json_vertex:
            vertex_source[v] = json_vertex['analytics4yprov:source']
        if 'analytics4yprov:aggregates' in json_vertex:
            vertex_aggregates[v] = json_vertex['analytics4yprov:aggregates']

    # assegnazione proprietà al grafo
    graph.vertex_properties['id'] = vertex_ids
    graph.vertex_properties['type'] = vertex_types
    graph.vertex_properties['other_type'] = vertex_additional_types
    graph.vertex_properties['color'] = vertex_color
    graph.vertex_properties['shape'] = vertex_shape
    graph.vertex_properties['level'] = vertex_level
    graph.vertex_properties['source'] = vertex_source
    graph.vertex_properties['aggregates'] = vertex_aggregates
    graph.edge_properties[RELATION] = relation

    return graph


def get_activity_subgraph(g: gt.Graph) -> gt.GraphView:
    """Restituisce il sottografo delle activity"""
    return gt.GraphView(
        g,
        vfilt=lambda v: g.vertex_properties['type'][v] == ACTIVITY,
        efilt=lambda e: g.edge_properties[RELATION][e] == 'wasInformedBy'
    )



# ---------- modifica apply_motif ----------
def apply_motif(file_path: str, k: int = 3, min_occurrences: int = 1) -> Tuple[List[gt.Graph], List[int], List[List[List[str]]]]:

    g = from_prov_json(file_path)
    activity_subgraph = get_activity_subgraph(g)

    motif_list_all, counts_all, vertex_maps_list_all = gt.motifs(activity_subgraph, k, return_maps=True)

    # filtra per occorrenze minime
    valid_indices = [i for i, count in enumerate(counts_all) if count >= min_occurrences]
    motif_list = [motif_list_all[i] for i in valid_indices]
    counts = [counts_all[i] for i in valid_indices]
    vertex_maps_list = [vertex_maps_list_all[i] for i in valid_indices]

    # Converti le mappature (vertex_maps_list) in ID leggibili (stringhe)
    instances_list = []
    # activity_subgraph condivide vertex_properties['id'] con il grafo originale:
    id_prop = activity_subgraph.vertex_properties.get('id', None)
    for maps_for_motif in vertex_maps_list:
        instances_for_motif = []
        for vertex_map in maps_for_motif:
            # vertex_map è una lista/array di indici (relativi alla view)
            instance_ids = []
            for v_main in vertex_map:
                # v_main può essere int o un oggetto; assicurati di convertire in int
                idx = int(v_main)
                try:
                    v = activity_subgraph.vertex(idx)
                    if id_prop is not None:
                        instance_ids.append(id_prop[v])
                    else:
                        # fallback: usa l'indice come stringa
                        instance_ids.append(str(int(v)))
                except Exception:
                    # fallback se la mappatura non è trovata
                    instance_ids.append(str(idx))
            instances_for_motif.append(instance_ids)
        instances_list.append(instances_for_motif)

    return motif_list, counts, instances_list

