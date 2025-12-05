from datetime import datetime
from enum import Enum
import math
from typing import Any, Callable, Iterable, cast
from graph_tool import VertexPropertyMap
import graph_tool.all as gt
import json

import numpy

ENTITY = 'entity'
ACTIVITY = 'activity'
AGENT = 'agent'
REDUCED = 'reduced'
LINE_COMPRESSED = 'line_compressed'
CHUNK_COMPRESSED = 'chunk_compressed'

YPROVTOOLS = 'yprovtools'
YPROVTOOLS_URL = 'http://example.org'

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

class Props(Enum):
  """Keys used to reference `PropertyMaps` in graphs. These values should
  always be used through their `value` attribute."""
  ID = 'id'
  TYPE = 'type'
  START_TIME = 'start_time'
  END_TIME = 'end_time'
  OTHER_TYPE = 'other_type'
  LEVEL = 'level'
  SOURCE = 'source'
  AGGREGATES = 'aggregates'
  WORKER = 'worker'
  CELL_INDEX = 'yprov4wfs:jupyter_cell_index'
  CELL_LINE = 'yprov4wfs:jupyter_cell_line'
  CELL_LINE_START = 'yprov4wfs:jupyter_cell_line_start'
  CELL_LINE_END = 'yprov4wfs:jupyter_cell_line_end'

class PropKeys(Enum):
  """Keys used to reference properties in json dictionaries. These values should
  always be used through their `value` attribute."""
  LABEL = 'prov:label'
  OTHER_TYPE = 'prov:type'
  START_TIME = 'prov:startTime'
  END_TIME = 'prov:endTime'
  LEVEL = 'yprovtools:level'
  SOURCE = 'yprovtools:source'
  AGGREGATES = 'yprovtools:aggregates'
  WORKER = 'yprov4wfs:processed_on'
  CELL_INDEX = 'yprov4wfs:jupyter_cell_index',
  CELL_LINE = 'yprov4wfs:jupyter_cell_line',
  CELL_LINE_START = 'yprov4wfs:jupyter_cell_line_start',
  CELL_LINE_END = 'yprov4wfs:jupyter_cell_line_end'

RELATION = 'relation'

type Entry = tuple[str, bool, bool]
def to_map_key(key: str) -> str:
  return f'{key}_aggr'

class CustomPropertiesList:
  def __init__(self) -> None:
    self.props: dict[str, Entry] = {}
    self.aggregated_props_set = set()

  def __getitem__(self, key: str) -> Entry:
    return self.props[key]

  def add(self, key: str, v_type: str, v_aggregate: bool, v_unique: bool):
    self.props[key] = (v_type, v_aggregate, v_unique)
    if v_aggregate:
      self.aggregated_props_set.add(key)
    elif v_aggregate in self.aggregated_props_set:
      self.aggregated_props_set.remove(key)

  def should_aggregate(self, key) -> bool:
    if key in self.props:
      return self.props[key][1]
    return False
  
  def should_keep_unique(self, key) -> bool:
    if key in self.props:
      return self.props[key][2]
    return False

  def aggregated_props(self) -> Iterable[str]:
    return self.aggregated_props_set

  def aggregated_props_map_keys(self) -> Iterable[str]:
    return map(to_map_key, self.aggregated_props_set)

  def keys(self) -> Iterable[str]:
    return self.props.keys()

def create_custom_property_maps(graph: gt.Graph, file) -> CustomPropertiesList:
  """Given a graph and a path to some props definitions, creates for each
  property a VertexPropertyMap of the appropriate type and registers it with
  the graph."""

  props = CustomPropertiesList()
  with open(file, 'r') as props_def:
    for line in props_def:
      components = line.split()
      if len(components) >= 2:
        prop_key = components[0]
        prop_type = components[1]
        should_aggregate = components[2] == '1'
        should_keep_unique = components[3] == '1'
        try:
          map = graph.new_vertex_property(prop_type)
          graph.vertex_properties[prop_key] = map
          props.add(prop_key, prop_type, should_aggregate, should_keep_unique)
          if should_aggregate:
            aggr_type = prop_type
            if not prop_type.startswith('vector'):
              aggr_type = f'vector<{prop_type}>'
            graph.vertex_properties[to_map_key(prop_key)] = graph.new_vertex_property(aggr_type)
        except Exception as e:
          print(f'Error in vertex property registration: {prop_key}')
          print(e)
  return props

