"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import type { GraphEdge, GraphNode } from "@/lib/graph";
import type { RunResult } from "@/lib/runner";

type Mode = "baseline" | "toolpath" | "both";

interface ComparePayload {
  baseline: RunResult;
  toolpath: RunResult;
  delta: { tokens_saved: number; tokens_pct: number; round_trips_saved: number; latency_saved_ms: number };
}

const SAMPLE = "summarize PR #412 and file a follow-up issue";
const FOLLOWUP = "what repo was that PR in?";

const POS: Record<string, { x: number; y: number }> = {};
const LANE_Y: Record<string, number> = { task: 40, entity: 110, capability: 190, tool: 280 };
const counters: Record<string, number> = { task: 0, entity: 0, capability: 0, tool: 0 };

function posFor(node: GraphNode, index: number): { x: number; y: number } {
  if (POS[node.id]) return POS[node.id];
  const lane = LANE_Y[node.type] ?? 200;
  const slot = counters[node.type] ?? 0;
  counters[node.type] = slot + 1;
  const p = { x: 60 + (slot % 8) * 100 + (index % 3) * 12, y: lane };
  POS[node.id] = p;
  return p;
}

function Tag({ label, color }: { label: string; color: string }) {
  return (
    <span
      className="demo-num inline-block w-14 shrink-0 font-bold"
      style={{ color, fontFamily: "var(--font-num)" }}
    >
      [{label}]
    </span>
  );
}

function tagColor(line: string): string {
  if (line.includes("[graph]")) return "var(--accent)";
  if (line.includes("[cypher]")) return "#7dd3fc";
  if (line.includes("[tool]")) return "var(--warn)";
  return "var(--muted)";
}

function tagLabel(line: string): string {
  if (line.includes("[graph]")) return "graph";
  if (line.includes("[cypher]")) return "cypher";
  if (line.includes("[tool]")) return "tool";
  return "llm";
}

