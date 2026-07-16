"use client";

import Link from "next/link";
import { HoverTilt, ProgressRing } from "@/components/ui/motion";
import { streamIcon, Lock, ChevronRight } from "@/components/ui/icons";
import { pathMeta, difficultyLabel, difficultyLevel } from "@/lib/pathMeta";

// Resolved INSIDE this client component (not passed as a prop) — Lucide component
// references can't cross the server/client boundary as props (RSC serialization).
export function PathTile({
  slug,
  title,
  tagline,
  href,
  doneCount,
  totalCount,
  locked,
}: {
  slug: string;
  title: string;
  tagline: string;
  href: string;
  doneCount: number;
  totalCount: number;
  locked: boolean;
}) {
  const meta = pathMeta[slug];
  const accent = meta?.accent ?? "#00e5ff";
  const Icon = streamIcon[slug] ?? streamIcon.foundations;
  const pct = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0;
  const level = meta ? difficultyLevel[meta.difficulty] : 1;

  return (
    <HoverTilt>
      <Link
        href={href}
        className="group block glass glass-hover rounded-3xl p-6 sm:p-7 h-full relative overflow-hidden"
        style={{ borderColor: `${accent}22` }}
      >
        {/* Large background icon — poster-style skill identity mark */}
        <Icon
          size={128}
          strokeWidth={1.25}
          className="absolute -right-4 -bottom-6 pointer-events-none select-none"
          style={{ color: accent, opacity: 0.1, transform: "rotate(-8deg)" }}
        />

        {locked && (
          <span className="absolute top-5 right-5 text-[#7d99a3] z-10">
            <Lock size={18} />
          </span>
        )}

        {!locked && totalCount > 0 && (
          <div className="absolute top-5 right-5 z-10">
            <ProgressRing pct={pct} size={52} strokeWidth={5} trackColor="rgba(255,255,255,0.07)">
              <span className="text-[10px] font-bold" style={{ fontFamily: "var(--font-display)" }}>
                {pct}%
              </span>
            </ProgressRing>
          </div>
        )}

        <div className="relative z-[1]">
          <span
            className="shrink-0 w-14 h-14 rounded-2xl grid place-items-center"
            style={{ backgroundColor: `${accent}1f`, color: accent }}
          >
            <Icon size={28} strokeWidth={1.75} />
          </span>

          <h3
            className="mt-4 text-xl sm:text-2xl font-bold flex items-center gap-1.5"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {title}
            <ChevronRight
              size={18}
              className="opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all"
              style={{ color: accent }}
            />
          </h3>
          <p className="text-sm text-[#7d99a3] mt-1.5 max-w-[90%]">{tagline}</p>

          {meta && (
            <div className="flex flex-wrap gap-1.5 mt-4">
              {meta.skills.map((s) => (
                <span
                  key={s}
                  className="text-[11px] font-medium px-2.5 py-1 rounded-full border"
                  style={{ borderColor: `${accent}3d`, color: accent, backgroundColor: `${accent}0f` }}
                >
                  {s}
                </span>
              ))}
            </div>
          )}

          <div className="flex items-center gap-4 mt-5">
            {meta && (
              <div className="flex items-center gap-1.5">
                <span className="flex gap-[3px]" aria-hidden="true">
                  {[1, 2, 3].map((i) => (
                    <span
                      key={i}
                      className="w-3.5 h-1.5 rounded-full"
                      style={{ backgroundColor: i <= level ? accent : "rgba(255,255,255,0.1)" }}
                    />
                  ))}
                </span>
                <span className="text-[11px] text-[#7d99a3]">{difficultyLabel[meta.difficulty]}</span>
              </div>
            )}
            {!locked && totalCount > 0 ? (
              <span className="text-[11px] text-[#7d99a3]">
                {doneCount}/{totalCount} lessons
              </span>
            ) : locked ? (
              <span className="text-[11px] font-semibold" style={{ color: accent }}>
                Unlock with Pro
              </span>
            ) : null}
          </div>
        </div>
      </Link>
    </HoverTilt>
  );
}
