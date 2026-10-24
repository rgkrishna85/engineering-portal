# Week 1: Foundations (Days 1–5)

**Goal of the week:** everyone has a working setup, can read basic Python, knows how to vibe code safely, and has run a first graph.
**No AI key needed this week.**

---

## Day 1: What are AI agents and LangGraph? Plus setup

**Goal:** understand *why* LangGraph exists and get every machine working.

**Layman picture:** Today's portal chatbot is like a receptionist holding a cheat-sheet. If you say "vacation" they read out the leave policy. If you say "I need a few days off to visit my mum", it isn't on the cheat-sheet, so they're stuck. An **AI agent** is a receptionist who *understands* what you mean, can *look things up* (tools), *remembers* you, and *asks the manager* when needed. **LangGraph is the floor plan** that organises how that receptionist works, step by step.

**Concept (7 min)**
- Open `src/app/api/chat/route.js` and show the `findPolicy` function with its `if (lower.includes('leave'))` lines. This is what we'll replace.
- Walk through the office analogy table in the [README](README.md#1-what-is-langgraph-the-version-for-non-programmers).
- Show the 7-week roadmap and explain the daily routine and roles.

**Hands-on (12 min):** everyone follows [setup section A](00-setup-and-cheatsheet.md#a-one-time-setup--20-min-per-person) and runs `python day04_first_graph.py`. (Yes, that's Day 4's file. Today it only proves the install works.)

**Check task (3 pts):** your terminal shows `{'name': 'Priya', 'message': 'Hello Priya, welcome to the help desk!'}`.

**Quiz**
1. In the office picture, what is the **State**?
2. What is the difference between the current portal chatbot and an AI agent?
3. Which two programming languages is LangGraph available in?
4. What does `pip install -r requirements.txt` correspond to in .NET?
5. Where does the API key go, and where must it **never** go?

<details><summary>Answer key</summary>

1. The folder that travels between desks, carrying all the notes (data).
2. The chatbot matches fixed keywords. An agent understands language, can use tools, can remember, and can ask a human.
3. Python and JavaScript/TypeScript.
4. `dotnet restore` (installing NuGet packages).
5. In the `.env` file. Never in code, in git, or in a prompt.
</details>

---

## Day 2: Python for C# developers

**Goal:** read and write the ~15 Python features LangGraph uses.

**Layman picture:** you speak "C#". Python is a dialect of the same language: fewer brackets, fewer rules, and indentation is the grammar.

**Concept (7 min):** go through the [cheat sheet](00-setup-and-cheatsheet.md#b-c--python-cheat-sheet-only-what-langgraph-needs). Focus on **dictionaries**, **functions**, **indentation** and **TypedDict**.

**Vibe-code (12 min):** Driver prompt:
```
I'm a C# developer learning Python. Write one small Python file that shows, side by side
with C# comments: variables, a dictionary, a list, a function with type hints, if/else,
a for loop, and a TypedDict called Ticket with id, text and priority. Make it print things.
```
Run it, then compare with `code/day02_python_for_csharp.py`.

**Check task (3 pts):** change the script so a ticket containing "password" prints "Send to IT", and any other ticket prints "Normal queue".

**Quiz**
1. What replaces `{ }` in Python?
2. How do you read a dictionary value safely when the key may not exist?
3. What is a `TypedDict`, compared with C#?
4. Write `true && !false` in Python.
5. What does `f"Hello {name}"` match in C#?

<details><summary>Answer key</summary>

1. Indentation (4 spaces).
2. `d.get("key")` or `d.get("key", default)`.
3. A dictionary with a known shape, similar to a C# record or DTO.
4. `True and not False`
5. String interpolation: `$"Hello {name}"`.
</details>

---

## Day 3: How to vibe code without fooling yourself

**Goal:** learn the team's vibe-coding loop and its golden rules.

**Layman picture:** the AI assistant is a very fast intern. They type quickly but sometimes confidently do the wrong thing, or follow last year's rules. **You are the supervisor**: you check, test and sign off.

**Concept (7 min):** go through the [vibe-coding guide](00-setup-and-cheatsheet.md#c-vibe-coding-guide): the 7-step loop, the prompt template, the golden rules, and the list of "old LangGraph code" warning signs.

**Vibe-code (12 min):** practise the loop on something tiny.
```
CONTEXT: I'm learning Python, coming from C#.
GOAL: A function that takes a help desk message and returns "hr", "it" or "other"
      based on keywords (leave/salary -> hr, laptop/vpn -> it).
RULES: one file, test it with 4 example messages, print the results.
OUTPUT: code, then explain it line by line for a C# developer.
```
Then the **Tester** breaks it: try `"LAPTOP"` in capitals, an empty string, and `"leave my laptop alone"`. Ask the AI to fix whatever breaks.

**Check task (3 pts):** the team has a fixed version that handles capitals and empty text, and the Explainer can explain the fix.

**Quiz**
1. Name the 7 steps of the vibe-coding loop.
2. Why must you write "LangGraph 1.x" in prompts?
3. The AI suggests `create_react_agent` from `langgraph.prebuilt`. What does that tell you?
4. What do you do if no one can explain the generated code?
5. What should you paste to the AI when you get an error?

<details><summary>Answer key</summary>

1. Describe, Generate, Run, Read, Break, Compare, Own it.
2. AI assistants were trained on lots of older LangGraph code and may produce outdated APIs.
3. The code is in an older style. Today's equivalent is `create_agent` from `langchain.agents`.
4. Ask the AI to simplify it, or don't use it.
5. The full error message plus the code, and ask for a simple explanation first.
</details>

---

## Day 4: Your first graph

**Goal:** build, compile and run a one-desk graph. Learn the 5 core words: **State, Node, Edge, compile, invoke**.

**Layman picture:**
```
START --> greet_desk --> END
```
A visitor's folder says `name = Priya`. The greet desk writes a welcome message on it. The folder leaves.

**Concept (7 min)**: the five steps that every LangGraph program follows:
1. Define the **State** (`class State(TypedDict)`)
2. Write **node** functions: read the state, **return only the fields you change**
3. **Build**: `StateGraph(State)`, `add_node`, `add_edge`
4. **Compile**: `builder.compile()`
5. **Run**: `graph.invoke({...})`

**Vibe-code (12 min)**
```
CONTEXT: LangGraph 1.x, Python, I'm a beginner from C#.
GOAL: The smallest possible LangGraph graph. State has 'name' and 'message'.
      One node 'greet_desk' writes "Hello <name>, welcome to the help desk!".
STRUCTURE: START -> greet_desk -> END
RULES: comment each of the 5 steps (state, node, build, compile, invoke).
```
Compare with `code/day04_first_graph.py`.

**Check task (3 pts):** add a second field `department` to the state, pass `"IT"` into `invoke`, and have the message say `"Hello Priya from IT ..."`.

**Quiz**
1. What does a node function receive, and what should it return?
2. What happens if you forget `builder.compile()`?
3. What are `START` and `END`?
4. Your node returns `{"message": "hi"}`. What happens to the `name` field?
5. What is the C# analogy for `StateGraph(State)` plus `add_node` plus `compile`?

<details><summary>Answer key</summary>

1. It receives the current state and returns a dict containing **only the fields it wants to change**.
2. You have only a builder. There's nothing to `invoke`, so you get an error.
3. Special built-in markers for the entrance and the exit of the graph.
4. It stays unchanged. Nodes update only the keys they return.
5. The builder pattern: `new Builder().AddX().Build()`.
</details>

---

## Day 5: State, chains of desks, and drawing your graph

**Goal:** understand how the state changes from desk to desk, and print the graph as a picture.

**Layman picture:**
```
START -> receive -> clean_text -> assign_id -> END
```
Each desk adds notes to the same folder. Nobody erases what others wrote unless they write to the *same* field.

**Concept (7 min)**
- `TypedDict, total=False` means fields may be empty at the start.
- Each node returns a **partial update**. LangGraph merges it into the folder.
- `graph.get_graph().draw_mermaid()` prints the floor plan. Paste it into <https://mermaid.live> to see it.

**Vibe-code (12 min)**
```
CONTEXT: LangGraph 1.x, Python beginner.
GOAL: A ticket-intake graph with 3 nodes in a row: receive (logs it), clean_text
      (strip + lowercase), assign_id (makes "TKT-0021" from the text length).
      Each node prints what it did. At the end print the final state and a mermaid diagram.
```
Compare with `code/day05_state_and_chain.py`. Paste the mermaid output into mermaid.live.

**Check task (3 pts):** add a 4th node, `add_priority`, which sets `priority = "high"` if the text contains "urgent" and `"normal"` otherwise. Show it in the diagram.

**Quiz**
1. What does `total=False` on a TypedDict allow?
2. Two nodes in a row write to the same field `log`. Which value is kept?
3. How do you see a picture of your graph?
4. Why should a node return only what it changes?
5. In what order do the nodes run in a simple chain?

<details><summary>Answer key</summary>

1. Fields can be missing (not set yet) when the graph starts.
2. The last one written. A normal field is overwritten (Day 8 shows how to *merge* instead).
3. `graph.get_graph().draw_mermaid()`, then paste the output into mermaid.live.
4. It keeps nodes independent and avoids accidentally overwriting other fields.
5. In the order the edges connect them, from START to END.
</details>

### Weekly reflection (last 3 minutes of Day 5)
Each person rates themselves 1–5 on: *"I could explain State, Node and Edge to a colleague."* Anyone at 3 or below pairs with a buddy for 10 minutes before Day 6.