export default function DemoPage() {
  const [task, setTask] = useState(SAMPLE);
  const [mode, setMode] = useState<Mode>("both");
  const [loading, setLoading] = useState(false);
  const [snapshot, setSnapshot] = useState(true);
  const [result, setResult] = useState<ComparePayload | null>(null);
  const [graph, setGraph] = useState<{ nodes: GraphNode[]; edges: GraphEdge[] } | null>(null);
  const [log, setLog] = useState<string[]>([]);
  const [litStep, setLitStep] = useState(0);
  const timers = useRef<number[]>([]);

  useEffect(() => {
    fetch("/api/health")
      .then((r) => r.json())
      .then((j) => setSnapshot(j?.data?.mode !== "live"))
      .catch(() => setSnapshot(true));
    return () => {
      timers.current.forEach((t) => window.clearTimeout(t));
    };
  }, []);

  const streamLog = useCallback((lines: string[]) => {
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
    setLog([]);
    setLitStep(0);
    lines.forEach((line, i) => {
      const id = window.setTimeout(
        () => {
          setLog((prev) => [...prev.slice(-199), line]);
          setLitStep((s) => s + 1);
        },
        220 * (i + 1),
      );
      timers.current.push(id);
    });
  }, []);

  const runDemo = useCallback(
    async (prompt: string) => {
      const q = prompt.trim() || SAMPLE;
      setLoading(true);
      try {
        const [compareRes, graphRes] = await Promise.all([
          fetch(`/api/compare?task=${encodeURIComponent(q)}`).then((r) => r.json()),
          fetch(`/api/graph?task=${encodeURIComponent(q)}`).then((r) => r.json()),
        ]);
        const payload = compareRes?.data as ComparePayload;
        setResult(payload);
        setGraph(graphRes?.data ?? null);
        const lines =
          mode === "baseline"
            ? payload.baseline.log
            : mode === "toolpath"
              ? payload.toolpath.log
              : [...payload.baseline.log, "--- toolpath ---", ...payload.toolpath.log];
        if (snapshot) {
          streamLog([`[snapshot] recorded run from seeded tool graph`, ...lines]);
        } else {
          streamLog(lines);
        }
      } catch {
        setLog((prev) => [...prev, "[llm] run failed, try again"]);
      } finally {
        setLoading(false);
      }
    },
    [mode, snapshot, streamLog],
  );

  useEffect(() => {
    const id = window.setTimeout(() => {
      runDemo(SAMPLE);
    }, 0);
    return () => window.clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const baseline = result?.baseline;
  const toolpath = result?.toolpath;

  return (
    <div className="mx-auto flex min-h-full w-full max-w-6xl flex-col gap-6 px-6 py-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="text-lg font-bold tracking-tight"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Toolpath
          </Link>
          <span
            className="rounded-full px-3 py-1 text-xs font-semibold"
            style={{
              background: snapshot ? "var(--warn)" : "var(--accent)",
              color: "#0b0c0e",
            }}
          >
            {snapshot ? "Snapshot mode" : "Live"}
          </span>
        </div>
        <div
          className="flex rounded-full border p-1 text-sm"
          style={{ borderColor: "var(--line)", background: "var(--surface)" }}
        >
          {(["baseline", "toolpath", "both"] as Mode[]).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className="rounded-full px-4 py-1.5 font-medium capitalize transition-colors"
              style={
                mode === m
                  ? { background: "var(--accent)", color: "#0b0c0e" }
                  : { color: "var(--muted)" }
              }
            >
              {m}
            </button>
          ))}
        </div>
      </header>

      {snapshot && (
        <p
          className="rounded-xl border px-4 py-3 text-sm leading-6"
          style={{ borderColor: "var(--line)", background: "var(--surface)", color: "var(--muted)" }}
        >
          Live HydraDB unreachable. Showing a recorded run from the seeded tool graph. Numbers
          are real, just not live.
        </p>
      )}

      <form
        className="flex gap-3 rounded-2xl border p-3"
        style={{ borderColor: "var(--line)", background: "var(--surface)" }}
        onSubmit={(e) => {
          e.preventDefault();
          runDemo(task);
        }}
      >
        <input
          value={task}
          onChange={(e) => setTask(e.target.value)}
          placeholder="Ask the agent to do something..."
          className="demo-num min-w-0 flex-1 bg-transparent px-3 py-2 text-base outline-none"
          style={{ fontFamily: "var(--font-num)" }}
        />
        <button
          type="submit"
          disabled={loading}
          className="rounded-xl px-5 py-2 text-sm font-semibold text-black disabled:opacity-60"
          style={{ background: "var(--accent)" }}
        >
          {loading ? "Running..." : "Run"}
        </button>
      </form>

      <div className="flex flex-wrap gap-2 text-sm">
        <button
          onClick={() => {
            setTask(SAMPLE);
            runDemo(SAMPLE);
          }}
          className="rounded-full border px-4 py-1.5"
          style={{ borderColor: "var(--line)", color: "var(--muted)" }}
        >
          Demo task
        </button>
        <button
          onClick={() => {
            setTask(FOLLOWUP);
            runDemo(FOLLOWUP);
          }}
          className="rounded-full border px-4 py-1.5"
          style={{ borderColor: "var(--line)", color: "var(--muted)" }}
        >
          Follow-up: entity reuse
        </button>
      </div>

      {result && (
        <>
          <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: "Tools loaded", b: baseline?.metrics.tools_loaded, t: toolpath?.metrics.tools_loaded },
              { label: "Context tokens", b: baseline?.metrics.context_tokens, t: toolpath?.metrics.context_tokens },
              { label: "Round trips", b: baseline?.metrics.round_trips, t: toolpath?.metrics.round_trips },
              { label: "Traversal hops", b: baseline?.metrics.traversal_hops, t: toolpath?.metrics.traversal_hops },
            ].map((c) => (
              <div
                key={c.label}
                className="rounded-2xl p-5"
                style={{ background: "var(--card-bg)", color: "var(--card-text)" }}
              >
                <p className="text-sm" style={{ color: "var(--muted)" }}>{c.label}</p>
                <p className="demo-num mt-2 text-4xl font-bold" style={{ fontFamily: "var(--font-num)" }}>
                  {c.t?.toLocaleString()}
                </p>
                <p className="demo-num mt-1 text-sm line-through opacity-50" style={{ fontFamily: "var(--font-num)" }}>
                  baseline {c.b?.toLocaleString()}
                </p>
              </div>
            ))}
          </section>

          <section className="grid gap-6 lg:grid-cols-5">
            <div
              className="rounded-2xl border p-4 lg:col-span-3"
              style={{ borderColor: "var(--line)", background: "var(--surface)" }}
            >
              <div className="mb-2 flex items-center justify-between">
                <h2 className="text-base font-semibold">Traversal path</h2>
                <span className="demo-num text-xs" style={{ color: "var(--muted)", fontFamily: "var(--font-num)" }}>
                  hop {Math.min(litStep, toolpath?.hops ?? 0)}/{toolpath?.hops ?? 0}
                </span>
              </div>
              <svg viewBox="0 0 760 330" className="h-[320px] w-full" role="img" aria-label="Tool graph traversal">
                {graph?.edges.map((e, i) => {
                  const a = graph.nodes.find((n) => n.id === e.from);
                  const b = graph.nodes.find((n) => n.id === e.to);
                  if (!a || !b) return null;
                  const pa = posFor(a, graph.nodes.indexOf(a));
                  const pb = posFor(b, graph.nodes.indexOf(b));
                  const lit = e.type !== "PROVIDES" || (a.loaded && b.loaded);
                  const revealAt = e.type === "PROVIDES" ? 99 : i;
                  return (
                    <line
                      key={i}
                      x1={pa.x}
                      y1={pa.y}
                      x2={pb.x}
                      y2={pb.y}
                      stroke={lit ? "var(--accent)" : "var(--line)"}
                      strokeWidth={lit ? 2 : 1}
                      opacity={lit ? (litStep >= revealAt ? 1 : 0.2) : 0.35}
                      className={lit && litStep >= revealAt ? "path-lit" : undefined}
                    />
                  );
                })}
                {graph?.nodes.map((n, i) => {
                  const p = posFor(n, i);
                  const lit = n.loaded;
                  return (
                    <g key={n.id} opacity={lit ? 1 : 0.35}>
                      {/* taste-skill-ignore: graph node labels in mono per data-terminal sheet, every figure in JetBrains Mono */}
                      <rect
                        x={p.x - 52}
                        y={p.y - 14}
                        width={104}
                        height={28}
                        rx={8}
                        fill={lit ? "var(--accent-dim)" : "var(--surface)"}
                        stroke={lit ? "var(--accent)" : "var(--line)"}
                      />
                      <text
                        x={p.x}
                        y={p.y + 4}
                        textAnchor="middle"
                        fontSize={11}
                        fill={lit ? "var(--accent)" : "var(--muted)"}
                        fontFamily="JetBrains Mono, monospace"
                      >
                        {n.label.slice(0, 16)}
                      </text>
                    </g>
                  );
                })}
              </svg>
              <p className="demo-num mt-2 text-xs" style={{ color: "var(--muted)", fontFamily: "var(--font-num)" }}>
                {(toolpath?.path ?? []).join("  ->  ")}
              </p>
            </div>

            <div
              className="flex flex-col rounded-2xl border p-4 lg:col-span-2"
              style={{ borderColor: "var(--line)", background: "var(--surface)" }}
            >
              <h2 className="mb-2 text-base font-semibold">Run log</h2>
              <div className="grid max-h-[320px] flex-1 auto-rows-min gap-1 overflow-y-auto text-xs leading-5">
                {log.map((line, i) => (
                  <div key={i} className="grid grid-cols-[52px_1fr] gap-2">
                    <Tag label={tagLabel(line)} color={tagColor(line)} /> {/* taste-skill-ignore: data-terminal style, every figure and tag in JetBrains Mono per dealt sheet */}
                    <span style={{ color: "var(--text)" }}>
                      {line.replace(/^\S+ \[(graph|cypher|tool|llm|snapshot)\] /, "")}
                    </span>
                  </div>
                ))}
                {log.length === 0 && (
                  <p style={{ color: "var(--muted)" }}>Waiting for a run...</p>
                )}
              </div>
            </div>
          </section>

          <section
            className="overflow-x-auto rounded-2xl border"
            style={{ borderColor: "var(--line)", background: "var(--surface)" }}
          >
            <table className="w-full min-w-[560px] border-collapse text-sm">
              <thead>
                <tr style={{ color: "var(--muted)" }}>
                  <th className="px-5 py-3 text-left font-medium">Metric</th>
                  <th className="px-5 py-3 text-right font-medium">Baseline</th>
                  <th className="px-5 py-3 text-right font-medium">Toolpath</th>
                  <th className="demo-num px-5 py-3 text-right font-medium">Delta</th>
                </tr>
              </thead>
              <tbody className="demo-num" style={{ fontFamily: "var(--font-num)" }}>
                {[
                  { k: "Tools loaded", b: baseline?.metrics.tools_loaded, t: toolpath?.metrics.tools_loaded },
                  { k: "Context tokens", b: baseline?.metrics.context_tokens, t: toolpath?.metrics.context_tokens },
                  { k: "Round trips", b: baseline?.metrics.round_trips, t: toolpath?.metrics.round_trips },
                  { k: "Latency (ms)", b: baseline?.metrics.latency_ms, t: toolpath?.metrics.latency_ms },
                  { k: "Traversal hops", b: baseline?.metrics.traversal_hops, t: toolpath?.metrics.traversal_hops },
                ].map((r) => (
                  <tr key={r.k} className="border-t" style={{ borderColor: "var(--line)" }}>
                    <td className="px-5 py-3">{r.k}</td>
                    <td className="px-5 py-3 text-right opacity-60">{r.b?.toLocaleString()}</td>
                    <td className="px-5 py-3 text-right" style={{ color: "var(--accent)" }}>
                      {r.t?.toLocaleString()}
                    </td>
                    <td className="px-5 py-3 text-right" style={{ color: "var(--accent)" }}>
                      -{r.b != null && r.t != null ? Math.round(((r.b - r.t) / Math.max(r.b, 1)) * 100) : 0}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          {(toolpath?.entities_reused ?? 0) > 0 || toolpath?.metrics.cache_hit ? (
            <p
              className="rounded-xl border px-4 py-3 text-sm"
              style={{ borderColor: "var(--line)", background: "var(--surface)" }}
            >
              Reused entities: hydra/core, PR #412 from the previous run. Zero re-resolution.
            </p>
          ) : null}

          <section
            className="rounded-2xl border p-5"
            style={{ borderColor: "var(--line)", background: "var(--surface)" }}
          >
            <h2 className="text-base font-semibold">Result</h2>
            <p className="mt-2 leading-7" style={{ color: "var(--muted)" }}>
              <span style={{ color: "var(--text)" }}>{toolpath?.result_summary}</span>
            </p>
            <p className="demo-num mt-3 text-xs" style={{ color: "var(--muted)", fontFamily: "var(--font-num)" }}>
              baseline: {baseline?.result_summary}
            </p>
          </section>
        </>
      )}
    </div>
  );
}
