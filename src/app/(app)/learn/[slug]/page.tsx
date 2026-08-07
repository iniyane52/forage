import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getLesson, getAdjacent, estimateReadingMinutes } from "@/lib/content";
import { highlightCode } from "@/lib/highlight";
import { pathMeta, LIGHT_ACCENT } from "@/lib/pathMeta";
import { TutorDrawer } from "@/components/TutorDrawer";
import { LessonStepFlow } from "@/components/LessonStepFlow";

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

  const [
    { data: progress, error: progressError },
    { count: questionCount, error: countError },
  ] = await Promise.all([
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

  if (progressError || countError) {
    throw new Error("Couldn't load this lesson. Please try again.");
  }

  // Per-stream identity thread (progress bar / outline / title accent bar) --
  // deliberately NOT applied to the section Labels below, which already use a
  // considered, distinct rainbow of colors per section type (concept/analogy/
  // mistakes/etc.); flattening those to one accent would erase that existing design.
  // In light mode this per-path neon is replaced by one calm blue (LIGHT_ACCENT) --
  // resolved via the --lesson-accent-scope CSS custom-property cascade below, not JS,
  // so there's no theme-flip flash.
  const accent = pathMeta[stream?.slug ?? ""]?.accent ?? "#00e5ff";
  const readingMinutes = estimateReadingMinutes(topic);
  const highlightedExamples = topic.examples ? await Promise.all(topic.examples.map((e) => highlightCode(e.code))) : [];

  const sharedProps = {
    slug,
    topic,
    mod,
    stream,
    accent,
    readingMinutes,
    highlightedExamples,
    lessonId: row.id,
    progress,
    questionCount: questionCount ?? 0,
    prev,
    next,
  };

  const accentScopeStyle = {
    "--lesson-accent-dark": accent,
    "--lesson-accent-light": LIGHT_ACCENT,
  } as React.CSSProperties;

  return (
    <>
      <div className="lesson-accent-scope" style={accentScopeStyle}>
        <LessonStepFlow {...sharedProps} />
      </div>
      <TutorDrawer
        lessonTitle={topic.title}
        concept={topic.concept}
        analogy={topic.analogy}
        handsOn={topic.handsOn}
        doneWhen={topic.doneWhen}
      />
    </>
  );
}
