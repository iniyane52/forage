import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getLesson, getAdjacent } from "@/lib/content";
import { MarkDoneButton, NotesBox, CheckReveal } from "@/components/LessonActions";
import { TutorDrawer } from "@/components/TutorDrawer";
import { FadeUp } from "@/components/ui/motion";
import {
  BookOpen,
  Lightbulb,
  Code2,
  XCircle,
  AlertTriangle,
  Target,
  HelpCircle,
  PenLine,
  ArrowLeft,
  ArrowRight,
  ListChecks,
  ExternalLink,
  BookMarked,
  Lock,
  resourceIcon,
} from "@/components/ui/icons";
import type { LucideIcon } from "lucide-react";

function Label({
  children,
  color = "#00e5ff",
  icon: Icon,
}: {
  children: React.ReactNode;
  color?: string;
  icon: LucideIcon;
}) {
  return (
    <p
      className="text-xs font-bold uppercase tracking-widest mt-8 mb-2 flex items-center gap-1.5"
      style={{ color }}
    >
      <Icon size={14} /> {children}
    </p>
  );
}

export default async function LessonPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const lesson = getLesson(slug);
  if (!lesson) notFound();
  const { topic, module: mod } = lesson;
  const { prev, next } = getAdjacent(slug);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: row } = await supabase
    .from("lessons")
    .select("id, modules(streams(slug, title, access_tier))")
    .eq("slug", slug)
    .single();
  if (!row) notFound();

  const stream = (row.modules as unknown as { streams: { slug: string; title: string; access_tier: string } } | null)
    ?.streams;
  if (stream?.access_tier === "pro") {
    const { data: profile } = await supabase
      .from("profiles")
      .select("plan")
      .eq("user_id", user!.id)
      .single();
    if (profile?.plan !== "pro") redirect("/pricing");
  }

  const [{ data: progress }, { count: questionCount }] = await Promise.all([
    supabase
      .from("lesson_progress")
      .select("status, notes")
      .eq("user_id", user!.id)
      .eq("lesson_id", row.id)
      .maybeSingle(),
    supabase
      .from("quiz_questions_public")
      .select("id", { count: "exact", head: true })
      .eq("lesson_id", row.id),
  ]);

  return (
    <FadeUp>
      <article className="max-w-3xl mx-auto">
        <p className="text-xs text-[#7d99a3]">
          <Link href="/dashboard" className="hover:text-white transition-colors">
            Dashboard
          </Link>{" "}
          /{" "}
          <Link
            href={`/stream/${stream?.slug ?? "common-core"}`}
            className="hover:text-white transition-colors"
          >
            {stream?.title ?? mod.title}
          </Link>
        </p>
        <h1 className="display text-3xl sm:text-4xl md:text-5xl mt-3 mb-1">{topic.title}</h1>

        <Label icon={BookOpen}>What it is</Label>
        <p className="lead">{topic.concept}</p>

        {topic.analogy && (
          <>
            <Label color="#b967ff" icon={Lightbulb}>
              Analogy
            </Label>
            <p className="text-[15px] leading-relaxed">{topic.analogy}</p>
          </>
        )}

        {topic.examples && topic.examples.length > 0 && (
          <>
            <Label icon={Code2}>Worked example</Label>
            {topic.examples.map((e, i) => (
              <div key={i} className="mb-3 rounded-xl overflow-hidden border border-white/[0.08]">
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/[0.03] border-b border-white/[0.06]">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#f85149]/70" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#ffb020]/70" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#3fb950]/70" />
                </div>
                <pre className="bg-black/40 p-4 overflow-x-auto text-[13.5px] leading-relaxed font-mono whitespace-pre-wrap">
                  {e.code}
                </pre>
                {e.note && <p className="text-xs text-[#7d99a3] px-3 py-2 bg-white/[0.02]">{e.note}</p>}
              </div>
            ))}
          </>
        )}

        {topic.warn && (
          <div className="mt-4 rounded-xl border border-[#f85149]/40 bg-[#f85149]/10 px-4 py-3 text-sm flex items-start gap-2">
            <AlertTriangle size={18} className="text-[#f85149] mt-0.5 shrink-0" />
            <span>
              <b className="text-[#f85149]">Safety:</b> {topic.warn}
            </span>
          </div>
        )}

        {topic.mistakes && topic.mistakes.length > 0 && (
          <>
            <Label color="#ffb020" icon={XCircle}>
              Common mistakes
            </Label>
            <ul className="space-y-1.5 text-sm">
              {topic.mistakes.map((m, i) => (
                <li key={i} className="flex items-start gap-2">
                  <XCircle size={15} className="text-[#ffb020] mt-1 shrink-0" />
                  <span>{m}</span>
                </li>
              ))}
            </ul>
          </>
        )}

        <Label color="#3fb950" icon={Target}>
          Your hands-on task
        </Label>
        <p className="text-[15px] leading-relaxed">{topic.handsOn}</p>

        <Label color="#7d99a3" icon={Target}>
          Done when
        </Label>
        <p className="text-sm glass rounded-xl px-4 py-2.5">{topic.doneWhen}</p>

        {topic.keyTakeaways && topic.keyTakeaways.length > 0 && (
          <>
            <Label color="#ff3d81" icon={ListChecks}>
              Key takeaways
            </Label>
            <ul className="space-y-1.5 text-sm">
              {topic.keyTakeaways.map((k, i) => (
                <li key={i} className="flex items-start gap-2">
                  <ListChecks size={15} className="text-[#ff3d81] mt-1 shrink-0" />
                  <span>{k}</span>
                </li>
              ))}
            </ul>
          </>
        )}

        {topic.resources && topic.resources.length > 0 && (
          <>
            <Label color="#6ff9ff" icon={BookMarked}>
              Keep exploring
            </Label>
            {(() => {
              const [primary, ...rest] = topic.resources;
              const PrimaryIcon = resourceIcon[primary.kind] ?? BookMarked;
              return (
                <>
                  <a
                    href={primary.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="glass glass-hover rounded-xl px-4 py-3.5 flex items-center gap-3 text-sm group border-[#6ff9ff]/25"
                  >
                    <span className="shrink-0 w-9 h-9 rounded-lg grid place-items-center bg-[#6ff9ff]/12 text-[#6ff9ff]">
                      <PrimaryIcon size={17} />
                    </span>
                    <span className="flex-1 min-w-0">
                      <span className="block text-[10px] font-bold uppercase tracking-widest text-[#6ff9ff]/80">
                        {primary.kind === "docs" ? "Official docs" : "Primary resource"}
                      </span>
                      <span className="block font-medium truncate">{primary.label}</span>
                    </span>
                    <ExternalLink size={14} className="text-[#7d99a3] shrink-0" />
                  </a>
                  {rest.length > 0 && (
                    <div className="grid sm:grid-cols-2 gap-2 mt-2">
                      {rest.map((r, i) => {
                        const RIcon = resourceIcon[r.kind] ?? BookMarked;
                        return (
                          <a
                            key={i}
                            href={r.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="glass glass-hover rounded-xl px-3 py-2.5 flex items-center gap-2.5 text-sm group"
                          >
                            <RIcon size={15} className="text-[#7d99a3] shrink-0" />
                            <span className="flex-1 min-w-0 truncate">{r.label}</span>
                            <ExternalLink size={13} className="text-[#7d99a3] shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </a>
                        );
                      })}
                    </div>
                  )}
                </>
              );
            })()}
          </>
        )}

        {topic.checks && topic.checks.length > 0 && (
          <>
            <Label color="#59d3c5" icon={HelpCircle}>
              Check yourself
            </Label>
            <div className="space-y-2">
              {topic.checks.map((c, i) => (
                <CheckReveal key={i} q={c.q} a={c.a} />
              ))}
            </div>
          </>
        )}

        <div className="mt-8">
          <Label icon={PenLine}>Your notes</Label>
          <NotesBox lessonId={row.id} initial={progress?.notes ?? ""} />
        </div>

        {(() => {
          const isDone = progress?.status === "done";
          return (
            <div className="mt-6 flex items-center gap-3 flex-wrap">
              <MarkDoneButton lessonId={row.id} initiallyDone={isDone} />
              {(questionCount ?? 0) === 0 ? (
                <span className="text-xs text-[#7d99a3] glass rounded-xl px-3 py-2">
                  Study-only lesson — no quiz needed
                </span>
              ) : isDone ? (
                <Link
                  href={`/quiz/${slug}`}
                  className="px-4 py-2 rounded-xl text-sm font-semibold bg-[#00e5ff] text-[#05070a] hover:bg-[#33ebff] transition-colors"
                >
                  Take the quiz ({questionCount} questions) →
                </Link>
              ) : (
                <span
                  title="Study the lesson and mark it done to unlock the quiz"
                  className="flex items-center gap-1.5 text-xs text-[#7d99a3] glass rounded-xl px-3 py-2 cursor-not-allowed"
                >
                  <Lock size={13} /> Study this first to unlock the quiz
                </span>
              )}
            </div>
          );
        })()}

        <nav className="mt-10 pt-6 border-t border-white/[0.06] flex justify-between text-sm gap-4">
          {prev ? (
            <Link
              href={`/learn/${prev.topic.id}`}
              className="text-[#7d99a3] hover:text-white flex items-center gap-1 transition-colors"
            >
              <ArrowLeft size={15} /> {prev.topic.title}
            </Link>
          ) : (
            <span />
          )}
          {next && (
            <Link
              href={`/learn/${next.topic.id}`}
              className="text-[#7d99a3] hover:text-white text-right flex items-center gap-1 transition-colors"
            >
              {next.topic.title} <ArrowRight size={15} />
            </Link>
          )}
        </nav>
      </article>

      <TutorDrawer
        lessonTitle={topic.title}
        concept={topic.concept}
        analogy={topic.analogy}
        handsOn={topic.handsOn}
        doneWhen={topic.doneWhen}
      />
    </FadeUp>
  );
}
