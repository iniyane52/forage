// FORAGE — AI Engineer path, Module 8: Docker & MLOps Basics
// Facts verified against Docker's own "what is an image" docs. This module assumes zero prior
// Docker knowledge (some learners reach AI Engineer without doing Cloud & DevOps first) but
// stays tightly scoped to containerizing the Module 7 model API rather than re-teaching all of
// Docker — the Cloud & DevOps path covers Docker in much greater depth for anyone who wants it.
// Dockerfile/build commands verified by actually building and running the image locally.
// Light quiz model: 1 sharpest MCQ per lesson.

module.exports = {
  id: "aiml-mlops", title: "Docker & MLOps Basics",
  why: "A model API that only runs on your laptop, with your exact Python setup, isn't deployable. Docker packages your model API and everything it needs into one portable unit that runs identically anywhere — the standard way ML services actually reach production.",
  topics: [
  {
    id: "aiml-why-docker-ml", title: "Why containerize a model service?",
    concept: "Per Docker's own documentation, a Docker IMAGE is a self-contained package with everything needed to run an application — code, runtime, libraries, configuration — and a CONTAINER is a running instance of that image (the same relationship as a class and an object). For a model API, this solves a very real problem: your model was trained and served locally with a specific Python version and exact package versions (scikit-learn, FastAPI, etc.); without Docker, 'works on my machine' is a genuine risk — the deployment server might have different versions and behave differently or fail outright.",
    analogy: "Think of a Docker image like a fully-equipped food truck versus a home kitchen: a home kitchen (your laptop) has everything set up just right for YOU, but if you tried to cook the same meal in someone else's kitchen, ingredients or equipment might be missing. A food truck (the container) carries its ENTIRE kitchen with it — parked anywhere, it cooks identically every time, because nothing about its setup depends on the location.",
    examples: [
      {code: "# Without Docker: dependent on whatever happens to be installed locally\n$ python --version\nPython 3.11.4\n$ pip show scikit-learn | grep Version\nVersion: 1.7.2\n\n# The deployment server might have different versions -- risk of mismatch,\n# subtly different behavior, or an outright crash from an incompatible API.", note: "This isn't a lesson to 'run' — it illustrates the real-world problem: your local environment's exact versions are implicit and easy to drift from whatever's on a deployment server, unless you make the environment explicit and portable."},
      {code: "# With Docker: the EXACT environment ships as part of the deployable unit\n$ docker build -t forage-model-api .\n$ docker run -p 8000:8000 forage-model-api\n\n# Runs identically on your laptop, a teammate's laptop, or a cloud server --\n# because the image bundles Python, every pinned package version, and your code together.", note: "The image is the self-contained package Docker's own docs describe; the container is the running instance of it. Everything the API needs travels WITH it, eliminating the 'works on my machine' class of bug entirely."}
    ],
    mistakes: ["Thinking Docker is only for large/complex apps — even a small model API benefits, since the deployment-environment mismatch risk exists at any scale.","Confusing an IMAGE (the static, buildable package) with a CONTAINER (a running instance of that image) — you build an image once, and can run many containers from it.","Assuming containerizing a model automatically makes it fast or scalable — Docker solves portability/reproducibility, not performance; those are separate concerns."],
    handsOn: "Without writing any Docker code yet, write down (in your own words) every piece of your Module 7 FastAPI model API's setup that would need to exist on a fresh machine for it to run: the Python version, every pip package, the saved model file, and the app code itself. This list is exactly what a Dockerfile will need to specify.",
    doneWhen: "You can explain the image/container relationship in your own words and articulate the specific 'works on my machine' risk Docker solves for a model API.",
    checks: [
      {q: "What is the relationship between a Docker image and a Docker container?", a: "An image is the static, self-contained package (like a class or blueprint); a container is a running instance of that image (like an object). You build one image and can run many containers from it."}
    ],
    keyTakeaways: ["A Docker image bundles everything an app needs (runtime, libraries, code) into one portable package.", "A container is a running instance of an image.", "Docker eliminates 'works on my machine' risk by making the exact environment part of what ships."],
    resources: [
      {label: "Docker — What is an image?", url: "https://docs.docker.com/get-started/docker-concepts/the-basics/what-is-an-image/", kind: "docs"},
      {label: "Docker — What is a container?", url: "https://docs.docker.com/get-started/docker-concepts/the-basics/what-is-a-container/", kind: "docs"}
    ]
  },
  {
    id: "aiml-dockerfile-model-api", title: "Writing a Dockerfile for a model API",
    concept: "A Dockerfile is a plain-text list of instructions Docker follows to build an image, layer by layer. For a Python model API, the pattern is consistent: start `FROM` an official Python base image, `COPY` your requirements file and `RUN pip install` (done as an early, separate step so Docker can cache it and skip reinstalling if your code changes but dependencies don't), `COPY` the rest of your app code and saved model file, then tell Docker `CMD` how to actually start the server.",
    analogy: "A Dockerfile is a recipe card, read top to bottom: start with a base ingredient (the Python image), add ingredients in a deliberate order (dependencies before your own code, since dependencies change less often — matching how a good recipe preps the slow-cooking parts first), and end with the final step describing how to serve the dish (the CMD that starts the server).",
    examples: [
      {code: "# Dockerfile\nFROM python:3.11-slim\n\nWORKDIR /app\n\nCOPY requirements.txt .\nRUN pip install --no-cache-dir -r requirements.txt\n\nCOPY main.py .\nCOPY iris_model.joblib .\n\nEXPOSE 8000\nCMD [\"uvicorn\", \"main:app\", \"--host\", \"0.0.0.0\", \"--port\", \"8000\"]", note: "FROM picks a small official Python base image ('slim' keeps the image size down). WORKDIR sets the working directory inside the container. Copying requirements.txt and installing BEFORE copying the app code is deliberate: Docker caches each layer, so if only your code changes (not dependencies), rebuilding skips the slow pip install step."},
      {code: "# requirements.txt -- pinned versions, matching Module 7's actual dependencies\nfastapi==0.139.0\nuvicorn==0.34.0\nscikit-learn==1.9.0\njoblib==1.5.3\nnumpy==2.5.1", note: "Pinning EXACT versions (not just 'fastapi') is what actually delivers the reproducibility promise from the last lesson -- an unpinned requirements file could silently install a newer, differently-behaving version on a future build."}
    ],
    warn: "CMD must bind to host \"0.0.0.0\", not \"127.0.0.1\"/\"localhost\" — inside a container, binding to localhost only accepts connections from WITHIN the container itself, making the API unreachable from outside even with the port correctly exposed. This is one of the most common first-timer container networking bugs.",
    mistakes: ["Binding the server to 127.0.0.1/localhost instead of 0.0.0.0 inside the container — it becomes unreachable from outside.","Copying application code BEFORE installing dependencies — this breaks Docker's layer caching, forcing a slow full reinstall on every single code change.","Using an unpinned requirements.txt — defeats the entire reproducibility purpose of containerizing in the first place."],
    handsOn: "Write a Dockerfile for your Module 7 FastAPI app following this pattern: base image, WORKDIR, copy+install requirements (pinned versions), copy app code and the saved model file, EXPOSE, and CMD to start uvicorn bound to 0.0.0.0. Don't build it yet — just get the file written and review it against this checklist.",
    doneWhen: "You have a complete, correctly-ordered Dockerfile for a FastAPI model API, with pinned dependencies and the server correctly bound to 0.0.0.0.",
    checks: [
      {q: "Why copy and install requirements.txt BEFORE copying the rest of the application code in a Dockerfile?", a: "Docker caches each instruction as a layer; if dependencies (which change less often) are installed in an earlier layer than the app code (which changes often), rebuilding after a code-only change can reuse the cached dependency-install layer instead of redoing it, making rebuilds much faster."}
    ],
    keyTakeaways: ["A Dockerfile is an ordered recipe: base image -> dependencies -> app code -> start command.", "Installing dependencies before copying app code takes advantage of Docker's layer caching.", "Bind the server to 0.0.0.0 inside a container, never 127.0.0.1/localhost."],
    resources: [
      {label: "Docker — Dockerfile reference", url: "https://docs.docker.com/reference/dockerfile/", kind: "docs"},
      {label: "Docker — Building best practices", url: "https://docs.docker.com/build/building/best-practices/", kind: "docs"}
    ]
  },
  {
    id: "aiml-build-run-container", title: "Building and running the container",
    concept: "`docker build` reads a Dockerfile and produces an image, tagged with a name you choose (`-t`). `docker run` starts a container from that image; `-p HOST_PORT:CONTAINER_PORT` maps a port on your machine to the port the app listens on INSIDE the container, which is what actually makes the API reachable from your browser or a tool like curl. Once running, you interact with the containerized API exactly like you would the one running locally in Module 7 — same requests, same JSON — except now it's running inside an isolated, fully self-contained environment.",
    analogy: "`docker build` is baking the food truck's full kitchen setup into a shippable unit; `docker run` is parking that truck and opening its service window. The `-p` port mapping is choosing which street-facing window customers use to place an order — without it, the truck could be fully operational inside but literally unreachable from outside.",
    examples: [
      {code: "# Build the image (run from the directory with the Dockerfile)\n$ docker build -t forage-model-api .\n\n# -t names/tags the image so you can refer to it later\n# the trailing . tells Docker to use the current directory as build context", note: "docker build reads the Dockerfile step by step, producing a named, reusable image. This step needs re-running only when the Dockerfile or the files it copies change — not every time you want to run the app."},
      {code: "# Run a container from that image, mapping port 8000 on your machine\n# to port 8000 inside the container (matching the Dockerfile's EXPOSE/CMD)\n$ docker run -p 8000:8000 forage-model-api\n\n# In a separate terminal, the API now responds exactly like it did locally in Module 7:\n$ curl -X POST http://localhost:8000/predict \\\n  -H \"Content-Type: application/json\" \\\n  -d '{\"sepal_length\":5.1,\"sepal_width\":3.5,\"petal_length\":1.4,\"petal_width\":0.2}'\n# {\"predicted_class\":0}", note: "The -p 8000:8000 mapping is what makes localhost:8000 on your machine reach port 8000 INSIDE the container. The response is identical to Module 7's TestClient result -- same model, same logic, now running fully containerized and portable."}
    ],
    mistakes: ["Forgetting the `-p` port mapping — the container runs, but nothing outside it can reach the API.","Mismatching the host/container port order in `-p HOST:CONTAINER` — it's host-first, container-second.","Rebuilding the image after every tiny code change without realizing `docker build` needs to be re-run for changes to take effect — running an old image won't reflect new code."],
    handsOn: "Build your Dockerfile from the last lesson with `docker build -t forage-model-api .`, then run it with `docker run -p 8000:8000 forage-model-api`. In a separate terminal, send the same /predict request you tested with TestClient in Module 7 (via curl or a tool like Postman) and confirm you get an identical prediction back.",
    doneWhen: "You have successfully built an image and run a container from your model API Dockerfile, and confirmed the containerized API responds correctly to a real request.",
    checks: [
      {q: "In `docker run -p 8000:8000 forage-model-api`, what does the -p flag do, and what would happen if you omitted it?", a: "-p maps a port on your machine to a port inside the container, making the containerized service reachable from outside. Without it, the container runs but the API is unreachable — the port inside the container isn't exposed to the host machine."}
    ],
    keyTakeaways: ["docker build produces a named, reusable image from a Dockerfile.", "docker run starts a container from that image; -p maps host:container ports to make it reachable.", "A rebuilt image is required for code changes to take effect — running an old image ignores new changes."],
    resources: [
      {label: "Docker — docker build CLI reference", url: "https://docs.docker.com/reference/cli/docker/build/", kind: "docs"},
      {label: "Docker — docker run CLI reference", url: "https://docs.docker.com/reference/cli/docker/container/run/", kind: "docs"}
    ]
  },
  {
    id: "aiml-mlops-reproducibility", title: "Reproducibility — the core MLOps concern",
    concept: "MLOps (ML Operations) is the discipline of reliably taking a model from a notebook to a running, maintainable production service — and REPRODUCIBILITY is its most foundational concern: given the same code, data, and environment, can you (or a teammate, or a server six months from now) get the exact same trained model and the exact same predictions? Pinned dependencies (last two lessons) handle the ENVIRONMENT half. The other half is tracking exactly which DATA and CODE version produced a given saved model — otherwise 'which exact model is currently live, and can we recreate it?' becomes unanswerable.",
    analogy: "Reproducibility is like a scientific experiment's lab notebook: it's not enough to say 'the reaction worked' — a rigorous record captures the exact reagents, quantities, and conditions used, so anyone (including future-you) can rerun it and get the same result. An ML model without reproducibility tracking is a result nobody can explain or recreate later, which is a real liability once it's making decisions in production.",
    examples: [
      {code: "# Minimal reproducibility discipline for a model artifact\nimport joblib\nimport sklearn\nfrom datetime import datetime, timezone\n\nmetadata = {\n    \"sklearn_version\": sklearn.__version__,\n    \"trained_at\": datetime.now(timezone.utc).isoformat(),\n    \"training_data_rows\": 150,       # e.g. len(X_train)\n    \"model_type\": \"LogisticRegression\",\n    \"git_commit\": \"<paste the git commit hash of the training script here>\",\n}\njoblib.dump(metadata, \"iris_model.meta.joblib\")\nprint(metadata)", note: "This is a MINIMAL pattern, not a production-grade MLOps platform (tools like MLflow or DVC handle this at scale) -- but the core idea generalizes: alongside every saved model, record what produced it. Without this, a model file six months from now is an unexplainable black box."},
      {code: "# Confirm the saved model version pin actually matches what's installed\nimport sklearn\nprint(\"currently installed:\", sklearn.__version__)\n\nsaved_meta = joblib.load(\"iris_model.meta.joblib\")\nprint(\"model was trained with:\", saved_meta[\"sklearn_version\"])\nprint(\"match:\", sklearn.__version__ == saved_meta[\"sklearn_version\"])", note: "A real-world version mismatch check: if the environment currently running the model has drifted from the version it was TRAINED with, that's a concrete, checkable risk signal -- exactly the kind of drift Docker's pinned requirements.txt is designed to prevent from happening in the first place."}
    ],
    mistakes: ["Treating 'it works right now' as sufficient — reproducibility is about whether it STILL works and can be recreated later, by someone else, or after an environment changes.","Saving a model without any record of what data/code/versions produced it — an unrecoverable black box a few months later.","Assuming MLOps tooling (MLflow, DVC, CI/CD pipelines) is only for huge teams — the underlying DISCIPLINE (pin versions, record metadata, containerize) matters even for a solo project, and scales up to those tools naturally."],
    handsOn: "Add a small metadata-recording step to your Module 3/7 model training script: capture the scikit-learn version, training timestamp, and dataset size alongside the saved model. Then write one paragraph explaining, in your own words, what 'reproducibility' means for an ML model and why a pinned Docker image is only HALF the story.",
    doneWhen: "You can explain reproducibility as a core MLOps concern distinct from just 'does it currently work', and you've recorded basic model metadata alongside a saved model.",
    checks: [
      {q: "Why isn't pinning dependency versions in a Dockerfile alone sufficient for full ML reproducibility?", a: "Pinned dependencies solve the ENVIRONMENT half of reproducibility, but you also need to know which exact DATA and CODE version produced a given saved model — without recording that, you can't recreate or explain a specific model months later even with the right library versions."}
    ],
    keyTakeaways: ["Reproducibility means being able to recreate the same trained model and predictions later, by anyone.", "Pinned dependencies (Docker) handle the environment half; recording data/code/version metadata handles the other half.", "This discipline scales from a solo project up to dedicated MLOps tools (MLflow, DVC) at team scale."],
    resources: [
      {label: "MLflow — Model tracking overview", url: "https://mlflow.org/docs/latest/tracking.html", kind: "docs"},
      {label: "Google Cloud — MLOps: Continuous delivery and automation pipelines in ML", url: "https://cloud.google.com/architecture/mlops-continuous-delivery-and-automation-pipelines-in-machine-learning", kind: "reference"}
    ]
  }
  ]
};
