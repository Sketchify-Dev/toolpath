import Link from "next/link";
import LogoMark from "./components/logo";
import Rise from "./components/rise";
import PathGraph from "./components/path-graph";
import type { GraphNode, GraphEdge } from "@/lib/graph";

const PROOFS = [
  { value: "1,800", unit: "tokens", note: "vs 12,400 preloaded" },
  { value: "3", unit: "tools", note: "vs 40 in context" },
  { value: "1", unit: "round trip", note: "algo.MSpaths, not fan-out" },
  { value: "0", unit: "refetches", note: "entities reused on follow-up" },
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
    body: "Three tool schemas enter context. Resolved entities persist on TaskRun edges, so follow-up queries reuse them with zero refetch.",
    code: "MATCH (r)-[:RESOLVED]->(e)",
  },
];

const PATH: GraphNode[] = [
  { id: "task:run", label: "Task", type: "task", degree: 3, loaded: true },
  { id: "cap:repo", label: "repos", type: "capability", degree: 5, loaded: true },
  { id: "cap:pr", label: "pull requests", type: "capability", degree: 10, loaded: true },
  { id: "cap:issue", label: "issues", type: "capability", degree: 9, loaded: true },
  { id: "tool:repo_resolve", label: "repo_resolve", type: "tool", degree: 5, loaded: true },
  { id: "tool:pr_read", label: "pr_read", type: "tool", degree: 5, loaded: true },
  { id: "tool:issue_create", label: "issue_create", type: "tool", degree: 5, loaded: true },
];

const EDGES: GraphEdge[] = [
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
    a: "No. With HYDRA_URL unset the app serves a recorded run from the seeded tool graph, same UI and same numbers. Set one env var and /api/health flips to live.",
  },
  {
    q: "Where do the token numbers come from?",
    a: "From the runner, not estimates. Baseline loads all 40 schemas at measured sizes, toolpath loads only the traversed tools plus entity and round trip overhead. Hit /api/compare to see the raw JSON.",
  },
  {
    q: "What is actually stored in the graph?",
    a: "Tool nodes with cost and latency, Capability nodes, PROVIDES edges, plus USED and RESOLVED edges written per run. POST /api/seed writes it with MERGE only, so reseeding is idempotent.",
  },
  {
    q: "Who is this for?",
    a: "Teams whose agents carry large tool catalogs: MCP servers, internal skills, platform APIs. If your system prompt lists tools the task never calls, that context has a graph path behind it here.",
  },
];

