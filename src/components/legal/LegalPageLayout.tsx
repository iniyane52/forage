import Link from "next/link";
import { LandingFooter } from "@/components/landing/LandingFooter";

export function LegalPageLayout({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex-1 flex flex-col">
      <header className="sticky top-0 z-20">
        <div className="glass border-x-0 border-t-0 rounded-none">
          <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-4">
            <Link href="/" className="font-bold text-lg tracking-tight" style={{ fontFamily: "var(--font-display)" }}>
              Forage<span className="text-[#00e5ff]">.</span>
            </Link>
            <Link href="/" className="ml-auto text-sm text-[#7d99a3] hover:text-white transition-colors">
              Back to home
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-3xl mx-auto px-4 py-12 sm:py-16 w-full">
        <h1 className="display text-3xl sm:text-4xl mb-2">{title}</h1>
        <p className="text-sm text-[#7d99a3] mb-10">Last updated: {updated}</p>
        <div className="space-y-8 text-[15px] leading-relaxed text-[#e8f4f5]/90 [&_h2]:display [&_h2]:text-xl [&_h2]:mb-3 [&_h2]:mt-2 [&_h2]:text-[#e8f4f5] [&_p]:mb-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1.5 [&_ul]:mb-3 [&_a]:text-[#00e5ff] [&_a]:hover:underline [&_strong]:text-[#e8f4f5] [&_strong]:font-semibold">
          {children}
        </div>
      </main>

      <LandingFooter />
    </div>
  );
}
