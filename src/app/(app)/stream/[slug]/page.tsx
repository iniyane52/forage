import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AnimatedBar, Stagger, StaggerItem } from "@/components/ui/motion";
import { streamIcon, CheckCircle2, ChevronRight, Lock } from "@/components/ui/icons";

export default async function StreamPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: stream } = await supabase.from("streams").select("*").eq("slug", slug).single();
  if (!stream) notFound();

  // Access gate: pro streams require a pro plan.
  const { data: profile } = await supabase
    .from("profiles")
    .select("plan")
    .eq("user_id", user!.id)
    .single();
  if (stream.access_tier === "pro" && profile?.plan !== "pro") {
    const Icon = streamIcon[stream.slug] ?? streamIcon.foundations;
    return (
      <div className="max-w-lg mx-auto text-center py-12">
        <span className="w-14 h-14 rounded-2xl grid place-items-center bg-[#00e5ff]/15 text-[#6ff9ff] mx-auto">
          <Icon size={28} />
        </span>
        <h1 className="text-2xl font-bold mt-4" style={{ fontFamily: "var(--font-display)" }}>
          {stream.title}
        </h1>
        <p className="text-sm text-[#7d99a3] mt-2">{stream.blurb}</p>
        <div className="glass rounded-2xl p-6 mt-6 text-left">
          <p className="text-sm flex items-center gap-2 font-semibold">
            <Lock size={16} className="text-[#ff3d81]" /> This is a Pro career path
          </p>
          <p className="text-sm text-[#7d99a3] mt-2">
            Finish the free Common Core first, then unlock any career path with Pro.
          </p>
          <Link
            href="/pricing"
            className="inline-block mt-4 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#00e5ff] to-[#ff3d81] text-[#05070a] text-sm font-semibold"
          >
            See Pro plans
          </Link>
        </div>
        <Link href="/dashboard" className="inline-block mt-6 text-sm text-[#7d99a3] hover:text-white">
          ← Back to dashboard
        </Link>
      </div>
    );
  }

  const [
    { data: modules, error: modulesError },
    { data: progress, error: progressError },
    { data: results, error: resultsError },
  ] = await Promise.all([
    supabase
      .from("modules")
      .select("id, slug, title, why, sort, lessons(id, slug, title, sort)")
      .eq("stream_id", stream.id)
      .order("sort"),
    supabase.from("lesson_progress").select("lesson_id, status").eq("user_id", user!.id),
    supabase.from("quiz_results").select("lesson_id, passed, best_score").eq("user_id", user!.id),
  ]);

  if (modulesError || progressError || resultsError) {
    throw new Error("Couldn't load this career path. Please try again.");
  }

  const done = new Set((progress ?? []).filter((p) => p.status === "done").map((p) => p.lesson_id));
  const quizPassed = new Map((results ?? []).map((r) => [r.lesson_id, r]));
  const Icon = streamIcon[stream.slug] ?? streamIcon.foundations;

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs text-[#7d99a3]">
          <Link href="/dashboard" className="hover:text-white transition-colors">
            Dashboard
          </Link>{" "}
          / {stream.title}
        </p>
        <h1
          className="text-2xl font-bold mt-1 flex items-center gap-2.5"
          style={{ fontFamily: "var(--font-display)" }}
        >
          <span className="w-9 h-9 rounded-xl grid place-items-center bg-[#00e5ff]/15 text-[#00e5ff]">
            <Icon size={20} />
          </span>
          {stream.title}
        </h1>
        <p className="text-sm text-[#7d99a3] mt-1">{stream.tagline}</p>
      </div>

      <Stagger className="space-y-6">
        {(modules ?? []).map((m) => {
          const lessons = (m.lessons as { id: string; slug: string; title: string; sort: number }[])
            .slice()
            .sort((a, b) => a.sort - b.sort);
          const doneCount = lessons.filter((l) => done.has(l.id)).length;
          const pct = lessons.length ? Math.round((doneCount / lessons.length) * 100) : 0;
          return (
            <StaggerItem key={m.id}>
              <section className="glass rounded-2xl p-5">
                <div className="flex items-baseline justify-between gap-3 flex-wrap">
                  <h2 className="text-lg font-bold" style={{ fontFamily: "var(--font-display)" }}>
                    {m.title}
                  </h2>
                  <span className="text-xs text-[#7d99a3]">
                    {doneCount}/{lessons.length} done
                  </span>
                </div>
                <AnimatedBar pct={pct} className="mt-2 h-1.5" />
                <p className="text-xs text-[#7d99a3] mt-2">{m.why}</p>
                <ul className="mt-4 divide-y divide-white/[0.06]">
                  {lessons.map((l, i) => {
                    const r = quizPassed.get(l.id);
                    const isDone = done.has(l.id);
                    return (
                      <li key={l.id}>
                        <Link href={`/learn/${l.slug}`} className="flex items-center gap-3 py-2.5 group">
                          <span
                            className={`w-6 h-6 rounded-full grid place-items-center text-[10px] shrink-0 ${
                              isDone
                                ? "text-[#3fb950]"
                                : "border border-white/10 text-[#7d99a3]"
                            }`}
                          >
                            {isDone ? <CheckCircle2 size={20} /> : i + 1}
                          </span>
                          <span className="text-sm group-hover:text-white flex-1 transition-colors">
                            {l.title}
                          </span>
                          {r?.passed && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#3fb950]/15 text-[#3fb950] font-semibold">
                              quiz {r.best_score}%
                            </span>
                          )}
                          <ChevronRight
                            size={15}
                            className="text-[#7d99a3] opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all"
                          />
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </section>
            </StaggerItem>
          );
        })}
      </Stagger>
    </div>
  );
}
