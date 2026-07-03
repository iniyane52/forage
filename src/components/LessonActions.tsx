"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

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
    if (xp > 0) setReward(`+${xp} XP 🎉`);
    router.refresh();
  }

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={markDone}
        disabled={done || busy}
        className={`px-4 py-2 rounded-lg text-sm font-semibold ${
          done
            ? "bg-[#22303f] text-[#3fb950] cursor-default"
            : "bg-[#3fb950] text-[#04240f] hover:bg-[#35a344]"
        }`}
      >
        {done ? "✓ Completed" : busy ? "Saving..." : "Mark as done"}
      </button>
      {reward && <span className="text-sm text-[#3fb950] font-semibold">{reward}</span>}
      {!done && (
        <span className="text-xs text-[#9aa7b4]">
          Only when you did the hands-on AND can explain it.
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
      <div className="flex items-baseline justify-between">
        <p className="text-xs font-bold uppercase tracking-widest text-[#4c8dff] mb-2">
          Your notes
        </p>
        <span className="text-[10px] text-[#9aa7b4]">
          {saved === "saving" ? "saving..." : saved === "saved" ? "saved ✓" : ""}
        </span>
      </div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Write what you'd tell a friend about this topic..."
        className="w-full min-h-24 bg-[#0b0f14] border border-[#2a323d] rounded-lg p-3 text-sm outline-none focus:border-[#4c8dff] resize-y"
      />
    </div>
  );
}

export function CheckReveal({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-[#2a323d] rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full text-left px-4 py-2.5 bg-[#1c232d] text-sm hover:bg-[#22303f]"
      >
        <span className="text-[#59d3c5] font-bold mr-2">Q</span>
        {q}
      </button>
      {open && (
        <div className="px-4 py-2.5 text-sm text-[#9aa7b4] border-t border-[#2a323d]">
          <span className="text-[#3fb950] font-bold mr-2">A</span>
          {a}
        </div>
      )}
    </div>
  );
}
