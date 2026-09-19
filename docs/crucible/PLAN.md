# CRUCIBLE — AI Mock Interview Evaluator
### Intense build plan: infrastructure, deployment, frontend, and hackathon strategy

---

## Context

You want a standalone **AI Mock Interview Evaluator** — a new product, not a feature of Forage — built for a **short hackathon (24–48h build window, solo builder, live judging slot)** on a **₹0 / free-tier-only** budget, differentiated on **four pillars plus a live camera feed**:

1. Rigorous evidence-linked evaluation & scoring
2. Resume + JD grounded interviews
3. Live coding / technical depth
4. Multimodal delivery analysis (+ camera feed of the candidate)

You already own `github.com/iniyane52/forage`, which contains a **working voice mock-interview system** (Groq chat + Whisper STT + Orpheus TTS, a `useVoice` hook with browser/network fallbacks, server-enforced session caps, a feedback-JSON generator with retry+validation). That code is proven, debugged, and yours — it is the single biggest head start available and the plan treats it as a **parts bin to port from**, not a codebase to extend.

**Intended outcome:** a deployed, working product at a public URL within the first 2 hours, extended in demoable 3-hour increments, that survives a live demo on venue wifi and reads well as a repo.

---

## The honest scoping call (read this before anything else)

Four deep pillars + camera in 24–48 hours solo is **not** buildable at full depth. Normal estimate is ~3 weeks. I am not going to quietly cut your scope — but I am going to tell you the one architectural decision that makes all five *actually fit*:

> **Push the expensive work into the browser.**
> Camera analysis runs on-device (MediaPipe WASM). Code execution runs on-device (Pyodide WASM). Resume parsing runs on-device (pdf.js). PDF export runs on-device (print stylesheet).
> The only thing that touches a paid API is **text**.

That single decision is why this is feasible, why it costs ₹0, and why it's *more* impressive to judges rather than less — "your video never leaves your device" is a real privacy story, not a compromise.

The second reality: **you will not finish all four at equal depth.** So the build order below is ranked by *demo impact per hour*, and every 3-hour checkpoint ends in a deployed, demoable state. If the clock kills you at hour 14, what's deployed is a complete product, not a broken one.

---

## Hard constraint discovered during research: the token budget

Groq free tier, verified:

| Model | RPM | **Requests/day** | TPM | **Tokens/day** |
|---|---|---|---|---|
| `llama-3.3-70b-versatile` | 30 | 1,000 | 12K | **100K** |
| `llama-3.1-8b-instant` | 30 | 14,400 | 6K | ~500K |
| `whisper-large-v3-turbo` | 20 | 2,000 | — | 28,800 audio-sec/day |

Limits are **per organization, not per API key** — extra keys do not multiply quota.

**100K tokens/day on the 70B model is roughly 4 complete interviews.** You will burn that in rehearsal alone before judges ever see it. This is the most likely way your demo dies.

**Mitigation, baked into the architecture:**

- **Model routing.** Interviewer turns (high volume, low stakes) → `llama-3.1-8b-instant`. The single evaluation pass (low volume, high stakes — this is the product) → `llama-3.3-70b-versatile`. Resume/JD extraction → 8b.
- **Sliding-window history.** Send last 6 turns verbatim + a running one-paragraph summary of earlier turns, not the full transcript every call. Cuts per-turn tokens ~60%.
- **Provider adapter layer** (`src/lib/ai/provider.ts`) with a `GROQ` / `GEMINI` switch. Google AI Studio's free tier is a genuinely independent quota pool. Wire the interface on hour 3; implement the second provider only if you hit a wall. **Do not hardcode Groq's SDK shape into feature code.**
- **Demo mode** (below) — rehearse against cached fixtures, not live APIs.

---

## Product definition

**Working name: Crucible** — *a severe test; the vessel where metal is proven.* Alternatives if you want a different flavour: **Anvil**, **Verdict**, **Panel**, **Proofpoint**. Name is a one-line change; don't spend hackathon minutes on it.

**One-line pitch:**
> *Crucible runs a real voice interview grounded in your actual resume and a real job description, watches how you deliver it, and returns a hiring-manager-grade scorecard where every score cites the exact sentence you said.*

