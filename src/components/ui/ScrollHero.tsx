"use client";

/**
 * Static hero layout: header, then card, no scroll-tied pin/tilt effect.
 *
 * This used to pin the header+card near the top of the viewport while a card
 * rotated/scaled as the user scrolled through a tall section below it. Two
 * implementations were tried and both had real, unresolved bugs:
 *
 * 1. CSS `position: sticky` (original) never actually engaged -- confirmed via
 *    direct getBoundingClientRect() measurements showing the pinned wrapper just
 *    scrolling away 1:1 with the page at every scroll depth tested. Root-causing
 *    it turned up no fix after ruling out every known CSS disqualifier (overflow-
 *    auto-promotion on every ancestor, transform/filter/perspective/contain/
 *    isolation on every ancestor up to <html>).
 * 2. GSAP ScrollTrigger's `pin` (tried as the replacement) fixed several real,
 *    separate bugs along the way -- a page-wide CSS regression where the page-
 *    transition template's `transform: translateY(...)` (even resolved to a
 *    no-op post-animation) was silently breaking `position: fixed` for every
 *    descendant on the page; a duplicate ScrollTrigger instance from combining
 *    `gsap.matchMedia()` with `useGSAP`'s dependency-triggered re-runs; and a
 *    font-loading measurement-timing issue (fixed globally in gsapMotion.tsx via
 *    `document.fonts.ready.then(() => ScrollTrigger.refresh())`). But even after
 *    all three fixes, the pinned content still ended up rendering off-screen
 *    partway through the scroll range -- the trigger's own start/end detection
 *    measured correctly, but the pinned element's captured baseline position did
 *    not, most likely due to other ScrollTrigger-driven components on this same
 *    page (PathGrid, SkillConstellation, TechTicker, TerminalHeading) triggering
 *    their own refresh cascades. That's a real, deeper interaction bug worth a
 *    dedicated, isolated debugging session (e.g. testing ScrollHero alone on a
 *    blank page) rather than continued guessing here.
 *
 * Reverted to this simple static version so the hero is fully correct and never
 * disappears mid-scroll, at the cost of the pin/tilt effect for now.
 */
export function ScrollHero({
  header,
  card,
  className = "",
}: {
  header: React.ReactNode;
  card: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <div>{header}</div>
      <div className="glass rounded-[28px] mt-8 md:mt-12 max-w-5xl mx-auto overflow-hidden px-4 sm:px-6">
        {card}
      </div>
    </div>
  );
}
