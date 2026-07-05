import { createClient } from "@/lib/supabase/server";
import { CountUp, AnimatedBar, Stagger, StaggerItem } from "@/components/ui/motion";
import { Sparkles, Flame, Trophy, Medal, Lock, CheckCircle2 } from "@/components/ui/icons";

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: profile }, { data: earned }, { data: allBadges }, { count: doneCount }, { count: passedCount }] =
    await Promise.all([
      supabase.from("profiles").select("*").eq("user_id", user!.id).single(),
      supabase.from("user_badges").select("badge_id, earned_at").eq("user_id", user!.id),
      supabase.from("badges").select("*"),
      supabase
        .from("lesson_progress")
        .select("lesson_id", { count: "exact", head: true })
        .eq("user_id", user!.id)
        .eq("status", "done"),
      supabase
        .from("quiz_results")
        .select("lesson_id", { count: "exact", head: true })
        .eq("user_id", user!.id)
        .eq("passed", true),
    ]);

  const earnedIds = new Set((earned ?? []).map((e) => e.badge_id));
  const xp = profile?.xp ?? 0;
  const xpIntoLevel = xp % 250;

  const stats = [
    { label: "Level", value: profile?.level ?? 1, color: "#7c5cff", icon: Trophy },
    { label: "Total XP", value: xp, color: "#3fb950", icon: Sparkles },
    { label: "Day streak", value: profile?.streak_days ?? 0, color: "#e3a008", icon: Flame },
    { label: "Lessons done", value: doneCount ?? 0, color: "#a371f7", icon: CheckCircle2 },
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold" style={{ fontFamily: "var(--font-display)" }}>
          {profile?.username ?? user!.email}
        </h1>
        <p className="text-sm text-[#9aa7b4]">{user!.email}</p>
      </div>

      <Stagger className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {stats.map((s) => (
          <StaggerItem key={s.label}>
            <div className="glass rounded-xl p-4 text-center h-full">
              <s.icon size={18} className="mx-auto mb-1" style={{ color: s.color }} />
              <p className="text-2xl font-bold" style={{ color: s.color, fontFamily: "var(--font-display)" }}>
                <CountUp value={s.value} />
              </p>
              <p className="text-xs text-[#9aa7b4] mt-1">{s.label}</p>
            </div>
          </StaggerItem>
        ))}
      </Stagger>

      <section>
        <div className="flex justify-between text-xs text-[#9aa7b4] mb-1.5">
          <span>Level {profile?.level ?? 1}</span>
          <span>{xpIntoLevel}/250 XP to next level</span>
        </div>
        <AnimatedBar pct={(xpIntoLevel / 250) * 100} />
        <p className="text-xs text-[#9aa7b4] mt-2">{passedCount ?? 0} quizzes passed</p>
      </section>

      <section>
        <h2 className="font-bold mb-3" style={{ fontFamily: "var(--font-display)" }}>
          Badges
        </h2>
        <div className="grid sm:grid-cols-2 gap-3">
          {(allBadges ?? []).map((b) => {
            const has = earnedIds.has(b.id);
            return (
              <div
                key={b.id}
                className={`glass rounded-xl p-4 flex items-start gap-3 ${
                  has ? "border-[#3fb950]/40" : "opacity-55"
                }`}
              >
                <span
                  className={`w-9 h-9 rounded-xl grid place-items-center shrink-0 ${
                    has ? "bg-[#3fb950]/15 text-[#3fb950]" : "bg-white/[0.05] text-[#9aa7b4]"
                  }`}
                >
                  {has ? <Medal size={20} /> : <Lock size={18} />}
                </span>
                <div>
                  <p className="font-semibold text-sm">{b.title}</p>
                  <p className="text-xs text-[#9aa7b4] mt-0.5">{b.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
