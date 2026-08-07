"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { MessageSquare, Send } from "@/components/ui/icons";
import { useMounted } from "@/hooks/useMounted";

type Comment = {
  id: string;
  user_id: string;
  body: string;
  created_at: string;
};

const BODY_MAX = 2000;

function timeAgo(iso: string) {
  const ms = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(ms / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

/**
 * Flat (no threading, v1) per-lesson comments. Client-fetched rather than passed
 * down from the server component: `lesson_comments.user_id` FKs straight to
 * `auth.users` (same shape as every other user-content table in this schema, not
 * `profiles`), so display names need a second batched `profiles` lookup by
 * `user_id` -- simpler to do both queries here, on mount and after posting, than to
 * thread that two-step join through the server page.
 *
 * Posting goes through `post_lesson_comment` (a SECURITY DEFINER RPC), never a
 * direct table insert -- that's where the rate limit is enforced atomically, same
 * reasoning as `mark_lesson_done`/`save_note` in LessonActions.tsx.
 */
export function DiscussSection({ lessonId, accent }: { lessonId: string; accent: string }) {
  const mounted = useMounted();
  const supabase = useRef(createClient()).current;
  const [userId, setUserId] = useState<string | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [names, setNames] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [body, setBody] = useState("");
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    const { data: comm } = await supabase
      .from("lesson_comments")
      .select("id, user_id, body, created_at")
      .eq("lesson_id", lessonId)
      .order("created_at", { ascending: true });
    const list = comm ?? [];
    setComments(list);

    const ids = Array.from(new Set(list.map((c) => c.user_id)));
    if (ids.length) {
      const { data: profiles } = await supabase.from("profiles").select("user_id, username").in("user_id", ids);
      const map: Record<string, string> = {};
      for (const p of profiles ?? []) {
        if (p.username) map[p.user_id] = p.username;
      }
      setNames(map);
    }
    setLoading(false);
  }

  useEffect(() => {
    if (!mounted) return;
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id ?? null));
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted, lessonId]);

  async function submit() {
    const trimmed = body.trim();
    if (!trimmed || posting) return;
    setPosting(true);
    setError(null);
    const { data, error: rpcError } = await supabase.rpc("post_lesson_comment", {
      p_lesson_id: lessonId,
      p_body: trimmed,
    });
    setPosting(false);
    if (rpcError) {
      setError(rpcError.message);
      return;
    }
    const result = data as { allowed: boolean; limit?: number };
    if (!result.allowed) {
      setError(`You've hit today's comment limit (${result.limit}). Try again tomorrow.`);
      return;
    }
    setBody("");
    load();
  }

  return (
    <div>
      {loading ? (
        <p className="text-sm text-[var(--color-text-secondary)]">Loading discussion…</p>
      ) : comments.length === 0 ? (
        <p className="text-sm text-[var(--color-text-secondary)] flex items-center gap-1.5">
          <MessageSquare size={14} /> No questions yet — be the first to ask.
        </p>
      ) : (
        <ul className="space-y-3 mb-4">
          {comments.map((c) => (
            <li key={c.id} className="glass rounded-xl px-4 py-3">
              <p className="flex items-center gap-2 text-xs text-[var(--color-text-secondary)] mb-1">
                <span
                  className="font-semibold"
                  style={{ color: c.user_id === userId ? accent : "var(--color-text)" }}
                >
                  {c.user_id === userId ? "You" : (names[c.user_id] ?? "A Forage learner")}
                </span>
                <span>{timeAgo(c.created_at)}</span>
              </p>
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{c.body}</p>
            </li>
          ))}
        </ul>
      )}

      {mounted && userId ? (
        <div>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value.slice(0, BODY_MAX))}
            placeholder="Ask a question or share something that helped this click for you…"
            rows={3}
            className="w-full rounded-xl bg-[rgb(var(--surface-rgb)/0.03)] border border-[var(--color-border)] px-3.5 py-2.5 text-sm resize-none focus:outline-none focus:border-[var(--color-primary)]"
          />
          <div className="flex items-center justify-between mt-1.5">
            <span className="text-[11px] text-[var(--color-text-secondary)]">{body.length}/{BODY_MAX}</span>
            <button
              onClick={submit}
              disabled={!body.trim() || posting}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
              style={{ backgroundColor: accent, color: "var(--color-on-primary)" }}
            >
              <Send size={14} /> {posting ? "Posting…" : "Post"}
            </button>
          </div>
          {error && <p className="text-xs text-[var(--color-danger)] mt-1.5">{error}</p>}
        </div>
      ) : mounted ? (
        <p className="text-sm text-[var(--color-text-secondary)]">
          <Link href="/auth" className="underline hover:text-[var(--color-text)] transition-colors">
            Sign in
          </Link>{" "}
          to join the discussion.
        </p>
      ) : null}
    </div>
  );
}
