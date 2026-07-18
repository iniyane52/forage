"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Glass } from "@/components/ui/Glass";
import { FadeUp } from "@/components/ui/motion";
import { Eye, EyeOff, Loader2, AlertTriangle } from "@/components/ui/icons";

// Google's brand mark isn't in lucide-react (icon-only, not brand logos), so it's
// inlined here rather than added to the shared icons.tsx re-export list -- it's used
// in exactly one place.
function GoogleMark() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.9c1.7-1.57 2.7-3.87 2.7-6.62Z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.9-2.26c-.8.54-1.84.86-3.06.86-2.35 0-4.34-1.59-5.05-3.72H.94v2.33A9 9 0 0 0 9 18Z"
      />
      <path
        fill="#FBBC05"
        d="M3.95 10.7A5.4 5.4 0 0 1 3.66 9c0-.59.1-1.17.29-1.7V4.97H.94A9 9 0 0 0 0 9c0 1.45.35 2.83.94 4.03l3.01-2.33Z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.32 0 2.51.46 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 0 0 .94 4.97l3.01 2.33C4.66 5.17 6.65 3.58 9 3.58Z"
      />
    </svg>
  );
}

export default function AuthPage() {
  const router = useRouter();
  const supabase = createClient();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [oauthBusy, setOauthBusy] = useState(false);

  async function signInWithGoogle() {
    setMessage(null);
    setOauthBusy(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) {
      setMessage(error.message);
      setOauthBusy(false);
    }
    // On success the browser navigates away to Google immediately, so there's no
    // "success" branch here to handle -- oauthBusy just stays true until that happens.
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    if (mode === "signup" && password !== confirmPassword) {
      setMessage("Passwords don't match.");
      return;
    }
    setBusy(true);
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
            Forage<span className="text-[#00e5ff]">.</span>
          </h1>
          <p className="text-[#7d99a3] mt-3 text-sm">
            Learn it from zero. Prove it with quizzes. Ship it for real.
          </p>
        </div>

        <Glass className="p-6">
          <div className="flex gap-2 mb-6 p-1 rounded-xl bg-white/[0.03]">
            {(["signin", "signup"] as const).map((m) => (
              <button
                key={m}
                onClick={() => {
                  setMode(m);
                  setMessage(null);
                  setConfirmPassword("");
                }}
                className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-colors ${
                  mode === m ? "bg-[#00e5ff] text-[#05070a]" : "text-[#7d99a3] hover:text-white"
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
              className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#00e5ff] transition-colors"
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
                className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 pr-11 text-sm outline-none focus:border-[#00e5ff] transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                aria-label={showPw ? "Hide password" : "Show password"}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7d99a3] hover:text-white"
              >
                {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {mode === "signup" && (
              <input
                type={showPw ? "text" : "password"}
                required
                minLength={6}
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm password"
                className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#00e5ff] transition-colors"
              />
            )}
            <button
              disabled={busy}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-[#00e5ff] to-[#3fb950] font-semibold text-[#05070a] disabled:opacity-50 flex items-center justify-center gap-2 transition-opacity"
            >
              {busy && <Loader2 size={18} className="animate-spin" />}
              {busy ? "Working..." : mode === "signin" ? "Sign in" : "Start learning free"}
            </button>
          </form>

          {message && (
            <p role="alert" className="mt-4 text-sm text-[#ffb020] flex items-start gap-2">
              <AlertTriangle size={16} className="mt-0.5 shrink-0" />
              <span>{message}</span>
            </p>
          )}

          <div className="flex items-center gap-3 my-4">
            <span className="h-px flex-1 bg-white/10" />
            <span className="text-xs text-[#7d99a3]">or</span>
            <span className="h-px flex-1 bg-white/10" />
          </div>

          <button
            type="button"
            onClick={signInWithGoogle}
            disabled={oauthBusy || busy}
            className="w-full py-3 rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.06] font-semibold text-sm flex items-center justify-center gap-2.5 transition-colors disabled:opacity-50"
          >
            {oauthBusy ? <Loader2 size={18} className="animate-spin" /> : <GoogleMark />}
            Continue with Google
          </button>
        </Glass>

        <p className="text-center text-xs text-[#7d99a3] mt-6">
          Free Common Core + 6 career paths — from absolute basics to hiring standard.
        </p>
      </FadeUp>
    </main>
  );
}
