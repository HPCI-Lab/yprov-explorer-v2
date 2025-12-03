import React, { useRef, useEffect, useState } from "react";
import * as d3 from "d3";
import * as topojson from "topojson-client";
import { Box } from "@chakra-ui/react";

export default function BubbleMap({
  data = [],
  onBubbleClick = () => {},
  labelMode = "single",
  variant
}) {
  const containerRef = useRef(null);
  const svgRef = useRef(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (!containerRef.current) return;
    const el = containerRef.current;
    const ro = new ResizeObserver(entries => {
      for (const entry of entries) {
        const cr = entry.contentRect;
        setSize({
          width: Math.max(1, Math.floor(cr.width)),
          height: Math.max(1, Math.floor(cr.height)),
        });
      }
    });
    ro.observe(el);
    const rect = el.getBoundingClientRect();
    setSize({
      width: Math.max(1, Math.floor(rect.width)),
      height: Math.max(1, Math.floor(rect.height)),
    });
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (!size.width || !size.height) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const mapG = svg.append("g").attr("class", "map-layer");
    const pointsG = svg.append("g").attr("class", "points-layer");

    const projection = d3.geoNaturalEarth1();
    const path = d3.geoPath().projection(projection);

    const controller = new AbortController();
    const url = "https://unpkg.com/world-atlas@2.0.2/countries-110m.json";

    d3.json(url, { signal: controller.signal })
      .then(worldData => {
        const countries = topojson.feature(worldData, worldData.objects.countries).features;
        projection.fitSize([size.width, size.height], { type: "FeatureCollection", features: countries });

        mapG
          .selectAll("path.country")
          .data(countries)
          .join("path")
          .attr("class", "country")
          .attr("d", path)
          .attr("fill", "#e9e9e9")
          .attr("stroke", "#bdbdbd")
          .attr("stroke-width", 0.4);

        const processed = data.map(d => {
          const sumChildrenValue = d.children && d.children.length
            ? d3.sum(d.children, c => (c.value != null ? +c.value : 0))
            : 0;
          const computedValue = sumChildrenValue > 0
            ? sumChildrenValue
            : (d.value != null ? +d.value : (d.children ? d.children.length : 1));
          return { ...d, computedValue };
        });

        const maxVal = d3.max(processed, d => d.computedValue) || 1;
        const rScale = d3.scaleSqrt()
          .domain([0, maxVal])
          .range([4, Math.min(size.width, size.height) * 0.06]);

        const maxFontPx = Math.max(10, Math.min(size.width, size.height) * 0.03);
        const minFontPx = 8;
        const minRadiusToShowLabel = 10;
        const maxLabelChars = 18;

        function isColorDark(hex) {
          if (!hex) return false;
          const c = hex.replace("#", "");
          const expand = (s) => s.length === 3 ? s.split("").map(ch => ch + ch).join("") : s;
          const cc = expand(c);
          const r = parseInt(cc.substring(0, 2), 16);
          const g = parseInt(cc.substring(2, 4), 16);
          const b = parseInt(cc.substring(4, 6), 16);
          const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
          return lum < 140;
        }

        function truncateText(str, maxChars) {
          if (!str) return "";
          return str.length > maxChars ? str.slice(0, maxChars - 1) + "…" : str;
        }

        const nodes = pointsG.selectAll("g.point-group")
          .data(processed, d => d.id || d.name)
          .join("g")
          .attr("class", "point-group")
          .attr("transform", d => {
            const p = projection([d.lon, d.lat]) || [-9999, -9999];
            return `translate(${p[0]},${p[1]})`;
          })
          .style("cursor", "pointer")
          .on("click", (event, d) => {
            event.stopPropagation();
            const p = projection([d.lon, d.lat]) || [0, 0];
            const r = rScale(d.computedValue);
            onBubbleClick({ ...d, cx: p[0], cy: p[1], r, children: d.children || [], color: d.color });
          });

        nodes.append("circle")
          .attr("class", "point")
          .attr("r", 0)
          .attr("fill", d => d.color || "#4682b4")
          .attr("fill-opacity", 0.85)
          .attr("stroke", "#111")
          .attr("stroke-width", 0.6)
          .transition()
          .duration(600)
          .attr("r", d => rScale(d.computedValue));

        nodes.each(function(d) {
          const group = d3.select(this);
          const r = rScale(d.computedValue);
          if (r < minRadiusToShowLabel) return;

          const fontPx = Math.min(maxFontPx, Math.max(minFontPx, r * 0.45));
          const fillColor = d.color || "#4682b4";
          const textColor = isColorDark(fillColor) ? "#fff" : "#111";

          if (labelMode === "twoLines") {
            const words = (d.name || "").split(/\s+/);
            const mid = Math.ceil(words.length / 2);
            const line1 = truncateText(words.slice(0, mid).join(" "), Math.ceil(maxLabelChars / 2));
            const line2 = truncateText(words.slice(mid).join(" "), Math.ceil(maxLabelChars / 2));

            const text = group.append("text")
              .attr("class", "label-inside")
              .attr("text-anchor", "middle")
              .attr("dominant-baseline", "middle")
              .style("pointer-events", "none")
              .style("font-weight", 600)
              .style("fill", textColor)
              .style("font-size", `${fontPx}px`);

            text.append("tspan")
              .attr("x", 0)
              .attr("dy", "-0.25em")
              .text(line1);

            text.append("tspan")
              .attr("x", 0)
              .attr("dy", "1.0em")
              .text(line2);
          } else {
            const label = truncateText(d.name || "", maxLabelChars);
            group.append("text")
              .attr("class", "label-inside")
              .attr("text-anchor", "middle")
              .attr("dominant-baseline", "middle")
              .style("pointer-events", "none")
              .style("font-weight", 600)
              .style("fill", textColor)
              .style("font-size", `${fontPx}px`)
              .text(label);
          }
        });

      })
      .catch(err => {
        if (err.name !== "AbortError") console.error("Errore caricamento GeoJSON:", err);
      });

    return () => controller.abort();
  }, [size, data, onBubbleClick, labelMode]);

  const mapSizes = {
    small: {
      width: "400px",
      height: "150px"
    },
    large: {
      width: "100%",
      height: "100%"
    }
  };

  const finalSize = mapSizes[variant];

  return (
    <Box
      ref={containerRef}
       w={finalSize.width}
      h={finalSize.height}
      bg="white"
      borderRadius="md"
      boxShadow="md"
      overflow="hidden"
      position="relative"
    >
      <svg
        ref={svgRef}
        width={size.width || "100%"}
        height={size.height || "100%"}
        style={{ display: "block" }}
      />
    </Box>
  );
}
