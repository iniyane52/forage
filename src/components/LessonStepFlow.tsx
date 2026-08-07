import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import type { Topic, ContentModule, FlatLesson } from "@/lib/content";
import { MarkDoneButton, NotesBox, CheckReveal } from "@/components/LessonActions";
import { ReadingProgressBar } from "@/components/ui/ReadingProgressBar";
import { StepNav } from "@/components/StepNav";
import { DiscussSection } from "@/components/DiscussSection";
import { HandsOnChecklist } from "@/components/HandsOnChecklist";
import { LessonSectionLabel } from "@/components/LessonSectionLabel";
import { FadeUp } from "@/components/ui/motion";
import {
  BookOpen,
  Lightbulb,
  Code2,
  XCircle,
  AlertTriangle,
  Target,
  Compass,
  HelpCircle,
  PenLine,
  ArrowLeft,
  ArrowRight,
  ExternalLink,
  BookMarked,
  Clock,
  MessageSquare,
  CheckCircle2,
  resourceIcon,
} from "@/components/ui/icons";

/** Real section headings for the Learn stage -- one consistent accent (the lesson's
 * own path color) instead of a different hardcoded hue per subsection, and actual
 * heading weight/size instead of a tiny uppercase label. Text stays high-contrast
 * default (not accent-colored) so it never trades readability for color-coding --
 * the accent shows up in the icon only. */
function LearnHeading({ icon: Icon, children }: { icon: LucideIcon; children: React.ReactNode }) {
  return (
    <h3 className="display text-lg sm:text-xl font-bold mb-2.5 flex items-center gap-2">
      <Icon size={19} className="shrink-0" style={{ color: "var(--lesson-accent)" }} /> {children}
    </h3>
  );
}

/** Each Learn subsection (Concept/Analogy/Worked example/Common mistakes) lives in
 * one of these -- same glass-card vocabulary as PathTile/ToolkitBento (border +
 * faint fill + rounded-2xl), a real card holder rather than a bare paragraph run. */
function LearnCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-6 rounded-2xl border border-[var(--color-border)] bg-[rgb(var(--surface-rgb)/0.02)] p-5 sm:p-6">
      {children}
    </div>
  );
}

function StageHeader({
  n,
  title,
  icon: Icon,
  id,
}: {
  n: string;
  title: string;
  icon: LucideIcon;
  id: string;
}) {
  return (
    <div id={id} className="flex items-center gap-3 mb-5 scroll-mt-24">
      <span
        className="inline-flex w-9 h-9 rounded-xl items-center justify-center font-mono font-bold text-sm shrink-0"
        style={{
          backgroundColor: "color-mix(in srgb, var(--lesson-accent) 10%, transparent)",
          color: "var(--lesson-accent)",
          border: "1.5px solid color-mix(in srgb, var(--lesson-accent) 33%, transparent)",
        }}
      >
        {n}
      </span>
      <h2 className="display text-xl sm:text-2xl flex items-center gap-2">
        <Icon size={20} style={{ color: "var(--lesson-accent)" }} /> {title}
      </h2>
    </div>
  );
}

export type LessonLayoutProps = {
  slug: string;
  topic: Topic;
  mod: ContentModule;
  stream: { slug: string; title: string; access_tier: string } | undefined;
  accent: string;
  readingMinutes: number;
  highlightedExamples: string[];
  lessonId: string;
  progress: { status?: string | null; notes?: string | null } | null;
  questionCount: number;
  prev?: FlatLesson;
  next?: FlatLesson;
};

/**
 * Learn -> Discuss -> Practice -> Confirm -> Test -- the lesson layout for every
 * stream (originally piloted on Common Core only; rolled out everywhere once proven).
 */
