"use client";

import { useReducedMotion } from "framer-motion";
import { streamIcon } from "@/components/ui/icons";
import { pathMeta } from "@/lib/pathMeta";

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
 */
export function TechTicker() {
  const reduce = useReducedMotion();

  if (reduce) {
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
      className="relative overflow-hidden border-y border-white/[0.06] py-3"
      style={{
        maskImage: "linear-gradient(90deg, transparent, black 6%, black 94%, transparent)",
        WebkitMaskImage: "linear-gradient(90deg, transparent, black 6%, black 94%, transparent)",
      }}
    >
      <div className="flex w-max marquee-track">
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
