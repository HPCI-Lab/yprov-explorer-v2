/* GraphPreview.js
   Component to generate and display a preview image of a provenance graph
   from its JSON representation or URL.
*/
import React, { useEffect, useState } from "react";
import { Image } from "@chakra-ui/react";
import { loadGraphFromURL } from "../../../utilities/graph_loader";

const GraphPreview = ({ graphJSON, url, width = 300, height = 200 }) => {
    // State to hold the generated preview URL
    const [previewUrl, setPreviewUrl] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
    const generatePreview = async () => {
    setLoading(true);

    let data;
    let nodes = [];
    let links = [];

    if (graphJSON) {
      data = graphJSON;
      nodes = [
        ...Object.keys(data.activity || {}).map(id => ({ id, type: "activity" })),
        ...Object.keys(data.entity || {}).map(id => ({ id, type: "entity" })),
      ];
      links = [
        ...Object.values(data.used || {}).map(d => ({
          source: d["prov:activity"],
          target: d["prov:entity"],
        })),
        ...Object.values(data.wasGeneratedBy || {}).map(d => ({
          source: d["prov:activity"],
          target: d["prov:entity"],
        })),
      ];
    } else if (url) {
      const result = await loadGraphFromURL(url);
      if (!result) {
        setLoading(false);
        return;
      }
      data = result.json;
      nodes = result.nodes;
      links = result.links;
    } else {
      setLoading(false);
      return;
    }

    // Simple force-directed layout for small graphs
    if (nodes.length < 500) {
      import("d3").then(d3 => {
        const simulation = d3.forceSimulation(nodes)
          .force("link", d3.forceLink(links).id(d => d.id).distance(30))
          .force("charge", d3.forceManyBody().strength(-20))
          .force("center", d3.forceCenter(width / 2, height / 2))
          .stop();

        for (let i = 0; i < 50; i++) simulation.tick();

        const svgElements = [];

        links.forEach(link => {
          const source = nodes.find(n => n.id === link.source);
          const target = nodes.find(n => n.id === link.target);
          if (!source || !target) return;
          svgElements.push(
            `<line x1="${source.x}" y1="${source.y}" x2="${target.x}" y2="${target.y}" stroke="#ccc" stroke-width="1"/>`
          );
        });

        nodes.forEach(node => {
          const color = node.type === "activity" ? "steelblue" : "green";
          svgElements.push(
            `<circle cx="${node.x}" cy="${node.y}" r="4" fill="${color}"/>`
          );
        });

        // Create SVG string
        const svgString = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">${svgElements.join("")}</svg>`;
        setPreviewUrl("data:image/svg+xml;base64," + btoa(svgString));
        setLoading(false);
      });
    } else {

      // Large graph fallback
      const svgElements = nodes.map(node => {
        const x = Math.random() * width;
        const y = Math.random() * height;
        const color = node.type === "activity" ? "steelblue" : "green";
        return `<circle cx="${x}" cy="${y}" r="2" fill="${color}" />`;
      });

      // Create SVG string
      const svgString = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">${svgElements.join("")}</svg>`;
      setPreviewUrl("data:image/svg+xml;base64," + btoa(svgString));
      setLoading(false);
    }
  };

  generatePreview();
}, [graphJSON, url, width, height]);

    return <Image src={previewUrl} alt="Graph preview" width={width} height={height} objectFit="contain" />;
    };

export default GraphPreview;
