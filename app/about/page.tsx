import Link from "next/link";
import LogoMark from "../components/logo";

export const metadata = {
  title: "About",
  description: "About Toolpath: agent context layer on HydraDB, built for the HydraDB Hackathon Track 2.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <div className="flex min-h-full flex-col">
      <header className="border-b" style={{ borderColor: "var(--line)" }}>
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-3">
          <Link href="/" className="flex items-center gap-2.5" aria-label="Toolpath home">
            <LogoMark size={24} />
            <span className="text-lg font-bold tracking-tight" style={{ fontFamily: "var(--font-display)" }}>
              Toolpath
            </span>
          </Link>
          <Link
            href="/demo"
            className="rounded-full px-5 py-2 text-sm font-semibold text-black"
            style={{ background: "var(--accent)" }}
          >
            Open demo
          </Link>
        </div>
      </header>
      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-14">
        <p className="text-sm" style={{ color: "var(--muted)" }}>
          Built for the HydraDB Hackathon, Track 2.
        </p>
        <h1 className="mt-3 text-xl font-bold tracking-tight sm:text-2xl" style={{ fontFamily: "var(--font-display)" }}>
          About Toolpath
        </h1>
        <div className="mt-8 space-y-6 leading-7" style={{ color: "var(--text)" }}>
          <p>
            Toolpath is an agent context layer on HydraDB. Instead of preloading
            every tool schema into context before the first thought, the agent
            walks the tool graph and pulls only the tools the task needs.
          </p>
          <p>
            On the demo task, Toolpath loads 3 tools and 1,800 tokens versus a
            baseline of 40 tools and 12,400 tokens. That is an 85 percent token
            reduction, 4 round trips down to 1 graph traversal, and 6 hops
            instead of fan-out.
          </p>
          <p>
            The graph stores tools, capabilities, and resolved entities as
            HydraDB nodes, with PROVIDES, USED, and RESOLVED edges. Every token
            in context has a graph path behind it, which makes tool selection
            auditable in a way preloading and vector recall cannot match.
          </p>
          <p>
            Built for the HydraDB Hackathon, Track 2: agent context layer. The
            demo runs in snapshot mode by default, so it works with zero setup.
            Set HYDRA_URL to flip to live HydraDB traversal.
          </p>
          <h2 className="mt-6 text-2xl font-bold tracking-tight" style={{ fontFamily: "var(--font-display)" }}>
            Sponsor tech
          </h2>
          <ul className="mt-2 space-y-2" style={{ color: "var(--muted)" }}>
            <li>HydraDB: the tool graph itself.</li>
            <li>OpenCypher: task to capability to tool traversal.</li>
            <li>algo.MSpaths: multi-source capability resolution in one round trip.</li>
          </ul>
          <p className="mt-6" style={{ color: "var(--muted)" }}>
            Source: <a href="https://github.com/Sketchify-Dev/toolpath" className="underline" style={{ color: "var(--text)" }}>
              GitHub repo
            </a>.
            Licensed under the MIT License.
          </p>
        </div>
      </main>
    </div>
  );
}
