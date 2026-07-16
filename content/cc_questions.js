// Common Core quiz bank. [lessonSlug, prompt, [correct, ...distractors], correctIndex=0, explanation, difficulty, styleTag]
// Correct answer authored at index 0; the app shuffles options per attempt so position is irrelevant.
//
// NOTE (content-first remodel): the LIVE quiz set in the DB is thinned to ONE sharpest question
// per lesson (code-output preferred, then higher difficulty, then lowest sort). This file keeps
// the fuller authored bank for reference; the DB is the source of truth. To reproduce the live
// set after a fresh re-seed, re-run the documented trim (keep row_number()=1 per lesson).
module.exports = [
// --- Engineering Mindset ---
["cc-think","A good engineer is best described as someone who…",["can methodically find answers and break problems down","has memorised every possible answer","never needs to look anything up","writes code fastest"],0,"Engineering is problem-solving, not memorisation — looking things up is normal and expected.",1,"conceptual"],
["cc-think","What's the first move when facing a big, scary problem?",["Break it into smaller pieces you can solve one at a time","Solve the whole thing in one go","Memorise a similar solution","Give up if you don't know the answer"],0,"You tackle big problems by decomposing them into small, solvable steps.",1,"conceptual"],
["cc-think","Why is copying code you don't understand risky?",["It works until it breaks — then you're stuck with no idea why","Copying is always illegal","It runs slower than code you write","It can't be committed to Git"],0,"Understanding beats copying; unexplained code becomes a trap when it fails.",2,"conceptual"],
// --- Decomposition ---
["cc-decompose","What question drives decomposition?",["'What smaller thing do I need to do first?'","'How fast can I type this?'","'Who else has solved this?'","'What language should I use?'"],0,"You keep asking for the next smaller step until each is obvious.",1,"conceptual"],
["cc-decompose","Why is it useful that sub-problems are independent?",["You can make progress on one without the others being solved yet","It makes the code run in parallel automatically","It removes the need to test","It guarantees no bugs"],0,"Independence keeps you unstuck — you can advance one piece at a time.",2,"conceptual"],
["cc-decompose","You've decomposed a task but one step is still huge and vague. What should you do?",["Break that step down further until it's doable","Leave it and hope it works out","Start coding the other steps and ignore it","Delete that step"],0,"Keep decomposing until every step is small enough to start.",1,"conceptual"],
// --- Debugging ---
["cc-debug","What's the first thing to do when you hit an error?",["Read the error message carefully","Randomly change code until it works","Assume the computer is broken","Restart the whole project"],0,"The error message usually names what went wrong and where.",1,"conceptual"],
["cc-debug","Why change only one thing at a time when debugging?",["So you know exactly which change fixed or broke it","Because changing two things is illegal","To make the program run faster","It uses less memory"],0,"Isolating changes lets you identify the real cause.",2,"conceptual"],
["cc-debug","The debugging mindset is best compared to…",["detective work — following evidence to the culprit","guessing until you get lucky","asking the computer to fix itself","rewriting everything from scratch"],0,"You follow the evidence (error, reproduction) step by step, like a detective.",1,"conceptual"],
// --- Learning how to learn ---
["cc-learn","What's the bar for 'I understand this'?",["I can explain it simply in my own words","I watched a video about it","I recognise the term","I bookmarked a tutorial"],0,"If you can explain it simply, you understand it; recognition isn't enough.",1,"conceptual"],
["cc-learn","Why build things instead of only watching tutorials?",["Skills stick through doing; passive watching creates a false sense of understanding","Videos are always wrong","Building is faster than watching","Tutorials cost money"],0,"'Tutorial hell' feels productive but collapses when you try it yourself.",2,"conceptual"],
["cc-learn","What does 'spaced repetition' mean for learning?",["Revisiting hard ideas after a break so they stick","Repeating a lesson 100 times in a row","Only studying once before a test","Spacing your desk from the screen"],0,"Returning to material after gaps strengthens memory far more than cramming.",2,"conceptual"],
// --- How a computer works ---
["cc-computer","What's the difference between RAM and storage?",["RAM is fast temporary workspace (cleared on shutdown); storage keeps data permanently","RAM is permanent; storage is temporary","They are the same thing","RAM holds files; storage runs programs"],0,"RAM is the desk (cleared nightly); storage is the filing cabinet (permanent).",2,"conceptual"],
["cc-computer","What does the CPU do?",["Executes the program's instructions — the 'thinking' part","Stores files permanently","Displays the screen","Connects to the internet"],0,"The CPU runs instructions, using RAM as workspace.",1,"conceptual"],
["cc-computer","Does adding more storage make a computer faster?",["No — RAM and CPU affect speed more than storage size","Yes, more storage always means more speed","Only on weekends","Storage has no effect on anything"],0,"Storage size is about capacity; speed comes mainly from CPU and RAM.",2,"conceptual"],
// --- Files & command line ---
["cc-files","What is a folder, structurally?",["A container for files and other folders — they nest into a tree","A single large file","A type of program","The same as the CPU"],0,"Folders nest inside folders forming a directory tree.",1,"conceptual"],
["cc-files","Why use the command line instead of clicking?",["It's faster for many tasks and commands can be saved and automated","It's the only way to open files","Clicking is broken on Linux","It uses less electricity"],0,"Typed commands are fast and, unlike clicks, can be scripted.",2,"conceptual"],
["cc-files","Which command shows which folder you're currently in?",["pwd","ls","cd","touch"],0,"pwd = print working directory; ls lists contents, cd moves.",1,"code-output"],
// --- Internet ---
["cc-internet","What does DNS do?",["Translates a name like google.com into the server's IP address","Encrypts your password","Speeds up your Wi-Fi","Stores your files online"],0,"DNS is the phone book mapping names to IP addresses.",2,"conceptual"],
["cc-internet","Internet vs web — the difference?",["The internet is the network of computers; the web is one service running on it","They're identical","The web is faster internet","The internet only means Wi-Fi"],0,"The web (websites) runs on top of the internet (the network).",2,"conceptual"],
["cc-internet","A website actually lives…",["on a server (a computer) somewhere, reached by its address","inside your browser","in the Wi-Fi router","on the domain name itself"],0,"You reach a server by its address; the name just maps to it via DNS.",1,"conceptual"],
// --- Web / HTTP / JSON ---
["cc-web","What is an API, versus a web page?",["A URL that returns structured data (JSON) for programs","A faster website","A kind of database","A programming language"],0,"APIs return data for code; web pages return HTML for humans.",1,"conceptual"],
["cc-web","404 vs 500 — which is correct?",["404 = the thing doesn't exist (client side); 500 = the server itself failed","404 = server crash; 500 = not found","Both mean success","404 = redirect; 500 = ok"],0,"4xx blames the request; 5xx blames the server.",2,"conceptual"],
["cc-web","What is JSON?",["Structured data written as keys and values (text)","A programming language","A type of server","An image format"],0,"JSON is just structured data (nested keys/values), not code.",1,"conceptual"],
// --- Variables ---
["cc-variables","What is a variable?",["A named label that stores a value to reuse later","A type of loop","A permanent file","A function that runs code"],0,"A variable is a labelled box holding a value you use by name.",1,"conceptual"],
["cc-variables","Is \"22\" the same as 22 in Python?",["No — \"22\" is text (a string); 22 is a number","Yes, identical","Only on Windows","Only inside a loop"],0,"Quotes make it text; you can't do maths on the string \"22\".",2,"code-output"],
["cc-variables","Which is a boolean value?",["True","\"hello\"","42","3.14"],0,"Booleans are True/False; the others are string, int, float.",1,"code-output"],
// --- Conditions ---
["cc-conditions","What's the difference between = and == in Python?",["= assigns a value; == checks equality","They're the same","== assigns; = compares","Both compare values"],0,"Single = stores; double == compares inside conditions.",1,"conceptual"],
["cc-conditions","What prints?\n\nscore = 45\nif score >= 60:\n    print(\"Pass\")\nelse:\n    print(\"Try again\")",["Try again","Pass","Nothing","An error"],0,"45 is not >= 60, so the else branch runs.",2,"code-output"],
["cc-conditions","In Python, what defines which lines belong to an if block?",["Indentation","Curly braces { }","Semicolons","The word 'end'"],0,"Python uses indentation to group blocks — it's part of the syntax.",2,"conceptual"],
// --- Loops ---
["cc-loops","What does range(3) produce when looped?",["0, 1, 2","1, 2, 3","0, 1, 2, 3","3"],0,"range starts at 0 and stops before the number.",1,"code-output"],
["cc-loops","for loop vs while loop?",["for repeats per item/range; while repeats until a condition is false","They're identical","for runs forever; while runs once","while is only for numbers"],0,"Use for over a collection/range, while until a condition changes.",2,"conceptual"],
["cc-loops","What causes an infinite loop?",["A while condition that never becomes false","Using range()","A for loop over a list","Printing inside the loop"],0,"If the condition never turns false, the loop never stops.",2,"conceptual"],
// --- Functions ---
["cc-functions","Why use functions?",["To name and reuse a block of logic instead of repeating it","To make code run slower","To avoid using variables","Because Python requires one per line"],0,"Functions let you write logic once and call it many times.",1,"conceptual"],
["cc-functions","What does 'return' do in a function?",["Hands a value back to whoever called the function","Prints to the screen","Ends the whole program","Creates a loop"],0,"return passes the result back so it can be used.",2,"conceptual"],
["cc-functions","Defining a function vs calling it — which is right?",["Defining writes it; calling runs it","They're the same action","Calling writes it; defining runs it","You can only define, never call"],0,"def defines; name(...) calls (runs) it.",1,"conceptual"],
// --- Git: what ---
["cc-git-what","Git vs GitHub — the difference?",["Git is the version-control tool on your computer; GitHub hosts Git projects online","They're the same","GitHub runs on your laptop; Git is a website","Git is for photos; GitHub for code"],0,"Git tracks locally; GitHub is the online host.",1,"conceptual"],
["cc-git-what","Why commit often?",["Each commit is a save point you can return to","Git charges per commit","It makes files smaller","It's required every minute"],0,"Frequent commits mean you can roll back to a recent good state.",1,"conceptual"],
["cc-git-what","Git is best compared to…",["save-points in a video game","a photo filter","a search engine","a spreadsheet"],0,"Commits are saves you can reload if you mess up.",1,"conceptual"],
// --- Git: commit ---
["cc-git-commit","What's the difference between git add and git commit?",["add stages what to include; commit saves the snapshot with a message","They're identical","commit uploads to GitHub; add saves locally","add deletes files"],0,"add chooses what; commit saves it with a message.",2,"conceptual"],
["cc-git-commit","What makes a good commit message?",["A short clear statement of what changed","The word 'stuff'","Your name","The current time only"],0,"Clear messages make history understandable later.",1,"conceptual"],
["cc-git-commit","Which command starts tracking a folder with Git?",["git init","git start","git new","git track"],0,"git init initialises a repository in the folder (once).",1,"code-output"],
// --- Git: push ---
["cc-git-push","What does git push do?",["Uploads your local commits to a remote like GitHub","Deletes your commits","Creates a new file","Runs your code"],0,"push sends committed snapshots up to the remote.",1,"conceptual"],
["cc-git-push","Why does a README matter?",["It's the first thing a visitor reads — it explains the project","It makes code run faster","Git requires it to commit","It hides your code"],0,"A clear README tells people what the project is and how to run it.",1,"conceptual"],
["cc-git-push","You changed a file but forgot to commit, then pushed. What happens?",["The change isn't uploaded — push only sends committed snapshots","The change uploads anyway","Git deletes the change","GitHub commits it for you"],0,"Only commits get pushed; uncommitted changes stay local.",2,"conceptual"],
// --- Professional: explain ---
["cc-explain","What's the sign you truly understand something?",["You can explain it simply to a non-expert","You can recite the definition","You used it once","You saw a diagram of it"],0,"Simple explanation proves real understanding.",1,"conceptual"],
["cc-explain","Where should a good explanation start?",["With the big picture and why it matters","With the smallest technical detail","With jargon to sound expert","With an apology"],0,"Big picture first, then details.",2,"conceptual"],
["cc-explain","Using jargon to sound smart usually…",["confuses the listener and does the opposite","impresses everyone","is required in tech","makes explanations shorter"],0,"Jargon without definition loses your audience.",1,"conceptual"],
// --- Professional: email ---
["cc-email","What belongs near the top of a technical message?",["The main ask and enough context to act on it","A long backstory","Your favourite emoji","The least important detail"],0,"Put the request up front; don't bury it.",1,"conceptual"],
["cc-email","How do you ask for help with a bug well?",["State what you tried, what you expected, and what happened","Just say 'it doesn't work'","Send only a screenshot","Demand an immediate fix"],0,"Specifics (tried/expected/actual) let others help fast.",2,"conceptual"],
["cc-email","A good subject line is…",["specific about what the message is about","'question'","empty","your name"],0,"Specific subjects help the reader prioritise and respond.",1,"conceptual"],
// --- Professional: team ---
["cc-team","What should you do when you're blocked?",["Communicate early and ask for help","Stay silently stuck for days","Quit the project","Blame a teammate"],0,"Raising blockers early saves everyone time.",1,"conceptual"],
["cc-team","How should you treat code feedback?",["As being about the work, not about you personally","As a personal attack","As something to ignore","As always wrong"],0,"Feedback improves the work; don't take it personally.",2,"conceptual"],
["cc-team","What makes a reliable teammate?",["Keeping commitments or flagging early when you can't","Never communicating","Doing everything alone","Over-promising then going silent"],0,"Reliability and early communication build trust.",1,"conceptual"],
// --- Professional: resume ---
["cc-resume","What should lead a beginner's resume?",["Real projects — concrete proof of ability","A wall of 30 skills","A long objective paragraph","Your school grades only"],0,"Projects are the strongest proof for someone without experience.",1,"conceptual"],
["cc-resume","Why avoid listing skills you can't defend?",["Interviewers probe the weakest claim; it costs credibility","It makes the resume too short","Skills are never asked about","It's against the rules"],0,"An indefensible line becomes a liability in the interview.",2,"conceptual"],
["cc-resume","A strong project bullet includes…",["what you built + the tech + a result or link","just the word 'website'","only the year","your hobbies"],0,"Specifics (what/tech/result) make bullets credible.",1,"conceptual"],
// --- Careers: map ---
["cc-map","Do the tech careers share anything?",["Yes — a common foundation; they diverge in what they go deep on","No, they're totally separate","Only the salary","Only the job title"],0,"Everyone learns shared basics, then specialises.",1,"conceptual"],
["cc-map","Is your first path choice permanent?",["No — it's a starting direction you can adjust; the foundation transfers","Yes, forever","Only if you pay","You can never change roles"],0,"It's a starting direction; skills carry over if you pivot.",1,"conceptual"],
["cc-map","Choosing a path mainly on salary rumours is…",["risky — better to choose by what the work actually involves and energises you","always the best strategy","required by employers","how everyone should decide"],0,"Fit and interest sustain you; rumours mislead.",2,"conceptual"],
// --- Careers: ai/data ---
["cc-ai-data","Core question of a Data Scientist vs an ML Engineer?",["Data Scientist: 'what does the data tell us?'; ML Engineer: 'how do we ship the model reliably?'","They ask the exact same thing","ML Engineer only cleans data","Data Scientist only deploys servers"],0,"One leans analysis/communication, the other engineering/deployment.",2,"conceptual"],
["cc-ai-data","What's most of the real work in data roles?",["Cleaning/preparing data and evaluating results","Only building fancy models","Only writing reports","Only meetings"],0,"Data prep and evaluation dominate; modelling is a smaller slice.",2,"conceptual"],
["cc-ai-data","Do you need a PhD for most AI/data jobs?",["No — many roles value solid practical skills over research degrees","Yes, always","Only for Data Science","Only for ML Engineering"],0,"Practical skills open many roles; research degrees aren't universal.",1,"conceptual"],
// --- Careers: swe/fullstack ---
["cc-swe-fs","What do SWE interviews lean on most?",["Data structures & algorithms and system design","Only typing speed","Only HTML","Only spelling"],0,"DSA and design are the core of SWE interviews.",1,"conceptual"],
["cc-swe-fs","What does 'full-stack' mean?",["Working across both the front-end and the back-end of a web app","Only front-end","Only databases","Stacking servers physically"],0,"Full-stack = front-end (UI) + back-end (servers/DB/APIs).",1,"conceptual"],
["cc-swe-fs","Software Engineer vs Full-Stack Developer?",["They overlap but emphasise different things (fundamentals-deep vs whole web app)","They are identical","Full-stack means expert at literally everything","SWE never writes code"],0,"SWE leans fundamentals/DSA; full-stack leans shipping web products.",2,"conceptual"],
// --- Careers: cloud/security ---
["cc-cloud-sec","What does a Cloud/DevOps engineer focus on?",["The infrastructure software runs on — Linux, containers, cloud, CI/CD","Designing logos","Only writing front-end","Only data analysis"],0,"They run and automate the infrastructure and deployments.",1,"conceptual"],
["cc-cloud-sec","What's the golden rule of security work?",["Only test systems you own or have explicit written permission to test","Test anything you find online","Share exploits publicly","Never ask permission"],0,"Unauthorized access is illegal; Forage teaches authorized/defensive skills only.",1,"conceptual"],
["cc-cloud-sec","Cybersecurity work is mostly…",["defense, monitoring and hardening — not just glamorous hacking","only breaking into systems","only writing reports","the same as DevOps"],0,"Much of security is protecting and hardening systems.",2,"conceptual"],
// --- Careers: choose ---
["cc-choose","How should you choose a path?",["By evidence — which work energised you — knowing you can adjust later","By whichever pays the most rumour","Randomly","By what your friend chose"],0,"Choose by genuine interest; the foundation transfers if you pivot.",1,"conceptual"],
["cc-choose","Do you need to master a path before starting it?",["No — you learn it by doing it; pick one, go deep, build projects","Yes, master it fully first","You must finish all six paths","You need a certificate first"],0,"You learn by doing; commit to one and build.",1,"conceptual"],
["cc-choose","After Common Core, the smart next move is…",["commit to one path and go deep with projects","stay shallow across all six","stop learning","only read, never build"],0,"Depth in one direction beats shallow everywhere.",2,"conceptual"]
];
