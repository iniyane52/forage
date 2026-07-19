"use client";

import { useState } from "react";
import { Menu, X } from "@/components/ui/icons";

const LINKS = [
  { href: "#paths", label: "Career paths" },
  { href: "#interview", label: "Forage Interview" },
  { href: "#pricing", label: "Pricing" },
];

/**
 * Below `sm`, the landing header's anchor nav is hidden with no other way to jump
 * to the page's sections. Same dropdown pattern as the app's MobileNav, but with
 * plain in-page anchors (no router involvement) -- the menu closes on click since
 * an anchor jump doesn't change the pathname.
 */
export function LandingMobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative sm:hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        className="text-[#7d99a3] hover:text-white p-1 -m-1"
      >
        {open ? <X size={20} /> : <Menu size={20} />}
      </button>
      {open && (
        <nav
          aria-label="Sections"
          className="absolute left-0 top-full mt-2 min-w-[180px] bg-[#0a0e14] rounded-xl border border-white/[0.1] shadow-xl shadow-black/50 flex flex-col p-1.5 text-sm z-30"
        >
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="px-3 py-2 rounded-lg text-[#7d99a3] hover:text-white hover:bg-white/[0.05] transition-colors"
            >
              {l.label}
            </a>
          ))}
        </nav>
      )}
    </div>
  );
}
