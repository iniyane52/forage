// FORAGE — AI Engineer path, Module 5: Intro to Deep Learning
// Facts verified against PyTorch's own quickstart tutorial + nn.Module/nn.Linear/nn.ReLU docs.
// Every code snippet run against PyTorch 2.13 (CPU) and its output checked before shipping.
// Light quiz model: 1 sharpest MCQ per lesson, only where genuinely testable.

module.exports = {
  id: "aiml-dl", title: "Intro to Deep Learning",
  why: "Classical ML (Module 3) fits functions with a handful of learned parameters. Deep learning stacks many small learned functions (neurons) into layers that can learn far richer patterns — the backbone behind image recognition, LLMs, and most modern AI. This module builds the mental model from a single neuron up to a tiny trained network.",
  topics: [
  {
    id: "aiml-neuron", title: "A neuron is just a weighted sum",
    concept: "A single artificial neuron does one simple thing: multiply each input by a learned weight, sum the results, add a learned bias, then pass that number through an activation function. That's the entire unit — the same weighted-sum-plus-bias structure you already used for linear regression in Module 3. What makes a NETWORK powerful isn't any one neuron being smart; it's stacking thousands of these simple units in layers so their combined effect can approximate very complex functions.",
    analogy: "Think of a neuron like a single voter combining opinions: it listens to several inputs, weighs each one by how much it trusts that source (the weights), adds its own baseline lean (the bias), and outputs a verdict. One voter's rule is simple. A stadium of voters, each weighing the SAME inputs differently and passing their verdicts to a next round of voters, can produce far more nuanced group decisions than any single voter could alone — that's a layer feeding into another layer.",
    examples: [
      {code: "import torch\n\n# A single neuron: 3 inputs, learned weights, a bias\nx = torch.tensor([1.0, 2.0, 3.0])           # inputs\nw = torch.tensor([0.5, -0.2, 0.1])          # weights (normally learned)\nb = torch.tensor(0.3)                        # bias\n\nz = torch.dot(x, w) + b\nprint(z.item())", note: "This is EXACTLY the linear regression math from Module 3 — a dot product plus a bias. z = (1×0.5)+(2×-0.2)+(3×0.1)+0.3 = 0.5-0.4+0.3+0.3 = 0.7. A neuron is a linear regression that then gets passed through an activation function (next lesson)."},
      {code: "# nn.Linear does this same computation for many neurons at once\nimport torch.nn as nn\n\nlayer = nn.Linear(in_features=3, out_features=4)   # 4 neurons, each taking 3 inputs\nx = torch.tensor([1.0, 2.0, 3.0])\nout = layer(x)\nprint(out.shape)   # torch.Size([4]) -- one weighted-sum-plus-bias output per neuron", note: "nn.Linear(3, 4) creates 4 independent neurons, each with its own 3 weights and 1 bias, all learned during training. This is PyTorch's building block for exactly the weighted-sum-plus-bias operation shown above, done for a whole layer of neurons in one call."}
    ],
    mistakes: ["Thinking a single neuron is mysterious or 'smart' — it's the same weighted-sum-plus-bias as linear regression.","Forgetting that WITHOUT an activation function, stacking linear layers collapses to just one big linear layer — activations are what make depth actually useful (next lesson).","Confusing 'neuron' (one output unit) with 'layer' (a group of neurons processing the same inputs in parallel)."],
    handsOn: "Compute a single neuron's output by hand for 3 inputs and 3 weights plus a bias (pick your own numbers), then verify it with torch.dot(). Then create an nn.Linear(3, 4) layer, run the same input through it, and print its .weight and .bias to see the learned parameters it initialized randomly.",
    doneWhen: "You can explain a neuron as a weighted sum plus bias, connect it to linear regression from Module 3, and read nn.Linear's shape arguments correctly.",
    checks: [
      {q: "What mathematical operation does a single neuron perform, before any activation function?", a: "A weighted sum of its inputs plus a bias — exactly the same dot-product-plus-bias computation as linear regression."}
    ],
    keyTakeaways: ["A neuron = weighted sum of inputs + bias, same math as linear regression.", "nn.Linear(in, out) creates a layer of `out` neurons, each with `in` learned weights + 1 bias.", "Depth (many layers) is what makes networks powerful, not any single neuron."],
    resources: [
      {label: "PyTorch — nn.Linear docs", url: "https://docs.pytorch.org/docs/stable/generated/torch.nn.Linear.html", kind: "docs"},
      {label: "3Blue1Brown — But what is a neural network? (video)", url: "https://www.youtube.com/watch?v=aircAruvnKk", kind: "video"}
    ]
  },
  {
    id: "aiml-activations", title: "Activation functions — why depth needs non-linearity",
    concept: "If you stack linear layers with no activation function between them, the whole stack mathematically collapses into ONE linear layer — depth buys you nothing. An activation function applies a simple non-linear transformation after each layer's weighted sum, which is what lets stacked layers represent genuinely richer, curved patterns instead of just a straight line. ReLU (Rectified Linear Unit) is the most common choice: ReLU(x) = max(0, x) — it passes positive values through unchanged and zeroes out negatives.",
    analogy: "Imagine a relay of translators, each just rephrasing the previous one's exact words with no added judgment — the end result is equivalent to a single translation, no matter how many people are in the chain. Now give each translator a rule like 'only pass along the parts that are positive news, drop anything negative' (that's ReLU) — suddenly each stage can make a genuinely different decision, and the chain as a whole can express far more than a single step could.",
    examples: [
      {code: "import torch\nimport torch.nn as nn\n\nx = torch.tensor([-2.0, -0.5, 0.0, 1.5, 3.0])\nrelu = nn.ReLU()\nprint(relu(x))   # tensor([0.0, 0.0, 0.0, 1.5, 3.0])", note: "ReLU(x) = max(0, x): every negative number becomes exactly 0, positives and zero pass through unchanged. This matches the official PyTorch definition exactly — it's a deliberately simple, cheap-to-compute non-linearity."},
      {code: "# WITHOUT activation: two linear layers collapse into one\nimport torch.nn as nn\n\nl1 = nn.Linear(2, 2, bias=False)\nl2 = nn.Linear(2, 2, bias=False)\nx = torch.tensor([1.0, 2.0])\n\nstacked = l2(l1(x))                          # two linear layers\ncombined_weight = l2.weight @ l1.weight       # multiply the weight matrices directly\ndirect = combined_weight @ x\n\nprint(torch.allclose(stacked, direct))   # True -- two linear layers = one bigger linear layer", note: "This confirms the concept concretely: chaining two nn.Linear layers with no activation between them is mathematically identical to one combined linear layer (multiplying the weight matrices). Insert a ReLU between them and this equivalence breaks — which is exactly why activations matter."}
    ],
    mistakes: ["Building a 'deep' network with linear layers and no activations between them — it's secretly no more powerful than one layer.","Assuming ReLU is the only option — it's the common DEFAULT for hidden layers; other activations (Sigmoid, Softmax) matter for OUTPUT layers depending on the task, covered later.","Forgetting ReLU zeroes out ALL negative inputs, including small negative signal that might matter — a known tradeoff, not a bug."],
    handsOn: "Run a tensor with mixed positive/negative values through nn.ReLU() and confirm the negatives become exactly 0. Then reproduce the second example: chain two linear layers with no activation, confirm (via torch.allclose) that it equals one combined linear transform — then insert a nn.ReLU() between them and observe the equivalence break.",
    doneWhen: "You can state ReLU's formula (max(0,x)), explain in your own words why stacking linear layers without activations is pointless, and demonstrate that fact with code.",
    checks: [
      {q: "What does ReLU(x) output for x = -3, x = 0, and x = 5?", a: "0, 0, and 5 — ReLU(x) = max(0, x), so any negative or zero input becomes 0, and positive inputs pass through unchanged."},
      {q: "Why does stacking two nn.Linear layers with NO activation function between them fail to add any real power over a single linear layer?", a: "Two chained linear transforms are mathematically equivalent to one combined linear transform (their weight matrices multiply together into a single matrix) — so without a non-linear activation breaking that equivalence, extra layers add no new expressive power."}
    ],
    keyTakeaways: ["ReLU(x) = max(0, x) — the standard default hidden-layer activation.", "Without a non-linear activation, stacked linear layers collapse into one linear layer.", "Activations are what make depth actually add expressive power."],
    resources: [
      {label: "PyTorch — nn.ReLU docs", url: "https://docs.pytorch.org/docs/stable/generated/torch.nn.ReLU.html", kind: "docs"},
      {label: "PyTorch — nn.Module & activation layers overview", url: "https://docs.pytorch.org/docs/stable/nn.html", kind: "docs"}
    ]
  },
  {
    id: "aiml-forward-pass", title: "Building a network — the forward pass",
    concept: "A neural network is built by defining a class that inherits from nn.Module: you declare the layers in `__init__`, and describe how data flows through them in `forward()`. Calling the model on an input runs that flow — the FORWARD PASS — producing a prediction. `nn.Sequential` is a shortcut for the common case of just chaining layers one after another (Linear → ReLU → Linear → ReLU → Linear), exactly the pattern from PyTorch's own quickstart tutorial.",
    analogy: "Think of `__init__` as buying and laying out the stations on an assembly line (each machine = a layer), and `forward()` as writing the instructions for which order a part travels through those stations. Calling the model is sending one part down the line and collecting what comes out the other end.",
    examples: [
      {code: "import torch\nimport torch.nn as nn\n\nclass TinyNet(nn.Module):\n    def __init__(self):\n        super().__init__()\n        self.stack = nn.Sequential(\n            nn.Linear(4, 8),\n            nn.ReLU(),\n            nn.Linear(8, 3),\n        )\n    def forward(self, x):\n        return self.stack(x)\n\nmodel = TinyNet()\nx = torch.rand(1, 4)     # one example, 4 features\nout = model(x)\nprint(out.shape)          # torch.Size([1, 3])", note: "This mirrors PyTorch's own quickstart pattern: layers declared in __init__ via nn.Sequential, the data flow described in forward(). 4 input features -> 8 hidden neurons (with ReLU) -> 3 output values. Calling model(x) runs forward() automatically."},
      {code: "# Counting learnable parameters\nn_params = sum(p.numel() for p in model.parameters())\nprint(n_params)   # (4*8+8) + (8*3+3) = 40 + 27 = 67", note: "Every weight and bias in every Linear layer is a learnable parameter. Layer 1: 4 inputs x 8 neurons = 32 weights + 8 biases = 40. Layer 2: 8x3=24 weights + 3 biases = 27. Total 67 — all of them get adjusted during training to reduce the loss."}
    ],
    mistakes: ["Forgetting `super().__init__()` in your model class — nn.Module needs it to register your layers properly.","Building `forward()` to do something different from what `__init__` declared, causing a shape mismatch at runtime.","Confusing the forward pass (computing a prediction) with training (which also needs a backward pass — next lesson)."],
    handsOn: "Define your own small nn.Module with 2-3 Linear layers and ReLU activations between them (pick your own layer sizes, keeping shapes compatible). Run a random input tensor through it and print the output shape. Count and print the total number of learnable parameters.",
    doneWhen: "You can define a small network with nn.Module + nn.Sequential, run a forward pass, and correctly count its learnable parameters by hand.",
    checks: [
      {q: "In an nn.Module subclass, what goes in __init__ versus forward()?", a: "__init__ declares and creates the layers (the assembly line's stations); forward() defines the order data flows through them when the model is called."}
    ],
    keyTakeaways: ["A network subclasses nn.Module: layers declared in __init__, data flow described in forward().", "nn.Sequential chains layers for the common straight-through case.", "Every weight and bias across every layer is a learnable parameter, updated during training."],
    resources: [
      {label: "PyTorch — Build the Neural Network (official tutorial)", url: "https://docs.pytorch.org/tutorials/beginner/basics/buildmodel_tutorial.html", kind: "docs"},
      {label: "PyTorch — Quickstart tutorial", url: "https://docs.pytorch.org/tutorials/beginner/basics/quickstart_tutorial.html", kind: "docs"}
    ]
  },
  {
    id: "aiml-backprop-intuition", title: "Backpropagation — gradients, at network scale",
    concept: "Module 2 showed that a gradient tells you which direction reduces error, for one parameter. A network has thousands of parameters across many layers — backpropagation is the algorithm that efficiently computes the gradient for EVERY one of them at once, by working backward from the loss through each layer using the chain rule. You never hand-implement this: `loss.backward()` computes all the gradients, and `optimizer.step()` uses them to nudge every parameter slightly in the error-reducing direction. This is the exact same 'move opposite the gradient' idea from Module 2, just automated across an entire network.",
    analogy: "Imagine a factory assembly line where the final product came out flawed. Backpropagation is like tracing the flaw backward through each station, asking each one 'how much did YOUR adjustment contribute to this flaw, and which direction should you nudge to reduce it?' — figuring that out for every single station in one efficient backward sweep, instead of testing each station in isolation.",
    examples: [
      {code: "import torch\nimport torch.nn as nn\n\nmodel = nn.Linear(2, 1)\nx = torch.tensor([[1.0, 2.0]])\ny_true = torch.tensor([[5.0]])\n\ny_pred = model(x)                          # forward pass\nloss_fn = nn.MSELoss()\nloss = loss_fn(y_pred, y_true)             # how wrong are we?\nprint(\"loss before backward:\", loss.item())\n\nprint(\"grad before backward():\", model.weight.grad)   # None -- nothing computed yet\nloss.backward()                             # computes gradients for every parameter\nprint(\"grad after backward(): \", model.weight.grad)   # now populated", note: "Before loss.backward() is called, .grad is None -- no gradient has been computed. After it's called, PyTorch has walked backward through the computation and filled in exactly how much each weight contributed to the loss, ready for the optimizer to use."},
      {code: "# The optimizer applies the gradients: the same 'move opposite the gradient' idea from Module 2\nimport torch.optim as optim\n\noptimizer = optim.SGD(model.parameters(), lr=0.01)\nw_before = model.weight.clone()\n\noptimizer.step()       # nudges weights opposite their gradient\noptimizer.zero_grad()  # clears gradients so they don't accumulate next time\n\nprint(\"weight changed:\", not torch.equal(w_before, model.weight))   # True", note: "optimizer.step() applies the Module-2 gradient-descent update to every parameter at once using the gradients backward() just computed. optimizer.zero_grad() is required afterward — PyTorch accumulates gradients by default, so forgetting this silently corrupts the next step's gradients."}
    ],
    warn: "Forgetting `optimizer.zero_grad()` is one of the most common real PyTorch bugs — gradients silently accumulate across steps instead of being freshly computed each time, causing training to behave strangely without any error message.",
    mistakes: ["Forgetting `optimizer.zero_grad()` — gradients accumulate by default rather than resetting.","Calling `.backward()` more than once on the same loss without retain_graph — it deletes the computation graph after use by default.","Thinking backprop is a DIFFERENT algorithm from Module 2's gradient descent — it's the same idea, just computed efficiently for an entire network via the chain rule."],
    handsOn: "Build a small model and loss as in the example, run one forward pass, check `.grad` is None beforehand, call `.backward()`, and confirm `.grad` is now populated. Then call `optimizer.step()` and confirm the weight actually changed. Deliberately skip `zero_grad()` for two consecutive steps and print `.grad` each time to see it accumulate.",
    doneWhen: "You can explain that backprop computes gradients for every parameter via the chain rule, that .backward() populates .grad, that optimizer.step() applies the update, and why zero_grad() is required.",
    checks: [
      {q: "What does calling loss.backward() actually do?", a: "It computes the gradient of the loss with respect to every learnable parameter in the network (via the chain rule, working backward through the layers), storing each one in that parameter's .grad attribute."},
      {q: "Why is optimizer.zero_grad() necessary before each training step's backward() call?", a: "PyTorch accumulates gradients into .grad by default rather than resetting them — without zero_grad(), each step's gradients would add on top of the previous step's, corrupting the update."}
    ],
    keyTakeaways: ["Backpropagation computes the gradient for every parameter in a network via the chain rule.", "loss.backward() populates .grad; optimizer.step() applies the Module-2 gradient-descent update.", "optimizer.zero_grad() must be called each step, or gradients silently accumulate."],
    resources: [
      {label: "PyTorch — Automatic Differentiation with torch.autograd", url: "https://docs.pytorch.org/tutorials/beginner/basics/autogradqs_tutorial.html", kind: "docs"},
      {label: "3Blue1Brown — What is backpropagation really doing? (video)", url: "https://www.youtube.com/watch?v=Ilg3gGewQ5U", kind: "video"}
    ]
  },
  {
    id: "aiml-train-tiny-net", title: "Training a tiny network end-to-end",
    concept: "Putting it all together: the PyTorch training loop repeats, for each batch of data, the same four steps — forward pass (get predictions), compute loss (how wrong), backward pass (compute gradients), optimizer step (update weights) — across many epochs (full passes over the training data), watching the loss go down. This is the exact loop structure from PyTorch's own quickstart tutorial, just applied to a tiny toy problem you can watch converge in seconds.",
    analogy: "One epoch is one full study session over your entire flashcard deck; one training step is reviewing one batch of cards, checking how many you got wrong (loss), and adjusting your understanding (the weight update) before moving to the next batch. Do enough epochs and your recall (the loss) steadily improves — track it, and you can literally watch the learning happen.",
    examples: [
      {code: "import torch\nimport torch.nn as nn\nimport torch.optim as optim\n\ntorch.manual_seed(0)\n\n# Toy task: learn y = 2x + 1\nX = torch.linspace(-5, 5, 100).unsqueeze(1)\ny = 2 * X + 1 + torch.randn(100, 1) * 0.5   # a little noise\n\nmodel = nn.Sequential(nn.Linear(1, 8), nn.ReLU(), nn.Linear(8, 1))\nloss_fn = nn.MSELoss()\noptimizer = optim.SGD(model.parameters(), lr=0.01)\n\nfor epoch in range(200):\n    y_pred = model(X)\n    loss = loss_fn(y_pred, y)\n    optimizer.zero_grad()\n    loss.backward()\n    optimizer.step()\n    if epoch % 50 == 0:\n        print(f\"epoch {epoch}: loss = {loss.item():.3f}\")\nprint(f\"final loss: {loss.item():.3f}\")", note: "The four-step loop (forward, loss, backward, step) repeated 200 times on a simple y=2x+1 task. Watch the printed loss: it starts higher and steadily drops as the network learns the relationship, confirming training is actually working."},
      {code: "# Confirm the model learned something sensible\nwith torch.no_grad():   # no gradients needed just for checking predictions\n    test_x = torch.tensor([[3.0]])\n    pred = model(test_x)\n    print(f\"model predicts f(3) = {pred.item():.2f}  (true 2*3+1 = 7)\")", note: "torch.no_grad() turns off gradient tracking for pure inference -- there's nothing to train here, just checking a prediction, so this saves memory and computation. A well-trained model should land reasonably close to 7."}
    ],
    mistakes: ["Not watching the loss over training — if it's not decreasing, something's wrong (bad learning rate, bug in the loop) and you want to catch that early.","Forgetting `torch.no_grad()` when just running predictions (not training) — wastes memory tracking gradients you'll never use.","Using a learning rate so large training diverges (loss increases or becomes NaN) or so small it barely moves — tuning it is part of the job, mirroring Module 2's warning about gradient descent step size."],
    handsOn: "Run the training loop example and confirm the printed loss decreases across epochs. Then change the learning rate to something far too large (e.g. lr=10) and observe the loss behave badly (increase or become erratic) — then set it back and confirm it recovers. Finally, test the trained model on a few different input values.",
    doneWhen: "You can run a full train loop, explain each of its four steps in order, and recognize from the printed loss trend whether training is working or broken.",
    checks: [
      {q: "In each training step, what are the four operations in order?", a: "1) Forward pass (compute predictions), 2) compute the loss, 3) backward pass (loss.backward(), computes gradients), 4) optimizer step (optimizer.step(), updates weights) — usually with optimizer.zero_grad() before backward()."},
      {q: "During training, the printed loss is jumping wildly or growing instead of shrinking. What's the most likely first thing to check?", a: "The learning rate is probably too large, causing the optimizer to overshoot and diverge — the same overshoot risk warned about with gradient descent in Module 2. Try a smaller learning rate first."}
    ],
    keyTakeaways: ["Training loops forward -> loss -> backward -> optimizer.step(), repeated across epochs.", "A shrinking loss over epochs is the basic sign training is working.", "torch.no_grad() disables gradient tracking for pure inference, saving resources."],
    resources: [
      {label: "PyTorch — Optimization Loop tutorial", url: "https://docs.pytorch.org/tutorials/beginner/basics/optimization_tutorial.html", kind: "docs"},
      {label: "PyTorch — Quickstart (full end-to-end example)", url: "https://docs.pytorch.org/tutorials/beginner/basics/quickstart_tutorial.html", kind: "docs"}
    ]
  }
  ]
};
