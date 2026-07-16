import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Chakra_Petch } from "next/font/google";
import { NavProgress } from "@/components/ui/NavProgress";
import "./globals.css";

const inter = Inter({ variable: "--font-body", subsets: ["latin"] });
const jetbrainsMono = JetBrains_Mono({ variable: "--font-mono-face", subsets: ["latin"] });
const chakraPetch = Chakra_Petch({
  variable: "--font-display-face",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Forage — learn it, prove it",
  description:
    "Forage teaches industry skills from absolute zero to hiring standard — lessons, FAANG-caliber quizzes, and real projects.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrainsMono.variable} ${chakraPetch.variable} h-full antialiased overflow-x-hidden`}
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
        <NavProgress />
        {children}
      </body>
    </html>
  );
}
