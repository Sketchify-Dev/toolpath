import Link from "next/link";
import LogoMark from "./components/logo";

export const metadata = {
  title: "Not found",
  description: "This path is not in the graph.",
  alternates: { canonical: "/not-found" },
};

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-full w-full max-w-6xl flex-1 flex-col items-start justify-center gap-6 px-6 py-24">
      <LogoMark />
      <p
        className="demo-num rounded-full border px-3.5 py-1.5 text-xs font-medium"
        style={{ borderColor: "var(--line)", color: "var(--muted)", fontFamily: "var(--font-num)" }}
      >
        404
      </p>
      <h1
        className="text-4xl font-bold tracking-tight sm:text-5xl"
        style={{ fontFamily: "var(--font-display)" }}
      >
        This path is not in the graph.
      </h1>
      <p className="max-w-md leading-7" style={{ color: "var(--muted)" }}>
        The traversal found nothing here. Head back to the demo and run a task
        that resolves.
      </p>
      <div className="flex flex-wrap gap-4">
        <Link
          href="/demo"
          className="rounded-full px-6 py-3 text-sm font-semibold text-black"
          style={{ background: "var(--accent)" }}
        >
          Open the demo
        </Link>
        <Link
          href="/"
          className="rounded-full border px-6 py-3 text-sm font-semibold"
          style={{ borderColor: "var(--line)", color: "var(--text)" }}
        >
          Back home
        </Link>
      </div>
    </div>
  );
}
