[🇮🇹 Italiano](/api/graphs?lang=it) | 🇬🇧 English

# Provenance Graph Motif API

The Motif API provides an interface for extracting subgraph patterns from an input source graph. The service is built on a *Python* architecture and relies mainly on the **Graph-Tool** library. Starting from the source graph, the library allows the identification and extraction of recurring structural patterns in the graph, defined as *motifs*.

## Introduction

The pattern extraction service is integrated into the **yProv Explorer** application and is used to identify frequent subgraphs present in provenance graphs.

The Motif API is based on a *Python* architecture and leverages the dedicated *Graph-Tool* library, which enables structural analysis of graphs. In particular, the number of nodes of the patterns to extract is controlled by the parameter **k**, which defines the size (number of nodes) of the motifs to search for. Results can also be filtered via the **min_occurrences** parameter, which allows selecting only patterns that appear at least a given number of times, thus revealing motifs that are more or less frequent within the analyzed graph.

<p align="center">
  <img src="/outputs/pattern_graph.png" alt="Graphs">
</p>

## Instructions

The API exposes several web endpoints using **GET** and **POST**, which allow interaction with graphs and extracted patterns within the **yProv Explorer** application.

* **API Home**
  Represents the homepage dedicated to introducing the services offered by the API.

```html
GET /api/graphs
```

* **Upload Graph**
  Function used to upload a provenance file into the application, which is later passed to the motif extraction service.

```html
GET /api/graphs/upload
```

*Preview & Response:* the response returns a *unique ID* and the *full filename*, composed by the ID and the original uploaded file name.

<p align="center">
    <i>filename]: [id] + [original_filename]</i>
</p>

```json
# Example
{
    "status": "ok",
    "id": "7c5221eb-fe22-46f4-9c16-d21e6bb4c3b7",
    "filename":"7c5221eb-fe22-46f4-9c16-d21e6bb4c3b7_yprov4wfs_openeo_complex.json"
}
```

* **Pattern Extract**
  Endpoint responsible for receiving the uploaded source file and forwarding it to the backend function that performs motif extraction. The operation also validates the **k** parameter provided in the request, which determines the size (number of nodes) of the patterns to search for. Optionally, the **min_occurrences** parameter can be included to filter motifs by a minimum occurrence threshold.

```html
POST /api/graphs/{stored_filename}/pattern
```

*Preview:* the response includes all motif instances found, their corresponding `k` values, and the images generated for each motif.

*Response:* lists all pattern instances extracted from the source file for a given value of `k`.

```json
# Example
[
    {
        "motif_id": "#1",
        "image": "/patterns/images.png",
        "k": 3,
        "occurrences": 31,
        "instances": [{}, {}, ...]
    },
    {
        "motif_id": "#2",
        "image": "/patterns/images.png",
        "k": 3,
        "occurrences": 52,
        "instances": [{}, {}, ...]
    }
    ...
]
```

*If the `k` and `min_occurrences` parameters are not specified, the endpoint returns **all computed patterns**.*

* **Pattern List**
  Complementary to *Pattern Extract*, accessible via a *GET* request. It provides a *catalog of patterns* extracted from the source graph. By using the **k** and **min_occurrences** query parameters, it is possible to display patterns of a specific size and with a minimum frequency in the graph.

```html
GET /api/graphs/{stored_filename}/pattern?k=<value>&min_occurrences=<value>
```

* **Get Pattern**
  Endpoint used to inspect a single motif, referring to a specific pattern defined by `k` and `min_occurrences`.

```html
GET /api/graphs/{stored_filename}/pattern?k=<value>&min_occurrences=<value>/{motif_ID}
```

*Preview & Response:* highlights a single motif with its details: `id`, images, `min_occurrences`, and all its instances.

```json
# Example
{
    "motif_id": "#3",
    "image": "/patterns/images.png",
    "k": 3,
    "occurrences": 52,
    "instances": [{}, {}, ...]
}
```

## Developers

*Ismaele Landini*

## Uploaded Files

