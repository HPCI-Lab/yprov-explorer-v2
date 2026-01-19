// Animation.js
// Custom 3-thumb slider animation for activities with opacity hierarchy, free-moving thumbs, real-time and fixed playback, GIF export

import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import * as d3 from "d3";
import "./animation.css";
import { GIFEncoder, quantize, applyPalette } from "gifenc";
import { Box, Button } from "@chakra-ui/react";

const Timeline = ({ activities = [], linksByActivityRef, onIndexChange }) => {
  // --- Playback and slider state ---
  const [isPlaying, setIsPlaying] = useState(false);
  const [subsetTime, setSubsetTime] = useState([0, 0]); // [startTime, endTime] of the subset
  const [currentIndex, setCurrentIndex] = useState(0); // index in activities array for stepping
  const [currentTime, setCurrentTime] = useState(0); // current timestamp in ms
  const [useTimestamps, setUseTimestamps] = useState(true); // real-time vs fixed mode
  const [timeMultiplier, setTimeMultiplier] = useState(1); // speed multiplier for real-time
  const [timeStepMs, setTimeStepMs] = useState(500); // step size for fixed mode
  const [showSettings, setShowSettings] = useState(false);
  const playStartedRef = useRef(false);
  const [hoverSlider, setHoverSlider] = useState(false);
  const [subsetOnlyMode, setSubsetOnlyMode] = useState(true);

  // --- GIF state ---
  const [isGeneratingGif, setIsGeneratingGif] = useState(false);
  const gifCancelRef = useRef(false);
  const currentGifRef = useRef(null);
  const [gifStatus, setGifStatus] = useState("");
  const [gifProgress, setGifProgress] = useState({ current: 0, total: 0, pct: 0 });

  // --- D3 refs ---
  const allNodesRef = useRef(null);
  const allLinksRef = useRef(null);
  const draggingRef = useRef(null); // "start" | "current" | "end" | null
  const trackRef = useRef(null);

  // --- Caches for fast DOM access ---
  const nodeByIdRef = useRef(new Map());
  const linkByIdRef = useRef(new Map());
  const entByIdRef = useRef(new Map());

  const currentTimeRef = useRef(0);
  useEffect(() => {
    currentTimeRef.current = currentTime;
  }, [currentTime]);

  // --- Initialize D3 selections ---
  useEffect(() => {
    allNodesRef.current = d3.selectAll(".node");
    allLinksRef.current = d3.selectAll(".link");
  }, [activities]);

  // --- Build node/link/entity caches ---
  useEffect(() => {
    const nmap = new Map();
    const lmap = new Map();
    const emap = new Map();

    if (allNodesRef.current && typeof allNodesRef.current.each === "function") {
      allNodesRef.current.each(function () {
        const id = this.id?.replace(/^node-/, "");
        if (id) {
          nmap.set(id, this);
        }
      });
    } else if (allNodesRef.current && typeof allNodesRef.current.nodes === "function") {
      allNodesRef.current.nodes().forEach((el) => {
        const id = el.id?.replace(/^node-/, "");
        if (id) {
          nmap.set(id, el);
        }
      });
    }

    const linkGroups = linksByActivityRef?.current || {};
    for (const arr of Object.values(linkGroups)) {
      for (const l of arr) {
        const linkEl = document.getElementById(l.id);
        if (linkEl) {
          lmap.set(l.id, linkEl);
        }

        const entEl = document.getElementById(`node-${l.entId}`);
        if (entEl) {
          emap.set(String(l.entId), entEl);
        }
      }
    }

    nodeByIdRef.current = nmap;
    linkByIdRef.current = lmap;
    entByIdRef.current = emap;
  }, [activities, linksByActivityRef]);

  // --- Compute global times ---
  const minTime = activities?.length ? (activities[0].start ?? 0) : 0;
  const maxTime = activities.length
    ? Math.max(...activities.map(a => a.end ?? a.start ?? minTime))
    : minTime;

  // --- Initialize subset on activities change ---
  useEffect(() => {
    if (!activities?.length) {
      setSubsetTime([0, 0]);
      setCurrentIndex(0);
      setCurrentTime(0);
      return;
    }

    const defaultStart = activities[0]?.start ?? minTime;
    const lastEndTime = Math.max(...activities.map(a => a.end ?? a.start ?? minTime));
    setSubsetTime([defaultStart, lastEndTime]);

    setIsPlaying(false);
    playStartedRef.current = false;
    setCurrentIndex(0);
    setCurrentTime(defaultStart);
    setSubsetOnlyMode(true);
  }, [activities, minTime]);

  // --- Utility functions ---
  const clamp01 = (v) => Math.min(1, Math.max(0, v));

  const timeToPct = (t) => {
    if (maxTime === minTime) {
      return 0;
    }
    return clamp01((t - minTime) / (maxTime - minTime));
  };

  const pctToTime = (pct) => {
    pct = clamp01(pct);
    return Math.round(minTime + pct * (maxTime - minTime));
  };

  const indexForNearestTime = useCallback((t) => {
    if (!activities?.length) return 0;
    let idx = activities.findIndex((a) => a.start > t);
    if (idx === -1) {
      idx = activities.length;
    }
    return Math.max(0, Math.min(idx - 1, activities.length - 1));
  }, [activities]);

  const [startTime, endTime] = subsetTime;

  // --- Determine indices inside subset ---
    const subsetIndices = useMemo(() => {
    if (!activities?.length) return [];
    return activities
        .map((a, i) => ({
        i,
        overlaps: (a.start ?? 0) < subsetTime[1] && (a.end ?? (a.start ?? 0)) > subsetTime[0]
        }))
        .filter(x => x.overlaps)
        .map(x => x.i);
    }, [activities?.length, subsetTime[0], subsetTime[1]]);

    const startIdx = subsetIndices.length ? subsetIndices[0] : 0;
    const endIdx = subsetIndices.length ? subsetIndices[subsetIndices.length - 1] : Math.max(activities.length - 1, 0);


  // --- Opacity calculation ---
  const getActivityOpacity = useCallback((act, effectiveTime, subsetStart, subsetEnd) => {
    if (!act) {
      return 0.05;
    }

    const actStart = Number.isFinite(act.start) ? act.start : 0;
    const actEnd = Number.isFinite(act.end) ? act.end : actStart;

    if (actEnd <= subsetStart || actStart >= subsetEnd) {
      return 0.05;
    }

    if (subsetOnlyMode) {
      return 0.95;
    }

    if (typeof effectiveTime !== "number" || Number.isNaN(effectiveTime)) {
      if (actStart > subsetStart) {
        return 0.3;
      }
      return 0.95;
    }

    const started = actStart <= effectiveTime;
    const ended = Number.isFinite(act.end) ? act.end <= effectiveTime : false;

    if (started && !ended) {
      return 1.0;
    }
    if (!started) {
      return 0.3;
    }
    return 0.95;
  }, [subsetOnlyMode]);

  // --- Opacities: stable callback ---
  const applyOpacities = useCallback((effectiveTime, subsetTime) => {
    const acts = activities || [];
    if (acts.length === 0) return;

    const [subsetStart, subsetEnd] = subsetTime;

    if (allNodesRef.current) allNodesRef.current.style?.("opacity", 0);
    if (allLinksRef.current) allLinksRef.current.style?.("opacity", 0);
    d3.selectAll("[id^='node-label-']").style("opacity", 0);
    d3.selectAll("[id^='link-label-']").style("opacity", 0);

    acts.forEach((act) => {
      const actOpacity = getActivityOpacity(act, effectiveTime, subsetStart, subsetEnd);

      // Activity
      const nodeSel = d3.select(`#${CSS.escape(`node-${act.id}`)}`);
      if (!nodeSel.empty()) {
        nodeSel
          .style("opacity", actOpacity)
          // .style("stroke", actOpacity === 1 ? "#000" : null)
          // .style("stroke-width", actOpacity === 1 ? 6 : null)
          .style("fill", actOpacity === 1 ? "#FFAA1D" : null);
      }

      const nodeLabelSel = d3.select(`#${CSS.escape(`node-label-${act.id}`)}`);
      if (!nodeLabelSel.empty()) {
        nodeLabelSel.style("opacity", actOpacity);
      }

      // Link & Entity
      const linked = linksByActivityRef?.current?.[act.id] || [];
      linked.forEach((l) => {
        const linkSel = d3.select(`#${CSS.escape(l.id)}`);
        const linkLabelSel = d3.select(`#${CSS.escape(`link-label-${l.id}`)}`);

        const entSel = d3.select(`#${CSS.escape(`node-${l.entId}`)}`);
        const entLabelSel = d3.select(`#${CSS.escape(`node-label-${l.entId}`)}`);

        const isActivity = acts.some(a => a.id === l.entId);

        if (!linkSel.empty()) linkSel.style("opacity", actOpacity);
        if (!linkLabelSel.empty()) {
          linkLabelSel.style("opacity", actOpacity);
        }

        if (isActivity) return;

        if (!entSel.empty()) {
          entSel
            .style("opacity", actOpacity)
            // .style("stroke", actOpacity === 1 ? "#000" : null)
            // .style("stroke-width", actOpacity === 1 ? 6 : null)
            .style("fill", actOpacity === 1 ? "#FFAA1D" : null);
        }

        if (!entLabelSel.empty()) {
          entLabelSel.style("opacity", actOpacity);
        }
      });
    });
  }, [getActivityOpacity, activities?.length /* only recreate when length changes */]);

  // --- Apply opacities and notify parent  ---
  const lastNotifyRef = useRef({ currentIndex: null, currentTime: null, subsetStart: null, subsetEnd: null });

useEffect(() => {
  if (!activities?.length) return;

  const effectiveTime = (typeof currentTime === "number" && !Number.isNaN(currentTime))
    ? currentTime
    : (activities?.[currentIndex]?.start ?? minTime);

  // always update DOM opacities (no React state) — fine to call every render
  applyOpacities(effectiveTime, subsetTime);

  // only call onIndexChange when something meaningfully changed
  if (typeof onIndexChange === "function") {
    const last = lastNotifyRef.current;
    const s = subsetTime[0], e = subsetTime[1];

    const changed =
      last.currentIndex !== currentIndex ||
      last.currentTime !== currentTime ||
      last.subsetStart !== s ||
      last.subsetEnd !== e;

    if (changed) {
      lastNotifyRef.current = { currentIndex, currentTime, subsetStart: s, subsetEnd: e };
      try {
        onIndexChange({ currentIndex, currentTime, subset: [s, e] });
      } catch (err) {
        // swallow exceptions from parent callback so we don't break animation loop
        console.error("onIndexChange threw:", err);
      }
    }
  }
  // intentionally keep deps minimal and stable:
}, [subsetTime, currentIndex, currentTime, applyOpacities, onIndexChange, activities?.length, minTime]);


  // --- Playback loop ---
  const rafRef = useRef(null);
  const lastNowRef = useRef(null);

  useEffect(() => {
    if (!activities?.length || !isPlaying) {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
        lastNowRef.current = null;
      }
      return;
    }

    lastNowRef.current = performance.now();
    let fixedAccum = 0;
    const subsetFinalTime = endTime;

    const step = (now) => {
      const dt = now - lastNowRef.current;
      lastNowRef.current = now;

      if (useTimestamps) {
        // Real-time playback
        setCurrentTime(prev => {
          const base = Number.isFinite(prev) ? prev : (activities[startIdx]?.start ?? minTime);
          let next = base + dt * timeMultiplier;

          if (next > subsetFinalTime) {
            next = subsetFinalTime;
          }

          applyOpacities(next, subsetTime);
          const idxAfter = indexForNearestTime(next);
          setCurrentIndex(Math.max(startIdx, Math.min(idxAfter, endIdx)));

          if (next >= subsetFinalTime) {
            playStartedRef.current = false;
            setIsPlaying(false);
          }

          return next;
        });
      } else {
        // Fixed-step playback
        fixedAccum += dt;
        if (fixedAccum >= timeStepMs) {
          fixedAccum -= timeStepMs;

          setCurrentIndex(prevIdx => {
            if (prevIdx >= endIdx) {
              setCurrentTime(subsetFinalTime);
              applyOpacities(subsetFinalTime, subsetTime);
              playStartedRef.current = false;
              setIsPlaying(false);
              return endIdx;
            }

            const nextIdx = prevIdx + 1;
            const act = activities[nextIdx];

            if (act) {
              let nextTime = act.start ?? currentTimeRef.current;
              nextTime = Math.max(nextTime, currentTimeRef.current);
              nextTime = Math.max(subsetTime[0], Math.min(nextTime, subsetTime[1]));

              setCurrentTime(nextTime);
              applyOpacities(nextTime, subsetTime);
            }

            return nextIdx;
          });
        }
      }

      if (isPlaying) {
        rafRef.current = requestAnimationFrame(step);
      }
    };

    rafRef.current = requestAnimationFrame(step);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      lastNowRef.current = null;
    };
  }, [
    isPlaying, useTimestamps, timeMultiplier, timeStepMs,
    activities, applyOpacities, subsetTime,
    startIdx, endIdx, endTime, minTime, indexForNearestTime
  ]);

  // --- Play/pause toggle ---
  const handlePlayPause = () => {
    if (isPlaying) {
      playStartedRef.current = false;
      setIsPlaying(false);
      return;
    }
    
    setSubsetOnlyMode(false);

    const [subsetStart, subsetEnd] = subsetTime;
    const isFinished = currentTime >= subsetEnd;

    if (isFinished) {
      setCurrentIndex(startIdx);
      setCurrentTime(subsetStart);
    }

    playStartedRef.current = true;
    setIsPlaying(true);
  };

  // --- Reset ---
  const handleReset = (full = false) => {
    gifCancelRef.current = true;
    if (currentGifRef.current) {
      try {
        currentGifRef.current.abort();
      } catch (e) {}
      currentGifRef.current = null;
    }
    setIsGeneratingGif(false);

    if (!activities || activities.length === 0) return;

    const doFullReset = () => {
      const lastEndTime = Math.max(...activities.map(a => a.end ?? a.start ?? minTime));
      const newSubsetTime = [activities[0].start ?? minTime, lastEndTime];
      setSubsetTime(newSubsetTime);
      setCurrentIndex(0);
      const t0 = activities[0]?.start ?? minTime;
      setCurrentTime(t0);
      d3.selectAll(".node").style("opacity", 1);
      d3.selectAll(".link").style("opacity", 1);
      applyOpacities(t0, [0, activities.length - 1]);
    };

    if (full) {
      doFullReset();
      return;
    }

    if (currentIndex <= startIdx) {
      doFullReset();
      return;
    }

    setCurrentIndex(startIdx);
    setCurrentTime(startTime);
    applyOpacities(startTime, subsetTime);
  };

  // --- Slider helpers ---
  const startPct = timeToPct(startTime ?? minTime);
  const endPct = timeToPct(endTime ?? maxTime);
  const currentPct = timeToPct(currentTime ?? minTime);

  const onThumbPointerDown = (which, e) => {
    e.preventDefault();
    e.stopPropagation();
    draggingRef.current = which;
    document.addEventListener("pointermove", onPointerMove);
    document.addEventListener("pointerup", onPointerUp);
  };

  const onPointerMove = (e) => {
    const track = trackRef.current;
    if (!track || !draggingRef.current) return;

    const rect = track.getBoundingClientRect();
    const pct = clamp01((e.clientX - rect.left) / rect.width);

    if (draggingRef.current === "start") {
      const newStart = pctToTime(pct);
      const [, curEnd] = subsetTime;
      if (newStart <= curEnd) {
        setSubsetTime([newStart, curEnd]);
        if (currentTime < newStart) {
          setCurrentTime(newStart);
          setCurrentIndex(indexForNearestTime(newStart));
        }
      }
    } else if (draggingRef.current === "end") {
      const newEnd = pctToTime(pct);
      const [curStart] = subsetTime;
      if (newEnd >= curStart) {
        setSubsetTime([curStart, newEnd]);
        if (currentTime > newEnd) {
          setCurrentTime(newEnd);
          setCurrentIndex(indexForNearestTime(newEnd));
        }
      }
    } else if (draggingRef.current === "current") {
      const t = pctToTime(pct);
      const [sT, eT] = subsetTime;
      const clamped = Math.max(sT, Math.min(t, eT));
      setCurrentTime(clamped);
      setCurrentIndex(indexForNearestTime(clamped));
      applyOpacities(clamped, subsetTime);
    }
  };

  const onPointerUp = () => {
    draggingRef.current = null;
    document.removeEventListener("pointermove", onPointerMove);
    document.removeEventListener("pointerup", onPointerUp);
  };

  const onTrackClick = (e) => {
    const track = trackRef.current;
    if (!track) return;

    const rect = track.getBoundingClientRect();
    const pct = clamp01((e.clientX - rect.left) / rect.width);

    const dStart = Math.abs(pct - startPct);
    const dEnd = Math.abs(pct - endPct);
    const dCur = Math.abs(pct - currentPct);
    const minD = Math.min(dStart, dEnd, dCur);

    if (minD === dStart) {
      const newStartTime = pctToTime(pct);
      const [, curEnd] = subsetTime;
      if (newStartTime <= curEnd) {
        setSubsetTime([newStartTime, curEnd]);
        if (currentTime < newStartTime) {
          setCurrentTime(newStartTime);
          setCurrentIndex(indexForNearestTime(newStartTime));
        }
      }
    } else if (minD === dEnd) {
      const newEndTime = pctToTime(pct);
      const [curStart] = subsetTime;
      if (newEndTime >= curStart) {
        setSubsetTime([curStart, newEndTime]);
        if (currentTime > newEndTime) {
          setCurrentTime(newEndTime);
          setCurrentIndex(indexForNearestTime(newEndTime));
        }
      }
    } else {
      const t = pctToTime(pct);
      const [sT, eT] = subsetTime;
      const clampedTime = Math.max(sT, Math.min(t, eT));
      const idx = indexForNearestTime(clampedTime);
      setCurrentIndex(idx);
      setCurrentTime(clampedTime);
      applyOpacities(clampedTime, subsetTime);
    }
  };

  // --- Slider gradient ---
  const computeDensityGradient = (activitiesLocal, minT, maxT, startP, endP) => {
    if (!activitiesLocal?.length || maxT <= minT) {
      return `linear-gradient(90deg,
        rgba(180,180,180,0.70) 0%,
        rgba(138,182,255,0.9) 50%,
        rgba(180,180,180,0.70) 100%)`;
    }

    const samples = 120;
    const stops = [];

    for (let i = 0; i <= samples; i++) {
      const t = minT + ((maxT - minT) * i) / samples;
      let activeCount = 0;
      for (const a of activitiesLocal) {
        if (a.start != null && a.end != null && a.start <= t && t < a.end) {
          activeCount++;
        }
      }
      stops.push({ t, activeCount });
    }

    const maxCount = Math.max(1, ...stops.map(s => s.activeCount));
    stops.forEach(s => (s.norm = s.activeCount / maxCount));

    const pctStops = stops.map((s, i) => {
      const pct = (i / samples) * 100;
      const hueStart = 205;
      const hueEnd = 225;
      const hue = hueStart + (hueEnd - hueStart) * s.norm;
      const lightness = 80 - 35 * s.norm;
      const alpha = 0.5 + 0.5 * s.norm;
      const color = `hsla(${hue}, 100%, ${lightness}%, ${alpha.toFixed(2)})`;
      return `${color} ${pct.toFixed(1)}%`;
    });

    const fullGradient = `linear-gradient(90deg, ${pctStops.join(", ")})`;
    const startCut = Math.round(startP * 100);
    const endCut = Math.round(endP * 100);

    return `
      linear-gradient(90deg,
        rgba(180,180,180,0.70) 0%,
        rgba(180,180,180,0.70) ${startCut}%,
        transparent ${startCut}%,
        transparent ${endCut}%,
        rgba(180,180,180,0.70) ${endCut}%,
        rgba(180,180,180,0.70) 100%
      ),
      ${fullGradient}
    `;
  };

  const pctToPercent = (p) => `${Math.round(p * 100)}%`;
  const gradientStyle = {
    background: computeDensityGradient(activities, minTime, maxTime, startPct, endPct),
    height: 12,
    borderRadius: 8,
    position: "relative"
  };

  // --- Capture SVG helper ---
  async function captureSvgAsCanvas(svgElement, width, height, scale = 2, background = "#ffffff") {
    if (!width || !height) {
      const bbox = svgElement.getBBox();
      width = bbox.width || 800;
      height = bbox.height || 600;
    }

    const svgString = new XMLSerializer().serializeToString(svgElement);
    const svg64 = btoa(unescape(encodeURIComponent(svgString)));
    const image64 = `data:image/svg+xml;base64,${svg64}`;

    const img = new Image();
    img.src = image64;
    await new Promise(resolve => img.onload = resolve);

    const canvas = document.createElement("canvas");
    canvas.width = width * scale;
    canvas.height = height * scale;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    ctx.scale(scale, scale);

    ctx.fillStyle = background;
    ctx.fillRect(0, 0, width, height);
    ctx.drawImage(img, 0, 0, width, height);

    return canvas;
  }

  // --- GIF export ---
  async function exportGraphAsGif({ containerSelector = "#graphFrame", startTime, endTime, stepDelay = 500 }) {
    const container = document.querySelector(containerSelector);
    if (!container) throw new Error("Graph container not found");

    const svg = container.querySelector("svg");
    if (!svg) throw new Error("SVG element not found");

    const { width, height } = svg.getBoundingClientRect();
    const encoder = GIFEncoder();

    const subsetActivities = activities.filter(a => {
      const s = a.start ?? 0;
      const e = a.end ?? s;
      return e >= startTime && s <= endTime;
    });

    const totalFrames = subsetActivities.length;

    // Helper: capture current SVG frame and write to GIF
    const writeFrame = async (t) => {
      applyOpacities(t, [startTime, endTime]);
      d3.select(".thumb-current").style("left", `${timeToPct(t) * 100}%`);

      svg.querySelectorAll("text").forEach(t => t.style.fontFamily = "Arial, sans-serif");
      const canvas = await captureSvgAsCanvas(svg, width, height, 2, "#ffffff");
      const ctx = canvas.getContext("2d");
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const palette = quantize(imageData.data, 256);
      const indexed = applyPalette(imageData.data, palette);

      encoder.writeFrame(indexed, canvas.width, canvas.height, {
        palette,
        delay: stepDelay,
        disposal: 2
      });
    };

    // Start export
    setGifProgress({ current: 0, total: totalFrames, pct: 0 });
    gifCancelRef.current = false;
    setIsGeneratingGif(true);

    try {
      // First frame: startTime
      if (!gifCancelRef.current) {
        await writeFrame(startTime);
        setGifProgress({ current: 1, total: totalFrames, pct: Math.round((1 / totalFrames) * 100) });
        await new Promise(r => requestAnimationFrame(r));
      }

      // Intermediate frames: activity starts
      for (let i = 0; i < subsetActivities.length; i++) {
        if (gifCancelRef.current) break;

        const act = subsetActivities[i];
        await writeFrame(act.start ?? startTime);

        setGifProgress({
          current: i + 2,
          total: totalFrames,
          pct: Math.min(100, Math.round(((i + 2) / totalFrames) * 100))
        });

        await new Promise(r => requestAnimationFrame(r));
      }

      // Final frame: endTime
      if (!gifCancelRef.current) {
        await writeFrame(endTime);
      }

      if (gifCancelRef.current) {
        console.warn("GIF export cancelled");
        setGifProgress({ current: 0, total: 0, pct: 0 });
        return;
      }

      encoder.finish();
      const buffer = encoder.bytesView();
      const blob = new Blob([buffer], { type: "image/gif" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "graph_animation.gif";
      a.click();
      URL.revokeObjectURL(url);

    } catch (err) {
      console.error("GIF export failed:", err);
    } finally {
      setIsGeneratingGif(false);
      gifCancelRef.current = false;
      setGifProgress({ current: 0, total: 0, pct: 0 });
    }
  }

  // --- Render ---
  return (
    <Box id="graphContainer" style={{padding: "20px"}}>
      {activities?.length > 0 ? (
        <Box className="animation-controls">
          <Button className="play-button" onClick={handlePlayPause}>
            {isPlaying ? <i className="bi bi-pause-fill"></i> : <i className="bi bi-play-fill"></i>}
          </Button>

          <Box
            className="animation-slider"
            ref={trackRef}
            style={{ ...gradientStyle, position: "relative" }}
            onPointerDown={onTrackClick}
            onMouseEnter={() => setHoverSlider(true)}
            onMouseLeave={() => setHoverSlider(false)}
          >
            {/* Mini-graph overlay */}
            <svg
              className="slider-mini-graph"
              style={{ opacity: hoverSlider ? 1 : 0 }}
            >
              {activities.length > 0 && trackRef.current && (() => {
                const width = trackRef.current.clientWidth;
                const height = 20;
                const samples = Math.min(300, Math.max(30, Math.floor(width / 5)));
                const points = [];
                const min = minTime;
                const max = maxTime;

                // Precompute counts for each sample
                const counts = Array(samples + 1).fill(0);
                for (let i = 0; i <= samples; i++) {
                  const _t = min + ((max - min) * i) / samples; // use _t to avoid eslint warning
                  counts[i] = activities.filter(a => (a.start ?? 0) <= _t && (a.end ?? _t) > _t).length;
                }
                const maxCount = Math.max(...counts, 1); // prevent Boxision by zero

                // Build points for the hollow line
                for (let i = 0; i <= samples; i++) {
                  points.push({
                    x: (i / samples) * width,
                    y: height - (counts[i] / maxCount) * height
                  });
                }

                // Create smooth curve
                let pathD = `M${points[0].x},${points[0].y}`;
                for (let i = 1; i < points.length; i++) {
                  const cpX = (points[i-1].x + points[i].x) / 2;
                  pathD += ` Q${cpX},${points[i-1].y} ${points[i].x},${points[i].y}`;
                }

                return (
                  <>
                    {/* Hollow line */}
                    <path
                      d={pathD}
                      fill="none"
                      stroke="#1a73e8"
                      strokeWidth={1.5}
                    />
                  </>
                );
              })()}
            </svg>

            {/* Thumbs */}
            <Box
              className="slider-thumb thumb-start"
              onPointerDown={(e) => onThumbPointerDown("start", e)}
              style={{ left: pctToPercent(startPct) }}
            >
              <Box className="thumb-label">
                {(() => {
                  const d = new Date(startTime ?? minTime);
                  return `${d.toLocaleDateString()}, ${d.toLocaleTimeString()}.${String(d.getMilliseconds()).padStart(3, "0")}`;
                })()}
              </Box>
            </Box>
            
            {!subsetOnlyMode && (
              <Box
                className="slider-thumb thumb-current"
                onPointerDown={(e) => onThumbPointerDown("current", e)}
                style={{ left: pctToPercent(currentPct) }}
              >
                <Box className="thumb-label">
                  {(() => {
                    const d = new Date(currentTime ?? minTime);
                    return `${d.toLocaleDateString()}, ${d.toLocaleTimeString()}.${String(d.getMilliseconds()).padStart(3, "0")}`;
                  })()}
                </Box>
              </Box>
            )}

            <Box
              className="slider-thumb thumb-end"
              onPointerDown={(e) => onThumbPointerDown("end", e)}
              style={{ left: pctToPercent(endPct) }}
            >
              <Box className="thumb-label">
                {(() => {
                  const d = new Date(endTime ?? maxTime);
                  return `${d.toLocaleDateString()}, ${d.toLocaleTimeString()}.${String(d.getMilliseconds()).padStart(3, "0")}`;
                })()}
              </Box>
            </Box>
          </Box>

          <Box style={{ position: "relative" }}>
            <Button className="anim-settings-button" onClick={() => setShowSettings(prev => !prev)}>
              <i className="bi bi-sliders"></i>
            </Button>

            {showSettings && (
              <>
                <Box className="anim-settings-backdrop" onClick={() => setShowSettings(false)} />
                <Box className="anim-settings-panel" onClick={(e) => e.stopPropagation()}>
                  <h4>Settings</h4>

                  <Button
                    onClick={() => !isPlaying && setSubsetOnlyMode(prev => !prev)}
                    disabled={isPlaying}
                  >
                    Animation
                    <i
                      className={`bi ${ subsetOnlyMode ? "bi-toggle-off" : "bi-toggle-on" }`}
                      style={{ fontSize: 20, color: "#1a73e8" }}
                    />
                  </Button>

                  <Button onClick={() => handleReset(false)}>
                    <i className="bi bi-arrow-clockwise" style={{ rotate: "45deg", display: "inline-block" }}></i>
                    Reset
                  </Button>

                  <Button onClick={async () => {
                    if (isGeneratingGif) {
                      gifCancelRef.current = true;
                      setGifStatus("Cancelling export…");
                      return;
                    }
                    setIsGeneratingGif(true);
                    gifCancelRef.current = false;
                    setGifStatus("Starting GIF export…");
                    try {
                      await exportGraphAsGif({ containerSelector: "#graphFrame", startTime, endTime, stepDelay: timeStepMs });
                      if (!gifCancelRef.current) setGifStatus("GIF export complete!");
                    } catch (err) {
                      if (!gifCancelRef.current) console.error("GIF export failed:", err);
                      setGifStatus("GIF export failed.");
                    } finally {
                      setIsGeneratingGif(false);
                      gifCancelRef.current = false;
                    }
                  }}>
                    <i className="bi bi-download"></i>
                    {isGeneratingGif ? "Cancel Export" : "Export GIF"}
                  </Button>

                  <Button onClick={() => setUseTimestamps(prev => !prev)}>
                    <i className="bi bi-speedometer2"></i>
                    {useTimestamps ? "Mode: Real-time" : "Mode: Fixed"}
                  </Button>

                  {useTimestamps ? (
                    <select value={timeMultiplier} onChange={(e) => setTimeMultiplier(parseFloat(e.target.value))}>
                      <option value={0.25}>x0.25</option>
                      <option value={0.5}>x0.5</option>
                      <option value={1}>x1</option>
                      <option value={2}>x2</option>
                      <option value={5}>x5</option>
                    </select>
                  ) : (
                    <select value={timeStepMs} onChange={(e) => setTimeStepMs(parseFloat(e.target.value))}>
                      <option value={100}>100 ms step</option>
                      <option value={250}>250 ms step</option>
                      <option value={500}>500 ms step</option>
                      <option value={750}>750 ms step</option>
                      <option value={1000}>1000 ms step</option>
                    </select>
                  )}
                </Box>
              </>
            )}
          </Box>
        </Box>
      ) : (
        <Box>
          <i className="bi bi-filetype-json" style={{ marginRight: 6 }}></i>
          Awaiting file upload...
        </Box>
      )}

      {isGeneratingGif && gifProgress.total > 0 && (
        <Box className="gif-progress-container">
          <Box className="gif-progress-inner">
            <Box className="gif-progress-text"><strong>{gifProgress.current}</strong> / {gifProgress.total}</Box>
            <Box className="gif-progress-bar"><Box className="gif-progress-fill" style={{ width: `${gifProgress.pct}%` }} /></Box>
            <Box className="gif-progress-percent">{gifProgress.pct}%</Box>
          </Box>
          <Box className="gif-progress-info"><span>{gifStatus || "Preparing export..."}</span></Box>
        </Box>
      )}
    </Box>
  );

};

export default Timeline;
