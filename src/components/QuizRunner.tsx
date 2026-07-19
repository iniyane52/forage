"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { CheckCircle2, XCircle, Trophy, Sparkles, Medal, ArrowRight } from "@/components/ui/icons";
import { Confetti } from "@/components/ui/Confetti";
import { useMounted } from "@/hooks/useMounted";

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

// Deterministic seeded shuffle: identical on server and client (no Math.random),
// so there is no hydration mismatch and no client-only loading state is needed.
// `seed` mixes in the question id + a retake counter so a retake reshuffles.
function seededShuffle(n: number, seed: string): number[] {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  const rand = () => {
    h = (h * 1103515245 + 12345) >>> 0;
    return h / 4294967296;
  };
  const a = Array.from({ length: n }, (_, i) => i);
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const AUTO_ADVANCE_MS = 2200;

export function QuizRunner({
  lessonId,
  lessonSlug,
  questions,
  nextLessonSlug,
  nextLessonTitle,
}: {
  lessonId: string;
  lessonSlug: string;
  questions: PublicQuestion[];
  nextLessonSlug?: string;
  nextLessonTitle?: string;
}) {
  const router = useRouter();
  const supabase = createClient();
  const reduce = useReducedMotion();
  // Gated on `mounted` first for the question-card transition below (the very first
  // thing rendered on this page): SSR always resolves `reduce` falsy, but a client
  // that genuinely prefers reduced motion resolves it synchronously on its first
  // render, before hydration completes -- a real, confirmed hydration-mismatch
  // pattern (see ScrollHero.tsx/StatCallout.tsx for the same fix elsewhere).
  const mounted = useMounted();
  const [i, setI] = useState(0);
  const [chosen, setChosen] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [busy, setBusy] = useState(false);
  const [xpTotal, setXpTotal] = useState(0);
  const [result, setResult] = useState<{ score: number; passed: boolean; badgesAwarded: string[] } | null>(null);
  const [attempt, setAttempt] = useState(0); // bumped on retake so options reshuffle
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const q = questions[i];
  const order = seededShuffle(q.options.length, q.id + ":" + attempt);

  async function answer(displayIdx: number) {
    if (feedback || busy) return;
    const originalIdx = order[displayIdx];
    setChosen(displayIdx);
    setBusy(true);
    setErrorMsg(null);
    const { data, error } = await supabase.rpc("submit_answer", {
      p_question_id: q.id,
      p_chosen: originalIdx,
    });
    setBusy(false);
    if (error) {
      setChosen(null);
      setErrorMsg("Couldn't submit that answer — check your connection and try again.");
      return;
    }
    const fb = data as Feedback;
    setFeedback(fb);
    if (fb.xp_awarded > 0) setXpTotal((x) => x + fb.xp_awarded);
  }

  // 1-4/A-D pick an option, Enter advances -- keyboard parity with clicking.
  // Placed above the `if (result)` early return (hooks must run unconditionally every
  // render); the handler itself just no-ops once a result exists.
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (result || busy) return;
      if (!feedback) {
        const digit = Number(e.key);
        if (digit >= 1 && digit <= q.options.length) {
          answer(digit - 1);
          return;
        }
        const letterIdx = e.key.toUpperCase().charCodeAt(0) - 65;
        if (e.key.length === 1 && letterIdx >= 0 && letterIdx < q.options.length) {
          answer(letterIdx);
        }
      } else if (e.key === "Enter") {
        next();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  });

  // Auto-advance only on a CORRECT answer, after enough time to actually read the
  // "Correct · +XP" line (and a short explanation, if shown) -- a wrong answer always
  // waits for a manual click/Enter, so a mistake never scrolls past before it's read.
  // The manual "Next question"/"Finish quiz" button stays live throughout as an
  // override for anyone who doesn't want to wait out the delay. Safe against a
  // double-advance race: `next()` resets `feedback`, which re-runs this effect and
  // its own cleanup clears any not-yet-fired timeout from the previous question.
  useEffect(() => {
    if (!feedback?.is_correct) return;
    const t = setTimeout(() => next(), AUTO_ADVANCE_MS);
    return () => clearTimeout(t);
  }, [feedback]);

  async function next() {
    if (i + 1 < questions.length) {
      setI(i + 1);
      setChosen(null);
      setFeedback(null);
    } else {
      setBusy(true);
      setErrorMsg(null);
      const { data, error } = await supabase.rpc("finish_quiz", { p_lesson_id: lessonId });
      setBusy(false);
      if (error) {
        setErrorMsg("Couldn't finish the quiz — check your connection and try again.");
        return;
      }
      const r = data as { score: number; passed: boolean; badges_awarded?: string[] };
      setResult({ score: r.score, passed: r.passed, badgesAwarded: r.badges_awarded ?? [] });
      router.refresh();
    }
  }

  if (result) {
    const circ = 2 * Math.PI * 52;
    const tone = result.passed ? "#3fb950" : "#ffb020";
    return (
      <motion.div
        initial={reduce ? false : { opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-8 relative"
      >
        {result.passed && <Confetti />}
        <div className="relative w-36 h-36 mx-auto mb-4">
          {!reduce && (
            <motion.div
              aria-hidden="true"
              className="absolute inset-0 rounded-full blur-2xl"
              style={{ backgroundColor: tone }}
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 0.35, scale: 1.1 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            />
          )}
          <svg viewBox="0 0 120 120" className="relative w-full h-full -rotate-90">
            <circle cx="60" cy="60" r="52" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="10" />
            <motion.circle
              cx="60"
              cy="60"
              r="52"
              fill="none"
              stroke={tone}
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={circ}
              initial={{ strokeDashoffset: circ }}
              animate={{ strokeDashoffset: circ * (1 - result.score / 100) }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            />
          </svg>
          <div className="absolute inset-0 grid place-items-center">
            <motion.span
              className="text-3xl font-bold"
              style={{ fontFamily: "var(--font-display)" }}
              initial={reduce ? false : { opacity: 0, scale: 0.4 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={reduce ? undefined : { delay: 0.9, type: "spring", stiffness: 280, damping: 16 }}
            >
              {result.score}%
            </motion.span>
          </div>
        </div>
        <motion.h2
          className="text-xl font-bold flex items-center justify-center gap-2"
          style={{ fontFamily: "var(--font-display)" }}
          initial={reduce ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        >
          {result.passed && <Trophy size={22} className="text-[#ffb020]" />}
          {result.passed ? "Passed!" : questions.length === 1 ? "Not yet — try again" : "Not yet — 80% to pass"}
        </motion.h2>
        {xpTotal > 0 && (
          <p className="text-[#3fb950] font-semibold mt-2 flex items-center justify-center gap-1">
            <Sparkles size={16} /> +{xpTotal} XP earned this run
          </p>
        )}
        {result.badgesAwarded.length > 0 && (
          <div className="flex flex-wrap gap-2 justify-center mt-3">
            {result.badgesAwarded.map((title) => (
              <span
                key={title}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#ffb020] bg-[#ffb020]/10 border border-[#ffb020]/30 rounded-full px-2.5 py-1"
              >
                <Medal size={13} /> Badge earned: {title}
              </span>
            ))}
          </div>
        )}
        <p className="text-sm text-[#7d99a3] mt-3 max-w-md mx-auto">
          {result.passed
            ? "Solid. Retake anytime — the options reshuffle every run."
            : "Reread the weak spots and try again. Wrong answers showed you why."}
        </p>
        <div className="flex gap-3 justify-center flex-wrap mt-6">
          <button
            onClick={() => {
              setI(0); setChosen(null); setFeedback(null); setResult(null); setXpTotal(0);
              setAttempt((a) => a + 1);
            }}
            className="px-4 py-2 rounded-xl glass glass-hover text-sm"
          >
            Retake quiz
          </button>
          {result.passed && nextLessonSlug ? (
            <Link
              href={`/learn/${nextLessonSlug}`}
              className="px-4 py-2 rounded-xl bg-[#00e5ff] text-[#05070a] text-sm font-semibold hover:bg-[#33ebff] transition-colors flex items-center gap-1.5 max-w-[280px]"
            >
              <span className="truncate">Continue: {nextLessonTitle}</span>
              <ArrowRight size={15} className="shrink-0" />
            </Link>
          ) : (
            <Link
              href={`/learn/${lessonSlug}`}
              className="px-4 py-2 rounded-xl bg-[#00e5ff] text-[#05070a] text-sm font-semibold hover:bg-[#33ebff] transition-colors"
            >
              Back to lesson
            </Link>
          )}
        </div>
      </motion.div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between text-xs text-[#7d99a3] mb-3">
        <span>
          Question {i + 1} of {questions.length}
        </span>
        <span className="flex gap-2">
          <span className="px-2 py-0.5 rounded bg-white/[0.05]">{q.style_tag}</span>
          <span className="px-2 py-0.5 rounded bg-white/[0.05] text-[#ffb020]" aria-label={`Difficulty ${q.difficulty} of 3`}>
            <span aria-hidden="true">
              {"★".repeat(q.difficulty)}
              <span className="text-[#7d99a3]">{"★".repeat(3 - q.difficulty)}</span>
            </span>
          </span>
        </span>
      </div>

      <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden mb-6">
        <motion.div
          className="h-full bg-gradient-to-r from-[#00e5ff] to-[#3fb950]"
          animate={{ width: `${(i / questions.length) * 100}%` }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={i}
          initial={!mounted || reduce ? false : { opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={!mounted || reduce ? {} : { opacity: 0, x: -40 }}
          transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
        >
          <p className="font-semibold whitespace-pre-wrap text-[15px] leading-relaxed mb-5">
            {q.prompt}
          </p>

          <div className="space-y-2.5">
            {order.map((origIdx, displayIdx) => {
              const isCorrect = feedback && origIdx === feedback.correct_index;
              const isWrongPick = feedback && chosen === displayIdx && !isCorrect;
              let cls = "border-white/[0.08] bg-white/[0.03] hover:border-[#00e5ff]/60 hover:bg-white/[0.05]";
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
                  <span className="font-mono text-[#7d99a3] shrink-0">
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
                    : "border-[#ffb020]/40 bg-[#ffb020]/10"
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
                      <XCircle size={16} className="text-[#ffb020]" />
                      Not quite.
                    </>
                  )}
                </p>
                <p className="text-[#c9d4de]">{feedback.explanation}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {errorMsg && (
            <p role="alert" className="mt-4 text-sm text-[#f85149]">
              {errorMsg}
            </p>
          )}

          {feedback && (
            <button
              onClick={next}
              disabled={busy}
              className="mt-5 px-5 py-2.5 rounded-xl bg-[#00e5ff] text-[#05070a] text-sm font-semibold hover:bg-[#33ebff] transition-colors"
            >
              {i + 1 < questions.length ? "Next question →" : "Finish quiz"}
            </button>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