**The wedge vs. every other mock-interview tool:** competitors give you vague encouragement ("great job, be more specific!"). Crucible gives you a **rubric-scored, evidence-cited verdict** you could hand to a hiring manager — and it can tell you which claims on your resume you failed to substantiate.

---

## Architecture

### Stack (all free tier)

| Layer | Choice | Why |
|---|---|---|
| Frontend | Next.js 16 (App Router), React 19, TypeScript strict, Tailwind v4 | Mirrors Forage exactly — zero learning curve at 3am |
| Hosting | Vercel Hobby | Free, auto-deploy on `main`, you've done it before |
| DB / Auth / Storage | Supabase free (new project) | Postgres + RLS + Auth + Storage + Deno Edge Functions in one |
| LLM | Groq (`8b-instant` + `70b-versatile`), Gemini adapter as failover | Fast, free, already proven in your code |
| STT | Browser `SpeechRecognition` → Groq Whisper fallback | Free; port `useVoice.ts` wholesale |
| TTS | Groq Orpheus → browser `speechSynthesis` fallback | Free; already has graceful degradation |
| **Face / delivery** | **`@mediapipe/tasks-vision` FaceLandmarker (WASM, on-device)** | **478 landmarks + 52 ARKit blendshapes + 4×4 head-pose matrix. Zero API cost.** |
| **Code execution** | **Pyodide (Python in WASM, Web Worker)** | **Zero backend, zero cost, no Judge0 rate limits** |
| Editor | CodeMirror 6 | MIT, lightweight, fast to wire |
| Resume parsing | `pdfjs-dist` in-browser | No upload needed for MVP |
| Charts | Hand-rolled SVG + your existing `AnimatedBar` / `ProgressRing` | Avoids a chart-lib dependency at 3am |

### Request topology

There is **one Edge Function** (`interview`), multiplexed by action — the exact pattern already proven in `supabase_functions_interview_index.ts`:

```
POST /functions/v1/interview
  multipart/form-data  + audio    → Whisper STT      → { text }
  { action: "speak", text }       → Orpheus TTS      → raw audio/wav bytes
  { action: "start",  ... }       → session + Q1     → { sessionId, question, ... }
  { action: "turn",   ... }       → next question    → { question } | { verdict }
  { action: "prep",   resume,jd } → structured JSON  → { ResumeProfile, JDSpec, gapMatrix }
  { action: "evaluate", sessionId}→ 70B eval pass    → { Verdict }
```

Everything else is Supabase SDK calls from Server Components under RLS, plus `SECURITY DEFINER` RPCs for anything privileged — no `src/app/api/` layer, matching your existing mental model.

### The design that makes this defensible: two-agent separation

```
 ┌─────────────────┐                      ┌──────────────────┐
 │  INTERVIEWER    │   never sees rubric  │    EVALUATOR     │
 │  llama-3.1-8b   │   never scores       │  llama-3.3-70b   │
 ├─────────────────┤                      ├──────────────────┤
 │ role + persona  │                      │ full transcript  │
 │ JD requirements │  ──── transcript ──► │  + turn indices  │
 │ resume claims   │       telemetry      │  + timestamps    │
 │ last 6 turns    │       code+tests     │ delivery numbers │
 │ code snapshots  │                      │ code + testpass  │
 └─────────────────┘                      │ rubric (from DB) │
                                          └──────────────────┘
                                                   │
                                          schema-validated JSON
                                          with EVIDENCE CITATIONS
```

**Say this to judges verbatim:** *"The interviewer and the judge are different models with different context. The interviewer physically cannot inflate its own grade — it never sees the rubric."*

Two more methodology details that cost ~20 minutes each and make the evaluation look rigorous rather than vibes-based:

1. **The weighted total is computed in TypeScript**, never asked of the LLM. LLMs do arithmetic badly; judges who know that will check. You compute `Σ(score × weight) / Σ(weight)` in code.
2. **Evidence is mandatory and validated.** A competency score with an empty `evidence[]` array fails schema validation and triggers a retry. The model cannot hand-wave.

### Evaluation schema (the core artifact)

