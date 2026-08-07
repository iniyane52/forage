"use client";

import { useEffect, useRef, useState } from "react";
import { useMounted } from "@/hooks/useMounted";

export type Stage = { id: string; label: string };

export const LESSON_STAGES: Stage[] = [
  { id: "learn", label: "Learn" },
  { id: "discuss", label: "Discuss" },
  { id: "practice", label: "Practice" },
  { id: "confirm", label: "Confirm" },
  { id: "test", label: "Test" },
];

/**
 * The 5-stage step indicator for LessonStepFlow -- evolved from LessonOutline.tsx's
 * IntersectionObserver-driven active-section tracking (same rootMargin, same
 * mechanic), just consolidated from ~10 fine-grained anchors down to 5 named stages.
 *
 * LessonOutline was desktop-only (`2xl:block`) because ~10 labeled items don't fit
 * in the margin outside a max-w-3xl article below that breakpoint. 5 short single-word
 * labels do fit at smaller widths, so this adds a compact horizontal variant for
 * everything below 2xl -- there's currently no in-lesson nav at all on mobile/tablet,
 * a real gap this closes rather than scope creep.
 */
export function StepNav({ accent }: { accent: string }) {
  const mounted = useMounted();
  const [active, setActive] = useState(LESSON_STAGES[0].id);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    if (!mounted) return;
    const headings = LESSON_STAGES.map((s) => document.getElementById(s.id)).filter(
      (el): el is HTMLElement => !!el
    );
    if (!headings.length) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-15% 0% -70% 0%", threshold: 0 }
    );
    headings.forEach((h) => observerRef.current!.observe(h));
    return () => observerRef.current?.disconnect();
  }, [mounted]);

  if (!mounted) return null;

  return (
    <>
      {/* Desktop: fixed vertical rail, same position/breakpoint as the old LessonOutline. */}
      <nav aria-label="Lesson stages" className="hidden 2xl:block fixed right-8 top-1/2 -translate-y-1/2 z-10 max-w-[180px]">
        <ul className="space-y-2.5 text-xs">
          {LESSON_STAGES.map((stage) => {
            const isActive = stage.id === active;
            return (
              <li key={stage.id}>
                <a
                  href={`#${stage.id}`}
                  className="flex items-center gap-2 transition-colors"
                  style={{ color: isActive ? accent : "var(--color-text-secondary)" }}
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full shrink-0 transition-transform"
                    style={{
                      backgroundColor: isActive ? accent : "var(--color-text-secondary)",
                      opacity: isActive ? 1 : 0.4,
                      transform: isActive ? "scale(1.4)" : "scale(1)",
                    }}
                  />
                  <span className="truncate">{stage.label}</span>
                </a>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Mobile/tablet: compact horizontal bar, sticky just below the app's own
          sticky header (h-[52px] there: py-3 + text/icon content). */}
      <nav
        aria-label="Lesson stages"
        className="2xl:hidden sticky top-[52px] z-10 -mx-4 px-4 py-2 mb-2 glass border-b border-[var(--color-border)] flex items-center gap-1 overflow-x-auto"
      >
        {LESSON_STAGES.map((stage, i) => {
          const isActive = stage.id === active;
          return (
            <a
              key={stage.id}
              href={`#${stage.id}`}
              className="shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold transition-colors"
              style={{
                color: isActive ? accent : "var(--color-text-secondary)",
                backgroundColor: isActive ? `color-mix(in srgb, ${accent} 10%, transparent)` : "transparent",
              }}
            >
              <span className="font-mono opacity-60">{i + 1}</span>
              {stage.label}
            </a>
          );
        })}
      </nav>
    </>
  );
}
