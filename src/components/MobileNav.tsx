"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "@/components/ui/icons";

const LINKS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/interview", label: "Interview" },
  { href: "/profile", label: "Profile" },
];

/**
 * Below `sm`, the header's real nav (Dashboard/Interview/Profile) is hidden with no
 * other way to reach it -- Profile in particular has no other link anywhere in the
 * app. This is the mobile-width fallback for that same set of links.
 */
export function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const [lastPathname, setLastPathname] = useState(pathname);

  if (pathname !== lastPathname) {
    setLastPathname(pathname);
    setOpen(false);
  }

  return (
    <div className="relative sm:hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        className="text-[var(--color-text-secondary)] hover:text-[var(--color-text)] p-1 -m-1"
      >
        {open ? <X size={20} /> : <Menu size={20} />}
      </button>
      {open && (
        <nav
          aria-label="Main"
          className="absolute left-0 top-full mt-2 min-w-[160px] bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] shadow-xl shadow-[rgb(var(--surface-rgb)/0.5)] flex flex-col p-1.5 text-sm z-30"
        >
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="px-3 py-2 rounded-lg text-[var(--color-text-secondary)] hover:text-[var(--color-text)] hover:bg-[rgb(var(--surface-rgb)/0.05)] transition-colors"
            >
              {l.label}
            </Link>
          ))}
        </nav>
      )}
    </div>
  );
}
