"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function AuthPage() {
  const router = useRouter();
  const supabase = createClient();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold tracking-tight">
            Foundary<span className="text-[#4c8dff]">.</span>
          </h1>
          <p className="text-[#9aa7b4] mt-2 text-sm">
            Learn it from zero. Prove it with quizzes. Ship it for real.
          </p>
        </div>

        <div className="bg-[#161b22] border border-[#2a323d] rounded-2xl p-6">
          <div className="flex gap-2 mb-6">
            {(["signin", "signup"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-colors ${
                  mode === m
                    ? "bg-[#4c8dff] text-white"
                    : "bg-[#1c232d] text-[#9aa7b4] hover:text-white"
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
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full bg-[#0b0f14] border border-[#2a323d] rounded-lg px-4 py-2.5 text-sm outline-none focus:border-[#4c8dff]"
            />
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password (6+ characters)"
              className="w-full bg-[#0b0f14] border border-[#2a323d] rounded-lg px-4 py-2.5 text-sm outline-none focus:border-[#4c8dff]"
            />
            <button
              disabled={busy}
              className="w-full py-2.5 rounded-lg bg-gradient-to-r from-[#4c8dff] to-[#3fb950] font-semibold text-white disabled:opacity-50"
            >
              {busy ? "Working..." : mode === "signin" ? "Sign in" : "Start learning free"}
            </button>
          </form>

          {message && (
            <p className="mt-4 text-sm text-center text-[#e3a008]">{message}</p>
          )}
        </div>

        <p className="text-center text-xs text-[#9aa7b4] mt-6">
          Free forever. Four streams, from absolute basics to hiring standard.
        </p>
      </div>
    </main>
  );
}
