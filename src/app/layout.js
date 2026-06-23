import { DM_Serif_Display, Inter } from "next/font/google";
import "./globals.css";
import ThemeProvider from "@/components/ThemeProvider";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const dmSerif = DM_Serif_Display({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

export const metadata = {
  title: {
    default: "WendPlay — Play Wend Game Online Free | Daily Puzzle & Unlimited",
    template: "%s | WendPlay",
  },
  description:
    "Play Wend Game online free — the word puzzle inspired by LinkedIn's Wend. Daily challenges across 6 grid sizes, 50+ practice puzzles, unlimited play, and answers. No login required.",
  keywords: [
    "wend game", "wend", "wend puzzle", "linkedin wend", "play wend",
    "wend game online", "wend unlimited", "wend daily", "word puzzle",
    "wend answers", "wend game free", "wendplay",
  ],
  authors: [{ name: "WendPlay" }],
  creator: "WendPlay",
  publisher: "WendPlay",
  robots: { index: true, follow: true },
  metadataBase: new URL("https://wendplay.com"),
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://wendplay.com",
    siteName: "WendPlay",
    title: "WendPlay — Play Wend Game Online Free | Daily Puzzle & Unlimited",
    description:
      "Play Wend Game online free. Daily challenges, unlimited puzzles, answers & hints. No login required.",
  },
  twitter: {
    card: "summary_large_image",
    title: "WendPlay — Play Wend Game Online Free",
    description: "Daily Wend puzzles, unlimited play, answers & hints. No login required.",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${dmSerif.variable} ${inter.variable}`}>
      <head>
        <meta name="theme-color" content="#FBF7F0" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="mobile-web-app-capable" content="yes" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const t = localStorage.getItem('wend-theme');
                if (t === 'dark' || (!t && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.documentElement.setAttribute('data-theme', 'dark');
                  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', '#131820');
                }
              } catch(e) {}
            `,
          }}
        />
      </head>
      <body>
        <ThemeProvider>
          <Header />
          <main id="main-content" style={{ minHeight: 'calc(100vh - var(--header-height) - 200px)' }}>
            {children}
          </main>
          <Footer />
        </ThemeProvider>

        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "WendPlay",
              url: "https://wendplay.com",
              description: "Play Wend Game online free — daily puzzles, unlimited play, answers & hints.",
            }),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "VideoGame",
              name: "Wend Game",
              url: "https://wendplay.com",
              applicationCategory: "Game",
              genre: "Word puzzle",
              gamePlatform: ["Web browser"],
              operatingSystem: "Any",
              offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
            }),
          }}
        />
      </body>
    </html>
  );
}
