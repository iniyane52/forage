import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getLesson, getAdjacent } from "@/lib/content";
import { MarkDoneButton, NotesBox, CheckReveal } from "@/components/LessonActions";

function Label({ children, color = "#4c8dff" }: { children: React.ReactNode; color?: string }) {
  return (
    <p className="text-xs font-bold uppercase tracking-widest mt-8 mb-2" style={{ color }}>
      {children}
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
    <article className="max-w-3xl mx-auto">
      <p className="text-xs text-[#9aa7b4]">
        <Link href="/dashboard" className="hover:text-white">Dashboard</Link> /{" "}
        <Link href="/stream/foundations" className="hover:text-white">
          {mod.title}
        </Link>
      </p>
      <h1 className="text-2xl font-bold mt-2">{topic.title}</h1>

      <Label>What it is</Label>
      <p className="text-[15px] leading-relaxed">{topic.concept}</p>

      {topic.analogy && (
        <>
          <Label color="#c98bff">Analogy</Label>
          <p className="text-[15px] leading-relaxed">{topic.analogy}</p>
        </>
      )}

      {topic.examples && topic.examples.length > 0 && (
        <>
          <Label>Worked example</Label>
          {topic.examples.map((e, i) => (
            <div key={i} className="mb-3">
              <pre className="bg-[#0b0f14] border border-[#2a323d] rounded-lg p-4 overflow-x-auto text-[13.5px] leading-relaxed font-mono whitespace-pre-wrap">
                {e.code}
              </pre>
              {e.note && <p className="text-xs text-[#9aa7b4] mt-1.5">{e.note}</p>}
            </div>
          ))}
        </>
      )}

      {topic.warn && (
        <div className="mt-4 rounded-lg border border-[#f85149] bg-[#f85149]/10 px-4 py-3 text-sm">
          <b className="text-[#f85149]">⚠ Safety:</b> {topic.warn}
        </div>
      )}

      {topic.mistakes && topic.mistakes.length > 0 && (
        <>
          <Label color="#e3a008">Common mistakes</Label>
          <ul className="list-disc pl-5 space-y-1 text-sm">
            {topic.mistakes.map((m, i) => (
              <li key={i}>{m}</li>
            ))}
          </ul>
        </>
      )}

      <Label color="#3fb950">Your hands-on task</Label>
      <p className="text-[15px] leading-relaxed">{topic.handsOn}</p>

      <Label color="#9aa7b4">Done when</Label>
      <p className="text-sm bg-[#22303f] rounded-lg px-4 py-2.5">{topic.doneWhen}</p>

      {topic.checks && topic.checks.length > 0 && (
        <>
          <Label color="#59d3c5">Check yourself</Label>
          <div className="space-y-2">
            {topic.checks.map((c, i) => (
              <CheckReveal key={i} q={c.q} a={c.a} />
            ))}
          </div>
        </>
      )}

      <div className="mt-8">
        <NotesBox lessonId={row.id} initial={progress?.notes ?? ""} />
      </div>

      <div className="mt-6 flex items-center gap-3 flex-wrap">
        <MarkDoneButton lessonId={row.id} initiallyDone={progress?.status === "done"} />
        {(questionCount ?? 0) > 0 ? (
          <Link
            href={`/quiz/${slug}`}
            className="px-4 py-2 rounded-lg text-sm font-semibold bg-[#4c8dff] text-white hover:bg-[#3a7bee]"
          >
            Take the quiz ({questionCount} questions) →
          </Link>
        ) : (
          <span className="text-xs text-[#9aa7b4] border border-[#2a323d] rounded-lg px-3 py-2">
            Quiz coming soon
          </span>
        )}
      </div>

      <nav className="mt-10 pt-6 border-t border-[#2a323d] flex justify-between text-sm">
        {prev ? (
          <Link href={`/learn/${prev.topic.id}`} className="text-[#9aa7b4] hover:text-white">
            ← {prev.topic.title}
          </Link>
        ) : (
          <span />
        )}
        {next && (
          <Link href={`/learn/${next.topic.id}`} className="text-[#9aa7b4] hover:text-white text-right">
            {next.topic.title} →
          </Link>
        )}
      </nav>
    </article>
  );
}
