import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getLesson, getAdjacent } from "@/lib/content";
import { MarkDoneButton, NotesBox, CheckReveal } from "@/components/LessonActions";
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
} from "@/components/ui/icons";
import type { LucideIcon } from "lucide-react";

function Label({
  children,
  color = "#4c8dff",
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

  const { data: row } = await supabase.from("lessons").select("id").eq("slug", slug).single();
  if (!row) notFound();

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
        <p className="text-xs text-[#9aa7b4]">
          <Link href="/dashboard" className="hover:text-white transition-colors">
            Dashboard
          </Link>{" "}
          /{" "}
          <Link href="/stream/foundations" className="hover:text-white transition-colors">
            {mod.title}
          </Link>
        </p>
        <h1 className="text-2xl font-bold mt-2" style={{ fontFamily: "var(--font-display)" }}>
          {topic.title}
        </h1>

        <Label icon={BookOpen}>What it is</Label>
        <p className="text-[15px] leading-relaxed">{topic.concept}</p>

        {topic.analogy && (
          <>
            <Label color="#a371f7" icon={Lightbulb}>
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
                  <span className="w-2.5 h-2.5 rounded-full bg-[#e3a008]/70" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#3fb950]/70" />
                </div>
                <pre className="bg-black/40 p-4 overflow-x-auto text-[13.5px] leading-relaxed font-mono whitespace-pre-wrap">
                  {e.code}
                </pre>
                {e.note && <p className="text-xs text-[#9aa7b4] px-3 py-2 bg-white/[0.02]">{e.note}</p>}
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
            <Label color="#e3a008" icon={XCircle}>
              Common mistakes
            </Label>
            <ul className="space-y-1.5 text-sm">
              {topic.mistakes.map((m, i) => (
                <li key={i} className="flex items-start gap-2">
                  <XCircle size={15} className="text-[#e3a008] mt-1 shrink-0" />
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

        <Label color="#9aa7b4" icon={Target}>
          Done when
        </Label>
        <p className="text-sm glass rounded-xl px-4 py-2.5">{topic.doneWhen}</p>

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

        <div className="mt-6 flex items-center gap-3 flex-wrap">
          <MarkDoneButton lessonId={row.id} initiallyDone={progress?.status === "done"} />
          {(questionCount ?? 0) > 0 ? (
            <Link
              href={`/quiz/${slug}`}
              className="px-4 py-2 rounded-xl text-sm font-semibold bg-[#4c8dff] text-white hover:bg-[#3a7bee] transition-colors"
            >
              Take the quiz ({questionCount} questions) →
            </Link>
          ) : (
            <span className="text-xs text-[#9aa7b4] glass rounded-xl px-3 py-2">
              Quiz coming soon
            </span>
          )}
        </div>

        <nav className="mt-10 pt-6 border-t border-white/[0.06] flex justify-between text-sm gap-4">
          {prev ? (
            <Link
              href={`/learn/${prev.topic.id}`}
              className="text-[#9aa7b4] hover:text-white flex items-center gap-1 transition-colors"
            >
              <ArrowLeft size={15} /> {prev.topic.title}
            </Link>
          ) : (
            <span />
          )}
          {next && (
            <Link
              href={`/learn/${next.topic.id}`}
              className="text-[#9aa7b4] hover:text-white text-right flex items-center gap-1 transition-colors"
            >
              {next.topic.title} <ArrowRight size={15} />
            </Link>
          )}
        </nav>
      </article>
    </FadeUp>
  );
}