def _read_timestamps(json: dict[str, Any]) -> tuple[float, float]:
  """Extracts from a json the start and end time as timestamps"""
  format_str = '%Y-%m-%d %H:%M:%S.%f'
  start = float('inf')
  end = float('-inf')
  if PropKeys.START_TIME.value in json:
    value = json[PropKeys.START_TIME.value]
    try:
      start_dt = datetime.strptime(value, format_str)
      start = start_dt.timestamp()
    except ValueError:
      pass
  if PropKeys.END_TIME.value in json:
    value = json[PropKeys.END_TIME.value]
    try:
      end_dt = datetime.strptime(value, format_str)
      end = end_dt.timestamp()
    except ValueError:
      pass
  return (start, end)

def _write_timestamps(g: gt.Graph, v) -> tuple[str | None, str | None]:
  """Prepares start and end datetimes for vertex `v`."""

  start_ts = g.vertex_properties[Props.START_TIME.value][v]
  end_ts = g.vertex_properties[Props.END_TIME.value][v]
  start = None
  end = None

  if not math.isinf(start_ts):
    start = str(datetime.fromtimestamp(start_ts))
  if not math.isinf(end_ts):
    end = str(datetime.fromtimestamp(end_ts))
  return (start, end)

def from_prov_json(file, props_file) -> tuple[gt.Graph, dict[str, str], CustomPropertiesList]:
  """Loads a provenance graph from its json representation. Returns the graph,
  the prefix header of the provenance file which is necessary for later
  serializations and a list of custom properties if `props_file` is not `None`."""

  graph = gt.Graph()
  json_dict: dict[str, Any] = json.load(file)

  prefix = json_dict['prefix']
  props = CustomPropertiesList()
  if props_file is not None:
    props = create_custom_property_maps(graph, props_file)

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

  id_to_vertex = cast(
    VertexPropertyMap,
    graph.add_edge_list(edges, eprops=[relation], hashed=True)
  )
  vertex_to_id = {}
  for v, id in enumerate(id_to_vertex):
    vertex_to_id[id] = v

  vertices = {}
  vertex_types = graph.new_vertex_property('string')
  for vertex_type in node_types:
    if vertex_type not in json_dict:
      continue    
    for key, attrs in json_dict[vertex_type].items():
      vertices[key] = attrs
      if key in vertex_to_id:
        vertex_types[vertex_to_id[key]] = vertex_type
      else:
        pass

  vertex_labels = graph.new_vertex_property('string')
  vertex_additional_types = graph.new_vertex_property('string')
  vertex_levels = graph.new_vertex_property('int')
  vertex_sources = graph.new_vertex_property('string')
  vertex_aggregates = graph.new_vertex_property('vector<string>')
  vertex_start_times = graph.new_vertex_property('double')
  vertex_end_times = graph.new_vertex_property('double')

  for v in graph.vertices():
    json_vertex = vertices[id_to_vertex[v]]
    if isinstance(json_vertex, list):
      if len(json_vertex) == 0:
        continue
      json_vertex = json_vertex[0]
    vertex_type = vertex_types[v]

    start, end = _read_timestamps(json_vertex)
    vertex_start_times[v] = start
    vertex_end_times[v] = end

    if PropKeys.LABEL.value in json_vertex:
      vertex_labels[v] = json_vertex[PropKeys.LABEL.value]
    else:
      vertex_labels[v] = id_to_vertex[v]
    if PropKeys.OTHER_TYPE.value in json_vertex:
      vertex_additional_types[v] = json_vertex[PropKeys.OTHER_TYPE.value]
    else:
      vertex_additional_types[v] = vertex_types[v]
    if PropKeys.LEVEL.value in json_vertex:
      vertex_levels[v] = json_vertex[PropKeys.LEVEL.value]
    else:
      vertex_levels[v] = 0
    if PropKeys.SOURCE.value in json_vertex:
      vertex_sources[v] = json_vertex[PropKeys.SOURCE.value]
    if PropKeys.AGGREGATES.value in json_vertex:
      vertex_aggregates[v] = json_vertex[PropKeys.AGGREGATES.value]

    # Load custom properties
    for prop_key in props.keys():
      if prop_key in json_vertex:
        graph.vertex_properties[prop_key][v] = json_vertex[prop_key]
    for prop_key in props.aggregated_props_map_keys():
      if prop_key in json_vertex:
        graph.vertex_properties[prop_key][v] = json_vertex[prop_key]

  graph.vertex_properties[Props.ID.value] = id_to_vertex
  graph.vertex_properties[Props.TYPE.value] = vertex_types
  graph.vertex_properties[Props.START_TIME.value] = vertex_start_times
  graph.vertex_properties[Props.END_TIME.value] = vertex_end_times
  graph.vertex_properties[Props.OTHER_TYPE.value] = vertex_additional_types
  graph.vertex_properties[Props.LEVEL.value] = vertex_levels
  graph.vertex_properties[Props.SOURCE.value] = vertex_sources
  graph.vertex_properties[Props.AGGREGATES.value] = vertex_aggregates
  graph.edge_properties[RELATION] = relation
  return (graph, prefix, props)

