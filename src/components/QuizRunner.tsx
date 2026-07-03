"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export type PublicQuestion = {
  id: string;
  prompt: string;
  options: string[];
  difficulty: number;
  style_tag: string;
};

type Feedback = {
  is_correct: boolean;
  correct_index: number;
  explanation: string;
  xp_awarded: number;
};

function shuffled(n: number): number[] {
  const a = Array.from({ length: n }, (_, i) => i);
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function QuizRunner({
  lessonId,
  lessonSlug,
  questions,
}: {
  lessonId: string;
  lessonSlug: string;
  questions: PublicQuestion[];
}) {
  const router = useRouter();
  const supabase = createClient();
  const [i, setI] = useState(0);
  const [chosen, setChosen] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [busy, setBusy] = useState(false);
  const [xpTotal, setXpTotal] = useState(0);
  const [result, setResult] = useState<{ score: number; passed: boolean } | null>(null);

  // stable per-question option shuffle (maps display position -> original index)
  const orders = useMemo(() => questions.map((q) => shuffled(q.options.length)), [questions]);

  const q = questions[i];
  const order = orders[i];

  async function answer(displayIdx: number) {
    if (feedback || busy) return;
    const originalIdx = order[displayIdx];
    setChosen(displayIdx);
    setBusy(true);
    const { data, error } = await supabase.rpc("submit_answer", {
      p_question_id: q.id,
      p_chosen: originalIdx,
    });
    setBusy(false);
    if (error) return;
    const fb = data as Feedback;
    setFeedback(fb);
    if (fb.xp_awarded > 0) setXpTotal((x) => x + fb.xp_awarded);
  }

  async function next() {
    if (i + 1 < questions.length) {
      setI(i + 1);
      setChosen(null);
      setFeedback(null);
    } else {
      setBusy(true);
      const { data } = await supabase.rpc("finish_quiz", { p_lesson_id: lessonId });
      setBusy(false);
      setResult(data as { score: number; passed: boolean });
      router.refresh();
    }
  }

  if (result) {
    return (
      <div className="text-center py-10">
        <p className="text-5xl mb-4">{result.passed ? "🎉" : "💪"}</p>
        <h2 className="text-2xl font-bold">
          {result.score}% — {result.passed ? "Passed!" : "Not yet (80% to pass)"}
        </h2>
        {xpTotal > 0 && (
          <p className="text-[#3fb950] font-semibold mt-2">+{xpTotal} XP earned this run</p>
        )}
        <p className="text-sm text-[#9aa7b4] mt-3 max-w-md mx-auto">
          {result.passed
            ? "Solid. Retake it anytime — the options reshuffle every run."
            : "Reread the lesson's weak spots and try again. Wrong answers above show why."}
        </p>
        <div className="flex gap-3 justify-center mt-6">
          <button
            onClick={() => {
              setI(0); setChosen(null); setFeedback(null); setResult(null); setXpTotal(0);
            }}
            className="px-4 py-2 rounded-lg bg-[#1c232d] border border-[#2a323d] text-sm hover:border-[#4c8dff]"
          >
            Retake quiz
          </button>
          <Link
            href={`/learn/${lessonSlug}`}
            className="px-4 py-2 rounded-lg bg-[#4c8dff] text-white text-sm font-semibold"
          >
            Back to lesson
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between text-xs text-[#9aa7b4] mb-4">
        <span>
          Question {i + 1} of {questions.length}
        </span>
        <span className="flex gap-2">
          <span className="px-2 py-0.5 rounded bg-[#22303f]">{q.style_tag}</span>
          <span className="px-2 py-0.5 rounded bg-[#22303f]">
            {"★".repeat(q.difficulty)}{"☆".repeat(3 - q.difficulty)}
          </span>
        </span>
      </div>

      <div className="h-1.5 rounded-full bg-[#1c232d] overflow-hidden mb-6">
        <div
          className="h-full bg-gradient-to-r from-[#4c8dff] to-[#3fb950] transition-all"
          style={{ width: `${(i / questions.length) * 100}%` }}
        />
      </div>

      <p className="font-semibold whitespace-pre-wrap text-[15px] leading-relaxed mb-5">{q.prompt}</p>

      <div className="space-y-2.5">
        {order.map((origIdx, displayIdx) => {
          let cls = "border-[#2a323d] bg-[#161b22] hover:border-[#4c8dff]";
          if (feedback) {
            if (origIdx === feedback.correct_index)
              cls = "border-[#3fb950] bg-[#3fb950]/10";
            else if (chosen === displayIdx)
              cls = "border-[#f85149] bg-[#f85149]/10";
            else cls = "border-[#2a323d] bg-[#161b22] opacity-60";
          }
          return (
            <button
              key={displayIdx}
              onClick={() => answer(displayIdx)}
              disabled={!!feedback || busy}
              className={`w-full text-left px-4 py-3 rounded-lg border text-sm transition-colors ${cls}`}
            >
              <span className="font-mono text-[#9aa7b4] mr-2">
                {String.fromCharCode(65 + displayIdx)}.
              </span>
              <span className="whitespace-pre-wrap">{q.options[origIdx]}</span>
            </button>
          );
        })}
      </div>

      {feedback && (
        <div
          className={`mt-5 rounded-lg border px-4 py-3 text-sm ${
            feedback.is_correct
              ? "border-[#3fb950] bg-[#3fb950]/10"
              : "border-[#e3a008] bg-[#e3a008]/10"
          }`}
        >
          <p className="font-bold mb-1">
            {feedback.is_correct
              ? `Correct${feedback.xp_awarded ? ` · +${feedback.xp_awarded} XP` : ""}`
              : "Not quite."}
          </p>
          <p className="text-[#c9d4de]">{feedback.explanation}</p>
        </div>
      )}

      {feedback && (
        <button
          onClick={next}
          disabled={busy}
          className="mt-5 px-5 py-2.5 rounded-lg bg-[#4c8dff] text-white text-sm font-semibold hover:bg-[#3a7bee]"
        >
          {i + 1 < questions.length ? "Next question →" : "Finish quiz"}
        </button>
      )}
    </div>
  );
}
