"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Mic, Loader2, Volume2 } from "@/components/ui/icons";

export type OrbState = "idle" | "listening" | "thinking" | "speaking";

const RING_COLOR: Record<OrbState, string> = {
  idle: "#3d8fff",
  listening: "#3fb950",
  thinking: "#ffb020",
  speaking: "#5ba3ff",
};

export function VoiceOrb({ state }: { state: OrbState }) {
  const reduce = useReducedMotion();
  const color = RING_COLOR[state];

  return (
    <div className="relative w-40 h-40 mx-auto grid place-items-center">
      {!reduce && (state === "listening" || state === "speaking") && (
        <>
          <motion.span
            className="absolute inset-0 rounded-full"
            style={{ background: color, opacity: 0.18 }}
            animate={{ scale: [1, 1.35, 1], opacity: [0.18, 0.04, 0.18] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.span
            className="absolute inset-3 rounded-full"
            style={{ background: color, opacity: 0.22 }}
            animate={{ scale: [1, 1.2, 1], opacity: [0.22, 0.06, 0.22] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut", delay: 0.15 }}
          />
        </>
      )}
      <motion.div
        className="relative w-24 h-24 rounded-full grid place-items-center glass"
        style={{ boxShadow: `0 0 0 1px ${color}55, 0 0 40px -6px ${color}88` }}
        animate={
          reduce
            ? {}
            : state === "thinking"
            ? { rotate: 360 }
            : { scale: state === "idle" ? 1 : [1, 1.05, 1] }
        }
        transition={
          state === "thinking"
            ? { duration: 1.4, repeat: Infinity, ease: "linear" }
            : { duration: 1.4, repeat: Infinity, ease: "easeInOut" }
        }
      >
        {state === "thinking" ? (
          <Loader2 size={30} style={{ color }} />
        ) : state === "speaking" ? (
          <Volume2 size={30} style={{ color }} />
        ) : (
          <Mic size={30} style={{ color }} />
        )}
      </motion.div>
    </div>
  );
}
