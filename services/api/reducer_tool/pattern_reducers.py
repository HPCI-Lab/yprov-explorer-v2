from collections import deque
from enum import Enum
from typing import Any, cast
import graph_tool.all as gt
import numpy

import utils as ut

type NewVertices = dict[Any, set[int]]
type NewEdges = dict[Any, set[int]]

class Pattern(Enum):
  PIPELINE = 2
  FORK = 1
  JOIN = 3

  def __str__(self) -> str:
    if self == Pattern.PIPELINE:
      return 'pipeline'
    elif self == Pattern.FORK:
      return 'fork'
    else:
      return 'join'

type PatternKey = tuple[Pattern, int]
type PatternMap = dict[PatternKey, set[int]]
type VertexMultiMap = dict[int, set[PatternKey]]
type VertexMap = dict[int, PatternKey]

def find_patterns(g: gt.Graph) -> tuple[PatternMap, VertexMultiMap]:
  patterns: PatternMap = {}
  vertices_in_patterns: VertexMultiMap = {}
  vertices_in_pipelines = set()
  pipeline_idx = 0
  fork_idx = 0
  join_idx = 0

  for v in g.vertices():
    vertices_in_patterns[v] = set()

  for v in g.vertices():
    in_vertices = cast(numpy.ndarray, g.get_in_neighbours(v))
    out_vertices = cast(numpy.ndarray, g.get_out_neighbors(v))
    in_deg = len(in_vertices)
    out_deg = len(out_vertices)

    # Checks if the vertex is the anchor of a JOIN
    if in_deg >= 2:
      # Joins are always reduced as they are effectively just removing the anchor
      join_vertices = set()
      join_vertices.add(v)
      join_vertices.update(in_vertices)
        
      if len(join_vertices) > 1:
        pattern_key = (Pattern.JOIN, join_idx)
        patterns[pattern_key] = join_vertices
        vertices_in_patterns[v].add(pattern_key)
        for n in in_vertices:
          vertices_in_patterns[n].add(pattern_key)
        join_idx += 1

    # Checks if the vertex is the anchor of a FORK
    if out_deg >= 2:
      in_degrees = g.get_in_degrees(out_vertices)
      fork_vertices = set()
      fork_vertices.add(v)
      # Recognize the fork only if its 'clean'
      if all(in_degrees[i] == 1 for i, _ in enumerate(out_vertices)):
        fork_vertices.update(out_vertices)

      if len(fork_vertices) > 1:
        pattern_key = (Pattern.FORK, fork_idx)
        patterns[pattern_key] = fork_vertices
        for n in fork_vertices:
          vertices_in_patterns[n].add(pattern_key)
        fork_idx += 1

    # Checks if the node is part of a PIPELINE
    if v not in vertices_in_pipelines and (
      in_deg == 1 or out_deg == 1
    ):
      vertices_in_pipelines.add(v)
      pipeline = deque([v])
      # Proceed towards the start of the pipeline
      if in_deg == 1:
        n = in_vertices[0]
        in_vertices = g.get_in_neighbors(n)
        out_deg = g.get_out_degrees([n])[0]
        while len(in_vertices) == 1 and out_deg == 1 and n not in vertices_in_pipelines:
          vertices_in_pipelines.add(n)
          pipeline.appendleft(n)
          n = in_vertices[0]
          in_vertices = g.get_in_neighbors(n)
          out_deg = g.get_out_degrees([n])[0]
        if out_deg == 1 and n not in vertices_in_pipelines:
          pipeline.appendleft(n)
          vertices_in_pipelines.add(n)

      # Proceed towards the end of the pipeline
      out_deg = len(out_vertices)
      if out_deg == 1:
        n = out_vertices[0]
        out_vertices = g.get_out_neighbors(n)
        in_deg = g.get_in_degrees([n])[0]
        while len(out_vertices) == 1 and in_deg == 1 and n not in vertices_in_pipelines:
          pipeline.append(n)
          vertices_in_pipelines.add(n)
          n = out_vertices[0]
          out_vertices = g.get_out_neighbors(n)
          in_deg = g.get_in_degrees([n])[0]
        if in_deg == 1 and n not in vertices_in_pipelines:
          pipeline.append(n)
          vertices_in_pipelines.add(n)

      if len(pipeline) >= 2:
        pattern_key = (Pattern.PIPELINE, pipeline_idx)
        patterns[pattern_key] = set(pipeline)
        for n in pipeline:
          vertices_in_patterns[n].add(pattern_key)
          vertices_in_pipelines.add(n)
        pipeline_idx += 1
  return (patterns, vertices_in_patterns)

