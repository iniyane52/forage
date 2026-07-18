"use client";

import { useRef } from "react";
import { useReducedMotion } from "framer-motion";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/components/ui/gsapMotion";
import { HoverTilt } from "@/components/ui/motion";
import { streamIcon, ChevronRight } from "@/components/ui/icons";
import { pathMeta, difficultyLabel, difficultyLevel } from "@/lib/pathMeta";

const PATHS = [
  { slug: "aiml", title: "AI Engineer", tagline: "Ship real ML systems, not just notebooks." },
  { slug: "software-engineer", title: "Software Engineer", tagline: "DSA and system design like an actual interview loop." },
  { slug: "fullstack", title: "Full-Stack Developer", tagline: "React front to Node back, one working app." },
  { slug: "data", title: "Data Scientist", tagline: "Numbers into decisions, not just charts." },
  { slug: "cloud-devops", title: "Cloud & DevOps", tagline: "Deploy it, containerize it, keep it up." },
  { slug: "cybersecurity", title: "Cybersecurity", tagline: "Think like an attacker, respond like a defender." },
];

function PathCard({
  slug,
  title,
  tagline,
  index,
}: {
  slug: string;
  title: string;
  tagline: string;
  index: number;
}) {
  const meta = pathMeta[slug];
  const accent = meta?.accent ?? "#00e5ff";
  const Icon = streamIcon[slug] ?? streamIcon.foundations;
  const level = meta ? difficultyLevel[meta.difficulty] : 1;
  const reduce = useReducedMotion();
  const cardRef = useRef<HTMLDivElement>(null);

  // A 3D flip-up on first scroll-entry, staggered by column -- replaces the plain
  // Framer Stagger mount entrance. HoverTilt (still Framer, hover-only) lives on a
  // separate nested element, so clearing GSAP's transform on completion keeps the
  // two from ever fighting over the same inline transform.
  useGSAP(
    () => {
      if (reduce || !cardRef.current) return;
      const el = cardRef.current;
      gsap.set(el, { transformPerspective: 800, transformOrigin: "bottom center", rotateX: -70, opacity: 0 });
      gsap.to(el, {
        rotateX: 0,
        opacity: 1,
        duration: 0.6,
        delay: (index % 3) * 0.08,
        ease: "power3.out",
        scrollTrigger: { trigger: el, start: "top 90%", once: true },
        onComplete: () => gsap.set(el, { clearProps: "transform" }),
      });
    },
    { scope: cardRef, dependencies: [reduce, index] }
  );

  return (
    <div ref={cardRef} className="h-full">
      <HoverTilt className="h-full">
        <div
          className="group h-full glass glass-hover rounded-2xl p-5 relative overflow-hidden"
          style={{ borderColor: `${accent}22` }}
        >
          <Icon
            size={96}
            strokeWidth={1.25}
            className="absolute -right-3 -bottom-4 pointer-events-none select-none"
            style={{ color: accent, opacity: 0.08, transform: "rotate(-8deg)" }}
          />
          <div className="relative z-[1]">
            <span
              className="inline-flex w-10 h-10 rounded-xl items-center justify-center"
              style={{ backgroundColor: `${accent}1f`, color: accent }}
            >
              <Icon size={20} strokeWidth={1.75} />
            </span>
            <h3
              className="mt-3 text-base font-bold flex items-center gap-1"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {title}
              <ChevronRight
                size={15}
                className="opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all"
                style={{ color: accent }}
              />
            </h3>
            <p className="text-xs text-[#7d99a3] mt-1 leading-relaxed">{tagline}</p>
            {meta && (
              <div className="flex flex-wrap gap-1.5 mt-3">
                {meta.skills.map((s) => (
                  <span
                    key={s}
                    className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full border"
                    style={{ borderColor: `${accent}3d`, color: accent, backgroundColor: `${accent}0f` }}
                  >
                    {s}
                  </span>
                ))}
              </div>
            )}
            {meta && (
              <div className="flex items-center gap-1.5 mt-3">
                <span className="flex gap-[3px]" aria-hidden="true">
                  {[1, 2, 3].map((i) => (
                    <span
                      key={i}
                      className="w-3 h-1 rounded-full"
                      style={{ backgroundColor: i <= level ? accent : "rgba(255,255,255,0.1)" }}
                    />
                  ))}
                </span>
                <span className="text-[10px] text-[#7d99a3]">{difficultyLabel[meta.difficulty]}</span>
              </div>
            )}
          </div>
        </div>
      </HoverTilt>
    </div>
  );
}

/** Dense marketing grid of the 6 career paths -- real skill tags and difficulty per
 * path (from pathMeta.ts), each in its own accent color, instead of a plain name list. */
export function PathGrid() {
  return (
    <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
      {PATHS.map((p, i) => (
        <PathCard key={p.slug} {...p} index={i} />
      ))}
    </div>
  );
}
