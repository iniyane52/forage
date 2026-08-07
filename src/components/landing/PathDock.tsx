"use client";

import { useRef } from "react";
import { useReducedMotion } from "framer-motion";
import { useGSAP } from "@gsap/react";
import { gsap, ScrollTrigger } from "@/components/ui/gsapMotion";
import { streamIcon } from "@/components/ui/icons";
import { useMounted } from "@/hooks/useMounted";
import { pathMeta, difficultyLabel } from "@/lib/pathMeta";

const PATHS = [
  { slug: "aiml", title: "AI Engineer" },
  { slug: "software-engineer", title: "Software Engineer" },
  { slug: "fullstack", title: "Full-Stack Developer" },
  { slug: "data", title: "Data Scientist" },
  { slug: "cloud-devops", title: "Cloud & DevOps" },
  { slug: "cybersecurity", title: "Cybersecurity" },
];

const BASE_SCALE = 1;
const PEAK_SCALE = 1.12;
const FALLOFF_RADIUS_PX = 180;
const DRIFT_PX_PER_S = 28;
const RESUME_DELAY_MS = 500;
const DRAG_CLICK_THRESHOLD_PX = 6;

/**
 * Mac OS dock-style row that drifts endlessly leftward (seamless loop via a
 * doubled card set, same trick as TechTicker), pausing while hovered -- so the
 * cursor-magnify effect happens on a still row -- and resuming shortly after the
 * pointer leaves. The row is also grabbable: pointer-drag scrubs it manually
 * (wrapping at the seam), with a capture-phase click suppressor so releasing a
 * drag on top of a card doesn't navigate.
 *
 * Drift is a gsap.ticker callback writing a wrapped x -- not a fixed tween --
 * because drag needs to write the same value between ticks without the two
 * fighting. Magnify stays GSAP quickTo per card (scaleX/scaleY, never the
 * "scale" shorthand -- quickTo("scale") logs a real "not eligible for reset"
 * warning once a setter fires twice, confirmed live). Everything stops while
 * the section is off-screen (same ScrollTrigger that pauses the border beams
 * and the aurora ribbon behind the row).
 */
