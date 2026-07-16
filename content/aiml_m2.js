// FORAGE — AI Engineer path, Module 2: Math Intuition for ML
// Schema matches commoncore.js. No proofs — just the intuition a working ML engineer
// actually uses day to day. Facts verified against numpy.org and scikit-learn.org docs
// (see resources); code snippets are real Python, run and checked before shipping.

module.exports = {
  id: "aiml-math", title: "Math Intuition for ML",
  why: "You don't need a maths degree to use ML well, but every model — from a simple regression to a transformer — is built from four ideas: vectors, weighted sums, gradients, and probability. This module builds the intuition, not the proofs, so the next modules stop feeling like magic.",
  topics: [
  {
    id: "aiml-vectors", title: "Vectors & dot products — the building block of every prediction",
    concept: "A vector is just an ordered list of numbers — a row of features, like [height, weight, age]. The dot product of two same-length vectors multiplies each pair of matching numbers and adds up the results into a single number. That single operation — multiply-and-sum — is how almost every ML model turns a row of input features into one prediction number: multiply each feature by a learned \"weight\" and sum the results.",
    analogy: "Think of a restaurant bill: you have quantities [2 coffees, 1 cake, 3 waters] and prices [$3, $5, $1]. The total bill is the dot product: (2×3)+(1×5)+(3×1) = $14. A model's prediction works the same way — multiply each feature by how much it \"costs\" (its weight), then sum for the final number.",
    examples: [
      {code: "import numpy as np\n\nfeatures = np.array([2, 1, 3])   # quantities: coffees, cake, waters\nprices   = np.array([3, 5, 1])   # price per item\n\ntotal = np.dot(features, prices)\nprint(total)   # 14", note: "np.dot on two 1D arrays computes the sum of element-wise products: (2*3)+(1*5)+(3*1) = 6+5+3 = 14. This is the exact mathematical definition NumPy's own docs give for 1D dot products — an inner product returning a single scalar."},
      {code: "weights = np.array([0.5, -1.2, 0.3])   # a toy model's learned weights\nx = np.array([180, 75, 25])             # a person's [height_cm, weight_kg, age]\n\nprediction = np.dot(x, weights)\nprint(prediction)   # 7.5", note: "This is literally what linear regression and the first layer of a neural network compute: features · weights = one number. Everything more advanced (deep learning, transformers) stacks and repeats this same multiply-and-sum operation."}
    ],
    mistakes: ["Trying to dot-product two vectors of DIFFERENT lengths — NumPy will raise a shape-mismatch error; the vectors must have the same number of elements.","Confusing the dot product (one number out) with element-wise multiplication `a * b` (a vector out, same length as inputs) — they look similar but answer different questions.","Assuming the dot product is the whole model — in practice a learned \"bias\" number is usually added after (`np.dot(x, weights) + bias`), which is the model's baseline before any features are considered."],
    handsOn: "Pick 3 features you could measure about yourself or a friend (e.g. hours slept, cups of coffee, minutes exercised) and 3 made-up weights representing how much each one \"contributes\" to feeling energetic. Compute the dot product by hand, then check it with `np.dot`. Change one weight and see how the prediction shifts.",
    doneWhen: "You can compute a dot product by hand for 3-element vectors, verify it with `np.dot`, and explain in your own words why 'multiply matching features by weights, then sum' is the core operation behind a prediction.",
    checks: [
      {q: "What does the dot product of two vectors return — a vector or a single number?", a: "A single number (scalar) — it's the sum of the element-wise products, not a new vector."},
      {q: "Why must two vectors have the same length to take their dot product?", a: "Because it pairs up matching positions (feature 1 with weight 1, feature 2 with weight 2, ...) and multiplies each pair — there's no valid pairing if the lengths differ."}
    ],
    keyTakeaways: ["A vector is an ordered list of numbers — e.g. a row of features.","The dot product = multiply matching elements, then sum — one number out.","features · weights is the core operation inside most ML predictions."],
    resources: [
      {label: "NumPy — numpy.dot documentation", url: "https://numpy.org/doc/stable/reference/generated/numpy.dot.html", kind: "docs"},
      {label: "Khan Academy — vectors and dot products", url: "https://www.khanacademy.org/math/linear-algebra/vectors-and-spaces/dot-cross-products", kind: "course"}
    ]
  },
  {
    id: "aiml-matrices-ml", title: "Matrices as data tables — many rows, one weighted sum each",
    concept: "In ML, a matrix is usually just your WHOLE dataset: each row is one example (one person, one house, one email), each column is one feature. Multiplying that matrix by a weight vector applies the SAME dot-product prediction to every row at once — one matrix multiplication replaces a loop over every example. This is why ML code looks so short: `X @ weights` predicts an entire dataset in one line.",
    analogy: "If a single dot product is calculating one restaurant bill, a matrix multiplication is calculating EVERY table's bill in the restaurant at once, using the same price list — one operation, many results, because every table's order (row) gets combined with the same prices (weights).",
    examples: [
      {code: "import numpy as np\n\nX = np.array([\n    [180, 75, 25],   # person 1: height, weight, age\n    [165, 60, 30],   # person 2\n    [190, 90, 22]     # person 3\n])\nweights = np.array([0.5, -1.2, 0.3])\n\npredictions = X @ weights   # matrix @ vector -- one prediction per row\nprint(predictions)", note: "`@` is Python's matrix multiplication operator — NumPy's own docs recommend it over `np.dot` specifically for 2D+ arrays. `X @ weights` applies the SAME dot product to every row of X in one shot, producing 3 predictions (one per person) without writing a single loop."},
      {code: "print(X.shape)        # (3, 3) -- 3 people, 3 features\nprint(weights.shape)  # (3,)   -- 3 weights, one per feature\nprint((X @ weights).shape)  # (3,) -- one prediction per row", note: "The rule: to multiply X @ weights, the number of COLUMNS in X must match the number of elements in weights (both 3 here) — that's the shared dimension being summed over, same as a single dot product."}
    ],
    warn: "A shape mismatch here (e.g. 4 features in your data but only 3 weights) is one of the most common real-world ML errors — NumPy will raise a clear error rather than silently producing wrong numbers, so when you see a shape error, it's usually telling you your data and your model disagree about how many features exist.",
    mistakes: ["Forgetting that matrix multiplication requires the INNER dimensions to match (columns of the first = length of the second) — mismatches throw an error rather than a wrong silent answer, which is a feature, not a bug.","Using `*` (element-wise) when you meant `@` (matrix multiplication) — `*` on two same-shaped arrays multiplies position-by-position, a completely different operation.","Thinking of a matrix as 'just a grid of numbers' without connecting each ROW to one real-world example — losing that connection makes debugging shape errors much harder."],
    handsOn: "Build a small matrix (4-5 rows, 3 columns) representing a made-up dataset (rows = examples, columns = features), and a matching 3-element weight vector. Compute all predictions in one line with `@`. Then verify ONE row by hand using the dot-product method from the last lesson, and confirm it matches.",
    doneWhen: "You can explain why `X @ weights` produces one prediction per row, and you've hand-verified at least one row matches what the single dot-product calculation would give.",
    checks: [
      {q: "If X has shape (100, 5) and weights has shape (5,), what shape is `X @ weights`?", a: "(100,) — one prediction per row (100 examples), since each row's 5 features get dot-producted with the 5 weights."},
      {q: "Why does NumPy raise an error instead of a wrong answer when matrix shapes don't match for multiplication?", a: "Because there's no valid mathematical way to pair up mismatched dimensions — raising an error surfaces the mistake immediately instead of silently producing meaningless numbers."}
    ],
    keyTakeaways: ["A matrix in ML is usually your dataset: rows = examples, columns = features.","`X @ weights` predicts every row in one operation — no explicit loop needed.","Shape mismatches are common bugs; NumPy raises clear errors rather than silent wrong answers."],
    resources: [
      {label: "NumPy — numpy.matmul / @ operator", url: "https://numpy.org/doc/stable/reference/generated/numpy.matmul.html", kind: "docs"},
      {label: "3Blue1Brown — Essence of Linear Algebra (free video series)", url: "https://www.3blue1brown.com/topics/linear-algebra", kind: "course"}
    ]
  },
  {
    id: "aiml-gradients", title: "Gradients & slopes — which way is downhill?",
    concept: "A gradient is just a generalised slope: for a simple curve, the slope tells you which direction is 'uphill' and how steep it is at your current point. For an ML model with many weights, the gradient does the same thing across all of them at once — it points in the direction that makes the error INCREASE fastest. Since we want to REDUCE error, training repeatedly nudges the weights in the OPPOSITE direction to the gradient, a little at a time. That's the entire idea behind \"gradient descent\" — no calculus proof required to use it well.",
    analogy: "Imagine standing on a hillside in thick fog, trying to reach the valley floor (lowest error) by feel alone. At each step, you feel which direction is steepest UPHILL under your feet (the gradient) and step the opposite way — downhill. Take enough small steps, always away from 'uphill', and you eventually reach the bottom. That blind, one-step-at-a-time process IS gradient descent.",
    examples: [
      {code: "# A tiny numerical illustration -- NOT how real training works internally,\n# but shows what 'the gradient points uphill' means in practice.\ndef error(w):\n    return (w - 3) ** 2   # error is smallest (0) when w = 3\n\ndef approx_gradient(w, step=1e-4):\n    return (error(w + step) - error(w - step)) / (2 * step)\n\nfor w in [0, 2, 3, 5]:\n    print(f\"w={w}: error={error(w):.2f}, gradient={approx_gradient(w):.2f}\")", note: "Notice: at w=0 and w=2 (below the minimum at w=3), the gradient is NEGATIVE — meaning error increases as w decreases, so you'd want to move w UP. At w=5 (above the minimum), the gradient is POSITIVE — error increases as w increases, so you'd move w DOWN. The gradient always points toward MORE error; you move the opposite way."}
    ],
    mistakes: ["Thinking the gradient points toward the minimum (lowest error) — it's the OPPOSITE: the gradient points toward increasing error, which is exactly why training SUBTRACTS a scaled version of it from the weights.","Taking steps that are too large (a high 'learning rate') — you can overshoot the valley floor entirely and bounce around without ever settling, exactly as scikit-learn's own documentation warns.","Taking steps that are too small — training crawls and can take far too long, or get stuck accepting a mediocre result too early."],
    handsOn: "Using the `error(w)` and `approx_gradient(w)` functions above, write a small loop that starts at w=0 and repeatedly does `w = w - 0.1 * approx_gradient(w)` for 20 steps, printing w each time. Watch it converge toward w=3 (the true minimum) — you've just implemented gradient descent by hand.",
    doneWhen: "You can explain, in your own words, why training subtracts the gradient rather than adds it, and you've watched a simple hand-written loop converge toward a known minimum.",
    checks: [
      {q: "Does the gradient point toward the minimum error or away from it?", a: "Away from it — the gradient points in the direction of steepest INCREASING error, so training moves in the opposite direction (subtracts the gradient) to reduce error."},
      {q: "What happens if the learning rate (step size) is too large?", a: "The updates can overshoot the minimum and bounce around or diverge entirely, never settling — exactly as scikit-learn's documentation warns for SGD."}
    ],
    keyTakeaways: ["A gradient is a generalised slope — it points toward increasing error.","Training subtracts the gradient (moves opposite to it) to reduce error, step by step.","The learning rate controls step size — too big overshoots, too small crawls."],
    resources: [
      {label: "scikit-learn — Stochastic Gradient Descent (mathematical formulation)", url: "https://scikit-learn.org/stable/modules/sgd.html", kind: "docs"},
      {label: "3Blue1Brown — Gradient descent, how neural networks learn (free video)", url: "https://www.3blue1brown.com/lessons/gradient-descent", kind: "course"}
    ]
  },
  {
    id: "aiml-probability", title: "Probability basics for ML",
    concept: "ML models constantly deal in uncertainty, not certainty: a spam filter doesn't KNOW an email is spam, it estimates a probability (e.g. 92% likely). Three ideas cover most of what you need day to day: a probability is a number between 0 and 1 representing how likely something is; probabilities of all possible outcomes for one event sum to 1; and a 'distribution' just describes how probability is spread across possible outcomes (e.g. most emails are clearly spam or clearly not, few sit near 50%).",
    analogy: "A weather forecast saying '70% chance of rain' isn't a fact about today — it's a summary of how similar past days turned out. An ML classifier's '92% spam' works the same way: not certainty, but a calibrated guess based on patterns in similar examples it has seen before.",
    examples: [
      {code: "import numpy as np\n\n# A toy classifier's output for 5 emails: probability each is spam\nspam_probs = np.array([0.92, 0.05, 0.51, 0.88, 0.12])\n\n# Convert probabilities to a hard yes/no decision using a threshold\npredictions = spam_probs > 0.5\nprint(predictions)   # [ True False  True  True False]", note: "This is exactly how classifiers usually work under the hood: the model outputs a probability, and a THRESHOLD (commonly 0.5, but tunable) turns it into a decision. Notice email 3 (0.51) is barely over the line — a probability near 0.5 means the model is genuinely unsure, not confidently right."},
      {code: "outcomes = np.array([\"spam\", \"not spam\"])\nprobs = np.array([0.92, 0.08])\nprint(probs.sum())   # 1.0 -- the two possible outcomes must sum to 1", note: "This is the rule that all mutually exclusive outcomes of one event must sum to exactly 1 — a useful sanity check: if your model's output probabilities for one example don't sum to ~1, something's wrong with how you're interpreting them."}
    ],
    mistakes: ["Treating a model's probability output as a guaranteed fact — 92% confident is still 8% wrong, on average, across many similar predictions.","Always using 0.5 as the decision threshold without thinking — for something like cancer screening, you might deliberately lower the threshold to catch more true cases, accepting more false alarms in exchange.","Confusing 'the model is uncertain' (probability near 0.5) with 'the model is broken' — genuine ambiguity in the data is expected, not a bug."],
    handsOn: "Take the 5 spam probabilities above (or make up your own 5-10 values between 0 and 1). Try three different thresholds (0.3, 0.5, 0.7) and see how the yes/no decisions change. Write one sentence about the tradeoff: what happens to the number of 'spam' predictions as the threshold rises?",
    doneWhen: "You can explain what a probability threshold does, and you've observed how changing it shifts the balance between catching more positives versus fewer false alarms.",
    checks: [
      {q: "If a spam filter says an email is '70% spam', does that mean the email is definitely spam?", a: "No — it's a calibrated estimate of likelihood, not certainty. About 30% of emails given that same score would typically NOT be spam."},
      {q: "What does raising the decision threshold from 0.5 to 0.7 generally do to the number of positive predictions?", a: "It reduces them — only examples the model is MORE confident about (≥70%) get classified positive, so fewer things cross the bar, typically catching fewer false positives but also fewer true positives."}
    ],
    keyTakeaways: ["ML predictions are usually probabilities (0 to 1), not certainties.","A threshold turns a probability into a yes/no decision — and the threshold is a real, tunable choice.","Probabilities of all outcomes for one event sum to 1 — a handy sanity check."],
    resources: [
      {label: "Khan Academy — Statistics and probability", url: "https://www.khanacademy.org/math/statistics-probability", kind: "course"},
      {label: "scikit-learn — probability calibration", url: "https://scikit-learn.org/stable/modules/calibration.html", kind: "docs"}
    ]
  },
  {
    id: "aiml-loss", title: "Why we minimize loss",
    concept: "A loss function is a single number that measures how WRONG a model's predictions are — small when predictions are close to the true answers, large when they're far off. Training a model is nothing more than: pick a loss function that captures what 'wrong' means for your problem, then use gradient descent to nudge the weights in the direction that makes that number smaller. Every model — linear regression, a decision tree ensemble, a giant neural network — is doing exactly this, just with different loss functions and different ways of computing the gradient.",
    analogy: "Loss is the golf score of machine learning: a single number you're trying to minimize. You don't directly control the ball's exact path (the model's internal weights are complex and hard to reason about directly) — you just keep adjusting your swing (the weights) based on feedback (the gradient of the loss) until the score gets better.",
    examples: [
      {code: "import numpy as np\n\ntrue_values = np.array([3.0, 5.0, 2.5, 7.0])\npredictions = np.array([2.8, 5.4, 2.0, 6.5])\n\nerrors = predictions - true_values\nmse = np.mean(errors ** 2)   # Mean Squared Error -- a common regression loss\nprint(mse)", note: "Squaring the errors before averaging does two things: it makes all errors positive (so a +2 error and a -2 error don't cancel out), and it penalises BIG errors disproportionately more than small ones — being off by 4 contributes 16 to the average, not just 4. That's a deliberate design choice in MSE, not an accident."},
      {code: "true_labels = np.array([1, 0, 1, 1])       # 1 = spam, 0 = not spam\npredicted_probs = np.array([0.9, 0.1, 0.6, 0.3])  # model's probability of spam\n\n# Simplified accuracy check -- NOT the actual loss function classifiers train with,\n# but shows the same idea: measure how far predictions are from the truth.\ncorrect = (predicted_probs > 0.5).astype(int) == true_labels\nprint(correct)          # [ True  True  True False]\nprint(correct.mean())   # 0.75 -- 75% accuracy", note: "Real classifiers train with a smoother loss (commonly 'log loss' / cross-entropy) rather than raw accuracy, specifically because accuracy has NO gradient — it jumps in sharp steps (right or wrong) instead of changing smoothly, so gradient descent has nothing to follow. Log loss gives smooth, gradient-friendly feedback even when a prediction is 'almost right'."}
    ],
    mistakes: ["Assuming any 'error metric' works as a training loss — some metrics (like plain accuracy) don't have a usable gradient, so models can't be trained directly on them, even though we still REPORT accuracy at the end to humans.","Forgetting that squaring errors (as in MSE) makes large errors matter disproportionately more — appropriate for some problems, actively wrong for others (e.g. when a few extreme outliers shouldn't dominate training).","Believing a lower training loss always means a better model — a model can achieve near-zero loss on training data by memorising it (overfitting) while performing badly on new data, a topic the Model Evaluation module covers next."],
    handsOn: "Using the `true_values`/`predictions` example, change 2-3 of the prediction values to be further from the truth and recompute the MSE. Confirm it goes up. Then try making ONE prediction wildly wrong (e.g. off by 20) and observe how much MORE the MSE jumps compared to a few small errors — that's the squaring effect in action.",
    doneWhen: "You can compute MSE by hand for a small example, explain why squaring errors is a deliberate choice (not an accident), and state in your own words how training connects to the gradients lesson: minimize loss by repeatedly stepping the weights against its gradient.",
    checks: [
      {q: "Why does Mean Squared Error square the errors before averaging, instead of just averaging the raw errors?", a: "Squaring makes all errors positive (so they don't cancel out) and penalises large errors disproportionately more than small ones — both are deliberate properties of MSE."},
      {q: "Why can't models usually be trained directly on plain accuracy?", a: "Accuracy jumps in sharp steps (a prediction is either right or wrong) and has no smooth gradient for gradient descent to follow — training needs a smoother loss function even if accuracy is what we report to humans afterward."}
    ],
    keyTakeaways: ["Loss is a single number measuring how wrong predictions are — training minimizes it.","MSE squares errors deliberately: no cancellation, and big errors are penalised more.","Training = loss function + gradient descent, applied to whatever kind of model you're using."],
    resources: [
      {label: "scikit-learn — Mean Squared Error and regression metrics", url: "https://scikit-learn.org/stable/modules/model_evaluation.html#mean-squared-error", kind: "docs"},
      {label: "Google Machine Learning Crash Course — Loss", url: "https://developers.google.com/machine-learning/crash-course/linear-regression/loss", kind: "course"}
    ]
  }
  ]
};
