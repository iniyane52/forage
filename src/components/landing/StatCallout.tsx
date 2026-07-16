"use client";

import { CountUp } from "@/components/ui/motion";

/** A large animated stat used to fill flanking space beside a centered carousel with
 * something real instead of empty margin -- actual platform numbers, not filler. */
export function StatCallout({
  value,
  suffix = "",
  label,
  accent = "#00e5ff",
  className = "",
}: {
  value: number;
  suffix?: string;
  label: string;
  accent?: string;
  className?: string;
}) {
  return (
    <div className={`font-mono ${className}`}>
      <div className="text-4xl xl:text-5xl font-bold" style={{ color: accent, fontFamily: "var(--font-display)" }}>
        <CountUp value={value} />
        {suffix}
      </div>
      <p className="text-[11px] text-[#7d99a3] uppercase tracking-widest mt-1.5 max-w-[10rem]">{label}</p>
    </div>
  );
}
