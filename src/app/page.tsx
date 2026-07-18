import Link from "next/link";
import { FadeUp, ScrollParallax } from "@/components/ui/motion";
import { ScrollHero } from "@/components/ui/ScrollHero";
import { ScrollProgressBar } from "@/components/ui/ScrollProgressBar";
import { DashboardMockup } from "@/components/landing/DashboardMockup";
import { HeroHeadline } from "@/components/landing/HeroHeadline";
import { TechTicker } from "@/components/landing/TechTicker";
import { PathGrid } from "@/components/landing/PathGrid";
import { ValuePropsCarousel } from "@/components/landing/ValuePropsCarousel";
import { SkillConstellation } from "@/components/landing/SkillConstellation";
import { TerminalHeading } from "@/components/landing/TerminalHeading";
import { StatCallout } from "@/components/landing/StatCallout";
import { HowItWorksTimeline } from "@/components/landing/HowItWorksTimeline";
import { InterviewSpotlight } from "@/components/landing/InterviewSpotlight";
import { PricingCards } from "@/components/landing/PricingCards";
import { FinalCTA } from "@/components/landing/FinalCTA";
import { LandingFooter } from "@/components/landing/LandingFooter";
import {
  GraduationCap,
  Sparkles,
  Mic,
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
                <HeroHeadline />
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
              <InterviewSpotlight />
            </FadeUp>
          </ScrollParallax>
        </section>

        {/* Pricing preview */}
        <section id="pricing" className="max-w-4xl mx-auto px-4 py-12">
          <ScrollParallax>
            <FadeUp>
              <h2 className="display text-2xl sm:text-3xl text-center mb-6">Simple, honest pricing</h2>
            </FadeUp>
            <PricingCards />
            <p className="text-center text-xs text-[#7d99a3] mt-6">
              Forage never claims to guarantee placement — we build for the real hiring loop instead.
            </p>
          </ScrollParallax>
        </section>

        {/* Final CTA */}
        <section className="max-w-3xl mx-auto px-4 pb-20 text-center">
          <ScrollParallax>
            <FadeUp>
              <FinalCTA />
            </FadeUp>
          </ScrollParallax>
        </section>
      </main>

      <LandingFooter />
    </div>
  );
}
