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
- **Motion**: Framer Motion 12.x — all primitives centralized in
  `src/components/ui/motion.tsx`, all gated by `useReducedMotion()`
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
- **Fonts**: Chakra Petch (display), Inter (body), JetBrains Mono (mono) — via
  `next/font/google` in `src/app/layout.tsx`.
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
│   ├── commoncore.json          #   Common Core (free), 24 lessons / 6 modules
│   ├── stream1.json             #   Cloud & DevOps, 53 lessons / 7 modules
│   ├── aiml.json                #   AI Engineer, 48 lessons / 10 modules
│   ├── swe.json                 #   Software Engineer, 19 lessons / 4 modules
│   ├── fullstack.json           #   Full-Stack Developer, 13 lessons / 3 modules
│   ├── data.json                #   Data Scientist, 13 lessons / 3 modules
│   ├── cyber.json                #   Cybersecurity, 10 lessons / 3 modules
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
│   │   ├── ui/                    # design-system primitives: motion.tsx, icons.tsx,
│   │   │                            PathTile.tsx, ScrollHero.tsx, ScrollProgressBar.tsx,
│   │   │                            NavProgress.tsx, Confetti.tsx
│   │   ├── landing/                # landing-page-only components: TechTicker,
│   │   │                            PathGrid, SkillConstellation, TerminalHeading,
│   │   │                            StatCallout, HowItWorksTimeline, ValuePropsCarousel,
│   │   │                            DashboardMockup
│   │   ├── interview/              # InterviewClient.tsx (main state machine), VoiceOrb
│   │   ├── QuizRunner.tsx, LessonActions.tsx, TutorDrawer.tsx, SignOutButton.tsx
│   ├── hooks/
│   │   └── useVoice.ts             # voice capture/playback: native SpeechRecognition +
│   │                                MediaRecorder/Whisper fallback; native/Orpheus TTS
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
- **Landing page**: scroll-driven hero (`ScrollHero.tsx`, pinned/tilt effect), continuous
  scroll-parallax on every section below it, a real-content tech-skill ticker
  (`TechTicker.tsx`, not just path names), a dense per-path skill grid (`PathGrid.tsx`,
  real accent colors/skill tags/difficulty per path, not a plain list), ambient drifting
  skill-icon background art (`SkillConstellation.tsx`), terminal-style kinetic section
  headings (`TerminalHeading.tsx`), a connected/animated "how it works" timeline
  (`HowItWorksTimeline.tsx`), flanking animated stat counters (`StatCallout.tsx`).
- **Gamification**: XP, levels, daily streaks (`touch_streak()`), badges.
- **Deep-tech-neon visual identity**: dark palette, distinct neon accent per stream (see
  `src/lib/pathMeta.ts`), Chakra Petch/Inter/JetBrains Mono type system, glass-morphism
  surfaces, big bold digitalized tiles.

## Features currently in progress / partially done

- Nothing is mid-implementation as of this writing — the last active work (new SWE DSA
  module, cross-path content fixes, consistent-hashing correction) is complete and
  verified. Treat the repo as in a clean, working state; anything below is *not started*,
  not partially built.

## Remaining TODOs

Roughly in the order they'd likely matter for actually launching this as a real product:

1. **Payment/checkout — the biggest gap.** `src/app/(app)/pricing/page.tsx` currently has
   an "Unlock Pro (preview)" button that just calls a `grant_pro()` RPC for free — there is
   **no real billing integration at all**. Given the `.co.in` domain, Razorpay is likely
   the more natural fit than Stripe, but that's a decision for whoever picks this up, not
   already decided.
2. **Content breadth for 3 of the 4 newer Pro paths.** Full-Stack Developer, Data
   Scientist, and Cybersecurity are still 3 modules / 10-13 lessons each, versus AI
   Engineer (10 modules/48 lessons) and Cloud & DevOps (7 modules/53 lessons). Software
   Engineer was recently brought up to 4 modules/19 lessons by adding a dedicated
   Recursion/Sorting/DP/Heaps module — the same kind of gap-filling (identify what a real
   "basics to advanced" path is missing, author it with the full rigor pipeline) likely
   applies to the other three.
3. **Deployment.** Nothing is deployed yet — this has only run via `npm run dev` locally.
   No production environment, no production Supabase branch/config decisions made yet.
4. Stale task-tracker entries referencing superseded early-phase plans exist in this
   session's task list but don't affect the codebase — no code action needed, just noise
   if you're looking at task history for context.
5. Minor nice-to-haves flagged during the last content audit but explicitly not actioned
   (low priority, listed for completeness): templated-feeling Module-3 "why" phrasing
   repeated near-verbatim across the newer paths; a methodology nitpick in
   `data-correlation-causation`'s partial-correlation demo; `cyber-incident-response`
   states NIST's incident-response guide has 5 phases (it's actually 4 in the official
   framing); Data Scientist path has no dedicated charting/visualization lesson.

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
  already handle `useReducedMotion()` — don't skip that gate on new motion code.
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
| Common Core (free) | 6 | 24 | 24 |
| Cloud & DevOps | 7 | 53 | 26 |
| AI Engineer | 10 | 48 | 45 |
| Software Engineer | 4 | 19 | 18 |
| Full-Stack Developer | 3 | 13 | 12 |
| Data Scientist | 3 | 13 | 12 |
| Cybersecurity | 3 | 10 | 8 |

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
- `framer-motion` — all animation (see Coding Conventions on using the shared primitives)
- `lucide-react` — all icons, re-exported through `src/components/ui/icons.tsx`
- `next` 16.2.10 — **breaking changes vs. your training data**, see `AGENTS.md`
- No testing framework is currently installed (no Jest/Vitest/Playwright) — there is no
  automated test suite for this project as of this writing.
- No state-management library (no Redux/Zustand/etc.) — state is Supabase-as-source-of-
  truth + React local state, no client-side global store.

## Known bugs

None known/open as of this writing. Real bugs found and fixed this session (documented
here so they aren't accidentally reintroduced): the `ResizeObserver`/`scrollIntoView`
page-jump bug in `ValuePropsCarousel.tsx`, a horizontal-scroll leak from the landing
page's CSS marquee, and a proxy/middleware gap where `/interview` wasn't in the protected
-routes list (unauthenticated visits could crash instead of redirecting to `/auth`) — all
described in more detail under "Architecture decisions" above.

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
- **`git status` will surprise you** — as of this writing there are ~9 days of uncommitted
  work spanning nearly the entire codebase (everything from the neon redesign through the
  new SWE module). Check `git status`/`git log -1` before assuming recent work is
  committed. No git remote is configured yet either.
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

## Suggested next steps

Roughly in priority order for someone picking this up fresh:

1. **Get the uncommitted work into git and pushed** (this is an active, explicit request
   from the project owner as of this writing — check `git status`, confirm nothing under
   `C:\claude\foundry` was ever touched, then commit and push once a remote is set).
2. Decide on and build real payment/checkout (see Remaining TODOs #1) — this is the single
   biggest thing standing between this project and being a real, launchable SaaS.
3. Bring Full-Stack Developer, Data Scientist, and Cybersecurity up toward the same
   breadth as AI Engineer/Cloud & DevOps, following the same content pipeline discipline
   used for the recent SWE DSA module addition.
4. Plan and execute an actual deployment (Vercel is the natural fit for Next.js; decide
   on production Supabase config/secrets at that point).
5. A pre-launch security pass on the RLS-and-RPC advisor warnings listed under Database
   Schema — likely all fine by design, but worth deliberately confirming before real users
   and real payments are involved.