```ts
type Evidence = { turn: number; tStartMs: number; quote: string };

type CompetencyScore = {
  competency: string;          // from rubric_competencies table
  score: 1 | 2 | 3 | 4 | 5;
  level_descriptor: string;    // the rubric row it matched
  evidence: Evidence[];        // >= 1 REQUIRED, schema-validated
  rationale: string;
  improvement: string;         // one concrete, actionable next step
};

type Verdict = {
  competencies: CompetencyScore[];
  weighted_total: number;      // computed in TS, NOT by the model
  recommendation: "strong_no" | "no" | "lean_no" | "lean_yes" | "yes" | "strong_yes";
  jd_gap: { requirement: string; status: "demonstrated" | "partial" | "missing"; evidence?: Evidence }[];
  resume_claims: { claim: string; substantiated: boolean; note: string }[];
  delivery: { metric: string; value: number; unit: string; interpretation: string }[];
  model_answers: { turn: number; answer: string }[];
  integrity: { tab_switches: number; face_absent_pct: number; multiple_faces: boolean };
};
```

**Rubric lives in the database as rows, not in a prompt string.** A `rubrics` + `rubric_competencies` table with weights and `level_1..level_5` descriptors, assembled into the prompt at call time. This lets you tell judges: *"we can load a company's actual hiring rubric — the scoring logic is data, not hardcoded."*

### Delivery telemetry — 100% on-device

Runs in a **Web Worker** at ~10fps so it never blocks the interview UI.

**From MediaPipe FaceLandmarker** (478 landmarks, 52 blendshapes, head-pose matrix):
- `eye_contact_pct` — head yaw/pitch within a calibrated cone
- `face_present_pct` — candidate in frame
- `multiple_faces` — integrity signal
- `blink_rate_per_min`, `smile_ratio` — from blendshape coefficients
- `head_stability` — variance of yaw/pitch (fidget detection)

**From Web Audio `AnalyserNode` + transcript:**
- `wpm` — words ÷ speaking duration
- `pause_count`, `longest_pause_ms`
- `filler_rate` — regex over transcript (`um, uh, like, you know, basically, actually, I mean, sort of`)
- `energy_variance` — monotone detection from RMS envelope

**From the page:** `tab_switches` (`visibilitychange`), `window_blur_count`.

Aggregated to **~15 numbers per session** (plus per-turn rollups). Those numbers — never video, never audio — are what reach the DB and the evaluator prompt.

### Live camera HUD (your highest visual-impact-per-hour feature)

Picture-in-picture self-view with a live-updating overlay:
- Eye-contact bar filling/draining in real time
- Pace gauge (green zone 130–160 wpm)
- Filler counter ticking up as you say "um"
- A subtle ring around the self-view that goes amber when you leave frame

This is the thing judges *look at* while you talk. Build it early; it sells the whole product silently.

---

## Data model (Supabase, new project)

```
profiles          user_id, display_name, plan, created_at
rubrics           id, name, role_family, is_default
rubric_competencies  rubric_id, key, label, weight, level_1..level_5   ← rubric as DATA
interview_sessions   id, user_id, role, persona, rounds[], jd_spec jsonb,
                     resume_profile jsonb, gap_matrix jsonb,
                     started_at, ended_at, max_minutes, status
interview_turns      session_id, idx, speaker, text, t_start_ms, t_end_ms
delivery_metrics     session_id, turn_idx (nullable = session rollup), metrics jsonb
code_artifacts       session_id, problem_id, final_code, test_results jsonb,
                     snapshots jsonb           ← the solve timeline
verdicts             session_id, payload jsonb (Verdict), weighted_total,
                     recommendation, created_at
share_links          slug, session_id, expires_at    ← public read-only report
```

RLS on every table (`auth.uid() = user_id`, joined through `session_id` where needed). `share_links` gets a `SECURITY DEFINER` read RPC so a public slug can fetch one verdict without exposing the table.

**Schema goes live via Supabase MCP `apply_migration`** — but *unlike Forage*, **commit the SQL to `supabase/migrations/` in the repo too.** Judges read repos; a repo with no schema is a repo with no backend as far as they can tell. This costs you 5 minutes and is worth it.

---

## Feature inventory

### The five pillars (committed)

