# Crucible — CLAUDE.md

AI Mock Interview Evaluator. Read this fully before changing anything.
See `AGENTS.md` for Next.js 16 breaking changes vs. training-data assumptions.

> **This file belongs at the root of the new Crucible repo.** It currently lives under
> `docs/crucible/` in the Forage repo only because that is where it was authored.
> Copy it to the new repo's root as the very first file, before any code.

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

- **Interviewer** (`llama-3.1-8b-instant`): conducts the interview, never scores,
  never sees the rubric.
- **Evaluator** (`llama-3.3-70b-versatile`): never speaks to the candidate; sees the
  full transcript with turn indices + timestamps, delivery telemetry, code + test
  results, and the rubric.

The separation is the product's credibility claim: the interviewer physically cannot
inflate its own grade. Merging them to "save a call" destroys the whole pitch.

Two rules inside evaluation:

1. **`weighted_total` is computed in TypeScript**, never requested from the model.
   LLMs do arithmetic badly and judges check.
2. **`evidence[]` must be non-empty** per competency — schema validation fails and
   retries otherwise. The model may not hand-wave.

## Token budget — the real constraint

Groq free tier is **per organization**; extra API keys do not multiply quota.

| Model | RPM | Req/day | Tokens/day |
|---|---|---|---|
| `llama-3.3-70b-versatile` | 30 | 1,000 | **100K** |
| `llama-3.1-8b-instant` | 30 | 14,400 | ~500K |
| `whisper-large-v3-turbo` | 20 | 2,000 | 28,800 audio-sec |

100K/day on the 70B model is roughly **4 full interviews**. Therefore:

- Route interviewer turns to 8b; reserve 70B for the single evaluation pass.
- Send the last 6 turns + a running summary, never the full history every call.
- All model calls go through `src/lib/ai/provider.ts`. **Never import a provider SDK
  into feature code** — the Gemini failover depends on that boundary holding.
- Rehearse against fixtures (`NEXT_PUBLIC_USE_FIXTURES=1`), not live APIs.

Re-verify these numbers at build time; provider free tiers change often.

## Tech stack

Next.js 16 App Router / React 19 / TypeScript strict / Tailwind v4 / Vercel Hobby /
Supabase free (Postgres + RLS, Auth, Storage, Deno Edge Functions) / Groq (chat,
Whisper STT, Orpheus TTS) / `@mediapipe/tasks-vision` / Pyodide / CodeMirror 6 /
pdfjs-dist / framer-motion. npm only.

## Architecture constraints (inherited from Forage — these are real, verified bugs)

- **`src/proxy.ts` IS the middleware.** Next 16 renamed `middleware.ts`; a
  `middleware.ts` file is silently ignored. New authenticated routes must be added
  to the `PROTECTED` list or they are publicly reachable.
- **Tailwind v4 `@theme inline` does not emit runtime custom properties.** Any token
  read via inline `style={{ color: "var(--x)" }}` must ALSO be declared in a plain
  `html { }` rule. Keep colors out of `@theme inline`; fonts and radii are fine there.
- **Never branch a component's top-level return on `useReducedMotion()` alone** when
  the branches produce different DOM shapes — gate on `useMounted()` first:
  `if (!mounted || reduce) return <static/>`. SSR has no `matchMedia`, so a client
  that already prefers reduced motion mismatches on first paint. Real bug class.
- **A CSS `transform` on any ancestor establishes a containing block and breaks every
  `position: fixed` descendant**, even a numeric no-op like `translate(0,0)`, and
  `animation-fill-mode: both` locks it in permanently. Use the standalone
  `translate` / `rotate` / `scale` properties on wide-scoped animations.
- **Lucide icon components cannot cross the RSC boundary** as props. Client components
  resolve icons from a map internally.
- **`navigator.sendBeacon` cannot carry an `Authorization` header.** Unload-time
  session cleanup uses `fetch(url, { keepalive: true })`. Do not "simplify" this.
