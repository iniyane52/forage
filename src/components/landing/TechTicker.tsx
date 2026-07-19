"use client";

import { useRef } from "react";
import { useReducedMotion } from "framer-motion";
import { useGSAP } from "@gsap/react";
import { gsap, ScrollTrigger } from "@/components/ui/gsapMotion";
import { streamIcon } from "@/components/ui/icons";
import { pathMeta } from "@/lib/pathMeta";
import { useMounted } from "@/hooks/useMounted";

const PATHS = [
  { slug: "aiml", title: "AI Engineer" },
  { slug: "software-engineer", title: "Software Engineer" },
  { slug: "fullstack", title: "Full-Stack Developer" },
  { slug: "data", title: "Data Scientist" },
  { slug: "cloud-devops", title: "Cloud & DevOps" },
  { slug: "cybersecurity", title: "Cybersecurity" },
];

function Segment({ slug, title }: { slug: string; title: string }) {
  const meta = pathMeta[slug];
  const Icon = streamIcon[slug] ?? streamIcon.foundations;
  const accent = meta?.accent ?? "#00e5ff";
  return (
    <span className="inline-flex items-center gap-2.5 mx-4 shrink-0 font-mono text-[12px] sm:text-[13px] whitespace-nowrap">
      <Icon size={14} style={{ color: accent }} className="shrink-0" />
      <span className="font-bold tracking-wide" style={{ color: accent }}>
        {title}
      </span>
      <span className="text-[#7d99a3]">{meta?.skills.join(" · ")}</span>
    </span>
  );
}

/**
 * Content-dense replacement for a plain path-name marquee: each path's real skill
 * tags (from pathMeta.ts, not invented) scroll continuously alongside its name and
 * accent color -- answers "what does this actually teach" at a glance, which a
 * name-only chip never could.
 *
 * The scroll itself is a GSAP tween (not the old CSS keyframe) so its speed can react
 * to the user's own scroll velocity -- the ticker visibly quickens as you scroll past
 * it, clamped so it never gets nauseating.
 */
export function TechTicker() {
  const reduce = useReducedMotion();
  const mounted = useMounted();
  const sectionRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const tweenRef = useRef<gsap.core.Tween | null>(null);

  useGSAP(
    () => {
      // `mounted` must be BOTH checked here and in the dependencies: the hydration
      // render commits the static branch (no track/section refs attached), so this
      // effect's first run early-returns on null refs -- without `mounted` in deps
      // it never re-runs after the animated branch mounts, leaving the marquee
      // silently dead (same regression as TerminalHeading.tsx).
      if (!mounted || reduce || !trackRef.current || !sectionRef.current) return;

      const tween = gsap.to(trackRef.current, {
        xPercent: -50,
        duration: 20,
        ease: "none",
        repeat: -1,
        paused: true,
      });
      tweenRef.current = tween;

      // onToggle gates the tween on visibility (fires immediately at creation too,
      // reflecting whatever's already true) -- it used to run at base speed forever
      // once mounted, even scrolled far off-screen; onUpdate/onLeave(Back) still own
      // the scroll-velocity speed-up separately.
      const trigger = ScrollTrigger.create({
        trigger: sectionRef.current,
        start: "top bottom",
        end: "bottom top",
        onToggle: (self) => (self.isActive ? tween.play() : tween.pause()),
        onUpdate: (self) => {
          const speed = Math.min(2.2, 1 + Math.abs(self.getVelocity()) / 2500);
          tween.timeScale(speed);
        },
        onLeaveBack: () => tween.timeScale(1),
        onLeave: () => tween.timeScale(1),
      });

      return () => {
        tween.kill();
        trigger.kill();
      };
    },
    { scope: sectionRef, dependencies: [mounted, reduce] }
  );

  // Gating on `mounted` first (not just `reduce`) avoids a real hydration mismatch:
  // SSR always renders the marquee (no matchMedia on the server), so a client that
  // already prefers reduced motion could disagree with the server on the very first
  // paint -- same fix as ScrollProgressBar.tsx/SkillConstellation.tsx.
  if (!mounted || reduce) {
    return (
      <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 px-4 py-3">
        {PATHS.map((p) => (
          <Segment key={p.slug} {...p} />
        ))}
      </div>
    );
  }

  return (
    <div
      ref={sectionRef}
      className="relative overflow-hidden border-y border-white/[0.06] py-3"
      style={{
        maskImage: "linear-gradient(90deg, transparent, black 6%, black 94%, transparent)",
        WebkitMaskImage: "linear-gradient(90deg, transparent, black 6%, black 94%, transparent)",
      }}
    >
      <div
        ref={trackRef}
        className="flex w-max"
        onMouseEnter={() => tweenRef.current?.pause()}
        onMouseLeave={() => tweenRef.current?.play()}
      >
        {[0, 1].map((copy) => (
          <div key={copy} className="flex items-center" aria-hidden={copy === 1}>
            {PATHS.map((p) => (
              <span key={`${copy}-${p.slug}`} className="flex items-center">
                <Segment {...p} />
                <span className="text-white/15">/</span>
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
