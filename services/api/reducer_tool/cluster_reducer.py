import graph_tool.all as gt
import os
import utils as ut

def get_motifs(graph: gt.Graph, k: int) -> tuple[
  list[gt.Graph], list[int], list[list[gt.VertexPropertyMap]]
]:
  """Given a graph returns all motifs of `k` nodes in it. It also returns a list
  of counters indicating how many times each motif appears in the graph and a
  list of lists of vertex property maps providing a mapping between each motif
  and nodes in it."""

  motifs, counts, maps = gt.motifs(graph, k, p=1.0, return_maps=True) # pyright: ignore
  return motifs, counts, maps

def save_motifs(motifs: list[gt.Graph], counts: list[int], dest: str):
  tot = sum(counts)
  os.makedirs(dest, exist_ok=True)
  for motif, count in zip(motifs, counts):
    gt.graph_draw(motif, output=f'{dest}/motif_{count / tot:.3}.pdf')

def reduce_by_motifs(
  g: gt.Graph, k:int, motifs: list[gt.Graph], counts: list[int],
  maps: list[list[gt.VertexPropertyMap]], motif_name: str,
  props: ut.CustomPropertiesList
) -> gt.GraphView:
  # Pick the most common motif
  max_i = 0
  max_count = counts[0]
  for i, count in enumerate(counts):
    if count > max_count:
      max_i = i
      max_count = count

  motif = motifs[max_i]
  gt.graph_draw(motif, output=motif_name)
  print(f'Reducing by motif {motif_name}')
  motif_maps = maps[max_i]

  merged_vertices = set()
  og_vertices = len(g)
  items: dict[int, set[int]] = {}
  rev_items: dict[int, int] = {}
  while len(merged_vertices) < og_vertices and len(motif_maps) > 0:
    key = len(motif_maps)
    map = motif_maps.pop()
    vertices = set()
    clean = True
    for i in range(0, k):
      if map[i] in merged_vertices:
        clean = False
        break
      else:
        vertices.add(map[i])
    if not clean:
      continue
    merged_vertices.update(vertices)
    items[key] = vertices
    for v in vertices:
      rev_items[v] = key

  def key_fn(key: int, level: int) -> str:
    return f'motif_{key}_{level}'
  def type_fn(key: int) -> str:
    return f'reduced_motif'
  print(f'\tCompressing {len(rev_items)} nodes by {len(items)} motifs')
  return ut.reduce_graph_by_compression(
    g, items, rev_items, key_fn, type_fn, False, motif_name, props
  )
