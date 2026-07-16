import Link from "next/link";
import { FadeUp, ScrollParallax, Stagger, StaggerItem } from "@/components/ui/motion";
import { ScrollHero } from "@/components/ui/ScrollHero";
import { ScrollProgressBar } from "@/components/ui/ScrollProgressBar";
import { DashboardMockup } from "@/components/landing/DashboardMockup";
import { TechTicker } from "@/components/landing/TechTicker";
import { PathGrid } from "@/components/landing/PathGrid";
import { ValuePropsCarousel } from "@/components/landing/ValuePropsCarousel";
import { SkillConstellation } from "@/components/landing/SkillConstellation";
import { TerminalHeading } from "@/components/landing/TerminalHeading";
import { StatCallout } from "@/components/landing/StatCallout";
import { HowItWorksTimeline } from "@/components/landing/HowItWorksTimeline";
import {
  GraduationCap,
  Sparkles,
  Mic,
  CheckCircle2,
  ArrowRight,
  BookOpen,
  Target,
  Trophy,
  ShieldCheck,
} from "@/components/ui/icons";

const VALUE_PROPS = [
  {
    icon: <BookOpen size={20} />,
    title: "Learn it from zero",
    body: "Every lesson starts with no assumed knowledge — concept, analogy, worked examples, common mistakes.",
    color: "#00e5ff",
  },
  {
    icon: <Target size={20} />,
    title: "Prove it with quizzes",
    body: "FAANG-caliber MCQs per lesson — conceptual traps, code-output prediction, Big-O comparisons. 80% to pass.",
    color: "#3fb950",
  },
  {
    icon: <Sparkles size={20} />,
    title: "Forage Tutor",
    body: "A grounded AI tutor for every lesson — hints before answers, Socratic, never does your quiz for you.",
    color: "#ff3d81",
  },
  {
    icon: <Mic size={20} />,
    title: "Forage Interview",
    body: "A live, voice-first AI mock interview for your target role — behavioral, technical, or DSA — with a real feedback report.",
    color: "#3d8fff",
  },
  {
    icon: <Trophy size={20} />,
    title: "XP, streaks & badges",
    body: "Light gamification that keeps you moving without turning learning into a slot machine.",
    color: "#ffb020",
  },
  {
    icon: <ShieldCheck size={20} />,
    title: "Cited, original content",
    body: "Every lesson is authored from scratch and links to official docs (Python, MDN, Git, Docker, React) — no copied passages, ever.",
    color: "#6ff9ff",
  },
];

const STEPS = [
  { n: "01", title: "Start free", body: "The Common Core — 6 modules, zero to functional, no card required.", accent: "#00e5ff" },
  { n: "02", title: "Choose your path", body: "AI Engineer, Software Engineer, Full-Stack, Data Scientist, Cloud & DevOps, or Cybersecurity.", accent: "#baff2e" },
  { n: "03", title: "Study, then prove it", body: "Read the lesson, do the hands-on task, then pass the quiz — study-first, always.", accent: "#ff3d81" },
  { n: "04", title: "Get interview-ready", body: "Ask the Tutor when you're stuck, then rehearse with Forage Interview before the real thing.", accent: "#b967ff" },
];

