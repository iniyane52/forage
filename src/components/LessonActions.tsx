"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { CheckCircle2, HelpCircle } from "@/components/ui/icons";

export function MarkDoneButton({
  lessonId,
  initiallyDone,
}: {
  lessonId: string;
  initiallyDone: boolean;
}) {
  const router = useRouter();
  const supabase = createClient();
  const [done, setDone] = useState(initiallyDone);
  const [busy, setBusy] = useState(false);
  const [reward, setReward] = useState<string | null>(null);

  async function markDone() {
    setBusy(true);
    const { data, error } = await supabase.rpc("mark_lesson_done", { p_lesson_id: lessonId });
    setBusy(false);
    if (error) return setReward(error.message);
    setDone(true);
    const xp = (data as { xp_awarded?: number })?.xp_awarded ?? 0;
    if (xp > 0) setReward(`+${xp} XP`);
    router.refresh();
  }

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={markDone}
        disabled={done || busy}
        className={`px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-1.5 transition-colors ${
          done
            ? "bg-[#3fb950]/15 text-[#3fb950] cursor-default"
            : "bg-[#3fb950] text-[#04240f] hover:bg-[#35a344]"
        }`}
      >
        {done && <CheckCircle2 size={16} />}
        {done ? "Completed" : busy ? "Saving..." : "Mark as done"}
      </button>
      <AnimatePresence>
        {reward && (
          <motion.span
            initial={{ opacity: 0, scale: 0.8, y: 6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="text-sm text-[#3fb950] font-bold"
          >
            {reward}
          </motion.span>
        )}
      </AnimatePresence>
      {!done && (
        <span className="text-xs text-[#9aa7b4] hidden sm:inline">
          Only when you did the task AND can explain it.
        </span>
      )}
    </div>
  );
}

export function NotesBox({ lessonId, initial }: { lessonId: string; initial: string }) {
  const supabase = createClient();
  const [value, setValue] = useState(initial);
  const [saved, setSaved] = useState<"idle" | "saving" | "saved">("idle");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  function onChange(v: string) {
    setValue(v);
    setSaved("saving");
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      await supabase.rpc("save_note", { p_lesson_id: lessonId, p_notes: v });
      setSaved("saved");
    }, 800);
  }

  return (
    <div>
      <div className="flex items-center justify-end -mt-6 mb-1">
        <span className="text-[10px] text-[#9aa7b4]">
          {saved === "saving" ? "saving..." : saved === "saved" ? "saved ✓" : ""}
        </span>
      </div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Write what you'd tell a friend about this topic..."
        className="w-full min-h-24 bg-black/30 border border-white/10 rounded-xl p-3 text-sm outline-none focus:border-[#4c8dff] resize-y transition-colors"
      />
    </div>
  );
}

export function CheckReveal({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="glass rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full text-left px-4 py-2.5 text-sm hover:bg-white/[0.03] flex items-start gap-2 transition-colors"
      >
        <HelpCircle size={16} className="text-[#59d3c5] mt-0.5 shrink-0" />
        <span className="flex-1">{q}</span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <p className="px-4 py-2.5 text-sm text-[#9aa7b4] border-t border-white/[0.06]">
              <span className="text-[#3fb950] font-bold mr-1">A</span>
              {a}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
