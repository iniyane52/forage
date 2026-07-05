"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { CheckCircle2, XCircle, Trophy, Sparkles } from "@/components/ui/icons";

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
  const reduce = useReducedMotion();
  const [i, setI] = useState(0);
  const [chosen, setChosen] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [busy, setBusy] = useState(false);
  const [xpTotal, setXpTotal] = useState(0);
  const [result, setResult] = useState<{ score: number; passed: boolean } | null>(null);

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
    const circ = 2 * Math.PI * 52;
    return (
      <motion.div
        initial={reduce ? false : { opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-8"
      >
        <div className="relative w-36 h-36 mx-auto mb-4">
          <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
            <circle cx="60" cy="60" r="52" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="10" />
            <motion.circle
              cx="60"
              cy="60"
              r="52"
              fill="none"
              stroke={result.passed ? "#3fb950" : "#e3a008"}
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={circ}
              initial={{ strokeDashoffset: circ }}
              animate={{ strokeDashoffset: circ * (1 - result.score / 100) }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            />
          </svg>
          <div className="absolute inset-0 grid place-items-center">
            <span className="text-3xl font-bold" style={{ fontFamily: "var(--font-display)" }}>
              {result.score}%
            </span>
          </div>
        </div>
        <h2 className="text-xl font-bold flex items-center justify-center gap-2" style={{ fontFamily: "var(--font-display)" }}>
          {result.passed && <Trophy size={22} className="text-[#e3a008]" />}
          {result.passed ? "Passed!" : "Not yet — 80% to pass"}
        </h2>
        {xpTotal > 0 && (
          <p className="text-[#3fb950] font-semibold mt-2 flex items-center justify-center gap-1">
            <Sparkles size={16} /> +{xpTotal} XP earned this run
          </p>
        )}
        <p className="text-sm text-[#9aa7b4] mt-3 max-w-md mx-auto">
          {result.passed
            ? "Solid. Retake anytime — the options reshuffle every run."
            : "Reread the weak spots and try again. Wrong answers showed you why."}
        </p>
        <div className="flex gap-3 justify-center mt-6">
          <button
            onClick={() => {
              setI(0); setChosen(null); setFeedback(null); setResult(null); setXpTotal(0);
            }}
            className="px-4 py-2 rounded-xl glass glass-hover text-sm"
          >
            Retake quiz
          </button>
          <Link
            href={`/learn/${lessonSlug}`}
            className="px-4 py-2 rounded-xl bg-[#4c8dff] text-white text-sm font-semibold hover:bg-[#3a7bee] transition-colors"
          >
            Back to lesson
          </Link>
        </div>
      </motion.div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between text-xs text-[#9aa7b4] mb-3">
        <span>
          Question {i + 1} of {questions.length}
        </span>
        <span className="flex gap-2">
          <span className="px-2 py-0.5 rounded bg-white/[0.05]">{q.style_tag}</span>
          <span className="px-2 py-0.5 rounded bg-white/[0.05] text-[#e3a008]">
            {"★".repeat(q.difficulty)}
            <span className="text-[#9aa7b4]">{"★".repeat(3 - q.difficulty)}</span>
          </span>
        </span>
      </div>

      <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden mb-6">
        <motion.div
          className="h-full bg-gradient-to-r from-[#4c8dff] to-[#3fb950]"
          animate={{ width: `${(i / questions.length) * 100}%` }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={i}
          initial={reduce ? false : { opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={reduce ? {} : { opacity: 0, x: -40 }}
          transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
        >
          <p className="font-semibold whitespace-pre-wrap text-[15px] leading-relaxed mb-5">
            {q.prompt}
          </p>

          <div className="space-y-2.5">
            {order.map((origIdx, displayIdx) => {
              const isCorrect = feedback && origIdx === feedback.correct_index;
              const isWrongPick = feedback && chosen === displayIdx && !isCorrect;
              let cls = "border-white/[0.08] bg-white/[0.03] hover:border-[#4c8dff]/60 hover:bg-white/[0.05]";
              if (feedback) {
                if (isCorrect) cls = "border-[#3fb950]/60 bg-[#3fb950]/10";
                else if (isWrongPick) cls = "border-[#f85149]/60 bg-[#f85149]/10";
                else cls = "border-white/[0.06] bg-white/[0.02] opacity-60";
              }
              return (
                <motion.button
                  key={displayIdx}
                  onClick={() => answer(displayIdx)}
                  disabled={!!feedback || busy}
                  whileTap={reduce || feedback ? undefined : { scale: 0.98 }}
                  className={`w-full text-left px-4 py-3 rounded-xl border text-sm transition-colors flex items-start gap-2.5 ${cls}`}
                >
                  <span className="font-mono text-[#9aa7b4] shrink-0">
                    {String.fromCharCode(65 + displayIdx)}.
                  </span>
                  <span className="whitespace-pre-wrap flex-1">{q.options[origIdx]}</span>
                  {isCorrect && <CheckCircle2 size={18} className="text-[#3fb950] shrink-0" />}
                  {isWrongPick && <XCircle size={18} className="text-[#f85149] shrink-0" />}
                </motion.button>
              );
            })}
          </div>

          <AnimatePresence>
            {feedback && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={`mt-5 rounded-xl border px-4 py-3 text-sm ${
                  feedback.is_correct
                    ? "border-[#3fb950]/40 bg-[#3fb950]/10"
                    : "border-[#e3a008]/40 bg-[#e3a008]/10"
                }`}
              >
                <p className="font-bold mb-1 flex items-center gap-1.5">
                  {feedback.is_correct ? (
                    <>
                      <CheckCircle2 size={16} className="text-[#3fb950]" />
                      Correct{feedback.xp_awarded ? ` · +${feedback.xp_awarded} XP` : ""}
                    </>
                  ) : (
                    <>
                      <XCircle size={16} className="text-[#e3a008]" />
                      Not quite.
                    </>
                  )}
                </p>
                <p className="text-[#c9d4de]">{feedback.explanation}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {feedback && (
            <button
              onClick={next}
              disabled={busy}
              className="mt-5 px-5 py-2.5 rounded-xl bg-[#4c8dff] text-white text-sm font-semibold hover:bg-[#3a7bee] transition-colors"
            >
              {i + 1 < questions.length ? "Next question →" : "Finish quiz"}
            </button>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