| # | Pillar | Depth at 24h | Depth at 48h |
|---|---|---|---|
| 1 | Evidence-linked rubric scoring | Full — this is the product | + score-trend across sessions |
| 2 | Camera + delivery analysis | Full — on-device, live HUD | + per-turn delivery timeline |
| 3 | Resume + JD grounding | Real — extraction + gap matrix + targeted probes | + claim-substantiation verdict |
| 4 | Live coding round | Working — CodeMirror + Pyodide + hidden tests | + AI interjections on snapshots |
| 5 | Voice interview core | Full — ported from Forage | + personas, adaptive difficulty |

### Enhancement features — ranked by (judge impact ÷ build hours)

**Tier A — build these, they're nearly free:**
1. **Clickable evidence** — click a score's quote → transcript scrolls to that turn and highlights it. ~40 min. *This is the single most convincing interaction in the product.*
2. **Integrity / proctoring panel** — tab switches, face-absent %, multiple faces detected. The camera is already running; this is ~30 min of reading numbers you already have.
3. **Interviewer personas** — *Friendly HR* / *Skeptical Staff Engineer* / *Time-pressured Founder*. One prompt variable, ~20 min, feels like three products.
4. **Resume-claim substantiation matrix** — "You claimed *led migration to microservices*; you could not explain the service boundaries." ~45 min. Genuinely novel; nobody else does this.
5. **Shareable read-only report link** — `/r/[slug]`. ~40 min. Viral mechanic *and* your demo fallback if live auth breaks.
6. **PDF export** — a `@media print` stylesheet + `window.print()`. ~30 min. Judges love a tangible artifact.
7. **Text-only accessibility mode** — no mic required. ~30 min, and it **doubles as your demo insurance** if the venue mic fails.

**Tier B — if time survives:**
8. **Adaptive difficulty** — a cheap 8b mini-pass after each answer nudges the next question harder/easier. Sells "adaptive" hard.
9. **Score-trend chart** across sessions — proves improvement, implies retention.
10. **Company-flavoured rubrics** — pick *Amazon-style LP behavioral* vs *Google-style*; it's just a different `rubrics` row.
11. **"What a strong answer sounds like"** — model answer per weak turn, with TTS playback.
12. **Panel mode** — two interviewer personas alternating. One prompt variable, disproportionate wow.

**Tier C — explicitly DEFERRED (say "out of scope" confidently if asked):**
- Payments/billing — actively wastes hackathon hours, judges don't score it
- Identity verification / real proctoring ML
- Speech-emotion-recognition models
- Fine-tuning anything
- pgvector semantic search — direct LLM matching is sufficient at this scale
- Mobile native app

---

## Three feasible options (pick by how the clock actually goes)

### Option A — "Evaluator-first" ⭐ RECOMMENDED
Lead with scoring rigor + camera. Coding round is present but simple (one problem, run-tests, no AI interjection). Resume/JD real but lightweight.
**Fits:** 24h. **Risk:** low. **Pitch:** *"Every other tool gives you vibes. We give you a defensible scorecard."*

### Option B — "Full five pillars, thinner each"
All five at demo depth, nothing at production depth. Widest feature surface, highest chance one breaks live.
**Fits:** 48h. **Risk:** medium-high. **Pitch:** *"An end-to-end hiring simulator."*

### Option C — "Camera-led"
Lead with multimodal delivery analysis as the hero; scoring supports it. Most visually spectacular, least technically deep.
**Fits:** 24h. **Risk:** low. **Pitch:** *"We don't just hear your answer, we see how you deliver it."*

**Take Option A.** It has the strongest moat, the clearest story, degrades most gracefully, and the camera HUD still gives you Option C's visual punch for free.

---

## Build order — 24h critical path

> **Iron rule: deploy at hour 2, then commit + deploy at every checkpoint. If the clock kills you at hour N, whatever is on `main` is your submission.**

