"use client";

import Link from "next/link";
import LogoMark from "./components/logo";
import PathGraph from "./components/path-graph";
import type { GraphNode, GraphEdge } from "@/lib/graph";
import { useState } from "react";

const PROOFS = [
  { value: "1,800", unit: "tokens", note: "vs 12,400 preloaded" },
  { value: "3", unit: "tools", note: "vs 40 in context (30 catalog + 10 ambient)" },
  { value: "1", unit: "graph traversal", note: "algo.MSpaths, not fan-out" },
  { value: "0", unit: "refetches", note: "entities reused in-session" },
];

const STEPS = [
  {
    n: "01",
    title: "Index the catalog",
    body: "Tools, skills, MCP servers, and resolved entities live as HydraDB nodes. Edges say what provides what. One MERGE-only seed writes the graph.",
    code: "MERGE (t:Tool {id: $id})",
  },
  {
    n: "02",
    title: "Ask for the path",
    body: "One algo.MSpaths call resolves task to capability to tools. No fan-out, no preloading forty schemas into context first.",
    code: "CALL algo.MSpaths({...})",
  },
  {
    n: "03",
    title: "Hydrate only the path",
    body: "Three tool schemas enter context. Resolved entities are cached in-session, so follow-up queries reuse them with zero refetch.",
    code: "MATCH (r)-[:RESOLVED]->(e)",
  },
];

const PATH: GraphNode[] = [
  { id: "task:run", label: "Task", type: "task", degree: 3, loaded: true },
  { id: "entity:repo", label: "hydra/core", type: "entity", degree: 9, loaded: true },
  { id: "entity:pr", label: "PR #412", type: "entity", degree: 6, loaded: true },
  { id: "entity:issue", label: "issue #77", type: "entity", degree: 3, loaded: true },
  { id: "cap:repo", label: "repos", type: "capability", degree: 5, loaded: true },
  { id: "cap:pr", label: "pull requests", type: "capability", degree: 10, loaded: true },
  { id: "cap:issue", label: "issues", type: "capability", degree: 9, loaded: true },
  { id: "tool:repo_resolve", label: "repo_resolve", type: "tool", degree: 5, loaded: true },
  { id: "tool:pr_read", label: "pr_read", type: "tool", degree: 5, loaded: true },
  { id: "tool:issue_create", label: "issue_create", type: "tool", degree: 5, loaded: true },
];

const EDGES: GraphEdge[] = [
  { from: "task:run", to: "entity:repo", type: "RESOLVED" },
  { from: "task:run", to: "entity:pr", type: "RESOLVED" },
  { from: "task:run", to: "entity:issue", type: "RESOLVED" },
  { from: "task:run", to: "cap:repo", type: "HAS_CAPABILITY" },
  { from: "task:run", to: "cap:pr", type: "HAS_CAPABILITY" },
  { from: "task:run", to: "cap:issue", type: "HAS_CAPABILITY" },
  { from: "tool:repo_resolve", to: "cap:repo", type: "PROVIDES" },
  { from: "tool:pr_read", to: "cap:pr", type: "PROVIDES" },
  { from: "tool:issue_create", to: "cap:issue", type: "PROVIDES" },
  { from: "task:run", to: "tool:repo_resolve", type: "USED" },
  { from: "task:run", to: "tool:pr_read", type: "USED" },
  { from: "task:run", to: "tool:issue_create", type: "USED" },
];

const ACTIVE_PATH = ["task:run", "cap:repo", "cap:pr", "cap:issue", "tool:repo_resolve", "tool:pr_read", "tool:issue_create"];

