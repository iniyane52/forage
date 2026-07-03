import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SignOutButton } from "@/components/SignOutButton";

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
    <div className="min-h-screen">
      <header className="sticky top-0 z-20 bg-[#0e1116]/85 backdrop-blur border-b border-[#2a323d]">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-4">
          <Link href="/dashboard" className="font-extrabold text-lg tracking-tight">
            Foundary<span className="text-[#4c8dff]">.</span>
          </Link>
          <nav className="hidden sm:flex gap-4 text-sm text-[#9aa7b4]">
            <Link href="/dashboard" className="hover:text-white">Dashboard</Link>
            <Link href="/profile" className="hover:text-white">Profile</Link>
          </nav>
          <div className="ml-auto flex items-center gap-3 text-sm">
            <span title="Level" className="px-2 py-1 rounded-md bg-[#22303f] text-[#4c8dff] font-semibold">
              Lv {profile?.level ?? 1}
            </span>
            <span title="XP" className="px-2 py-1 rounded-md bg-[#22303f] text-[#3fb950] font-semibold">
              {profile?.xp ?? 0} XP
            </span>
            <span title="Day streak" className="px-2 py-1 rounded-md bg-[#22303f] text-[#e3a008] font-semibold">
              🔥 {profile?.streak_days ?? 0}
            </span>
            <SignOutButton />
          </div>
        </div>
      </header>
      <main className="max-w-5xl mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
