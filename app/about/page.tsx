import Link from "next/link";
import LogoMark from "../components/logo";

export const metadata = {
  title: "About",
  description: "About Toolpath: agent context layer on HydraDB, built for the HydraDB Hackathon Track 2.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <div className="flex min-h-full flex-col relative overflow-hidden">
      <div className="fixed inset-0 -z-10 grid-bg opacity-20 pointer-events-none" />

      <header className="border-b border-[var(--line)]" style={{ background: "color-mix(in srgb, var(--bg) 85%, transparent)", backdropFilter: "blur(12px)" }}>
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-6 py-4 sm:px-8">
          <Link href="/" className="flex items-center gap-2.5" aria-label="Toolpath home">
            <LogoMark size={26} />
            <span className="text-lg font-bold tracking-tight" style={{ fontFamily: "var(--font-display)" }}>
              Toolpath
            </span>
          </Link>
          <Link
            href="/demo"
            className="btn btn-primary shrink-0"
          >
            Open demo
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-20 sm:px-8 lg:px-12">
        <div className="max-w-3xl">
          <p className="text-sm text-dim tracking-wider uppercase letter-spacing-tight">
            Built for the HydraDB Hackathon, Track 2.
          </p>
          <h1 className="mt-4 text-5xl font-bold leading-[1.05] tracking-tight sm:text-6xl" style={{ fontFamily: "var(--font-display)" }}>
            About Toolpath
          </h1>
          <div className="mt-10 space-y-8 leading-8" style={{ color: "var(--text-dim)" }}>
            <p className="text-lg">
              Toolpath is an agent context layer on HydraDB. Instead of preloading
              every tool schema into context before the first thought, the agent
              walks the tool graph and pulls only the tools the task needs.
            </p>
            <p className="text-lg">
              On the demo task, Toolpath loads 3 tools and 1,800 tokens versus a
              baseline of 40 tools and 12,400 tokens. That is an 85 percent token
              reduction, 4 round trips down to 1 graph traversal, and 6 hops
              instead of fan-out.
            </p>
            <p className="text-lg">
              The graph stores tools, capabilities, and resolved entities as
              HydraDB nodes, with PROVIDES, USED, and RESOLVED edges. Every token
              in context has a graph path behind it, which makes tool selection
              auditable in a way preloading and vector recall cannot match.
            </p>
            <p className="text-lg">
              Built for the HydraDB Hackathon, Track 2: agent context layer. The
              demo runs in snapshot mode by default, so it works with zero setup.
              Set HYDRA_URL to flip to live HydraDB traversal.
            </p>
            <h2 className="mt-12 text-3xl font-bold tracking-tight" style={{ fontFamily: "var(--font-display)" }}>
              Sponsor tech
            </h2>
            <ul className="mt-5 space-y-4" style={{ color: "var(--muted)" }}>
              <li className="flex items-start gap-3">
                <span className="mt-0.5 w-1.5 h-1.5 rounded-full bg-accent" />
                <span>HydraDB: the tool graph itself.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-0.5 w-1.5 h-1.5 rounded-full bg-accent" />
                <span>OpenCypher: task to capability to tool traversal.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-0.5 w-1.5 h-1.5 rounded-full bg-accent" />
                <span>algo.MSpaths: multi-source capability resolution in one round trip.</span>
              </li>
            </ul>
            <p className="mt-10 pt-8 border-t border-[var(--line)]" style={{ color: "var(--muted)" }}>
              Source:{" "}
              <a href="https://github.com/Sketchify-Dev/toolpath" className="underline underline-offset-4 hover:text-[var(--accent)] transition-colors" style={{ color: "var(--text)" }}>
                GitHub repo
              </a>
              .
              Licensed under the MIT License.
            </p>
          </div>
        </div>
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
            <a href="https://github.com/Sketchify-Dev/toolpath" className="hover:text-[var(--text)] transition-colors">GitHub</a>
          </nav>
        </div>
      </footer>
    </div>
  );
}
