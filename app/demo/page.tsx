"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import type { GraphEdge, GraphNode } from "@/lib/graph";
import type { RunResult } from "@/lib/runner";
import LogoMark from "../components/logo";

type Mode = "baseline" | "toolpath" | "both";

interface ComparePayload {
  baseline: RunResult;
  toolpath: RunResult;
  delta: { tokens_saved: number; tokens_pct: number; round_trips_saved: number; latency_saved_ms: number };
}

const SAMPLE = "summarize PR #412 and file a follow-up issue";
const FOLLOWUP = "what repo was that PR in?";

const TOOL_COLS = 9;

function layoutFor(node: GraphNode, idxInType: number): { x: number; y: number } {
  switch (node.type) {
    case "task":
      return { x: 380, y: 40 };
    case "entity":
      return { x: 150 + idxInType * 230, y: 110 };
    case "capability":
      return { x: 70 + idxInType * 124, y: 190 };
    default: {
      const col = idxInType % TOOL_COLS;
      const row = Math.floor(idxInType / TOOL_COLS);
      return { x: 48 + col * 79, y: 262 + row * 46 };
    }
  }
}

const RECT_W: Record<GraphNode["type"], number> = {
  task: 200,
  entity: 130,
  capability: 110,
  tool: 72,
};

const LABEL_LEN: Record<GraphNode["type"], number> = {
  task: 26,
  entity: 16,
  capability: 14,
  tool: 10,
};

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
  const [taskError, setTaskError] = useState<string | null>(null);
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
    <div className="flex min-h-full flex-col">
      <header
        className="sticky top-0 z-40 border-b"
        style={{
          borderColor: "var(--line)",
          background: "color-mix(in srgb, var(--bg) 82%, transparent)",
          backdropFilter: "blur(8px)",
        }}
      >
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3 px-6 py-3">
          <div className="flex items-center gap-2">
            <Link href="/" className="flex min-h-[44px] items-center gap-2.5" aria-label="Toolpath home">
              <LogoMark size={24} />
              <span
                className="text-lg font-bold tracking-tight"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Toolpath
              </span>
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
            role="tablist"
            aria-label="Run mode"
          >
            {(["baseline", "toolpath", "both"] as Mode[]).map((m) => (
              <button
                key={m}
                role="tab"
                aria-selected={mode === m}
                onClick={() => setMode(m)}
                className="min-h-[44px] rounded-full px-4 py-1.5 font-medium capitalize transition-colors"
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
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-6 py-6">
        {snapshot && (
          <p
            className="rounded-xl border px-4 py-3 text-sm leading-6"
            style={{ borderColor: "var(--line)", background: "var(--surface)", color: "var(--muted)" }}
          >
            Live HydraDB unreachable. Showing a recorded run from the seeded tool graph. Numbers
            are real, just not live. Set HYDRA_URL to flip this badge to Live.
          </p>
        )}

        <form
          className="flex flex-col gap-2 rounded-2xl border p-3"
          style={{ borderColor: taskError ? "var(--warn)" : "var(--line)", background: "var(--surface)" }}
          onSubmit={(e) => {
            e.preventDefault();
            if (!task.trim()) {
              setTaskError("Type a task first, for example: summarize PR #412 and file a follow-up issue.");
              return;
            }
            setTaskError(null);
            runDemo(task);
          }}
          noValidate
        >
          <label htmlFor="demo-task" className="px-1 text-sm font-medium" style={{ color: "var(--muted)" }}>
            Task for the agent
          </label>
          <div className="flex gap-3">
            <input
              id="demo-task"
              value={task}
              onChange={(e) => {
                setTask(e.target.value);
                if (taskError && e.target.value.trim()) setTaskError(null);
              }}
              onBlur={() => {
                if (!task.trim()) setTaskError("Type a task first, for example: summarize PR #412 and file a follow-up issue.");
              }}
              placeholder="Ask the agent to do something..."
              aria-invalid={taskError ? true : undefined}
              aria-describedby={taskError ? "demo-task-error" : undefined}
              className="demo-num min-h-[44px] min-w-0 flex-1 bg-transparent px-3 py-2 text-base outline-none disabled:opacity-50"
              style={{ fontFamily: "var(--font-num)" }}
            />
            <button
              type="submit"
              disabled={loading}
              className="inline-flex min-h-[44px] items-center rounded-xl px-6 py-2.5 text-sm font-semibold text-black disabled:cursor-wait disabled:opacity-60"
              style={{ background: "var(--accent)" }}
            >
              {loading ? "Running..." : "Run"}
            </button>
          </div>
          <div aria-live="polite">
            {taskError && (
              <p id="demo-task-error" className="px-1 text-sm" style={{ color: "var(--warn)" }}>
                {taskError}
              </p>
            )}
          </div>
        </form>

          <div className="flex flex-wrap items-center gap-2 text-sm">
          <span style={{ color: "var(--muted)" }}>Try:</span>
          <button
            onClick={() => {
              setTask(SAMPLE);
              runDemo(SAMPLE);
            }}
            className="inline-flex min-h-[44px] items-center rounded-full border px-4 py-1.5 transition-colors hover:border-[var(--accent)]"
            style={{ borderColor: "var(--line)", color: "var(--muted)" }}
          >
            Demo task
          </button>
          <button
            onClick={() => {
              setTask(FOLLOWUP);
              runDemo(FOLLOWUP);
            }}
            className="inline-flex min-h-[44px] items-center rounded-full border px-4 py-1.5 transition-colors hover:border-[var(--accent)]"
            style={{ borderColor: "var(--line)", color: "var(--muted)" }}
          >
            Follow-up: entity reuse
          </button>
        </div>

        {result && (
          <>
            <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" aria-label="Key metrics">
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
                  <p className="text-sm opacity-60">{c.label}</p>
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
                  {(() => {
                    const seen: Record<string, number> = { task: 0, entity: 0, capability: 0, tool: 0 };
                    const at: Record<string, { x: number; y: number }> = {};
                    for (const n of graph?.nodes ?? []) {
                      at[n.id] = layoutFor(n, seen[n.type] ?? 0);
                      seen[n.type] = (seen[n.type] ?? 0) + 1;
                    }
                    return (
                      <>
                        {graph?.edges.map((e, i) => {
                          const a = graph.nodes.find((n) => n.id === e.from);
                          const b = graph.nodes.find((n) => n.id === e.to);
                          if (!a || !b) return null;
                          // Only the lit traversal path gets edges. Unloaded catalog
                          // tools stay as dimmed context with no lines, so the path reads
                          // as a star instead of a hairball.
                          const lit = e.type !== "PROVIDES" || (a.loaded && b.loaded);
                          if (!lit) return null;
                          const pa = at[e.from];
                          const pb = at[e.to];
                          if (!pa || !pb) return null;
                          const revealAt = e.type === "PROVIDES" ? 99 : i;
                          return (
                            <line
                              key={i}
                              x1={pa.x}
                              y1={pa.y}
                              x2={pb.x}
                              y2={pb.y}
                              stroke="var(--accent)"
                              strokeWidth={2}
                              opacity={litStep >= revealAt ? 1 : 0.2}
                              className={litStep >= revealAt ? "path-lit" : undefined}
                            />
                          );
                        })}
                        {graph?.nodes.map((n) => {
                          const p = at[n.id];
                          if (!p) return null;
                          const lit = n.loaded;
                          const w = RECT_W[n.type];
                          return (
                            <g key={n.id} opacity={lit ? 1 : 0.35}>
                              {/* taste-skill-ignore: graph node labels in mono per data-terminal sheet, every figure in JetBrains Mono */}
                              <rect
                                x={p.x - w / 2}
                                y={p.y - 14}
                                width={w}
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
                                fontFamily="JetBrains Mono, monospace" // taste-skill-ignore: dealt data-terminal sheet mandates mono for graph figures
                              >
                                {n.label.slice(0, LABEL_LEN[n.type])}
                              </text>
                            </g>
                          );
                        })}
                      </>
                    );
                  })()}
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
                      <Tag label={tagLabel(line)} color={tagColor(line)} />
                      {/* taste-skill-ignore: run log body in mono per data-terminal sheet, every figure in JetBrains Mono */}
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

            <section aria-label="Baseline versus toolpath comparison">
              <div
                className="hidden overflow-x-auto rounded-2xl border md:block"
                style={{ borderColor: "var(--line)", background: "var(--surface)" }}
              >
                <table className="w-full min-w-[560px] border-collapse text-sm">
                  <thead>
                    <tr style={{ color: "var(--muted)" }}>
                      <th className="px-5 py-3 text-left font-medium" scope="col">Metric</th>
                      <th className="px-5 py-3 text-right font-medium" scope="col">Baseline</th>
                      <th className="px-5 py-3 text-right font-medium" scope="col">Toolpath</th>
                      <th className="demo-num px-5 py-3 text-right font-medium" scope="col">Delta</th>
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
                        <td className="px-5 py-3" scope="row">{r.k}</td>
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
              </div>
              <div className="grid gap-3 md:hidden">
                {[
                  { k: "Tools loaded", b: baseline?.metrics.tools_loaded, t: toolpath?.metrics.tools_loaded },
                  { k: "Context tokens", b: baseline?.metrics.context_tokens, t: toolpath?.metrics.context_tokens },
                  { k: "Round trips", b: baseline?.metrics.round_trips, t: toolpath?.metrics.round_trips },
                  { k: "Latency (ms)", b: baseline?.metrics.latency_ms, t: toolpath?.metrics.latency_ms },
                  { k: "Traversal hops", b: baseline?.metrics.traversal_hops, t: toolpath?.metrics.traversal_hops },
                ].map((r) => (
                  <div
                    key={r.k}
                    className="demo-num rounded-2xl border p-4"
                    style={{ borderColor: "var(--line)", background: "var(--surface)", fontFamily: "var(--font-num)" }}
                  >
                    <p className="text-sm" style={{ color: "var(--muted)", fontFamily: "var(--font-geist-sans)" }}>{r.k}</p>
                    <p className="mt-2 flex items-baseline justify-between">
                      <span className="text-2xl font-bold" style={{ color: "var(--accent)" }}>
                        {r.t?.toLocaleString()}
                      </span>
                      <span className="text-sm" style={{ color: "var(--muted)" }}>
                        baseline {r.b?.toLocaleString()} (-{r.b != null && r.t != null ? Math.round(((r.b - r.t) / Math.max(r.b, 1)) * 100) : 0}%)
                      </span>
                    </p>
                  </div>
                ))}
              </div>
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

      <footer className="border-t" style={{ borderColor: "var(--line)" }}>
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-6 py-6 text-sm sm:flex-row sm:items-center sm:justify-between" style={{ color: "var(--muted)" }}>
          <div className="flex min-h-[44px] items-center gap-2.5">
            <LogoMark size={20} />
            <Link href="/" className="inline-flex min-h-[44px] items-center transition-colors hover:text-[var(--text)]">
              Back to Toolpath home
            </Link>
          </div>
          <nav className="flex flex-wrap gap-1">
            <Link href="/privacy" className="inline-flex min-h-[44px] items-center px-2 transition-colors hover:text-[var(--text)]">Privacy</Link>
            <a href="https://github.com/Sketchify-Dev/toolpath" className="inline-flex min-h-[44px] items-center px-2 transition-colors hover:text-[var(--text)]">GitHub</a>
          </nav>
        </div>
      </footer>
    </div>
  );
}
