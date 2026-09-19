# Crucible — AI Mock Interview Evaluator

Planning deliverables for the standalone hackathon project, authored in this Forage
session and stored here because that's where the conversation happened. **Crucible is
a separate product** — it does not live inside this repo, and nothing here is wired
into the Forage app.

- **[PLAN.md](./PLAN.md)** — the full build plan: architecture, the two-agent
  evaluation design, the 24h hour-by-hour build order, feature tiers, demo-day
  insurance, and the Claude Code vs. Antigravity recommendation.
- **[CLAUDE.md](./CLAUDE.md)** — the onboarding doc for the new repo. Copy this to
  the new repo's root as the first file, before any code.

## Next step

Create the new repo (`crucible` or your chosen name), copy `CLAUDE.md` to its root,
and start at hour 0 of the build order in `PLAN.md`: scaffold, port the design
tokens/hooks listed in the "Files to create" section, stand up a new Supabase
project, and get a live Vercel URL before writing any feature code.
