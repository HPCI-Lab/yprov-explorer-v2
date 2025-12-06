/* 
  ZoomableCirclePacking.js
  A React component that renders a zoomable circle packing visualization using D3.js.
  It accepts hierarchical data and allows users to zoom in and out of the circles.
*/

import React, { useRef, useEffect } from "react";
import * as d3 from "d3";
import { Box, IconButton } from "@chakra-ui/react";
import { CloseIcon } from "@chakra-ui/icons";

export default function ZoomableCirclePacking({
  /* Props */
  data = [],
  width = 300,
  height = 300,
  parentColor = "#4682b4",
  onClose = () => {},
  pointerEvents = "auto",
}) {
  const svgRef = useRef(null);

  /* D3.js code to create the zoomable circle packing */
  useEffect(() => {
    if (!data) return;
    const svgEl = svgRef.current;
    if (!svgEl) return;

    d3.select(svgEl).selectAll("*").remove();

    const root =
    /* Create a D3 hierarchy from the data */
      Array.isArray(data)
        ? d3.hierarchy({ name: "root", children: data }).sum(d => d.value || 1)
        : d3.hierarchy(data).sum(d => d.value || 1);

    const pack = d3.pack().size([width, height]).padding(4);
    pack(root);

   /* Set up the SVG element */
    const svg = d3
      .select(svgEl)
      .attr("viewBox", `0 0 ${width} ${height}`)
      .style("width", "100%")
      .style("height", "100%")
      .style("display", "block")
      .style("pointer-events", pointerEvents);

    const g = svg.append("g").attr("class", "packing-root");

    /* Color scale based on depth */
    const light = d3.color(parentColor).brighter(1.6).formatHex();
    const dark = d3.color(parentColor).darker(0.8).formatHex();
    const color = d3.scaleLinear().domain([0, root.height]).range([light, dark]);

    /* Create nodes */
    const node = g
      .selectAll("g")
      .data(root.descendants())
      .join("g")
      .attr("transform", d => `translate(${d.x},${d.y})`)
      .attr("class", d => (d.children ? "node internal" : "node leaf"));

    node
      .append("circle")
      .attr("r", 0)
      .attr("fill", d => (d.children ? color(d.depth) : d3.color(parentColor).brighter(0.2).formatHex()))
      .attr("stroke", d => (d.children ? d3.color(parentColor).darker(1).formatHex() : d3.color(parentColor).darker(1.6).formatHex()))
      .attr("stroke-width", d => (d.children ? 1 : 0.6))
      .style("cursor", d => (d.children ? "pointer" : "default"))
      .transition()
      .duration(400)
      .attr("r", d => d.r);

    node
      .append("text")
      .attr("class", "packing-label")
      .style("font-size", d => `${Math.max(8, Math.min(14, d.r * 0.35))}px`)
      .style("text-anchor", "middle")
      .style("dominant-baseline", "middle")
      .style("pointer-events", "none")
      .style("fill", d => (d.children ? "#08306b" : "#3b2f00"))
      .text(d => (d.data && d.data.name ? d.data.name : ""));
    const view = { x: width / 2, y: height / 2, k: 1 };

    /* Zooming function */
    function zoomTo(v) {
      const k = width / (v.r * 2);
      view.x = v.x;
      view.y = v.y;
      view.k = k;

      const t = g.transition().duration(600);
      node
        .transition(t)
        .attr("transform", d => `translate(${(d.x - view.x) * view.k + width / 2},${(d.y - view.y) * view.k + height / 2})`);

      node
        .selectAll("circle")
        .transition(t)
        .attr("r", d => d.r * view.k);

      node
        .selectAll("text")
        .transition(t)
        .style("font-size", d => `${Math.max(6, Math.min(18, d.r * view.k * 0.35))}px`)
        .style("opacity", d => (d.r * view.k > 8 ? 1 : 0));
    }

    function zoom(d) {  
      zoomTo(d);
    }

    node.on("click", (event, d) => {
      event.stopPropagation();
      if (d.children) zoom(d);
    });

    svg.on("click", () => {
      zoom(root);
    });

    zoomTo(root);

    return () => {
      svg.selectAll("*").remove();
    };
  }, [data, width, height, parentColor, pointerEvents]);

  return (
    <Box
      position="relative"
      width={`${width}px`}
      height={`${height}px`}
      bg="transparent"
      borderRadius="md"
      overflow="visible"
      pointerEvents={pointerEvents}
    >
      <Box position="absolute" top="6px" right="6px" zIndex={40}>
        <IconButton
          aria-label="Close packing"
          icon={<CloseIcon />}
          size="sm"
          onClick={onClose}
          bg="whiteAlpha.900"
          _hover={{ bg: "whiteAlpha.800" }}
          boxShadow="sm"
        />
      </Box>
      
      {/* SVG element for D3.js rendering */}
      <svg ref={svgRef} style={{ width: "100%", height: "100%", display: "block" }} />
    </Box>
  );
}
