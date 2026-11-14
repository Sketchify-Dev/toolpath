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
    n: "01", // taste-skill-ignore: numbered steps in a sequence, not decoration
    title: "Index the catalog",
    body: "Tools, skills, MCP servers, and resolved entities live as HydraDB nodes. Edges say what provides what. One MERGE-only seed writes the graph.",
    code: "MERGE (t:Tool {id: $id})",
  },
  {
    n: "02", // taste-skill-ignore: numbered steps in a sequence, not decoration
    title: "Ask for the path",
    body: "One algo.MSpaths call resolves task to capability to tools. No fan-out, no preloading forty schemas into context first.",
    code: "CALL algo.MSpaths({...})",
  },
  {
    n: "03", // taste-skill-ignore: numbered steps in a sequence, not decoration
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
          background: "color-mix(in srgb, var(--bg) 82%, transparent)",
          backdropFilter: "blur(8px)",
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
            <Link href="/demo" className="inline-flex min-h-[44px] items-center px-2 transition-colors hover:text-[var(--text)]">
              Demo
            </Link>
            <Link href="/privacy" className="inline-flex min-h-[44px] items-center px-2 transition-colors hover:text-[var(--text)]">
              Privacy
            </Link>
            <a
              href="https://github.com/Sketchify-Dev/toolpath"
              className="inline-flex min-h-[44px] items-center px-2 transition-colors hover:text-[var(--text)]"
            >
              GitHub
            </a>
          </nav>
          <Link
            href="/demo"
            className="inline-flex min-h-[44px] items-center rounded-full px-5 py-2 text-sm font-semibold text-black transition-transform hover:scale-105"
            style={{ background: "var(--accent)" }}
          >
            Open demo
          </Link>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-16 px-6 pb-20 pt-10 sm:pt-16">
        <section className="grid items-center gap-8 lg:grid-cols-2">
          <Rise>
            <p
              className="inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-medium"
              style={{ borderColor: "var(--line)", color: "var(--muted)" }}
            >
              <span
                className="inline-block h-1.5 w-1.5 rounded-full"
                style={{ background: "var(--accent)" }}
              />
              HydraDB Hackathon, Track 2: agent context layer
            </p>
            <h1
              className="mt-4 text-2xl font-bold leading-[1.02] tracking-tight lg:text-3xl"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Traverse, don&apos;t preload.
            </h1>
            <p className="mt-4 max-w-md text-lg leading-8" style={{ color: "var(--muted)" }}>
              Agents stuff forty tool schemas into context before the first thought.
              Toolpath walks the tool graph in HydraDB and pulls only the three the
              task needs.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-4">
              <Link
                href="/demo"
                className="rounded-full px-7 py-3.5 text-sm font-semibold text-black transition-transform hover:scale-105"
                style={{ background: "var(--accent)" }}
              >
                Run the live demo
              </Link>
              <Link
                href="https://github.com/Sketchify-Dev/toolpath"
                className="rounded-full border px-7 py-3.5 text-sm font-semibold transition-colors hover:border-[var(--accent)]"
                style={{ borderColor: "var(--line)", color: "var(--text)" }}
              >
                Read the code
              </Link>
            </div>
            <p
              className="demo-num mt-4 text-sm"
              style={{ color: "var(--muted)", fontFamily: "var(--font-num)" }}
            >
              1,800 tokens vs 12,400. Measured, not estimated.
            </p>
          </Rise>

          <Rise index={1}>
            <div
              className="rounded-2xl border p-6"
              style={{ background: "var(--surface)", borderColor: "var(--line)" }}
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium" style={{ color: "var(--muted)" }}>
                  Live traversal path
                </p>
                <p
                  className="demo-num text-xs"
                  style={{ color: "var(--accent)", fontFamily: "var(--font-num)" }}
                >
                  6 hops
                </p>
              </div>
              <ol className="mt-4 space-y-0">
                {PATH.map((step, i) => (
                  <li key={step} className="flex items-stretch gap-3">
                    <span className="flex flex-col items-center">
                      <span
                        className="mt-1.5 h-2 w-2 shrink-0 rounded-full"
                        style={{ background: i === 0 ? "var(--accent)" : "var(--line)" }}
                      />
                      {i < PATH.length - 1 && (
                        <span className="w-px flex-1" style={{ background: "var(--line)" }} />
                      )}
                    </span>
                    <span
                      className="demo-num pb-4 text-sm"
                      style={{
                        color: i === 0 ? "var(--text)" : "var(--muted)",
                        fontFamily: "var(--font-num)",
                      }}
                    >
                      {step}
                    </span>
                  </li>
                ))}
              </ol>
              <div
                className="grid grid-cols-3 gap-4 border-t pt-5 text-center"
                style={{ borderColor: "var(--line)" }}
              >
                {[
                  { v: "3", l: "tools hydrated" },
                  { v: "1", l: "graph round trip" },
                  { v: "0", l: "wasted schemas" },
                ].map((s) => (
                  <div key={s.l}>
                    <p
                      className="demo-num text-2xl font-bold"
                      style={{ color: "var(--accent)", fontFamily: "var(--font-num)" }}
                    >
                      {s.v}
                    </p>
                    <p className="mt-1 text-xs" style={{ color: "var(--muted)" }}>
                      {s.l}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </Rise>
        </section>

        <section>
          <Rise>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {PROOFS.map((p) => (
                <div
                  key={p.unit}
                  className="rounded-2xl p-6"
                  style={{ background: "var(--card-bg)", color: "var(--card-text)" }}
                >
                  <p
                    className="demo-num text-4xl font-bold"
                    style={{ fontFamily: "var(--font-num)" }}
                  >
                    {p.value}
                  </p>
                  <p className="mt-1 text-sm font-semibold">{p.unit}</p>
                  <p className="mt-1 text-sm opacity-60">{p.note}</p>
                </div>
              ))}
            </div>
          </Rise>
        </section>

        <section>
          <Rise>
            <h2
              className="text-3xl font-bold tracking-tight sm:text-4xl"
              style={{ fontFamily: "var(--font-display)" }}
            >
              How it works
            </h2>
            <p className="mt-3 max-w-2xl leading-7" style={{ color: "var(--muted)" }}>
              Every token in context has a graph path behind it. That makes tool
              selection auditable in a way preloading and vector recall cannot match.
            </p>
          </Rise>
          <div className="mt-8 grid gap-4 lg:grid-cols-3">
            {STEPS.map((s, i) => (
              <Rise key={s.title} index={i}>
                <div
                  className="flex self-start flex-col rounded-2xl border p-6"
                  style={{ background: "var(--surface)", borderColor: "var(--line)" }}
                >
                  <p
                    className="demo-num text-sm font-bold"
                    style={{ color: "var(--accent)", fontFamily: "var(--font-num)" }}
                  >
                    {s.n}
                  </p>
                  <p className="mt-3 text-xl font-semibold">{s.title}</p>
                  <p className="mt-3 flex-1 leading-7" style={{ color: "var(--muted)" }}>
                    {s.body}
                  </p>
                  <p
                    className="demo-num mt-5 rounded-lg px-3 py-2 text-xs"
                    style={{
                      background: "var(--bg)",
                      color: "var(--accent)",
                      fontFamily: "var(--font-num)",
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
            <div
              className="rounded-2xl border p-8 sm:p-10"
              style={{ background: "var(--surface)", borderColor: "var(--line)" }}
            >
              <p
                className="text-sm font-semibold"
                style={{ color: "var(--accent)" }}
              >
                Sponsor tech
              </p>
              <h2
                className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Built on HydraDB
              </h2>
              <p className="mt-4 max-w-3xl leading-7" style={{ color: "var(--muted)" }}>
                HydraDB stores the tool graph. OpenCypher resolves task to capability
                to tool. algo.MSpaths collapses multi-source resolution into one round
                trip, and entity reuse comes from RESOLVED edges on prior TaskRuns.
                Set HYDRA_URL and the demo flips from snapshot to live with no code change.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href="/demo"
                  className="rounded-full px-6 py-3 text-sm font-semibold text-black transition-transform hover:scale-105"
                  style={{ background: "var(--accent)" }}
                >
                  Try it on the demo graph
                </Link>
              </div>
            </div>
          </Rise>
        </section>

        <section>
          <Rise>
            <h2
              className="text-3xl font-bold tracking-tight sm:text-4xl"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Questions judges ask
            </h2>
          </Rise>
          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            {FAQS.map((f, i) => (
              <Rise key={f.q} index={i}>
                <div
                  className="h-full rounded-2xl border p-6"
                  style={{ background: "var(--surface)", borderColor: "var(--line)" }}
                >
                  <p className="text-base font-semibold">{f.q}</p>
                  <p className="mt-3 leading-7" style={{ color: "var(--muted)" }}>
                    {f.a}
                  </p>
                </div>
              </Rise>
            ))}
          </div>
        </section>

        <section>
          <Rise>
            <div
              className="flex flex-col items-start justify-between gap-6 rounded-2xl p-8 sm:flex-row sm:items-center sm:p-10"
              style={{ background: "var(--accent)", color: "#0b0c0e" }}
            >
              <div>
                <h2
                  className="text-2xl font-bold tracking-tight sm:text-3xl"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  See the traversal light up.
                </h2>
                <p className="mt-2 max-w-xl leading-7 opacity-70">
                  Sixty seconds: run the task, watch baseline lose, ask the follow-up
                  with zero refetch, then break the tie on an ambiguous entity.
                </p>
              </div>
              <Link
                href="/demo"
                className="shrink-0 rounded-full bg-black px-7 py-3.5 text-sm font-semibold text-white transition-transform hover:scale-105"
              >
                Open the demo
              </Link>
            </div>
          </Rise>
        </section>
      </main>

      <footer className="border-t" style={{ borderColor: "var(--line)" }}>
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-6 py-8 text-sm sm:flex-row sm:items-center sm:justify-between" style={{ color: "var(--muted)" }}>
          <div className="flex items-center gap-2.5">
            <LogoMark size={22} />
            <span>Toolpath for the HydraDB Hackathon, Track 2.</span>
          </div>
          <nav className="flex flex-wrap gap-1">
            <Link href="/demo" className="inline-flex min-h-[44px] items-center px-2 transition-colors hover:text-[var(--text)]">Demo</Link>
            <Link href="/privacy" className="inline-flex min-h-[44px] items-center px-2 transition-colors hover:text-[var(--text)]">Privacy</Link>
            <Link href="/sitemap.xml" className="inline-flex min-h-[44px] items-center px-2 transition-colors hover:text-[var(--text)]">Sitemap</Link>
            <Link href="/llms.txt" className="inline-flex min-h-[44px] items-center px-2 transition-colors hover:text-[var(--text)]">llms.txt</Link>
            <a href="https://github.com/Sketchify-Dev/toolpath" className="inline-flex min-h-[44px] items-center px-2 transition-colors hover:text-[var(--text)]">GitHub</a>
          </nav>
        </div>
      </footer>

      <Link
        href="/demo"
        className="fixed bottom-4 left-1/2 z-40 -translate-x-1/2 rounded-full px-6 py-3 text-sm font-semibold text-black shadow-lg sm:hidden" /* taste-skill-ignore: sticky bar overlay, overlays may carry shadow */
        style={{ background: "var(--accent)" }}
      >
        Open the demo
      </Link>
    </div>
  );
}
