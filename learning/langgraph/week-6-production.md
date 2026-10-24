# Week 6: Teams of agents and going to production (Days 24–27)

**Goal of the week:** combine agents, see inside every run, write tests, and expose a graph as a REST API that C# or our Next.js portal can call.

---

## Day 24: Multi-agent (a supervisor plus specialists)

**Goal:** split a big job between specialist agents, using graphs inside graphs (subgraphs).

**Layman picture:** the receptionist (**supervisor**) doesn't answer questions themselves. They send you to the **HR specialist** or the **IT specialist**. Each specialist is a full agent with **their own phones (tools)**.
```
START -> supervisor --> hr_agent (own tool loop) --> END
                   \--> it_agent (own tool loop) --> END
```

**Concept (7 min)**
- A compiled graph (for example from `create_agent`) **can be added as a node**. That's a **subgraph**.
- Why split? Each agent gets fewer tools and a focused prompt, which means better choices and easier testing.
- Patterns: **supervisor** (one boss routes), **handoffs/swarm** (agents pass work to each other), **hierarchical** (teams of teams). There are ready-made libraries, `langgraph-supervisor` and `langgraph-swarm`, to look at later.
- Don't over-engineer: **one good agent beats five confused ones.** Split only when one agent has too many tools or jobs.

**Vibe-code (12 min)**
```
CONTEXT: LangGraph 1.x, create_agent from langchain.agents, get_llm().
GOAL: Supervisor graph. hr_agent = create_agent with get_leave_balance; it_agent =
      create_agent with reset_password and a new check_vpn_status(region) tool. A supervisor
      node + routing function uses structured output to pick hr_agent or it_agent.
      Add both agents directly as nodes (subgraphs). Test one HR and one IT question.
```
Compare with `code/day24_multi_agent.py`.

**Check task (3 pts):** add a `facilities_agent` with a `book_meeting_room` tool, and update the supervisor's choices.

**Quiz**
1. What is a subgraph?
2. Give two reasons to split one agent into several.
3. What does the supervisor decide?
4. When is multi-agent a *bad* idea?
5. Name the two prebuilt multi-agent libraries.

<details><summary>Answer key</summary>

1. A compiled graph used as a single node inside another graph.
2. Fewer tools per agent means better tool choice; focused prompts; separate testing; different teams can own different agents.
3. Which specialist should handle the request.
4. When the task is simple. It adds cost, latency and complexity.
5. `langgraph-supervisor` and `langgraph-swarm`.
</details>

---

## Day 25: Seeing inside (LangSmith tracing and LangGraph Studio)

**Goal:** debug AI graphs visually, with the cost and time of every step.

**Layman picture:** CCTV for your office. You can replay exactly which desk did what, what the AI was told, what it answered, how long it took and what it cost.

