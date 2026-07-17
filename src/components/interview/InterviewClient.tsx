"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { useVoice } from "@/hooks/useVoice";
import { VoiceOrb, type OrbState } from "@/components/interview/VoiceOrb";
import {
  Mic,
  MicOff,
  Send,
  Sparkles,
  Trophy,
  CheckCircle2,
  XCircle,
  Lightbulb,
  Loader2,
  Shuffle,
} from "@/components/ui/icons";
import { AnimatedBar } from "@/components/ui/motion";

type Focus = "behavioral" | "technical" | "dsa";
type Turn = { role: "user" | "model"; parts: [{ text: string }] };
type Score = { category: string; score: number; note: string };
type Feedback = { strengths: string[]; gaps: string[]; model_answer: string; scores?: Score[] };

const FOCUS_OPTIONS: { value: Focus; label: string; blurb: string }[] = [
  { value: "behavioral", label: "Behavioral", blurb: "STAR-style stories, communication, teamwork" },
  { value: "technical", label: "Technical", blurb: "Role fundamentals, practical screening questions" },
  { value: "dsa", label: "DSA", blurb: "Data structures & algorithms, reasoning out loud" },
];

// Free trial keeps role choice simple/generic — the full 6 specialized career paths are a Pro
// perk, matching the free-vs-Pro content split established everywhere else in the product.
const TRIAL_ROLES = ["Software Engineer (General)", "Behavioral / Career Readiness"];