| Hours | Checkpoint | Demoable state at the end |
|---|---|---|
| **0–2** | **Foundation & deploy** — `create-next-app`, port `globals.css` tokens + `motion.tsx` + `icons.tsx` from Forage, new Supabase project, auth (email + Google), `proxy.ts` with `PROTECTED`, **push to Vercel, get a live URL** | A deployed site you can sign into |
| **2–5** | **Voice interview core** — port `useVoice.ts` + the `interview` edge function wholesale; provider adapter with model routing; sliding-window history; `interview_sessions` + `interview_turns` | **A working voice interview.** This alone is a demo. |
| **5–8** | **Camera + delivery HUD** — MediaPipe worker, PiP self-view, live eye-contact/pace/filler gauges, telemetry rollup to DB | The visual hero shot works |
| **8–11** | **Evaluator + report page** — rubric tables seeded, 70B eval pass, schema validation + retry, evidence-linked report UI with click-to-transcript | **The actual product exists end-to-end** |
| **11–14** | **Resume + JD** — pdf.js parse, extraction calls, gap matrix, targeted probes injected into interviewer prompt | The differentiator judges remember |
| **14–17** | **Coding round** — CodeMirror + Pyodide worker, 6-problem bank with hidden tests, results into the verdict | Technical depth proven |
| **17–20** | **Demo mode + polish** — seeded session, cached fixtures, `?demo=1`, share links, PDF export, empty/error states, mobile check | **Demo-proof** |
| **20–24** | **Buffer / README / architecture diagram / slides / rehearse 5×** | Submission-ready |

**Hours 24–48 (if you have them):** Tier B features, per-turn delivery timeline, adaptive difficulty, score trends, a proper landing page, a recorded backup video.

### Parallelizable hand-offs for your teammates (non-code)
Rubric text (5 competencies × 5 level descriptors), the 6 coding problems + test cases, README + architecture diagram, pitch slides, demo script, recorded backup video, a sample resume + JD pair for the demo.

---

## Demo-day insurance (do not skip — this is your 1-hour judging slot)

The three things that kill live AI demos, and the fix for each:

1. **Venue wifi dies / API is slow.**
   → `DEMO_MODE` env flag. A fully seeded completed session with a real pre-generated verdict, reachable at `/r/demo-slug` with no auth. Your report page *always* renders.

2. **Quota exhausted from rehearsal.**
   → Rehearse against fixtures, not live APIs (`NEXT_PUBLIC_USE_FIXTURES=1`). Reserve real quota for the judging window. Provider adapter lets you flip to Gemini in one env var.