**Concept (7 min)**
- **LangSmith** (<https://smith.langchain.com>, has a free tier): add `LANGSMITH_TRACING=true` and `LANGSMITH_API_KEY=...` to `.env`. Every run is then recorded as a **trace**. No code changes.
- **LangGraph Studio**: a visual debugger. Our `code/langgraph.json` already lists three graphs.
  ```bash
  pip install -U "langgraph-cli[inmem]"
  cd learning/langgraph/code
  langgraph dev          # opens Studio in the browser
  ```
  In Studio you can click through nodes, send messages, see state at each step, answer interrupts, and re-run from an earlier step (time travel).
- ⚠️ Traces contain the prompts and data. Check company policy before tracing real employee data.

**Vibe-code / hands-on (12 min)**
1. Turn on tracing and run `day16_agent_by_hand.py`. Open the trace and find the tool call and its token cost.
2. Run `langgraph dev`, open the **leave_approval** graph, submit a request, and approve it from the Studio UI.

**Check task (3 pts):** in the trace, find (a) the slowest step and (b) the total tokens used. Write both in the team notes.

**Quiz**
1. What do you need to switch on LangSmith tracing?
2. What does `langgraph.json` tell Studio?
3. Name two things you can do in Studio that are hard in the terminal.
4. Why be careful with tracing real data?
5. Which command starts the local dev server?

<details><summary>Answer key</summary>

1. The `LANGSMITH_TRACING=true` and `LANGSMITH_API_KEY` environment variables.
2. Which graphs exist (file and variable name), plus the dependencies and the env file.
3. Examples: see state at each step visually, answer interrupts with a click, re-run from an earlier checkpoint, edit state.
4. Traces store prompts and outputs, which may include personal or confidential data.
5. `langgraph dev`.
</details>

---

## Day 26: Testing your graphs

**Goal:** write automatic tests, like xUnit in C#.

**Layman picture:** a mystery shopper visits the office every night and checks that the IT question still goes to IT and the leave request still waits for the manager.

**Concept (7 min)**
- **pytest**: any function named `test_...` with `assert`. Run it with `pytest -q`.
- **Test non-AI parts exactly**: routing rules, reducers, interrupts (deterministic).
- **Test AI parts loosely**: check the *type* of output, the route chosen for clear examples, or that the right tool was called. Don't check exact wording.
- Go further later with **LangSmith evaluations**: a dataset of questions plus scoring, run before each release.

**Vibe-code (12 min)**
```
CONTEXT: pytest, LangGraph 1.x.
GOAL: Write pytest tests for: day06_routing (VPN question -> "it", nonsense -> "unknown"),
      day08_parallel_reducers (3 checklist items), and day21_human_approval (it pauses with
      __interrupt__, balance_ok is False for Arjun asking 10 days, resuming with "rejected"
      gives a message containing "rejected").
```
Compare with `code/test_day26_graphs.py`, then run `pytest -q`.

**Check task (3 pts):** add a test for your Day 6 **finance_desk** and a test for the Day 21 "skip the manager when balance is low" change. Both must pass.

**Quiz**
1. How does pytest find tests?
2. Why are AI outputs hard to test exactly?
3. What can you reliably test in an AI graph?
4. Each test uses a different `thread_id`. Why?
5. What is a LangSmith evaluation dataset?

<details><summary>Answer key</summary>

1. Files named `test_*.py` and functions named `test_*`.
2. The wording changes from run to run (it's non-deterministic).
3. Routing on clear cases, structured-output types, which tool was called, interrupts, and the non-AI nodes.
4. So tests don't share memory and affect each other.
5. A saved list of inputs (and expected results) used to score your agent automatically.
</details>

---

## Day 27: Serve it as an API (for C# and the portal)

**Goal:** put a graph behind a REST endpoint so any app can use it.

**Layman picture:** open a **service window** in the wall. Any department (the C# app, the Next.js portal, Power Automate) can pass a request through it and get an answer back.

**Concept (7 min)**
- **FastAPI** is like ASP.NET Core minimal APIs, and it generates Swagger at `/docs`.
- Request and response models are Pydantic classes (DTOs).
- Pass `thread_id` from the caller so memory works per user.
- Calling it from C#:
  ```csharp
  using var http = new HttpClient();
  var res = await http.PostAsJsonAsync("http://localhost:8000/ask",
      new { question = "My VPN is down", thread_id = "user-42" });
  var body = await res.Content.ReadFromJsonAsync<AskResponse>();
  public record AskResponse(string Department, string Answer);
  ```
- From the portal: `src/app/api/chat/route.js` could `fetch("http://localhost:8000/ask", ...)` instead of using keyword matching. That's what the capstone does.
- Hosting options later: a Docker container on Azure or AWS, or **LangGraph Platform / LangSmith Deployment** (managed).

**Vibe-code (12 min)**
```
CONTEXT: FastAPI, Pydantic, LangGraph 1.x.
GOAL: A FastAPI app with POST /ask taking {question, thread_id} and returning
      {department, answer} by invoking my day06_routing graph. Show me how to run it with
      uvicorn and how to call it from C# HttpClient.
```
Compare with `code/day27_api_server.py`. Run `uvicorn day27_api_server:app --reload --port 8000` and open http://localhost:8000/docs.

**Check task (3 pts):** call the API from Swagger, **and** from a tiny C# console app (or `curl`/Postman) with the team's own question.

**Quiz**
1. What is FastAPI's equivalent of Swagger UI, and where is it?
2. Why should the caller send a `thread_id`?
3. Which file in the portal would call this API?
4. Name two hosting options.
5. What should never be returned in an API error message?

<details><summary>Answer key</summary>

1. Built in, at `/docs`.
2. So memory and approvals are kept per user or conversation.
3. `src/app/api/chat/route.js`.
4. A Docker container on a cloud provider (for example Azure App Service), or LangGraph Platform / LangSmith Deployment.
5. Secrets such as API keys or connection strings, and internal stack traces.
</details>