def to_prov_json(g: gt.Graph, output: str, prefix: dict[str, str], props: CustomPropertiesList):
  """Converts `g` graph in json. Prefix and custom properties are set according
  to parameters."""

  def convert_vector(vec):
    if isinstance(vec, gt.Vector_string):
      return [item for item in vec]

  doc: dict[str, dict[str, Any]] = {
    'prefix': prefix
  }
  for key in node_types:
    doc[key] = {}
  for key in edge_types:
    doc[key] = {}

  ids: gt.VertexPropertyMap = g.vertex_properties[Props.ID.value]
  for v in g.vertices():
    v_id: str = ids[v]
    v_type: str = g.vertex_properties[Props.TYPE.value][v]
    v_other_type: str = g.vertex_properties[Props.OTHER_TYPE.value][v]
    v_level: int = g.vertex_properties[Props.LEVEL.value][v]
    v_start, v_end = _write_timestamps(g, v)
    entry: dict[str, Any] = {
      PropKeys.LABEL.value: v_id,
      PropKeys.OTHER_TYPE.value: v_other_type,
      PropKeys.LEVEL.value: v_level,
    }

    if v_start:
      entry[PropKeys.START_TIME.value] = v_start
    if v_end:
      entry[PropKeys.END_TIME.value] = v_end

    v_source: str | None = g.vertex_properties[Props.SOURCE.value][v]
    if v_source:
      entry[PropKeys.SOURCE.value] = v_source
    v_aggregates: list[str] | None = g.vertex_properties[Props.AGGREGATES.value][v]
    if v_aggregates:
      entry[PropKeys.AGGREGATES.value] = v_aggregates

    # Serialize custom properties and custom aggregated properties
    for prop_key in props.keys():
      map: VertexPropertyMap = g.vertex_properties[prop_key]
      if map[v]:
        entry[prop_key] = map[v]

    for prop_key in props.aggregated_props():
      aggr_prop_key = to_map_key(prop_key)
      map: VertexPropertyMap = g.vertex_properties[aggr_prop_key]
      if map[v]:
        entry[aggr_prop_key] = map[v]

    doc[v_type][v_id] = entry
  
  for e in g.edges():
    source = g.vertex_properties[Props.ID.value][e.source()]
    dest = g.vertex_properties[Props.ID.value][e.target()]
    rel_type = g.edge_properties[RELATION][e]
    doc[rel_type][str(e)] = dict(zip(source_dest[rel_type], [source, dest]))
  
  with open(output, 'w') as file:
    json.dump(doc, file, indent=2, default=convert_vector)

