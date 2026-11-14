import Link from "next/link";
import LogoMark from "../components/logo";

export const metadata = {
  title: "Privacy",
  description: "Toolpath privacy: no tracking, no accounts, no data leaves your browser except the demo API calls.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
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
      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-8">
        <p className="text-sm" style={{ color: "var(--muted)" }}>
          Last updated November 14, 2026
        </p>
        <h1
          className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Privacy
        </h1>
        <div className="mt-8 space-y-6 leading-7" style={{ color: "var(--muted)" }}>
          <p>
            Toolpath has no accounts, no login, and no analytics. There is nothing
            to sign up for and nothing tracking you across the page.
          </p>
          <p>
            Tasks you type into the demo are sent to this site&apos;s own API
            routes to run the baseline and toolpath comparison. In snapshot mode
            nothing leaves the server; in live mode queries go to the HydraDB
            instance configured by the site operator. Do not paste secrets, tokens,
            or private code into the demo box.
          </p>
          <p>
            Questions: open an issue on the{" "}
            <a
              href="https://github.com/Sketchify-Dev/toolpath"
              className="underline"
              style={{ color: "var(--text)" }}
            >
              GitHub repo
            </a>
            .
          </p>
        </div>
      </main>
    </div>
  );
}
