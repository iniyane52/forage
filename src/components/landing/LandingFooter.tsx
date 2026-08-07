"use client";

import Link from "next/link";
import { useRef } from "react";
import { useReducedMotion } from "framer-motion";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/components/ui/gsapMotion";

const LEGAL_LINKS = [
  { href: "/terms", label: "Terms" },
  { href: "/privacy", label: "Privacy" },
  { href: "/refund", label: "Refunds" },
  { href: "/contact", label: "Contact" },
];

/** A restrained one-shot reveal plus a single delayed color-flash on the wordmark's
 * dot -- the page's closing beat, not a new focal point. */
export function LandingFooter() {
  const reduce = useReducedMotion();
  const footerRef = useRef<HTMLElement>(null);
  const dotRef = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      if (reduce || !footerRef.current) return;
      gsap.set(footerRef.current, { opacity: 0, y: 12 });
      const tl = gsap.timeline({
        scrollTrigger: { trigger: footerRef.current, start: "top 95%", once: true },
      });
      tl.to(footerRef.current, { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" });
      if (dotRef.current) {
        tl.to(dotRef.current, { color: "#baff2e", duration: 0.3, yoyo: true, repeat: 1 }, "+=0.2");
      }
    },
    { scope: footerRef, dependencies: [reduce] }
  );

  return (
    <footer ref={footerRef} className="border-t border-[var(--color-border)] py-8 mt-auto">
      <div className="max-w-5xl mx-auto px-4 flex flex-col gap-5">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[var(--color-text-secondary)]">
          <span style={{ fontFamily: "var(--font-display)" }}>
            Forage
            <span ref={dotRef} className="text-[var(--color-primary)]">
              .
            </span>
          </span>
          <span>Built for people done preparing-as-procrastination.</span>
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-5 border-t border-[var(--color-border)] text-xs text-[var(--color-text-secondary)]">
          <span>© {new Date().getFullYear()} Forage. All rights reserved.</span>
          <nav className="flex items-center gap-4">
            {LEGAL_LINKS.map((l) => (
              <Link key={l.href} href={l.href} className="hover:text-[var(--color-text)] transition-colors">
                {l.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  );
}