def count_nodes_per_type(g: gt.Graph) -> dict[str, int]:
  """Counts how many entities, activities and agents there are in `g`."""

  counts = {
    ENTITY: 0,
    ACTIVITY: 0,
    AGENT: 0
  }

  types = g.vertex_properties[Props.TYPE.value]
  for v in g.vertices():
    counts[types[v]] += 1

  return counts

def group_nodes(
  g: gt.Graph, items: dict[Any, set[int]],
  key_fn: Callable[[Any, int], str], type_fn: Callable[[Any], str],
  file_name: str, props: CustomPropertiesList
) -> tuple[dict[Any, int], set[int]]:
  """Given a graph and a dictionary mapping some sort of objecct to a set of
  vertices, creates a new vertex for each object. The new vertex keeps track of
  all old vertices that it has aggregated within its properties. All properties
  are kept updated and treated according to `props`. Return a new dictionary
  that maps each object to the corresponding vertex and a set of the old
  vertices."""

  obj_to_new_vertex: dict[Any, int] = {}
  old_vertices: set[int] = set()

  for key, vertices in items.items():
    if len(vertices) <= 1:
      continue

    v = cast(int, g.add_vertex())
    obj_to_new_vertex[key] = v
    old_vertices.update(vertices)
    aggregated = vertices
    old_v = aggregated.pop()
    v_type = g.vertex_properties[Props.TYPE.value][old_v]
    aggregated.add(old_v)

    v_level = numpy.max(
      [g.vertex_properties[Props.LEVEL.value][a_v] for a_v in aggregated]
    ) + 1
    g.vertex_properties[Props.LEVEL.value][v] = v_level
    v_start_time = numpy.min(
      [g.vertex_properties[Props.START_TIME.value][a_v] for a_v in aggregated]
    )
    g.vertex_properties[Props.START_TIME.value][v] = v_start_time
    v_end_time = numpy.max(
      [g.vertex_properties[Props.END_TIME.value][a_v] for a_v in aggregated]
    )
    g.vertex_properties[Props.END_TIME.value][v] = v_end_time
    g.vertex_properties[Props.TYPE.value][v] = v_type
    g.vertex_properties[Props.ID.value][v] = key_fn(key, v_level)
    g.vertex_properties[Props.SOURCE.value][v] = file_name
    g.vertex_properties[Props.AGGREGATES.value][v] = [
      g.vertex_properties[Props.ID.value][old_v] for old_v in aggregated
    ]
    g.vertex_properties[Props.OTHER_TYPE.value][v] = type_fn(key)

    # Aggregate custom props
    for prop in props.aggregated_props():
      values = []
      aggr_prop = to_map_key(prop)
      for a_v in aggregated:
        value = g.vertex_properties[prop][a_v]
        if value:
          if isinstance(value, Iterable) and not isinstance(value, str):
            values.extend(value)
          else:
            values.append(value)
        aggr_values = g.vertex_properties[aggr_prop][a_v]
        if aggr_values:
          values.extend(aggr_values)
      
      # Try to remove duplicates
      if props.should_keep_unique(prop):
        try:
          unique_values = set(values)
          g.vertex_properties[aggr_prop][v] = unique_values
        except:
          g.vertex_properties[aggr_prop][v] = values
      else:
        g.vertex_properties[aggr_prop][v] = values
  return (obj_to_new_vertex, old_vertices)

