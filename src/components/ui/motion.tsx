"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import { useEffect, useRef, useState } from "react";

const easeOut = [0.16, 1, 0.3, 1] as const;

export function FadeUp({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: easeOut, delay }}
    >
      {children}
    </motion.div>
  );
}

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } },
};
const item: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: easeOut } },
};

export function Stagger({ children, className }: { children: React.ReactNode; className?: string }) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;
  return (
    <motion.div className={className} variants={container} initial="hidden" animate="show">
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children, className }: { children: React.ReactNode; className?: string }) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;
  return (
    <motion.div className={className} variants={item}>
      {children}
    </motion.div>
  );
}

/** Progress bar that grows via scaleX transform (no layout reflow). */
export function AnimatedBar({ pct, className = "" }: { pct: number; className?: string }) {
  const reduce = useReducedMotion();
  return (
    <div className={`h-2 rounded-full bg-white/[0.06] overflow-hidden ${className}`}>
      <motion.div
        className="h-full origin-left rounded-full bg-gradient-to-r from-[#7c5cff] to-[#3fb950]"
        initial={reduce ? false : { scaleX: 0 }}
        animate={{ scaleX: Math.max(0, Math.min(1, pct / 100)) }}
        transition={{ duration: 0.7, ease: easeOut }}
        style={{ width: "100%" }}
      />
    </div>
  );
}

/** Counts up to a number when it mounts. */
export function CountUp({ value, className }: { value: number; className?: string }) {
  const reduce = useReducedMotion();
  const [display, setDisplay] = useState(reduce ? value : 0);
  const raf = useRef<number | null>(null);
  useEffect(() => {
    if (reduce) {
      setDisplay(value);
      return;
    }
    const start = performance.now();
    const dur = 700;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / dur);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(Math.round(value * eased));
      if (t < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, [value, reduce]);
  return <span className={className}>{display}</span>;
}
