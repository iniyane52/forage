import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getAllLessons } from "@/lib/content";

type StreamRow = { id: string; slug: string; title: string; tagline: string; icon: string; sort: number };

export default async function Dashboard() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: streams }, { data: lessonCounts }, { data: progress }] = await Promise.all([
    supabase.from("streams").select("*").order("sort"),
    supabase.from("lessons").select("id, slug, modules(stream_id)"),
    supabase.from("lesson_progress").select("lesson_id, status").eq("user_id", user!.id),
  ]);

  const doneIds = new Set((progress ?? []).filter((p) => p.status === "done").map((p) => p.lesson_id));
  const perStream = new Map<string, { total: number; done: number }>();
  for (const l of lessonCounts ?? []) {
    const sid = (l.modules as unknown as { stream_id: string })?.stream_id;
    if (!sid) continue;
    const s = perStream.get(sid) ?? { total: 0, done: 0 };
    s.total += 1;
    if (doneIds.has(l.id)) s.done += 1;
    perStream.set(sid, s);
  }

  // "Your next step" = first Stream-1 lesson not yet done
  const bySlugDone = new Set(
    (lessonCounts ?? []).filter((l) => doneIds.has(l.id)).map((l) => l.slug)
  );
  const next = getAllLessons().find((l) => !bySlugDone.has(l.topic.id));

  return (
    <div className="space-y-8">
      {next && (
        <section className="rounded-2xl border border-[#4c8dff] bg-gradient-to-br from-[#13233d] to-[#0e1116] p-6">
          <p className="text-xs font-bold uppercase tracking-widest text-[#4c8dff] mb-1">
            Your next step
          </p>
          <h2 className="text-xl font-bold">{next.topic.title}</h2>
          <p className="text-sm text-[#9aa7b4] mt-1">{next.module.title}</p>
          <Link
            href={`/learn/${next.topic.id}`}
            className="inline-block mt-4 px-4 py-2 rounded-lg bg-[#4c8dff] text-white text-sm font-semibold hover:bg-[#3a7bee]"
          >
            Continue learning →
          </Link>
        </section>
      )}

      <section>
        <h1 className="text-2xl font-bold mb-4">Your streams</h1>
        <div className="grid sm:grid-cols-2 gap-4">
          {((streams ?? []) as StreamRow[]).map((s) => {
            const st = perStream.get(s.id) ?? { total: 0, done: 0 };
            const pct = st.total ? Math.round((st.done / st.total) * 100) : 0;
            const live = st.total > 0;
            return (
              <Link
                key={s.id}
                href={live ? `/stream/${s.slug}` : "#"}
                className={`rounded-2xl border p-5 transition-colors ${
                  live
                    ? "border-[#2a323d] bg-[#161b22] hover:border-[#4c8dff]"
                    : "border-[#2a323d] bg-[#12161c] opacity-70 cursor-default"
                }`}
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{s.icon}</span>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold">{s.title}</h3>
                    <p className="text-xs text-[#9aa7b4] mt-0.5">{s.tagline}</p>
                  </div>
                </div>
                {live ? (
                  <div className="mt-4">
                    <div className="h-2 rounded-full bg-[#1c232d] overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#4c8dff] to-[#3fb950]"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <p className="text-xs text-[#9aa7b4] mt-1.5">
                      {st.done} of {st.total} lessons · {pct}%
                    </p>
                  </div>
                ) : (
                  <p className="mt-4 text-xs font-semibold text-[#e3a008]">
                    In production — launching module by module
                  </p>
                )}
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
