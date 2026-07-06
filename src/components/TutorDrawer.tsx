"use client";

import { useState } from "react";
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
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 px-4 py-3 rounded-full bg-gradient-to-r from-[#7c5cff] to-[#c86bff] text-white text-sm font-semibold shadow-lg shadow-[#7c5cff]/25 hover:scale-105 transition-transform"
      >
        <Sparkles size={16} /> Ask the Tutor
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.97 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="fixed bottom-6 right-6 z-50 w-[min(92vw,380px)] max-h-[70vh] flex flex-col glass rounded-2xl overflow-hidden"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.08]">
              <p className="text-sm font-bold flex items-center gap-1.5">
                <Sparkles size={15} className="text-[#c86bff]" /> Forage Tutor
              </p>
              <button onClick={() => setOpen(false)} className="text-[#a79fc0] hover:text-white">
                <XCircle size={18} />
              </button>
            </div>
            <p className="text-[11px] text-[#a79fc0] px-4 pt-2">
              Grounded in <b>&ldquo;{lessonTitle}&rdquo;</b> -- hints first, never full quiz answers.
            </p>

            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2.5 min-h-[120px]">
              {messages.length === 0 && !unavailable && (
                <p className="text-xs text-[#a79fc0]">Stuck on something in this lesson? Ask away.</p>
              )}
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`text-sm rounded-xl px-3 py-2 max-w-[85%] ${
                    m.role === "user"
                      ? "ml-auto bg-[#7c5cff]/20 text-white"
                      : "bg-white/[0.05] text-[#ece9f5]"
                  }`}
                >
                  {m.text}
                </div>
              ))}
              {busy && (
                <div className="flex items-center gap-2 text-xs text-[#a79fc0]">
                  <Loader2 size={13} className="animate-spin" /> Thinking...
                </div>
              )}
            </div>

            {notice && <p className="text-xs text-[#e3a008] px-4 pb-1">{notice}</p>}

            {unavailable ? (
              <div className="p-4 border-t border-white/[0.08]">
                <p className="text-xs text-[#a79fc0] mb-2">
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
                  className="flex-1 bg-black/30 border border-white/10 rounded-xl px-3 py-2 text-sm outline-none focus:border-[#7c5cff]"
                />
                <button
                  onClick={send}
                  disabled={busy || !input.trim()}
                  className="px-3 py-2 rounded-xl bg-[#7c5cff] text-white text-sm font-semibold disabled:opacity-50"
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
