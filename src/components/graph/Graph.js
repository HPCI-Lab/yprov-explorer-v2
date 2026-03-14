/*
Graph.js: The Graph.js file leverages the D3.js library to create an interactive graph based on
JSON data. This graph displays nodes, representing entities and activities, and connections
between them, with three types of relationships. Users can interact with nodes by clicking
on them or dragging them, and they can zoom in on the entire graph. In addition, nodes can be
highlighted and focused in response to external events (link label clicks).
*/

import * as d3 from "d3";
import { useEffect, useRef } from "react";
import {scale} from "framer-motion";

export default function Graph({ graph, controller }) {
    const ref = useRef(null);
    let selectedNode = null;

    //Web worker for off thread simulation
    const worker = new Worker(new URL("./graphWorker.js", import.meta.url), {
        type: "module"
    });

    function roundedRectPath(width, height, radius) {
        // Define the corner points of the rectangle with rounded corners
        const x0 = -width / 2;
        const x1 = width / 2;
        const y0 = -height / 2;
        const y1 = height / 2;

        // Return the path for the rounded rectangle
        return `
      M ${x0 + radius},${y0}
      H ${x1 - radius}
      A ${radius},${radius} 0 0 1 ${x1},${y0 + radius}
      V ${y1 - radius}
      A ${radius},${radius} 0 0 1 ${x1 - radius},${y1}
      H ${x0 + radius}
      A ${radius},${radius} 0 0 1 ${x0},${y1 - radius}
      V ${y0 + radius}
      A ${radius},${radius} 0 0 1 ${x0 + radius},${y0}
      Z
    `;
    }
    // Function to create a self-loop path for the nodes that are connected to themselves
    function createSelfLoopPath(d) {
        const nodeRadius = 30;
        const loopRadiusX = 90;
        const loopRadiusY = 40;

        const start = {
            x: d.source.x,
            y: d.source.y - nodeRadius,
        };
        return `M ${start.x},${start.y}
            A ${loopRadiusX},${loopRadiusY} 0 1,1 ${start.x},${start.y + 1}`;
    }
    // Function to create a rectangle path for the nodes (activities)
    function rectPath(width, height) {
        const x0 = -width / 2;
        const x1 = width / 2;
        const y0 = -height / 2;
        const y1 = height / 2;

        // Return the path for the rectangle
        return `
      M ${x0},${y0}
      L ${x1},${y0}
      L ${x1},${y1}
      L ${x0},${y1}
      Z
    `;
    }
    // Function to create a house path for the nodes (agents)
    function housePath(size) {
        const half = size / 2;

        return `
      M ${-half},0
      L ${-half},${half}
      L ${half},${half}
      L ${half},0
      L 0,${-half}
      Z
    `;
    }
    //Graph initialization draw and updates the graph
    useEffect(() => {
        if (!graph) return;
        const width = window.innerWidth;
        const height = window.innerHeight;

        d3.select(ref.current).selectAll("*").remove();
        const svg = d3.select(ref.current)
            .attr("width", width)
            .attr("height", height);

        // Create a group element for the graph elements
        const g = svg.append("g");
        //marker based on links
        const markerTypes = [
            "used",
            "wasGeneratedBy",
            "wasDerivedFrom",
            "wasInformedBy",
            "hadMember",
            "wasStartedBy",
            "wasAssociatedWith",
            "wasAttributedTo",
            "plan",
        ];

        const markerColors = {
            used: "#FDED00",
            wasGeneratedBy: "red",
            wasDerivedFrom: "#00E572",
            wasInformedBy: "#FFAA00",
            hadMember: "#00AAFF",
            wasStartedBy: "#AA00FF",
            wasAssociatedWith: "#FF00FF",
            wasAttributedTo: "#FF4500",
            plan: "#1F1511",
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
        /* Codice mai eseguito, stiamo dichiarando un listener sotto e questo viene scartato
        let tickCount = 0;
        const MAX_COLLIDE_TICKS = 100;
        //Begins the simulation
        simulation.on("tick", () => {
            tickCount++;
            // Reducing collision during the time
            if (tickCount === MAX_COLLIDE_TICKS) {
                simulation.force("collide", null);
            }
        });
        */

        //Draw links
        const link = g.append("g")
            .selectAll("line")
            .data(graph.links)
            .join("line")
            .attr("stroke", d => markerColors[d.type] || "#999")
            .attr("stroke-width", 2)
            .attr("marker-end", d => markerTypes.includes(d.type) ? `url(#arrow-${d.type})` : null);

        //Nodes drawing and properties
        const node_color = {
            entity:   "#00E572",
            activity: "#9898fd",
            agent:    "#FF5733",
            default:  "#cccccc"
        };
        const node = g.append("g")
            .selectAll("path")
            .data(graph.nodes)
            .join("path")
            .attr("stroke", "#000")
            .attr("stroke-width", 1.5)
            .attr("fill", d => node_color[d.type] || node_color.default)
            .attr("d", d => {
                if (d.type === "entity"){
                    return roundedRectPath(40, 30, 8);
                }else if (d.type === "activity"){
                    return rectPath(40, 30);
                }else{
                    return housePath(30);
                }
            })
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
        const nodeLabel = g.append("g")
            .selectAll("text")
            .data(graph.nodes)
            .join("text")
            .attr("font-size", 12)
            .attr("text-anchor", "middle")
            .attr("dy", 4)
            .text(d =>
                d.label.length > 18
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
            node.attr("transform", d => `translate(${d.x},${d.y})`);
            nodeLabel
                .attr("x", d => d.x)
                .attr("y", d => d.y);
            linkLabel
                .attr("x", d => (d.source.x + d.target.x) / 2)
                .attr("y", d => (d.source.y + d.target.y) / 2);
            updateVisibility();
        });

        const VISIBILITY_UPDATE_INTERVAL_MS = 100;
        let lastVisibilityUpdate = 0;

        //Function visibility culling for better performaces
        function updateVisibility(force = false) {
            if (!force && Date.now() < lastVisibilityUpdate + VISIBILITY_UPDATE_INTERVAL_MS) return;
            lastVisibilityUpdate = Date.now(); //permette di ridurre le chiamate alla funzione

            const svgNode = svg.node();
            if (!svgNode){
                return;
            }else {
                const bounds = getLimits(svgNode);
                const {scale} = bounds;
                graph.nodes.forEach(n => { 
                    n._visible = inView(n.x, n.y, bounds);
                });

                //nodes
                node.style("display", d => d._visible ? "inline" : "none");
                //label management
                nodeLabel.style("display", d =>
                    scale > 0.7 && d._visible ? "inline" : "none"
                );
                //links
                link.style("display", d => {
                    return d.source._visible || d.target._visible ? "inline" : "none";
                });
                //link label
                linkLabel.style("display", d => {
                    if (scale <= 1.2) return "none";
                    return d.source._visible || d.target._visible ? "inline" : "none";
                });
            }
        };

        //Zoom rendering of labels, for performance managing
        zoom.on("zoom", event => {
            g.attr("transform", event.transform);
            updateVisibility();
        }).on("end", _ => {
            updateVisibility(true); //zoom forzato, è importante, stiamo espandendo o riducendo la viewport
        });

        //simulation managing for performance
        simulation.on("end", () => {
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
                link.style("opacity", d =>
                    applyOpacity(d.source) * applyOpacity(d.target)
                );
            },
            //highlighing the nodes based on the ids
            highlightNodes: (ids = []) => {
                const idSet = new Set(ids);
                //highlighting the nodes
                node
                    .attr("opacity", d => {
                        if (idSet.size === 0){
                            return 1;
                        } else{
                            return idSet.has(d.id) ? 1 : 0.15;
                        }
                    })
                    .attr("stroke", d => {
                        if (idSet.has(d.id)){
                            return "#ffffff";
                        }else{
                            return "#000";
                        }
                    })
                    .attr("stroke-width", d => {
                        if (idSet.has(d.id)){
                            return 3;
                        }else{
                            return 1.5;
                        }
                    });
                //highlighting the node labels
                nodeLabel
                    .attr("opacity", d => {
                        if (idSet.size === 0){
                            return 1;
                        }else{
                            return idSet.has(d.id) ? 1 : 0.1;
                        }
                    });
                //highlighting the links
                link
                    .attr("opacity", d => {
                        if (idSet.size === 0){
                            return 1;
                        }else{
                            return idSet.has(d.source.id) || idSet.has(d.target.id) ? 1 : 0.05;
                        }
                    })
                    .attr("stroke-width", d => {
                        if (idSet.has(d.source.id) || idSet.has(d.target.id)){
                            return 3;
                        }else{
                            return 2;
                        }
                    });
            },
        });

        const linksData = graph.links;
        node.on("click", (event, d) => {
            //node reset
            node.attr("stroke", "#000").attr("stroke-width", 1.5);

            //Highlighting the selected node
            d3.select(event.currentTarget)
                .attr("stroke", "grey")
                .attr("stroke-width", 5);

            //zoom management
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

            //mapping the relations
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

        //Function for redrawing at every simulation update
        function redraw(mode = "all") {
            switch (mode) {
                case "links":
                    updateLinkPositions(link, linkLabel);
                    break;
                case "nodes":
                    updateNodePositions(node, nodeLabel);
                    break;
                default:
                    updateLinkPositions(link, linkLabel);
                    updateNodePositions(node, nodeLabel);
            }
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
                for (const updatedNode of msg.nodes) {
                    const node = graph.nodes.find(n => n.id === updatedNode.id);
                    if (!node){
                        continue;
                    }else{
                        node.x = updatedNode.x;
                        node.y = updatedNode.y;
                    }
                }
            }else{
                return;
            }
        };

        //Resize handler for managing the browser page resizing and the graph
        function handleResize() {
            const newWidth = window.innerWidth;
            const newHeight = window.innerHeight;

            svg.attr("width", newWidth).attr("height", newHeight);
            svg.call(zoom.transform, d3.zoomIdentity);
            simulation.force("center", d3.forceCenter(newWidth / 2, newHeight / 2));
            //redraw and updating
            redraw();
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

//function for managing the viewport
function inView(x, y, bounds, offset = 100) {
    const leftLimit = bounds.minX - offset;
    const rightLimit = bounds.maxX + offset;
    const topLimit = bounds.minY - offset;
    const bottomLimit = bounds.maxY + offset;
    if (x < leftLimit || x > rightLimit) {
        return false;
    }
    if (y < topLimit || y > bottomLimit) {
        return false;
    }
    return true;
}

//function for getting the limits and updating the visibility
function getLimits(svgElement) {
    const transform = d3.zoomTransform(svgElement);
    //dimensions of the browser
    const viewport = svgElement.getBoundingClientRect();
    const w = viewport.width;
    const h = viewport.height;
    const k = transform.k;
    //limits based on the zoom
    const minX = -transform.x / k;
    const minY = -transform.y / k;
    const maxX = (w - transform.x) / k;
    const maxY = (h - transform.y) / k;
    //building the limits
    const limits = {
        minX: minX,
        minY: minY,
        maxX: maxX,
        maxY: maxY,
        scale: k
    };
    return limits;
}

//update function for redraw function
function updateLinkPositions(link, linkLabel) {
    link
        .attr("x1", d => d.source.x)
        .attr("y1", d => d.source.y)
        .attr("x2", d => d.target.x)
        .attr("y2", d => d.target.y);
    linkLabel
        .attr("x", d => {
            const midX = (d.source.x + d.target.x) / 2;
            return midX;
        })
        .attr("y", d => {
            const midY = (d.source.y + d.target.y) / 2;
            return midY;
        });
}

//update node function used in redraw function
function updateNodePositions(node, nodeLabel) {
    node.attr("transform", d => {
        if (d.x && d.y) {
            return `translate(${d.x},${d.y})`;
        }
        return "";
    });
    nodeLabel
        .attr("x", d => d.x)
        .attr("y", d => d.y);
}





