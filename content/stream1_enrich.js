// Backfill: keyTakeaways + resources for the 53 legacy Stream-1 (Cloud & DevOps path) lessons.
// Sources verified via WebFetch against official docs before authoring (Docker layer-caching,
// Git branch/merge workflow, PostgreSQL JOIN/GROUP BY, MDN HTTP status codes, Python docs).
// We link & cite; explanations in the lessons themselves remain original.
module.exports = {
  // ---- Month 1: Linux ----
  m1t1: {
    keyTakeaways: ["A shell reads typed commands and runs them.", "WSL gives Windows a real Linux shell.", "echo/whoami are your first proof-of-life commands."],
    resources: [
      { label: "WSL install docs (Microsoft Learn)", url: "https://learn.microsoft.com/en-us/windows/wsl/install", kind: "docs" },
      { label: "The Linux command line for beginners", url: "https://ubuntu.com/tutorials/command-line-for-beginners", kind: "docs" },
    ],
  },
  m1t2: {
    keyTakeaways: ["Linux is one tree starting at /.", "Absolute paths start with /; relative paths start from where you stand.", "pwd/ls/cd are your navigation trio."],
    resources: [{ label: "Filesystem Hierarchy Standard overview", url: "https://ubuntu.com/tutorials/command-line-for-beginners#3-a-tour-of-the-terminal", kind: "docs" }],
  },
  m1t3: {
    keyTakeaways: ["rm has no recycle bin — it's permanent.", "cp needs source AND destination.", "mv both renames and moves."],
    resources: [{ label: "GNU Coreutils manual (cp/mv/rm)", url: "https://www.gnu.org/software/coreutils/manual/coreutils.html", kind: "docs" }],
  },
  m1t9: {
    keyTakeaways: ["sudo elevates ONE command temporarily.", "apt update refreshes the catalogue; apt install fetches.", "man/--help answer most questions without leaving the shell."],
    resources: [
      { label: "Ubuntu apt package management basics", url: "https://ubuntu.com/server/docs/package-management", kind: "docs" },
      { label: "sudo — Microsoft Learn (WSL context)", url: "https://learn.microsoft.com/en-us/windows/wsl/tutorials/wsl-vscode", kind: "docs" },
    ],
  },
  m1t4: {
    keyTakeaways: ["rwx = read, write, execute for owner/group/others.", "chmod +x makes a script runnable.", "chmod 777 is a security smell, not a fix."],
    resources: [{ label: "Linux file permissions (GNU Coreutils)", url: "https://www.gnu.org/software/coreutils/manual/html_node/File-permissions.html", kind: "docs" }],
  },
  m1t5: {
    keyTakeaways: ["The pipe | feeds one command's output into the next.", "grep filters, wc -l counts, sort/uniq tidy.", "Small tools composed beats one giant command."],
    resources: [{ label: "Bash pipelines (GNU Bash manual)", url: "https://www.gnu.org/software/bash/manual/html_node/Pipelines.html", kind: "docs" }],
  },
  m1t6: {
    keyTakeaways: ["A process is a running program with a PID.", "& backgrounds a command; ps finds it; kill stops it.", "'Port in use' means a live process, not a broken port."],
    resources: [{ label: "ps(1) man page", url: "https://man7.org/linux/man-pages/man1/ps.1.html", kind: "docs" }],
  },
  m1t7: {
    keyTakeaways: ["A script is commands run top to bottom from a file.", "#!/bin/bash + chmod +x makes it executable.", "$(...) substitutes a command's output into a line."],
    resources: [{ label: "Bash scripting guide (GNU)", url: "https://www.gnu.org/software/bash/manual/html_node/Shell-Scripts.html", kind: "docs" }],
  },
  m1t8: {
    keyTakeaways: ["Bandit turns Linux commands into muscle memory.", "SSH opens a shell on a remote machine.", "Struggle first — hints, not full answers."],
    resources: [{ label: "OverTheWire Bandit", url: "https://overthewire.org/wargames/bandit/", kind: "practice" }],
  },

  // ---- Month 2: Python & Git ----
  m2t1: {
    keyTakeaways: ["Indentation defines blocks in Python — it's syntax, not style.", "== compares; = assigns.", "range(n) stops BEFORE n."],
    resources: [{ label: "Python tutorial — control flow", url: "https://docs.python.org/3/tutorial/controlflow.html", kind: "docs" }],
  },
  m2t2: {
    keyTakeaways: ["dict = fast key→value lookup.", "set = unique items, no order.", "tuple is immutable; list is not."],
    resources: [{ label: "Python data structures tutorial", url: "https://docs.python.org/3/tutorial/datastructures.html", kind: "docs" }],
  },
  m2t3: {
    keyTakeaways: ["with open(...) guarantees the file closes.", "Catch specific errors, not bare except.", "Functions need return to hand back a value."],
    resources: [{ label: "Python errors & exceptions", url: "https://docs.python.org/3/tutorial/errors.html", kind: "docs" }],
  },
  m2t8: {
    keyTakeaways: ["A class is a blueprint; an object is one instance.", "self refers to the current object.", "Four pillars: encapsulation, inheritance, polymorphism, abstraction."],
    resources: [{ label: "Python classes tutorial", url: "https://docs.python.org/3/tutorial/classes.html", kind: "docs" }],
  },
  m2t4: {
    keyTakeaways: ["A venv isolates a project's packages.", "requirements.txt records exact versions.", "Containers later take this idea to the whole environment."],
    resources: [{ label: "Python venv — official docs", url: "https://docs.python.org/3/library/venv.html", kind: "docs" }],
  },
  m2t5: {
    keyTakeaways: ["Git is a time machine for code (commits = snapshots).", "add stages; commit saves with a message.", "Commit small and often."],
    resources: [
      { label: "Git Basics (Pro Git book, free)", url: "https://git-scm.com/book/en/v2/Git-Basics-Recording-Changes-to-the-Repository", kind: "book" },
      { label: "Git — official reference", url: "https://git-scm.com/doc", kind: "docs" },
    ],
  },
  m2t7: {
    keyTakeaways: ["Branches isolate work until it's ready.", "A pull request adds review before merging.", "Solo PRs still build the team habit."],
    resources: [{ label: "Basic Branching and Merging (Pro Git)", url: "https://git-scm.com/book/en/v2/Git-Branching-Basic-Branching-and-Merging", kind: "book" }],
  },
  m2t6: {
    keyTakeaways: ["A README is the first thing reviewers read.", "git push uploads commits to GitHub.", "A .gitignore keeps secrets and venvs out of the repo."],
    resources: [
      { label: "GitHub — create a repository", url: "https://docs.github.com/en/repositories/creating-and-managing-repositories/creating-a-new-repository", kind: "docs" },
      { label: "About READMEs", url: "https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-readmes", kind: "docs" },
    ],
  },

  // ---- Month 3: SQL & Data ----
  m3t1: {
    keyTakeaways: ["Without ORDER BY, row order isn't guaranteed.", "Text literals need single quotes in SQL.", "WHERE filters rows before any grouping."],
    resources: [{ label: "PostgreSQL SELECT reference", url: "https://www.postgresql.org/docs/current/sql-select.html", kind: "docs" }],
  },
  m3t2: {
    keyTakeaways: ["INNER JOIN keeps only matches; LEFT JOIN keeps all left rows.", "Forgetting ON causes a Cartesian product.", "Aliases (s, c) keep joins readable."],
    resources: [{ label: "PostgreSQL — Joins between tables", url: "https://www.postgresql.org/docs/current/tutorial-join.html", kind: "docs" }],
  },
  m3t3: {
    keyTakeaways: ["GROUP BY collapses rows into per-category summaries.", "WHERE filters rows; HAVING filters groups.", "Aggregates: COUNT, SUM, AVG, MIN, MAX."],
    resources: [{ label: "PostgreSQL — Aggregate functions", url: "https://www.postgresql.org/docs/current/functions-aggregate.html", kind: "docs" }],
  },
  m3t4: {
    keyTakeaways: ["A CTE (WITH ... AS) names a step for readability.", "CTEs beat deeply nested subqueries for clarity.", "The named result only exists for that query."],
    resources: [{ label: "PostgreSQL — WITH queries (CTEs)", url: "https://www.postgresql.org/docs/current/queries-with.html", kind: "docs" }],
  },
  m3t5: {
    keyTakeaways: ["A DataFrame is a table you can filter, group, and transform in Python.", "Boolean indexing is pandas' WHERE.", "groupby(...).mean() is pandas' GROUP BY + AVG."],
    resources: [
      { label: "pandas — 10 minutes to pandas", url: "https://pandas.pydata.org/docs/user_guide/10min.html", kind: "docs" },
      { label: "pandas.DataFrame.groupby reference", url: "https://pandas.pydata.org/docs/reference/api/pandas.DataFrame.groupby.html", kind: "docs" },
    ],
  },
  m3t6: {
    keyTakeaways: ["The real differentiator is explaining what numbers MEAN.", "One clear chart beats ten confusing ones.", "End with a recommendation, not just a number."],
    resources: [{ label: "Kaggle Datasets (free, public data)", url: "https://www.kaggle.com/datasets", kind: "practice" }],
  },

  // ---- Month 4: DSA ----
  m4t1: {
    keyTakeaways: ["Big-O describes how work grows with input size.", "Sorted data + halving = O(log n) (binary search).", "Nested loops over the same data ~ O(n²)."],
    resources: [{ label: "Big-O Cheat Sheet", url: "https://www.bigocheatsheet.com/", kind: "docs" }],
  },
  m4t2: {
    keyTakeaways: ["array[i] is O(1) — direct address computation.", "Negative indices count from the end.", "Slicing [::-1] reverses a sequence."],
    resources: [{ label: "Python sequence types reference", url: "https://docs.python.org/3/library/stdtypes.html#sequence-types-list-tuple-range", kind: "docs" }],
  },
  m4t3: {
    keyTakeaways: ["Hash maps give ~O(1) lookup/insert.", "Two-Sum: O(n²) pairs → O(n) with a dict.", "'Have I seen this?' is the classic hash-map signal."],
    resources: [{ label: "Python dict — data model & performance", url: "https://docs.python.org/3/library/stdtypes.html#mapping-types-dict", kind: "docs" }],
  },
  m4t4: {
    keyTakeaways: ["Sliding window avoids re-summing a range.", "Two pointers close in from both ends.", "Signal: 'contiguous run' or 'sorted pair'."],
    resources: [{ label: "NeetCode — patterns roadmap", url: "https://neetcode.io/roadmap", kind: "practice" }],
  },
  m4t5: {
    keyTakeaways: ["Every recursion needs a base case + a shrinking step.", "Missing a base case → infinite recursion.", "Trace small examples on paper first."],
    resources: [{ label: "Python — recursive functions (tutorial)", url: "https://docs.python.org/3/tutorial/controlflow.html#defining-functions", kind: "docs" }],
  },
  m4t6: {
    keyTakeaways: ["Binary search needs sorted input.", "Each step halves the search space → O(log n).", "Test edges: first, last, missing, empty."],
    resources: [{ label: "Binary search — Python bisect module", url: "https://docs.python.org/3/library/bisect.html", kind: "docs" }],
  },
  m4t7: {
    keyTakeaways: ["Stack = LIFO (undo); queue = FIFO (a line).", "deque gives an efficient queue in Python.", "Balanced brackets is the classic stack problem."],
    resources: [{ label: "Python collections.deque reference", url: "https://docs.python.org/3/library/collections.html#collections.deque", kind: "docs" }],
  },

  // ---- Month 5: Ship It ----
  m5t1: {
    keyTakeaways: ["Containers package code + dependencies + environment.", "Image = blueprint; container = running instance.", "Containers share the host kernel — lighter than a VM."],
    resources: [
      { label: "Docker overview (official docs)", url: "https://docs.docker.com/get-started/docker-overview/", kind: "docs" },
      { label: "Docker curriculum (free)", url: "https://docker-curriculum.com/", kind: "course" },
    ],
  },
  m5t2: {
    keyTakeaways: ["Copy dependency manifests + install BEFORE the rest of the code.", "This lets Docker cache the install layer.", "Never bake secrets into an image."],
    resources: [
      { label: "Dockerfile reference (official)", url: "https://docs.docker.com/reference/dockerfile/", kind: "docs" },
      { label: "Optimize build cache — official guide", url: "https://docs.docker.com/build/cache/optimize/", kind: "docs" },
    ],
  },
  m5t8: {
    keyTakeaways: ["HTTP is request → response between client and server.", "404 = client-side (not found); 500 = server-side failure.", "JSON is structured data, not code."],
    resources: [
      { label: "HTTP overview (MDN)", url: "https://developer.mozilla.org/en-US/docs/Web/HTTP/Overview", kind: "docs" },
      { label: "HTTP response status codes (MDN)", url: "https://developer.mozilla.org/en-US/docs/Web/HTTP/Status", kind: "docs" },
    ],
  },
  m5t3: {
    keyTakeaways: ["The cloud is renting someone else's computers.", "A VM is a Linux box you SSH into — same skills as Month 1.", "Free tier + billing alert + stop-when-done prevents surprise bills."],
    resources: [
      { label: "AWS Free Tier", url: "https://aws.amazon.com/free/", kind: "docs" },
      { label: "AWS Skill Builder (free training)", url: "https://skillbuilder.aws/", kind: "course" },
    ],
  },
  m5t4: {
    keyTakeaways: ["A deployed link is stronger proof than any certificate.", "-p maps a host port to a container port.", "Document the steps so the story is reproducible."],
    resources: [{ label: "Docker run reference (official)", url: "https://docs.docker.com/reference/cli/docker/container/run/", kind: "docs" }],
  },
  m5t5: {
    keyTakeaways: ["A stranger should understand a project in 60 seconds from its README.", "Pin 3–4 polished repos, not twenty half-finished ones.", "A live demo link gets clicked."],
    resources: [{ label: "About READMEs (GitHub docs)", url: "https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-readmes", kind: "docs" }],
  },
  m5t6: {
    keyTakeaways: ["LeetCode is rehearsal AFTER understanding the pieces.", "Restate, plan, code, note Big-O — that's a rep.", "Redo missed problems from memory a day later."],
    resources: [{ label: "NeetCode 150 (free roadmap)", url: "https://neetcode.io/practice", kind: "practice" }],
  },
  m5t7: {
    keyTakeaways: ["The 'two Fridays' test: shipping vs understanding.", "Choosing a track loses nothing — the foundation transfers.", "Evidence from your own projects beats guessing."],
    resources: [{ label: "roadmap.sh — career roadmaps", url: "https://roadmap.sh/", kind: "docs" }],
  },

  // ---- Career & Interview Track ----
  c1: {
    keyTakeaways: ["Product companies test fundamentals more deeply than service companies.", "Know your target role before you prep.", "Being able to explain your code matters as much as writing it."],
    resources: [{ label: "roadmap.sh — role-based roadmaps", url: "https://roadmap.sh/", kind: "docs" }],
  },
  c2: {
    keyTakeaways: ["Projects first, one page, metric-bearing bullets.", "Every bullet should survive 'tell me more'.", "Never list a skill you can't defend."],
    resources: [{ label: "Tech resume guide (freeCodeCamp)", url: "https://www.freecodecamp.org/news/how-to-write-a-good-resume/", kind: "docs" }],
  },
  c3: {
    keyTakeaways: ["GitHub is the receipt behind the resume's claim.", "Pin your best repos with real READMEs.", "A clean commit history signals a careful engineer."],
    resources: [{ label: "GitHub profile README guide", url: "https://docs.github.com/en/account-and-profile/setting-up-and-managing-your-github-profile/customizing-your-profile/managing-your-profile-readme", kind: "docs" }],
  },
  c4: {
    keyTakeaways: ["Steady weekly reps beat a pre-interview cram.", "Explain your approach and Big-O out loud.", "Re-solve missed problems cold, days later."],
    resources: [{ label: "NeetCode roadmap (free)", url: "https://neetcode.io/roadmap", kind: "practice" }],
  },
  c5: {
    keyTakeaways: ["Online assessments are a speed filter, not just a difficulty wall.", "Timed practice fixes most failures here.", "Track your two weakest topics."],
    resources: [{ label: "IndiaBIX — aptitude practice", url: "https://www.indiabix.com/", kind: "practice" }],
  },
  c6: {
    keyTakeaways: ["STAR: Situation, Task, Action, Result.", "Your own projects ARE your stories.", "Prepare 4–5 stories that flex to many questions."],
    resources: [{ label: "STAR method — Big Interview guide", url: "https://resources.biginterview.com/behavioral-interviews/star-interview-method/", kind: "docs" }],
  },
  c7: {
    keyTakeaways: ["Freshers need vocabulary and instinct, not FAANG-scale design.", "Client → API → database is the base sketch.", "Anchor answers to a project you actually built."],
    resources: [{ label: "System Design Primer (free, GitHub)", url: "https://github.com/donnemartin/system-design-primer", kind: "book" }],
  },
  c9: {
    keyTakeaways: ["Process vs thread, DNS→HTTP flow, DB index, HTTP vs HTTPS — know these cold.", "One clean sentence beats a recited paragraph.", "Anchor each answer to something you did in this course."],
    resources: [
      { label: "Computer Networking: A Top-Down Approach (info)", url: "https://gaia.cs.umass.edu/kurose_ross/index.php", kind: "book" },
      { label: "PostgreSQL — indexes overview", url: "https://www.postgresql.org/docs/current/indexes.html", kind: "docs" },
    ],
  },
  c8: {
    keyTakeaways: ["Track every application — company, role, status, next step.", "Referrals beat cold applications.", "Mock interviews close the 'know it' vs 'perform it' gap."],
    resources: [{ label: "roadmap.sh — interview prep", url: "https://roadmap.sh/", kind: "docs" }],
  },

  // ---- ML Bridge (Optional) ----
  ml1: {
    keyTakeaways: ["ML learns patterns from labelled examples instead of hard-coded rules.", "Supervised learning = data with known answers.", "Data quality matters more than model choice."],
    resources: [{ label: "scikit-learn — Getting Started", url: "https://scikit-learn.org/stable/getting_started.html", kind: "docs" }],
  },
  ml2: {
    keyTakeaways: ["The pipeline: collect → clean → split → train → evaluate → serve.", "Most real work is data prep and evaluation.", "This reuses pandas (M3) and Docker (M5)."],
    resources: [{ label: "scikit-learn — user guide", url: "https://scikit-learn.org/stable/user_guide.html", kind: "docs" }],
  },
  ml3: {
    keyTakeaways: ["fit() learns; predict() applies.", "Never fit on the test set.", "The fit/predict shape is consistent across scikit-learn models."],
    resources: [{ label: "scikit-learn — LogisticRegression docs", url: "https://scikit-learn.org/stable/modules/generated/sklearn.linear_model.LogisticRegression.html", kind: "docs" }],
  },
  ml4: {
    keyTakeaways: ["Train to learn, test to honestly evaluate.", "Overfitting = memorising training data, failing on new data.", "A big train/test gap signals overfitting."],
    resources: [{ label: "scikit-learn — train_test_split docs", url: "https://scikit-learn.org/stable/modules/generated/sklearn.model_selection.train_test_split.html", kind: "docs" }],
  },
  ml5: {
    keyTakeaways: ["Accuracy can lie on imbalanced data.", "Precision: of what you flagged, how much was right.", "Recall: of the real positives, how many you caught."],
    resources: [{ label: "scikit-learn — classification_report docs", url: "https://scikit-learn.org/stable/modules/generated/sklearn.metrics.classification_report.html", kind: "docs" }],
  },
  ml6: {
    keyTakeaways: ["Serving turns a notebook model into ML engineering.", "Save once, load once, predict many times.", "Containerising the API makes it reproducible and deployable."],
    resources: [
      { label: "joblib — persistence docs", url: "https://joblib.readthedocs.io/en/latest/persistence.html", kind: "docs" },
      { label: "Flask — quickstart (official)", url: "https://flask.palletsprojects.com/en/latest/quickstart/", kind: "docs" },
    ],
  },
};