def update_edges(
  g: gt.Graph, items: dict[Any, int], rev_items: dict[int, Any]
) -> tuple[set[Any], list[Any]]:
  """Given a graph, a dictionary mapping objects to vertices representing them
  and another dictionary mapping any vertex to some object, returns a new graph
  in which edges between vertices associated to the same object can be removed
  and edges connecting vertices representing different objects have been added.
  Returns the set of old edges and a list of the newly added ones."""

  relations = g.edge_properties[RELATION]
  old_edges = set()
  new_edges = list()

  for e in g.edges():
    e_type = relations[e]
    source: int = e.source()
    source_lc = rev_items.get(source)
    source_v = items.get(source_lc, source)

    dest: int = e.target()
    dest_lc = rev_items.get(dest)
    dest_v = items.get(dest_lc, dest)

    if not (not source_lc and not dest_lc):
      old_edges.add(e)
      if source_v != dest_v:
        new_edges.append((source_v, dest_v, e_type))
  
  g.add_edge_list(new_edges, hashed=False, eprops=[relations])
  return (old_edges, new_edges)

def finalize_graph_reduction(
  g: gt.Graph, old_vertices: set[int], old_edges: set[Any]
) -> gt.GraphView:
  """Given a graph, a set of vertices and a set of edges that can be removed,
  returns a filtered view of the graph."""

  gv = gt.GraphView(
    g,
    vfilt=lambda v: v not in old_vertices,
    efilt=lambda e: e not in old_edges
  )
  gt.remove_parallel_edges(gv)

  cycles = gt.all_circuits(gv)
  for cycle in cycles:
    for v in cycle[:-1]:
      if len(set(gv.get_all_neighbours(v))) <= 2:
        old_vertices.add(v)

  gv = gt.GraphView(
    g,
    vfilt=lambda v: v not in old_vertices,
    efilt=lambda e: e not in old_edges
  )

  return gv

def input_key_fn(key: str, level: int) -> str:
  return f'{key}.input'

def output_key_fn(key: str, level: int) -> str:
  return f'{key}.output'

def derivation_key_fn(key: str, level: int) -> str:
  return f'{key}.source'

def io_type_fn(key: str) -> str:
  return 'REDUCED_IO'

class GroupType(Enum):
  """When grouping input/output nodes tells what kind of nodes should be grouped."""

  INPUT = 1
  OUPUT = 2
  DERIVATION = 3

