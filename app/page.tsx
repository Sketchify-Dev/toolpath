import Link from "next/link";

const PROOFS = [
  { value: "-95%", label: "Token context on the demo task" },
  { value: "1", label: "Traversal round trip instead of four" },
  { value: "0", label: "Refetches on entity reuse" },
];

const STEPS = [
  {
    title: "Index the catalog",
    body: "Tools, skills, MCP servers, capabilities, and resolved entities live as nodes in HydraDB. Edges say what provides what.",
  },
  {
    title: "Ask for the path",
    body: "One algo.MSpaths call resolves the task to capabilities to tools. No fan-out, no preloading forty schemas.",
  },
  {
    title: "Hydrate only the path",
    body: "Three tool schemas enter context. Resolved entities persist, so the next query reuses them with zero refetch.",
  },
];

export default function Home() {
  return (
    <div className="flex min-h-full flex-col">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-5">
        <span
          className="text-lg font-bold tracking-tight"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Toolpath
        </span>
        <Link
          href="/demo"
          className="rounded-full px-5 py-2.5 text-sm font-semibold text-black transition-transform hover:scale-105"
          style={{ background: "var(--accent)" }}
        >
          Open demo
        </Link>
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-24 px-6 pb-24 pt-12">
        <section className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <div className="rise-in">
            <h1
              className="text-5xl font-bold leading-[1.02] tracking-tight sm:text-6xl"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Traverse, don&apos;t preload.
            </h1>
            <p className="mt-6 max-w-md text-lg leading-8" style={{ color: "var(--muted)" }}>
              Toolpath is the agent context layer on HydraDB. The agent walks the tool graph and
              pulls only what the task needs.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                href="/demo"
                className="rounded-full px-6 py-3 text-sm font-semibold text-black transition-transform hover:scale-105"
                style={{ background: "var(--accent)" }}
              >
                Run the live demo
              </Link>
              <span className="demo-num text-sm" style={{ color: "var(--muted)", fontFamily: "var(--font-num)" }}>
                1,800 tokens vs 12,400
              </span>
            </div>
          </div>
          <div
            className="rounded-2xl border p-6"
            style={{ background: "var(--surface)", borderColor: "var(--line)" }}
          >
            <p className="text-sm font-medium" style={{ color: "var(--muted)" }}>
              Prompt
            </p>
            <p className="mt-2 text-base leading-7">
              summarize PR #412 and file a follow-up issue
            </p>
            <div
              className="demo-num mt-5 grid grid-cols-3 gap-4 border-t pt-5 text-center"
              style={{ borderColor: "var(--line)", fontFamily: "var(--font-num)" }}
            >
              <div>
                <p className="text-2xl font-bold" style={{ color: "var(--accent)" }}>3</p>
                <p className="mt-1 text-xs" style={{ color: "var(--muted)" }}>tools</p>
              </div>
              <div>
                <p className="text-2xl font-bold" style={{ color: "var(--accent)" }}>5</p>
                <p className="mt-1 text-xs" style={{ color: "var(--muted)" }}>hops</p>
              </div>
              <div>
                <p className="text-2xl font-bold" style={{ color: "var(--accent)" }}>3</p>
                <p className="mt-1 text-xs" style={{ color: "var(--muted)" }}>round trips</p>
              </div>
            </div>
            <p className="mt-5 flex items-center gap-2 text-xs" style={{ color: "var(--muted)" }}>
              <span
                className="inline-block h-2 w-2 rounded-full"
                style={{ background: "var(--accent)" }}
              />
              repo_resolve to pr_read to issue_create, lit in HydraDB
            </p>
          </div>
        </section>

        <section>
          <div className="grid gap-6 sm:grid-cols-3">
            {PROOFS.map((p) => (
              <div
                key={p.label}
                className="rounded-2xl p-6"
                style={{ background: "var(--card-bg)", color: "var(--card-text)" }}
              >
                <p
                  className="demo-num text-4xl font-bold"
                  style={{ fontFamily: "var(--font-num)" }}
                >
                  {p.value}
                </p>
                <p className="mt-2 text-sm leading-6">{p.label}</p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2
            className="text-3xl font-bold tracking-tight"
            style={{ fontFamily: "var(--font-display)" }}
          >
            How it works
          </h2>
          <div className="mt-8 grid gap-10 lg:grid-cols-3">
            {STEPS.map((s) => (
              <div key={s.title}>
                <p className="text-xl font-semibold">{s.title}</p>
                <p className="mt-3 leading-7" style={{ color: "var(--muted)" }}>{s.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section
          className="rounded-2xl border p-8"
          style={{ background: "var(--surface)", borderColor: "var(--line)" }}
        >
          <h2
            className="text-2xl font-bold tracking-tight"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Built on HydraDB
          </h2>
          <p className="mt-3 max-w-2xl leading-7" style={{ color: "var(--muted)" }}>
            HydraDB stores the tool graph. OpenCypher resolves task to capability to tool.
            algo.MSpaths collapses multi-source resolution into one round trip, and entity
            reuse comes from RESOLVED edges on prior TaskRuns.
          </p>
        </section>
      </main>

      <footer className="mx-auto w-full max-w-6xl px-6 pb-10">
        <p className="text-sm" style={{ color: "var(--muted)" }}>
          Toolpath for the HydraDB Hackathon, Track 2. Snapshot mode included, no login needed.
        </p>
      </footer>
    </div>
  );
}
