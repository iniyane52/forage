"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { Sparkles, Loader2, XCircle } from "@/components/ui/icons";

type Msg = { role: "user" | "model"; text: string };

function buildLessonContext(concept: string, analogy?: string, handsOn?: string, doneWhen?: string) {
  return [
    `Concept: ${concept}`,
    analogy ? `Analogy: ${analogy}` : "",
    handsOn ? `Hands-on task: ${handsOn}` : "",
    doneWhen ? `Done when: ${doneWhen}` : "",
  ]
    .filter(Boolean)
    .join("\n");
}

export function TutorDrawer({
  lessonTitle,
  concept,
  analogy,
  handsOn,
  doneWhen,
}: {
  lessonTitle: string;
  concept: string;
  analogy?: string;
  handsOn?: string;
  doneWhen?: string;
}) {
  const supabase = createClient();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Msg[]>([]);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [unavailable, setUnavailable] = useState(false);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  function copyClaudePrompt() {
    const text = `I'm learning "${lessonTitle}" on Forage. I've read the lesson and tried the hands-on task but I'm stuck. Give me a hint, not the full answer -- ask what I've tried first, then nudge me one step.`;
    navigator.clipboard.writeText(text).catch(() => {});
    setNotice("Prompt copied -- paste it into Claude or your usual assistant.");
  }

  async function send() {
    const question = input.trim();
    if (!question || busy) return;
    setInput("");
    setNotice(null);
    const nextMessages: Msg[] = [...messages, { role: "user", text: question }];
    setMessages(nextMessages);
    setBusy(true);

    const {
      data: { session },
    } = await supabase.auth.getSession();

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/tutor`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.access_token ?? ""}`,
          },
          body: JSON.stringify({
            lessonTitle,
            lessonContext: buildLessonContext(concept, analogy, handsOn, doneWhen),
            question,
            history: messages.map((m) => ({ role: m.role, parts: [{ text: m.text }] })),
          }),
        }
      );
      const data = await res.json();
      if (!res.ok) {
        if (data.error === "not_configured") setUnavailable(true);
        setNotice(data.message ?? "The tutor hit an error. Try again in a moment.");
        setBusy(false);
        return;
      }
      setMessages((m) => [...m, { role: "model", text: data.reply }]);
    } catch {
      setNotice("Couldn't reach the tutor -- check your connection and try again.");
    }
    setBusy(false);
  }

  return (
    <>
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-40 flex items-center gap-2 px-4 py-3 rounded-full bg-gradient-to-r from-[#00e5ff] to-[#ff3d81] text-[#05070a] text-sm font-semibold shadow-lg shadow-[#00e5ff]/25 hover:scale-105 transition-transform"
        >
          <Sparkles size={16} /> Ask the Tutor
        </button>
      )}

      <AnimatePresence>
        {open && (
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Forage Tutor chat"
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.97 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="fixed bottom-6 right-6 z-50 w-[min(92vw,380px)] max-h-[70vh] flex flex-col glass rounded-2xl overflow-hidden"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.08]">
              <p className="text-sm font-bold flex items-center gap-1.5">
                <Sparkles size={15} className="text-[#ff3d81]" /> Forage Tutor
              </p>
              <button
                onClick={() => setOpen(false)}
                aria-label="Close tutor"
                className="text-[#7d99a3] hover:text-white"
              >
                <XCircle size={18} />
              </button>
            </div>
            <p className="text-[11px] text-[#7d99a3] px-4 pt-2">
              Grounded in <b>&ldquo;{lessonTitle}&rdquo;</b> -- hints first, never full quiz answers.
            </p>

            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2.5 min-h-[120px]">
              {messages.length === 0 && !unavailable && (
                <p className="text-xs text-[#7d99a3]">Stuck on something in this lesson? Ask away.</p>
              )}
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`text-sm rounded-xl px-3 py-2 max-w-[85%] ${
                    m.role === "user"
                      ? "ml-auto bg-[#00e5ff]/20 text-white"
                      : "bg-white/[0.05] text-[#ece9f5]"
                  }`}
                >
                  {m.text}
                </div>
              ))}
              {busy && (
                <div className="flex items-center gap-2 text-xs text-[#7d99a3]">
                  <Loader2 size={13} className="animate-spin" /> Thinking...
                </div>
              )}
            </div>

            {notice && (
              <p role="status" className="text-xs text-[#ffb020] px-4 pb-1">
                {notice}
              </p>
            )}

            {unavailable ? (
              <div className="p-4 border-t border-white/[0.08]">
                <p className="text-xs text-[#7d99a3] mb-2">
                  The live tutor isn&rsquo;t configured yet. Use Claude instead:
                </p>
                <button
                  onClick={copyClaudePrompt}
                  className="w-full px-3 py-2 rounded-xl glass glass-hover text-xs font-semibold"
                >
                  Copy a stuck-on-this-lesson prompt
                </button>
              </div>
            ) : (
              <div className="p-3 border-t border-white/[0.08] flex gap-2">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && send()}
                  placeholder="Ask about this lesson..."
                  className="flex-1 bg-black/30 border border-white/10 rounded-xl px-3 py-2 text-sm outline-none focus:border-[#00e5ff]"
                />
                <button
                  onClick={send}
                  disabled={busy || !input.trim()}
                  aria-label="Send message"
                  className="px-3 py-2 rounded-xl bg-[#00e5ff] text-[#05070a] text-sm font-semibold disabled:opacity-50"
                >
                  →
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
