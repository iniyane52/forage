// FORAGE — AI Engineer path, Module 1: Python for ML
// Schema matches commoncore.js: {id,title,concept,analogy,examples?,warn?,mistakes,handsOn,doneWhen,checks,keyTakeaways,resources}
// Code snippets in `examples` are real Python (NumPy/pandas/matplotlib) — verified to run as written.

module.exports = {
  id: "aiml-python", title: "Python for ML",
  why: "Every ML library — scikit-learn, PyTorch, pandas — speaks the same underlying language: arrays and tables. Before touching a single model, you need to be fluent in the tools that hold and shape data. This module is that fluency.",
  topics: [
  {
    id: "aiml-numpy", title: "NumPy arrays — the language of ML data",
    concept: "A NumPy array is a grid of numbers, all the same type, stored efficiently and processed all at once (\"vectorised\") instead of one-by-one in a slow Python loop. Every ML library represents data — a table of house prices, an image's pixels, a batch of text turned into numbers — as arrays underneath. Learning NumPy is learning the actual data format ML runs on.",
    analogy: "A Python list is like a bag of mixed items you rummage through one at a time. A NumPy array is like a spreadsheet column: uniform, ordered, and built so you can operate on the WHOLE column in one instruction (\"add 5 to every cell\") instead of visiting each cell yourself. That whole-column operation is what makes NumPy fast enough for ML-scale data.",
    examples: [
      {code: "import numpy as np\n\na = np.array([1, 2, 3, 4])\nb = a * 2\nprint(b)          # [2 4 6 8]\nprint(a.shape)     # (4,)  -- 4 elements, 1 dimension\nprint(a.dtype)     # int64", note: "`a * 2` multiplies EVERY element by 2 in one vectorised step — no loop written. This is 10-100x faster than a Python for-loop over a plain list, and it's the pattern every ML computation relies on."},
      {code: "m = np.array([[1, 2, 3], [4, 5, 6]])\nprint(m.shape)     # (2, 3) -- 2 rows, 3 columns\nprint(m[0])        # [1 2 3]  -- first row\nprint(m[:, 1])     # [2 5]    -- second column, all rows\nprint(m.sum())      # 21\nprint(m.sum(axis=0))  # [5 7 9] -- sum down each column", note: "A 2D array is a matrix: rows × columns, same shape as a spreadsheet or a table of training examples. `axis=0` sums DOWN columns, `axis=1` would sum ACROSS rows — this axis convention shows up constantly in ML code."}
    ],
    mistakes: ["Mixing up `.shape` (a tuple describing dimensions) with the number of elements — a (2,3) array has 6 elements, not 2 or 3.","Looping over array elements in plain Python (`for x in arr: ...`) when a vectorised operation (`arr * 2`) would do the same thing far faster.","Confusing `axis=0` and `axis=1` — axis 0 is always the FIRST dimension listed in `.shape` (rows), axis 1 the second (columns)."],
    handsOn: "In a Python shell (or Jupyter — next lesson), create a 2D NumPy array representing 3 students' scores on 2 tests (3 rows, 2 columns). Compute each student's average score using `.mean(axis=1)`, and each test's average using `.mean(axis=0)`. Print both and check they make sense against the raw numbers.",
    doneWhen: "You can create a 2D array, explain what its `.shape` means, and correctly choose `axis=0` vs `axis=1` to average down columns vs across rows.",
    checks: [
      {q: "Why is `arr * 2` faster than a Python for-loop doing the same multiplication?", a: "NumPy operations are vectorised — they run in optimized, compiled code across the whole array at once, instead of interpreting a loop instruction-by-instruction in Python."},
      {q: "A NumPy array has shape (100, 5). What does that describe?", a: "100 rows and 5 columns — e.g. 100 examples, each with 5 features. It does NOT mean 100 or 5 total elements; it means 100×5 = 500 elements arranged in a grid."}
    ],
    keyTakeaways: ["NumPy arrays are the uniform, vectorised data format under every ML library.","Vectorised operations (whole-array at once) replace slow Python loops.","`.shape` describes dimensions (rows, columns, ...); axis=0 is rows/down, axis=1 is columns/across."],
    resources: [
      {label: "NumPy — official quickstart", url: "https://numpy.org/doc/stable/user/quickstart.html", kind: "docs"},
      {label: "NumPy fundamentals (NumPy docs)", url: "https://numpy.org/doc/stable/user/basics.html", kind: "docs"}
    ]
  },
  {
    id: "aiml-pandas", title: "Pandas basics — working with tables",
    concept: "pandas is Python's spreadsheet library: a DataFrame is a table with named columns (each column is really a NumPy array underneath), and a Series is a single column. Where NumPy is about raw numeric grids, pandas adds labels, mixed column types (numbers, text, dates), and the ability to filter, group, and join tables the way you would in a spreadsheet or SQL — which is exactly what most real-world ML data looks like before it becomes arrays.",
    analogy: "If NumPy is the spreadsheet's raw grid of cells, pandas is the spreadsheet application itself — column headers, filtering, sorting, formulas. You'll almost always load messy real-world data (CSV files, database exports) into pandas FIRST, clean and shape it there, then hand the final numeric result to NumPy/scikit-learn/PyTorch.",
    examples: [
      {code: "import pandas as pd\n\ndf = pd.DataFrame({\n    \"name\": [\"Asha\", \"Ravi\", \"Meera\"],\n    \"score\": [88, 72, 95],\n    \"passed\": [True, False, True]\n})\nprint(df)\nprint(df[\"score\"].mean())   # 85.0\nprint(df[df[\"score\"] > 80])  # rows where score > 80", note: "`df[\"score\"]` pulls out one column as a Series. `df[df[\"score\"] > 80]` is boolean filtering: `df[\"score\"] > 80` produces a column of True/False, and wrapping the DataFrame in that filters to only the True rows — the single most common pandas pattern."},
      {code: "df[\"grade\"] = df[\"score\"].apply(lambda s: \"A\" if s >= 90 else \"B\" if s >= 75 else \"C\")\nprint(df.sort_values(\"score\", ascending=False))\nprint(df.groupby(\"passed\")[\"score\"].mean())", note: "`.apply()` runs a function on every value in a column to build a new one. `.groupby(\"passed\")` splits the table into groups (True students, False students) and `.mean()` computes the average score within each group — like a spreadsheet pivot table."}
    ],
    mistakes: ["Forgetting that `df[\"score\"] > 80` alone just gives True/False labels — you need `df[df[\"score\"] > 80]` (wrapping the DataFrame) to actually get the filtered rows.","Modifying a DataFrame slice and being surprised the original doesn't change (or vice versa) — pandas sometimes returns a view, sometimes a copy; when in doubt, use `.copy()` before editing.","Calling `.mean()` on a column with missing values without first deciding how to handle them (see the next lesson — cleaning) — pandas silently skips NaNs by default, which isn't always what you want."],
    handsOn: "Build a small DataFrame (5+ rows) about anything real to you — books you've read, expenses, workouts — with at least 3 columns of different types (text, number, boolean/category). Filter it to rows matching a condition, add one computed column with `.apply()`, and compute a `.groupby()` average.",
    doneWhen: "You can build a DataFrame from a dict, filter rows with a boolean condition, add a computed column, and group-and-aggregate — and explain what each line does.",
    checks: [
      {q: "What's the difference between a pandas Series and a DataFrame?", a: "A Series is a single labeled column (or row); a DataFrame is a full table made of multiple Series sharing the same row index."},
      {q: "`df[df[\"age\"] > 18]` — what does this return?", a: "A new DataFrame containing only the rows where the age column's value is greater than 18 — boolean filtering."}
    ],
    keyTakeaways: ["DataFrame = table (named, mixed-type columns); Series = single column.","Boolean filtering (`df[condition]`) is the core pattern for selecting rows.","`.groupby().agg()` mirrors spreadsheet pivot tables / SQL GROUP BY."],
    resources: [
      {label: "pandas — 10 minutes to pandas", url: "https://pandas.pydata.org/docs/user_guide/10min.html", kind: "docs"},
      {label: "pandas — official documentation", url: "https://pandas.pydata.org/docs/", kind: "docs"}
    ]
  },
  {
    id: "aiml-cleaning", title: "Cleaning messy data",
    concept: "Real-world data is never ready to train a model on: values are missing, duplicated, wrongly typed, or inconsistently spelled. Cleaning means finding these problems (`.isna()`, `.duplicated()`, `.dtypes`) and deciding what to do about each — drop the row, fill in a reasonable value, or fix the type — BEFORE any modeling happens. The famous saying in ML is that 80% of the work is data cleaning, and it's not an exaggeration.",
    analogy: "Training a model on dirty data is like cooking with unwashed, unsorted vegetables still in their packaging — you can't make a good dish, no matter how good the recipe (the model) is. Cleaning is the washing and prepping that has to happen first, every time.",
    examples: [
      {code: "import pandas as pd\nimport numpy as np\n\ndf = pd.DataFrame({\n    \"age\": [25, np.nan, 31, 25, 40],\n    \"city\": [\"Chennai\", \"chennai\", \"Mumbai\", \"Chennai\", None]\n})\nprint(df.isna().sum())        # how many missing values per column\nprint(df.duplicated().sum())  # how many fully duplicate rows", note: "`.isna()` marks missing values (NaN/None) as True; `.sum()` on that counts them per column. `.duplicated()` flags rows that are exact copies of an earlier row — here row 3 duplicates row 0."},
      {code: "df[\"city\"] = df[\"city\"].str.strip().str.lower()   # normalise text: 'Chennai' and 'chennai' become the same\ndf = df.drop_duplicates()                          # remove exact duplicate rows\ndf[\"age\"] = df[\"age\"].fillna(df[\"age\"].mean())     # fill missing age with the column average\nprint(df)", note: "Order matters: normalise text first so duplicates that only differed by casing get caught, THEN drop duplicates, THEN fill remaining gaps. `fillna(mean())` is one simple strategy — dropping the row instead (`dropna()`) is another; which is right depends on how much data you can afford to lose."}
    ],
    warn: "Never fill in or guess values for a column you don't understand well enough to know what \"reasonable\" looks like — a bad fill (e.g. using the mean on a wildly skewed column) can quietly bias the whole model. When unsure, it's safer to drop the row or flag it than to silently invent a number.",
    mistakes: ["Filling missing numeric values with the mean without first checking if the column is skewed (a few huge outliers can drag the mean far from what's \"typical\").","Treating 'Chennai' and 'chennai' as different categories because you didn't normalise casing/whitespace first.","Dropping every row with ANY missing value (`dropna()` with no arguments) when only one column actually matters — this can throw away far more good data than necessary."],
    handsOn: "Take the DataFrame you built last lesson (or a small CSV you find online) and deliberately introduce 2-3 messy rows: a missing value, a duplicate, and an inconsistent text value. Then clean it: count and handle the missing values, remove duplicates, and normalise the inconsistent text.",
    doneWhen: "You can find missing values and duplicates in a DataFrame, and explain — not just execute — why you chose to fill, drop, or normalise each problem the way you did.",
    checks: [
      {q: "Why is text normalisation (like `.str.lower()`) often a cleaning step before deduplication?", a: "Because 'Chennai' and 'chennai' are the same real-world value but won't be caught as duplicates unless casing/whitespace is normalised first."},
      {q: "When might filling missing values with the mean be a bad idea?", a: "When the column is skewed by outliers, or when the missingness itself is meaningful (e.g. income not reported might correlate with income level) — a naive fill can bias the model."}
    ],
    keyTakeaways: ["Real data is dirty by default — cleaning is most of the real work.","`.isna()`, `.duplicated()`, and `.dtypes` are your first diagnostic tools.","Every cleaning decision (fill vs drop vs normalise) is a judgment call with consequences — make it deliberately."],
    resources: [
      {label: "pandas — working with missing data", url: "https://pandas.pydata.org/docs/user_guide/missing_data.html", kind: "docs"},
      {label: "pandas — duplicate data handling", url: "https://pandas.pydata.org/docs/reference/api/pandas.DataFrame.duplicated.html", kind: "docs"}
    ]
  },
  {
    id: "aiml-jupyter", title: "Jupyter notebooks & virtual environments",
    concept: "A Jupyter notebook lets you run Python in small, independent \"cells\" and see output (including tables and charts) inline — ideal for the explore-a-little, check-the-result, explore-more loop that ML work is made of. A virtual environment is an isolated set of installed packages for one project, so upgrading a library for project A can't silently break project B. Together, they're the standard ML workspace: one clean environment per project, explored interactively in notebooks.",
    analogy: "A notebook is like a lab notebook: you run one small experiment (a cell), see the result immediately, then decide the next step — instead of writing the whole experiment blind and running it once at the end. A virtual environment is like having a separate, clean set of tools for each project instead of one shared toolbox where projects fight over which version of a wrench they need.",
    examples: [
      {code: "# In a terminal, from your project folder:\npython -m venv .venv          # create an isolated environment named .venv\n.venv\\Scripts\\activate         # Windows: activate it\n# source .venv/bin/activate    # Mac/Linux: activate it\npip install numpy pandas matplotlib jupyter\njupyter notebook                # opens Jupyter in your browser", note: "Once activated, `pip install` only affects THIS project's `.venv` folder, not your whole computer. Every new ML project should start with its own `venv` — this is exactly the WSL/shell muscle memory from the Cloud & DevOps path, applied to Python specifically."},
      {code: "# Inside a notebook cell:\nimport pandas as pd\ndf = pd.DataFrame({\"x\": [1,2,3], \"y\": [4,5,6]})\ndf   # just naming a variable as the last line displays it as a formatted table", note: "In a notebook, the LAST expression in a cell auto-displays (no `print()` needed) — this is notebook-specific behaviour and is why DataFrames render as nice tables inline, which is a big part of why notebooks are the default ML exploration tool."}
    ],
    mistakes: ["Installing packages globally (without activating a venv first) — works at first, then silently breaks a different project months later when versions conflict.","Running notebook cells out of order and getting confused why a variable has an old value — notebooks execute in the order you RUN cells, not the order they appear on the page; use \"Restart & Run All\" to sanity-check.","Never restarting the kernel — leftover variables from deleted cells can make a notebook \"work\" for you but fail for anyone else who runs it top-to-bottom."],
    handsOn: "Create a virtual environment for a new folder, activate it, install numpy/pandas/matplotlib/jupyter, and open a notebook. Write 3 cells: one loading/creating a small DataFrame, one filtering it, one printing a summary. Then use \"Restart & Run All\" and confirm it still works cleanly top-to-bottom.",
    doneWhen: "You have a working venv with Jupyter installed, a notebook with at least 3 cells that runs cleanly via \"Restart & Run All\", and can explain why cell execution ORDER (not position) determines variable state.",
    checks: [
      {q: "Why use a virtual environment instead of installing packages globally?", a: "So each project's package versions are isolated — upgrading a library for one project can't silently break another."},
      {q: "Why might a notebook 'work' when you run cells out of order, but fail for someone else running it top-to-bottom?", a: "Notebook state depends on the ORDER cells were actually executed, not their visual order on the page — leftover variables from earlier/deleted runs can mask bugs that 'Restart & Run All' would expose."}
    ],
    keyTakeaways: ["Notebooks = explore-and-see-immediately workflow for iterative ML work.","Virtual environments isolate each project's dependencies.","Cell execution order (not page order) determines notebook state — verify with Restart & Run All."],
    resources: [
      {label: "Python venv — official docs", url: "https://docs.python.org/3/library/venv.html", kind: "docs"},
      {label: "Jupyter — official documentation", url: "https://docs.jupyter.org/en/latest/", kind: "docs"}
    ]
  },
  {
    id: "aiml-plotting", title: "Plotting with matplotlib",
    concept: "matplotlib is Python's foundational plotting library — a scatter plot, line chart, or histogram tells you things about your data (outliers, trends, distributions) that scrolling through numbers never will. In ML, plotting isn't decoration: you plot data before training to catch problems early, and plot results after training to see if the model actually learned something sensible.",
    analogy: "Reading a table of 10,000 numbers to spot a pattern is like trying to recognise a face by reading a list of a million individual pixel colours. A plot is the same data rendered as an actual picture — patterns that are invisible in the raw numbers jump out instantly to your eyes.",
    examples: [
      {code: "import matplotlib.pyplot as plt\nimport numpy as np\n\nx = np.array([1, 2, 3, 4, 5])\ny = np.array([2, 4, 5, 4, 9])\n\nplt.scatter(x, y)\nplt.xlabel(\"Hours studied\")\nplt.ylabel(\"Test score\")\nplt.title(\"Study time vs score\")\nplt.show()", note: "A scatter plot is the first thing you reach for to check the RELATIONSHIP between two numeric columns — is it roughly a straight line (linear), curved, or no relationship at all? That answer shapes which model you'd even consider using."},
      {code: "scores = np.array([55, 60, 62, 65, 70, 71, 72, 73, 74, 95])\nplt.hist(scores, bins=5)\nplt.xlabel(\"Score\")\nplt.ylabel(\"Count of students\")\nplt.title(\"Score distribution\")\nplt.show()", note: "A histogram shows the SHAPE of a single column's distribution — here it would reveal that 95 is a lonely outlier far from the rest of the cluster, something you'd easily miss just scanning the raw list."}
    ],
    mistakes: ["Skipping plots entirely and jumping straight to modeling — outliers, wrong data types, and broken relationships are almost always visible in a quick plot before they cause confusing model failures later.","Using a line plot (`plt.plot`) for data that isn't actually sequential/ordered — line plots imply an order and connection between points that a scatter plot doesn't.","Forgetting axis labels and titles — a plot without labels is unreadable to anyone (including future-you) two weeks later."],
    handsOn: "Using the DataFrame from the cleaning lesson (or a new small dataset), make one scatter plot of two numeric columns and one histogram of a single numeric column. Label both axes and add a title on each. Write one sentence describing what each plot tells you about the data.",
    doneWhen: "You've produced a labelled scatter plot and a labelled histogram from real data, and can explain in your own words what pattern (or lack of one) each plot reveals.",
    checks: [
      {q: "When would you reach for a scatter plot versus a histogram?", a: "Scatter plot: to see the relationship between TWO numeric columns. Histogram: to see the distribution/shape of ONE numeric column (where values cluster, outliers, skew)."},
      {q: "Why plot data BEFORE training a model, not just after?", a: "Plots surface problems early — outliers, wrong relationships, skewed distributions — that would otherwise show up as confusing, hard-to-diagnose model performance issues later."}
    ],
    keyTakeaways: ["Plots reveal patterns invisible in raw numbers.","Scatter plots show relationships between two variables; histograms show one variable's distribution.","Plot data before AND after modeling — before to catch problems, after to sanity-check results."],
    resources: [
      {label: "matplotlib — official quickstart", url: "https://matplotlib.org/stable/tutorials/introductory/quick_start.html", kind: "docs"},
      {label: "matplotlib — pyplot tutorial", url: "https://matplotlib.org/stable/tutorials/pyplot.html", kind: "docs"}
    ]
  }
  ]
};
