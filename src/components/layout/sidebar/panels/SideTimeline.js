// AnimationOverviewPanel.js
// Displays an overview of activities with a timeline chart and scrollable activity log

import { useMemo, useRef, useEffect, useState } from "react";
import "./animationOverviewPanel.css";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  ReferenceArea
} from "recharts";
import { Box, Text } from "@chakra-ui/react";

export default function SideTimeline({
  activities = [],
  currentIndex = 0,
  currentTime = 0,
  subset = null,
  onHighlightNode = () => {}
}) {
  const listRef = useRef(null);
  const [expandedHidden, setExpandedHidden] = useState({
    before: false,
    after: false,
  });

  // --- Build chronological start/end events ---
  const events = useMemo(() => {
    const ev = [];
    for (const a of activities) {
      if (a.start != null) {
        ev.push({ time: a.start, type: "start", id: a.id });
      }
      if (a.end != null) {
        ev.push({ time: a.end, type: "end", id: a.id });
      }
    }
    ev.sort((x, y) => x.time - y.time);
    return ev;
  }, [activities]);

  // --- Compute active activity counts over time ---
  const activityTimeline = useMemo(() => {
    let active = 0;
    return events.map((ev) => {
      active += ev.type === "start" ? 1 : -1;
      if (active < 0) {
        active = 0;
      }
      return { time: ev.time, activeCount: active };
    });
  }, [events]);

  const globalMinTime =
    activityTimeline[0]?.time ??
    events[0]?.time ??
    0;

  const globalMaxTime =
    activityTimeline[activityTimeline.length - 1]?.time ??
    events[events.length - 1]?.time ??
    globalMinTime + 1;

  // --- Determine effective time for highlighting ---
  const effectiveTime = useMemo(() => {
    if (typeof currentTime === "number" && !Number.isNaN(currentTime) && currentTime !== 0) {
      return currentTime;
    }
    return activities[currentIndex]?.start ?? globalMinTime;
  }, [currentTime, currentIndex, activities, globalMinTime]);

  // --- Compute sets of active and finished activities ---
  const { activeIds, finishedIds } = useMemo(() => {
    const active = new Set();
    const finished = new Set();

    for (const a of activities) {
      const s = a.start ?? -Infinity;
      const e = a.end ?? Infinity;

      if (effectiveTime >= s && effectiveTime < e) {
        active.add(a.id);
      }
      if (e !== Infinity && effectiveTime >= e) {
        finished.add(a.id);
      }
    }
    return { activeIds: active, finishedIds: finished };
  }, [activities, effectiveTime]);

  // --- Subset metadata for highlighting outside-range activities ---
  const subsetMeta = useMemo(() => {
    if (!subset || !activities.length) {
      return {
        isIndexSubset: false,
        outOfSubset: new Set(),
        subsetStartTime: null,
        subsetEndTime: null
      };
    }

    const looksLikeIndices =
      Array.isArray(subset) &&
      subset.length === 2 &&
      Number.isInteger(subset[0]) &&
      Number.isInteger(subset[1]) &&
      subset[0] >= 0 &&
      subset[1] < activities.length;

    let subsetStartTime = null;
    let subsetEndTime = null;
    const out = new Set();

    if (looksLikeIndices) {
      const [si, ei] = subset;
      subsetStartTime = activities[si]?.start ?? globalMinTime;
      subsetEndTime = activities[ei]?.end ?? activities[ei]?.start ?? globalMaxTime;

      activities.forEach((a, idx) => {
        if (idx < si || idx > ei) {
          out.add(a.id);
        }
      });

      return { isIndexSubset: true, outOfSubset: out, subsetStartTime, subsetEndTime };
    }

    // Time-based subset
    const [tStart, tEnd] = subset;
    if (typeof tStart === "number" && typeof tEnd === "number" && tStart <= tEnd) {
      subsetStartTime = tStart;
      subsetEndTime = tEnd;

      for (const a of activities) {
        const s = a.start ?? -Infinity;
        const e = a.end ?? s;
        if (e < tStart || s > tEnd) {
          out.add(a.id);
        }
      }
    }

    return { isIndexSubset: false, outOfSubset: out, subsetStartTime, subsetEndTime };
  }, [subset, activities, globalMinTime, globalMaxTime]);

  const { subsetStartTime, subsetEndTime } = subsetMeta;

  // --- Auto-scroll log to first active start ---
  useEffect(() => {
    const container = listRef.current;
    if (!container) return;

    const children = [...container.children];
    const idx = children.findIndex((child) =>
      child.classList.contains("active") &&
      child.dataset.type === "start"
    );
    if (idx === -1) return;

    const child = children[idx];
    const containerTop = container.scrollTop;
    const containerBottom = containerTop + container.clientHeight;
    const childTop = child.offsetTop;
    const childBottom = childTop + child.clientHeight;

    if (childTop < containerTop) {
      container.scrollTop = childTop - 8;
    } else if (childBottom > containerBottom) {
      container.scrollTop = childBottom - container.clientHeight + 8;
    }
  }, [activeIds, events]);

  // --- Format timestamps for display ---
  const fmt = (t) => {
    if (t == null) {
      return "Unknown";
    }
    const d = new Date(t);
    return `${d.toLocaleString()}.${String(d.getMilliseconds()).padStart(3, "0")}`;
  };

  // --- Render clickable node link ---
  const renderNodeLink = (id) => (
    <a
      href="/#"
      onClick={(e) => {
        e.preventDefault();
        window.history.pushState({ idNodo: id }, "", `#${id}`);
        onHighlightNode(id);
      }}
      className="log-node-link"
    >
      {id}
    </a>
  );

  // --- Build collapsed event list for display ---
  const displayEvents = useMemo(() => {
    if (!subsetStartTime || !subsetEndTime) return events;

    const before = [];
    const middle = [];
    const after = [];

    for (const ev of events) {
      if (ev.time < subsetStartTime) before.push(ev);
      else if (ev.time > subsetEndTime) after.push(ev);
      else middle.push(ev);
    }

    const output = [];

    if (before.length) {
      output.push(
        ...before.map(ev => ({ ...ev, hiddenGroup: "before" })),
        {
          synthetic: "before",
          count: before.length,
          time: before[before.length - 1].time,
        }
      );
    }

    output.push(...middle);

    if (after.length) {
      output.push(
        {
          synthetic: "after",
          count: after.length,
          time: after[0].time,
        },
        ...after.map(ev => ({ ...ev, hiddenGroup: "after" }))
      );
    }

    return output;
  }, [events, subsetStartTime, subsetEndTime]);

  return (
    <Box id="animationOverviewPanel" className="animation-overview-panel">
      <h3>Activity Log</h3>
      {activityTimeline.length > 0 && (
        <Box className="status-legend">
          <Box className="legend-item">
            <span className="legend-dot active"></span>
            <Text>Active</Text>
          </Box>
          <Box className="legend-item">
            <span className="legend-dot finished"></span>
            <Text>Finished</Text>
          </Box>
          <Box className="legend-item">
            <span className="legend-dot future"></span>
            <Text>Future</Text>
          </Box>
        </Box>
      )}

      <Box className="activity-log" ref={listRef}>
        {events.length === 0 && <Box className="log-empty">No activities</Box>}

        {displayEvents.map((ev, i) => {

          // Synthetic collapsed item
          if (ev.synthetic) {
            const group = ev.synthetic; // 'before' | 'after'
            const isOpen = expandedHidden[group];

            return (
              <Box
                key={`collapsed-${group}`}
                className="log-line collapsed"
                onClick={() =>
                  setExpandedHidden(prev => ({
                    ...prev,
                    [group]: !prev[group],
                  }))
                }
                style={{ cursor: "pointer" }}
              >
                <i
                  className={isOpen ? "bi bi-eye-slash" : "bi bi-eye"}
                  style={{ marginRight: "6px" }}
                ></i>

                <Text className="log-type">
                  {isOpen
                    ? `Hide ${ev.count} logs ${group} subset`
                    : `Show ${ev.count} logs ${group} subset`}
                </Text>
              </Box>
            );
          }

          // Skip hidden events when collapsed
          if (ev.hiddenGroup && !expandedHidden[ev.hiddenGroup]) {
            return null;
          }

          // Normal event item
          const isStart = ev.type === "start";
          const isFinished = finishedIds.has(ev.id);
          const isActive = isStart && activeIds.has(ev.id) && !isFinished;
          const isFuture = !isActive && !isFinished && ev.time > effectiveTime;

          const classes = [
            "log-line",
            isActive && "active",
            isFinished && "finished",
            isFuture && "future",
            // ev.hiddenGroup && "out-of-subset"
          ]
            .filter(Boolean)
            .join(" ");

          return (
            <Box
              key={`${ev.id}-${ev.type}-${ev.time}-${i}`}
              data-type={ev.type}
              className={classes}
              title={`${ev.type.toUpperCase()} • ${ev.id}`}
            >
              <Text className="log-time" style={{ display: "inline-block" }}>{fmt(ev.time)}</Text>
              <Text className="log-type" style={{ display: "inline-block" }}>{ev.type.toUpperCase()}</Text>
              <Text className="log-node" style={{ display: "inline-block" }}>{renderNodeLink(ev.id)}</Text>
            </Box>
          );
        })}
      </Box>

      {/* Timeline chart */}
      {activityTimeline.length > 0 && (
        <Box className="activity-graph">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={activityTimeline}
              margin={{ top: 25, right: 50, left: -25, bottom: 0 }}
            >
              <XAxis
                dataKey="time"
                type="number"
                domain={["auto", "auto"]}
                ticks={[globalMinTime, globalMaxTime]}
                tickFormatter={(t) => {
                  const d = new Date(t);
                  return `${String(d.getHours()).padStart(2, "0")}:${String(
                    d.getMinutes()
                  ).padStart(2, "0")}:${String(d.getSeconds()).padStart(2, "0")}.${String(
                    d.getMilliseconds()
                  ).padStart(3, "0")}`;
                }}
              />
              <YAxis allowDecimals={false} />
              <Tooltip
                labelFormatter={(t) => {
                  const d = new Date(t);
                  return `${String(d.getHours()).padStart(2, "0")}:${String(
                    d.getMinutes()
                  ).padStart(2, "0")}:${String(d.getSeconds()).padStart(2, "0")}.${String(
                    d.getMilliseconds()
                  ).padStart(3, "0")}`;
                }}
                formatter={(val) => [`${val} active`, "Activities"]}
                contentStyle={{
                  backgroundColor: "#374151",
                  border: "1px solid #1f2937",
                  borderRadius: "6px",
                }}
                labelStyle={{
                  color: "#e5e7eb",
                  fontWeight: 600,
                }}
                itemStyle={{
                  color: "#93c5fd",
                }}
              />

              {subsetStartTime != null && subsetEndTime != null && (
                <>
                  <ReferenceArea
                    x1={globalMinTime}
                    x2={Math.max(globalMinTime, subsetStartTime)}
                    fill="#999"
                    opacity={0.15}
                  />
                  <ReferenceArea
                    x1={Math.min(globalMaxTime, subsetEndTime)}
                    x2={globalMaxTime}
                    fill="#999"
                    opacity={0.15}
                  />
                </>
              )}

              <ReferenceArea
                x1={globalMinTime}
                x2={effectiveTime}
                fill="#1a73e8"
                opacity={0.3}
              />
              <ReferenceArea
                x1={effectiveTime}
                x2={globalMaxTime}
                fill="#1a73e8"
                opacity={0.15}
              />

              <Line
                type="monotone"
                dataKey="activeCount"
                stroke="#1a73e8"
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />

              <ReferenceLine
                x={effectiveTime}
                stroke="red"
                strokeDasharray="3 3"
              />
            </LineChart>
          </ResponsiveContainer>
        </Box>
      )}
    </Box>
  );

}