function fmtClock(sec: number) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function InterviewClient({
  roles,
  defaultRole,
  isPro,
}: {
  roles: string[];
  defaultRole: string;
  isPro: boolean;
}) {
  const supabase = createClient();
  const voice = useVoice();

  const displayRoles = isPro ? roles : TRIAL_ROLES;

  const [phase, setPhase] = useState<"setup" | "live" | "feedback">("setup");
  const [role, setRole] = useState(isPro ? defaultRole : TRIAL_ROLES[0]);
  const [focus, setFocus] = useState<Focus>("behavioral");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [noticeKind, setNoticeKind] = useState<"info" | "error">("info");

  const [sessionId, setSessionId] = useState<string | null>(null);
  const [maxMinutes, setMaxMinutes] = useState(3);
  const [isTrial, setIsTrial] = useState(false);
  const [history, setHistory] = useState<Turn[]>([]);
  const [question, setQuestion] = useState("");
  const [answerDraft, setAnswerDraft] = useState("");
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const endingRef = useRef(false);
  const tokenRef = useRef<string | null>(null);
  const liveRef = useRef({ phase, sessionId, role, focus, history });
  liveRef.current = { phase, sessionId, role, focus, history };

  // Keep a fresh access token cached — the unload handler below can't reliably await an async
  // getSession() call once the page is actually closing.
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      tokenRef.current = data.session?.access_token ?? null;
    });
  }, [supabase]);

  // Best-effort cleanup: if the tab is hidden/closed mid-interview, try to end the session so it
  // doesn't sit open forever with no ended_at/feedback. Uses fetch+keepalive (not sendBeacon,
  // which can't carry the Authorization header this edge function requires). This is genuinely
  // best-effort, not a guarantee — no server-side sweep exists for sessions this still misses.
  useEffect(() => {
    let hideTimer: ReturnType<typeof setTimeout> | null = null;
    function endOnHide() {
      hideTimer = null;
      const { phase: p, sessionId: sid, role: r, focus: f, history: h } = liveRef.current;
      if (p !== "live" || !sid || endingRef.current || !tokenRef.current) return;
      endingRef.current = true;
      try {
        fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/interview`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${tokenRef.current}` },
          body: JSON.stringify({ action: "turn", sessionId: sid, role: r, focus: f, history: h, end: true }),
          keepalive: true,
        }).catch(() => {});
      } catch {
        // Swallow -- nothing more we can do once the page is unloading.
      }
    }
    function onVisibility() {
      if (document.visibilityState === "hidden") {
        // Grace period before treating a hidden tab as abandoned -- a plain tab switch
        // (checking notes, alt-tabbing) shouldn't instantly kill a live interview session.
        if (!hideTimer) hideTimer = setTimeout(endOnHide, 45000);
      } else if (hideTimer) {
        clearTimeout(hideTimer);
        hideTimer = null;
      }
    }
    document.addEventListener("visibilitychange", onVisibility);
    // Actual navigation-away/close is a stronger signal than a mere tab switch -- end immediately.
    window.addEventListener("pagehide", endOnHide);
    return () => {
      if (hideTimer) clearTimeout(hideTimer);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pagehide", endOnHide);
    };
  }, []);

  const [lastVoiceError, setLastVoiceError] = useState<string | null>(null);
  if (voice.error && voice.error !== lastVoiceError) {
    setLastVoiceError(voice.error);
    setNoticeKind("error");
    setNotice(voice.error);
  }

  useEffect(() => {
    if (phase !== "live" || secondsLeft <= 0) return;
    const t = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [phase, secondsLeft]);

  useEffect(() => {
    if (phase === "live" && secondsLeft === 0 && !endingRef.current) {
      endSession();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [secondsLeft, phase]);

  async function callEdge(body: Record<string, unknown>) {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const res = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/interview`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token ?? ""}`,
        },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      return { ok: res.ok, status: res.status, data };
    } catch {
      return {
        ok: false,
        status: 0,
        data: { message: "Network error — check your connection and try again." },
      };
    }
  }

  async function start(overrideRole?: string, overrideFocus?: Focus) {
    const useRole = overrideRole ?? role;
    const useFocus = overrideFocus ?? focus;
    setBusy(true);
    setNotice(null);
    const { ok, status, data } = await callEdge({ action: "start", role: useRole, focus: useFocus });
    setBusy(false);
    if (!ok) {
      setNoticeKind("error");
      setNotice(
        data.message ??
          (status === 503
            ? "Forage Interview isn't set up yet — check back soon."
            : "Couldn't start the interview. Try again.")
      );
      return;
    }
    setRole(useRole);
    setFocus(useFocus);
    setSessionId(data.sessionId);
    setIsTrial(!!data.isTrial);
    setMaxMinutes(data.maxMinutes ?? 3);
    setSecondsLeft((data.maxMinutes ?? 3) * 60);
    setQuestion(data.question);
    setHistory([{ role: "model", parts: [{ text: data.question }] }]);
    setPhase("live");
    voice.speak(data.question);
  }

  /** Pro-only: randomly picks a role + focus and starts immediately, skipping manual selection. */
  function startRandom() {
    const r = roles[Math.floor(Math.random() * roles.length)];
    const f = FOCUS_OPTIONS[Math.floor(Math.random() * FOCUS_OPTIONS.length)].value;
    start(r, f);
  }

  async function sendAnswer() {
    const answer = answerDraft.trim();
    if (!answer || busy || !sessionId) return;
    voice.cancelSpeech();
    setBusy(true);
    setAnswerDraft("");
    const { ok, data } = await callEdge({
      action: "turn",
      sessionId,
      role,
      focus,
      history,
      answer,
    });
    setBusy(false);
    if (!ok) {
      setNoticeKind("error");
      setNotice(data.message ?? "The interviewer hit an error — try again.");
      return;
    }
    // The server enforces the real time limit — a "turn" can come back already ended
    // (data.feedback present) if the stored max_minutes elapsed since this request went out,
    // regardless of what the client's own countdown was showing.
    if (data.forcedTimeUp || data.feedback) {
      endingRef.current = true;
      voice.cancelSpeech();
      voice.stop();
      setFeedback(data.feedback ?? null);
      setPhase("feedback");
      return;
    }
    setHistory((h) => [
      ...h,
      { role: "user", parts: [{ text: answer }] },
      { role: "model", parts: [{ text: data.question }] },
    ]);
    setQuestion(data.question);
    voice.speak(data.question);
  }

  async function endSession() {
    if (!sessionId || endingRef.current) return;
    endingRef.current = true;
    voice.cancelSpeech();
    voice.stop();
    setBusy(true);
    // Carry along whatever the candidate had typed but not yet submitted -- ending the
    // session used to silently discard an in-progress draft with no warning.
    const draft = answerDraft.trim();
    const { ok, data } = await callEdge({
      action: "turn",
      sessionId,
      role,
      focus,
      history,
      end: true,
      ...(draft ? { answer: draft } : {}),
    });
    setBusy(false);
    setAnswerDraft("");
    if (ok) setFeedback(data.feedback);
    setPhase("feedback");
  }

  function toggleMic() {
    if (voice.listening) {
      voice.stop();
      if (voice.transcript) setAnswerDraft(voice.transcript);
    } else {
      voice.start((finalText) => setAnswerDraft((d) => (d ? d + " " + finalText : finalText)));
    }
  }

  const orbState: OrbState = voice.speaking
    ? "speaking"
    : voice.listening
    ? "listening"
    : busy
    ? "thinking"
    : "idle";

  if (phase === "feedback") {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-xl mx-auto text-center py-6"
      >
        <Trophy size={40} className="mx-auto text-[#ffb020] mb-3" />
        <h2 className="text-2xl font-bold" style={{ fontFamily: "var(--font-display)" }}>
          Session complete
        </h2>
        <p className="text-sm text-[#7d99a3] mt-1">Here&rsquo;s how it went.</p>

        {feedback ? (
          <div className="mt-6 space-y-4 text-left">
            {feedback.scores && feedback.scores.length > 0 && (
              <div className="glass rounded-2xl p-4">
                <p className="text-xs font-bold uppercase tracking-widest text-[#00e5ff] mb-3 flex items-center gap-1.5">
                  <Sparkles size={14} /> Competency scores
                </p>
                <div className="space-y-3">
                  {feedback.scores.map((s, i) => (
                    <div key={i}>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-semibold">{s.category}</span>
                        <span className="text-[#7d99a3]">{s.score}/5</span>
                      </div>
                      <AnimatedBar pct={(s.score / 5) * 100} className="h-1.5" />
                      <p className="text-xs text-[#7d99a3] mt-1">{s.note}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {feedback.strengths?.length > 0 && (
              <div className="glass rounded-2xl p-4">
                <p className="text-xs font-bold uppercase tracking-widest text-[#3fb950] mb-2 flex items-center gap-1.5">
                  <CheckCircle2 size={14} /> Strengths
                </p>
                <ul className="space-y-1.5 text-sm">
                  {feedback.strengths.map((s, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle2 size={14} className="text-[#3fb950] mt-1 shrink-0" />
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {feedback.gaps?.length > 0 && (
              <div className="glass rounded-2xl p-4">
                <p className="text-xs font-bold uppercase tracking-widest text-[#ffb020] mb-2 flex items-center gap-1.5">
                  <XCircle size={14} /> Gaps to work on
                </p>
                <ul className="space-y-1.5 text-sm">
                  {feedback.gaps.map((g, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <XCircle size={14} className="text-[#ffb020] mt-1 shrink-0" />
                      <span>{g}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {feedback.model_answer && (
              <div className="glass rounded-2xl p-4">
                <p className="text-xs font-bold uppercase tracking-widest text-[#5ba3ff] mb-2 flex items-center gap-1.5">
                  <Lightbulb size={14} /> A stronger answer
                </p>
                <p className="text-sm text-[#c9d4de] whitespace-pre-wrap">{feedback.model_answer}</p>
              </div>
            )}
          </div>
        ) : (
          <p className="text-sm text-[#7d99a3] mt-6">No feedback was generated for this session.</p>
        )}

        <div className="flex gap-3 justify-center mt-8">
          <button
            onClick={() => {
              setPhase("setup");
              setFeedback(null);
              setHistory([]);
              setSessionId(null);
              endingRef.current = false;
            }}
            className="px-4 py-2 rounded-xl glass glass-hover text-sm"
          >
            New session
          </button>
          <Link
            href="/dashboard"
            className="px-4 py-2 rounded-xl bg-[#3d8fff] text-white text-sm font-semibold hover:bg-[#5ba3ff] transition-colors"
          >
            Back to dashboard
          </Link>
        </div>
      </motion.div>
    );
  }

  if (phase === "live") {
    return (
      <div className="max-w-xl mx-auto">
        <div className="flex items-center justify-between text-xs text-[#7d99a3] mb-4">
          <span>
            {role} · {focus}
            {isTrial && <span className="ml-2 text-[#ffb020]">Free trial</span>}
          </span>
          <span className={secondsLeft <= 30 ? "text-[#f85149] font-semibold" : ""}>
            {fmtClock(secondsLeft)}
          </span>
        </div>

        <VoiceOrb state={orbState} />

        <AnimatePresence mode="wait">
          <motion.p
            key={question}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center text-[15px] leading-relaxed mt-5 glass rounded-2xl px-5 py-4"
          >
            {question}
          </motion.p>
        </AnimatePresence>

        {notice && (
          <p
            role="alert"
            className={`text-xs mt-3 text-center ${noticeKind === "error" ? "text-[#f85149]" : "text-[#ffb020]"}`}
          >
            {notice}
          </p>
        )}

        <div className="mt-5 space-y-2.5">
          <textarea
            value={answerDraft}
            onChange={(e) => setAnswerDraft(e.target.value)}
            placeholder={voice.listening ? "Listening…" : "Type or speak your answer…"}
            rows={3}
            className="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#3d8fff] resize-none"
          />
          <div className="flex gap-2">
            {voice.supported && (
              <button
                onClick={toggleMic}
                className={`px-3 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-1.5 transition-colors ${
                  voice.listening
                    ? "bg-[#f85149]/20 text-[#f85149]"
                    : "glass glass-hover"
                }`}
              >
                {voice.listening ? <MicOff size={16} /> : <Mic size={16} />}
                {voice.listening ? "Stop" : "Speak"}
              </button>
            )}
            <button
              onClick={sendAnswer}
              disabled={busy || !answerDraft.trim()}
              className="flex-1 px-4 py-2.5 rounded-xl bg-[#3d8fff] text-white text-sm font-semibold disabled:opacity-50 flex items-center justify-center gap-1.5 hover:bg-[#5ba3ff] transition-colors"
            >
              {busy ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
              Answer
            </button>
          </div>
          <button
            onClick={endSession}
            disabled={busy}
            className="w-full text-center text-xs text-[#7d99a3] hover:text-white transition-colors py-1"
          >
            End interview & get feedback
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-1" style={{ fontFamily: "var(--font-display)" }}>
        Forage Interview
      </h1>
      <p className="text-sm text-[#7d99a3] mb-6">
        A live mock interview, voice-first. Pick a role and a focus to begin.
      </p>

      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-bold uppercase tracking-widest text-[#7d99a3]">Target role</p>
        {isPro && (
          <button
            onClick={startRandom}
            disabled={busy}
            className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#00e5ff] hover:text-[#6ff9ff] transition-colors disabled:opacity-50"
          >
            <Shuffle size={12} /> Surprise me
          </button>
        )}
      </div>
      {!isPro && (
        <p className="text-xs text-[#7d99a3] -mt-1 mb-2">
          Free trial keeps it general —{" "}
          <Link href="/pricing" className="text-[#ff3d81] hover:text-[#ff6ba0]">
            upgrade to Pro
          </Link>{" "}
          to interview for a specific career path.
        </p>
      )}
      <div className="grid grid-cols-2 gap-2 mb-5">
        {displayRoles.map((r) => (
          <button
            key={r}
            onClick={() => setRole(r)}
            className={`px-3 py-2.5 rounded-xl text-sm text-left border transition-colors ${
              role === r
                ? "border-[#3d8fff] bg-[#3d8fff]/10 text-white"
                : "border-white/[0.08] bg-white/[0.03] text-[#7d99a3] hover:border-white/20"
            }`}
          >
            {r}
          </button>
        ))}
      </div>

      <p className="text-xs font-bold uppercase tracking-widest text-[#7d99a3] mb-2">Focus</p>
      <div className="space-y-2 mb-6">
        {FOCUS_OPTIONS.map((f) => (
          <button
            key={f.value}
            onClick={() => setFocus(f.value)}
            className={`w-full px-4 py-3 rounded-xl border text-left transition-colors ${
              focus === f.value
                ? "border-[#3d8fff] bg-[#3d8fff]/10"
                : "border-white/[0.08] bg-white/[0.03] hover:border-white/20"
            }`}
          >
            <p className="text-sm font-semibold">{f.label}</p>
            <p className="text-xs text-[#7d99a3]">{f.blurb}</p>
          </button>
        ))}
      </div>

      {notice && (
        <div
          role="alert"
          className={`text-sm rounded-xl px-4 py-3 mb-4 ${
            noticeKind === "error"
              ? "border border-[#f85149]/40 bg-[#f85149]/10 text-[#f85149]"
              : "border border-[#ffb020]/40 bg-[#ffb020]/10 text-[#ffb020]"
          }`}
        >
          {notice}
        </div>
      )}

      <button
        onClick={() => start()}
        disabled={busy}
        className="w-full px-4 py-3 rounded-xl bg-gradient-to-r from-[#3d8fff] to-[#5ba3ff] text-white text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-60"
      >
        {busy ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
        Start interview
      </button>
      {!voice.supported && (
        <p className="text-[11px] text-center text-[#7d99a3] mt-2">
          Voice isn&rsquo;t supported in this browser — you can still type your answers.
        </p>
      )}
    </div>
  );
}
