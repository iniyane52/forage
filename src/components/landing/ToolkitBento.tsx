"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useMounted } from "@/hooks/useMounted";

export type ToolkitItem = {
  icon: React.ReactNode;
  title: string;
  body: string;
  color: string;
};

const EASE = [0.16, 1, 0.3, 1] as const;

function Cell({
  item,
  featured,
  index,
}: {
  item: ToolkitItem;
  featured?: boolean;
  index: number;
}) {
  const reduce = useReducedMotion();
  // Gated on `mounted` first: SSR always resolves `reduce` falsy, but a client that
  // genuinely prefers reduced motion resolves it synchronously on its very first
  // render, before hydration completes -- confirmed live as a real hydration
  // mismatch (this component's border-color style was one of the exact nodes flagged).
  const mounted = useMounted();
  return (
    <motion.div
      className={`glass-solid rounded-2xl border ${featured ? "p-7" : "p-5"}`}
      style={{ borderColor: `${item.color}2e` }}
      initial={!mounted || reduce ? false : { opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.6, delay: index * 0.06, ease: EASE }}
    >
      <span
        className={`inline-flex items-center justify-center rounded-xl mb-3 ${featured ? "w-11 h-11" : "w-9 h-9"}`}
        style={{ backgroundColor: `${item.color}22`, color: item.color }}
      >
        {item.icon}
      </span>
      <h3 className={`font-bold ${featured ? "text-lg mb-1.5" : "text-sm mb-1"}`} style={{ fontFamily: "var(--font-display)" }}>
        {item.title}
      </h3>
      <p className={`text-[#7d99a3] leading-relaxed ${featured ? "text-sm" : "text-xs"}`}>{item.body}</p>
    </motion.div>
  );
}

/**
 * Asymmetric bento: the 2 flagship features (Tutor, Interview) get large
 * featured cells, the other 4 value props sit smaller underneath -- replaces
 * a flat row of identically-sized cards, per `featuredIndices`.
 */
export function ToolkitBento({
  items,
  featuredIndices = [2, 3],
}: {
  items: ToolkitItem[];
  featuredIndices?: number[];
}) {
  const featured = items.filter((_, i) => featuredIndices.includes(i));
  const rest = items.filter((_, i) => !featuredIndices.includes(i));

  return (
    <div className="space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        {featured.map((item, i) => (
          <Cell key={item.title} item={item} featured index={i} />
        ))}
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {rest.map((item, i) => (
          <Cell key={item.title} item={item} index={featured.length + i} />
        ))}
      </div>
    </div>
  );
}
