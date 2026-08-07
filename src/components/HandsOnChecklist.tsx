"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, Circle, Eye, EyeOff, AlertTriangle } from "@/components/ui/icons";
import type { HandsOnStep } from "@/lib/content";

/**
 * Local-only step tracker for the Practice stage -- no DB persistence (the
 * lesson-level Mark Done button in Test still handles recorded completion), just a
 * real walkthrough: check a step off, jot what you actually got, and (for steps that
 * have one) reveal what you should have gotten to compare against. Resets on
 * refresh/navigation by design -- a scratchpad for the current sitting, not a saved
 * record. Steps without `expectOutcome` (reflective/planning steps, no crisp
 * "correct output") just get the notes field -- the component adapts per step, not
 * per lesson.
 *
 * `troubleshooting` (where present) surfaces alongside the expected outcome, not
 * behind a second click -- beginners' single biggest documented frustration is not
 * knowing whether an ambiguous result is a real problem, so the "you might see this
 * instead, here's what it means" note needs to be immediately visible once revealed,
 * not one more thing to dig for.
 */
export function HandsOnChecklist({ steps, accent }: { steps: HandsOnStep[]; accent: string }) {
  const [checked, setChecked] = useState<boolean[]>(() => steps.map(() => false));
  const [expanded, setExpanded] = useState<number | null>(null);
  const [notes, setNotes] = useState<string[]>(() => steps.map(() => ""));
  const [revealed, setRevealed] = useState<boolean[]>(() => steps.map(() => false));
  const done = checked.filter(Boolean).length;

  function toggleChecked(i: number) {
    setChecked((prev) => prev.map((v, idx) => (idx === i ? !v : v)));
  }

  function toggleExpanded(i: number) {
    setExpanded((prev) => (prev === i ? null : i));
  }

  function setNote(i: number, value: string) {
    setNotes((prev) => prev.map((v, idx) => (idx === i ? value : v)));
  }

  function toggleRevealed(i: number) {
    setRevealed((prev) => prev.map((v, idx) => (idx === i ? !v : v)));
  }

  return (
    <div className="rounded-2xl border border-[var(--color-border)] bg-[rgb(var(--surface-rgb)/0.02)] p-4 sm:p-5">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-bold uppercase tracking-widest" style={{ color: accent }}>
          Work through it
        </p>
        <span className="text-xs text-[var(--color-text-secondary)] font-mono">
          {done}/{steps.length}
        </span>
      </div>
      <ul className="space-y-1.5">
        {steps.map((step, i) => {
          const isDone = checked[i];
          const isOpen = expanded === i;
          const isRevealed = revealed[i];
          return (
            <li key={i} className="rounded-xl overflow-hidden">
              <div className="flex items-stretch gap-1">
                <button
                  type="button"
                  onClick={() => toggleChecked(i)}
                  aria-label={isDone ? "Mark step not done" : "Mark step done"}
                  className="shrink-0 px-2.5 flex items-center rounded-xl hover:bg-[rgb(var(--surface-rgb)/0.03)] transition-colors"
                >
                  {isDone ? (
                    <CheckCircle2 size={18} style={{ color: accent }} />
                  ) : (
                    <Circle size={18} className="text-[var(--color-text-secondary)]" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => toggleExpanded(i)}
                  className="flex-1 min-w-0 text-left rounded-xl px-2 py-2.5 text-sm leading-relaxed hover:bg-[rgb(var(--surface-rgb)/0.03)] transition-colors"
                >
                  <span
                    className={
                      isDone
                        ? "text-[var(--color-text-secondary)] line-through decoration-[var(--color-text-secondary)]/50"
                        : "text-[var(--color-text)]"
                    }
                  >
                    <span className="font-mono text-xs mr-1.5" style={{ color: isDone ? undefined : accent }}>
                      {i + 1}.
                    </span>
                    {step.instruction}
                  </span>
                </button>
              </div>
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                    className="overflow-hidden"
                  >
                    <div className="px-3 pb-3 pt-1 space-y-2">
                      <textarea
                        value={notes[i]}
                        onChange={(e) => setNote(i, e.target.value)}
                        placeholder="What did you get? (optional — not saved)"
                        rows={2}
                        className="w-full rounded-lg bg-[rgb(var(--surface-rgb)/0.03)] border border-[var(--color-border)] px-3 py-2 text-sm resize-none focus:outline-none focus:border-[var(--color-primary)]"
                      />
                      {step.expectOutcome && (
                        <div>
                          <button
                            type="button"
                            onClick={() => toggleRevealed(i)}
                            className="inline-flex items-center gap-1.5 text-xs font-semibold hover:opacity-80 transition-opacity"
                            style={{ color: accent }}
                          >
                            {isRevealed ? <EyeOff size={13} /> : <Eye size={13} />}
                            {isRevealed ? "Hide expected outcome" : "Show expected outcome"}
                          </button>
                          {isRevealed && (
                            <div className="mt-1.5 space-y-1.5">
                              <p className="text-sm text-[var(--color-text-secondary)] rounded-lg bg-[rgb(var(--surface-rgb)/0.02)] border border-[var(--color-border)] px-3 py-2">
                                {step.expectOutcome}
                              </p>
                              {step.troubleshooting && (
                                <p className="text-xs text-[var(--color-text-secondary)] rounded-lg bg-[var(--color-warning)]/[0.06] border border-[var(--color-warning)]/25 px-3 py-2 flex items-start gap-1.5">
                                  <AlertTriangle size={13} className="text-[var(--color-warning)] mt-0.5 shrink-0" />
                                  <span>
                                    <b className="text-[var(--color-warning)] font-semibold">Got something different? </b>
                                    {step.troubleshooting}
                                  </span>
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
