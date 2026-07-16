// FORAGE — AI Engineer path, Module 7: Serving Models as APIs
// Facts verified against FastAPI's own docs (first-steps, request body/Pydantic, path params)
// and scikit-learn's model persistence docs (joblib). Every runnable snippet executed for real
// (joblib save/load; FastAPI app imported and exercised via TestClient) before shipping.
// Light quiz model: 1 sharpest MCQ per lesson.

module.exports = {
  id: "aiml-serving", title: "Serving Models as APIs",
  why: "A trained model sitting in a notebook helps nobody — it becomes useful once other software can send it data and get predictions back. This module takes a model you already know how to train (Module 3) and wraps it in a real HTTP API using FastAPI, connecting directly to the Cloud & DevOps path's Docker skills for the next module.",
  topics: [
  {
    id: "aiml-save-load-model", title: "Saving and loading a trained model",
    concept: "Training a model is expensive (even a small one takes real compute); you don't want to retrain it every time you need a prediction. `joblib` (scikit-learn's own recommended tool for this) serializes a fitted model's entire state — including its learned `.coef_`/`.intercept_` or tree structure — to a file, and can load it back later as a fully working model, without retraining. This is the first step toward serving: train once, save once, then load the saved file inside whatever serves predictions.",
    analogy: "Training a model is like baking a cake from scratch — time-consuming, and you don't want to redo it for every slice served. Saving the model with joblib is like freezing the finished cake: loading it back later is just thawing it, ready to serve immediately, no re-baking required.",
    examples: [
      {code: "from sklearn.datasets import load_iris\nfrom sklearn.linear_model import LogisticRegression\nimport joblib\n\nX, y = load_iris(return_X_y=True)\nmodel = LogisticRegression(max_iter=200).fit(X, y)\n\njoblib.dump(model, \"iris_model.joblib\")\nprint(\"saved\")", note: "joblib.dump() writes the fitted model's complete state to disk in one call. scikit-learn's own persistence docs specifically recommend joblib over Python's generic pickle for scikit-learn models, since it's more efficient for the large NumPy arrays models often contain."},
      {code: "import joblib\n\nloaded_model = joblib.load(\"iris_model.joblib\")\nsample = X[:1]           # reuse first row from above\npred = loaded_model.predict(sample)\nprint(pred)               # matches what the original model would have predicted\nprint((loaded_model.predict(X) == model.predict(X)).all())   # True -- identical predictions", note: "The loaded model produces IDENTICAL predictions to the original — nothing was lost or changed in the save/load round trip. This confirms the file genuinely captures everything needed to make predictions without any retraining."}
    ],
    mistakes: ["Using Python's built-in `pickle` instead of `joblib` for scikit-learn models — it works, but joblib is scikit-learn's own recommended choice, especially for models with large NumPy arrays.","Loading a saved model with a very different scikit-learn version than it was saved with — version mismatches can cause silent incompatibilities; pin your dependency versions in production.","Forgetting that a saved model file can be large — treat it as a real build artifact (versioned, tracked), not something to casually email around."],
    handsOn: "Train any classifier from Module 3 on a dataset of your choice, save it with joblib.dump(), then in a NEW Python session (or after restarting your kernel) load it back with joblib.load() and confirm its predictions match what you'd expect — without ever calling .fit() again in that new session.",
    doneWhen: "You can save a fitted model to disk and load it back in a fresh session, producing identical predictions with zero retraining.",
    checks: [
      {q: "Why do you save a trained model to a file instead of just retraining it fresh every time you need a prediction?", a: "Training is computationally expensive and doesn't need to happen again once the model has learned its parameters — saving lets you load the already-fitted model instantly and reuse it for predictions without redoing that work."}
    ],
    keyTakeaways: ["joblib.dump()/joblib.load() save and restore a fitted model's complete state.", "scikit-learn recommends joblib over pickle, especially for models containing large arrays.", "A loaded model makes identical predictions to the original — no retraining needed."],
    resources: [
      {label: "scikit-learn — Model persistence", url: "https://scikit-learn.org/stable/model_persistence.html", kind: "docs"},
      {label: "joblib — official docs", url: "https://joblib.readthedocs.io/", kind: "docs"}
    ]
  },
  {
    id: "aiml-fastapi-basics", title: "FastAPI basics — your first endpoint",
    concept: "FastAPI is a Python web framework purpose-built for building APIs quickly, with automatic request validation and interactive documentation. Per its own docs, the minimal app has three pieces: import `FastAPI` and create an `app = FastAPI()` instance, then define a PATH OPERATION — a function decorated with `@app.get(\"/some/path\")` (or `.post`, `.put`, etc.) that runs when a request hits that path+method. Whatever the function returns (a dict, list, etc.) is automatically converted to JSON in the response.",
    analogy: "Think of `@app.get(\"/status\")` as posting a sign at a specific desk in an office ('Desk: /status, Handles: GET requests') with a clerk (your function) standing behind it, ready to respond the moment someone walks up asking for that exact thing. Different paths are different desks; different HTTP methods (GET/POST) are different kinds of requests the same desk can handle.",
    examples: [
      {code: "from fastapi import FastAPI\n\napp = FastAPI()\n\n@app.get(\"/\")\nasync def root():\n    return {\"message\": \"Forage model API is running\"}\n\n@app.get(\"/health\")\nasync def health():\n    return {\"status\": \"ok\"}", note: "This mirrors FastAPI's own minimal example exactly: import, create the app instance, decorate a function with the path+method it handles. A GET request to '/' returns the first dict as JSON; a GET to '/health' returns the second — a common real-world pattern for a health-check endpoint that load balancers ping to confirm the service is alive."},
      {code: "from fastapi.testclient import TestClient\n\nclient = TestClient(app)\nresponse = client.get(\"/health\")\nprint(response.status_code, response.json())", note: "TestClient lets you exercise a FastAPI app directly in Python without actually running a server — useful for automated tests and, here, for verifying the endpoint really works: status 200 and the exact JSON body the function returns."}
    ],
    mistakes: ["Forgetting the `async def` isn't mandatory — plain `def` works fine too for simple endpoints; async matters most once you're doing actual async I/O (like calling another API).","Confusing the DECORATOR path (`@app.get(\"/health\")`) with the FUNCTION NAME — the path in the decorator is what determines the URL, not the Python function's name.","Not testing endpoints before wiring them into a larger app — TestClient lets you verify behavior locally in seconds."],
    handsOn: "Write a minimal FastAPI app with a root endpoint and a /health endpoint, matching the examples. Use TestClient to call both and print the status code and JSON response for each, confirming they return what you expect.",
    doneWhen: "You can write a minimal FastAPI app with at least two GET endpoints and verify their responses with TestClient.",
    checks: [
      {q: "In `@app.get(\"/health\")`, what determines the URL clients use to reach this endpoint — the decorator's path string or the function's name?", a: "The decorator's path string (\"/health\") — that's what FastAPI matches incoming requests against. The function name is just a Python identifier and has no effect on the URL."}
    ],
    keyTakeaways: ["A FastAPI app = FastAPI() instance + path operation functions decorated with @app.get/@app.post/etc.", "The decorator's path string, not the function name, determines the endpoint's URL.", "TestClient lets you exercise endpoints in Python without running a real server."],
    resources: [
      {label: "FastAPI — First Steps (official tutorial)", url: "https://fastapi.tiangolo.com/tutorial/first-steps/", kind: "docs"},
      {label: "FastAPI — full tutorial index", url: "https://fastapi.tiangolo.com/tutorial/", kind: "docs"}
    ]
  },
  {
    id: "aiml-request-validation", title: "Request validation with Pydantic",
    concept: "For a prediction endpoint, clients need to send input data (e.g. iris measurements) as a JSON request body, and that data needs to be the right shape and type before you feed it to your model. FastAPI uses Pydantic — declare a class inheriting from `BaseModel` with type-annotated fields — and per FastAPI's own docs, declaring that class as a function parameter makes FastAPI automatically read the JSON body, validate every field's type, and return a clear error response if anything doesn't match, all before your function code even runs.",
    analogy: "A Pydantic model is like a strict intake form at a clinic: it lists exactly which fields are required (name, date of birth) and their expected format (a date must be a real date, not text). The receptionist (FastAPI) rejects an incomplete or malformed form at the front desk with a clear explanation of what's wrong — your actual function only ever sees a fully valid, correctly-typed form.",
    examples: [
      {code: "from fastapi import FastAPI\nfrom pydantic import BaseModel\n\napp = FastAPI()\n\nclass IrisInput(BaseModel):\n    sepal_length: float\n    sepal_width: float\n    petal_length: float\n    petal_width: float\n\n@app.post(\"/echo\")\nasync def echo(features: IrisInput):\n    return features.model_dump()", note: "Every field is required (no default given) and must be a float. FastAPI reads the incoming JSON body, validates it against IrisInput, and only calls echo() if it passes -- features.model_dump() converts the validated object back to a plain dict, mirroring FastAPI's own request-body documentation pattern."},
      {code: "from fastapi.testclient import TestClient\n\nclient = TestClient(app)\n\nvalid = client.post(\"/echo\", json={\"sepal_length\": 5.1, \"sepal_width\": 3.5, \"petal_length\": 1.4, \"petal_width\": 0.2})\nprint(valid.status_code, valid.json())\n\ninvalid = client.post(\"/echo\", json={\"sepal_length\": \"not a number\", \"sepal_width\": 3.5, \"petal_length\": 1.4, \"petal_width\": 0.2})\nprint(invalid.status_code)   # 422 -- validation error, function never even runs", note: "A well-formed request (status 200) round-trips through cleanly. A request with a bad type ('not a number' where a float is required) never reaches the function body at all -- FastAPI rejects it automatically with a 422 Unprocessable Entity status, exactly the automatic-validation behavior FastAPI's docs describe."}
    ],
    mistakes: ["Manually parsing and validating the request body yourself instead of using a Pydantic model — you'd be reimplementing what FastAPI already does automatically and safely.","Making fields optional (giving them defaults) when they're actually required for the model to work — an accidentally-missing feature can silently break a prediction instead of being rejected upfront.","Not testing what happens with malformed input — always check the 422 error path, not just the happy path."],
    handsOn: "Define a Pydantic model matching the features your Module 3 model expects (or reuse IrisInput), add a POST endpoint that accepts it, and test both a valid request (confirm 200) and an invalid one — wrong type, or a missing required field — and confirm you get a 422 without your function code ever running.",
    doneWhen: "You can define a Pydantic request model, wire it into a POST endpoint, and demonstrate both the valid-request success path and the invalid-request automatic-rejection path.",
    checks: [
      {q: "A POST request to an endpoint expecting a Pydantic model is missing a required field. What HTTP status does FastAPI return, and does your endpoint function ever run?", a: "422 Unprocessable Entity — and no, the function never runs. FastAPI validates the body against the Pydantic model BEFORE calling your function, rejecting invalid requests automatically."}
    ],
    keyTakeaways: ["A Pydantic BaseModel declared as a parameter makes FastAPI auto-validate the JSON request body.", "Invalid requests are rejected with a 422 before your function code ever runs.", "This eliminates the need to hand-write validation logic."],
    resources: [
      {label: "FastAPI — Request Body (Pydantic models)", url: "https://fastapi.tiangolo.com/tutorial/body/", kind: "docs"},
      {label: "Pydantic — official docs", url: "https://docs.pydantic.dev/latest/", kind: "docs"}
    ]
  },
  {
    id: "aiml-prediction-endpoint", title: "Wiring a real prediction endpoint",
    concept: "Now combine the last three lessons into a genuine model-serving endpoint: load a saved model ONCE when the app starts (not on every request — that would be slow and wasteful), define a Pydantic input model matching the model's expected features, and write a POST endpoint that converts the validated input into the array shape scikit-learn expects, calls `.predict()`, and returns the result as JSON. This is the actual pattern real ML services use in production, just at toy scale.",
    analogy: "Loading the model once at startup is like a restaurant's kitchen prepping its equipment before opening, not re-setting-up the whole kitchen for every single order. Once the doors are open (the app is running), each order (each request) just uses the already-ready equipment — fast, because the expensive setup already happened.",
    examples: [
      {code: "from fastapi import FastAPI\nfrom pydantic import BaseModel\nimport joblib\nimport numpy as np\n\napp = FastAPI()\nmodel = joblib.load(\"iris_model.joblib\")   # loaded ONCE at import/startup time\n\nclass IrisInput(BaseModel):\n    sepal_length: float\n    sepal_width: float\n    petal_length: float\n    petal_width: float\n\n@app.post(\"/predict\")\nasync def predict(features: IrisInput):\n    x = np.array([[features.sepal_length, features.sepal_width,\n                    features.petal_length, features.petal_width]])\n    pred = model.predict(x)[0]\n    return {\"predicted_class\": int(pred)}", note: "The model loads once, outside the endpoint function, when the module is imported -- every request reuses that same already-loaded model, never reloading from disk. The Pydantic-validated input is reshaped into the (1, 4) array scikit-learn's .predict() expects (Module 3's shape convention: rows=examples, columns=features)."},
      {code: "from fastapi.testclient import TestClient\n\nclient = TestClient(app)\nresponse = client.post(\"/predict\", json={\n    \"sepal_length\": 5.1, \"sepal_width\": 3.5, \"petal_length\": 1.4, \"petal_width\": 0.2\n})\nprint(response.status_code, response.json())", note: "A full round trip: JSON in, validated by Pydantic, reshaped into a NumPy array, predicted by the loaded model, returned as JSON -- the complete real-world pattern, confirmed working end-to-end with TestClient."}
    ],
    warn: "int(pred) matters here: scikit-learn's .predict() often returns NumPy integer types (like numpy.int64), which are NOT directly JSON-serializable — casting to Python's built-in int (or .item() on the array) avoids a serialization error that's a very common first-timer bug when wiring up a prediction endpoint.",
    mistakes: ["Loading the model INSIDE the endpoint function — this reloads it from disk on every single request, which is slow and wasteful; load it once at module level instead.","Forgetting to cast NumPy types (like numpy.int64/float64) to plain Python int/float before returning them — FastAPI's default JSON encoder can choke on raw NumPy types.","Not matching the input array's shape/column order to what the model was actually trained on — a silent, hard-to-debug source of wrong predictions."],
    handsOn: "Build the full example: save a Module 3 model with joblib, load it once in a FastAPI app, define a matching Pydantic input model, and wire a /predict POST endpoint. Test it with TestClient using a real example from your dataset and confirm the prediction matches what you'd get calling .predict() directly in a notebook.",
    doneWhen: "You have a working /predict endpoint that loads a model once, validates input via Pydantic, and returns a correctly-typed JSON prediction, verified end-to-end.",
    checks: [
      {q: "Why should a model be loaded once at the module/app level instead of inside the endpoint function?", a: "Loading from disk is relatively slow; loading it inside the endpoint function would reload the model from disk on EVERY request, wasting time and resources. Loading once at startup means every request reuses the same already-loaded model in memory."},
      {q: "A prediction endpoint returns a 500 error with a JSON serialization complaint about numpy.int64. What's the likely fix?", a: "Cast the model's raw NumPy prediction output to a plain Python type (e.g. int(pred) or pred.item()) before returning it — FastAPI's default JSON encoder doesn't know how to serialize raw NumPy scalar types directly."}
    ],
    keyTakeaways: ["Load the model once at startup; reuse it across all requests.", "Convert validated Pydantic input into the array shape the model expects before calling .predict().", "Cast NumPy output types to plain Python types before returning JSON."],
    resources: [
      {label: "FastAPI — Path Parameters and Request Body (combining patterns)", url: "https://fastapi.tiangolo.com/tutorial/body/", kind: "docs"},
      {label: "scikit-learn — Model persistence", url: "https://scikit-learn.org/stable/model_persistence.html", kind: "docs"}
    ]
  },
  {
    id: "aiml-api-error-handling", title: "Handling errors and bad input gracefully",
    concept: "A production-worthy API needs to handle more than the happy path: what if the input values are technically valid floats but nonsensical for the model (e.g. a negative petal length)? What if the model file fails to load at startup? FastAPI lets you raise an `HTTPException` with a specific status code and message to return a clear, structured error instead of a raw crash. Good API design distinguishes CLIENT errors (bad input — 4xx status codes) from SERVER errors (something broke on your end — 5xx status codes), so callers can tell whose problem it is and react appropriately.",
    analogy: "A good error response is like a helpful store clerk explaining exactly why your return was rejected ('this receipt is for a different store' — a client problem) versus admitting the register itself is broken ('sorry, our system is down right now' — a server problem). A vague crash is like the clerk just walking away without a word — technically 'handled,' but useless to the customer trying to figure out what to do next.",
    examples: [
      {code: "from fastapi import FastAPI, HTTPException\nfrom pydantic import BaseModel, field_validator\n\napp = FastAPI()\n\nclass IrisInput(BaseModel):\n    sepal_length: float\n    sepal_width: float\n    petal_length: float\n    petal_width: float\n\n    @field_validator(\"sepal_length\", \"sepal_width\", \"petal_length\", \"petal_width\")\n    @classmethod\n    def must_be_positive(cls, v):\n        if v <= 0:\n            raise ValueError(\"measurements must be positive\")\n        return v\n\n@app.post(\"/predict\")\nasync def predict(features: IrisInput):\n    return {\"received\": features.model_dump()}", note: "A Pydantic field_validator adds a domain rule beyond just 'is this a float' -- a negative measurement is technically a valid float but nonsensical for a flower. FastAPI turns a raised ValueError from a validator into an automatic 422 response, explaining exactly which field failed and why."},
      {code: "from fastapi.testclient import TestClient\n\nclient = TestClient(app)\nbad = client.post(\"/predict\", json={\"sepal_length\": -1.0, \"sepal_width\": 3.5, \"petal_length\": 1.4, \"petal_width\": 0.2})\nprint(bad.status_code)                 # 422\nprint(bad.json()[\"detail\"][0][\"msg\"])  # mentions the validation failure", note: "The negative sepal_length is caught before the endpoint function ever runs, returning a 422 with a message pointing at exactly what was wrong -- far more useful to the API's caller than a generic crash or, worse, a nonsensical prediction computed from garbage input."}
    ],
    mistakes: ["Letting bad-but-technically-typed input (like a negative measurement) flow straight into the model — validate domain rules, not just data types.","Returning a generic 500 error for something that's actually the CLIENT'S fault (bad input) — that miscommunicates whose problem it is and how to fix it.","Exposing raw internal error details (stack traces, file paths) to API callers — return a clear, safe message instead."],
    handsOn: "Add a domain-rule validator to your Pydantic input model from the last lesson (e.g. reject negative or unreasonably large measurements). Test with TestClient using both a technically-valid-but-nonsensical input and a genuinely valid one, and confirm the responses differ as expected (422 vs 200).",
    doneWhen: "You can add a domain-specific validation rule beyond basic type checking, and explain the difference between a 4xx client error and a 5xx server error.",
    checks: [
      {q: "What's the difference between a 4xx and a 5xx HTTP status code, in terms of whose 'fault' the error is?", a: "4xx means the CLIENT's request was the problem (bad/missing/invalid input); 5xx means something failed on the SERVER's end. This distinction helps API callers know whether to fix their request or that the service itself is having an issue."}
    ],
    keyTakeaways: ["Validate domain rules (not just types) to reject nonsensical-but-well-typed input.", "4xx = client's fault (bad input); 5xx = server's fault (something broke internally).", "Clear, specific error messages are part of a production-worthy API, not an afterthought."],
    resources: [
      {label: "FastAPI — Handling Errors", url: "https://fastapi.tiangolo.com/tutorial/handling-errors/", kind: "docs"},
      {label: "MDN — HTTP response status codes", url: "https://developer.mozilla.org/en-US/docs/Web/HTTP/Status", kind: "reference"}
    ]
  }
  ]
};
