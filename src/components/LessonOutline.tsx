"use client";

import { useEffect, useRef, useState } from "react";
import { useMounted } from "@/hooks/useMounted";

export type OutlineItem = { id: string; label: string };

/** 2xl+ only: below that, the (app) layout's max-w-5xl container leaves too little
 * side margin for a labeled column to sit in without overlapping real content
 * (confirmed by breakpoint math, not a guess -- at 1280px/xl the margin outside a
 * centered 1024px container is only ~128px, not enough for readable labels). */
export function LessonOutline({ items, accent }: { items: OutlineItem[]; accent: string }) {
  const mounted = useMounted();
  const [active, setActive] = useState(items[0]?.id);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    if (!mounted) return;
    const headings = items.map((i) => document.getElementById(i.id)).filter((el): el is HTMLElement => !!el);
    if (!headings.length) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-15% 0% -70% 0%", threshold: 0 }
    );
    headings.forEach((h) => observerRef.current!.observe(h));
    return () => observerRef.current?.disconnect();
  }, [mounted, items]);

  if (!mounted || items.length < 2) return null;

  return (
    <nav aria-label="Lesson sections" className="hidden 2xl:block fixed right-8 top-1/2 -translate-y-1/2 z-10 max-w-[180px]">
      <ul className="space-y-2.5 text-xs">
        {items.map((item) => {
          const isActive = item.id === active;
          return (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                className="flex items-center gap-2 transition-colors"
                style={{ color: isActive ? accent : "#7d99a3" }}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full shrink-0 transition-transform"
                  style={{
                    backgroundColor: isActive ? accent : "rgba(125,153,163,0.4)",
                    transform: isActive ? "scale(1.4)" : "scale(1)",
                  }}
                />
                <span className="truncate">{item.label}</span>
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
