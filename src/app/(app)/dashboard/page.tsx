import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getAllLessons } from "@/lib/content";
import { Stagger, StaggerItem, AnimatedBar, FadeUp } from "@/components/ui/motion";
import { streamIcon, Lock, ArrowRight, ChevronRight } from "@/components/ui/icons";

type StreamRow = { id: string; slug: string; title: string; tagline: string; sort: number };

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

  const bySlugDone = new Set(
    (lessonCounts ?? []).filter((l) => doneIds.has(l.id)).map((l) => l.slug)
  );
  const next = getAllLessons().find((l) => !bySlugDone.has(l.topic.id));

  return (
    <div className="space-y-8">
      {next && (
        <FadeUp>
          <div className="glass glass-hover rounded-2xl p-6 relative overflow-hidden">
            <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full bg-[#7c5cff]/10 blur-2xl pointer-events-none" />
            <p className="text-xs font-bold uppercase tracking-widest text-[#7c5cff] mb-1">
              Your next step
            </p>
            <h2 className="text-xl font-bold" style={{ fontFamily: "var(--font-display)" }}>
              {next.topic.title}
            </h2>
            <p className="text-sm text-[#9aa7b4] mt-1">{next.module.title}</p>
            <Link
              href={`/learn/${next.topic.id}`}
              className="inline-flex items-center gap-1.5 mt-4 px-4 py-2 rounded-xl bg-[#7c5cff] text-white text-sm font-semibold hover:bg-[#6a4ff0] transition-colors"
            >
              Continue learning <ArrowRight size={16} />
            </Link>
          </div>
        </FadeUp>
      )}

      <section>
        <h1 className="text-2xl font-bold mb-4" style={{ fontFamily: "var(--font-display)" }}>
          Your streams
        </h1>
        <Stagger className="grid sm:grid-cols-2 gap-4">
          {((streams ?? []) as StreamRow[]).map((s) => {
            const st = perStream.get(s.id) ?? { total: 0, done: 0 };
            const pct = st.total ? Math.round((st.done / st.total) * 100) : 0;
            const live = st.total > 0;
            const Icon = streamIcon[s.slug] ?? streamIcon.foundations;
            return (
              <StaggerItem key={s.id}>
                <Link
                  href={live ? `/stream/${s.slug}` : "#"}
                  className={`group block glass rounded-2xl p-5 h-full ${
                    live ? "glass-hover hover:-translate-y-0.5" : "opacity-70 cursor-default"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span
                      className={`shrink-0 w-11 h-11 rounded-xl grid place-items-center ${
                        live ? "bg-[#7c5cff]/15 text-[#7c5cff]" : "bg-white/[0.05] text-[#9aa7b4]"
                      }`}
                    >
                      <Icon size={22} />
                    </span>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold flex items-center gap-1">
                        {s.title}
                        {live && (
                          <ChevronRight
                            size={16}
                            className="text-[#9aa7b4] opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all"
                          />
                        )}
                      </h3>
                      <p className="text-xs text-[#9aa7b4] mt-0.5">{s.tagline}</p>
                    </div>
                  </div>
                  {live ? (
                    <div className="mt-4">
                      <AnimatedBar pct={pct} />
                      <p className="text-xs text-[#9aa7b4] mt-1.5">
                        {st.done} of {st.total} lessons · {pct}%
                      </p>
                    </div>
                  ) : (
                    <p className="mt-4 text-xs font-semibold text-[#e3a008] flex items-center gap-1.5">
                      <Lock size={13} /> In production — launching module by module
                    </p>
                  )}
                </Link>
              </StaggerItem>
            );
          })}
        </Stagger>
      </section>
    </div>
  );
}