export function PathDock() {
  const reduce = useReducedMotion();
  // Gated on `mounted` first: SSR always resolves `reduce` falsy, but a client that
  // genuinely prefers reduced motion resolves it synchronously on its very first
  // render, before hydration completes -- branching between a `grid` and the dock
  // (a completely different DOM tree) directly on `reduce` is a real hydration
  // mismatch. Same fix as ScrollHero.tsx/StatCallout.tsx.
  const mounted = useMounted();
  const rowRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const settersRef = useRef<((v: number) => void)[]>([]);

  useGSAP(
    () => {
      if (!mounted || reduce || !rowRef.current || !trackRef.current) return;
      const row = rowRef.current;
      const track = trackRef.current;
      const cards = cardRefs.current.filter((c): c is HTMLDivElement => !!c);

      settersRef.current = cards.map((c) => {
        const setX = gsap.quickTo(c, "scaleX", { duration: 0.4, ease: "power3.out" });
        const setY = gsap.quickTo(c, "scaleY", { duration: 0.4, ease: "power3.out" });
        return (v: number) => {
          setX(v);
          setY(v);
        };
      });

      let half = track.scrollWidth / 2;
      const resizeObserver = new ResizeObserver(() => {
        half = track.scrollWidth / 2;
      });
      resizeObserver.observe(track);

      let x = 0;
      let hovering = false;
      let dragging = false;
      let offscreen = false;
      let dragMoved = 0;
      let dragStartX = 0;
      let pointerStartX = 0;
      let resumeTimeout: ReturnType<typeof setTimeout> | null = null;

      const applyX = () => gsap.set(track, { x: gsap.utils.wrap(-half, 0, x) });

      const tick = (_time: number, deltaTime: number) => {
        if (hovering || dragging || offscreen) return;
        x -= (DRIFT_PX_PER_S * deltaTime) / 1000;
        applyX();
      };
      gsap.ticker.add(tick);

      function clearResume() {
        if (resumeTimeout) clearTimeout(resumeTimeout);
        resumeTimeout = null;
      }
      function scheduleResume() {
        clearResume();
        resumeTimeout = setTimeout(() => {
          hovering = false;
        }, RESUME_DELAY_MS);
      }

      function onMove(e: MouseEvent) {
        cards.forEach((card, i) => {
          const rect = card.getBoundingClientRect();
          const dist = Math.abs(e.clientX - (rect.left + rect.width / 2));
          const falloff = Math.max(0, 1 - dist / FALLOFF_RADIUS_PX);
          settersRef.current[i](BASE_SCALE + (PEAK_SCALE - BASE_SCALE) * falloff);
        });
      }
      function resetScales() {
        settersRef.current.forEach((set) => set(1));
      }
      function onEnter(e: PointerEvent) {
        // Touch fires enter without a matching leave -- only mouse hover pauses;
        // touch interaction pauses via the drag handlers below instead.
        if (e.pointerType === "mouse") {
          clearResume();
          hovering = true;
        }
      }
      function onLeaveRow() {
        resetScales();
        scheduleResume();
      }

      // Pointer capture is only taken once movement crosses the drag threshold,
      // never on a bare pointerdown: capturing eagerly retargets the synthesized
      // mouse events, and the resulting click dispatched against the wrong target
      // silently killed ALL plain card clicks (confirmed live -- click target
      // became <html> and the <a> never navigated).
      let pointerDown = false;
      function onPointerDown(e: PointerEvent) {
        pointerDown = true;
        dragMoved = 0;
        dragStartX = x;
        pointerStartX = e.clientX;
      }
      function onPointerMove(e: PointerEvent) {
        if (!pointerDown) return;
        const delta = e.clientX - pointerStartX;
        if (!dragging && Math.abs(delta) > DRAG_CLICK_THRESHOLD_PX) {
          dragging = true;
          row.setPointerCapture?.(e.pointerId);
        }
        if (dragging) {
          dragMoved = Math.max(dragMoved, Math.abs(delta));
          x = dragStartX + delta;
          applyX();
        }
      }
      function onPointerUp() {
        pointerDown = false;
        dragging = false;
        scheduleResume();
      }
      function onClickCapture(e: MouseEvent) {
        if (dragMoved > DRAG_CLICK_THRESHOLD_PX) {
          e.preventDefault();
          e.stopPropagation();
          dragMoved = 0;
        }
      }

      row.addEventListener("mousemove", onMove);
      row.addEventListener("pointerenter", onEnter);
      row.addEventListener("pointerleave", onLeaveRow);
      row.addEventListener("pointerdown", onPointerDown);
      row.addEventListener("pointermove", onPointerMove);
      row.addEventListener("pointerup", onPointerUp);
      row.addEventListener("pointercancel", onPointerUp);
      row.addEventListener("click", onClickCapture, true);

      // One trigger gates every always-on effect in this section: the drift tick,
      // the cards' border-beam orbit, and the aurora ribbon (both CSS,
      // paused via the beam-paused class).
      ScrollTrigger.create({
        trigger: row,
        start: "top bottom",
        end: "bottom top",
        onToggle: (self) => {
          offscreen = !self.isActive;
          row.parentElement?.classList.toggle("beam-paused", !self.isActive);
        },
      });

      return () => {
        gsap.ticker.remove(tick);
        resizeObserver.disconnect();
        clearResume();
        row.removeEventListener("mousemove", onMove);
        row.removeEventListener("pointerenter", onEnter);
        row.removeEventListener("pointerleave", onLeaveRow);
        row.removeEventListener("pointerdown", onPointerDown);
        row.removeEventListener("pointermove", onPointerMove);
        row.removeEventListener("pointerup", onPointerUp);
        row.removeEventListener("pointercancel", onPointerUp);
        row.removeEventListener("click", onClickCapture, true);
      };
    },
    { scope: rowRef, dependencies: [reduce, mounted] }
  );

  if (mounted && reduce) {
    // Own container: the parent section is full-width for the drifting row's sake,
    // so the static grid re-applies the page's standard content width itself.
    return (
      <div className="max-w-5xl mx-auto px-4 grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {PATHS.map((p) => (
          <DockCard key={p.slug} {...p} />
        ))}
      </div>
    );
  }

  return (
    <div className="relative">
      <div aria-hidden="true" className="dock-aurora" />
      <div
        ref={rowRef}
        className="relative overflow-hidden cursor-grab active:cursor-grabbing select-none"
        style={{
          touchAction: "pan-y",
          maskImage: "linear-gradient(90deg, transparent, black 5%, black 95%, transparent)",
          WebkitMaskImage: "linear-gradient(90deg, transparent, black 5%, black 95%, transparent)",
        }}
      >
        <div ref={trackRef} className="flex gap-4 w-max py-6 px-1">
          {[0, 1].map((copy) => (
            <div key={copy} className="flex gap-4" aria-hidden={copy === 1}>
              {PATHS.map((p, i) => (
                <div
                  key={p.slug}
                  ref={(el) => {
                    cardRefs.current[copy * PATHS.length + i] = el;
                  }}
                  className="shrink-0"
                  style={{ transformOrigin: "bottom center" }}
                >
                  <DockCard {...p} tabbable={copy === 0} />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function DockCard({ slug, title, tabbable = true }: { slug: string; title: string; tabbable?: boolean }) {
  const meta = pathMeta[slug];
  const accent = meta?.accent ?? "var(--color-primary)";
  const Icon = streamIcon[slug] ?? streamIcon.foundations;

  return (
    <a
      href="/auth"
      tabIndex={tabbable ? undefined : -1}
      draggable={false}
      className="relative glass-solid rounded-2xl p-5 w-[172px] shrink-0 flex flex-col gap-2.5 hover:border-[var(--color-primary)]/30 transition-colors"
      style={{ borderColor: `${accent}22` }}
    >
      <span
        aria-hidden="true"
        className="border-beam"
        style={{ "--beam-color": `${accent}cc` } as React.CSSProperties}
      />
      <span
        className="inline-flex w-9 h-9 rounded-xl items-center justify-center"
        style={{ backgroundColor: `${accent}22`, color: accent }}
      >
        <Icon size={18} strokeWidth={1.75} />
      </span>
      <h3 className="text-sm font-bold leading-tight" style={{ fontFamily: "var(--font-display)" }}>
        {title}
      </h3>
      {meta && (
        <span className="text-[10px] font-mono font-medium" style={{ color: accent }}>
          {difficultyLabel[meta.difficulty]}
        </span>
      )}
    </a>
  );
}
