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

/**
 * A stylized, illustrative recreation of the real Forage dashboard —
 * not a live view, not a screenshot. Fake data, purely decorative.
 */
export function DashboardMockup() {
  return (
    <div aria-hidden="true" className="max-w-3xl mx-auto p-6 md:p-8">
      {/* Mini top bar */}
      <div className="flex items-center gap-3 mb-6">
        <span className="text-sm font-bold" style={{ fontFamily: "var(--font-display)" }}>
          Forage<span className="text-[#00e5ff]">.</span>
        </span>
        <div className="ml-auto flex items-center gap-1.5">
          <span className="px-2 py-0.5 rounded-lg bg-white/[0.05] text-[#00e5ff] font-semibold text-[10px]">
            Lv 4
          </span>
          <span className="px-2 py-0.5 rounded-lg bg-white/[0.05] text-[#3fb950] font-semibold text-[10px] flex items-center gap-1">
            <Sparkles size={10} /> 860 XP
          </span>
          <span className="px-2 py-0.5 rounded-lg bg-white/[0.05] text-[#ffb020] font-semibold text-[10px] flex items-center gap-1">
            <Flame size={10} /> 6
          </span>
        </div>
      </div>

      {/* Common Core progress card */}
      <div className="rounded-xl p-4 bg-white/[0.03] border border-white/[0.06] mb-4">
        <div className="flex items-center gap-1.5 mb-1">
          <GraduationCap size={13} className="text-[#baff2e]" />
          <span className="text-[9px] font-bold uppercase tracking-widest text-[#baff2e]">
            Common Core · Free
          </span>
        </div>
        <p className="text-sm font-bold mb-2.5">Continue where you left off</p>
        <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
          <div className="h-full w-[62%] rounded-full bg-gradient-to-r from-[#00e5ff] to-[#3fb950]" />
        </div>
        <p className="text-[10px] text-[#7d99a3] mt-1.5">5 of 8 lessons · 62%</p>
      </div>

      {/* Career paths mini-grid */}
      <div className="grid grid-cols-3 gap-2.5 mb-4">
        {PATHS.map((p) => (
          <div key={p.title} className="rounded-xl p-3 bg-white/[0.03] border border-white/[0.06] relative">
            {p.locked && <Lock size={11} className="absolute top-2.5 right-2.5 text-[#7d99a3]" />}
            <span className="w-7 h-7 rounded-lg grid place-items-center bg-[#00e5ff]/15 text-[#6ff9ff] mb-1.5">
              <p.icon size={14} />
            </span>
            <p className="text-[10px] font-bold leading-tight">{p.title}</p>
            {!p.locked && (
              <div className="h-1 rounded-full bg-white/[0.06] overflow-hidden mt-1.5">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#00e5ff] to-[#3fb950]"
                  style={{ width: `${p.pct}%` }}
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Forage Interview mini-card */}
      <div className="rounded-xl p-3.5 bg-white/[0.03] border border-white/[0.06] flex items-center gap-3">
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