export default function LandingPage() {
  return (
    <div className="flex-1 flex flex-col">
      <ScrollProgressBar />
      <header className="sticky top-0 z-20">
        <div className="glass border-x-0 border-t-0 rounded-none">
          <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-4">
            <span className="font-bold text-lg tracking-tight" style={{ fontFamily: "var(--font-display)" }}>
              Forage<span className="text-[#00e5ff]">.</span>
            </span>
            <nav className="hidden sm:flex gap-5 text-sm text-[#7d99a3] ml-6">
              <a href="#paths" className="hover:text-white transition-colors">Career paths</a>
              <a href="#interview" className="hover:text-white transition-colors">Forage Interview</a>
              <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
            </nav>
            <div className="ml-auto flex items-center gap-2">
              <Link href="/auth" className="px-3.5 py-2 rounded-xl text-sm text-[#7d99a3] hover:text-white transition-colors">
                Sign in
              </Link>
              <Link
                href="/auth"
                className="px-4 py-2 rounded-xl bg-[#00e5ff] text-[#05070a] text-sm font-semibold hover:bg-[#33ebff] transition-colors"
              >
                Start free
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <ScrollHero
          className="pt-16 sm:pt-24 pb-16 sm:pb-24"
          header={
            <div className="max-w-4xl mx-auto px-4 text-center">
              <FadeUp>
                <p className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-[#ff3d81] glass rounded-full px-3 py-1.5 mb-6">
                  <Sparkles size={13} /> Free Common Core + 6 career paths
                </p>
                <h1 className="display text-4xl sm:text-6xl md:text-7xl mb-5">
                  Learn it. <span className="gradient-word">Prove it.</span> Get hired.
                </h1>
                <p className="lead max-w-2xl mx-auto">
                  Forage teaches industry skills from absolute zero to hiring standard —
                  real lessons, FAANG-caliber quizzes, a grounded AI tutor, and live voice
                  mock interviews. Built for people who are done just preparing.
                </p>
                <div className="mt-8 flex items-center justify-center gap-3 flex-wrap">
                  <Link
                    href="/auth"
                    className="inline-flex items-center gap-1.5 px-6 py-3 rounded-xl bg-gradient-to-r from-[#00e5ff] to-[#ff3d81] text-[#05070a] text-sm font-semibold hover:opacity-90 transition-opacity"
                  >
                    Start learning free <ArrowRight size={16} />
                  </Link>
                  <a
                    href="#interview"
                    className="inline-flex items-center gap-1.5 px-6 py-3 rounded-xl glass glass-hover text-sm font-semibold"
                  >
                    See Forage Interview
                  </a>
                </div>
                <p className="text-xs text-[#7d99a3] mt-4">
                  No credit card required. The Common Core stays free.
                </p>
              </FadeUp>
            </div>
          }
          card={<DashboardMockup />}
        />

        {/* Tech ticker — real skill tags per path, not just names */}
        <section className="py-2">
          <TechTicker />
        </section>

        {/* Value props */}
        <section className="relative max-w-7xl mx-auto px-4 py-10">
          <SkillConstellation variant="a" />
          <ScrollParallax>
            <FadeUp>
              <TerminalHeading text="The full toolkit, not just lessons" className="text-xl sm:text-2xl text-center mb-6" />
            </FadeUp>
            <FadeUp delay={0.1}>
              <div className="grid lg:grid-cols-[1fr_auto_1fr] items-center gap-4">
                <StatCallout
                  value={175}
                  suffix="+"
                  label="original lessons across 7 tracks"
                  accent="#00e5ff"
                  className="hidden lg:block"
                />
                <div className="max-w-2xl w-full mx-auto">
                  <ValuePropsCarousel items={VALUE_PROPS} />
                </div>
                <StatCallout
                  value={6}
                  label="career paths, basics to advanced"
                  accent="#ff3d81"
                  className="hidden lg:block text-right ml-auto"
                />
              </div>
            </FadeUp>
          </ScrollParallax>
        </section>

        {/* How it works */}
        <section className="relative max-w-7xl mx-auto px-4 py-14">
          <SkillConstellation variant="b" />
          <ScrollParallax>
            <FadeUp>
              <TerminalHeading text="How Forage works" className="text-2xl sm:text-4xl text-center mb-12" />
            </FadeUp>
            <HowItWorksTimeline steps={STEPS} />
          </ScrollParallax>
        </section>

        {/* Career paths */}
        <section id="paths" className="max-w-5xl mx-auto px-4 py-10">
          <ScrollParallax yRange={36}>
            <FadeUp>
              <div className="flex items-end justify-between gap-4 mb-5 flex-wrap">
                <div>
                  <p className="font-mono text-[11px] font-bold uppercase tracking-widest text-[#7d99a3] mb-1.5">
                    Six tracks, one curriculum
                  </p>
                  <h2 className="display text-2xl sm:text-3xl flex items-center gap-2.5">
                    <GraduationCap size={24} className="text-[#ff3d81] shrink-0" />
                    Start free, choose your path when you&rsquo;re ready
                  </h2>
                </div>
                <p className="text-sm text-[#7d99a3] max-w-xs">
                  Everyone begins with the free Common Core, then picks a track — each
                  basics-to-advanced with a capstone.
                </p>
              </div>
            </FadeUp>
            <PathGrid />
          </ScrollParallax>
        </section>

        {/* Forage Interview spotlight */}
        <section id="interview" className="max-w-5xl mx-auto px-4 py-10">
          <ScrollParallax>
            <FadeUp>
              <div className="glass rounded-2xl p-8 sm:p-10 grid md:grid-cols-[1fr_auto] gap-8 items-center relative overflow-hidden">
                <div className="absolute -left-10 -bottom-10 w-56 h-56 rounded-full bg-[#3d8fff]/15 blur-3xl pointer-events-none" />
                <div>
                  <h2 className="display text-2xl sm:text-3xl mb-3">Rehearse the real thing, out loud</h2>
                  <p className="text-sm text-[#7d99a3] max-w-xl leading-relaxed">
                    <strong className="text-[#ece9f5] font-semibold">Forage Interview</strong> is a
                    live, voice-first mock interview for your target role. Pick behavioral,
                    technical, or DSA — the AI interviewer asks one question at a time, follows up
                    naturally, and closes with a feedback report: what worked, what to fix, and a
                    stronger model answer. Free users get one 3-minute trial; Pro is unlimited.
                  </p>
                  <Link
                    href="/auth"
                    className="inline-flex items-center gap-1.5 mt-5 px-5 py-2.5 rounded-xl bg-[#3d8fff] text-white text-sm font-semibold hover:opacity-90 transition-opacity"
                  >
                    Try the free trial <ArrowRight size={15} />
                  </Link>
                </div>
                <div className="w-28 h-28 rounded-full glass grid place-items-center shrink-0 mx-auto">
                  <Mic size={36} className="text-[#5ba3ff]" />
                </div>
              </div>
            </FadeUp>
          </ScrollParallax>
        </section>

        {/* Pricing preview */}
        <section id="pricing" className="max-w-4xl mx-auto px-4 py-12">
          <ScrollParallax>
            <FadeUp>
              <h2 className="display text-2xl sm:text-3xl text-center mb-6">Simple, honest pricing</h2>
            </FadeUp>
            <Stagger className="grid sm:grid-cols-2 gap-5">
              <StaggerItem>
                <div className="glass rounded-2xl p-6 h-full">
                  <p className="text-xs font-bold uppercase tracking-widest text-[#7d99a3]">Free</p>
                  <p className="text-3xl font-bold mt-1" style={{ fontFamily: "var(--font-display)" }}>₹0</p>
                  <p className="text-xs text-[#7d99a3]">forever</p>
                  <ul className="mt-5 space-y-2 text-sm">
                    {["The full Common Core", "Quizzes, XP, streaks & badges", "One free 3-minute mock interview"].map((p) => (
                      <li key={p} className="flex items-start gap-2">
                        <CheckCircle2 size={16} className="text-[#3fb950] mt-0.5 shrink-0" />
                        {p}
                      </li>
                    ))}
                  </ul>
                </div>
              </StaggerItem>
              <StaggerItem>
                <div className="glass rounded-2xl p-6 border-[#00e5ff]/40 relative overflow-hidden h-full">
                  <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-[#ff3d81]/20 blur-3xl pointer-events-none" />
                  <p className="text-xs font-bold uppercase tracking-widest text-[#ff3d81] flex items-center gap-1">
                    <Sparkles size={13} /> Pro
                  </p>
                  <p className="text-3xl font-bold mt-1" style={{ fontFamily: "var(--font-display)" }}>Coming soon</p>
                  <p className="text-xs text-[#7d99a3]">pricing to be announced</p>
                  <ul className="mt-5 space-y-2 text-sm">
                    {["All 6 career paths, basics → advanced", "FAANG-caliber quizzes per lesson", "Unlimited Forage Interview sessions"].map((p) => (
                      <li key={p} className="flex items-start gap-2">
                        <CheckCircle2 size={16} className="text-[#ff3d81] mt-0.5 shrink-0" />
                        {p}
                      </li>
                    ))}
                  </ul>
                </div>
              </StaggerItem>
            </Stagger>
            <p className="text-center text-xs text-[#7d99a3] mt-6">
              Forage never claims to guarantee placement — we build for the real hiring loop instead.
            </p>
          </ScrollParallax>
        </section>

        {/* Final CTA */}
        <section className="max-w-3xl mx-auto px-4 pb-20 text-center">
          <ScrollParallax>
            <FadeUp>
              <div className="glass rounded-2xl p-10 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-[#00e5ff]/10 to-[#6ff9ff]/10 pointer-events-none" />
                <h2 className="display text-2xl sm:text-3xl mb-3">Stop preparing to prepare.</h2>
                <p className="text-sm text-[#7d99a3] max-w-md mx-auto mb-6">
                  Start the Common Core today — it&rsquo;s free, it takes about 10-15 hours, and it
                  ends with you choosing a real path.
                </p>
                <Link
                  href="/auth"
                  className="inline-flex items-center gap-1.5 px-6 py-3 rounded-xl bg-gradient-to-r from-[#00e5ff] to-[#ff3d81] text-[#05070a] text-sm font-semibold hover:opacity-90 transition-opacity"
                >
                  Start learning free <ArrowRight size={16} />
                </Link>
              </div>
            </FadeUp>
          </ScrollParallax>
        </section>
      </main>

      <footer className="border-t border-white/[0.06] py-8">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#7d99a3]">
          <span style={{ fontFamily: "var(--font-display)" }}>Forage<span className="text-[#00e5ff]">.</span></span>
          <span>Built for people done preparing-as-procrastination.</span>
        </div>
      </footer>
    </div>
  );
}
