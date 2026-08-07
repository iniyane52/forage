import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SignOutButton } from "@/components/SignOutButton";
import { MobileNav } from "@/components/MobileNav";
import { CountUp } from "@/components/ui/motion";
import { IntroSplash } from "@/components/ui/IntroSplash";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { Flame, Sparkles } from "@/components/ui/icons";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth");

  const { data: profile } = await supabase
    .from("profiles")
    .select("username, xp, level, streak_days")
    .eq("user_id", user.id)
    .single();

  return (
    <div className="min-h-dvh">
      {/* Full branded splash the FIRST time this browser session enters the app
          (post-sign-in landing); sessionStorage-keyed so page-to-page navigation
          never replays it -- those just get (app)/loading.tsx's quick LoadingMark. */}
      <IntroSplash oncePerSessionKey="forage-app-splash" />
      <header className="sticky top-0 z-20">
        <div className="glass border-x-0 border-t-0 rounded-none">
          <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-4">
            <Link
              href="/dashboard"
              className="font-bold text-lg tracking-tight"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Forage<span className="text-[var(--color-primary)]">.</span>
            </Link>
            <nav className="hidden sm:flex gap-4 text-sm text-[var(--color-text-secondary)]">
              <Link href="/dashboard" className="hover:text-[var(--color-text)] transition-colors">
                Dashboard
              </Link>
              <Link href="/interview" className="hover:text-[var(--color-text)] transition-colors">
                Interview
              </Link>
              <Link href="/profile" className="hover:text-[var(--color-text)] transition-colors">
                Profile
              </Link>
            </nav>
            <MobileNav />
            <div className="ml-auto flex items-center gap-2 text-sm">
              <span className="px-2.5 py-1 rounded-lg bg-[rgb(var(--surface-rgb)/0.05)] text-[var(--color-primary)] font-semibold text-xs">
                Lv {profile?.level ?? 1}
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-[rgb(var(--surface-rgb)/0.05)] text-[var(--color-success)] font-semibold text-xs flex items-center gap-1">
                <Sparkles size={13} />
                <CountUp value={profile?.xp ?? 0} /> XP
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-[rgb(var(--surface-rgb)/0.05)] text-[var(--color-warning)] font-semibold text-xs flex items-center gap-1">
                <Flame size={13} />
                {profile?.streak_days ?? 0}
              </span>
              <ThemeToggle />
              <SignOutButton />
            </div>
          </div>
        </div>
      </header>
      <main className="max-w-5xl mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
