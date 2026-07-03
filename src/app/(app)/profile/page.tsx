import { createClient } from "@/lib/supabase/server";

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
  const xpIntoLevel = (profile?.xp ?? 0) % 250;

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold">{profile?.username ?? user!.email}</h1>
        <p className="text-sm text-[#9aa7b4]">{user!.email}</p>
      </div>

      <section className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Level", value: profile?.level ?? 1, color: "#4c8dff" },
          { label: "Total XP", value: profile?.xp ?? 0, color: "#3fb950" },
          { label: "Day streak", value: `🔥 ${profile?.streak_days ?? 0}`, color: "#e3a008" },
          { label: "Lessons done", value: doneCount ?? 0, color: "#c98bff" },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-[#2a323d] bg-[#161b22] p-4 text-center">
            <p className="text-2xl font-extrabold" style={{ color: s.color }}>
              {s.value}
            </p>
            <p className="text-xs text-[#9aa7b4] mt-1">{s.label}</p>
          </div>
        ))}
      </section>

      <section>
        <div className="flex justify-between text-xs text-[#9aa7b4] mb-1.5">
          <span>Level {profile?.level ?? 1}</span>
          <span>{xpIntoLevel}/250 XP to next level</span>
        </div>
        <div className="h-2.5 rounded-full bg-[#1c232d] overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#4c8dff] to-[#3fb950]"
            style={{ width: `${(xpIntoLevel / 250) * 100}%` }}
          />
        </div>
        <p className="text-xs text-[#9aa7b4] mt-2">{passedCount ?? 0} quizzes passed</p>
      </section>

      <section>
        <h2 className="font-bold mb-3">Badges</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          {(allBadges ?? []).map((b) => {
            const has = earnedIds.has(b.id);
            return (
              <div
                key={b.id}
                className={`rounded-xl border p-4 ${
                  has
                    ? "border-[#3fb950] bg-[#3fb950]/5"
                    : "border-[#2a323d] bg-[#12161c] opacity-60"
                }`}
              >
                <p className="font-semibold text-sm">
                  {has ? "🏅" : "🔒"} {b.title}
                </p>
                <p className="text-xs text-[#9aa7b4] mt-1">{b.description}</p>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