3. **Mic/camera permission denied on the venue laptop.**
   → Text-only mode (Tier A #7) is a first-class path, not an error state. Camera absence degrades to "delivery analysis unavailable", never a crash.

**Also prepare:** a 90-second recorded screen capture of the full happy path, embedded in the README. If everything fails, you play the video and talk over it — and you still have a live URL judges can open themselves afterwards.

**Rehearse the 3-minute run exactly 5 times.** Script it: pitch (20s) → live interview 2 questions (60s) → camera HUD callout (20s) → coding round glimpse (30s) → **the report page, click an evidence quote** (50s) → close on the two-agent separation line (20s).

---

## Claude Code vs. Antigravity — my recommendation

**Use Claude Code (here) as primary. Keep Antigravity as a failover, not a co-pilot.**

**Why Claude Code wins for *this specific* job:**
- The MCP servers you need are already wired: **Supabase** (`apply_migration`, `deploy_edge_function` — schema and Deno functions deployed straight from chat), **Vercel** (deploy, env vars, runtime logs), **GitHub**, **Playwright** (live browser QA). In a 24-hour sprint, *infra friction is what kills you* — not code generation. Being able to say "apply this migration and deploy the edge function" and have it happen is worth hours.
- This session already has the Forage repo, which is your parts bin for the voice stack.
- Strong at long multi-file surgery — porting `useVoice.ts` + the edge function into a new repo is exactly that shape.

**Where Antigravity genuinely helps:**
- **Usage-limit insurance.** A 24–48h sprint on Claude Pro can hit limits. A second agent environment on an independent quota is real protection — and hitting a wall at hour 16 with no fallback is a project-ending event.
- Its browser-preview agent loop is pleasant for CSS/visual iteration.

**The rule if you run both:** never point them at the same files simultaneously — you'll spend your remaining hours resolving merge conflicts. Split by directory: Antigravity confined to `src/components/**` styling, Claude Code on everything else (backend, edge functions, DB, deploy, integration).

**Verify before the hack starts, not at hour 3:** current free quotas and model availability on both platforms change frequently. Confirm your Groq key works, your Supabase project is up, and your Vercel deploy is green **the night before**.

---

## Files to create (new repo)

```
crucible/
├── CLAUDE.md                     ← written FIRST (full text in Appendix)
├── AGENTS.md                     ← Next 16 gotchas (port from Forage)
├── README.md                     ← architecture diagram + demo video + setup
├── .env.example                  ← Forage lacks this; judges notice
├── supabase/migrations/*.sql     ← commit the schema, unlike Forage
├── next.config.ts                ← CSP: add Groq + MediaPipe CDN to connect-src
├── src/
│   ├── proxy.ts                  ← PROTECTED routes (NOT middleware.ts)
│   ├── app/
│   │   ├── (app)/interview/      ← setup → device-check → live → report
│   │   ├── (app)/dashboard/      ← session history + score trend
│   │   ├── r/[slug]/             ← public shared report
│   │   └── auth/
│   ├── components/
│   │   ├── interview/            ← InterviewClient, VoiceOrb, CameraHUD,
│   │   │                            CodePanel, RoundTracker
│   │   └── report/               ← VerdictCard, EvidenceQuote, GapMatrix,
│   │                                DeliveryChart, IntegrityPanel
│   ├── hooks/
│   │   ├── useVoice.ts           ← PORT from Forage
│   │   ├── useFaceTelemetry.ts   ← new: MediaPipe worker bridge
│   │   └── useMounted.ts         ← PORT from Forage
│   ├── workers/
│   │   ├── face.worker.ts        ← MediaPipe FaceLandmarker
│   │   └── pyodide.worker.ts     ← code execution
│   └── lib/
│       ├── ai/provider.ts        ← Groq | Gemini adapter + model routing
│       ├── rubric.ts             ← DB rows → prompt; TS weighted-total math
│       ├── verdict.ts            ← schema validation + retry
│       └── supabase/             ← PORT from Forage
└── supabase/functions/interview/index.ts   ← the one multiplexed edge function
```

**Port list from Forage (copy, don't rewrite):** `useVoice.ts`, `useMounted.ts`, `motion.tsx`, `icons.tsx`, `globals.css` token system, `lib/supabase/{client,server}.ts`, `proxy.ts`, `next.config.ts` security headers, the edge-function auth/JWT/RPC scaffolding, and the feedback validate-retry-degrade pattern.

**Carry these hard-won lessons across (they're in Forage's CLAUDE.md and they're real):**
- `useMounted()` gate before any `useReducedMotion()` branch that changes DOM shape
- Standalone `translate`, never `transform`, on wide-scoped CSS animations with `fill-mode: both`
- Tailwind v4: colors in a plain `html {}` rule, not `@theme inline`
- Never pass Lucide icon components across the RSC boundary
- `fetch(..., {keepalive:true})`, never `sendBeacon` (no `Authorization` header)
- CSP `connect-src` is an allowlist — add Groq + the MediaPipe CDN or requests silently fail

---

## Verification

**Per checkpoint (every 3 hours, non-negotiable):**
```bash
npx tsc --noEmit && npx eslint && npm run build
git add -A && git commit -m "..." && git push    # → Vercel auto-deploys
```
Add a `"typecheck": "tsc --noEmit"` script and a minimal `.github/workflows/ci.yml` running those three — Forage has zero CI, and a green badge on the repo is free credibility.

**End-to-end manual test (run before every rehearsal):**
1. Sign up fresh → upload a sample resume PDF → paste a real JD
2. Grant camera + mic → confirm the HUD gauges move as you speak and look away
3. Complete 3 interview turns by voice → confirm transcript + timestamps land in `interview_turns`
4. Trigger the coding round → write a failing solution → run tests → fix → run again
5. End session → confirm the verdict returns with **≥1 evidence quote per competency**
6. Click an evidence quote → confirm it jumps to and highlights the right transcript turn
7. Export PDF, open the share link in a private window (no auth)
8. Deny camera permission → confirm graceful degradation, no crash
9. Kill wifi mid-interview → confirm a real error message, not a white screen

**Live QA via the Playwright MCP** against `npm run dev` at 375 / 768 / 1280 widths, plus `prefers-reduced-motion`.

**DB checks via Supabase MCP:** `get_advisors` for RLS gaps before you make the repo public, and confirm every table has a policy.

---

# Appendix — `CLAUDE.md` for the new repo

> Write this as the **very first file** in the new repo, before any code. It is what keeps a 3am Claude session from re-deriving decisions you already made.

````markdown
# Crucible — CLAUDE.md

AI Mock Interview Evaluator. Read fully before changing anything. See `AGENTS.md`
for Next.js 16 breaking changes vs. training-data assumptions.

## What this is

A standalone product (NOT part of Forage): a voice mock interview grounded in the
candidate's real resume and a real job description, with on-device camera/audio
delivery analysis, an optional live coding round, and a rubric-scored, evidence-cited
verdict. Built for a hackathon on strictly free-tier infrastructure.

Positioning: competitors return vague encouragement. Crucible returns a defensible
scorecard where **every score cites the exact sentence the candidate said**.

## The one architectural rule

**Expensive work runs in the browser. Only text touches a paid API.**
- Face/delivery analysis → MediaPipe WASM, on-device, in a Web Worker
- Code execution → Pyodide WASM, on-device, in a Web Worker
- Resume parsing → pdf.js, on-device
- PDF export → print stylesheet, on-device

Video and audio **never leave the device**. Only ~15 aggregated numbers reach the DB.
This is a privacy guarantee stated in the UI — do not break it for convenience.

## Two-agent evaluation (do not collapse these)

- **Interviewer** (`llama-3.1-8b-instant`): conducts, never scores, never sees the rubric.
- **Evaluator** (`llama-3.3-70b-versatile`): never speaks to the candidate; sees the full
  transcript with turn indices + timestamps, delivery telemetry, code + test results,
  and the rubric.

The separation is the product's credibility claim. Merging them to "save a call" destroys it.

Two rules inside evaluation:
1. **`weighted_total` is computed in TypeScript**, never requested from the model.
2. **`evidence[]` must be non-empty** per competency — schema validation fails and
   retries otherwise. The model may not hand-wave.

## Token budget — the real constraint

Groq free tier is **per organization**; extra keys do not help.

| Model | RPM | Req/day | Tokens/day |
|---|---|---|---|
| `llama-3.3-70b-versatile` | 30 | 1,000 | **100K** |
| `llama-3.1-8b-instant` | 30 | 14,400 | ~500K |
| `whisper-large-v3-turbo` | 20 | 2,000 | 28,800 audio-sec |

100K/day on 70B ≈ **4 full interviews**. Therefore:
- Route interviewer turns to 8b; reserve 70B for the single evaluation pass.
- Send last 6 turns + a running summary, never the full history.
- All model calls go through `src/lib/ai/provider.ts`. **Never import a provider SDK
  into feature code** — the Gemini failover depends on that boundary holding.
- Rehearse against fixtures (`NEXT_PUBLIC_USE_FIXTURES=1`), not live APIs.

## Tech stack

Next.js 16 App Router / React 19 / TypeScript strict / Tailwind v4 / Vercel Hobby /
Supabase free (Postgres+RLS, Auth, Storage, Deno Edge Functions) / Groq (chat, Whisper,
Orpheus TTS) / `@mediapipe/tasks-vision` / Pyodide / CodeMirror 6 / pdfjs-dist /
framer-motion. npm only.

## Architecture constraints (inherited from Forage — these are real, verified bugs)

- **`src/proxy.ts` IS the middleware.** Next 16 renamed `middleware.ts`. A `middleware.ts`
  file is silently ignored. New authenticated routes must be added to `PROTECTED`.
- **Tailwind v4 `@theme inline` does not emit runtime custom properties.** Any token read
  via inline `style={{...var(--x)}}` must ALSO be declared in a plain `html { }` rule.
- **Never branch a component's top-level return on `useReducedMotion()` alone** when the
  branches produce different DOM shapes — gate on `useMounted()` first:
  `if (!mounted || reduce) return <static/>`. SSR has no `matchMedia`; this is a real
  hydration-mismatch bug class.
- **A CSS `transform` on any ancestor breaks every `position: fixed` descendant**, even
  a numeric no-op, and `fill-mode: both` locks it in permanently. Use the standalone
  `translate`/`rotate`/`scale` properties on wide-scoped animations.
- **Lucide icon components cannot cross the RSC boundary** as props. Client components
  resolve icons from a map internally.
- **`navigator.sendBeacon` cannot carry `Authorization`.** Unload-time cleanup uses
  `fetch(url, { keepalive: true })`. Do not "simplify" this.
- **CSP `connect-src` in `next.config.ts` is an allowlist.** Adding any new external
  origin (Groq, the MediaPipe CDN, a new provider) requires editing it, or requests
  fail silently in production but work in dev.
- **MediaPipe and Pyodide must run in Web Workers.** On the main thread they block the
  interview UI and the voice loop stutters.

## Database

New Supabase project. RLS on every table. **Migrations ARE committed** to
`supabase/migrations/` (unlike Forage, which has none) — apply via Supabase MCP
`apply_migration` AND commit the SQL.

Tables: `profiles`, `rubrics`, `rubric_competencies`, `interview_sessions`,
`interview_turns`, `delivery_metrics`, `code_artifacts`, `verdicts`, `share_links`.

**The rubric is data, not a prompt string.** `rubric_competencies` holds weights and
`level_1..level_5` descriptors, assembled into the evaluator prompt at call time. This
is what lets us claim a company's real rubric could be loaded.

## API surface

No `src/app/api/`. Three shapes only:
1. Supabase SDK from Server Components (RLS enforces access)
2. `supabase.rpc(...)` to `SECURITY DEFINER` functions that self-check `auth.uid()`
3. One Edge Function `interview`, multiplexed by `action`:
   `start` | `turn` | `speak` (returns raw audio/wav) | `prep` | `evaluate`,
   plus `multipart/form-data` with an `audio` field for STT, routed by `Content-Type`
   **before** the JSON body is parsed.

Edge function source lives in `supabase/functions/interview/index.ts` and is **not
auto-deployed** — redeploy explicitly via Supabase MCP `deploy_edge_function` after
every edit. Excluded from `tsc` (it's Deno).

## Environment

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
NEXT_PUBLIC_USE_FIXTURES=0        # 1 = rehearse without burning quota
NEXT_PUBLIC_DEMO_MODE=0           # 1 = seeded demo session, no auth required
```
Edge Function secret (Supabase dashboard, NOT in this repo): `LLM_API_KEY` = a Groq key.
**Never enter API keys into any tool, form, or dashboard on the user's behalf** — give
them the steps and let them do it.

## Conventions

- Comments explain **why**, never what. Match the surrounding density.
- No premature abstraction — near-identical components stay separate until a third use case.
- Use shared primitives in `src/components/ui/motion.tsx`; they already gate on
  `useReducedMotion()` + `useMounted()`.
- Verify every checkpoint: `npx tsc --noEmit && npx eslint && npm run build`, then
  commit and push (Vercel auto-deploys `main`).
- Verify UI live via the Playwright MCP at 375 / 768 / 1280 and with reduced motion.

## Demo-day rules (hackathon)

1. **Deploy at hour 2, then at every 3-hour checkpoint.** Whatever is on `main` is the
   submission. Never leave `main` broken.
2. `DEMO_MODE` seeds a completed session reachable at `/r/demo-slug` with no auth — the
   report page must render even with zero network.
3. Text-only interview mode is a first-class path, not an error state. It is the fallback
   when the venue mic fails.
4. Camera denied → "delivery analysis unavailable", never a crash.
5. Rehearse against fixtures. Reserve live quota for judging.

## Deferred deliberately (do not start these)

Payments/billing, identity verification, speech-emotion models, fine-tuning, pgvector
semantic search, native mobile. Say "out of scope" and move on.
````

---

## Open items you may want to adjust before I start

- **Product name** — plan uses *Crucible*; swap freely (one-line change).
- **Judging format** — I've assumed a 24–48h build window and a short live demo slot plus repo submission, and built insurance for both. If it's video-only, I'd shift ~2 hours from demo-mode into repo/README polish.
- **Option A vs B** — plan recommends A (evaluator-first). Say the word if you'd rather go wide with B.
