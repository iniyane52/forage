# REBUILD.md — the hybrid-learning contract

This app was built WITH Claude as a working v1. That's only half the deal.
The other half: as you (Iniyan) move through your own Foundry curriculum at
`C:\claude\foundry`, you rebuild the matching piece of THIS app yourself, so that in
an interview you can defend every layer of your own product. Do these in order;
each maps to a month of your study plan.

## Month 1 (Linux) → run this project from the shell
- Clone-level familiarity: `cd C:\claude\foundary`, `npm run dev`, stop it, restart it.
- Read `.gitignore` and explain why `.env.local` must never be committed.
- Done when: you can start, stop, and describe every top-level folder.

## Month 2 (Python & Git) → own the logic and the history
- Re-implement the quiz scoring + XP rules (`supabase/` functions: 10 first-try,
  5 retry, streak rules) as a small **Python** program with tests. Then read the SQL
  originals and note the differences in a `notes.md`.
- Read `git log` of this repo; make your first real commit here (fix a typo, improve
  a label). Branch → commit → merge, like `m2t7` taught you.
- Done when: your Python scorer passes your own tests AND you've merged a branch.

## Month 3 (SQL) → own the schema
- Without looking, draw the tables: streams → modules → lessons → quiz_questions,
  plus profiles/progress/attempts/results. Then compare with the migrations.
- Hand-write 5 real queries against the live DB (Supabase SQL editor):
  1) lessons per module, 2) your own progress %, 3) top-3 hardest questions by wrong
  ratio, 4) your XP by day, 5) a LEFT JOIN that finds lessons with no questions yet.
- Done when: all 5 run and you can explain every JOIN.

## Month 4 (DSA) → own the algorithms
- Explain (aloud): the Fisher-Yates shuffle in `QuizRunner.tsx`, why option order is
  a permutation map, and the streak algorithm's three cases in `touch_streak`.
- Done when: you can whiteboard both without the code open.

## Month 5 (Ship it) → own the deployment
- Containerise this app with your own Dockerfile (multi-stage: build → run).
- Deploy it YOURSELF (your VM or Vercel) as your capstone portfolio piece.
- Done when: a live URL exists that you deployed, and the README says how.

Rule of thumb: if you can't explain a file, you haven't earned it yet — come back
to this contract.
