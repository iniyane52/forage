"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { CheckCircle2, HelpCircle, Medal, Lock, ArrowRight } from "@/components/ui/icons";
import { Confetti } from "@/components/ui/Confetti";
import { useMounted } from "@/hooks/useMounted";

export function MarkDoneButton({
  lessonId,
  initiallyDone,
  questionCount,
  quizHref,
}: {
  lessonId: string;
  initiallyDone: boolean;
  questionCount: number;
  quizHref: string;
}) {
  const router = useRouter();
  const supabase = createClient();
  const reduce = useReducedMotion();
  // Gated on `mounted` first: `initiallyDone` can already be `true` on the very first
  // SSR pass (a revisited, already-completed lesson), which puts this motion.div in
  // the server-rendered output -- and SSR always resolves `reduce` falsy (no
  // `matchMedia`), while a client that genuinely prefers reduced motion resolves it
  // synchronously on its first render, before hydration completes. Same confirmed
  // hydration-mismatch class as ScrollHero.tsx/StatCallout.tsx/FadeUp.
  const mounted = useMounted();
  const [done, setDone] = useState(initiallyDone);
  const [busy, setBusy] = useState(false);
  const [reward, setReward] = useState<string | null>(null);
  const [rewardIsError, setRewardIsError] = useState(false);
  const [badgesEarned, setBadgesEarned] = useState<string[]>([]);

  async function markDone() {
    setBusy(true);
    const { data, error } = await supabase.rpc("mark_lesson_done", { p_lesson_id: lessonId });
    setBusy(false);
    if (error) {
      setRewardIsError(true);
      setReward(error.message);
      return;
    }
    setRewardIsError(false);
    setDone(true);
    const result = data as { xp_awarded?: number; badges_awarded?: string[] };
    if (result?.xp_awarded) setReward(`+${result.xp_awarded} XP`);
    setBadgesEarned(result?.badges_awarded ?? []);
    router.refresh();
  }

  return (
    <div className="relative flex items-center gap-3 flex-wrap">
      {badgesEarned.length > 0 && <Confetti />}
      <button
        onClick={markDone}
        disabled={done || busy}
        className={`px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-1.5 transition-colors ${
          done
            ? "bg-[var(--color-success)]/15 text-[var(--color-success)] cursor-default"
            : "bg-[var(--color-success)] text-[var(--color-on-primary)] hover:opacity-90"
        }`}
      >
        {done && <CheckCircle2 size={16} />}
        {done ? "Completed" : busy ? "Saving..." : "Mark as done"}
      </button>
      <AnimatePresence>
        {reward && (
          <motion.span
            role={rewardIsError ? "alert" : undefined}
            initial={{ opacity: 0, scale: 0.8, y: 6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className={`text-sm font-bold ${rewardIsError ? "text-[var(--color-danger)]" : "text-[var(--color-success)]"}`}
          >
            {reward}
          </motion.span>
        )}
        {badgesEarned.map((title, i) => (
          <motion.span
            key={title}
            initial={{ opacity: 0, scale: 0.8, y: 6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.1 }}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--color-warning)] bg-[var(--color-warning)]/10 border border-[var(--color-warning)]/30 rounded-full px-2.5 py-1"
          >
            <Medal size={13} /> Badge earned: {title}
          </motion.span>
        ))}
      </AnimatePresence>
      {!done && (
        <span className="text-xs text-[var(--color-text-secondary)] hidden sm:inline">
          Only when you did the task AND can explain it.
        </span>
      )}

      {/* Owned here (not the parent server component) so the quiz-unlock reveal is
          driven by this button's own `done` state -- reliable the instant markDone()
          resolves, rather than depending on router.refresh()'s RSC round-trip timing
          to swap in server-rendered content with no entrance transition of its own. */}
      {done &&
        (questionCount === 0 ? (
          <span className="text-xs text-[var(--color-text-secondary)] glass rounded-xl px-3 py-2">
            Study-only lesson — no quiz needed
          </span>
        ) : (
          <motion.div
            initial={!mounted || reduce ? false : { opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            <Link
              href={quizHref}
              className="px-4 py-2 rounded-xl text-sm font-semibold bg-[var(--color-primary)] text-[var(--color-on-primary)] hover:opacity-90 transition-opacity flex items-center gap-1.5"
            >
              Take the quiz ({questionCount} question{questionCount === 1 ? "" : "s"}) <ArrowRight size={15} />
            </Link>
          </motion.div>
        ))}
      {!done && (
        <span
          title="Study the lesson and mark it done to unlock the quiz"
          className="flex items-center gap-1.5 text-xs text-[var(--color-text-secondary)] glass rounded-xl px-3 py-2 cursor-not-allowed"
        >
          <Lock size={13} /> Study this first to unlock the quiz
        </span>
      )}
    </div>
  );
}

export function NotesBox({ lessonId, initial }: { lessonId: string; initial: string }) {
  const supabase = createClient();
  const [value, setValue] = useState(initial);
  const [saved, setSaved] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  function onChange(v: string) {
    setValue(v);
    setSaved("saving");
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      const { error } = await supabase.rpc("save_note", { p_lesson_id: lessonId, p_notes: v });
      setSaved(error ? "error" : "saved");
    }, 800);
  }

  return (
    <div>
      <div className="flex items-center justify-end -mt-6 mb-1">
        <span
          role={saved === "error" ? "alert" : undefined}
          className={`text-[10px] ${saved === "error" ? "text-[var(--color-danger)]" : "text-[var(--color-text-secondary)]"}`}
        >
          {saved === "saving"
            ? "saving..."
            : saved === "saved"
            ? "saved ✓"
            : saved === "error"
            ? "couldn't save — check your connection"
            : ""}
        </span>
      </div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Write what you'd tell a friend about this topic..."
        className="w-full min-h-24 bg-[rgb(var(--surface-rgb)/0.05)] border border-[var(--color-border)] rounded-xl p-3 text-sm outline-none focus:border-[var(--color-primary)] resize-y transition-colors"
      />
    </div>
  );
}

export function CheckReveal({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="glass rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full text-left px-4 py-2.5 text-sm hover:bg-[rgb(var(--surface-rgb)/0.03)] flex items-start gap-2 transition-colors"
      >
        <HelpCircle size={16} className="text-[var(--color-primary)] mt-0.5 shrink-0" />
        <span className="flex-1">{q}</span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <p className="px-4 py-2.5 text-sm text-[var(--color-text-secondary)] border-t border-[var(--color-border)]">
              <span className="text-[var(--color-success)] font-bold mr-1">A</span>
              {a}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
