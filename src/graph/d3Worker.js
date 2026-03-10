/*d3Worker.js: web worker used to compute the d3-force position on a different thread and
sending back to draw the graph.
!NEEDS IMPROVEMENTS
*/

import * as d3 from "d3-force";

//Message from the main thread with nodes and links
onmessage = (event) => {
    const { nodes, links } = event.data;
    const simulation = d3.forceSimulation(nodes)
        .force("link", d3.forceLink(links)
            .id(d => d.id)
            .distance(180)
            .strength(2)
        )
        .force("charge", d3.forceManyBody().strength(-300))
        .force("collide", d3.forceCollide(30))
        .force("center", d3.forceCenter(0, 0))
        .alphaDecay(0.08)
        .on("tick", () => {
            postMessage({
                type: "tick",
                nodes: nodes.map(n => ({ id: n.id, x: n.x, y: n.y }))
            });
        })
        .on("end", () => {
            postMessage({ type: "end" });
        });
};
