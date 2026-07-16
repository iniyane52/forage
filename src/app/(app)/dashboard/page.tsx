import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Stagger, StaggerItem, AnimatedBar, FadeUp, ProgressRing } from "@/components/ui/motion";
import { ArrowRight, ChevronRight, GraduationCap, Mic, Sparkles } from "@/components/ui/icons";
import { PathTile } from "@/components/ui/PathTile";

type StreamRow = {
  id: string;
  slug: string;
  title: string;
  tagline: string;
  blurb: string;
  kind: "core" | "path";
  access_tier: "free" | "pro";
  sort: number;
};
type LessonRow = {
  id: string;
  slug: string;
  title: string;
  sort: number;
  modules: { sort: number; stream_id: string; streams: { slug: string } } | null;
};

export default async function Dashboard() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: profile }, { data: streams }, { data: lessons }, { data: progress }] =
    await Promise.all([
      supabase.from("profiles").select("plan").eq("user_id", user!.id).single(),
      supabase.from("streams").select("*").order("sort"),
      supabase.from("lessons").select("id, slug, title, sort, modules(sort, stream_id, streams(slug))"),
      supabase.from("lesson_progress").select("lesson_id, status").eq("user_id", user!.id),
    ]);

  const isPro = profile?.plan === "pro";
  const doneIds = new Set((progress ?? []).filter((p) => p.status === "done").map((p) => p.lesson_id));
  const perStream = new Map<string, { total: number; done: number }>();
  const coreLessons: LessonRow[] = [];
  for (const l of (lessons ?? []) as unknown as LessonRow[]) {
    const sid = l.modules?.stream_id;
    if (!sid) continue;
    const s = perStream.get(sid) ?? { total: 0, done: 0 };
    s.total += 1;
    if (doneIds.has(l.id)) s.done += 1;
    perStream.set(sid, s);
    if (l.modules?.streams?.slug === "common-core") coreLessons.push(l);
  }
  coreLessons.sort(
    (a, b) => (a.modules!.sort - b.modules!.sort) || (a.sort - b.sort)
  );
  const nextCore = coreLessons.find((l) => !doneIds.has(l.id));

  const all = (streams ?? []) as StreamRow[];
  const core = all.find((s) => s.kind === "core");
  const paths = all.filter((s) => s.kind === "path");
  const coreStat = core ? perStream.get(core.id) ?? { total: 0, done: 0 } : { total: 0, done: 0 };
  const corePct = coreStat.total ? Math.round((coreStat.done / coreStat.total) * 100) : 0;
  const coreComplete = coreStat.total > 0 && coreStat.done === coreStat.total;

  return (
    <div className="space-y-10">
      {/* Common Core — the free foundation, featured */}
      {core && (
        <FadeUp>
          <div className="glass rounded-3xl p-6 sm:p-8 relative overflow-hidden">
            <div className="absolute -right-10 -top-10 w-56 h-56 rounded-full bg-[#baff2e]/12 blur-[100px] pointer-events-none" />
            <div className="flex items-start justify-between gap-6 flex-wrap">
              <div className="flex-1 min-w-[240px]">
                <div className="flex items-center gap-2 mb-1">
                  <GraduationCap size={18} className="text-[#baff2e]" />
                  <span className="text-xs font-bold uppercase tracking-widest text-[#baff2e]">
                    Common Core · Free
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold" style={{ fontFamily: "var(--font-display)" }}>
                  {coreComplete ? "Common Core complete" : "Start with the Common Core"}
                </h1>
                <p className="text-sm text-[#7d99a3] mt-1 max-w-xl">{core.blurb}</p>
                {coreStat.total > 0 ? (
                  <div className="mt-4 max-w-md">
                    <AnimatedBar pct={corePct} />
                    <p className="text-xs text-[#7d99a3] mt-1.5">
                      {coreStat.done} of {coreStat.total} lessons · {corePct}%
                    </p>
                  </div>
                ) : (
                  <p className="mt-3 text-xs text-[#ffb020]">Lessons are being added — check back soon.</p>
                )}
                <div className="mt-4 flex gap-3 flex-wrap">
                  {nextCore ? (
                    <Link
                      href={`/learn/${nextCore.slug}`}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#00e5ff] text-[#05070a] text-sm font-semibold hover:bg-[#33ebff] transition-colors"
                    >
                      {coreStat.done > 0 ? "Continue" : "Begin"} <ArrowRight size={16} />
                    </Link>
                  ) : coreComplete ? (
                    <Link
                      href="#paths"
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-[#00e5ff] to-[#baff2e] text-[#05070a] text-sm font-semibold"
                    >
                      Choose your career path <ArrowRight size={16} />
                    </Link>
                  ) : null}
                  <Link
                    href="/stream/common-core"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl glass glass-hover text-sm"
                  >
                    View all modules
                  </Link>
                </div>
              </div>
              {coreStat.total > 0 && (
                <ProgressRing pct={corePct} size={88} strokeWidth={7} className="shrink-0">
                  <span className="text-lg font-bold" style={{ fontFamily: "var(--font-display)" }}>
                    {corePct}%
                  </span>
                </ProgressRing>
              )}
            </div>
          </div>
        </FadeUp>
      )}

      {/* Career Paths */}
      <section id="paths">
        <div className="flex items-baseline justify-between flex-wrap gap-2 mb-4">
          <h2 className="text-xl font-bold" style={{ fontFamily: "var(--font-display)" }}>
            Career Paths
          </h2>
          {!isPro && (
            <Link href="/pricing" className="text-sm text-[#ff3d81] hover:text-[#ff6ba0]">
              Unlock all paths →
            </Link>
          )}
        </div>
        <Stagger className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {paths.map((s) => {
            const st = perStream.get(s.id) ?? { total: 0, done: 0 };
            const locked = !isPro;
            return (
              <StaggerItem key={s.id}>
                <PathTile
                  slug={s.slug}
                  title={s.title}
                  tagline={s.tagline}
                  href={locked ? "/pricing" : `/stream/${s.slug}`}
                  doneCount={st.done}
                  totalCount={st.total}
                  locked={locked}
                />
              </StaggerItem>
            );
          })}
        </Stagger>
      </section>

      {/* Forage Interview */}
      <FadeUp>
        <Link
          href="/interview"
          className="group block glass glass-hover rounded-2xl p-5 relative overflow-hidden"
        >
          <div className="absolute -right-8 -bottom-8 w-40 h-40 rounded-full bg-[#3d8fff]/15 blur-3xl pointer-events-none" />
          <div className="flex items-center gap-4">
            <span className="shrink-0 w-11 h-11 rounded-xl grid place-items-center bg-[#3d8fff]/15 text-[#5ba3ff]">
              <Mic size={22} />
            </span>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold flex items-center gap-1.5">
                Forage Interview
                <ChevronRight
                  size={15}
                  className="text-[#7d99a3] opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all"
                />
              </h3>
              <p className="text-xs text-[#7d99a3] mt-0.5">
                A live, voice-first AI mock interview for your target role.
              </p>
            </div>
            <span
              className={`shrink-0 text-[11px] font-semibold px-2.5 py-1 rounded-lg flex items-center gap-1 ${
                isPro ? "bg-[#3fb950]/15 text-[#3fb950]" : "bg-[#ffb020]/15 text-[#ffb020]"
              }`}
            >
              {isPro ? (
                <>
                  <Sparkles size={12} /> Unlimited
                </>
              ) : (
                "3-min trial"
              )}
            </span>
          </div>
        </Link>
      </FadeUp>
    </div>
  );
}
