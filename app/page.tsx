import Link from "next/link";
import LogoMark from "./components/logo";
import Rise from "./components/rise";

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

const PATH = [
  "Task",
  "Capability:repo",
  "Capability:pr",
  "Capability:issue",
  "repo_resolve",
  "pr_read",
  "issue_create",
];

export default function Home() {
  return (
    <div className="flex min-h-full flex-col">
      <header
        className="sticky top-0 z-40 border-b"
        style={{
          borderColor: "var(--line)",
          background: "color-mix(in srgb, var(--bg) 85%, transparent)",
          backdropFilter: "blur(10px)",
        }}
      >
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-3">
          <Link href="/" className="flex min-h-[44px] items-center gap-2.5" aria-label="Toolpath home">
            <LogoMark />
            <span
              className="text-lg font-bold tracking-tight"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Toolpath
            </span>
          </Link>
          <nav className="hidden items-center gap-2 text-sm sm:flex" style={{ color: "var(--muted)" }}>
            <Link href="/demo" className="inline-flex min-h-[44px] items-center px-2 hover:text-[var(--text)]">
              Demo
            </Link>
            <Link href="/privacy" className="inline-flex min-h-[44px] items-center px-2 hover:text-[var(--text)]">
              Privacy
            </Link>
            <a
              href="https://github.com/Sketchify-Dev/toolpath"
              className="inline-flex min-h-[44px] items-center px-2 hover:text-[var(--text)]"
            >
              GitHub
            </a>
          </nav>
          <Link
            href="/demo"
            className="btn btn-primary shrink-0"
          >
            Open demo
          </Link>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-16 px-6 pb-20 pt-10 sm:pt-16 lg:px-8">
        <section className="grid items-center gap-10 lg:grid-cols-2 lg:gap-12">
          <Rise>
            <p
              className="inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-medium"
              style={{ borderColor: "var(--line)", color: "var(--muted)" }}
            >
              <span
                className="inline-block h-1.5 w-1.5 rounded-full pulse-soft"
                style={{ background: "var(--accent)" }}
              />
              HydraDB Hackathon, Track 2: agent context layer
            </p>
            <h1
              className="mt-4 text-3xl font-bold leading-[1.02] tracking-tight lg:text-4xl"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Traverse, don&apos;t preload.
            </h1>
            <p className="mt-5 max-w-lg text-lg leading-8" style={{ color: "var(--text-dim)" }}>
              Agents stuff forty tool schemas into context before the first thought.
              Toolpath walks the tool graph in HydraDB and pulls only the three the
              task needs.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                href="/demo"
                className="btn btn-primary"
              >
                Run the live demo
              </Link>
              <Link
                href="https://github.com/Sketchify-Dev/toolpath"
                className="btn btn-ghost"
              >
                Read the code
              </Link>
            </div>
            <p
              className="demo-num mt-8 text-sm"
              style={{ color: "var(--muted)", fontFamily: "var(--font-num)" }}
            >
              1,800 tokens vs 12,400. Measured, not estimated.
            </p>
          </Rise>

          <Rise index={1}>
            <div className="card p-7">
              <div className="flex items-center justify-between mb-5">
                <p className="text-sm font-semibold text-dim">Live traversal path</p>
                <p className="demo-num text-xs font-bold" style={{ color: "var(--accent)", fontFamily: "var(--font-num)" }}>
                  6 hops
                </p>
              </div>
              <ol className="space-y-0">
                {PATH.map((step, i) => (
                  <li key={step} className="flex items-stretch gap-3">
                    <span className="flex flex-col items-center">
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ background: i === 0 || i === PATH.length - 1 ? "var(--accent)" : "var(--line)" }}
                      />
                      {i < PATH.length - 1 && (
                        <span className="w-0.5 flex-1 mt-2" style={{ background: "var(--line)" }} />
                      )}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-dim truncate" style={{ fontFamily: "var(--font-num)" }}>{step}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </Rise>
        </section>

        <section>
          <Rise>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {PROOFS.map((p) => (
                <div key={p.unit} className="card-light p-7">
                  <p className="demo-num text-4xl font-bold" style={{ fontFamily: "var(--font-num)" }}>
                    {p.value}
                  </p>
                  <p className="mt-2 text-sm font-semibold">{p.unit}</p>
                  <p className="mt-1 text-sm opacity-70">{p.note}</p>
                </div>
              ))}
            </div>
          </Rise>
        </section>

        <section>
          <Rise>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl" style={{ fontFamily: "var(--font-display)" }}>
              How it works
            </h2>
            <p className="mt-4 max-w-2xl leading-7" style={{ color: "var(--text-dim)" }}>
              Every token in context has a graph path behind it. That makes tool
              selection auditable in a way preloading and vector recall cannot match.
            </p>
          </Rise>
          <div className="mt-10 grid gap-6 lg:grid-cols-3">
            {STEPS.map((s, i) => (
              <Rise key={s.title} index={i}>
                <div className="card p-7 flex flex-col">
                  <p className="demo-num text-sm font-bold" style={{ color: "var(--accent)", fontFamily: "var(--font-num)" }}>
                    {s.n}
                  </p>
                  <p className="mt-4 text-xl font-semibold">{s.title}</p>
                  <p className="mt-4 flex-1 leading-7" style={{ color: "var(--text-dim)" }}>
                    {s.body}
                  </p>
                  <p
                    className="demo-num mt-6 rounded-lg px-3 py-2 text-xs"
                    style={{
                      background: "var(--surface-lift)",
                      color: "var(--accent)",
                      fontFamily: "var(--font-num)",
                      border: "1px solid var(--line)",
                    }}
                  >
                    {s.code}
                  </p>
                </div>
              </Rise>
            ))}
          </div>
        </section>

        <section>
          <Rise>
            <div className="card p-8 lg:p-10">
              <p className="text-sm font-semibold" style={{ color: "var(--accent)" }}>
                Sponsor tech
              </p>
              <h2 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl" style={{ fontFamily: "var(--font-display)" }}>
                Built on HydraDB
              </h2>
              <p className="mt-5 max-w-3xl leading-7" style={{ color: "var(--text-dim)" }}>
                HydraDB stores the tool graph. OpenCypher resolves task to capability
                to tool. algo.MSpaths does multi-source capability resolution in one
                round trip. Toolpath hydrates only what the traversal touches.
              </p>
            </div>
          </Rise>
        </section>

        <section>
          <Rise>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl" style={{ fontFamily: "var(--font-display)" }}>
              Questions judges ask
            </h2>
            <div className="mt-8 grid gap-5 lg:grid-cols-2">
              {FAQS.map((f, i) => (
                <Rise key={f.q} index={i}>
                  <div className="card p-6">
                    <p className="text-base font-semibold">{f.q}</p>
                    <p className="mt-3 leading-7" style={{ color: "var(--text-dim)" }}>
                      {f.a}
                    </p>
                  </div>
                </Rise>
              ))}
            </div>
          </Rise>
        </section>

        <section className="pt-8">
          <Rise>
            <div
              className="flex flex-col items-start justify-between gap-6 rounded-3xl p-8 sm:flex-row sm:items-center sm:p-10 slide-in"
              style={{ background: "var(--accent)", color: "#0b0c0e" }}
            >
              <div>
                <h2 className="text-2xl font-bold tracking-tight sm:text-3xl" style={{ fontFamily: "var(--font-display)" }}>
                  See the traversal light up.
                </h2>
                <p className="mt-3 max-w-xl leading-7 opacity-85">
                  Sixty seconds: run the task, watch baseline lose, ask the follow-up
                  with zero refetch, then break the tie on an ambiguous entity.
                </p>
              </div>
              <Link
                href="/demo"
                className="btn btn-primary shrink-0"
              >
                Open the demo
              </Link>
            </div>
          </Rise>
        </section>
      </main>

      <footer className="border-t mt-auto" style={{ borderColor: "var(--line)" }}>
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-6 py-10 text-sm sm:flex-row sm:items-center sm:justify-between" style={{ color: "var(--muted)" }}>
          <div className="flex items-center gap-2.5">
            <LogoMark size={22} />
            <span>Toolpath for the HydraDB Hackathon, Track 2.</span>
          </div>
          <nav className="flex flex-wrap gap-3">
            <Link href="/demo" className="hover:text-[var(--text)]">Demo</Link>
            <Link href="/about" className="hover:text-[var(--text)]">About</Link>
            <Link href="/privacy" className="hover:text-[var(--text)]">Privacy</Link>
            <Link href="/sitemap.xml" className="hover:text-[var(--text)]">Sitemap</Link>
            <Link href="/llms.txt" className="hover:text-[var(--text)]">llms.txt</Link>
            <a href="https://github.com/Sketchify-Dev/toolpath" className="hover:text-[var(--text)]">GitHub</a>
          </nav>
        </div>
      </footer>

      <Link
        href="/demo"
        className="fixed bottom-5 left-1/2 z-40 -translate-x-1/2 rounded-full px-7 py-3 text-sm font-semibold text-black shadow-lg sm:hidden"
        style={{ background: "var(--accent)" }}
      >
        Open the demo
      </Link>
    </div>
  );
}
