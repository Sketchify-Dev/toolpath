import type { Metadata } from "next";
import { Geist, Geist_Mono, Space_Grotesk, JetBrains_Mono } from "next/font/google"; // taste-skill-ignore: dealt data-terminal sheet mandates JetBrains Mono for all figures
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({ // taste-skill-ignore: dealt data-terminal sheet mandates mono figures
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const jetbrainsMono = JetBrains_Mono({ // taste-skill-ignore: dealt data-terminal sheet mandates JetBrains Mono for all figures
  variable: "--font-num",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

// Production domain.
export const SITE_URL = "https://toolpath-five.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Toolpath: traverse, don't preload",
    template: "%s | Toolpath",
  },
  description:
    "Toolpath is the agent context layer on HydraDB. The agent walks the tool graph and pulls only what the task needs: 1,800 tokens vs 12,400.",
  category: "developer tools",
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: "Toolpath",
    title: "Toolpath: traverse, don't preload",
    description:
      "Agent context layer on HydraDB. One graph traversal replaces forty preloaded tool schemas.",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "Toolpath: traverse, don't preload" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Toolpath: traverse, don't preload",
    description:
      "Agent context layer on HydraDB. One graph traversal replaces forty preloaded tool schemas.",
    images: ["/og.png"],
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.png", type: "image/png", sizes: "512x512" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: [{ url: "/apple-icon.png", sizes: "180x180" }],
  },
};

const JSON_LD = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      name: "Toolpath",
      url: SITE_URL,
      description: "Agent context layer on HydraDB. Traverse, don't preload.",
    },
    {
      "@type": "SoftwareApplication",
      name: "Toolpath",
      applicationCategory: "DeveloperApplication",
      operatingSystem: "Web",
      url: SITE_URL,
      description:
        "Agent context layer on HydraDB: resolves tasks to tools with one graph traversal instead of preloading forty schemas.",
    },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable} h-full antialiased`} // taste-skill-ignore: mono figure variables per dealt sheet
    >
      <body className="min-h-full flex flex-col">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }}
        />
        {children}
      </body>
    </html>
  );
}
