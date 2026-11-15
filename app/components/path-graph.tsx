"use client";

import { useEffect, useState, useRef } from "react";
import type { GraphEdge, GraphNode } from "@/lib/graph";

const PATH_ORDER = ["task", "capability", "tool", "entity"] as const;

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
    case "task": return 18;
    case "capability": return 14;
    case "tool": return 10;
    case "entity": return 12;
    default: return 10;
  }
}

export default function PathGraph({ nodes, edges, activePath }: {
  nodes: GraphNode[];
  edges: GraphEdge[];
  activePath: string[];
}) {
  const [svgSize, setSvgSize] = useState({ w: 0, h: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      const r = el.getBoundingClientRect();
      setSvgSize({ w: r.width, h: r.height });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const nodeById = new Map(nodes.map((n) => [n.id, n]));

  useEffect(() => {
    const r = containerRef.current?.getBoundingClientRect();
    if (r) setSvgSize({ w: r.width, h: r.height });
  }, []);

  const w = svgSize.w || 700;
  const h = svgSize.h || 360;

  const layout = computeLayout(nodes, w, h);

  return (
    <div ref={containerRef} className="w-full h-full min-h-[360px]">
      <svg
        width={w}
        height={h}
        className="w-full h-full block"
        style={{ overflow: "visible" }}
      >
        <defs>
          <marker
            id="arrow"
            markerWidth="8"
            markerHeight="8"
            refX="7"
            refY="3"
            orient="auto"
            markerUnits="strokeWidth"
          >
            <path d="M0,0 L0,6 L6,3 z" fill="var(--muted)" />
          </marker>
          <marker
            id="arrow-active"
            markerWidth="8"
            markerHeight="8"
            refX="7"
            refY="3"
            orient="auto"
            markerUnits="strokeWidth"
          >
            <path d="M0,0 L0,6 L6,3 z" fill="var(--accent)" />
          </marker>
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          <linearGradient id="edge-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--muted)" />
            <stop offset="100%" stopColor="var(--line)" />
          </linearGradient>
        </defs>

        {/* Edges */}
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

          return (
            <line
              key={`e-${i}`}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke={isActive ? "var(--accent)" : "var(--line)"}
              strokeWidth={isActive ? 3 : 1.5}
              strokeOpacity={isActive ? 1 : 0.35}
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

          return (
            <g key={n.id} className={isActive ? "rise-in" : ""} style={{ animationDelay: `${Math.min(activePath.indexOf(n.id), 4) * 90}ms` }}>
              <circle
                cx={x}
                cy={y}
                r={r}
                fill={isActive ? col : "var(--surface-lift)"}
                stroke={isActive ? col : "var(--line)"}
                strokeWidth={isActive ? 3 : 1.5}
                filter={isActive ? "url(#glow)" : undefined}
                style={{ transition: "all 400ms cubic-bezier(0.25, 1, 0.5, 1)" }}
              />
              <text
                x={x}
                y={y + 4}
                textAnchor="middle"
                fill={isActive ? "#0b0c0e" : "var(--text-dim)"}
                fontSize={n.type === "task" ? 11 : n.type === "capability" ? 9 : 8}
                fontFamily="var(--font-display)"
                fontWeight={isActive ? 700 : 500}
                letterSpacing="-0.01em"
                pointerEvents="none"
              >
                {n.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

function computeLayout(nodes: GraphNode[], w: number, h: number): Map<string, { x: number; y: number }> {
  const layout = new Map<string, { x: number; y: number }>();

  const task = nodes.find((n) => n.type === "task");
  const entities = nodes.filter((n) => n.type === "entity");
  const capabilities = nodes.filter((n) => n.type === "capability");
  const tools = nodes.filter((n) => n.type === "tool");

  if (task) layout.set(task.id, { x: w * 0.5, y: h * 0.14 });

  entities.forEach((n, i) => {
    layout.set(n.id, { x: w * (0.18 + i * 0.22), y: h * 0.30 });
  });

  capabilities.forEach((n, i) => {
    layout.set(n.id, { x: w * (0.08 + i * 0.17), y: h * 0.52 });
  });

  const cols = 8;
  const toolW = w * 0.88;
  const toolStartX = w * 0.06;
  const toolStepX = toolW / cols;
  const toolStartY = h * 0.72;
  const toolStepY = h * 0.13;

  tools.forEach((n, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    layout.set(n.id, { x: toolStartX + col * toolStepX, y: toolStartY + row * toolStepY });
  });

  return layout;
}
