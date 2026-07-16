// FORAGE — Data Scientist path, Module 2: SQL & Pandas Deep-Dive
// Standard SQL semantics (verifiable against any SQL reference; PostgreSQL is what this very
// app runs on). SQL snippets executed for real against SQLite (same core SQL semantics for the
// features used here). Pandas snippets executed for real with pandas 3.0.
// Light quiz model: 1 sharpest MCQ per lesson.

module.exports = {
  id: "data-sql-pandas", title: "SQL & Pandas Deep-Dive",
  why: "Module 1's AI-adjacent pandas lesson covered the basics. Real data science work lives in two tools daily: SQL to pull data out of a database, and pandas to transform, join, and aggregate it once it's in Python. This module goes deep on both, with SQL JOINs and pandas' equivalent merge/groupby operations — the actual daily toolkit of a working data scientist.",
  topics: [
  {
    id: "data-sql-select-where", title: "SQL SELECT, WHERE, and ORDER BY",
    concept: "SQL (Structured Query Language) is how you ask a relational database for data. `SELECT columns FROM table` chooses what to retrieve; `WHERE condition` filters which ROWS come back; `ORDER BY column` sorts the result. This is the same querying that powers this very app's Postgres database — every lesson you've read has been fetched with SQL under the hood.",
    analogy: "Think of a database table as a spreadsheet. SELECT picks which COLUMNS you want to see (not necessarily all of them). WHERE is a filter that hides rows that don't match a condition, like a spreadsheet's filter feature. ORDER BY re-sorts the visible rows by a chosen column, like clicking a column header to sort.",
    examples: [
      {code: "import sqlite3\n\nconn = sqlite3.connect(\":memory:\")\nconn.execute(\"CREATE TABLE students (name TEXT, score INTEGER, subject TEXT)\")\nconn.executemany(\"INSERT INTO students VALUES (?, ?, ?)\", [\n    (\"Amy\", 85, \"Math\"), (\"Bo\", 72, \"Math\"), (\"Cy\", 91, \"Science\"), (\"Dee\", 68, \"Science\"),\n])\nconn.commit()\n\nresult = conn.execute(\"SELECT name, score FROM students WHERE score > 70 ORDER BY score DESC\")\nfor row in result.fetchall():\n    print(row)", note: "WHERE score > 70 filters out Dee (68); ORDER BY score DESC sorts the remaining rows from highest to lowest score. This runs against a real SQLite database (created fresh in memory for this example) -- the same core SQL clauses work identically against the PostgreSQL database this app itself runs on."},
      {code: "result2 = conn.execute(\"SELECT subject, COUNT(*) as num_students FROM students GROUP BY subject\")\nfor row in result2.fetchall():\n    print(row)\n\nconn.close()", note: "A preview of GROUP BY (covered in depth in a later lesson): it collapses rows sharing the same 'subject' value into one row each, with COUNT(*) counting how many original rows fell into each group -- 2 Math students, 2 Science students."}
    ],
    mistakes: ["Forgetting that WHERE filters happen BEFORE any grouping/aggregation — it operates on individual rows, not on grouped results (that's what HAVING is for, covered later).","Assuming column order in SELECT determines anything about the underlying table — SELECT only controls what's returned and in what order, not the table's actual structure.","Writing ORDER BY without DESC when you want highest-first — the default is ascending (ASC), which is easy to forget."],
    handsOn: "Run both examples against the sample students table. Then write your own query selecting names and subjects for students scoring below 80, sorted by name alphabetically.",
    doneWhen: "You can write a SELECT query with WHERE filtering and ORDER BY sorting, and correctly predict which rows will be included and in what order.",
    checks: [
      {q: "In `SELECT name, score FROM students WHERE score > 70 ORDER BY score DESC`, in what order do the WHERE filter and ORDER BY sort logically apply?", a: "WHERE filters rows first (keeping only those with score > 70), and ORDER BY then sorts the remaining filtered rows — filtering happens before sorting, not after."}
    ],
    keyTakeaways: ["SELECT chooses columns; WHERE filters rows; ORDER BY sorts the result.", "WHERE filters happen on individual rows, before any grouping.", "The default sort order is ascending (ASC) unless DESC is specified."],
    resources: [
      {label: "PostgreSQL — SELECT documentation", url: "https://www.postgresql.org/docs/current/sql-select.html", kind: "docs"},
      {label: "Mode — SQL Tutorial", url: "https://mode.com/sql-tutorial/", kind: "course"}
    ]
  },
  {
    id: "data-sql-joins", title: "SQL JOINs — combining tables",
    concept: "Real databases split data across multiple related tables (e.g. `students` and `enrollments`) rather than one giant flat table — a JOIN combines rows from two tables based on a matching column. `INNER JOIN` keeps only rows that match in BOTH tables; `LEFT JOIN` keeps ALL rows from the left table, filling in NULLs where there's no match on the right — the distinction matters enormously for whether 'missing' data silently disappears from your results or stays visible.",
    analogy: "An INNER JOIN is like a group photo that only includes people who show up to BOTH of two separate events — if someone only attended one event, they're left out entirely. A LEFT JOIN is like a photo of everyone who attended the FIRST event, with a blank space next to anyone who didn't ALSO attend the second — nobody from the first event is dropped, even if they have no match.",
    examples: [
      {code: "import sqlite3\n\nconn = sqlite3.connect(\":memory:\")\nconn.execute(\"CREATE TABLE students (id INTEGER, name TEXT)\")\nconn.execute(\"CREATE TABLE enrollments (student_id INTEGER, course TEXT)\")\nconn.executemany(\"INSERT INTO students VALUES (?, ?)\", [(1, \"Amy\"), (2, \"Bo\"), (3, \"Cy\")])\nconn.executemany(\"INSERT INTO enrollments VALUES (?, ?)\", [(1, \"Math\"), (1, \"Science\"), (2, \"Math\")])\n# note: Cy (id 3) has NO enrollment rows\nconn.commit()\n\nprint(\"--- INNER JOIN ---\")\nfor row in conn.execute(\"\"\"\n    SELECT students.name, enrollments.course FROM students\n    INNER JOIN enrollments ON students.id = enrollments.student_id\n\"\"\").fetchall():\n    print(row)", note: "INNER JOIN only returns students who have a matching enrollment row -- Cy (no enrollments) is completely ABSENT from these results, even though Cy exists in the students table. This silent disappearance is exactly the behavior to watch for."},
      {code: "print(\"--- LEFT JOIN ---\")\nfor row in conn.execute(\"\"\"\n    SELECT students.name, enrollments.course FROM students\n    LEFT JOIN enrollments ON students.id = enrollments.student_id\n\"\"\").fetchall():\n    print(row)\n\nconn.close()", note: "LEFT JOIN keeps Cy in the results with course=None (NULL), since students is the LEFT table and Cy simply has no matching enrollment -- this is the key practical difference: LEFT JOIN preserves every row from the left table regardless of whether a match exists."}
    ],
    warn: "Using INNER JOIN by default without thinking about it can silently drop real data (like Cy having no enrollments) from your analysis without any error or warning — always consider whether 'no match' should mean 'exclude this row' (INNER) or 'keep it with a blank' (LEFT) for your specific question.",
    mistakes: ["Defaulting to INNER JOIN without considering whether unmatched rows should actually be preserved — a common source of silently incomplete analysis.","Forgetting the ON clause, which specifies HOW rows should match between tables — without it (or with a wrong condition), you can accidentally get a cartesian product (every row matched with every row) or wrong matches.","Confusing LEFT and RIGHT JOIN direction — LEFT JOIN keeps everything from the table named FIRST/before the JOIN keyword; RIGHT JOIN keeps everything from the table named after."],
    handsOn: "Run both examples and confirm Cy is missing from the INNER JOIN results but present (with course=None) in the LEFT JOIN results. Then write your own query: add a 4th student with no enrollments, and confirm the same pattern holds for them.",
    doneWhen: "You can write both INNER JOIN and LEFT JOIN queries, and correctly predict which rows will be included/excluded/null-filled in each case.",
    checks: [
      {q: "A student has no matching rows in the enrollments table. Will they appear in an INNER JOIN result, a LEFT JOIN result, or both?", a: "Only in the LEFT JOIN result (with NULL/None for the enrollment columns) — INNER JOIN only returns rows that have a match in BOTH tables, so a student with zero enrollments is completely excluded from INNER JOIN results."}
    ],
    keyTakeaways: ["INNER JOIN keeps only rows with a match in both tables; LEFT JOIN keeps all rows from the left table, filling unmatched columns with NULL.", "Defaulting to INNER JOIN can silently drop real data from analysis without any warning.", "The ON clause specifies how rows match between tables — critical to get right."],
    resources: [
      {label: "PostgreSQL — Joins between tables", url: "https://www.postgresql.org/docs/current/tutorial-join.html", kind: "docs"},
      {label: "Mode — SQL JOINs tutorial", url: "https://mode.com/sql-tutorial/sql-joins/", kind: "course"}
    ]
  },
  {
    id: "data-sql-groupby-agg", title: "GROUP BY and aggregate functions",
    concept: "GROUP BY collapses rows sharing the same value in a chosen column into one row per unique value, combined with an AGGREGATE FUNCTION (COUNT, SUM, AVG, MIN, MAX) that computes one number per group. A crucial, commonly-missed rule: `HAVING` filters GROUPS after aggregation (e.g. 'only subjects with more than 5 students'), while `WHERE` filters individual ROWS before grouping — using WHERE where you mean HAVING is a very common SQL bug.",
    analogy: "GROUP BY is like sorting a pile of mixed receipts into separate labeled envelopes by store name, then writing one summary number (like the total spent) on the OUTSIDE of each envelope — you no longer see the individual receipts, just one aggregated number per envelope (group). HAVING is deciding AFTER labeling and totaling which envelopes are even worth keeping (e.g. 'only keep envelopes with more than $100 total'); WHERE would have been deciding which individual RECEIPTS to include before they ever got sorted into envelopes.",
    examples: [
      {code: "import sqlite3\n\nconn = sqlite3.connect(\":memory:\")\nconn.execute(\"CREATE TABLE sales (product TEXT, amount INTEGER)\")\nconn.executemany(\"INSERT INTO sales VALUES (?, ?)\", [\n    (\"Widget\", 20), (\"Widget\", 15), (\"Gadget\", 50), (\"Gadget\", 45), (\"Gadget\", 60), (\"Gizmo\", 10),\n])\nconn.commit()\n\nfor row in conn.execute(\"\"\"\n    SELECT product, COUNT(*) as num_sales, SUM(amount) as total, AVG(amount) as avg_amount\n    FROM sales GROUP BY product\n\"\"\").fetchall():\n    print(row)", note: "Each product gets collapsed into ONE row with COUNT(*) (how many sale rows), SUM(amount) (total revenue), and AVG(amount) (average sale) computed across all rows in that group -- Gadget's 3 rows (50,45,60) become one row: count=3, total=155, avg=51.67."},
      {code: "print(\"--- with HAVING (filters GROUPS, after aggregation) ---\")\nfor row in conn.execute(\"\"\"\n    SELECT product, SUM(amount) as total FROM sales\n    GROUP BY product HAVING SUM(amount) > 40\n\"\"\").fetchall():\n    print(row)\n\nconn.close()", note: "HAVING SUM(amount) > 40 filters OUT Widget (total 35), keeping only groups whose AGGREGATED total exceeds 40 -- notice this couldn't be done with WHERE, since WHERE only sees individual rows and has no concept of a group's total before grouping happens."}
    ],
    mistakes: ["Using WHERE to filter on an aggregated value (like a group's total) — WHERE only sees individual rows, before grouping; use HAVING for conditions on the aggregated result.","Selecting a non-aggregated, non-grouped column alongside GROUP BY — most databases either error or give an arbitrary value, since it's ambiguous which row's value to show for a collapsed group.","Forgetting COUNT(*) counts ROWS (including nulls in any column), while COUNT(column_name) only counts non-null values in that specific column — a subtle but real difference."],
    handsOn: "Run both examples and confirm the aggregated numbers per product. Then write your own query that groups sales by product and uses HAVING to find products with an average sale amount (AVG) above 20.",
    doneWhen: "You can write a GROUP BY query with aggregate functions, and correctly choose HAVING (not WHERE) to filter on an aggregated value.",
    checks: [
      {q: "Why can't you use WHERE to filter for 'only groups where the SUM of a column exceeds 40'?", a: "WHERE filters individual rows BEFORE any grouping happens, so it has no access to a group's aggregated total. HAVING filters groups AFTER aggregation, which is what's needed to filter based on a computed value like SUM."}
    ],
    keyTakeaways: ["GROUP BY collapses rows sharing a value into one row per group, paired with aggregate functions (COUNT/SUM/AVG/MIN/MAX).", "WHERE filters individual rows before grouping; HAVING filters groups after aggregation.", "COUNT(*) counts all rows; COUNT(column) counts only non-null values in that column."],
    resources: [
      {label: "PostgreSQL — Aggregate functions", url: "https://www.postgresql.org/docs/current/tutorial-agg.html", kind: "docs"},
      {label: "Mode — SQL GROUP BY tutorial", url: "https://mode.com/sql-tutorial/sql-group-by/", kind: "course"}
    ]
  },
  {
    id: "data-pandas-merge", title: "Pandas merge — SQL JOINs in Python",
    concept: "Pandas' `.merge()` is the direct equivalent of a SQL JOIN, for when your data is already loaded as DataFrames rather than sitting in a database. `pd.merge(df1, df2, on='key_column', how='inner')` mirrors INNER JOIN; `how='left'` mirrors LEFT JOIN — same semantics as the SQL lesson, just expressed in pandas' API. Knowing both means you can work with data whether it's already in Python or still needs to be pulled from a database first.",
    analogy: "If SQL JOIN is combining two spreadsheets while they're still stored in a filing cabinet (the database), pandas merge is doing the exact same combining after you've already pulled both spreadsheets out onto your desk (loaded into Python) — same operation, different moment in the workflow.",
    examples: [
      {code: "import pandas as pd\n\nstudents = pd.DataFrame({\"id\": [1, 2, 3], \"name\": [\"Amy\", \"Bo\", \"Cy\"]})\nenrollments = pd.DataFrame({\n    \"student_id\": [1, 1, 2],\n    \"course\": [\"Math\", \"Science\", \"Math\"],\n})\n\ninner = pd.merge(students, enrollments, left_on=\"id\", right_on=\"student_id\", how=\"inner\")\nprint(\"--- inner merge ---\")\nprint(inner[[\"name\", \"course\"]])\n\nleft = pd.merge(students, enrollments, left_on=\"id\", right_on=\"student_id\", how=\"left\")\nprint(\"--- left merge ---\")\nprint(left[[\"name\", \"course\"]])", note: "This produces EXACTLY the same result pattern as the SQL INNER/LEFT JOIN lesson: the inner merge drops Cy entirely (no matching enrollment), while the left merge keeps Cy with course=NaN (pandas' equivalent of SQL's NULL) -- confirming the two tools express the identical relational concept."},
      {code: "# left_on/right_on are needed when the join-key column names DIFFER between DataFrames;\n# if they matched, you'd use the simpler `on=\"shared_column_name\"` instead\nprint(inner.columns.tolist())   # both id AND student_id appear -- since the column names differed", note: "When join keys have different names across the two DataFrames (id vs student_id here), pandas keeps BOTH columns in the result by default -- worth knowing so you're not surprised by an extra column, and can drop it afterward if you don't need it."}
    ],
    mistakes: ["Forgetting pandas' default merge is `how='inner'` — silently dropping unmatched rows exactly like SQL's default INNER JOIN risk, just in a different tool.","Using `on=` when the join-key columns have different names in the two DataFrames — you need `left_on=`/`right_on=` in that case, not a single `on=`.","Not checking for duplicate join keys before merging — a duplicate key on either side can silently multiply rows in the result (a many-to-many merge), producing more rows than either input DataFrame had."],
    handsOn: "Run both examples and confirm the inner vs left merge behavior matches the SQL JOIN lesson's pattern exactly. Then add a student with no enrollments and a course with no matching student_id, and re-run both merges to confirm you correctly predict which rows appear where.",
    doneWhen: "You can perform both inner and left merges in pandas, correctly using left_on/right_on when column names differ, and can predict which rows survive each merge type.",
    checks: [
      {q: "In pandas, what is the default value of the `how` parameter in .merge(), and what does that mean for unmatched rows?", a: "The default is 'inner' — meaning only rows with a match in BOTH DataFrames are kept, exactly mirroring SQL's default risk of silently dropping unmatched data unless you explicitly specify how='left' (or another join type)."}
    ],
    keyTakeaways: ["pandas .merge() is the direct equivalent of SQL JOIN, with how='inner'/'left' mirroring INNER/LEFT JOIN.", "Use left_on/right_on when join-key column names differ between DataFrames.", "pandas' default merge is 'inner', carrying the same silent-data-drop risk as SQL's default."],
    resources: [
      {label: "pandas — merge, join, and concatenate", url: "https://pandas.pydata.org/docs/user_guide/merging.html", kind: "docs"},
      {label: "pandas — pandas.merge() API reference", url: "https://pandas.pydata.org/docs/reference/api/pandas.merge.html", kind: "docs"}
    ]
  },
  {
    id: "data-pandas-groupby-pivot", title: "Pandas groupby and pivot tables",
    concept: "Pandas' `.groupby()` mirrors SQL's GROUP BY: `df.groupby('column').agg(...)` collapses rows sharing a value and computes aggregates, same semantics as the SQL lesson. `.pivot_table()` goes further — it reshapes data so one column's unique values become NEW COLUMNS, which is extremely useful for turning 'long' data (one row per observation) into a 'wide' summary table (one row per group, one column per category) that's often exactly what a stakeholder wants to see.",
    analogy: "groupby is the same envelope-sorting idea from the SQL GROUP BY lesson, now in pandas. A pivot table is like taking that sorted, summarized data and laying it out as a proper cross-tab report — rows for one category, columns for another, with the aggregated numbers filling the grid — the kind of summary table you'd hand directly to a manager.",
    examples: [
      {code: "import pandas as pd\n\nsales = pd.DataFrame({\n    \"product\": [\"Widget\", \"Widget\", \"Gadget\", \"Gadget\", \"Gadget\", \"Gizmo\"],\n    \"region\": [\"East\", \"West\", \"East\", \"West\", \"East\", \"West\"],\n    \"amount\": [20, 15, 50, 45, 60, 10],\n})\n\ngrouped = sales.groupby(\"product\").agg(\n    num_sales=(\"amount\", \"count\"),\n    total=(\"amount\", \"sum\"),\n    avg_amount=(\"amount\", \"mean\"),\n)\nprint(grouped)", note: "This is the EXACT pandas equivalent of the SQL GROUP BY + aggregate functions lesson -- same three aggregates (count, sum, mean/avg), same collapsing-by-product behavior, just expressed through pandas' .agg() with named output columns."},
      {code: "pivot = sales.pivot_table(values=\"amount\", index=\"product\", columns=\"region\", aggfunc=\"sum\", fill_value=0)\nprint(pivot)", note: "pivot_table reshapes the data: 'product' becomes the ROW index, 'region' values become actual COLUMN headers (East/West), and each cell holds the summed amount for that product-region combination -- fill_value=0 handles product-region combinations with no sales (instead of showing NaN), producing exactly the kind of clean cross-tab summary table a stakeholder would want to see."}
    ],
    mistakes: ["Reaching for a manual loop to compute per-group statistics instead of groupby/agg — pandas' built-in aggregation is both clearer and faster.","Forgetting `fill_value=0` (or an appropriate default) in pivot_table when some category combinations have no data — without it, those cells show NaN, which can look like an error rather than 'genuinely zero.'","Using pivot_table when a simple groupby would do — pivot_table's row-to-column reshaping is specifically valuable when you need a wide cross-tab layout, not for every aggregation task."],
    handsOn: "Run both examples and confirm the grouped and pivoted outputs. Then add a new region ('South') with a couple of sales rows and re-run the pivot_table, confirming a new column appears with the correct values.",
    doneWhen: "You can use groupby with named aggregations and build a pivot table that reshapes long data into a wide cross-tab summary.",
    checks: [
      {q: "What does pivot_table's `columns` parameter do differently from groupby, in terms of how the output is shaped?", a: "It takes the unique values of the specified column and turns each one into its OWN column in the output (a wide format), whereas groupby alone keeps everything in a single long, row-per-group structure — pivot_table is specifically for reshaping into a cross-tab layout."}
    ],
    keyTakeaways: ["pandas groupby().agg() mirrors SQL's GROUP BY with aggregate functions.", "pivot_table reshapes long data into a wide cross-tab, turning one column's values into new columns.", "fill_value handles missing category combinations cleanly instead of leaving NaN."],
    resources: [
      {label: "pandas — Group by: split-apply-combine", url: "https://pandas.pydata.org/docs/user_guide/groupby.html", kind: "docs"},
      {label: "pandas — Reshaping and pivot tables", url: "https://pandas.pydata.org/docs/user_guide/reshaping.html", kind: "docs"}
    ]
  }
  ]
};