- **CSP `connect-src` in `next.config.ts` is an allowlist.** Adding any new external
  origin (Groq, the MediaPipe CDN, a new provider) requires editing it, or requests
  fail silently in production while working fine in dev.
- **MediaPipe and Pyodide must run in Web Workers.** On the main thread they block the
  interview UI and the voice loop stutters audibly.

## Database

New Supabase project. RLS on every table. **Migrations ARE committed** to
`supabase/migrations/` (unlike Forage, which has none) — apply via the Supabase MCP
`apply_migration` tool AND commit the SQL. Judges read repos; a repo with no schema
looks like a repo with no backend.

Tables: `profiles`, `rubrics`, `rubric_competencies`, `interview_sessions`,
`interview_turns`, `delivery_metrics`, `code_artifacts`, `verdicts`, `share_links`.

**The rubric is data, not a prompt string.** `rubric_competencies` holds weights and
`level_1..level_5` descriptors, assembled into the evaluator prompt at call time.
This is what lets us claim a company's real hiring rubric could be loaded.

`share_links` is read through a `SECURITY DEFINER` RPC so a public slug can fetch one
verdict without exposing the table.

## API surface

No `src/app/api/`. Three shapes only:

1. Supabase SDK calls from Server Components (RLS enforces access).
2. `supabase.rpc(...)` to `SECURITY DEFINER` functions that self-check `auth.uid()`.
3. One Edge Function `interview`, multiplexed by `action`:
   `start` | `turn` | `speak` (returns raw `audio/wav` bytes, not JSON) | `prep` |
   `evaluate`, plus `multipart/form-data` with an `audio` field for STT — routed by
   the `Content-Type` header **before** the JSON body is parsed.

Edge function source lives in `supabase/functions/interview/index.ts` and is **not
auto-deployed** — redeploy explicitly via the Supabase MCP `deploy_edge_function`
tool after every edit. Excluded from `tsc` (it is Deno, not Node).

## Environment

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
NEXT_PUBLIC_USE_FIXTURES=0        # 1 = rehearse without burning API quota
NEXT_PUBLIC_DEMO_MODE=0           # 1 = seeded demo session, no auth required
```

Both Supabase vars are public by design (anon/publishable key model).

Edge Function secret, set in the Supabase dashboard and **never in this repo**:
`LLM_API_KEY` = a Groq API key. If the interview returns 503 `not_configured`, this
secret is missing or wrong.

**Never enter API keys, passwords, or secrets into any tool, form, or dashboard on
the user's behalf** — including Supabase's own secrets UI. Give them the exact steps
and let them do it.

## Conventions

- Comments explain **why**, never what. Identifiers should already be clear. Match
  the surrounding comment density.
- No premature abstraction — near-identical components stay separate and readable
  until a genuine third or fourth use case demands otherwise.
- Use the shared primitives in `src/components/ui/motion.tsx`; they already gate on
  `useReducedMotion()` and `useMounted()`. Don't write bespoke Framer Motion.
- Verify at every checkpoint: `npx tsc --noEmit && npx eslint && npm run build`,
  then commit and push (Vercel auto-deploys `main`).
- Verify UI live via the Playwright MCP at 375 / 768 / 1280 widths and with
  `prefers-reduced-motion` enabled.
- Check `pwd` before running `npx` — the working directory can drift between calls.

## Demo-day rules (hackathon)

1. **Deploy at hour 2, then at every 3-hour checkpoint.** Whatever is on `main` is
   the submission. Never leave `main` broken overnight.
2. `DEMO_MODE` seeds a completed session reachable at `/r/demo-slug` with no auth —
   the report page must render with zero network.
3. Text-only interview mode is a first-class path, not an error state. It is the
   fallback when the venue microphone fails.
4. Camera denied → "delivery analysis unavailable", never a crash.
5. Rehearse against fixtures. Reserve live quota for the judging window.

## Deferred deliberately (do not start these)

Payments/billing, identity verification, speech-emotion-recognition models,
fine-tuning, pgvector semantic search, native mobile. Say "out of scope" and move on.
