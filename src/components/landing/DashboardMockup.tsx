"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useMounted } from "@/hooks/useMounted";
import { CountUp } from "@/components/ui/motion";
import {
  Sparkles,
  Flame,
  GraduationCap,
  Lock,
  Mic,
  BrainCircuit,
  Globe,
  BarChart3,
} from "@/components/ui/icons";
import { TypingCode } from "@/components/landing/TypingCode";

const PATHS = [
  { icon: BrainCircuit, title: "AI Engineer", locked: true },
  { icon: Globe, title: "Full-Stack Dev", locked: true },
  { icon: BarChart3, title: "Data Scientist", locked: false, pct: 34 },
];

/** Animates in on mount (not whileInView -- this whole card sits above the fold,
 * visible immediately, so a scroll-triggered reveal would never have anything to
 * trigger off of). */
function Bar({ pct, className = "h-1.5" }: { pct: number; className?: string }) {
  const reduce = useReducedMotion();
  const mounted = useMounted();
  return (
    <div className={`rounded-full bg-[rgb(var(--surface-rgb)/0.06)] overflow-hidden ${className}`}>
      <motion.div
        className="h-full w-full origin-left rounded-full bg-gradient-to-r from-[#00e5ff] to-[#3fb950]"
        initial={!mounted || reduce ? false : { scaleX: 0 }}
        animate={{ scaleX: pct / 100 }}
        transition={{ duration: 1, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
      />
    </div>
  );
}

/**
 * A stylized, illustrative recreation of the real Forage dashboard —
 * not a live view, not a screenshot. Fake data, purely decorative.
 * Progress bars fill in and the XP counts up on mount instead of sitting static,
 * so the card reads as a living product snapshot, not a flat screenshot.
 */
export function DashboardMockup() {
  return (
    <div aria-hidden="true" className="max-w-3xl mx-auto p-6 md:p-8">
      {/* Mini top bar */}
      <div className="flex items-center gap-3 mb-6">
        <span className="text-sm font-bold" style={{ fontFamily: "var(--font-display)" }}>
          Forage<span className="text-[var(--color-primary)]">.</span>
        </span>
        <div className="ml-auto flex items-center gap-1.5">
          <span className="px-2 py-0.5 rounded-lg bg-[rgb(var(--surface-rgb)/0.05)] text-[var(--color-primary)] font-semibold text-[10px]">
            Lv 4
          </span>
          <span className="px-2 py-0.5 rounded-lg bg-[rgb(var(--surface-rgb)/0.05)] text-[var(--color-success)] font-semibold text-[10px] flex items-center gap-1">
            <Sparkles size={10} /> <CountUp value={860} /> XP
          </span>
          <span className="px-2 py-0.5 rounded-lg bg-[rgb(var(--surface-rgb)/0.05)] text-[var(--color-warning)] font-semibold text-[10px] flex items-center gap-1">
            <Flame size={10} /> 6
          </span>
        </div>
      </div>

      {/* Common Core progress card */}
      <div className="rounded-xl p-4 bg-[rgb(var(--surface-rgb)/0.03)] border border-[var(--color-border)] mb-4">
        <div className="flex items-center gap-1.5 mb-1">
          <GraduationCap size={13} className="text-[#baff2e]" />
          <span className="text-[9px] font-bold uppercase tracking-widest text-[#baff2e]">
            Common Core · Free
          </span>
        </div>
        <p className="text-sm font-bold mb-2.5">Continue where you left off</p>
        <Bar pct={62} className="h-1.5" />
        <p className="text-[10px] text-[var(--color-text-secondary)] mt-1.5">5 of 8 lessons · 62%</p>
      </div>

      {/* Career paths mini-grid */}
      <div className="grid grid-cols-3 gap-2.5 mb-4">
        {PATHS.map((p) => (
          <div key={p.title} className="rounded-xl p-3 bg-[rgb(var(--surface-rgb)/0.03)] border border-[var(--color-border)] relative">
            {p.locked && <Lock size={11} className="absolute top-2.5 right-2.5 text-[var(--color-text-secondary)]" />}
            <span className="w-7 h-7 rounded-lg grid place-items-center bg-[#00e5ff]/15 text-[#6ff9ff] mb-1.5">
              <p.icon size={14} />
            </span>
            <p className="text-[10px] font-bold leading-tight">{p.title}</p>
            {!p.locked && <Bar pct={p.pct ?? 0} className="h-1 mt-1.5" />}
          </div>
        ))}
      </div>

      {/* Forage Interview mini-card */}
      <div className="rounded-xl p-3.5 bg-[rgb(var(--surface-rgb)/0.03)] border border-[var(--color-border)] flex items-center gap-3">
        <span className="w-8 h-8 rounded-lg grid place-items-center bg-[#3d8fff]/15 text-[#5ba3ff] shrink-0">
          <Mic size={15} />
        </span>
        <p className="text-[11px] font-bold flex-1">Forage Interview</p>
        <span className="text-[9px] font-semibold px-2 py-0.5 rounded-lg bg-[#ffb020]/15 text-[#ffb020]">
          4-min trial
        </span>
      </div>

      <TypingCode />
    </div>
  );
}
