"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import type { GraphEdge, GraphNode } from "@/lib/graph";

function typeColor(type: GraphNode["type"]): string {
  switch (type) {
    case "task": return "var(--accent)";
    case "capability": return "#7dd3fc";
    case "tool": return "var(--warn)";
    case "entity": return "#c4b5fd";
    default: return "var(--muted)";
  }
}

function nodeRadius(type: GraphNode["type"]): number {
  switch (type) {
    case "task": return 20;
    case "capability": return 15;
    case "tool": return 11;
    case "entity": return 13;
    default: return 11;
  }
}

function typeLabel(type: GraphNode["type"]): string {
  switch (type) {
    case "task": return "task";
    case "capability": return "capability";
    case "tool": return "tool";
    case "entity": return "entity";
    default: return "node";
  }
}

const LEGEND_ITEMS: Array<[string, string]> = [
  ["task", "var(--accent)"],
  ["capability", "#7dd3fc"],
  ["tool", "var(--warn)"],
  ["entity", "#c4b5fd"],
];

export default function PathGraph({ nodes, edges, activePath }: {
  nodes: GraphNode[];
  edges: GraphEdge[];
  activePath: string[];
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svgSize, setSvgSize] = useState({ w: 0, h: 0 });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      const r = el.getBoundingClientRect();
      setSvgSize({ w: Math.max(r.width, 320), h: Math.max(r.height, 260) });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const w = svgSize.w || 640;
  const h = svgSize.h || 280;

  const layout = useMemo(() => computeLayout(nodes, w, h), [nodes, w, h]);
  const nodeById = useMemo(() => new Map(nodes.map((n) => [n.id, n])), [nodes]);

  return (
    <div ref={containerRef} className="w-full h-full min-h-[280px] relative">
      <svg
        width={w}
        height={h}
        className="w-full h-full block"
        style={{ overflow: "visible", display: "block" }}
      >
        <defs>
          <marker
            id="arrow"
            markerWidth="9"
            markerHeight="9"
            refX="8"
            refY="4.5"
            orient="auto-start-reverse"
            markerUnits="strokeWidth"
          >
            <path d="M0,0 L0,9 L9,4.5 z" fill="var(--muted)" />
          </marker>
          <marker
            id="arrow-active"
            markerWidth="9"
            markerHeight="9"
            refX="8"
            refY="4.5"
            orient="auto-start-reverse"
            markerUnits="strokeWidth"
          >
            <path d="M0,0 L0,9 L9,4.5 z" fill="var(--accent)" />
          </marker>
          <filter id="nodeGlow" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Edges - drawn first so they sit behind nodes */}
        {edges.map((e, i) => {
          const isActive = activePath.includes(e.from) && activePath.includes(e.to);
          const from = layout.get(e.from);
          const to = layout.get(e.to);
          if (!from || !to) return null;

          const dx = to.x - from.x;
          const dy = to.y - from.y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          const rFrom = nodeRadius(nodeById.get(e.from)?.type ?? "tool");
          const rTo = nodeRadius(nodeById.get(e.to)?.type ?? "tool");
          const x1 = from.x + (dx / dist) * rFrom;
          const y1 = from.y + (dy / dist) * rFrom;
          const x2 = to.x - (dx / dist) * rTo;
          const y2 = to.y - (dy / dist) * rTo;

          // Slight curve for visual polish
          const midX = (x1 + x2) / 2;
          const midY = (y1 + y2) / 2;
          const perpX = -dy / dist;
          const perpY = dx / dist;
          const curve = Math.min(dist * 0.12, 24);
          const cpX = midX + perpX * curve;
          const cpY = midY + perpY * curve;

          return (
            <path
              key={`e-${i}`}
              d={`M${x1},${y1} Q${cpX},${cpY} ${x2},${y2}`}
              fill="none"
              stroke={isActive ? "var(--accent)" : "var(--line)"}
              strokeWidth={isActive ? 2.5 : 1}
              strokeOpacity={isActive ? 1 : 0.3}
              marker-end={isActive ? "url(#arrow-active)" : "url(#arrow)"}
              className={isActive ? "path-lit" : ""}
            />
          );
        })}

        {/* Nodes */}
        {nodes.map((n) => {
          const isActive = activePath.includes(n.id);
          const { x, y } = layout.get(n.id) ?? { x: 0, y: 0 };
          const r = nodeRadius(n.type);
          const col = typeColor(n.type);
          const loaded = n.loaded;

          return (
            <g key={n.id}>
              {/* Subtle ring for inactive nodes */}
              {!isActive && !loaded && (
                <circle
                  cx={x}
                  cy={y}
                  r={r + 4}
                  fill="none"
                  stroke="var(--line)"
                  strokeWidth={1}
                  strokeOpacity={0.25}
                />
              )}
              <circle
                cx={x}
                cy={y}
                r={r}
                fill={isActive ? col : loaded ? "var(--surface-lift)" : "var(--bg)"}
                stroke={isActive ? col : loaded ? "var(--line)" : "var(--line)"}
                strokeWidth={isActive ? 3 : loaded ? 1.5 : 1}
                filter={isActive ? "url(#nodeGlow)" : undefined}
                style={{
                  transition: "all 450ms cubic-bezier(0.25, 1, 0.5, 1)",
                  opacity: loaded || isActive ? 1 : 0.45,
                }}
              />
              <text
                x={x}
                y={y + 4}
                textAnchor="middle"
                fill={isActive ? "#0b0c0e" : loaded ? "var(--text)" : "var(--text-dim)"}
                fontSize={n.type === "task" ? 11 : n.type === "capability" ? 9 : 7.5}
                fontFamily="var(--font-display)"
                fontWeight={isActive ? 700 : loaded ? 600 : 500}
                letterSpacing="-0.02em"
                pointerEvents="none"
                style={{
                  transition: "all 450ms cubic-bezier(0.25, 1, 0.5, 1)",
                }}
              >
                {n.label}
              </text>
              <text
                x={x}
                y={y + r + 12}
                textAnchor="middle"
                fill={loaded || isActive ? "var(--text-dim)" : "var(--muted)"}
                fontSize={7}
                fontFamily="var(--font-mono)"
                fontWeight={500}
                pointerEvents="none"
                style={{ opacity: loaded || isActive ? 0.9 : 0.5 }}
              >
                [{typeLabel(n.type)}]
              </text>
            </g>
          );
        })}
      </svg>

      {/* Legend */}
      <div className="absolute bottom-3 left-3 flex gap-3 text-xs text-muted">
        {LEGEND_ITEMS.map(([type, color]) => (
          <span key={type} className="flex items-center gap-1.5">
            <span
              className="w-2 h-2 rounded-full"
              style={{ background: color }}
            />
            {type}
          </span>
        ))}
      </div>
    </div>
  );
}

function computeLayout(nodes: GraphNode[], w: number, h: number): Map<string, { x: number; y: number }> {
  const layout = new Map<string, { x: number; y: number }>();

  const task = nodes.find((n) => n.type === "task");
  const entities = nodes.filter((n) => n.type === "entity");
  const capabilities = nodes.filter((n) => n.type === "capability");
  const tools = nodes.filter((n) => n.type === "tool");

  if (task) layout.set(task.id, { x: w * 0.5, y: h * 0.16 });

  entities.forEach((n, i) => {
    layout.set(n.id, { x: w * (0.16 + i * 0.21), y: h * 0.34 });
  });

  capabilities.forEach((n, i) => {
    layout.set(n.id, { x: w * (0.09 + i * 0.16), y: h * 0.56 });
  });

  const cols = 8;
  const toolW = w * 0.86;
  const toolStartX = w * 0.07;
  const toolStepX = toolW / cols;
  const toolStartY = h * 0.76;
  const toolStepY = h * 0.15;

  tools.forEach((n, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    layout.set(n.id, { x: toolStartX + col * toolStepX, y: toolStartY + row * toolStepY });
  });

  return layout;
}
