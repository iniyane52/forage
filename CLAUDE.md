# Forage — CLAUDE.md

This is the primary onboarding document for any Claude Code session working on this
project. Read this fully before making changes. See also `AGENTS.md` (a short, separate
warning about this Next.js version's breaking changes vs. training-data assumptions —
read that too, it's not duplicated here).

## ⚠️ Standing hard constraint — read this first

There is a **separate, unrelated personal project** at `C:\claude\foundry` (note:
**foundry**, not **foundary** — one letter apart, easy to confuse). It is the project
owner's personal study/curriculum system and is **completely unrelated to this codebase**.
**Never read, write, or otherwise touch anything under `C:\claude\foundry`** while working
on this project (`C:\claude\foundary`). This has been verified via file-hash/timestamp
diffing multiple times across this project's history — it must stay untouched. If you're
ever unsure which directory you're in, check the exact spelling before any write.

A file `REBUILD.md` in this repo describes an earlier "hybrid-learning contract" concept
(the idea that the project owner would rebuild certain pieces themselves for interview
prep). **That plan is superseded** — Claude now builds the full project directly. The file
is left in place as historical context only; do not treat it as an active constraint.

## Project overview

**Forage** (domain: forage.co.in) is a freemium ed-tech SaaS teaching industry-standard
tech skills from absolute zero to hiring standard: real lessons, FAANG-caliber quizzes, a
grounded AI tutor, and live voice AI mock interviews. It is a from-scratch rebuild/rebrand
of an earlier project (originally called "Foundary" — the repo/folder name `foundary` is a
leftover from that name and predates the "Forage" rebrand; don't read anything into the
mismatch between folder name and product name).

## Goal and vision

Teach people real, defensible skills — not just credential-shaped content — and prove it
two ways: quizzes hard enough to actually mean something, and a live voice mock interview
that gives real feedback. The product thesis, stated in the landing page copy itself:
*"Learn it. Prove it. Get hired."* Freemium model: a genuinely useful free tier (the
Common Core — engineering fundamentals, free forever) that funnels into 6 paid,
specialized career paths (AI Engineer, Software Engineer, Full-Stack Developer, Data
Scientist, Cloud & DevOps, Cybersecurity), each basics-to-advanced with a capstone.

Content authoring discipline (established early, followed throughout): every lesson is
**originally written** (never copied from a source), technical claims are grounded by
fetching the real official docs first, and **every code snippet in every lesson has
actually been executed** to confirm it's correct — not just plausible-looking. This is a
real, load-bearing quality bar; don't relax it when adding content.

## Tech stack

- **Framework**: Next.js 16.2.10 (App Router), React 19.2.4 — see `AGENTS.md`, this
  version has real breaking changes vs. your training data, check
  `node_modules/next/dist/docs/` before assuming an API behaves like the Next.js you know.
- **Language**: TypeScript (strict), ESLint 9 flat config (`eslint.config.mjs`)
- **Styling**: Tailwind CSS v4 (`@theme inline` in `globals.css` — see the "Architecture
  decisions" note below on a real bug this causes)
- **Motion**: Framer Motion 12.x for FadeUp/Stagger/HoverTilt/CountUp/ScrollParallax/
  HeadingReveal (centralized in `src/components/ui/motion.tsx`), plus GSAP 3.x +
  ScrollTrigger + SplitText (`gsap`, `@gsap/react`, centralized in
  `src/components/ui/gsapMotion.tsx`) for character-level SplitText and scrub-tied-to-
  scroll-velocity choreography — the two things Framer can't do structurally. Never
  animate the same element with both. All animation, in either library, is gated by
  `useReducedMotion()`.
- **Icons**: lucide-react (re-exported through `src/components/ui/icons.tsx` — see RSC
  note below on why icons are never passed as props across the server/client boundary)
- **Backend**: Supabase — Postgres (with RLS), Auth, and Edge Functions (Deno). Project
  ref: `dlnbrjldscazjznkhoyc`. Managed entirely through the Supabase MCP tools
  (`apply_migration`, `execute_sql`, `deploy_edge_function`, etc.) — **there is no local
  `supabase/` folder or migrations directory**; all schema changes go directly against the
  live hosted project via MCP tools, and there is currently no local migration history to
  replay. If you add a `supabase/` CLI-linked setup later, reconcile it against the live
  schema first.
- **AI providers**: Groq (`api.groq.com`) — `llama-3.3-70b-versatile` for chat,
  `whisper-large-v3-turbo` for speech-to-text, `canopylabs/orpheus-v1-english` for
  text-to-speech. All three power the `interview` edge function. The `tutor` edge function
  also uses the same `LLM_API_KEY` secret (confirm it's still pointed at a working
  provider before relying on Tutor — it predates the Groq migration and was not
  independently re-verified after that switch).
- **Fonts**: Chakra Petch (display), Inter (body), JetBrains Mono (mono), Unbounded
  (hero headline only — bolder/chunkier, layered via a `.font-hero` utility on top of
  `.display`, not a site-wide type-system change) — all via `next/font/google` in
  `src/app/layout.tsx`.
- **Package manager**: npm (`package-lock.json` present, no yarn/pnpm lockfile).
- **No traditional Next.js API routes** — there is no `src/app/api/` directory. All
  server communication is Supabase client SDK calls (from Server or Client Components),
  Postgres RPC functions (`SECURITY DEFINER`, bypass RLS, self-check `auth.uid()`), or the
  2 Edge Functions. See "API routes" section below.

## Folder structure

```
foundary/
├── AGENTS.md                    # short Next.js-version warning (separate from this file)
├── CLAUDE.md                    # this file
├── REBUILD.md                   # historical/superseded — see constraint note above
├── content/                     # lesson content JSON — see "content pipeline" below
│   ├── commoncore.json          #   Common Core (free), 30 lessons / 7 modules
│   ├── stream1.json             #   Cloud & DevOps, 53 lessons / 7 modules
│   ├── aiml.json                #   AI Engineer, 48 lessons / 10 modules
│   ├── swe.json                 #   Software Engineer, 19 lessons / 4 modules
│   ├── fullstack.json           #   Full-Stack Developer, 36 lessons / 8 modules
│   ├── data.json                #   Data Scientist, 34 lessons / 8 modules
│   ├── cyber.json                #   Cybersecurity, 30 lessons / 8 modules
│   ├── cc_questions.js          #   OLDER quiz-bank format, NOT imported by app code —
│   │                              reference/archive only; DB quiz_questions is the
│   │                              source of truth for live quizzes
│   └── *_m*.js, *_questions.js  #   per-module draft/staging files from content authoring,
│                                    also not imported at runtime — the *.json files above
│                                    are what src/lib/content.ts actually reads
├── src/
│   ├── app/
│   │   ├── page.tsx              # landing page (public, marketing)
│   │   ├── layout.tsx             # root layout: fonts, scroll-restoration fix, NavProgress
│   │   ├── template.tsx           # root-level, site-wide page-enter transition (fade+
│   │   │                            slide, pure CSS) -- covers every route in one place,
│   │   │                            not scoped per route-group (see Architecture decisions)
│   │   ├── globals.css            # Tailwind v4 theme tokens, custom keyframes
│   │   ├── auth/page.tsx          # sign in / sign up (Supabase Auth)
│   │   └── (app)/                 # authenticated app shell (route group)
│   │       ├── layout.tsx         #   header (Lv/XP/streak), nav
│   │       ├── dashboard/         #   post-login home, career-path tiles
│   │       ├── stream/[slug]/     #   module/lesson list for one stream
│   │       ├── learn/[slug]/      #   individual lesson page
│   │       ├── quiz/[slug]/       #   quiz-taking flow for one lesson
│   │       ├── interview/         #   Forage Interview (voice mock interview)
│   │       ├── pricing/           #   Free/Pro plan comparison + upgrade (see known gaps)
│   │       └── profile/           #   user profile/settings
│   ├── components/
│   │   ├── ui/                    # design-system primitives: motion.tsx, gsapMotion.tsx
│   │   │                            (GSAP/ScrollTrigger/SplitText setup), icons.tsx,
│   │   │                            PathTile.tsx, ScrollHero.tsx (static hero layout, no
│   │   │                            pin/tilt -- see Known bugs), ScrollProgressBar.tsx,
│   │   │                            NavProgress.tsx, Confetti.tsx
│   │   ├── landing/                # landing-page-only components: TechTicker,
│   │   │                            PathGrid, SkillConstellation, TerminalHeading,
│   │   │                            StatCallout, HowItWorksTimeline, ValuePropsCarousel,
│   │   │                            DashboardMockup, HeroHeadline
│   │   ├── interview/              # InterviewClient.tsx (main state machine), VoiceOrb
│   │   ├── QuizRunner.tsx, LessonActions.tsx, TutorDrawer.tsx, SignOutButton.tsx
│   ├── hooks/
│   │   ├── useVoice.ts             # voice capture/playback: native SpeechRecognition +
│   │   │                            MediaRecorder/Whisper fallback; native/Orpheus TTS
│   │   └── useMounted.ts           # SSR-hydration-safe "has the client mounted yet" gate
│   │                                (useSyncExternalStore) -- see Architecture decisions
│   │                                on why this matters for any component branching its
│   │                                returned JSX on useReducedMotion()
│   ├── lib/
│   │   ├── content.ts               # loads all content/*.json, flattens into a single
│   │   │                             array for prev/next lesson navigation (array ORDER
│   │   │                             in the JSON files determines nav order — see below)
│   │   ├── pathMeta.ts              # per-path accent color / skill tags / difficulty,
│   │   │                             used by PathTile, PathGrid, TechTicker, SkillConstellation
│   │   └── supabase/                # client.ts (browser), server.ts (RSC/server actions)
│   └── proxy.ts                     # THIS PROJECT'S NAME FOR NEXT.JS MIDDLEWARE (this
│                                     Next.js version renamed middleware.ts -> proxy.ts;
│                                     do not create a middleware.ts, it won't be picked up)
└── supabase_functions_interview_index.ts   # staging copy of the `interview` edge
                                              function source (deployed via Supabase MCP,
                                              not auto-synced — see "Edge Functions" below)
```

## Architecture decisions (and the bugs behind them — read before touching related code)

- **Content is split across two systems on purpose**: `content/*.json` files hold the
  actual lesson body (concept, analogy, code examples, mistakes, resources, etc.) and are
  the source `src/lib/content.ts` reads at build time. The DB's `lessons` table only holds
  navigation/access metadata (slug, title, sort, module_id) — its `body` jsonb column is
  **vestigial and always `{}`**, do not expect lesson content there. `quiz_questions` in
  the DB is the live quiz source of truth, separate from the lightweight in-lesson `checks`
  array in the JSON (which powers the small "check yourself" reveal on the lesson page
  itself, not the actual scored quiz).
- **Lesson prev/next navigation order comes from JSON array order**, not the DB `sort`
  column directly (though they're kept in sync by convention). `src/lib/content.ts`
  flattens `[...commoncore, ...stream1, ...aiml, ...swe, ...fullstack, ...data, ...cyber]`
  in that fixed order, then each module's `topics` array in file-order. If you insert a
  new lesson, its position in the JSON array is what determines its place in the
  Prev/Next flow — get this right, not just the DB `sort` integer.
- **RSC constraint**: Lucide icon *components* cannot be passed as props from a Server
  Component into a Client Component (RSC serialization error). Pattern used throughout:
  either pre-render the icon as JSX server-side, or (preferred, see `PathTile.tsx`) have
  the Client Component resolve `streamIcon[slug]` itself internally.
- **Tailwind v4 `@theme inline` bug**: tokens declared inside `@theme inline { ... }` in
  `globals.css` are *not* emitted as live, queryable runtime CSS custom properties —
  components using `style={{ fontFamily: "var(--font-display)" }}` inline get nothing. Fix
  used twice already: redeclare the same tokens plainly inside a non-`@theme` `html { ... }`
  rule, which *does* emit real inheritable custom properties. If you add new design tokens
  that need to be read via inline `style`, redeclare them in the plain `html` rule too.
- **`navigator.sendBeacon` cannot carry custom headers** (specifically `Authorization`) —
  this is why the interview's abandoned-session cleanup (`InterviewClient.tsx`) uses
  `fetch(url, { ..., keepalive: true })` instead. Deliberate, don't "simplify" it to
  `sendBeacon`.
- **Interview provider is Groq, not Gemini** — an earlier version used Gemini, but the
  Google Cloud project behind it had zero free-tier quota provisioned (confirmed via live
  test, not assumption) and paid Gemini access was never set up. The whole `interview` edge
  function was migrated to Groq (chat + Whisper STT + Orpheus TTS). The wire format
  between client/DB/edge-function is still Gemini-shaped
  (`{role: "user"|"model", parts:[{text}]}[]`) everywhere *except* the one place that
  actually calls the model — don't "clean this up" without a reason, it's intentional
  minimal-diff design, not leftover cruft.
- **Server-side interview duration enforcement**: the 3-min (free) / 15-min (Pro) session
  cap is enforced server-side in the edge function by comparing `now()` against the
  persisted `interview_sessions.started_at` + `max_minutes`, not trusted from the client's
  own countdown timer (which is display-only and was previously the *only* enforcement,
  a real bypassable gap that's now closed).
- **Scroll-restoration fix lives in `src/app/layout.tsx`** as an inline `<script>` tag
  (runs synchronously before hydration, unlike a `useEffect` which fires too late to avoid
  a visible jump) — disables `history.scrollRestoration` and handles `pageshow` for
  back/forward-cache restores. `overflow-x-hidden` is set on both `<html>` and `<body>` —
  both are needed; body alone did not fully suppress a real horizontal-scroll bug caused by
  the landing page's CSS marquee animation escaping its local clip.
- **`ResizeObserver` fires once immediately on first `.observe()` call**, even with no
  actual resize — this caused a real bug in `ValuePropsCarousel.tsx` where an initial
  `scrollIntoView({ block: "nearest" })` call, unable to find a vertically-scrollable
  ancestor (the carousel only scrolls horizontally), fell back to scrolling the *entire
  page*. Fixed by computing the horizontal offset manually and calling `track.scrollBy()`
  directly on the track element, never `card.scrollIntoView()`. If you see other carousels
  built with `scrollIntoView`, audit them for the same issue.
- **Branching a component's top-level return on `useReducedMotion()` directly is a real
  hydration-mismatch trap.** SSR has no `matchMedia`, so the server always renders one
  branch (effectively `reduce === false`), but a client whose OS already prefers reduced
  motion can report `true` on its very first paint — if the two branches render
  structurally different trees (different root tag, different child count), React throws
  a real hydration-mismatch error and regenerates the subtree client-side, which can also
  cascade into breaking a Framer Motion `useScroll` ref binding on the same page. Found and
  fixed in five components this session (`ScrollProgressBar.tsx`, `SkillConstellation.tsx`,
  `TechTicker.tsx`, `TerminalHeading.tsx`, `ValuePropsCarousel.tsx`) via
  `src/hooks/useMounted.ts` (a `useSyncExternalStore`-based "has the client mounted"
  gate — server snapshot `false`, client snapshot `true`) — gate as `if (!mounted ||
  reduce) return <staticBranch/>`, never just `if (reduce)`. Components in
  `src/components/ui/motion.tsx` (`Stagger`/`StaggerItem`/`HoverTilt`/`ScrollParallax`)
  are *not* affected despite the same-looking pattern, because both of their branches
  render the identical underlying `<div>` tag (a Framer `motion.div` SSRs to a plain
  `div`) — the mismatch only bites when the two branches produce genuinely different DOM
  shapes. If you add a new component with this pattern, use `useMounted()` from the start.
- **A CSS `transform` on *any* ancestor — even one resolved to a numeric no-op like
  `translate(0,0)` — establishes a new containing block for every `position: fixed`
  (and `position: absolute`) descendant anywhere below it, silently breaking real
  viewport-relative fixed positioning.** This bit us for real: the page-transition
  CSS (`@keyframes pageEnter`, `animation-fill-mode: both`) used `transform:
  translateY(...)`, and `both` permanently locks in the `to` keyframe's *computed*
  transform value even after the animation finishes — so every page, forever, had an
  ancestor with a non-`none` `transform`. Fixed by using the standalone `translate` CSS
  property instead of `transform: translateY(...)` in that keyframe (`translate` does
  not trigger this containing-block behavior, unlike `transform`). If you ever add a
  `transform`-based CSS animation with `fill-mode: both`/`forwards` on a wide-scoped
  ancestor (a layout wrapper, a page template, anything most of the app renders inside
  of), prefer the standalone `translate`/`rotate`/`scale` properties over `transform`
  for exactly this reason.
- **GSAP `ScrollTrigger` measures each trigger's start/end pixel positions once, at
  creation time** — if a web font (this project's `next/font/google` fonts, especially
  the heavy Unbounded weights added for the hero) is still swapping in and shifting
  layout after that moment, the trigger's measurements go stale and it never
  self-corrects. Fixed globally in `src/components/ui/gsapMotion.tsx` via
  `document.fonts.ready.then(() => ScrollTrigger.refresh())`, which re-measures every
  ScrollTrigger on the page once fonts are confirmed loaded, not just one component's.

## Features completed

- **Auth & profiles**: Supabase Auth (email/password), `profiles` table with XP/level/
  streak/plan/chosen_path, `handle_new_user()` trigger on signup.
- **Content**: 180 lessons across 7 streams (Common Core + 6 Pro paths) — see exact counts
  in the Database Schema section. Every lesson has concept/analogy/worked example(s)/
  common mistakes/hands-on task/done-when criteria/resources; quizzes are "light" (1-2
  genuinely testable questions per lesson, study-only lessons get 0).
- **Study flow**: dashboard → stream page → lesson page → quiz (study-first gated: quiz
  only unlocks after the lesson is marked done) → XP/streak/badge rewards.
- **Forage Tutor**: grounded, Socratic AI tutor drawer on every lesson page (`tutor` edge
  function) — hints before answers, never solves the quiz for the user.
- **Forage Interview**: full voice-first mock interview system.
  - Text: Groq `llama-3.3-70b-versatile`, role/focus-specific system prompt, real
    multi-turn conversation with follow-ups (not scripted).
  - Voice in: native browser `SpeechRecognition` where available, falls back to
    `MediaRecorder` + Groq Whisper for Firefox/Safari (which lack `SpeechRecognition`).
  - Voice out: Groq Orpheus TTS (expressive, natural-sounding) with automatic fallback to
    native `speechSynthesis` if the network call fails.
  - Tiered: free = one-time 3-min trial, 2 generic roles, simple feedback; Pro = unlimited
    (capped 5 sessions/day server-side), full 6-role list + "Surprise me" random role/focus
    button, 15-min sessions, per-competency scored feedback (3 categories, 1-5 each).
  - Server-enforced duration cap and trial-usage (can't be bypassed via client tampering).
  - Best-effort abandoned-session cleanup on tab hide (45s grace period before ending, to
    avoid killing a session on a brief tab switch) or page close.
- **Landing page**: a bold kinetic-typography hero (`HeroHeadline.tsx` — GSAP SplitText
  char-tumble entrance, Unbounded font) inside a static (no pin/tilt — see Known bugs)
  `ScrollHero.tsx` layout, continuous scroll-parallax on every section below it, a
  real-content tech-skill ticker (`TechTicker.tsx`, not just path names), a dense
  per-path skill grid (`PathGrid.tsx`, real accent colors/skill tags/difficulty per
  path, not a plain list), ambient drifting skill-icon background art
  (`SkillConstellation.tsx`), terminal-style kinetic section headings
  (`TerminalHeading.tsx`), a connected/animated "how it works" timeline
  (`HowItWorksTimeline.tsx`), flanking animated stat counters (`StatCallout.tsx`), and
  an ambient "aurora" background glow scoped to just the hero section (`.aurora-zone`
  in `globals.css` — it used to be `position: fixed` on `<body>`, which pinned it to
  viewport corners forever and made it bleed through unrelated cards deep in the page;
  now scoped so it scrolls away naturally after the hero).
- **Site-wide page transitions**: a root `src/app/template.tsx` applies a brief
  (320ms), pure-CSS fade + slide-up on every navigation anywhere in the app — landing →
  auth → the whole `(app)` group. Deliberately CSS-only (not Framer/JS-driven): a
  `template.tsx` re-mounts on every navigation including `router.refresh()` calls
  (used by quiz/lesson actions), and a JS-driven animation can get interrupted
  mid-flight and stuck invisible; `animation-fill-mode: both` always resolves to
  visible regardless of timing.
- **Gamification**: XP, levels, daily streaks (`touch_streak()`), badges.
- **Deep-tech-neon visual identity**: dark palette, distinct neon accent per stream (see
  `src/lib/pathMeta.ts`), Chakra Petch/Inter/JetBrains Mono type system, glass-morphism
  surfaces, big bold digitalized tiles.

## Features currently in progress / partially done

- **Learn → Discuss → Practice → Confirm → Test rollout is COMPLETE.** The 5-stage
  layout (`LessonStepFlow.tsx`) is now the *only* lesson layout — it replaced the old
  single-scroll layout everywhere (`LegacyLessonLayout.tsx`/`LessonOutline.tsx` were
  deleted as dead code once nothing referenced them anymore), so every stream renders
  the new structure. The interactive `handsOnSteps` checklist (`HandsOnChecklist.tsx`)
  renders when a lesson has `handsOnSteps` authored in its JSON. **All 7 streams are now
  fully authored with real, executed-and-verified steps: Common Core (30/30), Cloud &
  DevOps (53/53), AI Engineer (48/48), Software Engineer (31/31), Full-Stack Developer
  (36/36), Data Scientist (37/37), and Cybersecurity (32/32) — 267 lessons total across
  the whole platform, every single one carrying a real, hands-on-verified checklist.**
  Docker/Kubernetes/Terraform/Prometheus lessons
  in Cloud & DevOps, and Docker-specific lessons in AI Engineer's MLOps module, couldn't be
  executed against live infrastructure (no Docker daemon running, no cluster, no
  Terraform/Prometheus installed in this authoring environment, confirmed live rather than
  assumed) — those follow this project's existing "doc-grounded, not executed here"
  convention already used for the original Cloud & DevOps content, verified against each
  tool's own official docs instead. Every authored step follows the same bar as the
  original content otherwise: technical steps are
  actually run to get real `expectOutcome` text, not guessed (AI Engineer's steps were
  verified with real installed libraries — transformers, sentence-transformers, FastAPI,
  Pydantic, scikit-learn, joblib — not guessed output); a `troubleshooting` field
  additionally names the most common wrong-but-plausible result and what it means,
  specifically targeting beginners' most common documented frustration (ambiguous errors)
  — not present on every step, only where a real common variant exists (e.g. AI Engineer's
  `aiml-tokens` step flags a real Windows-specific `UnicodeEncodeError` hit and fixed
  during authoring, and `aiml-dockerfile-model-api` flags the classic `--host 127.0.0.1`
  vs `0.0.0.0` unreachable-container mistake). Software Engineer's technical steps
  (Big-O timing, OOP examples, all 8 data structures, all 8 recursion/sorting/DP/heap/
  quicksort/backtracking/greedy lessons, and the caching/load-balancing system-design
  lessons) were each actually executed in Python to verify real numbers before writing
  `expectOutcome` text — e.g. a hand-traced `factorial(3)`, a from-scratch max-heap via
  the negate-on-push trick, a second real coin-change counterexample (`[6,4,1]` making 8:
  greedy gives 3 coins, optimal is 2), and confirming random-pivot quicksort stays fast
  on already-sorted input where first-element-pivot degrades toward O(n²). Full-Stack
  Developer's technical steps were executed for real wherever the tooling exists in this
  environment: plain JS/closures/array-methods/async in Node, TypeScript narrowing/generics
  via actual `tsc` compile errors (not guessed error text), a real Vitest suite (installed
  fresh in a scratch project — 5 tests including a deliberately-broken one to confirm a
  genuine Expected/Received failure diff), a real Express + `cors` server actually serving
  GET/POST requests, and Node's `crypto.scryptSync`/`timingSafeEqual` password hashing. Two
  of the module's own lesson examples (`fs-db-relational-modeling`, `fs-db-sql-queries`)
  embedded "real" live-database query results that had gone stale since those paths were
  later expanded (e.g. claiming Cybersecurity/Data Scientist/Full-Stack had only 3 modules
  each, when the later full-path-rewrite TODO below brought them to 8) — caught by
  re-running the exact same queries live against Supabase during this rollout and finding
  the numbers no longer matched; both lessons' embedded query results were corrected to
  the current live data as part of this pass, not just left stale. What couldn't be
  executed here (a real browser DOM, a real Next.js/React dev server, a real Prisma+SQLite
  migration, a real Playwright browser run, a real cloud deployment) follows the same
  "doc-grounded, not executed here" convention as Cloud & DevOps' Docker/Kubernetes
  content — each such lesson already had real, verified "Actually run" output baked in by
  its original author, which the new steps build on rather than duplicate or guess at.
  Data Scientist's technical steps were executed for real in Python throughout — NumPy/
  SciPy stats (a genuine false-positive p-value found at seed=22 out of 50 tried, matching
  the ~5% rate a hypothesis test accepts by design), real SQLite queries for every SQL/
  pandas variation, matplotlib/seaborn figures actually rendered and saved, and scikit-
  learn/statsmodels runs confirming real, sometimes-surprising results — e.g. adding one
  more extreme planted outlier (500) makes the IQR and z-score outlier-detection methods
  genuinely DISAGREE (IQR still catches all 4 outliers; z-score's own mean/std get dragged
  around by the outlier and it catches only 1), and adding one wildly-scaled extra feature
  before k-means clustering drops the adjusted Rand index from a perfect 1.0 to essentially
  random noise (0.004) unless the data is scaled first — real, measured demonstrations of
  each lesson's own stated point, not just repeated claims. Cybersecurity's technical steps
  were executed for real throughout — the `cryptography` package (RSA sign/verify/encrypt,
  confirming a public-key object genuinely has no `.decrypt` method at the type level), live
  TLS handshakes against real sites (python.org via GlobalSign, github.com via Sectigo — two
  different real CAs, both correctly trusted), SQLite injection payloads (including a real
  `DROP TABLE` attempt safely neutralized by parameterization), a real `bcrypt` install
  showing it's ~300,000x slower per hash than SHA-256 (measured: 190ms for one bcrypt hash
  vs 0.63 microseconds per SHA-256 hash), and a genuine cross-platform finding on the Linux
  permissions lesson: `os.chmod()` was confirmed to silently no-op on this project's native
  Windows dev environment (file stayed `-rw-rw-rw-` regardless of the chmod value) but work
  correctly under WSL Ubuntu (chmod 600 → `-rw-------`, chmod 754 → `-rwxr-xr--`) — this
  exact discrepancy is now the lesson's own troubleshooting note, verified live rather than
  assumed from the lesson's pre-existing warning text. One honest non-clean result was kept
  rather than reworked to look tidier: an SSRF decimal-IP-notation bypass test blocked for
  the *wrong* reason in this environment (a DNS resolution error, not the intended
  is_private/is_loopback check ever firing) — written up as-is, since a real security
  practitioner needs to learn to check *why* a defense blocked something, not just *whether*
  it did.

## Remaining TODOs

Roughly in the order they'd likely matter for actually launching this as a real product:

1. **Payment/checkout — the biggest gap.** `src/app/(app)/pricing/page.tsx` currently has
   an "Unlock Pro (preview)" button that just calls a `grant_pro()` RPC for free — there is
   **no real billing integration at all**. Given the `.co.in` domain, Razorpay is likely
   the more natural fit than Stripe, but that's a decision for whoever picks this up, not
   already decided.
2. ~~**Content breadth for 3 of the 4 newer Pro paths.**~~ **Done.** Full-Stack Developer,
   Data Scientist, and Cybersecurity were each expanded from 3 modules/10-13 lessons to
   8 modules apiece (36/34/30 lessons respectively), matching the depth of AI Engineer
   (10 modules/48 lessons) and Cloud & DevOps (7 modules/53 lessons) — see exact counts
   in the Database Schema section below.
3. ~~**Deployment.**~~ **Done.** Live at `forage-b6qp.vercel.app` and the custom domain
   `forage.co.in`/`www.forage.co.in` (Vercel, auto-deploys `main`). No preview/production
   split by design — a single environment.
4. Stale task-tracker entries referencing superseded early-phase plans exist in this
   session's task list but don't affect the codebase — no code action needed, just noise
   if you're looking at task history for context.
5. **`ScrollHero.tsx`'s pin/tilt effect is disabled** (renders a static layout instead)
   — see "Known bugs" above for the full debugging history and why it needs a
   dedicated, isolated session rather than another incremental attempt.
6. Minor nice-to-haves flagged during the last content audit but explicitly not actioned
   (low priority, listed for completeness): templated-feeling Module-3 "why" phrasing
   repeated near-verbatim across the newer paths; `data-correlation-causation`'s
   partial-correlation demo removes a confounder's effect using the synthetic dataset's
   true generating coefficients rather than OLS-estimated ones, which isn't reproducible
   on real data (a one-line caveat would fix it). Two items previously listed here were
   re-verified during a full content audit and found to be already correct/already
   fixed, not real defects: `cyber-incident-response` already correctly states NIST's
   framework has 4 phases (not 5), and the Data Scientist path already has a solid
   4-lesson `data-visualization` module (`data-viz-choosing-chart-type` through
   `data-viz-mistakes-antipatterns`) — there was no charting gap.
7. ~~**Cloud & DevOps content was wrong, not just thin.**~~ **Fixed.** A full content audit
   found `content/stream1.json` (and the matching live DB rows) held a generic personal
   bootcamp curriculum ("Month 1 — Linux", "Career & Interview Track", "ML Bridge") with
   zero Kubernetes/CI-CD/Terraform/cloud-provider content — confirmed via `git log` to have
   been wrong since this repo's very first commit, not a later regression, so there was no
   historical "correct" version to restore. Rewritten from scratch, module by module, to a
   real curriculum: Linux & the Command Line (9) → Networking Fundamentals for Ops (8) →
   Git & Version Control for Operations (6) → Containers & Docker (7) → CI/CD & Automation
   (8) → Kubernetes & Orchestration (9) → Infrastructure as Code, Cloud Providers &
   Observability + capstone (6) = 53 lessons, same total as before. Every runnable example
   was either actually executed (Linux/bash commands, git branching/merge-conflict/hooks,
   curl/DNS/socket-binding networking checks — all via Git Bash on this Windows dev
   machine) or explicitly labeled "doc-grounded, not executed here" when the environment
   couldn't run it live (no running Docker daemon, no Kubernetes cluster, no Terraform
   install, no real cloud account) — never silently presented as verified when it wasn't.
   All 53 lessons got a matching quiz question synced to the DB (previously only 26 of 53
   lessons had one at all). `npx tsc --noEmit`, `npx eslint`, and a full `npm run build`
   all pass clean after the rewrite; `get_advisors` (security) shows no new findings.
8. ~~**Software Engineer path had real depth gaps for its stated "crack interviews"
   purpose.**~~ **Fixed.** A content audit found: zero OOP content anywhere, missing core
   interview DSA topics (backtracking, greedy, graph algorithms beyond BFS/DFS, tries,
   bit manipulation, quicksort), a real math error in `swe-common-complexities`
   (misexplained why naive Fibonacci's runtime grows ~11x per +5 to n — cited 2⁵=32,
   which is backwards; corrected to the real reason, φ⁵≈11.09), an unflagged O(n²)
   recursion pattern (`lst[0] + sum_list(lst[1:])`) taught as if it were clean O(n) in
   `swe-recursion-basics` (now explicitly flagged, with measured timing showing the real
   quadratic blowup), and the same generic `neetcode.io/roadmap` URL reused as the
   "resource" link for 8 different lessons with a different fake-specific label each time
   (each replaced with a genuinely distinct, individually verified GeeksforGeeks page
   matching its actual topic). Expanded from 4 modules/19 lessons to 5 modules/31 lessons:
   added a new Object-Oriented Programming module (5 lessons: classes/objects,
   inheritance, polymorphism, composition-over-inheritance, common design patterns —
   Singleton/Factory/Strategy), and added tries, graph algorithms II (Dijkstra +
   topological sort), Union-Find, bit manipulation, quicksort, backtracking, and greedy
   algorithms as new lessons in the existing Data Structures and Algorithms modules. Every
   code example was actually executed (Python) to verify its claims, including real
   measured timing demonstrating quicksort's worst case, the O(n²) `sum_list` cost, and
   the greedy coin-change counterexample. `npx tsc --noEmit`, `npx eslint`, and a full
   `npm run build` all pass clean after the expansion.
9. ~~**Smaller audit-flagged content gaps.**~~ **Fixed.** Common Core's Git module now
   mentions Personal Access Token/SSH auth in `cc-git-push` (GitHub stopped accepting
   passwords for `git push` years ago) and gained a new `cc-git-branch` lesson (create,
   switch, commit on, and merge a branch — verified live). Cybersecurity gained a new
   `cyber-cia-aaa` lesson (naming the CIA triad and AAA explicitly, cross-referencing
   mechanisms taught elsewhere in the path) and a new `cyber-net-ddos` lesson (volumetric/
   protocol/application-layer DDoS categories, with a real, safely-executed token-bucket
   rate-limiter as one small defensive example — never a real attack simulation). Data
   Scientist gained two new lessons on algorithm breadth it previously lacked entirely
   (`data-ml-tree-ensembles` — decision trees/random forests/gradient boosting, and
   `data-ml-clustering-pca` — k-means + PCA, both with real scikit-learn results) plus
   `data-sql-window-functions` (ROW_NUMBER/RANK/LAG/CTEs, verified via SQLite, which
   supports the same ANSI window-function syntax as this project's Postgres), and
   `data-ts-stationarity` now explicitly warns that the earlier cross-validation lesson's
   "always shuffle" advice would leak future values into training if applied to
   time-ordered data (the fix is `TimeSeriesSplit`, verified). Content counts updated
   above: Common Core 25 lessons, Cybersecurity 32, Data Scientist 37.
10. **Award XP for completing individual hands-on steps, not just whole lessons.** The
    lesson layout's Practice stage (`HandsOnChecklist.tsx`) has a real per-step
    walkthrough (check off a step, jot what you got, reveal the expected outcome to
    compare against, plus a `troubleshooting` hint where a common wrong-but-plausible
    result exists) — but it's local `useState` only, by design, matching the
    "stay local-only for now" decision, reaffirmed by the project owner when this was
    re-raised mid-rollout. Only the lesson-level `MarkDoneButton` (Test stage) awards
    real XP today. A follow-up would need a new DB table for per-step completion plus a
    rate-limited award RPC (same shape as `tutor_bump_usage`/`post_lesson_comment` —
    `SECURITY DEFINER`, atomic `insert ... on conflict`) and UI to reflect it — not
    started, tracked here per the project owner's explicit ask to keep this idea on the
    list.
11. **Light/dark theme toggle — infra and app-shell/lesson pages done, marketing/complex
    surfaces not yet.** `next-themes` + a full light/dark CSS custom-property token
    system (`src/app/globals.css`) now drive a working toggle (`ThemeToggle.tsx`) —
    system-preference default, remembered per-browser, no flash. Fully converted:
    lesson pages (all streams), the app-shell header/nav, and the auth page. **The
    landing page is deliberately dark-only** (explicit project-owner choice, reversing
    an earlier decision to convert it) — `ThemeToggle` was removed from its header
    entirely, and the page's root wrapper carries a `.force-dark-scope` class
    (`globals.css`) that redeclares the exact same token values as the default `html`
    (dark) block, so it renders correctly dark even for a signed-out visitor whose
    browser already has a stored `light` preference from elsewhere on the site — same
    descendant-custom-property-override mechanism `.lesson-accent-scope` already uses,
    not a JS/hydration-dependent fix. Light mode elsewhere deliberately drops each path's
    neon accent for one calm blue
    (`LIGHT_ACCENT` in `src/lib/pathMeta.ts`, resolved via a CSS custom-property cascade
    in `.lesson-accent-scope`, not JS, so there's no theme-flip flash) and swaps
    headings from Chakra Petch/Unbounded to Inter in light mode only (dark mode
    typography is unchanged) — both per explicit project-owner choice, not a default
    assumption. Syntax-highlighted code blocks use Shiki's dual-theme output
    (`src/lib/highlight.ts`). **Not yet converted**: Interview UI, Quiz runner, profile/
    pricing/legal pages — the toggle works there but those pages' colors don't respond
    yet. Terminal/CLI decorative mockups (`TypingCode.tsx`, `TerminalWalkthrough.tsx`)
    deliberately stay dark in both themes via a `.terminal-surface` utility class — not
    a gap, an intentional convention (a real terminal isn't white-on-white).
12. ~~**`handsOnSteps` rollout across all 7 streams.**~~ **Done.** Every lesson across
    Common Core and all 6 Pro paths (262 lessons total) now has an interactive,
    per-step hands-on checklist authored to this project's real-execution standard —
    see the "Features currently in progress / partially done" section above for the
    full per-path verification detail (what was actually run, what was live-spot-checked
    via Playwright with a real signed-up/Pro-granted QA account per path, and the two
    genuinely stale live-database query results caught and fixed along the way in the
    Full-Stack Developer path's own lesson content). All 5 QA accounts created during
    this rollout were profile/progress-cleaned via SQL; their `auth.users` rows still
    need manual deletion from the Supabase dashboard (see "Things future Claude sessions
    should know" below for the full list).
13. ~~**Post-rollout content audit: missing install steps, no stated aim, landing-page
    light mode.**~~ **Fixed.** A follow-up audit of the just-finished `handsOnSteps`
    rollout, run programmatically (detecting third-party imports in each lesson's code
    examples and cross-checking whether that lesson's own steps ever say to install
    them), found 74 lessons across AI Engineer (37), Data Scientist (30), Full-Stack
    Developer (4), and Cybersecurity (3) that used a package — scikit-learn, FastAPI,
    transformers/sentence-transformers, seaborn, statsmodels, scipy, torch, joblib,
    cryptography, Prisma, Vitest, Express/cors — with zero install instruction anywhere
    in that lesson, meaning a student following the steps literally would hit an
    ImportError/`Cannot find module` on their first real run. Every one of the 74 now
    has an explicit `pip install`/`npm install` step listing exactly the packages that
    specific lesson's code actually imports, added to EVERY lesson that uses a package
    (not just the first lesson per module to introduce it) — deliberately repetitive
    across a module by project-owner choice, so each lesson stays fully self-contained
    even if a student jumps in mid-module. Re-running the same detection script after
    the fix confirms zero remaining gaps. Separately: every lesson's Practice stage now
    opens with a one-line **Aim** (`LessonStepFlow.tsx`, above "Your hands-on task") —
    reusing each lesson's own already-authored `doneWhen` field rather than requiring
    262 new lines of content, so it shipped immediately with no new authoring. And the
    **landing page is now dark-only** by explicit reversal of the earlier light-mode
    conversion — see item #11 above for the `.force-dark-scope` mechanism.
14. ~~**Landing-page bug pass + a new free Common Core module (5 lessons) previewing
    5 of the 6 Pro paths.**~~ **Done.** A live check (this session, prompted by the
    project owner circling the hero dashboard-mockup card and the "how it works"
    terminal card and asking for an intro animation) found a genuine, serious bug in
    `ScrollHero.tsx`: its entrance `gsap.to(...)` used `scrollTrigger: { start: "top
    90%", once: true }`, but that card is always above the fold, so on a fresh page
    load (no scroll event to prompt a recheck) the trigger's already-satisfied state
    was never checked — confirmed live, the card was stuck at `opacity: 0` (genuinely
    invisible) until the page was scrolled away and back. `ScrollTrigger.refresh()`
    did not fix it (refresh recalculates positions, it doesn't retroactively fire enter
    callbacks for non-scrubbed tweens); fixed by dropping the scroll-trigger gate
    entirely and playing the entrance on mount instead, since there's no real "wait for
    scroll" case for an always-visible element. A rotate was added to that same
    entrance tween (the project owner's actual ask), and `TerminalWalkthrough.tsx` got
    a matching Framer `whileInView` rotate-in entrance on its own inner card — applied
    to the inner `.terminal-surface` div, deliberately not wrapping the component's own
    `containerRef` root, so the GSAP `ScrollTrigger` that drives its typing sequence
    keeps measuring an untransformed element (see the transform/containing-block
    lesson under "Architecture decisions"). `ToolkitBento.tsx`'s cards gained a
    hover-tilt to match `HoverTilt`'s existing treatment elsewhere. The landing page's
    other motion (the dock's magnify/drag, `TerminalHeading`'s scroll-scrub + cursor-
    proximity + hover-scramble, `CursorGlow`, `MatrixGlyphs`) was already extensive —
    deliberately not layering on more, to stay restrained rather than gild it further.
    Separately, per the project owner's request for "5 additional technical lessons so
    [free users] get to know what's in the pro versions," added a new 7th Common Core
    module, `cc-preview` — 5 lessons, each borrowed from a different Pro path's real
    toolkit (NumPy/correlation from Data Scientist, a real scikit-learn
    `LogisticRegression` from AI Engineer, a plain-JS render function from Full-Stack,
    `hashlib` password hashing from Cybersecurity, `os.environ` config from Cloud &
    DevOps — Software Engineer deliberately skipped, since Common Core's own
    Programming module already previews that skill set) — all 5 sharing ONE dataset
    (an 8-student "StudyTrack" study-hours/exam-score set) so each lesson visibly
    builds on the last (the Full-Stack lesson renders the exact predictions the AI
    Engineer lesson computed) rather than reading as 5 disconnected demos, per the
    project owner's explicit ask for the lessons to feel "connected." Every code
    example was actually executed — twice, once during authoring and again by
    re-extracting and re-running the exact code stored in the JSON afterward, byte for
    byte, to rule out any transcription error. Synced to the live database via
    `apply_migration` (a new `modules` row, 5 `lessons` rows, 5 `quiz_questions` rows,
    one MCQ per lesson) — `get_advisors` (security) shows no new findings beyond the
    pre-existing baseline. Common Core is now 30 lessons / 7 modules (was 25/6).

## Coding conventions

- **No comments explaining *what* code does** (identifiers should already be clear) —
  comments are reserved for *why*: a non-obvious constraint, a workaround for a specific
  bug, something that would genuinely surprise a reader. This convention is followed
  consistently throughout the existing codebase; match it.
- **No premature abstraction.** Several near-identical patterns (e.g. per-path
  card/tile components) are written as distinct, readable components rather than
  over-generalized into one config-driven mega-component. Keep doing that unless a real
  third or fourth use case demands otherwise.
- **Every new/edited component must be verified live** in a browser (Claude Browser pane,
  `preview_start` against `npm run dev`) before considering the task done — check console
  errors, responsive breakpoints (375/768/1024+), and `prefers-reduced-motion` behavior for
  anything with animation.
- **Every code snippet inside lesson content must actually be executed** (Python via the
  `python` command — not `python3`, which resolves to a broken Windows Store stub alias on
  this machine) before being written into a `content/*.json` file. This isn't optional
  polish; it's the whole point of the content-quality bar this project holds itself to.
- **Motion**: use the shared primitives in `src/components/ui/motion.tsx`
  (`FadeUp`, `Stagger`/`StaggerItem`, `ScrollParallax`, `HoverTilt`, `CountUp`,
  `ProgressRing`, `AnimatedBar`, `DotGridBackdrop`, `HeadingReveal`) rather than writing
  bespoke Framer Motion in a component, unless the effect is genuinely one-off. All of them
  already handle `useReducedMotion()` — don't skip that gate on new motion code. For
  GSAP/ScrollTrigger work, use `src/components/ui/gsapMotion.tsx`'s exported `gsap`/
  `ScrollTrigger`/`SplitText` (already plugin-registered, client-guarded).
- **Never branch a component's top-level return on `useReducedMotion()` alone** if the
  two branches produce structurally different DOM (different root tag, different child
  count) — gate on `useMounted()` (from `src/hooks/useMounted.ts`) first:
  `if (!mounted || reduce) return <staticBranch/>`. See the hydration-mismatch entry
  under "Architecture decisions" for why — this is a real bug class that hit five
  components this session.
- **JSON content files** (`content/*.json`) should be edited carefully — they're large,
  hand-authored files. Validate with `node -e "JSON.parse(require('fs').readFileSync('content/X.json','utf8'))"`
  after every edit. For structural changes (inserting a new module/lesson), a small Node
  script that loads, splices, and re-serializes with `JSON.stringify(data, null, 2)` is
  safer than manual string-editing raw JSON — used successfully for the SWE DSA module
  addition.
- **DB changes go through Supabase MCP tools** (`apply_migration`, `execute_sql`) directly
  against the live project, not a local migrations folder. `apply_migration` for anything
  that changes schema or seeds real data; `execute_sql` for one-off queries/checks.

## Environment variables required

Local `.env.local` (2 vars only, both client-exposed/public by design — Supabase's
anon/publishable key model, not a secret):

```
NEXT_PUBLIC_SUPABASE_URL=<supabase project URL>
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<supabase anon/publishable key>
```

**Not** a Next.js env var, but required for Interview/Tutor to function: a Supabase Edge
Function secret named `LLM_API_KEY`, set via the Supabase dashboard (Edge Functions →
Secrets) or CLI — **its value must be a Groq API key** (`console.groq.com`, free tier, no
card required). This is *not* stored anywhere in this repo and there is no tool available
to Claude that can set it directly (deliberately — API keys should never be entered by an
agent, even into your own project's dashboard). If Interview/Tutor return a 503
`not_configured` error, this secret is missing or wrong.

No `.env.production` or deployment-specific env config exists yet (nothing is deployed).

## Database schema

Project ref `dlnbrjldscazjznkhoyc`. All tables have RLS enabled. Core tables:

| Table | Purpose | Key columns |
|---|---|---|
| `streams` | The 7 top-level tracks (Common Core + 6 paths) | `slug`, `kind` ('core'\|'path'), `access_tier` ('free'\|'pro'), `sort` |
| `modules` | Groups of lessons within a stream | `stream_id`, `slug`, `title`, `why` (blurb, duplicated from content JSON), `sort`, `tier` ('beginner'\|'intermediate'\|'advanced') |
| `lessons` | Navigation/access metadata only — **not** lesson content | `module_id`, `slug` (matches content JSON's topic `id`), `title`, `sort`, `body` (vestigial, always `{}`) |
| `quiz_questions` | Live scored quiz bank | `lesson_id`, `kind` ('mcq'), `prompt`, `options` (jsonb array), `correct_index`, `explanation`, `difficulty` (1-3), `style_tag`, `sort` |
| `quiz_questions_public` | A view (SECURITY DEFINER) hiding `correct_index`/`explanation` from the client before an attempt is submitted | — |
| `profiles` | Per-user state | `user_id`, `xp`, `level`, `streak_days`, `last_active_date`, `plan` ('free'\|'pro'), `chosen_path` |
| `lesson_progress` | Per-user, per-lesson completion + notes | `user_id`, `lesson_id`, `status`, `notes` |
| `quiz_attempts` / `quiz_results` | Quiz-taking history | — |
| `badges` / `user_badges` | Gamification badges | — |
| `tutor_usage` | Rate-limiting for the Tutor edge function | — |
| `interview_sessions` | One row per interview session | `user_id`, `role`, `focus`, `is_trial`, `max_minutes`, `started_at`, `ended_at`, `feedback` (jsonb) |
| `interview_usage` | Daily session count + one-time trial-used flag | `user_id`, `usage_date`, `session_count`, `trial_used` |

**Current content counts** (query `streams`/`modules`/`lessons`/`quiz_questions` to
re-verify, these will drift as content is added):

| Stream | Modules | Lessons | Quiz Qs |
|---|---|---|---|
| Common Core (free) | 7 | 30 | 30 |
| Cloud & DevOps | 7 | 53 | 53 |
| AI Engineer | 10 | 48 | 45 |
| Software Engineer | 5 | 31 | 30 |
| Full-Stack Developer | 8 | 36 | 35 |
| Data Scientist | 8 | 37 | 36 |
| Cybersecurity | 8 | 32 | 30 |

**Postgres functions** (all `SECURITY DEFINER`, check `auth.uid()` internally, callable via
`supabase.rpc(...)` from the client — this is the app's substitute for API routes, see
below): `add_xp`, `append_interview_turn`, `award_badge`, `choose_path`,
`end_interview_session`, `finish_quiz`, `grant_pro`, `handle_new_user`, `has_lesson_access`,
`has_stream_access`, `interview_trial_used`, `mark_lesson_done`, `save_note`,
`start_interview_session`, `submit_answer`, `touch_streak`, `tutor_bump_usage`.

Known advisor warnings (pre-existing, not regressions, not yet triaged): `quiz_questions`
has RLS enabled with no policies (writes only happen via the RPCs above, which are
`SECURITY DEFINER` and bypass RLS by design — likely fine, but worth a deliberate look
before launch); `quiz_questions_public` view uses `SECURITY DEFINER`; several RPCs are
callable by the `anon` role (mostly intentional — e.g. `handle_new_user` must be, since it
fires during signup before a session exists — but worth auditing the full list once before
a real launch); "Leaked Password Protection" is disabled in Supabase Auth settings.

## API routes

**There are none** — no `src/app/api/` directory, no `route.ts` files anywhere. All
client-server communication is one of:
1. Direct Supabase client SDK calls from Server Components (`src/lib/supabase/server.ts`)
   or Client Components (`src/lib/supabase/client.ts`), relying on RLS for access control.
2. Postgres RPC calls (`supabase.rpc("function_name", {...})`) to the functions listed
   above, for anything that needs to run with elevated privilege or atomic multi-table
   logic (XP awards, streak logic, interview session lifecycle, etc.)
3. Two Supabase Edge Functions (Deno), called via `fetch` directly against
   `${NEXT_PUBLIC_SUPABASE_URL}/functions/v1/<name>`, both `verify_jwt: true`:
   - **`tutor`** (v3) — Forage Tutor chat.
   - **`interview`** (v5) — handles 4 distinct request shapes via one endpoint: JSON body
     `{action: "start"}`, `{action: "turn"}`, `{action: "speak", text}` (TTS, returns raw
     `audio/wav` bytes not JSON), and `multipart/form-data` with an `audio` field (STT,
     routed by `Content-Type` header before the JSON body is even parsed). Source of truth
     is `supabase_functions_interview_index.ts` in the repo root — this is a **staging
     copy**, not auto-deployed; changes must be explicitly redeployed via the Supabase MCP
     `deploy_edge_function` tool after editing.

## Important dependencies

- `@supabase/ssr` + `@supabase/supabase-js` — all DB/auth access
- `framer-motion` + `gsap`/`@gsap/react` — all animation (see Coding Conventions and
  the Motion tech-stack entry for the split between the two)
- `lucide-react` — all icons, re-exported through `src/components/ui/icons.tsx`
- `next` 16.2.10 — **breaking changes vs. your training data**, see `AGENTS.md`
- No testing framework is currently installed (no Jest/Vitest/Playwright) — there is no
  automated test suite for this project as of this writing.
- No state-management library (no Redux/Zustand/etc.) — state is Supabase-as-source-of-
  truth + React local state, no client-side global store.

## Known bugs

**`ScrollHero.tsx`'s pin/tilt saga is resolved — this section previously described it
as broken/disabled, which was stale.** The original scroll-PINNED tilt (header+card stay
near the top while the card rotates/scales as the user scrolls past) genuinely never got
working: CSS `position: sticky` never engaged, and a GSAP ScrollTrigger `pin` replacement
still ended up rendering off-screen partway through the scroll range after fixing three
other real bugs along the way. Rather than continuing to chase that specific mechanic,
the component was **redesigned**: the card now gets a one-shot GSAP entrance (scale+fade,
`ScrollTrigger... once: true`) plus a real cursor-tracking 3D tilt on desktop/fine-pointer
devices (rotateX/rotateY mapped to pointer position within the card, plus a moving
specular highlight glow) — see `ScrollHero.tsx`'s own doc comment. This sidesteps the
pin mechanic entirely rather than fixing it, and is a genuinely different, working
design, not a patch. **A real, separate bug was found and fixed in this same component**
during a later session: the entrance's `ScrollTrigger` used `start: "top 90%", once:
true`, which only fires on an actual scroll event crossing that threshold — but this
card is always above the fold, so on a fresh page load (no scroll yet) the trigger's
"already satisfied" state was never checked, leaving the card stuck at its pre-entrance
state (`opacity: 0` — genuinely invisible) until the user scrolled at all. Confirmed live
(computed style stuck at `opacity: 0` on load, then correctly resolving to `1` only after
a scroll-away-and-back). A `ScrollTrigger.refresh()` call after setup did NOT fix it
(refresh recalculates trigger positions, it doesn't retroactively fire enter callbacks
for non-scrubbed tweens). Fixed by dropping the `scrollTrigger` config entirely and just
playing the entrance tween on mount — correct here specifically because this element is
guaranteed visible at page load, so there's no real "wait for scroll" case to handle.
If you add a new scroll-triggered entrance to any OTHER above-the-fold element, don't
copy the old `scrollTrigger`-gated pattern; use a plain mount-triggered tween instead.

A second, smaller lesson from an earlier debugging session on this same component:
**testing scroll-dependent
behavior via repeated `page.goto()` calls in one long-lived Playwright browser tab
produced misleading, inconsistent results** (the same exact code measured differently
across runs). Closing the tab and opening a genuinely fresh one before each test
produced consistent, trustworthy results — do this for any future scroll/GSAP debugging
in this project, don't trust numbers from a tab that's been navigated many times.

Older bugs, already fixed and worth not reintroducing: the `ResizeObserver`/
`scrollIntoView` page-jump bug in `ValuePropsCarousel.tsx`, a horizontal-scroll leak
from the landing page's CSS marquee, and a proxy/middleware gap where `/interview`
wasn't in the protected-routes list (unauthenticated visits could crash instead of
redirecting to `/auth`) — all described in more detail under "Architecture decisions"
above.

## Things future Claude sessions should know

- **The `foundry`/`foundary` folder-name collision is the single most important thing to
  get right.** Re-read the constraint at the top of this file before any destructive or
  broad-scope action.
- **Never enter API keys, passwords, or secrets into any tool, form, or dashboard on the
  user's behalf** — this includes Supabase's own secrets UI. If a secret needs to be set,
  give the user the exact steps and let them do it. This was tested and enforced multiple
  times this session (a classifier blocked attempts to reset an `auth.users` password hash
  and to set a secret via raw SQL) — don't try to route around it via a different tool if
  it happens again.
- **Claude cannot sign in to the app itself**, with one narrow, explicit exception (see
  below). Absent that exception, there's no credential Claude has (and shouldn't try to
  obtain) to click through authenticated flows live. Live verification of anything behind
  auth (interview sessions, Pro-tier UI, quiz-taking) has to be done by asking the user to
  test it and report back, or by careful code-level/DB-level verification instead. Don't
  claim something is "verified live" if it only means "the code compiles and the DB rows
  look right."
  - **Exception, automated QA only**: with the Playwright MCP browser tool configured
    (`.mcp.json`, `playwright` entry), Claude may sign into the app using credentials for
    a **dedicated test/QA account** (never the project owner's real account) that the
    user supplies **in chat, at the time of testing** — never written to any file, env
    var, or committed anywhere. Scoped strictly to automated UX/QA verification (browsing
    pages, clicking through flows, checking console/network output); it does not extend
    to production data changes, payments, or any destructive action inside the
    authenticated app without separately asking first. The no-secrets-in-files rule below
    is unaffected by this exception — it still applies in full.
- **A git remote is configured** (`origin` → `github.com/iniyane52/forage.git`) and
  `main` auto-deploys to Vercel on push — check `git status`/`git log -1` before
  assuming recent work is committed, but don't assume "no remote" as an older version
  of this file once claimed; that was corrected once uncommitted work was pushed
  earlier in this project's history.
- **This Claude Browser pane's `document.hidden` can report `true` even when you've just
  called `tabs_select` to front the tab** — this breaks anything gated on Page Visibility
  (e.g. `requestAnimationFrame`-based animations like `CountUp` won't run). Don't conclude
  a feature is broken from that alone; it was independently confirmed working via a direct
  screenshot earlier in the same session when this was hit.
- **`preview_start` on this project always serves port 3005**, and `resize_window` with
  large custom width/height values (e.g. 1280×900+) has occasionally produced corrupted/
  black screenshots in this environment — if that happens, try a genuinely fresh tab
  (`tabs_create`) rather than debugging the existing one, that resolved it every time it
  came up.
- **`python3` is broken on this machine** (resolves to a Windows Store stub that errors) —
  use plain `python` for any code-execution verification.
- Bash tool's working directory can silently drift to the parent `C:\claude` instead of
  `C:\claude\foundary` between calls — if `npx tsc`/`npx eslint` suddenly can't find the
  local binaries, check `pwd` first rather than assuming the tool is broken.
- **A real Ubuntu WSL distro is installed on this dev machine** (confirmed via `wsl.exe -l
  -v`) — genuinely useful for verifying any Linux-specific behavior (file permissions,
  POSIX-only tools) that native Windows can't correctly demonstrate, rather than just
  noting the limitation and moving on. Used successfully to verify the Cybersecurity
  path's Linux-permissions lesson (`os.chmod()` has zero real effect on native Windows
  NTFS, but works correctly under `wsl.exe -d Ubuntu -- bash -c "python3 ..."`).
- **`bcrypt` was installed globally via pip** (`pip install bcrypt`, now v5.0.0) during
  the Cybersecurity content-authoring pass, to actually measure its hashing speed
  against SHA-256 rather than leave that lesson's bcrypt example unexecuted/illustrative
  like it originally was — this is a real, permanent change to this machine's global
  Python environment, not scoped to a virtualenv; harmless (bcrypt is a small, common
  package) but worth knowing if a future session is surprised to find it already present.
- **Accumulated QA accounts needing manual deletion from the Supabase Auth dashboard**
  (Authentication → Users) — Claude cannot delete `auth.users` rows itself (blocked by
  a safety classifier every time it's tried); `public.profiles`/`public.lesson_progress`
  rows for each were already cleaned up via SQL, only the actual auth account remains:
  `forage-qa-claude-20260806@example.com`, `forage-qa-theme-check@example.com`,
  `forage-qa-prolesson-check@example.com`, `forage-qa-clouddevops-check@example.com`,
  `forage-qa-aiml-verify@example.com`, `forage-qa-swe-verify@example.com`,
  `forage-qa-fs-verify@example.com`, `forage-qa-data-verify@example.com`,
  `forage-qa-cyber-verify@example.com`.

## Suggested next steps

Roughly in priority order for someone picking this up fresh — most of the earlier list
here (get work into git, content breadth for the 3 thin paths, deployment, the RLS/RPC
security pass) is now **done**; what's left:

1. **Decide on and build real payment/checkout** (see Remaining TODOs #1) — this is the
   single biggest thing standing between this project and being a real, launchable SaaS.
   Deferred multiple times by the project owner so far; not yet started.
2. **Enable Leaked Password Protection** in the Supabase Auth dashboard (Authentication →
   Providers/Policies) — the one remaining item from the security pass, a manual toggle
   with no MCP tool access, so it needs a human to click it.
3. A live Playwright/QA audit (this session) fixed a batch of real UX/accessibility bugs
   (interview network-failure handling, mobile nav reachability, aria-live gaps, quiz/
   lesson error-swallowing, etc.) — see git log for `Fix UX/QA/accessibility gaps...` for
   the full list. A couple of lower-priority items from that audit were explicitly left
   for later: none blocking, listed in that commit's message.
4. A custom domain (`forage.co.in`) is not yet purchased — optional, no urgency.
5. ~~**Debug and fix `ScrollHero.tsx`'s pin/tilt effect.**~~ **Resolved, via redesign
   not repair.** The pin mechanic itself was abandoned (see "Known bugs" for the full
   history of both failed attempts) in favor of a one-shot entrance + cursor-tracking
   3D tilt, which works. A separate, real bug in that redesign (the entrance staying
   invisible on a fresh page load — see "Known bugs") was found and fixed in a later
   session.
6. Google OAuth: the "Continue with Google" button and `/auth/callback` route exist and
   are wired correctly, but the Google Cloud OAuth credentials and the Supabase
   dashboard provider toggle are the user's own tasks (external credentials, can't be
   done on their behalf) — confirm these are done before assuming Google sign-in works
   end-to-end.
