# Week 4: Tools and agents (Days 15–19)

**Goal of the week:** give the AI "hands" (tools), understand the agent loop, and connect it to **our portal's real API**.

---

## Day 15: Tools, the AI's phone extensions

**Goal:** define tools and see how the AI *asks* to use them.

**Layman picture:** the smart employee can't see our HR database. We give them a list of **phone extensions**: "ext. 101: leave balance", "ext. 102: password reset". The employee **doesn't dial it themselves**. They write on a note: *"Please call ext. 101 for Priya."* Then **we** make the call and tell them the result.

**Concept (7 min)**
- `@tool` turns a Python function into a tool. **The docstring is the instruction manual the AI reads**, so write it clearly.
- `llm.bind_tools([...])` tells the model which tools exist.
- The reply contains `tool_calls`: a list of `{name, args, id}` requests. Our code runs them.
- Tool results go back to the AI as a **ToolMessage**.

**Vibe-code (12 min)**
```
CONTEXT: LangChain 1.x, get_llm() from llm_setup.py.
GOAL: Two tools with @tool: get_leave_balance(employee_name) using a fake dict,
      and reset_password(username). Bind them to the LLM, ask "How many leave days does
      Priya have left?", print reply.tool_calls, then run the requested tool and print the result.
```
Compare with `code/day15_tools.py`.

**Check task (3 pts):** add a tool `book_meeting_room(room: str, time: str)`. Ask *"Book room B at 3pm"* and check the AI picks the right tool with the right arguments.

**Quiz**
1. Who actually runs the tool: the AI or our code?
2. What does the AI read to decide which tool to use?
3. What does `bind_tools` do?
4. What is inside a tool call?
5. What message type carries the tool's result back?

<details><summary>Answer key</summary>

1. Our code. The AI only *requests* it.
2. The tool's name, docstring and argument names/types.
3. Tells the model which tools are available (sent with every request).
4. The tool name, the arguments, and an id.
5. `ToolMessage`.
</details>

---

## Day 16: Build an agent by hand (the ReAct loop)

**Goal:** understand what an "agent" really is: a loop you already know from Day 7.

**Layman picture:** the employee **thinks** ("I need Priya's balance"), **acts** (calls ext. 101), **observes** ("12 days"), thinks again, and repeats until they can reply. This is "ReAct" = **Re**ason + **Act**.
```
START -> agent --(wants a tool?)--> tools --> agent   (loop)
               --(no more tools)--> END
```

**Concept (7 min)**
- `ToolNode(tools)`: a prebuilt desk that runs whatever tools the AI asked for.
- `tools_condition`: a prebuilt router that returns `"tools"` if the last message has tool calls, otherwise `END`.
- `add_edge("tools", "agent")`: after the call, the agent thinks again. **That's the loop.**
- `message.pretty_print()` shows every step.

**Vibe-code (12 min)**
```
CONTEXT: LangGraph 1.x, MessagesState, ToolNode and tools_condition from langgraph.prebuilt.
GOAL: Build a ReAct agent BY HAND using my two tools from day15_tools.py. Nodes 'agent'
      and 'tools'. Ask: "Check Arjun's leave balance and reset password for user ravi."
      Pretty-print every message so I can see each step.
```
Compare with `code/day16_agent_by_hand.py`.

**Check task (3 pts):** run it and count the messages. Label each one: Human, AI asking for tools, Tool result, AI final answer. Draw the mermaid diagram.

**Quiz**
1. What does ReAct stand for?
2. What decides whether the loop continues?
3. What does `ToolNode` do?
4. Which Day 7 concept is this loop built from?
5. Can the agent call two tools in one step?

<details><summary>Answer key</summary>

1. Reason + Act.
2. `tools_condition`: whether the AI's last message contains tool calls.
3. Runs the requested tools and returns ToolMessages with the results.
4. A loop made with a conditional edge.
5. Yes. One AI message can contain several tool calls, and ToolNode runs them all.
</details>

---

## Day 17: The prebuilt agent (`create_agent`)

**Goal:** build the same agent in one line, and know when to use the prebuilt version and when to build by hand.

**Layman picture:** yesterday you built a car engine by hand so you know how it works. Today you buy the car.

