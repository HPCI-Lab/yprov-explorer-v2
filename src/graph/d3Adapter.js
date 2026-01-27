/*
d3Adapter.js: Converts the provenance model objects:nodes, links into d3 force required nodes, links
*/

export function d3Adapter(graph) {
    return {
        nodes: graph.nodes.map(n => ({
            id: n.id,
            type: n.type,
            label: n.label,
            ...n
        })),
        links: graph.edges.map(e => ({
            source: e.source,
            target: e.target,
            type: e.type
        }))
    };
}



