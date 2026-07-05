"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Glass } from "@/components/ui/Glass";
import { FadeUp } from "@/components/ui/motion";
import { Eye, EyeOff, Loader2, AlertTriangle } from "@/components/ui/icons";

export default function AuthPage() {
  const router = useRouter();
  const supabase = createClient();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMessage(null);
    if (mode === "signin") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setMessage(error.message);
      else {
        router.push("/dashboard");
        router.refresh();
      }
    } else {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) setMessage(error.message);
      else if (data.session) {
        router.push("/dashboard");
        router.refresh();
      } else {
        setMessage("Check your email to confirm your account, then sign in.");
        setMode("signin");
      }
    }
    setBusy(false);
  }

  return (
    <main className="min-h-dvh flex items-center justify-center px-4">
      <FadeUp className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold tracking-tight" style={{ fontFamily: "var(--font-display)" }}>
            Foundary<span className="text-[#4c8dff]">.</span>
          </h1>
          <p className="text-[#9aa7b4] mt-3 text-sm">
            Learn it from zero. Prove it with quizzes. Ship it for real.
          </p>
        </div>

        <Glass className="p-6">
          <div className="flex gap-2 mb-6 p-1 rounded-xl bg-white/[0.03]">
            {(["signin", "signup"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-colors ${
                  mode === m ? "bg-[#4c8dff] text-white" : "text-[#9aa7b4] hover:text-white"
                }`}
              >
                {m === "signin" ? "Sign in" : "Create account"}
              </button>
            ))}
          </div>

          <form onSubmit={submit} className="space-y-4">
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#4c8dff] transition-colors"
            />
            <div className="relative">
              <input
                type={showPw ? "text" : "password"}
                required
                minLength={6}
                autoComplete={mode === "signin" ? "current-password" : "new-password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password (6+ characters)"
                className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 pr-11 text-sm outline-none focus:border-[#4c8dff] transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                aria-label={showPw ? "Hide password" : "Show password"}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9aa7b4] hover:text-white"
              >
                {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <button
              disabled={busy}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-[#4c8dff] to-[#3fb950] font-semibold text-white disabled:opacity-50 flex items-center justify-center gap-2 transition-opacity"
            >
              {busy && <Loader2 size={18} className="animate-spin" />}
              {busy ? "Working..." : mode === "signin" ? "Sign in" : "Start learning free"}
            </button>
          </form>

          {message && (
            <p className="mt-4 text-sm text-[#e3a008] flex items-start gap-2">
              <AlertTriangle size={16} className="mt-0.5 shrink-0" />
              <span>{message}</span>
            </p>
          )}
        </Glass>

        <p className="text-center text-xs text-[#9aa7b4] mt-6">
          Free forever. Four streams, from absolute basics to hiring standard.
        </p>
      </FadeUp>
    </main>
  );
}