def group_io(g: gt.Graph, group: GroupType) -> tuple[dict[str, set[int]], dict[int, str]]:
  subgraph = gt.GraphView(
    g, vfilt=lambda v: g.vertex_properties[Props.TYPE.value][v] == ENTITY
  )
  items: dict[str, set[int]] = {}
  rev_items: dict[int, str] = {}
  relations = g.edge_properties[RELATION]
  ids = g.vertex_properties[Props.ID.value]

  if group == GroupType.INPUT:
    # [a --used-> b]
    # Inputs of an activity are entities ... a: {b}
    inputs_of: dict[int, set[int]] = {}
    # An entity is an input for ... b: {a}
    inputs_for: dict[int, set[int]] = {}

    for v in subgraph.vertices():
      in_edges = g.get_in_edges(v)
      for source, dest in in_edges:
        if relations[(source, dest)] == 'used':
          values = inputs_of.get(source, set())
          values.add(dest)
          inputs_of[source] = values
          values = inputs_for.get(dest, set())
          values.add(source)
          inputs_for[dest] = values
      
    for activity, all_inputs in inputs_of.items():
      if len(all_inputs) == 1:
        continue
      inputs = set()
      for entity in all_inputs:
        if len(inputs_for[entity]) == 1:
          inputs.add(entity)
          rev_items[entity] = ids[activity]
      items[ids[activity]] = inputs
  elif group == GroupType.OUPUT:
    # [a --wasGeneratedBy-> b]
    # Outputs of an activity are entities ... b: {a}
    outputs_of: dict[int, set[int]] = {}
    # An entity is an output for ... a: {b}
    outputs_for: dict[int, set[int]] = {}

    for v in subgraph.vertices():
      out_edges = g.get_out_edges(v)
      for source, dest in out_edges:
        if relations[(source, dest)] == 'wasGeneratedBy':
          values = outputs_of.get(dest, set())
          values.add(source)
          outputs_of[dest] = values
          values = outputs_for.get(source, set())
          values.add(dest)
          outputs_for[source] = values
      
    for activity, all_outputs in outputs_of.items():
      if len(all_outputs) == 1:
        continue
      outputs = set()
      for entity in all_outputs:
        if len(outputs_for[entity]) == 1:
          outputs.add(entity)
          rev_items[entity] = ids[activity]
      items[ids[activity]] = outputs
  else:
    # [a --wasDerivedFrom-> b]
    # This entity wasDerivedFrom ... a: {b}
    derives_from: dict[int, set[int]] = {}
    # This set of entities all were derived from ... b: {a}
    derived_by: dict[int, set[int]] = {}

    for v in subgraph.vertices():
      out_edges = g.get_out_edges(v)
      for source, dest in out_edges:
        if relations[(source, dest)] == 'wasDerivedFrom':
          values = derives_from.get(source, set())
          values.add(dest)
          derives_from[source] = values
          values = derived_by.get(dest, set())
          values.add(source)
          derived_by[dest] = values
    
    for generatedEntity, all_used in derives_from.items():
      if len(all_used) == 1:
        continue
      used = set()
      for used_entity in all_used:
        if len(derived_by[used_entity]) == 1 and len(g.get_out_edges(used_entity)) == 0:
          used.add(used_entity)
          rev_items[used_entity] = ids[generatedEntity]
      items[ids[generatedEntity]] = used
  return (items, rev_items)  

def reduce_graph_by_compression(
  g: gt.Graph, items: dict[Any, set[int]], rev_items: dict[int, Any],
  key_fn: Callable[[Any, int], str], type_fn: Callable[[Any], str],
  reduce_io: bool, file_name: str, props: CustomPropertiesList
) -> gt.GraphView:
  """This is a shorthand functions that combines returns a filtered view of a
  graph in which nodes have been merged according to a dictionary `items` mapping
  objects to a set of vertices. Calling this function produces the same result
  as calling `group_nodes`, `update_edges` and `finalize_graph_reduction`."""

  result = group_nodes(
    g, items, key_fn, type_fn, file_name, props
  )

  new_items = result[0]
  old_vertices = result[1]    

  result = update_edges(g, new_items, rev_items)
  old_edges = result[0]

  red_graph = finalize_graph_reduction(g, old_vertices, old_edges)
  
  if reduce_io:
    red_graph = compress_io(red_graph, file_name, props, True, True, True)
  return red_graph

def type_unchunked_fn(key: str) -> str:
  return CHUNK_COMPRESSED

def compress_io(
  g: gt.Graph, file_name: str, props: CustomPropertiesList,
  group_input: bool, group_output: bool, group_derivations: bool
) -> gt.GraphView:
  """Given a graph reduced just its inputs and/or outputs."""

  red_graph = gt.GraphView(g)
  if group_input:
    io_items, rev_io_items = group_io(g, group=GroupType.INPUT)
    red_graph = reduce_graph_by_compression(
      red_graph, io_items, rev_io_items, input_key_fn, io_type_fn,
      False, file_name, props
    )
  if group_output:
    io_items, rev_io_items = group_io(g, group=GroupType.OUPUT)
    red_graph = reduce_graph_by_compression(
      red_graph, io_items, rev_io_items, output_key_fn, io_type_fn,
      False, file_name, props
    )
  if group_derivations:
    io_items, rev_io_items = group_io(red_graph, group=GroupType.DERIVATION)
    red_graph = reduce_graph_by_compression(
      red_graph, io_items, rev_io_items, derivation_key_fn, io_type_fn,
      False, file_name, props
    )
  return red_graph