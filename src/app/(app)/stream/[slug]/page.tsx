import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function StreamPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: stream } = await supabase.from("streams").select("*").eq("slug", slug).single();
  if (!stream) notFound();

  const [{ data: modules }, { data: progress }, { data: results }] = await Promise.all([
    supabase
      .from("modules")
      .select("id, slug, title, why, sort, lessons(id, slug, title, sort)")
      .eq("stream_id", stream.id)
      .order("sort"),
    supabase.from("lesson_progress").select("lesson_id, status").eq("user_id", user!.id),
    supabase.from("quiz_results").select("lesson_id, passed, best_score").eq("user_id", user!.id),
  ]);

  const done = new Set((progress ?? []).filter((p) => p.status === "done").map((p) => p.lesson_id));
  const quizPassed = new Map((results ?? []).map((r) => [r.lesson_id, r]));

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs text-[#9aa7b4]">
          <Link href="/dashboard" className="hover:text-white">Dashboard</Link> / {stream.title}
        </p>
        <h1 className="text-2xl font-bold mt-1">
          {stream.icon} {stream.title}
        </h1>
        <p className="text-sm text-[#9aa7b4] mt-1">{stream.tagline}</p>
      </div>

      {(modules ?? []).map((m) => {
        const lessons = (m.lessons as { id: string; slug: string; title: string; sort: number }[])
          .slice()
          .sort((a, b) => a.sort - b.sort);
        const doneCount = lessons.filter((l) => done.has(l.id)).length;
        const pct = lessons.length ? Math.round((doneCount / lessons.length) * 100) : 0;
        return (
          <section key={m.id} className="rounded-2xl border border-[#2a323d] bg-[#161b22] p-5">
            <div className="flex items-baseline justify-between gap-3 flex-wrap">
              <h2 className="text-lg font-bold">{m.title}</h2>
              <span className="text-xs text-[#9aa7b4]">
                {doneCount}/{lessons.length} done
              </span>
            </div>
            <div className="h-1.5 mt-2 rounded-full bg-[#1c232d] overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#4c8dff] to-[#3fb950]"
                style={{ width: `${pct}%` }}
              />
            </div>
            <p className="text-xs text-[#9aa7b4] mt-2">{m.why}</p>
            <ul className="mt-4 divide-y divide-[#2a323d]">
              {lessons.map((l, i) => {
                const r = quizPassed.get(l.id);
                return (
                  <li key={l.id}>
                    <Link
                      href={`/learn/${l.slug}`}
                      className="flex items-center gap-3 py-2.5 group"
                    >
                      <span
                        className={`w-5 h-5 rounded-full border flex items-center justify-center text-[10px] shrink-0 ${
                          done.has(l.id)
                            ? "bg-[#3fb950] border-[#3fb950] text-[#04240f] font-bold"
                            : "border-[#2a323d] text-[#9aa7b4]"
                        }`}
                      >
                        {done.has(l.id) ? "✓" : i + 1}
                      </span>
                      <span className="text-sm group-hover:text-white flex-1">{l.title}</span>
                      {r?.passed && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#22303f] text-[#3fb950] font-semibold">
                          quiz {r.best_score}%
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