**Concept (7 min)**
- `from langchain.agents import create_agent`
- `create_agent(model, tools, system_prompt="...")` returns a compiled graph, so `invoke` and `stream` work as usual.
- **Use the prebuilt agent** for most "chat plus tools" cases.
- **Build by hand** when you need custom steps (approval, validation, special routing).
- ⚠️ AI assistants often suggest `create_react_agent` from `langgraph.prebuilt`. That's the older style.

**Vibe-code (12 min)**
```
CONTEXT: LangChain 1.x — use `from langchain.agents import create_agent` (not create_react_agent).
GOAL: Recreate the Day 16 agent with create_agent using my tools from day15_tools.py and a
      system prompt. Ask "How many leave days does Ravi have?" and print only the final answer.
```
Compare with `code/day17_prebuilt_agent.py`.

**Check task (3 pts):** ask the agent something that needs **no** tool ("What is the capital of France?") and something that needs **both** tools. Did it choose correctly both times?

**Quiz**
1. What does `create_agent` return?
2. When would you build the agent by hand?
3. Name the older function your AI assistant might suggest.
4. How do you get only the final answer from the result?
5. Is the agent's tool choice guaranteed to be right?

<details><summary>Answer key</summary>

1. A compiled graph (you can `invoke`, `stream`, add a checkpointer, and so on).
2. When you need custom steps, routing, approvals or validation inside the loop.
3. `create_react_agent` from `langgraph.prebuilt`.
4. `result["messages"][-1].content`.
5. No. Good docstrings and prompts improve it, and you test it (Day 26).
</details>

---

## Day 18: Tools that call our portal

**Goal:** connect the agent to real data from the engineering portal's API.

**Layman picture:** until now the "phone extensions" went to fake people. Today they ring the **real** project and employee systems.

**Before the session:** start the portal with `npm install`, then `npm run dev` (http://localhost:3000). Open http://localhost:3000/api/projects in a browser to see the raw JSON.

**Concept (7 min)**
- A tool can do anything Python can: call a REST API (`requests.get`), query a database, read a file.
- **Return errors as text** ("Portal not reachable…") so the AI can explain the problem instead of crashing.
- Keep tool outputs **short**. Long JSON costs tokens. Format only the fields that matter.
- **Read-only first.** Tools that change data (create or delete) need extra care, so they get a human approval step on Day 21.

**Vibe-code (12 min)**
```
CONTEXT: LangChain 1.x create_agent, requests, get_llm(). Our Next.js portal runs on
         http://localhost:3000 with GET /api/projects?status=&search= and GET /api/employees.
GOAL: Two tools list_projects(status, search) and list_employees() that call these APIs and
      return short text lines. Catch connection errors and return them as text.
      Ask: "Which projects are over 80% of their budget hours?" and
           "Who is the most loaded employee right now?"
```
Compare with `code/day18_portal_tools.py`.

**Check task (3 pts):** add a tool for `GET /api/workload` (look at `src/app/api/workload/route.js` to see what it returns) and ask a workload question. Then **stop the portal** and ask again. Does the agent explain the problem politely?

**Quiz**
1. Why return errors as text instead of raising exceptions inside tools?
2. Why keep tool output short?
3. Which tools are risky to give an AI?
4. What does the AI see of our API: the URL, or only the tool description?
5. How would the C# team expose more data to this agent?

<details><summary>Answer key</summary>

1. The AI can read the error and explain it or try something else. A crash ends the whole run.
2. Tokens cost money, and long noisy data confuses the model.
3. Tools that change or delete data, send emails, or spend money. Those need approval.
4. Only the tool name, docstring and arguments (plus the results we return).
5. Build a REST endpoint (for example in ASP.NET Core) and wrap it in a new `@tool`.
</details>

---

## Day 19: 🏁 Milestone 3, the Portal Assistant (scored out of 20)

**Task (20 min, two teams):** build a **Portal Assistant agent** with at least 3 tools over the portal API (pick from projects, employees, workload, training, regions; check `src/app/api/*/route.js`). Prepare 5 test questions, including:
- one that needs **two tools**
- one that needs **no tool**
- one about something that **doesn't exist** ("project Atlantis")

**Rubric (20)**
| Criterion | Points |
|---|---|
| 3+ working tools with clear docstrings | 5 |
| Correct answers on the team's 5 questions (1 pt each) | 5 |
| Handles the "doesn't exist" and "portal down" cases gracefully | 4 |
| Short, readable tool outputs | 2 |
| Explain-back: walk through the message trace of one question | 4 |

**Last 10 min:** the teams swap test questions and score each other's agent.