export default function Home() {
  return (
    <div className="flex min-h-full flex-col relative overflow-hidden">
      {/* Background grid */}
      <div className="fixed inset-0 -z-10 grid-bg opacity-30 pointer-events-none" />

      <header
        className="sticky top-0 z-50 border-b"
        style={{
          borderColor: "var(--line)",
          background: "color-mix(in srgb, var(--bg) 75%, transparent)",
          backdropFilter: "blur(14px)",
          WebkitBackdropFilter: "blur(14px)",
        }}
      >
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-6 py-3 sm:px-8">
          <Link href="/" className="flex min-h-[44px] items-center gap-2.5" aria-label="Toolpath home">
            <LogoMark />
            <span
              className="text-lg font-bold tracking-tight"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Toolpath
            </span>
          </Link>
          <nav className="hidden items-center gap-6 text-sm sm:flex" style={{ color: "var(--muted)" }}>
            <Link href="/demo" className="hover:text-[var(--text)] transition-colors">Demo</Link>
            <Link href="/privacy" className="hover:text-[var(--text)] transition-colors">Privacy</Link>
            <a
              href="https://github.com/Sketchify-Dev/toolpath"
              className="hover:text-[var(--text)] transition-colors"
            >
              GitHub
            </a>
          </nav>
          <Link
            href="/demo"
            className="btn btn-primary shrink-0"
          >
            Open the demo
          </Link>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-16 px-6 pb-24 pt-12 sm:px-8 lg:px-10">

        {/* Hero */}
        <section className="relative mt-4">
          <Rise>
            <div className="inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-semibold" style={{ borderColor: "var(--line)", color: "var(--muted)" }}>
              <span className="inline-block h-2 w-2 rounded-full pulse-glow" style={{ background: "var(--accent)" }} />
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
            <div className="mt-10 flex flex-wrap items-center gap-5">
              <Link
                href="/demo"
                className="btn btn-primary"
              >
                Run the live demo
              </Link>
              <Link
                href="https://github.com/Sketchify-Dev/toolpath"
                className="btn btn-outline-light"
              >
                Read the code
              </Link>
            </div>
            <div className="mt-12 grid gap-6 sm:grid-cols-4 text-left">
              {PROOFS.map((p) => (
                <div key={p.unit} className="card p-6">
                  <p className="demo-num text-4xl font-bold counter" style={{ fontFamily: "var(--font-num)" }}>
                    {p.value}
                  </p>
                  <p className="mt-2 text-sm font-semibold">{p.unit}</p>
                  <p className="mt-1 text-xs opacity-70">{p.note}</p>
                </div>
              ))}
            </div>
          </Rise>

          <div className="mt-16 relative">
            <Rise index={1}>
              <div className="glass p-8 rounded-3xl border">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-10 h-10 rounded-2xl bg-surface flex items-center justify-center" style={{ border: "1px solid var(--line)" }}>
                    <span className="text-accent font-bold" style={{ fontFamily: "var(--font-display)" }}>G</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold" style={{ color: "var(--text)" }}>Live graph traversal</p>
                    <p className="text-xs text-dim">Watch the path light up in real time</p>
                  </div>
                </div>
                <PathGraph nodes={PATH} edges={EDGES} activePath={ACTIVE_PATH} />
              </div>
            </Rise>
          </div>
        </section>

        {/* How it works */}
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
            <Link
              href="/demo"
              className="btn btn-ghost"
            >
              See the traversal
            </Link>
          </div>
          <div className="grid gap-8 lg:grid-cols-3">
            {STEPS.map((s, i) => (
              <Rise key={s.title} index={i}>
                <div className="card p-8 hover:border-[var(--line-hover)] transition-colors group">
                  <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center mb-5 text-accent-hover font-bold text-lg" style={{ color: "#0b0c0e" }}>
                    {s.n}
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
              </Rise>
            ))}
          </div>
        </section>

        {/* Proof metrics */}
        <section className="border-y border-[var(--line)] py-16">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {PROOFS.map((p) => (
              <div key={p.unit} className="card-light p-8 text-center">
                <p className="demo-num text-5xl font-bold counter" style={{ fontFamily: "var(--font-num)" }}>
                  {p.value}
                </p>
                <p className="mt-3 text-sm font-semibold">{p.unit}</p>
                <p className="mt-1 text-xs opacity-60">{p.note}</p>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section>
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl font-bold tracking-tight mb-10" style={{ fontFamily: "var(--font-display)" }}>
              Questions judges ask
            </h2>
            <div className="grid gap-5 lg:grid-cols-2">
              {FAQS.map((f, i) => (
                <Rise key={f.q} index={i}>
                  <div className="card p-7 hover:border-[var(--line-hover)] transition-colors">
                    <p className="text-base font-semibold mb-3">{f.q}</p>
                    <p className="leading-7" style={{ color: "var(--text-dim)" }}>{f.a}</p>
                  </div>
                </Rise>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="relative overflow-hidden">
          <div
            className="flex flex-col items-start justify-between gap-8 rounded-[32px] p-10 sm:flex-row sm:items-center sm:p-14 relative z-10"
            style={{
              background: "linear-gradient(135deg, var(--accent) 0%, #b8e62e 100%)",
              color: "#0b0c0e",
            }}
          >
            <div className="max-w-2xl">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4" style={{ fontFamily: "var(--font-display)" }}>
                See the traversal light up.
              </h2>
              <p className="text-lg leading-7 opacity-90 max-w-xl">
                Sixty seconds: run the task, watch baseline lose, ask the follow-up
                with zero refetch, then break the tie on an ambiguous entity.
              </p>
            </div>
            <Link href="/demo" className="btn btn-primary shrink-0">
              Open the demo
            </Link>
          </div>
          <div className="absolute inset-0 -z-10 opacity-30" style={{ background: "radial-gradient(circle at 80% 20%, rgba(198,242,78,0.2), transparent 50%)" }} />
        </section>

      </main>

      <footer className="border-t mt-auto border-[var(--line)]">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-5 px-6 py-12 text-sm sm:flex-row sm:items-center sm:justify-between lg:px-10" style={{ color: "var(--muted)" }}>
          <div className="flex items-center gap-2.5">
            <LogoMark size={24} />
            <span>Toolpath for the HydraDB Hackathon, Track 2.</span>
          </div>
          <nav className="flex flex-wrap gap-6">
            <Link href="/demo" className="hover:text-[var(--text)] transition-colors">Demo</Link>
            <Link href="/about" className="hover:text-[var(--text)] transition-colors">About</Link>
            <Link href="/privacy" className="hover:text-[var(--text)] transition-colors">Privacy</Link>
            <Link href="/sitemap.xml" className="hover:text-[var(--text)] transition-colors">Sitemap</Link>
            <Link href="/llms.txt" className="hover:text-[var(--text)] transition-colors">llms.txt</Link>
            <a href="https://github.com/Sketchify-Dev/toolpath" className="hover:text-[var(--text)] transition-colors">GitHub</a>
          </nav>
        </div>
      </footer>

      <Link
        href="/demo"
        className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full px-8 py-3.5 text-sm font-semibold text-black shadow-[0_10px_30px_rgba(0,0,0,0.4)] sm:hidden"
        style={{ background: "var(--accent)" }}
      >
        Open the demo
      </Link>
    </div>
  );
}
