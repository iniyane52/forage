import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Stagger, StaggerItem, AnimatedBar, FadeUp } from "@/components/ui/motion";
import { streamIcon, Lock, ArrowRight, ChevronRight, GraduationCap } from "@/components/ui/icons";

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
          <div className="glass rounded-2xl p-6 relative overflow-hidden">
            <div className="absolute -right-10 -top-10 w-48 h-48 rounded-full bg-[#7c5cff]/15 blur-3xl pointer-events-none" />
            <div className="flex items-center gap-2 mb-1">
              <GraduationCap size={18} className="text-[#c86bff]" />
              <span className="text-xs font-bold uppercase tracking-widest text-[#c86bff]">
                Common Core · Free
              </span>
            </div>
            <h1 className="text-2xl font-bold" style={{ fontFamily: "var(--font-display)" }}>
              {coreComplete ? "Common Core complete" : "Start with the Common Core"}
            </h1>
            <p className="text-sm text-[#a79fc0] mt-1 max-w-xl">{core.blurb}</p>
            {coreStat.total > 0 ? (
              <div className="mt-4 max-w-md">
                <AnimatedBar pct={corePct} />
                <p className="text-xs text-[#a79fc0] mt-1.5">
                  {coreStat.done} of {coreStat.total} lessons · {corePct}%
                </p>
              </div>
            ) : (
              <p className="mt-3 text-xs text-[#e3a008]">Lessons are being added — check back soon.</p>
            )}
            <div className="mt-4 flex gap-3 flex-wrap">
              {nextCore ? (
                <Link
                  href={`/learn/${nextCore.slug}`}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#7c5cff] text-white text-sm font-semibold hover:bg-[#6a4ff0] transition-colors"
                >
                  {coreStat.done > 0 ? "Continue" : "Begin"} <ArrowRight size={16} />
                </Link>
              ) : coreComplete ? (
                <Link
                  href="#paths"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-[#7c5cff] to-[#c86bff] text-white text-sm font-semibold"
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
        </FadeUp>
      )}

      {/* Career Paths */}
      <section id="paths">
        <div className="flex items-baseline justify-between flex-wrap gap-2 mb-4">
          <h2 className="text-xl font-bold" style={{ fontFamily: "var(--font-display)" }}>
            Career Paths
          </h2>
          {!isPro && (
            <Link href="/pricing" className="text-sm text-[#c86bff] hover:text-[#e0a3ff]">
              Unlock all paths →
            </Link>
          )}
        </div>
        <Stagger className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {paths.map((s) => {
            const st = perStream.get(s.id) ?? { total: 0, done: 0 };
            const pct = st.total ? Math.round((st.done / st.total) * 100) : 0;
            const Icon = streamIcon[s.slug] ?? streamIcon.foundations;
            const locked = !isPro;
            return (
              <StaggerItem key={s.id}>
                <Link
                  href={locked ? "/pricing" : `/stream/${s.slug}`}
                  className="group block glass glass-hover rounded-2xl p-5 h-full relative"
                >
                  {locked && (
                    <span className="absolute top-4 right-4 text-[#a79fc0]">
                      <Lock size={16} />
                    </span>
                  )}
                  <span className="shrink-0 w-11 h-11 rounded-xl grid place-items-center bg-[#7c5cff]/15 text-[#a78bfa]">
                    <Icon size={22} />
                  </span>
                  <h3 className="font-bold mt-3 flex items-center gap-1">
                    {s.title}
                    <ChevronRight
                      size={15}
                      className="text-[#a79fc0] opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all"
                    />
                  </h3>
                  <p className="text-xs text-[#a79fc0] mt-1">{s.tagline}</p>
                  {!locked && st.total > 0 && (
                    <div className="mt-3">
                      <AnimatedBar pct={pct} className="h-1.5" />
                      <p className="text-[11px] text-[#a79fc0] mt-1">
                        {st.done}/{st.total} · {pct}%
                      </p>
                    </div>
                  )}
                  {locked && (
                    <p className="mt-3 text-[11px] font-semibold text-[#c86bff]">
                      Unlock with Pro
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
