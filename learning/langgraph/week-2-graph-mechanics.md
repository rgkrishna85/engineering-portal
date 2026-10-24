# Week 2: Graph mechanics (Days 6–9)

**Goal of the week:** build any flowchart: branches, loops, parallel steps, and merging results.
**Still no AI key needed.** Everything here is plain Python, which is exactly why it's easy to understand.

---

## Day 6: Conditional edges (routing)

**Goal:** let the graph decide which desk comes next.

**Layman picture:** the receptionist reads the ticket and points to a hallway: HR, IT, Facilities, or "we'll call you".
```
                 +--> hr_desk ----------+
START -> triage -+--> it_desk ----------+--> END
                 +--> facilities_desk --+
                 +--> unknown_desk -----+
```
This is the portal's current `findPolicy()` keyword logic, redrawn as a graph.

**Concept (7 min)**
- A **router function** reads the state and returns the **name** of the next node.
- `builder.add_conditional_edges("triage", route_function)`
- Return type hints such as `Literal["hr_desk", "it_desk"]` help both the drawing and the AI assistant.
- The C# analogy is a `switch` statement that picks which method to call next.

**Vibe-code (12 min)**
```
CONTEXT: LangGraph 1.x, Python beginner from C#.
GOAL: Office help desk router. A 'triage' node sets department to hr/it/facilities/unknown
      from keywords. A router function sends the state to hr_desk, it_desk, facilities_desk
      or unknown_desk. Each desk writes a fixed answer. Test with 4 questions.
STRUCTURE: START -> triage -> (one of 4 desks) -> END, using add_conditional_edges.
```
Compare with `code/day06_routing.py`.

**Check task (3 pts):** add a **finance_desk** for words like "invoice", "expense" and "reimbursement". Test it with "How do I claim my travel expense?"

**Quiz**
1. What does a router function return?
2. Which method adds a branching hallway?
3. Is the router function itself a node?
4. What happens if the router returns a name that isn't a node?
5. Why is keyword routing weak? Give an example.

<details><summary>Answer key</summary>

1. The name (a string) of the next node, or `END`.
2. `add_conditional_edges`.
3. No. It runs *between* nodes, only to decide the path, and doesn't change the state.
4. An error. The graph can't find that destination.
5. It doesn't understand meaning: "my machine won't boot" contains no keyword, so it goes to unknown. (Fixed with AI on Day 13.)
</details>

---

## Day 7: Loops and the safety stop

**Goal:** send the folder back to an earlier desk, and always have a way out.

**Layman picture:** a quality checker returns a draft reply to the writer: "Not good enough, try again." After 3 tries we send it anyway. Nobody loops forever.
```
START -> write_reply -> check_quality --(retry)--> write_reply
                                      --(done)---> END
```

**Concept (7 min)**
- A loop is just a conditional edge that points **backwards**.
- Always keep a **counter** in the state (`attempts`) and stop at a maximum.
- LangGraph's built-in safety net is `recursion_limit`, which raises `GraphRecursionError`.
- Why it matters: with AI, every loop costs money, so a runaway loop is a big bill.

**Vibe-code (12 min)**
```
CONTEXT: LangGraph 1.x beginner.
GOAL: A loop graph: write_reply makes a draft (longer each attempt), check_quality approves
      it if it is longer than 60 characters. If not approved and attempts < 3, go back to
      write_reply; otherwise end. Then show what happens with recursion_limit=3.
RULES: use add_conditional_edges with a mapping dict {"retry": ..., "done": END}.
```
Compare with `code/day07_loops.py`.

**Check task (3 pts):** change the maximum from 3 tries to 5 and the approval rule to "longer than 100 characters". Predict how many attempts will run *before* you run it.

**Quiz**
1. How is a loop made in LangGraph?
2. Why must the state hold an attempt counter?
3. What error does `recursion_limit` raise?
4. In `add_conditional_edges("check", fn, {"retry": "write", "done": END})`, what is the dict for?
5. Name a real help-desk case where a loop is useful.

<details><summary>Answer key</summary>

1. A conditional edge that can point back to an earlier node.
2. So the router knows when to stop. Without it, the loop could run forever.
3. `GraphRecursionError`.
4. It maps what the router *returns* ("retry"/"done") to the node it *goes to*.
5. Examples: re-ask the user until required info is provided, retry a failing API call, or have an AI improve its answer until a checker approves it.
</details>

---

## Day 8: Parallel desks and reducers

**Goal:** run several desks at the same time and **merge** their results instead of overwriting them.

**Layman picture:** a new employee joins. IT, HR and Facilities all prepare things *at the same time*, and each adds a line to one shared checklist. A summary desk waits for all three.
```
         +--> it_setup ----------+
START -> +--> hr_setup ----------+--> summary -> END
         +--> facilities_setup --+
```

**Concept (7 min)**
- **Fan-out:** several edges leave one point, and those nodes run in parallel.
- **Fan-in:** `add_edge(["a", "b", "c"], "summary")` makes summary wait for all of them.
- **Reducer:** `checklist: Annotated[list[str], operator.add]` means "when several desks write here, *add the lists together*" (like `AddRange`). Without it you'd get an error, or lose data.
- You'll meet a reducer again on Day 11: `add_messages`, which appends chat messages.

**Vibe-code (12 min)**
```
CONTEXT: LangGraph 1.x beginner.
GOAL: New-joiner onboarding graph. it_setup, hr_setup and facilities_setup run in PARALLEL
      from START, each adds one item to a 'checklist' list. A 'summary' node waits for all
      three and writes "3 tasks ready for <employee>".
RULES: use Annotated[list[str], operator.add] as the reducer. Explain what a reducer is.
```
Compare with `code/day08_parallel_reducers.py`.

**Check task (3 pts):** remove the `Annotated[..., operator.add]` and run it. What happens? Put it back. Then add a 4th parallel desk, `security_setup`.

**Quiz**
1. What is a reducer, in one sentence?
2. Without a reducer, what goes wrong when 3 parallel desks write to the same field?
3. How do you make a node wait for several others?
4. Do parallel nodes always finish in the same order?
5. Which reducer is used for chat messages?

<details><summary>Answer key</summary>

1. A rule that says how to *combine* a new value with the existing one (for example, append instead of replace).
2. LangGraph raises an error (`InvalidUpdateError`), because it doesn't know which value to keep.
3. `builder.add_edge(["a", "b", "c"], "next")`.
4. No. Don't rely on the order of results from parallel desks.
5. `add_messages` (built into `MessagesState`).
</details>

---

## Day 9: 🏁 Milestone 1, a graph without AI (scored out of 20)

**Task (20 min, two teams: 3 + 2 people):** vibe code a **Leave Request Router** without any AI:
- State: `employee`, `days`, `reason`, `route`, `result`, and `notes` (a list with a reducer).
- `validate` node: if days ≤ 0 or > 30, route to `reject`.
- If days ≤ 2: `auto_approve`. If days > 2: in parallel, `check_team_calendar` and `check_balance` each add a note, then `manager_queue`.
- Print a mermaid diagram and run 3 test cases.

**Scoring rubric (20)**
| Criterion | Points |
|---|---|
| Runs without errors for all 3 test cases | 5 |
| Uses a conditional edge correctly | 4 |
| Uses parallel nodes + a reducer correctly | 4 |
| Mermaid diagram matches the intended design | 3 |
| A team member (picked by the facilitator) explains the flow | 4 |

**Last 10 min:** each team demos for 3 minutes, then a short discussion: *what did the AI assistant get wrong?*