export function LessonStepFlow({
  slug,
  topic,
  mod,
  stream,
  readingMinutes,
  highlightedExamples,
  lessonId,
  progress,
  questionCount,
  prev,
  next,
}: LessonLayoutProps) {
  return (
    <>
      <ReadingProgressBar accent="var(--lesson-accent)" />
      <StepNav accent="var(--lesson-accent)" />
      <article className="max-w-2xl mx-auto">
        <p className="text-xs text-[var(--color-text-secondary)]">
          <Link href="/dashboard" className="hover:text-[var(--color-text)] transition-colors">
            Dashboard
          </Link>{" "}
          /{" "}
          <Link
            href={`/stream/${stream?.slug ?? "common-core"}`}
            className="hover:opacity-80 transition-opacity font-medium"
            style={{ color: "var(--lesson-accent)" }}
          >
            {stream?.title ?? mod.title}
          </Link>
        </p>
        <div className="flex gap-3 mt-3 mb-1">
          <span className="w-1 rounded-full shrink-0" style={{ backgroundColor: "var(--lesson-accent)" }} />
          <h1 className="display text-3xl sm:text-4xl md:text-5xl">{topic.title}</h1>
        </div>
        <p className="flex items-center gap-1.5 text-xs text-[var(--color-text-secondary)] mb-1">
          <Clock size={13} /> {readingMinutes} min read
        </p>

        {/* ---- Stage 1: Learn ---- */}
        <section className="mt-10">
          <StageHeader n="01" title="Learn" icon={BookOpen} id="learn" />

          <FadeUp>
            <LearnCard>
              <LearnHeading icon={BookOpen}>
                What it is
              </LearnHeading>
              <p style={{ fontSize: "1.15rem", lineHeight: 1.65, color: "var(--color-text)" }}>{topic.concept}</p>
            </LearnCard>
          </FadeUp>

          {/* Resources lead, right under the concept -- our own writing orients you,
              then this is the real depth: the actual official docs/course, not an
              afterthought buried at the bottom of the page. Still one card among
              several on the page, not a gate you have to click through, per the
              "our content leads, resources are the invitation" direction. */}
          {topic.resources && topic.resources.length > 0 && (
            <FadeUp>
              {(() => {
                const [primary, ...rest] = topic.resources;
                const PrimaryIcon = resourceIcon[primary.kind] ?? BookMarked;
                return (
                  <div
                    className="mt-6 mb-2 rounded-2xl p-5 sm:p-6 border-2"
                    style={{
                      borderColor: "var(--lesson-accent)",
                      background: "linear-gradient(135deg, color-mix(in srgb, var(--lesson-accent) 8%, transparent), transparent 70%)",
                    }}
                  >
                    <p className="text-xs font-bold uppercase tracking-widest mb-1.5" style={{ color: "var(--lesson-accent)" }}>
                      📚 Start here
                    </p>
                    <p className="text-sm text-[var(--color-text)] mb-4 leading-relaxed">
                      This is where the real depth lives — read the source, then come back for the
                      worked example and common mistakes below.
                    </p>
                    <a
                      href={primary.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 rounded-xl px-4 py-3.5 text-sm font-bold group transition-opacity hover:opacity-90"
                      style={{ backgroundColor: "var(--lesson-accent)", color: "var(--color-on-primary)" }}
                    >
                      <PrimaryIcon size={20} className="shrink-0" />
                      <span className="flex-1 min-w-0 truncate">{primary.label}</span>
                      <ExternalLink size={16} className="shrink-0 group-hover:translate-x-0.5 transition-transform" />
                    </a>
                    {rest.length > 0 && (
                      <div className="grid sm:grid-cols-2 gap-2 mt-2.5">
                        {rest.map((r, i) => {
                          const RIcon = resourceIcon[r.kind] ?? BookMarked;
                          return (
                            <a
                              key={i}
                              href={r.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm border border-[var(--color-border)] hover:border-[var(--lesson-accent)] transition-colors group"
                            >
                              <RIcon size={16} className="shrink-0" style={{ color: "var(--lesson-accent)" }} />
                              <span className="flex-1 min-w-0 truncate">{r.label}</span>
                              <ExternalLink
                                size={13}
                                className="text-[var(--color-text-secondary)] shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                              />
                            </a>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })()}
            </FadeUp>
          )}

          {topic.analogy && (
            <FadeUp>
              <LearnCard>
                <LearnHeading icon={Lightbulb}>
                  Analogy
                </LearnHeading>
                <p className="text-[15px] leading-relaxed">{topic.analogy}</p>
              </LearnCard>
            </FadeUp>
          )}

          {topic.examples && topic.examples.length > 0 && (
            <FadeUp>
              <LearnCard>
                <LearnHeading icon={Code2}>
                  Worked example
                </LearnHeading>
                {topic.examples.map((e, i) => (
                  <div key={i} className="mb-3 last:mb-0 rounded-xl overflow-hidden border border-[var(--color-border)]">
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[rgb(var(--surface-rgb)/0.03)] border-b border-[var(--color-border)]">
                      <span className="w-2.5 h-2.5 rounded-full bg-[var(--color-danger)]/70" />
                      <span className="w-2.5 h-2.5 rounded-full bg-[var(--color-warning)]/70" />
                      <span className="w-2.5 h-2.5 rounded-full bg-[var(--color-success)]/70" />
                    </div>
                    <div
                      className="shiki-surface overflow-x-auto text-[13.5px] leading-relaxed [&>pre]:!bg-transparent [&>pre]:!m-0 [&>pre]:p-4 [&>pre]:font-mono [&>pre]:whitespace-pre-wrap"
                      dangerouslySetInnerHTML={{ __html: highlightedExamples[i] }}
                    />
                    {e.note && <p className="text-xs text-[var(--color-text-secondary)] px-3 py-2 bg-[rgb(var(--surface-rgb)/0.02)]">{e.note}</p>}
                  </div>
                ))}
              </LearnCard>
            </FadeUp>
          )}

          {topic.warn && (
            <div className="mt-4 rounded-xl border border-[var(--color-danger)]/40 bg-[var(--color-danger)]/10 px-4 py-3 text-sm flex items-start gap-2">
              <AlertTriangle size={18} className="text-[var(--color-danger)] mt-0.5 shrink-0" />
              <span>
                <b className="text-[var(--color-danger)]">Safety:</b> {topic.warn}
              </span>
            </div>
          )}

          {topic.mistakes && topic.mistakes.length > 0 && (
            <FadeUp>
              <LearnCard>
                <LearnHeading icon={XCircle}>
                  Common mistakes
                </LearnHeading>
                <ul className="space-y-1.5 text-sm">
                  {topic.mistakes.map((m, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <XCircle size={15} className="mt-1 shrink-0 text-[var(--color-warning)]" />
                      <span>{m}</span>
                    </li>
                  ))}
                </ul>
              </LearnCard>
            </FadeUp>
          )}

          {/* "Quick recall" -- reuses keyTakeaways (no new content authoring needed),
              framed as a genuine self-check moment before moving on, not a passive
              recap list trailing off the end of Learn. */}
          {topic.keyTakeaways && topic.keyTakeaways.length > 0 && (
            <FadeUp>
              <div
                className="mt-10 rounded-2xl p-5 sm:p-6 glass-solid border"
                style={{ borderColor: "color-mix(in srgb, var(--lesson-accent) 25%, transparent)" }}
              >
                <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: "var(--lesson-accent)" }}>
                  Quick recall
                </p>
                <p className="text-sm text-[var(--color-text-secondary)] mb-3">Without scrolling back up, can you account for each of these?</p>
                <ul className="space-y-2">
                  {topic.keyTakeaways.map((k, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm">
                      <CheckCircle2 size={17} className="shrink-0 mt-0.5" style={{ color: "var(--lesson-accent)" }} />
                      <span>{k}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </FadeUp>
          )}

          <p className="mt-4 text-sm text-[var(--color-text-secondary)]">
            Got a question?{" "}
            <a href="#discuss" className="underline hover:opacity-80 transition-opacity" style={{ color: "var(--lesson-accent)" }}>
              Ask in Discuss
            </a>
            , or jump straight to{" "}
            <a href="#practice" className="underline hover:opacity-80 transition-opacity" style={{ color: "var(--lesson-accent)" }}>
              Practice
            </a>
            .
          </p>
        </section>

        {/* ---- Stage 2: Discuss ---- */}
        <section className="mt-12">
          <StageHeader n="02" title="Discuss" icon={MessageSquare} id="discuss" />
          <FadeUp>
            <DiscussSection lessonId={lessonId} accent="var(--lesson-accent)" />
          </FadeUp>
        </section>

        {/* ---- Stage 3: Practice ---- */}
        <section className="mt-12">
          <StageHeader n="03" title="Practice" icon={Target} id="practice" />
          <FadeUp>
            <div
              className="flex items-start gap-2.5 rounded-xl border-l-4 bg-[rgb(var(--surface-rgb)/0.03)] px-4 py-3"
              style={{ borderColor: "var(--lesson-accent)" }}
            >
              <Compass size={16} className="mt-0.5 shrink-0" style={{ color: "var(--lesson-accent)" }} />
              <p className="text-sm leading-relaxed">
                <span className="font-bold uppercase tracking-widest text-xs mr-1.5" style={{ color: "var(--lesson-accent)" }}>
                  Aim
                </span>
                {topic.doneWhen}
              </p>
            </div>
          </FadeUp>
          <FadeUp>
            <LessonSectionLabel color="var(--color-success)" icon={Target}>
              Your hands-on task
            </LessonSectionLabel>
            <p className="text-[15px] leading-relaxed">{topic.handsOn}</p>
          </FadeUp>
          {topic.handsOnSteps && topic.handsOnSteps.length > 0 && (
            <FadeUp>
              <div className="mt-4">
                <HandsOnChecklist steps={topic.handsOnSteps} accent="var(--lesson-accent)" />
              </div>
            </FadeUp>
          )}
          <FadeUp>
            <LessonSectionLabel color="var(--color-text-secondary)" icon={Target}>
              Done when
            </LessonSectionLabel>
            <p className="text-sm glass rounded-xl px-4 py-2.5">{topic.doneWhen}</p>
          </FadeUp>
        </section>

        {/* ---- Stage 4: Confirm ---- */}
        <section className="mt-12">
          <StageHeader n="04" title="Confirm" icon={CheckCircle2} id="confirm" />
          {topic.checks && topic.checks.length > 0 && (
            <FadeUp>
              <LessonSectionLabel color="var(--color-primary)" icon={HelpCircle}>
                Check yourself
              </LessonSectionLabel>
              <div className="space-y-2">
                {topic.checks.map((c, i) => (
                  <CheckReveal key={i} q={c.q} a={c.a} />
                ))}
              </div>
            </FadeUp>
          )}
          <div className="mt-8">
            <LessonSectionLabel icon={PenLine}>Your notes</LessonSectionLabel>
            <NotesBox lessonId={lessonId} initial={progress?.notes ?? ""} />
          </div>
        </section>

        {/* ---- Stage 5: Test ---- */}
        <section className="mt-12">
          <StageHeader n="05" title="Test" icon={CheckCircle2} id="test" />
          <FadeUp>
            <p className="text-sm text-[var(--color-text-secondary)] mb-4">
              Once you mark this lesson done, the scored quiz unlocks below.
            </p>
            <MarkDoneButton
              lessonId={lessonId}
              initiallyDone={progress?.status === "done"}
              questionCount={questionCount}
              quizHref={`/quiz/${slug}`}
            />
          </FadeUp>
        </section>

        <nav className="mt-10 pt-6 border-t border-[var(--color-border)] flex justify-between text-sm gap-4">
          {prev ? (
            <Link
              href={`/learn/${prev.topic.id}`}
              className="text-[var(--color-text-secondary)] hover:text-[var(--color-text)] flex items-center gap-1 transition-colors"
            >
              <ArrowLeft size={15} /> {prev.topic.title}
            </Link>
          ) : (
            <span />
          )}
          {next && (
            <Link
              href={`/learn/${next.topic.id}`}
              className="text-[var(--color-text-secondary)] hover:text-[var(--color-text)] text-right flex items-center gap-1 transition-colors"
            >
              {next.topic.title} <ArrowRight size={15} />
            </Link>
          )}
        </nav>
      </article>
    </>
  );
}
