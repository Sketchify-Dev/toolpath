"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import type { GraphEdge, GraphNode } from "@/lib/graph";
import type { RunResult } from "@/lib/runner";
import LogoMark from "../components/logo";
import PathGraph from "../components/path-graph";

type Mode = "baseline" | "toolpath" | "both";

interface ComparePayload {
  baseline: RunResult;
  toolpath: RunResult;
  delta: { tokens_saved: number; tokens_pct: number; round_trips_saved: number; latency_saved_ms: number };
}

const SAMPLE = "summarize PR #412 and file a follow-up issue";

const METRICS = [
  { k: "Tools loaded", bKey: "tools_loaded", tKey: "tools_loaded", unit: "" },
  { k: "Context tokens", bKey: "context_tokens", tKey: "context_tokens", unit: "" },
  { k: "Round trips", bKey: "round_trips", tKey: "round_trips", unit: "" },
  { k: "Latency (ms)", bKey: "latency_ms", tKey: "latency_ms", unit: "" },
  { k: "Traversal hops", bKey: "traversal_hops", tKey: "traversal_hops", unit: "" },
];

export default function DemoPage() {
  const [task, setTask] = useState(SAMPLE);
  const [mode, setMode] = useState<Mode>("both");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ComparePayload | null>(null);
  const [graph, setGraph] = useState<{ nodes: GraphNode[]; edges: GraphEdge[] } | null>(null);
  const [log, setLog] = useState<string[]>([]);
  const [taskError, setTaskError] = useState<string | null>(null);
  const [litStep, setLitStep] = useState(0);
  const timers = useRef<number[]>([]);

  // The demo always runs in snapshot mode: /api/compare and /api/graph use the
  // local runner, not HydraDB. /api/health reports connectivity separately and
  // never implies the demo executed a live traversal.

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
        160 * (i + 1),
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
        streamLog([`[snapshot] recorded run from seeded tool graph`, ...lines]);
      } catch {
        setLog((prev) => [...prev, "[llm] run failed, try again"]);
      } finally {
        setLoading(false);
      }
    },
    [mode, streamLog],
  );

  useEffect(() => {
    const id = window.setTimeout(() => {
      runDemo(SAMPLE);
    }, 0);
    return () => window.clearTimeout(id);
  }, [runDemo]);

  const baseline = result?.baseline;
  const toolpath = result?.toolpath;

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

  return (
    <div className="flex min-h-full flex-col relative overflow-hidden">
      <div className="fixed inset-0 -z-10 grid-bg opacity-15 pointer-events-none" />

      <header
        className="sticky top-0 z-50 border-b"
        style={{
          borderColor: "var(--line)",
          background: "color-mix(in srgb, var(--bg) 85%, transparent)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
        }}
      >
        <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-4 px-6 py-3 sm:px-8">
          <div className="flex items-center gap-2">
            <Link href="/" className="flex min-h-[44px] items-center gap-2.5" aria-label="Toolpath home">
              <LogoMark size={24} />
              <span className="text-lg font-bold tracking-tight" style={{ fontFamily: "var(--font-display)" }}>
                Toolpath
              </span>
            </Link>
            <span className="rounded-full px-3 py-1 text-xs font-semibold" style={{
              background: "var(--warn)",
              color: "#0B1220",
            }}>
              Snapshot mode (recorded)
            </span>
          </div>
          <div className="flex rounded-full border p-1 text-sm" style={{ borderColor: "var(--line)", background: "var(--surface-lift)" }} role="tablist" aria-label="Run mode">
            {(["baseline", "toolpath", "both"] as Mode[]).map((m) => (
              <button
                key={m}
                role="tab"
                aria-selected={mode === m}
                onClick={() => setMode(m)}
                className="min-h-[44px] rounded-full px-4 py-1.5 font-medium transition-colors"
                style={
                  mode === m
                    ? { background: "var(--accent)", color: "#0B1220" }
                    : { color: "var(--muted)" }
                }
              >
                {m}
              </button>
            ))}
          </div>
          <Link href="/" className="btn btn-ghost shrink-0">
            Back to home
          </Link>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-8 px-6 py-8 sm:px-8 lg:px-10">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl" style={{ color: "var(--text)", fontFamily: "var(--font-display)" }}>
              Agent context layer demo
            </h1>
            <p className="mt-2 text-lg" style={{ color: "var(--text-dim)" }}>
              Run a task and watch Toolpath traverse the graph instead of preloading schemas.
            </p>
          </div>
          <p className="rounded-xl border px-4 py-3 text-sm leading-6 flex-shrink-0" style={{ borderColor: "var(--line)", background: "var(--surface-lift)", color: "var(--text-dim)" }}>
            Snapshot mode: showing a recorded run from the seeded tool graph. Numbers are real,
            just not live. Set HYDRA_URL to enable live HydraDB queries in /api/run.
          </p>
        </div>

        {result === null && !loading && (
          <div className="card p-12 text-center" style={{ color: "var(--text-dim)" }}>
            <p className="text-lg">Ready to run.</p>
            <p className="mt-2 text-sm">The sample run starts automatically. Press 'Run task' to run a different task.</p>
          </div>
        )}

        <form
          className="rounded-2xl border p-3 glass"
          style={{ borderColor: "var(--line)", background: "var(--surface-lift)" }}
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
          <label htmlFor="demo-task" className="block px-1 mb-1 text-sm font-medium" style={{ color: "var(--muted)" }}>
            Task for the agent
          </label>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              id="demo-task"
              value={task}
              onChange={(e) => setTask(e.target.value)}
              className="flex-1 input focus-ring"
              placeholder="e.g. summarize PR #412 and file a follow-up issue"
            />
            <button
              type="submit"
              className="btn btn-primary shrink-0"
              disabled={loading}
            >
              {loading ? "Running..." : "Run task"}
            </button>
          </div>
          {taskError && (
            <p className="mt-3 text-sm" style={{ color: "var(--warn)" }}>
              {taskError}
            </p>
          )}
        </form>

        {result && (
          <>
            <div className="grid gap-8 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <div className="card p-6">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-8 h-8 rounded-lg bg-surface-lift flex items-center justify-center" style={{ border: "1px solid var(--line)" }}>
                      <span className="text-xs font-bold" style={{ color: "var(--accent)", fontFamily: "var(--font-display)" }}>T</span>
                    </div>
                    <h2 className="text-base font-semibold" style={{ fontFamily: "var(--font-display)" }}>
                      Graph traversal
                    </h2>
                    <span className="ml-auto text-xs font-semibold" style={{ color: "var(--text-dim)" }}>
                      {graph?.nodes.length ?? 0} nodes
                    </span>
                  </div>
                  <PathGraph nodes={graph?.nodes ?? []} edges={graph?.edges ?? []} activePath={toolpath?.path ?? []} />
                </div>
              </div>

              <div className="lg:col-span-1">
                <div className="card p-0 overflow-hidden">
                  <div className="border-b border-[var(--line)] bg-surface-lift px-5 py-4">
                    <h2 className="text-sm font-semibold" style={{ fontFamily: "var(--font-display)" }}>
                      Execution log
                    </h2>
                    <p className="text-xs text-dim mt-1">
                      {mode === "both" ? "Baseline then toolpath" : mode === "toolpath" ? "Toolpath run" : "Baseline run"}
                    </p>
                  </div>
                  <div className="p-4 font-mono text-xs leading-5 max-h-[400px] overflow-y-auto" style={{ fontFamily: "var(--font-mono)" }}>
                    {log.map((line, i) => {
                      const isNew = i < litStep;
                      return (
                        <div
                          key={i}
                          className="mb-2 truncate transition-colors"
                          style={{
                            color: isNew ? "var(--text)" : "var(--text-dim)",
                            borderLeft: isNew ? "2px solid var(--accent)" : "2px solid transparent",
                            paddingLeft: isNew ? "0.5rem" : 0,
                          }}
                        >
                          <span style={{ color: tagColor(line) }}>{tagLabel(line)}</span>{" "}
                          <span>{line.slice(line.indexOf("]") + 1).trim()}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            <section className="border-t border-[var(--line)] pt-8">
              <h2 className="text-3xl font-bold tracking-tight mb-8" style={{ fontFamily: "var(--font-display)" }}>
                Baseline versus toolpath
              </h2>
              <div className="grid gap-5 lg:grid-cols-5">
                {METRICS.map((m) => {
                  const b = Number(baseline?.metrics[m.bKey as keyof RunResult["metrics"]] ?? 0);
                  const t = Number(toolpath?.metrics[m.tKey as keyof RunResult["metrics"]] ?? 0);
                  const saved = b - t;
                  const pct = b > 0 ? Math.round((saved / b) * 100) : 0;
                  return (
                    <div key={m.k} className="card-light p-6">
                      <p className="text-sm font-medium">{m.k}</p>
                      <div className="mt-3 flex items-baseline justify-between">
                        <span className="demo-num text-3xl font-bold" style={{ fontFamily: "var(--font-num)" }}>
                          {t.toLocaleString()}
                        </span>
                        <span className="text-xs" style={{ color: "var(--muted)" }}>
                          baseline {b.toLocaleString()} (-{pct}%)
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="mt-6 p-5 rounded-2xl border" style={{ borderColor: "var(--line)", background: "var(--surface-lift)" }}>
                <h3 className="text-sm font-semibold mb-3" style={{ fontFamily: "var(--font-display)" }}>
                  How the numbers are calculated
                </h3>
                <ul className="text-sm space-y-2" style={{ color: "var(--text-dim)" }}>
                  <li>
                    <strong>Tools loaded:</strong> tool schemas hydrated into agent context. Baseline preloads all 40 (30 catalog + 10 ambient platform). Toolpath loads only the traversed tools (3 for this task).
                  </li>
                  <li>
                    <strong>Context tokens:</strong> estimated cost. Schema: 300 tokens per tool. Entity: 200 tokens per resolved entity. Overhead: 100 tokens per round trip. Estimates, not live tokenizer measurements.
                  </li>
                  <li>
                    <strong>Round trips:</strong> tool execution calls. Toolpath makes 1 graph traversal query ({toolpath?.hops} hops via algo.MSpaths) plus {toolpath?.round_trips} tool execution calls. Baseline makes 4 sequential tool calls with no graph traversal.
                  </li>
                  <li>
                    <strong>Traversal hops:</strong> edges crossed in the graph traversal. Toolpath: capability-to-tool edges. Baseline: 0 (no graph used).
                  </li>
                  <li>
                    <strong>Mode:</strong> Snapshot (recorded run from seeded graph). Entity reuse is cached in-session, not durable across server restarts.
                  </li>
                </ul>
              </div>
            </section>

            <div className="mt-8 grid gap-4">
              {(toolpath?.entities_reused ?? 0) > 0 || toolpath?.metrics.cache_hit ? (
                <div className="card p-5">
                  <p className="text-sm leading-6" style={{ color: "var(--text)" }}>
                    Reused entities: hydra/core, PR #412 from the previous run. Zero re-resolution within this session.
                  </p>
                </div>
              ) : null}

              {toolpath?.resolution ? (
                <div className="card p-5">
                  <p className="text-sm leading-6" style={{ color: "var(--text)" }}>
                    Entity tie-break: {toolpath.resolution.candidates} candidates for
                    "Acme", kept{" "}
                    <span className="demo-num" style={{ color: "var(--accent)", fontFamily: "var(--font-num)" }}>
                      {toolpath.resolution.chosen}
                    </span>{" "}
                    by {toolpath.resolution.rule} (highest degree wins). No prompt guessing.
                  </p>
                </div>
              ) : null}

              {toolpath?.degraded ? (
                <div className="card p-5" style={{ borderColor: "var(--warn)" }}>
                  <p className="text-sm leading-6" style={{ color: "var(--text)" }}>
                    No capability matched this task, so the graph fell back to keyword
                    search over tool descriptions and loaded {toolpath.tools_used.length} tools
                    instead of 3. Still less than preloading {baseline?.metrics.tools_loaded}.
                  </p>
                </div>
              ) : null}
            </div>

            <section className="mt-8">
              <div className="card p-7">
                <h2 className="text-base font-semibold mb-4" style={{ fontFamily: "var(--font-display)" }}>
                  Result
                </h2>
                <p className="leading-7" style={{ color: "var(--text)" }}>
                  <span className="font-semibold">{toolpath?.result_summary}</span>
                </p>
                <p className="demo-num mt-4 text-xs" style={{ color: "var(--muted)", fontFamily: "var(--font-num)" }}>
                  baseline: {baseline?.result_summary}
                </p>
              </div>
            </section>
          </>
        )}
      </div>

      <footer className="border-t border-[var(--line)] mt-auto">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-6 py-10 text-sm sm:flex-row sm:items-center sm:justify-between lg:px-10" style={{ color: "var(--muted)" }}>
          <div className="flex min-h-[44px] items-center gap-2.5">
            <LogoMark size={20} />
            <Link href="/" className="inline-flex min-h-[44px] items-center transition-colors hover:text-[var(--text)]">
              Back to Toolpath home
            </Link>
          </div>
          <nav className="flex flex-wrap gap-4">
            <Link href="/privacy" className="hover:text-[var(--text)] transition-colors">Privacy</Link>
            <a href="https://github.com/Sketchify-Dev/toolpath" className="hover:text-[var(--text)] transition-colors">GitHub</a>
          </nav>
        </div>
      </footer>
    </div>
  );
}
