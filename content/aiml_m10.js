// FORAGE — AI Engineer path, Module 10: Capstone
// A project-driven capstone tying together Modules 1-9: dataset -> trained model -> saved ->
// served live behind an API -> containerised. Project-based lessons get 0 quizzes by design
// (the light-quiz rule: no concrete testable fact/tradeoff to quiz — the deliverable itself is
// the assessment), except the final interview-framing lesson which has one genuinely testable
// idea worth reinforcing.

module.exports = {
  id: "aiml-capstone", title: "Capstone: Ship a Real Model",
  why: "Everything from Module 1 through Module 9 was building toward this: taking a real dataset all the way to a trained, evaluated, served, and containerized model — the exact end-to-end shape of real AI Engineering work, and the strongest possible portfolio piece for interviews.",
  topics: [
  {
    id: "aiml-capstone-brief", title: "The capstone brief",
    concept: "Your capstone: pick a dataset you find genuinely interesting (not necessarily iris/digits — a real Kaggle dataset or one from your own domain is stronger), train and properly evaluate a model on it (Modules 3-4), save it (Module 7), wrap it in a FastAPI prediction endpoint (Module 7), and containerize it with Docker (Module 8). The deliverable is a working, runnable project — not a notebook that only works on your machine, but something a stranger could clone, build, and run.",
    analogy: "This capstone is the difference between practicing scales on a piano and playing a full piece start to finish — every individual skill (Modules 1-9) was a scale; this is the piece that proves you can put them together into something real and complete, which is exactly what an interviewer or hiring manager actually wants to see.",
    examples: [
      {code: "# Suggested project structure\ncapstone/\n  README.md              # what it does, how to run it, what you learned\n  requirements.txt       # pinned dependencies (Module 8)\n  train.py               # loads data, trains model, evaluates (Modules 3-4), saves it (Module 7)\n  main.py                # FastAPI app serving predictions (Module 7)\n  model.joblib            # the saved, trained model\n  Dockerfile              # containerizes the whole thing (Module 8)\n  tests/\n    test_api.py            # a few TestClient checks (Module 7)", note: "This mirrors the exact structure you built piece-by-piece across Modules 7-8, now assembled into one coherent, self-contained project — the same shape real ML services actually take."}
    ],
    mistakes: ["Picking a dataset so trivial there's nothing interesting to say about it in an interview — a dataset with some real texture (messy data, class imbalance, a genuine tradeoff to discuss) makes for a better story.","Treating the capstone as 'just get it working' rather than 'get it working AND be able to explain every decision' — interviewers probe the WHY, not just the what.","Skipping evaluation (Module 4) in favor of just eyeballing accuracy — a capstone that shows precision/recall/cross-validation reasoning is meaningfully stronger."],
    handsOn: "Choose your capstone dataset now. Write 3-5 sentences: what it is, why you chose it, what the prediction task is, and what would make a 'good' model for this specific problem (tying back to Module 4's evaluation-metric choice).",
    doneWhen: "You have a chosen dataset, a clear prediction task, and a plan for which evaluation metric(s) actually matter for it.",
    checks: [],
    keyTakeaways: ["The capstone combines Modules 1-9 into one complete, runnable project.", "A dataset with real texture (imbalance, messiness, genuine tradeoffs) makes for a stronger interview story than a trivial one.", "Being able to explain every decision matters as much as the code working."],
    resources: [
      {label: "Kaggle — Datasets", url: "https://www.kaggle.com/datasets", kind: "practice"},
      {label: "UCI Machine Learning Repository", url: "https://archive.ics.uci.edu/", kind: "reference"}
    ]
  },
  {
    id: "aiml-capstone-build", title: "Building it end-to-end",
    concept: "Build in the same order you learned: load and clean your data (Module 1), understand it with plots before modeling (Module 1), engineer/select features as needed, train and properly evaluate a model with the RIGHT metric for your problem (Modules 3-4) — not just whatever's default — save it (Module 7), wrap it in a validated FastAPI endpoint (Module 7), then containerize it (Module 8). Build and test each piece before moving to the next, exactly like you practiced module by module — don't write the whole thing at once and debug it all together.",
    analogy: "Building end-to-end in one giant leap without testing each piece is like assembling a whole piece of furniture before checking any single joint — if something's wrong, you won't know which piece to blame. Building and verifying incrementally (data → model → save/load → API → container), the way each module practiced it in isolation, means any failure points to exactly one recent change.",
    examples: [
      {code: "# A sane build-and-verify order, each step checked before moving on\n# 1. Load + clean + explore data -- confirm shape, missing values, class balance\n# 2. Train + evaluate -- confirm the RIGHT metric (Module 4) looks reasonable,\n#    not just default accuracy; check train vs test gap for over/underfitting\n# 3. Save the model -- confirm a fresh load produces identical predictions (Module 7)\n# 4. Wire the FastAPI endpoint -- test it locally with TestClient (Module 7)\n# 5. Write the Dockerfile -- build and run the container, confirm it responds (Module 8)\nprint(\"each step verified before starting the next\")", note: "This is a checklist, not runnable code -- the point is procedural: verify each layer works in isolation (exactly as each module in this path had you do) before stacking the next one on top, so a bug at any point is easy to localize."}
    ],
    warn: "It's tempting to skip straight to 'does the API respond' and declare victory — but a capstone that responds with WRONG predictions (bad evaluation, unvalidated input, a shape mismatch silently producing garbage) is worse for an interview than one that's smaller in scope but demonstrably correct at every layer.",
    mistakes: ["Skipping incremental verification and debugging the whole pipeline at once when something eventually breaks.","Declaring success once the API 'responds' without confirming the predictions are actually correct/reasonable.","Copy-pasting code from earlier modules without adapting it to your actual dataset's shape/features — a very common source of silent bugs."],
    handsOn: "Build your capstone following the five-step order above, verifying each step works before moving to the next. Keep notes on any bug you hit and how you diagnosed it — that debugging story is itself valuable interview material.",
    doneWhen: "You have a working, verified pipeline: data loaded and understood, model trained and properly evaluated, saved, served via a tested API endpoint, and containerized.",
    checks: [],
    keyTakeaways: ["Build and verify incrementally, module by module, rather than all at once.", "A correct, smaller-scope capstone beats a larger one with silent bugs.", "Keep notes on bugs you hit — debugging stories are real interview material."],
    resources: [
      {label: "scikit-learn — Choosing the right estimator (map)", url: "https://scikit-learn.org/stable/machine_learning_map.html", kind: "docs"},
      {label: "FastAPI — full tutorial index", url: "https://fastapi.tiangolo.com/tutorial/", kind: "docs"}
    ]
  },
  {
    id: "aiml-capstone-readme", title: "Writing a README an interviewer will actually read",
    concept: "A strong project README isn't a wall of setup instructions — it leads with WHAT the project does and WHY it's interesting, in the first few lines, because that's what a busy reviewer (or interviewer skimming your GitHub before a call) actually reads. Structure: a one-paragraph summary, the problem and why the dataset/approach was chosen, key results (with actual numbers — your Module 4 metrics), how to run it, and — genuinely valuable — what you'd improve with more time. That last section signals real engineering judgment, not just 'I finished the checklist.'",
    analogy: "A README that opens with 'Step 1: clone the repo, Step 2: pip install...' is like a movie trailer that starts by explaining the production budget — technically informative, completely missing the point of what should hook someone in the first few seconds. Lead with what the project IS and why it matters; save the setup instructions for after you've earned the reader's interest.",
    examples: [
      {code: "# README.md skeleton that leads with substance, not setup\n\"\"\"\n# [Project Name]\n\nPredicts [X] from [Y] using [model type], achieving [key metric] on held-out test data.\n\n## Why this dataset/problem\n[1-2 sentences: what made this interesting or challenging]\n\n## Results\n- Precision: 0.XX | Recall: 0.XX | (Module 4's metric, not just accuracy)\n- [One sentence on what the number means in context]\n\n## Architecture\ndata -> train.py -> model.joblib -> FastAPI (main.py) -> Docker\n\n## Run it\ndocker build -t capstone .\ndocker run -p 8000:8000 capstone\n\n## What I'd improve with more time\n[2-3 honest, specific ideas -- this section shows real judgment]\n\"\"\"", note: "Notice results come with REAL numbers and context (Module 4's lesson on comparing against a baseline, not a bare number), and the 'what I'd improve' section is deliberately included -- it's one of the highest-signal sections for a technical reviewer, showing you understand your own project's limits."}
    ],
    mistakes: ["Leading with installation instructions instead of what the project does and why it's interesting.","Reporting a bare accuracy number with no context (Module 4's lesson: numbers need a baseline/interpretation) or omitting results entirely.","Skipping the 'what I'd improve' section — it's one of the strongest signals of engineering maturity a README can show."],
    handsOn: "Write your capstone's README following this skeleton. Have someone else (or reread it yourself after a break) check: does the first paragraph alone explain what the project does and why it's worth a look, without needing to read further?",
    doneWhen: "Your README leads with substance (what/why/results) before setup instructions, includes real evaluation numbers with context, and has an honest 'what I'd improve' section.",
    checks: [],
    keyTakeaways: ["Lead a README with what the project does and why it matters, not setup steps.", "Report real evaluation numbers with context, not a bare accuracy figure.", "An honest 'what I'd improve' section signals genuine engineering judgment."],
    resources: [
      {label: "Make a README — README best practices", url: "https://www.makeareadme.com/", kind: "reference"},
      {label: "GitHub — About READMEs", url: "https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-readmes", kind: "docs"}
    ]
  },
  {
    id: "aiml-capstone-interview-ready", title: "Making your capstone interview-ready",
    concept: "In an interview, the capstone's value isn't the code itself — it's your ability to walk through the DECISIONS behind it fluently: why this dataset, why this model type over alternatives, why this evaluation metric (not just 'accuracy'), what tradeoff you made and why, and what you'd do differently with more time or data. Interviewers deliberately probe these choices because they reveal whether you genuinely understand your own work or just followed a tutorial — the single biggest differentiator between a project that impresses and one that raises doubt.",
    analogy: "Presenting a project without being able to explain your decisions is like presenting a legal case you didn't actually build — you can recite what happened, but the moment someone asks 'why this approach and not that one', the gap between reciting and understanding becomes obvious immediately. Owning the WHY behind every choice is what makes a project defensible under real questioning.",
    examples: [
      {code: "# Practice format: rehearse a 60-90 second walkthrough covering ALL of these\ntalking_points = [\n    \"What problem does this solve, in one sentence?\",\n    \"Why this dataset/model type, and what else did you consider?\",\n    \"Why this evaluation metric specifically (Module 4) -- not just 'accuracy'?\",\n    \"What's one real tradeoff you made, and why?\",\n    \"What would you improve first with more time?\",\n]\nfor i, point in enumerate(talking_points, 1):\n    print(f\"{i}. {point}\")", note: "This is a REHEARSAL CHECKLIST, not runnable code -- the discipline of preparing a tight, fluent answer to each of these BEFORE an interview is what turns 'I built a thing' into a compelling, defensible technical story."}
    ],
    mistakes: ["Being able to describe WHAT the project does but not WHY specific decisions were made — this is the fastest way to reveal a project wasn't genuinely understood.","Never having rehearsed explaining the project out loud before the actual interview — the first time you say it shouldn't be under pressure.","Hiding weaknesses instead of owning them — 'here's what I'd improve' lands far better than pretending the project is flawless."],
    handsOn: "Out loud (to yourself, a friend, or recorded), practice a 60-90 second walkthrough of your capstone covering all five talking points above. Do it twice — the second pass is almost always tighter than the first.",
    doneWhen: "You can explain your capstone's what, why, evaluation choice, one real tradeoff, and one honest improvement — fluently, in under 90 seconds, without reading from notes.",
    checks: [
      {q: "Why do interviewers deliberately probe the DECISIONS behind a project rather than just checking that the code runs?", a: "Being able to run code someone else wrote (or followed from a tutorial) doesn't prove understanding — explaining WHY specific choices were made (dataset, model, metric, tradeoffs) is what reveals whether you genuinely understand your own work."}
    ],
    keyTakeaways: ["Interview value comes from explaining decisions, not reciting what the code does.", "Rehearse a tight walkthrough before the interview, not during it.", "Owning weaknesses honestly lands better than pretending the project is flawless."],
    resources: [
      {label: "Common Core — Career track (STAR framework, technical explanations)", url: "/stream/common-core", kind: "course"},
      {label: "Forage Interview — practice explaining this project live", url: "/interview", kind: "practice"}
    ]
  }
  ]
};