def get_activity_subgraph(g: gt.Graph) -> gt.GraphView:
  """Returns the activity scheleton of the graph"""

  return gt.GraphView(
    g,
    vfilt=lambda v: g.vertex_properties[ut.Props.TYPE.value][v] == ut.ACTIVITY,
    efilt=lambda e: g.edge_properties[ut.RELATION][e] == 'wasInformedBy'
  )

def get_entity_subgraph(g: gt.Graph) -> gt.GraphView:
  """Returns the entitu scheleton of the graph"""

  return gt.GraphView(
    g,
    vfilt=lambda v: g.vertex_properties[ut.Props.TYPE.value][v] == ut.ENTITY,
    efilt=lambda e: g.edge_properties[ut.RELATION][e] == 'wasDerivedFrom'
  )

def choose_patterns(
  patterns: PatternMap, vertex_to_patterns: VertexMultiMap
) -> tuple[list[PatternKey], VertexMap]:
  """Returns a list of pattern keys that can all be reduced. Among intersecing
  patterns, the one that leaves behind less nodes is selected. This is equivalent
  to choose the biggest patterns. Returns a list of the selected patterns and
  a dictionary mapping each vertex to a pattern."""

  exclusion_map: dict[PatternKey, set[PatternKey]] = {}
  excluded_counts: dict[PatternKey, int] = {}
  for key, vertices in patterns.items():
    excluded_patterns = set()
    excluded_count = 0
    for v in vertices:
      for other_key in vertex_to_patterns[v]:
        if other_key != key:
          excluded_patterns.add(other_key)
          excluded_count += len(patterns[other_key])
    exclusion_map[key] = excluded_patterns
    excluded_counts[key] = excluded_count

  priorities = sorted(excluded_counts.keys(), key=lambda k: excluded_counts[k])
  excluded_patterns = set()
  sorted_patterns = []
  vertex_to_single_patterns = {}
  for key in priorities:
    if key not in excluded_patterns:
      sorted_patterns.append(key)
      excluded_patterns.update(exclusion_map[key])
      for v in patterns[key]:
        vertex_to_single_patterns[v] = key

  return (sorted_patterns, vertex_to_single_patterns)

def choose_patterns2(
  patterns: PatternMap, vertex_to_patterns: VertexMultiMap
) -> tuple[list[PatternKey], VertexMap]:
  """Returns a list of pattern keys that can all be reduced. Among intersecting
  patterns selects that associated to the patterns with highest priority.
  Priorities are in reverse order, so `1` represents a higher priority than `2`."""

  exclusion_map: dict[PatternKey, set[PatternKey]] = {}
  for key, vertices in patterns.items():
    excluded_vertices = set()
    for v in vertices:
      for other_key in vertex_to_patterns[v]:
        if other_key != key:
          excluded_vertices.add(other_key)
    exclusion_map[key] = excluded_vertices

  priorities = sorted(patterns.keys(), key=lambda k: k[0].value)
  excluded_patterns = set()
  sorted_patterns = []
  vertex_to_single_patterns = {}
  for key in priorities:
    if key not in excluded_patterns:
      sorted_patterns.append(key)
      excluded_patterns.update(exclusion_map[key])
      for v in patterns[key]:
        vertex_to_single_patterns[v] = key

  return (sorted_patterns, vertex_to_single_patterns)

def reduce(
  g: gt.Graph, pattern_to_vertices: PatternMap,
  vertex_to_patterns: VertexMap, reduce_io: bool,
  file_name: str, props: ut.CustomPropertiesList
) -> gt.GraphView:
  """Reduces the graph by merging together nodes that are part of the same
  pattern. `pattern_to_vertices` must have already been filtered to contain only
  those pattern that do not intersect."""

  def key_fn(key: PatternKey, level: int) -> str:
    return f'{key[0]}_{level}_{key[1]}'
  def type_fn(key: PatternKey) -> str:
    return f'{ut.REDUCED}_{key[0]}'

  return ut.reduce_graph_by_compression(
    g, pattern_to_vertices, vertex_to_patterns,
    key_fn, type_fn, reduce_io, file_name, props
  )
