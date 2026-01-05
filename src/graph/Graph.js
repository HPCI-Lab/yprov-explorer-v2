/*
Graph.js: Generates the graph from the d3 Adapter and manage the functions and events from the GraphController
*/

import * as d3 from "d3";
import { useEffect, useRef } from "react";
import {scale} from "framer-motion";

export default function Graph({ graph, controller }) {
    const ref = useRef(null);
    let selectedNodeId = null;

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
            .data(graph.links.map(l => ({
                ...l,
                source: typeof l.source === "string" ? graph.nodes.find(n => n.id === l.source) : l.source,
                target: typeof l.target === "string" ? graph.nodes.find(n => n.id === l.target) : l.target
            })))

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
            .attr("fill", d => d.type === "entity" ? "#fdfd66" : d.type === "activity" ? "#9898fd" : "#FF5733" )
            
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

        //Building adjacency list for highlight function
        const adjacency = new Map();

        graph.nodes.forEach(n => adjacency.set(n.id, []));

        // populate the adjacency list
        graph.links.forEach(l => {
            adjacency.get(l.source.id)?.push(l.target.id);
            adjacency.get(l.target.id)?.push(l.source.id);
        });

        function getNodesWithinDepth(startId, maxDepth) {
        const visited = new Set([startId]);
        let frontier = [startId];

        for (let depth = 0; depth < maxDepth; depth++) {
            const next = [];
            frontier.forEach(id => {
                (adjacency.get(id) || []).forEach(n => {
                    if (!visited.has(n)) {
                        visited.add(n);
                        next.push(n);
                    }
                });
            });
            frontier = next;
            if (frontier.length === 0) break;
        }

        return visited;
    }
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

        function colorByDuration(nodes) {
            // calcolate min and max durations
            const durations = nodes
            .map(n => {
                const start = n.attributes?.["prov:startTime"];
                const end = n.attributes?.["prov:endTime"];
                if (start && end) {
                    return new Date(end) - new Date(start);
                }
                return null;
            })
            .filter(d => d !== null);

            const minDur = Math.min(...durations);
            const maxDur = Math.max(...durations);

            // color scale
            const colorScale = d3.scaleLinear()
                .domain([minDur, maxDur])
                .range(["#3de43dff", "#e72d2dff"]); 

            // apply colors
            nodes.forEach((n, i) => {
                const start = n.attributes?.["prov:startTime"];
                const end = n.attributes?.["prov:endTime"];
                if (start && end) {
                    const duration = new Date(end) - new Date(start);
                    n.color = colorScale(duration);
                } else {
                    n.color = "#0000ff"; 
                }
            });
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

            applyDirectionFilter: (nodeId, mode) => {
                applyDirectionFilter(nodeId, mode);
            },

            colorNodesByDuration: () => {
                colorByDuration(graph.nodes);
                node.attr("fill", d => d.color);
            },
            //Custom opacity by relation type
            setRelationTypeOpacity: (visibleRelations, opacityHidden = 0.07) => {
                const relSet = new Set(visibleRelations);

                // link
                link.style("opacity", d =>
                    relSet.has(d.type) ? 1 : opacityHidden
                );

                // label link
                linkLabel.style("opacity", d =>
                    relSet.has(d.type) ? 1 : opacityHidden
                );

                // node - check if connected to any visible link
                node.style("opacity", d => {
                    const connected = graph.links.some(l =>
                        relSet.has(l.type) &&
                        (l.source.id === d.id || l.target.id === d.id)
                    );
                    return connected ? 1 : opacityHidden;
                });

                nodeLabel.style("opacity", d => {
                    const connected = graph.links.some(l =>
                        relSet.has(l.type) &&
                        (l.source.id === d.id || l.target.id === d.id)
                    );
                    return connected ? 1 : opacityHidden;
                });
            },

            //Custom opacity by type 
            setNodeTypeOpacity: (visibleTypes, opacityHidden = 0.07) => {
                // lowercase for safety
                const visTypes = visibleTypes.map(t => t.toLowerCase());
                
                node.style("opacity", d => {
                    const type = (d.type || d.attributes?.type || "").toLowerCase();
                    return visTypes.includes(type) ? 1 : opacityHidden;
                });
                nodeLabel.style("opacity", d => {
                    const type = (d.type || d.attributes?.type || "").toLowerCase();
                    return visTypes.includes(type) ? 1 : opacityHidden;
                });
                link.style("opacity", d => {
                    const sourceType = (d.source.type || d.source.attributes?.type || "").toLowerCase();
                    const targetType = (d.target.type || d.target.attributes?.type || "").toLowerCase();
                    return visTypes.includes(sourceType) && visTypes.includes(targetType) ? 1 : opacityHidden;
                });
                linkLabel.style("opacity", d => {
                    const sourceType = (d.source.type || d.source.attributes?.type || "").toLowerCase();
                    const targetType = (d.target.type || d.target.attributes?.type || "").toLowerCase();
                    return visTypes.includes(sourceType) && visTypes.includes(targetType) ? 1 : opacityHidden;
                });
        },

        highlightNodesAndLinks: (selectedId = null) => {
            // color used for different states
            const colors = {
                input: "#00ff00ff",      
                output: "#FF0000",        
                selected: "#0000FF",     
                connected: "#AAAAAA",    
            };

            if (!graph || !graph.nodes || !graph.links) return;

            // resetting all to low opacity gray
            node.style("opacity", 0.09).attr("fill", colors.connected);
            link.style("opacity", 0.09).attr("stroke", colors.connected).attr("stroke-width", 2);

            if (!selectedId) return;

            // selected node
            node.filter(d => d.id === selectedId)
                .style("opacity", 1)
                .attr("fill", colors.selected);

            // connected nodes mapping
            const connectedNodesMap = {};
            graph.links.forEach(l => {
                if (l.source.id === selectedId) connectedNodesMap[l.target.id] = l;
                if (l.target.id === selectedId) connectedNodesMap[l.source.id] = l;
            });

            // highlight connected nodes
            node.filter(d => d.id in connectedNodesMap)
                .style("opacity", 1)
                .attr("fill", d => {
                    const link = connectedNodesMap[d.id];
                    // input link
                    if (link.target.id === selectedId && link.type === "used") return colors.input;
                    //output link
                    if (link.source.id === selectedId && link.type === "wasGeneratedBy") return colors.output;
                    return colors.connected;
                });

            // highlight connected links
            link.filter(l => l.source.id === selectedId || l.target.id === selectedId)
                .style("opacity", 1)
                .attr("stroke", l => {
                    if (l.type === "used" && l.target.id === selectedId) return colors.input;
                    if (l.type === "wasGeneratedBy" && l.source.id === selectedId) return colors.output;
                    return colors.connected;
                })
                .attr("stroke-width", 3);

            // all the other nodes fade
            node.filter(d => !(d.id === selectedId || d.id in connectedNodesMap))
                .style("opacity", 0.3)
                .attr("fill", colors.connected);

            // all the other links fade
            link.filter(l => !(l.source.id === selectedId || l.target.id === selectedId))
                .style("opacity", 0.3)
                .attr("stroke", colors.connected)
                .attr("stroke-width", 2);
        }, 

        resetFilters: () => {
            const nodeBaseColor = d =>
                d.type === "entity" ? "#fdfd66"
                : d.type === "activity" ? "#9898fd"
                : "#FF5733";

            const linkBaseColor = d =>
                d.type === "used" ? "#FDED00"
                : d.type === "wasGeneratedBy" ? "red"
                : d.type === "wasDerivedFrom" ? "#00E572"
                : "#999";
      
        // nodi
        node
            .style("opacity", 1)
            .attr("fill", d => nodeBaseColor(d))
            .attr("stroke", "#000")
            .attr("stroke-width", 1.5);

        // label nodi
        nodeLabel
            .style("opacity", 1)
            .style("display", "block");

        // link
        link
            .style("opacity", 1)
            .attr("stroke", d => linkBaseColor(d))
            .attr("stroke-width", 2);

        // label link
        linkLabel
            .style("opacity", 1)
            .style("display", "block");
    },

    applyDepthFilter: (nodeId, depth, hiddenOpacity = 0.07) => {
        if (!nodeId || depth == null) return;

        const visible = getNodesWithinDepth(nodeId, depth);

        node.style("opacity", d =>
            visible.has(d.id) ? 1 : hiddenOpacity
        );

        nodeLabel.style("opacity", d =>
            visible.has(d.id) ? 1 : hiddenOpacity
        );

        link.style("opacity", l =>
            visible.has(l.source.id) && visible.has(l.target.id)
                ? 1
                : hiddenOpacity
        );

        linkLabel.style("opacity", l =>
            visible.has(l.source.id) && visible.has(l.target.id)
                ? 1
                : hiddenOpacity
        );
    },

 });
        const linksData = graph.links;

        node.on("click", (event, d) => {
            selectedNodeId = d.id;
            controller.selectedNodeId = d.id;

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
                group: d.type === "entity" ? "Entity" :
                d.type === "activity" ? "Activity" :
                d.type === "agent" ? "Agent" : "Unknown",
                type: d.attributes?.["prov:type"] || "Unknown",
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

        //Function for direction based filtering
        function applyDirectionFilter(nodeId, mode, hiddenOpacity = 0.07) {
            if (!nodeId || !mode || mode === "both") {
                node.style("opacity", 1);
                nodeLabel.style("opacity", 1);
                link.style("opacity", 1);
                linkLabel.style("opacity", 1);
                return;
            }

            const relatedNodes = new Set([nodeId]);

            graph.links.forEach(l => {
                if (mode === "out" && l.source.id === nodeId) {
                    relatedNodes.add(l.target.id);
                }
                if (mode === "in" && l.target.id === nodeId) {
                    relatedNodes.add(l.source.id);
                }
            });

            node.style("opacity", d =>
                relatedNodes.has(d.id) ? 1 : hiddenOpacity
            );

            nodeLabel.style("opacity", d =>
                relatedNodes.has(d.id) ? 1 : hiddenOpacity
            );

            link.style("opacity", l => {
                if (mode === "out") return l.source.id === nodeId ? 1 : hiddenOpacity;
                if (mode === "in") return l.target.id === nodeId ? 1 : hiddenOpacity;
                return 1;
            });

            linkLabel.style("opacity", l => {
                if (mode === "out") return l.source.id === nodeId ? 1 : hiddenOpacity;
                if (mode === "in") return l.target.id === nodeId ? 1 : hiddenOpacity;
                return 1;
            });
        }

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

