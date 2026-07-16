"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";

const charVariants: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.01 } },
};

/**
 * A bolder, distinct typographic register for the mid-page section transitions --
 * monospace, terminal-style character reveal with a blinking cursor, deliberately
 * different from the display-face headings used everywhere else. Used sparingly
 * (only at section-divider moments) so it reads as a beat, not decoration.
 */
export function TerminalHeading({ text, className = "" }: { text: string; className?: string }) {
  const reduce = useReducedMotion();

  if (reduce) {
    return (
      <h2 className={`font-mono font-bold ${className}`}>
        <span className="text-[#00e5ff]">{">"}</span> {text}
      </h2>
    );
  }

  return (
    <motion.h2
      className={`font-mono font-bold ${className}`}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-100px" }}
      variants={{ hidden: {}, show: { transition: { staggerChildren: 0.026 } } }}
    >
      <motion.span className="text-[#00e5ff] mr-2" variants={charVariants}>
        {">"}
      </motion.span>
      {text.split("").map((c, i) => (
        <motion.span key={i} variants={charVariants} style={{ display: "inline-block" }}>
          {c === " " ? " " : c}
        </motion.span>
      ))}
      <motion.span
        aria-hidden="true"
        className="inline-block w-[0.5em] h-[0.85em] bg-[#00e5ff] ml-1 align-middle"
        animate={{ opacity: [1, 1, 0, 0] }}
        transition={{ duration: 1, repeat: Infinity, times: [0, 0.5, 0.5, 1] }}
      />
    </motion.h2>
  );
}
