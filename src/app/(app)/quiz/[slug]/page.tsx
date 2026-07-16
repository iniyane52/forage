import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getLesson } from "@/lib/content";
import { QuizRunner, type PublicQuestion } from "@/components/QuizRunner";

export default async function QuizPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const lesson = getLesson(slug);
  if (!lesson) notFound();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: row } = await supabase.from("lessons").select("id, title").eq("slug", slug).single();
  if (!row) notFound();

  // Study-first: the quiz only unlocks once the lesson is marked done.
  const { data: progress } = await supabase
    .from("lesson_progress")
    .select("status")
    .eq("user_id", user!.id)
    .eq("lesson_id", row.id)
    .maybeSingle();
  if (progress?.status !== "done") redirect(`/learn/${slug}`);

  const { data: questions } = await supabase
    .from("quiz_questions_public")
    .select("id, prompt, options, difficulty, style_tag, sort")
    .eq("lesson_id", row.id)
    .order("sort");

  return (
    <div className="max-w-2xl mx-auto">
      <p className="text-xs text-[#7d99a3] mb-1">
        <Link href={`/learn/${slug}`} className="hover:text-white">
          ← {row.title}
        </Link>
      </p>
      <h1 className="text-xl font-bold mb-6">Quiz: {row.title}</h1>
      {questions && questions.length > 0 ? (
        <QuizRunner
          lessonId={row.id}
          lessonSlug={slug}
          questions={questions as unknown as PublicQuestion[]}
        />
      ) : (
        <div className="rounded-xl border border-[#2a323d] bg-[#161b22] p-8 text-center">
          <p className="text-sm text-[#7d99a3]">
            Questions for this lesson are being authored — coming soon.
          </p>
        </div>
      )}
    </div>
  );
}
