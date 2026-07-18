"use client";

import { useReducedMotion } from "framer-motion";

/**
 * Route-transition loading state (e.g. right after clicking into a lesson) --
 * fires with no scroll context and needs to render instantly, so this is plain CSS
 * keyframes, not GSAP/ScrollTrigger. The shimmer is a separate overlaid bar (blend
 * mode, not the text's own color) rather than modifying `.gradient-word` directly --
 * that class relies on `background-clip: text` painting its own glyphs, and layering
 * another effect onto the same element risks the same class of bug SplitText hit
 * earlier this session when it tried to split gradient-clipped text into chars.
 */
export function LoadingMark() {
  const reduce = useReducedMotion();

  return (
    <div role="status" aria-label="Loading" className="flex flex-col items-center justify-center gap-3 py-24">
      <div className="relative inline-block overflow-hidden">
        <span className="gradient-word text-2xl font-bold" style={{ fontFamily: "var(--font-display)" }}>
          Forage
        </span>
        {!reduce && (
          <span
            aria-hidden="true"
            className="loader-sweep absolute inset-0"
            style={{
              background: "linear-gradient(100deg, transparent, rgba(255,255,255,0.55), transparent)",
              mixBlendMode: "overlay",
            }}
          />
        )}
      </div>
      <div className="flex gap-1.5" aria-hidden="true">
        {[0, 0.15, 0.3].map((delay) => (
          <span
            key={delay}
            className={`w-1.5 h-1.5 rounded-full bg-[#00e5ff] ${reduce ? "" : "loading-dot"}`}
            style={{ animationDelay: `${delay}s` }}
          />
        ))}
      </div>
    </div>
  );
}
