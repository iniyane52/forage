import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Chakra_Petch, Unbounded } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { NavProgress } from "@/components/ui/NavProgress";
import "./globals.css";

const inter = Inter({ variable: "--font-body", subsets: ["latin"] });
const jetbrainsMono = JetBrains_Mono({ variable: "--font-mono-face", subsets: ["latin"] });
const chakraPetch = Chakra_Petch({
  variable: "--font-display-face",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});
// Bolder, chunkier than Chakra Petch -- reserved for the hero headline only, to give
// it a distinct, more Gen-Z-coded punch without changing the type system anywhere
// else on the site.
const unbounded = Unbounded({
  variable: "--font-hero-face",
  subsets: ["latin"],
  weight: ["800", "900"],
});

export const metadata: Metadata = {
  title: "Forage — learn it, prove it",
  description:
    "Forage teaches industry skills from absolute zero to hiring standard — lessons, FAANG-caliber quizzes, and real projects.",
  openGraph: {
    title: "Forage — learn it, prove it",
    description:
      "Real lessons, FAANG-caliber quizzes, a grounded AI tutor, and live voice mock interviews — from absolute zero to hiring standard.",
    siteName: "Forage",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Forage — learn it, prove it",
    description:
      "Real lessons, FAANG-caliber quizzes, a grounded AI tutor, and live voice mock interviews — from absolute zero to hiring standard.",
  },
};

export const viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#05070a" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${jetbrainsMono.variable} ${chakraPetch.variable} ${unbounded.variable} h-full antialiased overflow-x-hidden`}
    >
      <body className="min-h-full flex flex-col overflow-x-hidden">
        {/* Browsers restore the previous scroll position on reload/back-forward-cache
            restore by default, which can land a fresh page load mid-scroll instead of
            at the top. Runs synchronously before hydration (unlike a useEffect, which
            fires too late to avoid the visible jump), and the pageshow listener catches
            bfcache restores, which don't re-run mount effects at all. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{if('scrollRestoration' in history){history.scrollRestoration='manual';}window.scrollTo(0,0);window.addEventListener('pageshow',function(e){if(e.persisted)window.scrollTo(0,0);});}catch(e){}`,
          }}
        />
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem value={{ light: "light", dark: "dark" }}>
          <NavProgress />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
