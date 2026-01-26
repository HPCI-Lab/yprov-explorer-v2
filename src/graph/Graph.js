/*
Graph.js: Generates the graph from the d3 Adapter and manage the functions and events from the GraphController
*/

import * as d3 from "d3";
import { useEffect, useRef } from "react";
import {scale} from "framer-motion";

export default function Graph({ graph, controller }) {
    const ref = useRef(null);
    let selectedNode = null;

    //Web worker for off thread simulation
    const worker = new Worker(new URL("./d3Worker.js", import.meta.url), {
        type: "module"
    });

    //Graph initialization
    useEffect(() => {
        if (!graph) return;
        const width = window.innerWidth;
        const height = window.innerHeight;

        d3.select(ref.current).selectAll("*").remove();
        const svg = d3.select(ref.current)
            .attr("width", width)
            .attr("height", height);

        const g = svg.append("g");
        const markerTypes = [
            "used",
            "wasGeneratedBy",
            "wasDerivedFrom",
        ];

        const markerColors = {
            used: "#FDED00",
            wasGeneratedBy: "red",
            wasDerivedFrom: "#00E572",
        };

        const defs = svg.append("defs");

        markerTypes.forEach(type => {
            defs.append("marker")
                .attr("id", `arrow-${type}`)
                .attr("viewBox", "0 -5 10 10")
                .attr("refX", 15)
                .attr("refY", 0)
                .attr("markerWidth", 7)
                .attr("markerHeight", 7)
                .attr("orient", "auto-start-reverse")
                .append("path")
                .attr("d", "M0,-5L10,0L0,5")
                .attr("fill", markerColors[type]);
        });

        //Zoom management
        const zoom = d3.zoom()
            .scaleExtent([0.1, 10])
            .on("zoom", event => g.attr("transform", event.transform));
        svg.call(zoom);

        //Random positions
        graph.nodes.forEach(n => {
            n.x = Math.random() * width;
            n.y = Math.random() * height;
        });

        //D3 FORCE Configuration
        const simulation = d3.forceSimulation(graph.nodes)
            .force("link",
                d3.forceLink(graph.links)
                    .id(d => d.id)
                    .distance(180)
                    .strength(2)
            )
            .force("charge", d3.forceManyBody().strength(-300))
            .force("collide", d3.forceCollide().radius(25))
            .force("center", d3.forceCenter(width / 2, height / 2))
            .alphaDecay(0.005);

        //Adaptive collision: start strong, fade out
        const initialCollideForce = simulation.force("collide");

        let tickCount = 0;
        const MAX_COLLIDE_TICKS = 100; // dopo ~1-2s smettiamo

        //Begins the simulation
        simulation.on("tick", () => {
            tickCount++;

            // Reducing collision during the time
            if (tickCount === MAX_COLLIDE_TICKS) {
                simulation.force("collide", null);
            }
        });

        //Draw links
        const link = g.append("g")
            .selectAll("line")
            .data(graph.links)
            .join("line")
            .attr("stroke", d =>
                d.type === "used" ? "#FDED00"
                    : d.type === "wasGeneratedBy" ? "red"
                        : d.type === "wasDerivedFrom" ? "#00E572"
                            : "#999"
            )
            .attr("stroke-width", 2)
            .attr("marker-end", d =>
                markerTypes.includes(d.type)
                    ? `url(#arrow-${d.type})`
                    : null
            );

        //Nodes drawing and properties
        const node = g.append("g")
            .selectAll("circle")
            .data(graph.nodes)
            .join("circle")
            .attr("r", 15)
            .attr("stroke", "#000")
            .attr("stroke-width", 1.5)
            .attr("fill", d =>
                d.type === "entity" ? "#fdfd66"
                    : d.type === "activity" ? "#9898fd"
                        : "#FF5733"
            )
            .call(d3.drag()
                .on("start", event => {
                    if (!event.active) simulation.alphaTarget(0.3).restart();
                    event.subject.fx = event.x;
                    event.subject.fy = event.y;
                })
                .on("drag", event => {
                    event.subject.fx = event.x;
                    event.subject.fy = event.y;
                })
                .on("end", event => {
                    if (!event.active) simulation.alphaTarget(0);
                    event.subject.fx = null;
                    event.subject.fy = null;
                })

            );

        //Node labels
        const MAX_NODE_LABEL = 18;
        const nodeLabel = g.append("g")
            .selectAll("text")
            .data(graph.nodes)
            .join("text")
            .attr("font-size", 12)
            .attr("text-anchor", "middle")
            .attr("dy", 4) // centrato verticalmente
            .text(d =>
                d.label.length > MAX_NODE_LABEL
                    ? d.label.slice(0, 10) + "..." + d.label.slice(-3)
                    : d.label
            )
            .attr("pointer-events", "none")
            .attr("fill", "#000")
            .style("user-select", "none");

        //Link labels
        const linkLabel = g.append("g")
            .selectAll("text")
            .data(graph.links)
            .join("text")
            .attr("font-size", 10)
            .attr("text-anchor", "middle")
            .attr("dy", -5)
            .text(d => d.type)
            .attr("pointer-events", "none")
            .attr("fill", "#000")
            .style("user-select", "none");

        //Tick update, managing the visibility for performaces
        simulation.on("tick", () => {
            link
                .attr("x1", d => d.source.x)
                .attr("y1", d => d.source.y)
                .attr("x2", d => d.target.x)
                .attr("y2", d => d.target.y);
            node
                .attr("cx", d => d.x)
                .attr("cy", d => d.y);
            nodeLabel
                .attr("x", d => d.x)
                .attr("y", d => d.y);
            linkLabel
                .attr("x", d => (d.source.x + d.target.x) / 2)
                .attr("y", d => (d.source.y + d.target.y) / 2);
            updateVisibility();
        });

        //Function visibility culling
        function updateVisibility() {
            const transform = d3.zoomTransform(svg.node());
            const scale = transform.k;

            const bbox = svg.node().getBoundingClientRect();
            const newWidth = bbox.width;
            const newHeight = bbox.height;

            //Limits of drawing
            const minX = -transform.x / scale - 100;
            const minY = -transform.y / scale - 100;
            const maxX = (newWidth - transform.x) / scale + 100;
            const maxY = (newHeight - transform.y) / scale + 100;

            node.style("display", d =>
                d.x >= minX && d.x <= maxX && d.y >= minY && d.y <= maxY
                    ? "block" : "none");

            nodeLabel.style("display", d =>
                scale > 0.7 && d.x >= minX && d.x <= maxX && d.y >= minY && d.y <= maxY
                    ? "block" : "none");

            link.style("display", d =>
                d.source.x >= minX && d.source.x <= maxX &&
                d.source.y >= minY && d.source.y <= maxY &&
                d.target.x >= minX && d.target.x <= maxX &&
                d.target.y >= minY && d.target.y <= maxY
                    ? "block" : "none");

            linkLabel.style("display", d =>
                scale > 1.2 &&
                d.source.x >= minX && d.source.x <= maxX &&
                d.source.y >= minY && d.source.y <= maxY &&
                d.target.x >= minX && d.target.x <= maxX &&
                d.target.y >= minY && d.target.y <= maxY
                    ? "block" : "none");
        }

        //Zoom rendering of labels, for performance managing
        zoom.on("zoom", event => {
            g.attr("transform", event.transform);
            updateVisibility();
            const scale = event.transform.k;
            nodeLabel.style("display", scale > 0.7 ? "block" : "none");
            linkLabel.style("display", scale > 1.2 ? "block" : "none");
        });

        //simulation managing for performance
        simulation.on("end", () => {
            graph.nodes.forEach(n => {
                n.fx = n.x;
                n.fy = n.y;
            });
            simulation.force("collide", null);
            simulation.stop();
        });

        //Register API to Controller, creates a public API for the graph
        controller.registerGraphAPI({
            selectNode: (id) => {
                node.attr("stroke", "#000").attr("stroke-width", 1.5);
                node.filter(d => d.id === id)
                    .attr("stroke", "#fff")
                    .attr("stroke-width", 3);
            },
            focusNode: (id) => {
                const n = graph.nodes.find(x => x.id === id);
                if (!n) return;

                const t = d3.zoomTransform(svg.node());
                const zoomFactor = 1.3;
                const targetZoom = Math.min(t.k * zoomFactor, 6);

                svg.transition().duration(600)
                    .call(
                        zoom.transform,
                        d3.zoomIdentity.
                        translate(width / 2 - n.x * targetZoom, height / 2 - n.y * targetZoom)
                            .scale(targetZoom)
                    );
            },
            resetView: () => {
                svg.transition().duration(600)
                    .call(zoom.transform, d3.zoomIdentity);
            },
            //Dask based filtering
            applyFilter: ({ cells = [], workers = [], chunks = [] }) => {
                const applyOpacity = d => {
                    const attr = d.attributes || {};
                    const cell = attr["yprov4wfs:jupyter_cell_index"];
                    const worker = attr["yprov4wfs:processed_on"];

                    const cellMatch = cells.length === 0 || (cell && cells.includes(cell));
                    const workerMatch = workers.length === 0 || (worker && workers.includes(worker));

                    if(cellMatch && workerMatch ) {
                        return 1;
                    }else{
                        return 0.15;
                    }
                }
                node.style("opacity", applyOpacity);
                nodeLabel.style("opacity", applyOpacity);
            },
            
            //Highlights pattern selected 
            highlightNodes: (nodeIds) => {
                const highlighted = new Set(nodeIds);

                node
                    .transition()
                    .duration(300)
                    .attr("fill", d =>
                        highlighted.has(d.id) ? "#1AA7A7"
                            : d.type === "entity" ? "#fdfd66"
                                : d.type === "activity" ? "#9898fd"
                                    : "#FF5733"
                    )
                    .attr("opacity", d =>
                        highlighted.size === 0 ? 1
                            : highlighted.has(d.id) ? 1
                                : 0.3
                    );

                nodeLabel
                    .transition()
                    .duration(300)
                    .style("opacity", d =>
                        highlighted.size === 0 ? 1
                            : highlighted.has(d.id) ? 1
                                : 0.15
                    );

                link
                    .transition()
                    .duration(300)
                    .attr("stroke", l =>
                        highlighted.has(l.source.id) && highlighted.has(l.target.id) ? "#168484"
                            : l.type === "used" ? "#FDED00"
                                : l.type === "wasGeneratedBy" ? "red"
                                    : l.type === "wasDerivedFrom" ? "#00E572"
                                        : "#999"
                    )
                    .attr("opacity", l =>
                        highlighted.size === 0 ? 1
                            : highlighted.has(l.source.id) && highlighted.has(l.target.id)
                                ? 1
                                : 0.15
                    );
            },

            // Zoom su un insieme di nodi
            zoomOnNodes: (nodeIds) => {
                if (!nodeIds || nodeIds.length === 0) return;

                const selectedN = graph.nodes.filter(n => nodeIds.includes(n.id));
                const minX = Math.min(...selectedN.map(n => n.x));
                const maxX = Math.max(...selectedN.map(n => n.x));
                const minY = Math.min(...selectedN.map(n => n.y));
                const maxY = Math.max(...selectedN.map(n => n.y));

                const svgWidth = window.innerWidth;
                const svgHeight = window.innerHeight;

                const scaleX = svgWidth / (maxX - minX + 100);
                const scaleY = svgHeight / (maxY - minY + 100);
                let targetScale = Math.min(scaleX, scaleY, 6);

                const zoomFactor = 0.55;
                targetScale *= zoomFactor;

                const centerX = (minX + maxX) / 2;
                const centerY = (minY + maxY) / 2;

                svg.transition().duration(600)
                    .call(
                        zoom.transform,
                        d3.zoomIdentity
                            .translate(svgWidth / 2 - centerX * targetScale, svgHeight / 2 - centerY * targetScale)
                            .scale(targetScale)
                    );
            },
            
            // Reset view
             resetHighlight: () => {
                node
                    .transition()
                    .duration(300)
                    .attr("opacity", 1)
                    .attr("fill", d =>
                        d.type === "entity" ? "#fdfd66"
                            : d.type === "activity" ? "#9898fd"
                                : "#FF5733"
                    );

                nodeLabel
                    .transition()
                    .duration(300)
                    .style("opacity", 1)
                    .style("fill", "#000");

                link
                    .transition()
                    .duration(300)
                    .attr("opacity", 1)
                    .attr("stroke", l =>
                        l.type === "used" ? "#FDED00"
                            : l.type === "wasGeneratedBy" ? "red"
                                : l.type === "wasDerivedFrom" ? "#00E572"
                                    : "#999"
                    );

                // reset zoom
                svg.transition()
                    .duration(400)
                    .call(zoom.transform, d3.zoomIdentity);
            }
        });

        const linksData = graph.links;

        node.on("click", (event, d) => {
            node.attr("stroke", "#000").attr("stroke-width", 1.5);

            //Highlighting the selected node
            d3.select(event.currentTarget)
                .attr("stroke", "grey")
                .attr("stroke-width", 5);

            const currentTransform = d3.zoomTransform(svg.node());
            const currentZoom = currentTransform.k;
            let targetZoom;
            if (currentZoom < 0.5) {
                targetZoom = 1.5;
            } else if (currentZoom > 2) {
                targetZoom = currentZoom;
            } else {
                targetZoom = currentZoom * 1.2;
            }

            svg.transition().duration(600)
                .call(
                    zoom.transform,
                    d3.zoomIdentity.
                    translate(width / 2 - d.x * targetZoom, height / 2 - d.y * targetZoom)
                    .scale(targetZoom)
                );


            //Graph info mapped to send to the sideInfo
            const group =
                d.type === "entity" ? "Entity" :
                d.type === "activity" ? "Activity" :
                d.type === "agent" ? "Agent" : "Unknown";

            const typeInfo = d.attributes?.["prov:type"] || "Unknown";

            const relOut = (relType) =>
                linksData
                    .filter(l => l.type === relType && l.source.id === d.id)
                    .map(l => l.target.id)
                    .join(", ") || "None";

            const relIn = (relType) =>
                linksData
                    .filter(l => l.type === relType && l.target.id === d.id)
                    .map(l => l.source.id)
                    .join(", ") || "None";

            const wasGeneratedBy   = relOut("wasGeneratedBy");
            const used             = relOut("used");
            const wasDerivedFrom   = relOut("wasDerivedFrom");
            const wasInformedBy    = relOut("wasInformedBy");
            const wasAssociatedWith= relOut("wasAssociatedWith");
            const wasStartedBy     = relOut("wasStartedBy");
            const hadMember        = relOut("hadMember");
            const wasAttributedTo  = relOut("wasAttributedTo");
            const generated        = relIn("wasGeneratedBy");
            const wasUsedBy        = relIn("used");
            const derives          = relIn("wasDerivedFrom");

            controller.emitNodeClick({
                id: d.id,
                group,
                type: typeInfo,
                used,
                wasGeneratedBy,
                wasDerivedFrom,
                wasInformedBy,
                wasAssociatedWith,
                wasStartedBy,
                hadMember,
                wasAttributedTo,
                generated,
                wasUsedBy,
                derives,
                attributes: d.attributes
            });
        });

        //Function for redrawing
        function redraw() {
            link
                .attr("x1", d => d.source.x)
                .attr("y1", d => d.source.y)
                .attr("x2", d => d.target.x)
                .attr("y2", d => d.target.y);
            node
                .attr("cx", d => d.x)
                .attr("cy", d => d.y);
            nodeLabel
                .attr("x", d => d.x)
                .attr("y", d => d.y);
            linkLabel
                .attr("x", d => (d.source.x + d.target.x) / 2)
                .attr("y", d => (d.source.y + d.target.y) / 2);
            updateVisibility();
        }

        //Send graph to worker, Worker sends tick and stops. Used for better performances
        worker.postMessage({
            nodes: graph.nodes.map(n => ({ id: n.id })),
            links: graph.links.map(l => ({
                source: l.source,
                target: l.target
            }))
        });

        worker.onmessage = (event) => {
            const msg = event.data;

            if (msg.type === "tick") {
                msg.nodes.forEach(updated => {
                    const n = graph.nodes.find(n => n.id === updated.id);
                    if (!n) return;
                    n.x = updated.x;
                    n.y = updated.y;
                });
                redraw();   //graph make the redrawing
            }
        };

        //Resize handler for managing the browser page resizing and the graph
        function handleResize() {
            const newWidth = window.innerWidth;
            const newHeight = window.innerHeight;

            svg.attr("width", newWidth).attr("height", newHeight);
            svg.call(zoom.transform, d3.zoomIdentity);
            simulation.force("center", d3.forceCenter(newWidth / 2, newHeight / 2));

            redraw();
            updateVisibility();
        }

        window.addEventListener("resize", handleResize);

        return () => {
            window.removeEventListener("resize", handleResize);
        };




    }, [graph]);

    return (
        <svg ref={ref} style={{ width: "100%", height: "100%" }}></svg>
    );
}