const FAQS = [
  {
    q: "Does this need a live HydraDB to demo?",
    a: "No. With HYDRA_URL unset the app serves a recorded run from the seeded tool graph, same UI and same numbers. /api/health reports the snapshot mode and HydraDB connectivity separately; it does not switch the demo to live execution.",
  },
  {
    q: "Where do the token numbers come from?",
    a: "From the runner, using a documented estimate: each tool schema is counted at 300 tokens, each entity at 200 tokens, plus round-trip overhead. These are reproducible estimates, not live tokenizer measurements. Hit /api/compare to see the raw JSON and the calculation.",
  },
  {
    q: "What is actually stored in the graph?",
    a: "Tool nodes with cost and latency, Capability nodes, PROVIDES edges, plus USED and RESOLVED edges written per run. POST /api/seed writes it with MERGE only, so reseeding is idempotent. The demo runs in snapshot mode by default.",
  },
  {
    q: "Do resolved entities persist across restarts?",
    a: "No. Entity reuse is cached in-session (an in-memory Map keyed by demo session), so follow-up queries reuse entities within the same server process. The Map is wiped on restart. There is no durable graph persistence of resolved entities.",
  },
  {
    q: "Who is this for?",
    a: "Teams whose agents carry large tool catalogs: MCP servers, internal skills, platform APIs. If your system prompt lists tools the task never calls, that context has a graph path behind it here.",
  },
];

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);

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
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-6 py-3 sm:px-8">
          <Link href="/" className="flex min-h-[44px] items-center gap-2.5" aria-label="Toolpath home">
            <LogoMark />
            <span className="text-lg font-bold tracking-tight" style={{ fontFamily: "var(--font-display)" }}>
              Toolpath
            </span>
          </Link>

          <div className="hidden items-center gap-6 text-sm sm:flex" style={{ color: "var(--muted)" }}>
            <Link href="/privacy" className="hover:text-[var(--text)] transition-colors">Privacy</Link>
            <a
              href="https://github.com/Sketchify-Dev/toolpath"
              className="hover:text-[var(--text)] transition-colors"
            >
              GitHub
            </a>
          </div>

          <div className="flex items-center gap-3">
            <button
              className="md:hidden inline-flex min-h-[44px] items-center justify-center rounded-full p-2 text-sm hover:bg-[var(--surface-lift)]"
              aria-label="Open menu"
              onClick={() => setMenuOpen((m) => !m)}
            >
              ☰
            </button>
            <Link href="/demo" className="btn btn-primary shrink-0">
              Open the demo
            </Link>
          </div>
        </div>

        {menuOpen && (
          <div className="md:hidden mx-auto w-full max-w-7xl px-6 pb-4 sm:px-8">
            <div className="rounded-xl border p-4" style={{ borderColor: "var(--line)", background: "var(--surface-lift)" }}>
              <nav className="flex flex-col gap-2" style={{ color: "var(--text)" }}>
                <Link href="/demo" className="block min-h-[44px] px-4 py-2 hover:bg-[var(--surface)] hover:text-[var(--accent)] transition-colors">
                  Demo
                </Link>
                <Link href="/privacy" className="block min-h-[44px] px-4 py-2 hover:bg-[var(--surface)] hover:text-[var(--accent)] transition-colors">
                  Privacy
                </Link>
                <a
                  href="https://github.com/Sketchify-Dev/toolpath"
                  className="block min-h-[44px] px-4 py-2 hover:bg-[var(--surface)] hover:text-[var(--accent)] transition-colors"
                >
                  GitHub
                </a>
              </nav>
            </div>
          </div>
        )}
      </header>

      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-16 px-6 pb-24 pt-12 sm:px-8 lg:px-10">
        <section className="relative mt-4">
          <div className="inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-semibold" style={{ borderColor: "var(--line)", color: "var(--muted)" }}>
            <span className="inline-block h-2 w-2 rounded-full" style={{ background: "var(--accent)" }} />
            HydraDB Hackathon, Track 2 - agent context layer
          </div>
          <h1
            className="mt-6 text-5xl font-bold leading-[1.02] tracking-tight sm:text-6xl lg:text-7xl"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Traverse, don&apos;t preload.
          </h1>
          <p className="mt-7 max-w-2xl text-lg leading-8" style={{ color: "var(--text-dim)" }}>
            Agents stuff forty tool schemas into context before the first thought.
            Toolpath walks the tool graph in HydraDB and pulls only the three the
            task needs.
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-4">
            <Link href="/demo" className="btn btn-primary">
              Open the demo
            </Link>
            <Link
              href="https://github.com/Sketchify-Dev/toolpath"
              className="btn btn-ghost"
            >
              Read the code
            </Link>
          </div>

          <div className="mt-16 relative">
            <div className="card p-8 rounded-3xl border">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-10 h-10 rounded-2xl bg-surface-lift flex items-center justify-center" style={{ border: "1px solid var(--line)" }}>
                  <span className="text-accent font-bold" style={{ fontFamily: "var(--font-display)" }}>G</span>
                </div>
                <div>
                  <p className="text-sm font-semibold" style={{ color: "var(--text)" }}>Graph traversal preview</p>
                  <p className="text-xs text-dim">Recorded traversal from the seeded tool graph</p>
                </div>
              </div>
              <PathGraph nodes={PATH} edges={EDGES} activePath={ACTIVE_PATH} />
            </div>
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-4xl font-bold tracking-tight" style={{ fontFamily: "var(--font-display)" }}>
                How it works
              </h2>
              <p className="mt-3 text-lg" style={{ color: "var(--text-dim)" }}>
                Every token in context has a graph path behind it. That makes tool
                selection auditable in a way preloading and vector recall cannot match.
              </p>
            </div>
          </div>
          <div className="grid gap-8 lg:grid-cols-3">
            {STEPS.map((s) => (
              <div key={s.title} className="card p-8 hover:border-[var(--line-hover)] transition-colors group">
                <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center mb-5" style={{ color: "#0B1220" }}>
                  <span className="font-bold text-lg">{s.n}</span>
                </div>
                <h3 className="text-xl font-bold mb-3" style={{ fontFamily: "var(--font-display)" }}>{s.title}</h3>
                <p className="leading-7" style={{ color: "var(--text-dim)" }}>{s.body}</p>
                <div className="mt-6 pt-6 border-t border-[var(--line)]">
                  <p
                    className="demo-num text-sm font-bold"
                    style={{
                      background: "var(--surface-lift)",
                      color: "var(--accent)",
                      fontFamily: "var(--font-num)",
                      padding: "0.5rem 0.75rem",
                      borderRadius: "8px",
                      border: "1px solid var(--line)",
                      display: "inline-block",
                    }}
                  >
                    {s.code}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="border-y border-[var(--line)] py-16">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {PROOFS.map((p) => (
              <div key={p.unit} className="card-light p-8 text-center">
                <p className="demo-num text-5xl font-bold counter" style={{ fontFamily: "var(--font-num)" }}>
                  {p.value}
                </p>
                <p className="mt-3 text-sm font-semibold">{p.unit}</p>
                <p className="mt-1 text-xs font-medium" style={{ color: "var(--muted)" }}>{p.note}</p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl font-bold tracking-tight mb-10" style={{ fontFamily: "var(--font-display)" }}>
              Questions judges ask
            </h2>
            <div className="grid gap-5 lg:grid-cols-2">
              {FAQS.map((f) => (
                <div key={f.q} className="card p-7 hover:border-[var(--line-hover)] transition-colors">
                  <p className="text-base font-semibold mb-3">{f.q}</p>
                  <p className="leading-7" style={{ color: "var(--text-dim)" }}>{f.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-[var(--line)] mt-auto">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-5 px-6 py-12 text-sm sm:flex-row sm:items-center sm:justify-between lg:px-10" style={{ color: "var(--muted)" }}>
          <div className="flex items-center gap-2.5">
            <LogoMark size={22} />
            <span>Toolpath for the HydraDB Hackathon, Track 2.</span>
          </div>
          <nav className="flex flex-wrap gap-6">
            <Link href="/" className="hover:text-[var(--text)] transition-colors">Home</Link>
            <Link href="/demo" className="hover:text-[var(--text)] transition-colors">Demo</Link>
            <Link href="/privacy" className="hover:text-[var(--text)] transition-colors">Privacy</Link>
            <Link href="/about" className="hover:text-[var(--text)] transition-colors">About</Link>
            <a href="https://github.com/Sketchify-Dev/toolpath" className="hover:text-[var(--text)] transition-colors">GitHub</a>
          </nav>
        </div>
      </footer>

      <Link
        href="/demo"
        className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full px-8 py-3.5 text-sm font-semibold text-[#0B1220] shadow-[0_10px_30px_rgba(0,0,0,0.4)] sm:hidden"
        style={{ background: "var(--accent)" }}
      >
        Open the demo
      </Link>
    </div>
  );
}
