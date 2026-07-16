"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "@/components/ui/icons";

// `icon` is a pre-rendered element (e.g. `<BookOpen size={20} />`), not a
// component reference — Next.js can't pass raw component types from a
// Server Component into this Client Component across the RSC boundary,
// only serializable data and React elements/children.
export type ValueProp = { icon: React.ReactNode; title: string; body: string; color: string };

/**
 * A horizontal "coverflow" style scroller: the centered card sits at full
 * size/opacity while neighbors scale down, fade, and blur with distance —
 * cuts the vertical space a static grid would take (worse still on mobile,
 * where the original grid had no column class and stacked all 6 cards) while
 * staying dynamic. Falls back to the original static grid for reduced motion.
 */
export function ValuePropsCarousel({ items }: { items: ValueProp[] }) {
  const reduce = useReducedMotion();
  const trackRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const rafRef = useRef<number | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const applyDepth = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    const cards = cardRefs.current;
    const trackRect = track.getBoundingClientRect();
    const centerX = trackRect.left + trackRect.width / 2;

    // Step = the gap between two adjacent card centers, derived from real
    // layout rather than hardcoded, so it self-corrects across breakpoints.
    const first = cards[0]?.getBoundingClientRect();
    const second = cards[1]?.getBoundingClientRect();
    const step =
      first && second
        ? second.left + second.width / 2 - (first.left + first.width / 2)
        : first?.width ?? 280;

    let closestIdx = 0;
    let closestDist = Infinity;

    cards.forEach((el, i) => {
      if (!el) return;
      const r = el.getBoundingClientRect();
      const cardCenter = r.left + r.width / 2;
      const distance = Math.abs(cardCenter - centerX);
      if (distance < closestDist) {
        closestDist = distance;
        closestIdx = i;
      }
      const closeness = Math.max(0, Math.min(1, 1 - distance / step));
      const scale = 0.86 + 0.14 * closeness;
      const opacity = 0.45 + 0.55 * closeness;
      const blur = (1 - closeness) * 2;
      el.style.transform = `scale(${scale})`;
      el.style.opacity = String(opacity);
      el.style.filter = blur > 0.05 ? `blur(${blur}px)` : "none";
    });

    setActiveIndex((prev) => (prev === closestIdx ? prev : closestIdx));
  }, []);

  const scheduleApplyDepth = useCallback(() => {
    if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(applyDepth);
  }, [applyDepth]);

  // Scrolls the track's own scrollLeft directly rather than card.scrollIntoView():
  // scrollIntoView's `block` axis resolution walks up to the nearest ancestor that's
  // scrollable *vertically*, and since the track only scrolls horizontally, that search
  // used to land on the whole document -- jumping the entire page down to this section
  // on mount (ResizeObserver fires once immediately on first observe, even with no real
  // resize). Computing scrollLeft ourselves can only ever move the track.
  const centerCard = useCallback((i: number, behavior: ScrollBehavior = "smooth") => {
    const track = trackRef.current;
    const card = cardRefs.current[i];
    if (!track || !card) return;
    const trackRect = track.getBoundingClientRect();
    const cardRect = card.getBoundingClientRect();
    const delta = cardRect.left + cardRect.width / 2 - (trackRect.left + trackRect.width / 2);
    track.scrollBy({ left: delta, behavior });
  }, []);

  // Kept in a ref so the resize handler always reads the latest value
  // without re-subscribing the observer on every activeIndex change.
  const activeIndexRef = useRef(activeIndex);
  activeIndexRef.current = activeIndex;

  useEffect(() => {
    if (reduce) return;
    scheduleApplyDepth();
    const track = trackRef.current;
    track?.addEventListener("scroll", scheduleApplyDepth, { passive: true });
    // requestAnimationFrame is paused for hidden documents (e.g. a page
    // loaded in a background tab) — catch up once it's actually shown.
    document.addEventListener("visibilitychange", scheduleApplyDepth);

    function onResize() {
      centerCard(activeIndexRef.current, "instant" as ScrollBehavior);
      scheduleApplyDepth();
    }
    const ro = new ResizeObserver(onResize);
    if (track) ro.observe(track);

    return () => {
      track?.removeEventListener("scroll", scheduleApplyDepth);
      document.removeEventListener("visibilitychange", scheduleApplyDepth);
      ro.disconnect();
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    };
  }, [reduce, scheduleApplyDepth, centerCard]);

  function goTo(i: number, behavior: ScrollBehavior = "smooth") {
    const clamped = Math.max(0, Math.min(items.length - 1, i));
    centerCard(clamped, behavior);
  }

  if (reduce) {
    return (
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((v) => (
          <div key={v.title} className="glass rounded-2xl p-5 h-full">
            <span
              className="w-10 h-10 rounded-xl grid place-items-center mb-3"
              style={{ background: `${v.color}22`, color: v.color }}
            >
              {v.icon}
            </span>
            <h3 className="font-bold text-[15px]">{v.title}</h3>
            <p className="text-sm text-[#7d99a3] mt-1.5 leading-relaxed">{v.body}</p>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="relative">
      <div
        ref={trackRef}
        role="region"
        aria-label="Why Forage"
        className="no-scrollbar flex items-stretch gap-4 overflow-x-auto overscroll-x-contain snap-x snap-mandatory py-6 px-[calc(50%_-_120px)] sm:px-[calc(50%_-_140px)] md:px-[calc(50%_-_150px)]"
      >
        {items.map((v, i) => (
          <div
            key={v.title}
            ref={(el) => {
              cardRefs.current[i] = el;
            }}
            className="glass glass-hover rounded-2xl p-5 shrink-0 snap-center w-[240px] sm:w-[280px] md:w-[300px]"
          >
            <span
              className="w-10 h-10 rounded-xl grid place-items-center mb-3"
              style={{ background: `${v.color}22`, color: v.color }}
            >
              {v.icon}
            </span>
            <h3 className="font-bold text-[15px]">{v.title}</h3>
            <p className="text-sm text-[#7d99a3] mt-1.5 leading-relaxed line-clamp-3">{v.body}</p>
          </div>
        ))}
      </div>

      <button
        onClick={() => goTo(activeIndex - 1)}
        aria-label="Previous"
        disabled={activeIndex === 0}
        className="hidden md:grid absolute left-1 sm:left-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full glass glass-hover place-items-center disabled:opacity-30 disabled:pointer-events-none"
      >
        <ChevronLeft size={18} />
      </button>
      <button
        onClick={() => goTo(activeIndex + 1)}
        aria-label="Next"
        disabled={activeIndex === items.length - 1}
        className="hidden md:grid absolute right-1 sm:right-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full glass glass-hover place-items-center disabled:opacity-30 disabled:pointer-events-none"
      >
        <ChevronRight size={18} />
      </button>

      <div className="flex items-center justify-center gap-2 mt-2">
        {items.map((v, i) => (
          <button
            key={v.title}
            onClick={() => goTo(i)}
            aria-label={`Go to ${v.title}`}
            aria-current={i === activeIndex}
            className="p-1.5 -m-1.5"
          >
            <span
              className={`block rounded-full transition-all duration-300 ${
                i === activeIndex ? "w-6 h-2 bg-[#00e5ff]" : "w-2 h-2 bg-white/20 hover:bg-white/35"
              }`}
            />
          </button>
        ))}
      </div>
    </div>
  );
}
