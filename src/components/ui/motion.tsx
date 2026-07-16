"use client";

import { motion, useReducedMotion, useScroll, useTransform, type Variants } from "framer-motion";
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
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
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
    <motion.div
      className={className}
      variants={container}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-80px" }}
    >
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
        className="h-full origin-left rounded-full bg-gradient-to-r from-[#00e5ff] to-[#3fb950]"
        initial={reduce ? false : { scaleX: 0 }}
        animate={{ scaleX: Math.max(0, Math.min(1, pct / 100)) }}
        transition={{ duration: 0.7, ease: easeOut }}
        style={{ width: "100%" }}
      />
    </div>
  );
}

/** SVG progress ring via stroke-dashoffset — for level/completion/score displays. */
export function ProgressRing({
  pct,
  size = 96,
  strokeWidth = 8,
  className = "",
  trackColor = "rgba(255,255,255,0.08)",
  children,
}: {
  pct: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
  trackColor?: string;
  children?: React.ReactNode;
}) {
  const reduce = useReducedMotion();
  const r = (size - strokeWidth) / 2;
  const circ = 2 * Math.PI * r;
  const clamped = Math.max(0, Math.min(100, pct));
  return (
    <div className={`relative inline-flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
      <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={trackColor} strokeWidth={strokeWidth} />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="url(#forage-ring-gradient)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circ}
          initial={reduce ? false : { strokeDashoffset: circ }}
          animate={{ strokeDashoffset: circ * (1 - clamped / 100) }}
          transition={{ duration: 0.9, ease: easeOut }}
        />
        <defs>
          <linearGradient id="forage-ring-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00e5ff" />
            <stop offset="100%" stopColor="#baff2e" />
          </linearGradient>
        </defs>
      </svg>
      {children && <div className="absolute inset-0 flex items-center justify-center">{children}</div>}
    </div>
  );
}

/** Wraps a card with a subtle hover lift + tilt — for bold, graphic surfaces only. */
export function HoverTilt({ children, className }: { children: React.ReactNode; className?: string }) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      whileHover={{ y: -4, rotateX: 2, rotateZ: -0.3, scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      transition={{ duration: 0.25, ease: easeOut }}
      style={{ transformPerspective: 800 }}
    >
      {children}
    </motion.div>
  );
}

/** Decorative animated dot-grid backdrop — for bold marketing/nav surfaces only. */
export function DotGridBackdrop({ className = "" }: { className?: string }) {
  const reduce = useReducedMotion();
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 -z-10 opacity-[0.35] ${className}`}
      style={{
        backgroundImage: "radial-gradient(rgba(255,255,255,0.14) 1px, transparent 1px)",
        backgroundSize: "22px 22px",
        maskImage: "radial-gradient(ellipse 60% 60% at 50% 0%, black 40%, transparent 100%)",
        WebkitMaskImage: "radial-gradient(ellipse 60% 60% at 50% 0%, black 40%, transparent 100%)",
        animation: reduce ? undefined : "forage-dot-drift 18s ease-in-out infinite alternate",
      }}
    />
  );
}

/** Heading text-reveal: characters/words fade+rise in with a stagger. */
export function HeadingReveal({
  text,
  as: Tag = "span",
  className,
  delay = 0,
}: {
  text: string;
  as?: "span" | "h1" | "h2" | "h3";
  className?: string;
  delay?: number;
}) {
  const reduce = useReducedMotion();
  const words = text.split(" ");
  if (reduce) {
    const El = Tag;
    return <El className={className}>{text}</El>;
  }
  return (
    <motion.span
      className={className}
      style={{ display: "inline-block" }}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-60px" }}
      variants={{ hidden: {}, show: { transition: { staggerChildren: 0.05, delayChildren: delay } } }}
    >
      {words.map((w, i) => (
        <motion.span
          key={i}
          style={{ display: "inline-block", marginRight: "0.25em" }}
          variants={{
            hidden: { opacity: 0, y: 18, filter: "blur(4px)" },
            show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.5, ease: easeOut } },
          }}
        >
          {w}
        </motion.span>
      ))}
    </motion.span>
  );
}

/**
 * Continuous scroll-linked drift for whole-page (non-pinned) sections — subtle, so it reads as
 * "the page feels alive" rather than competing with ScrollHero's dramatic pinned tilt. Unlike
 * FadeUp/Stagger (reveal once via whileInView), this stays tied to scroll position the entire
 * time the section is in the viewport.
 */
export function ScrollParallax({
  children,
  className,
  yRange = 24,
  fadeEdges = false,
}: {
  children: React.ReactNode;
  className?: string;
  yRange?: number;
  fadeEdges?: boolean;
}) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [yRange, -yRange]);
  const opacity = useTransform(scrollYProgress, [0, 0.15, 0.85, 1], [0.5, 1, 1, 0.5]);

  if (reduce) return <div className={className}>{children}</div>;
  return (
    <motion.div ref={ref} className={className} style={{ y, opacity: fadeEdges ? opacity : undefined }}>
      {children}
    </motion.div>
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
