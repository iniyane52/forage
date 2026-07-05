"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { CheckCircle2, Sparkles, Loader2 } from "@/components/ui/icons";

const freePerks = [
  "The full Common Core (6 modules)",
  "Engineering mindset + digital foundations",
  "Programming, Git & professional skills",
  "Career Discovery — find your path",
  "Quizzes, XP, streaks & badges",
];
const proPerks = [
  "Everything in Free, plus:",
  "All 6 career paths unlocked",
  "Basics → advanced, with capstones",
  "FAANG-caliber quizzes per lesson",
  "Curated resources + interactive labs",
  "Interview prep for your target role",
];

export default function PricingPage() {
  const router = useRouter();
  const supabase = createClient();
  const [busy, setBusy] = useState(false);

  async function upgrade() {
    setBusy(true);
    const { error } = await supabase.rpc("grant_pro");
    setBusy(false);
    if (!error) {
      router.push("/dashboard");
      router.refresh();
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold" style={{ fontFamily: "var(--font-display)" }}>
          Choose your plan
        </h1>
        <p className="text-sm text-[#a79fc0] mt-2">
          Start free with the Common Core. Go Pro when you pick a career path.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-5">
        {/* Free */}
        <div className="glass rounded-2xl p-6">
          <p className="text-xs font-bold uppercase tracking-widest text-[#a79fc0]">Free</p>
          <p className="text-3xl font-bold mt-1" style={{ fontFamily: "var(--font-display)" }}>
            ₹0
          </p>
          <p className="text-xs text-[#a79fc0]">forever</p>
          <ul className="mt-5 space-y-2">
            {freePerks.map((p) => (
              <li key={p} className="flex items-start gap-2 text-sm">
                <CheckCircle2 size={16} className="text-[#3fb950] mt-0.5 shrink-0" />
                <span>{p}</span>
              </li>
            ))}
          </ul>
          <Link
            href="/dashboard"
            className="block text-center mt-6 px-4 py-2.5 rounded-xl glass glass-hover text-sm font-semibold"
          >
            Keep learning free
          </Link>
        </div>

        {/* Pro */}
        <div className="glass rounded-2xl p-6 border-[#7c5cff]/40 relative overflow-hidden">
          <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-[#c86bff]/20 blur-3xl pointer-events-none" />
          <p className="text-xs font-bold uppercase tracking-widest text-[#c86bff] flex items-center gap-1">
            <Sparkles size={13} /> Pro
          </p>
          <p className="text-3xl font-bold mt-1" style={{ fontFamily: "var(--font-display)" }}>
            Coming soon
          </p>
          <p className="text-xs text-[#a79fc0]">pricing to be announced</p>
          <ul className="mt-5 space-y-2">
            {proPerks.map((p, i) => (
              <li key={p} className="flex items-start gap-2 text-sm">
                <CheckCircle2
                  size={16}
                  className={`mt-0.5 shrink-0 ${i === 0 ? "text-[#a79fc0]" : "text-[#c86bff]"}`}
                />
                <span className={i === 0 ? "text-[#a79fc0]" : ""}>{p}</span>
              </li>
            ))}
          </ul>
          <button
            onClick={upgrade}
            disabled={busy}
            className="w-full mt-6 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#7c5cff] to-[#c86bff] text-white text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {busy && <Loader2 size={16} className="animate-spin" />}
            Unlock Pro (preview)
          </button>
          <p className="text-[11px] text-center text-[#a79fc0] mt-2">
            Preview access — payments arrive with launch.
          </p>
        </div>
      </div>
    </div>
  );
}
