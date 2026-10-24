# LangGraph from Zero — a 30-minutes-a-day team program

**Audience:** a team of 5 who are new to LangGraph and to AI, coming from C# with little programming background.
**Format:** on-the-job training. 30 minutes a day, learn by vibe coding (you describe what you want, an AI assistant writes the code, and you run it, read it and explain it).
**Running example:** the **Office Help Desk**. Our portal already has a basic help-desk chatbot (`src/app/api/chat/route.js`) that answers by matching keywords like `if (lower.includes('leave'))`. Over the course the team rebuilds it, one step at a time, into a real LangGraph AI agent.

---

## 1. What is LangGraph? (the version for non-programmers)

Think of an **office that handles requests**.

| Office world | LangGraph word | C# comparison |
|---|---|---|
| The **folder** that moves from desk to desk, with notes written on it | **State** | A DTO / `record` passed through a pipeline |
| A **desk** where one person does one job | **Node** | A method: `State DoWork(State s)` |
| A **hallway** from one desk to the next | **Edge** | Calling the next method |
| A **receptionist** who decides which hallway to take | **Conditional edge** | `switch` / `if-else` |
| The **office floor plan** | **Graph** (`StateGraph`) | A workflow or state machine |
| Locking the floor plan before opening the office | `compile()` | `builder.Build()` |
| Handing a folder in at reception | `invoke()` | `await workflow.RunAsync(input)` |
| A **well-read new employee** who can read and write | **LLM** (Claude, GPT…) | An external API you call |
| The **phone extensions** that employee may call | **Tools** | Methods you expose to the AI |
| An employee who decides on their own which phones to call | **Agent** | — |
| A **filing cabinet** of folder photocopies, one drawer per customer | **Checkpointer** (memory) | Saving state to a DB keyed by session id |
| "Manager's signature needed": the folder waits in an in-tray | **Interrupt** (human-in-the-loop) | An approval step in a workflow |
| An **employee profile card** that lasts across all visits | **Store** (long-term memory) | A user-profile table |

**In one sentence:** LangGraph lets you draw a flowchart of steps (some done by normal code, some by an AI), and it runs that flowchart for you. It remembers where it got to, can loop back, can wait for a human, and shows you every step.

**Why not just call the AI directly?** For one question and one answer you don't need it. Once you need *several steps, decisions, retries, tools, memory or approvals*, writing that by hand gets messy fast. LangGraph gives that work a clear structure.

**Why Python and not C#?** LangGraph is only available for **Python** and **JavaScript/TypeScript**; there is no official C# version. We use Python because it is the main version, it has the most examples and documentation, and it reads almost like plain English. Day 2 covers all the Python you need. On Day 27 we put the graph behind a web API that C# (or our Next.js portal) can call.

---

## 2. Everything that exists in LangGraph, and what you actually need

✅ = taught in this course · 🟡 = mentioned, learn on the job · ⏳ = later, once you need it

### Core building blocks
| Feature | What it means in plain words | Need it? | Day |
|---|---|---|---|
| `StateGraph`, `START`, `END` | The floor plan, plus its entrance and exit | ✅ Must | 4 |
| State (`TypedDict`) | What is written on the folder | ✅ Must | 4–5 |
| Nodes | Desks (plain Python functions) | ✅ Must | 4 |
| Edges | Fixed hallways | ✅ Must | 4–5 |
| Conditional edges | Receptionist picks the hallway | ✅ Must | 6 |
| Loops + `recursion_limit` | Send the folder back, with a safety stop | ✅ Must | 7 |
| Parallel nodes (fan-out / fan-in) | Several desks work at the same time | ✅ Must | 8 |
| Reducers (`Annotated[list, operator.add]`, `add_messages`) | Rules for *merging* notes instead of overwriting them | ✅ Must | 8, 11 |
| `MessagesState` | Ready-made state that holds a chat history | ✅ Must | 11 |
| Drawing the graph (`draw_mermaid`) | Print the floor plan as a picture | ✅ Must | 5 |
| Subgraphs | A whole department (a graph) used as one desk | ✅ Good | 24 |
| `Command` (update and go-to from inside a node) | A desk decides *and* writes in one step | 🟡 | — |
| `Send` API (map-reduce) | Make N copies of a folder, one per item | ⏳ | — |
| Retry policies and node caching | Auto-retry flaky desks; reuse earlier answers | ⏳ | — |
| Pydantic / dataclass state | Stricter, validated folder | 🟡 | 12 |
| Runtime context (`context_schema`) | Pass settings such as user id or model name to every desk | ⏳ | — |
| Functional API (`@entrypoint`, `@task`) | Write the workflow as plain functions instead of a drawn graph | ⏳ | — |
| Async (`ainvoke`, `astream`) | Like C# `async/await` | 🟡 | 22 |

### AI parts (from LangChain, LangGraph's sister library)
| Feature | Plain words | Need it? | Day |
|---|---|---|---|
| Chat models (`init_chat_model`) | Connect to Claude, OpenAI, Azure OpenAI, etc. | ✅ Must | 10 |
| Messages (System / Human / AI / Tool) | Job description, question, answer, phone result | ✅ Must | 10 |
| Structured output (`with_structured_output`) | AI fills in a typed form instead of free text | ✅ Must | 12 |
| Tools (`@tool`, `bind_tools`) | Give the AI phone extensions | ✅ Must | 15 |
| `ToolNode`, `tools_condition` | Prebuilt "make the phone call" desk and router | ✅ Must | 16 |
| `create_agent` (prebuilt agent) | A ready-made thinking-and-tools loop in one line | ✅ Must | 17 |
| Prompting | Writing clear instructions for the AI | ✅ Must | 14 |

### Memory and people
| Feature | Plain words | Need it? | Day |
|---|---|---|---|
| Checkpointers (`InMemorySaver`, SQLite, Postgres) | Filing cabinet, so conversations remember | ✅ Must | 20 |
| Threads (`thread_id`) | One drawer per conversation | ✅ Must | 20 |
| `get_state`, state history, time travel | Look at, or rewind to, any earlier photocopy | ✅ Good | 20 |
| `interrupt()` and `Command(resume=...)` | Pause for a human, then continue | ✅ Must | 21 |
| Static breakpoints (`interrupt_before/after`) | Always pause before or after a desk (debugging) | 🟡 | 21 |
| Store (`InMemoryStore`, semantic search) | Long-term memory across conversations | ✅ Good | 23 |
| Durable execution | Survive crashes and continue later | 🟡 | 20 |

### Seeing, testing and shipping
| Feature | Plain words | Need it? | Day |
|---|---|---|---|
| Streaming (`updates`, `values`, `messages`, `custom`) | Watch progress live, and type the answer word by word | ✅ Must | 22 |
| LangSmith tracing | X-ray of every step, its cost and its timing | ✅ Good | 25 |
| LangGraph Studio + `langgraph dev` | Visual debugger: click through your graph | ✅ Good | 25 |
| Testing with pytest | Unit tests, like xUnit | ✅ Must | 26 |
| Serving with FastAPI | Expose the graph as a REST API for C# or Next.js | ✅ Good | 27 |
| LangGraph Platform / LangSmith Deployment | Managed hosting for graphs | ⏳ | 27 |
| Prebuilt multi-agent libraries (`langgraph-supervisor`, `langgraph-swarm`) | Ready-made team-of-agents patterns | ⏳ | 24 |
| LangGraph.js | The same ideas in TypeScript (fits our Next.js portal) | ⏳ | — |

> **Rule of thumb:** the ✅ Must items (about 25 concepts) cover roughly 90% of real-world LangGraph work. The rest you look up when a task needs it, and that's what "learn while you work" means.

---

## 3. How long will it take?

| Milestone | Sessions | Calendar (5 days/week) | What you can do after it |
|---|---|---|---|
| **Week 1: Foundations** | 1–5 | Week 1 | Set up Python, vibe code safely, run a first graph |
| **Week 2: Graph mechanics** | 6–9 | Week 2 | Build any flowchart: branches, loops, parallel steps |
| **Week 3: Adding the AI brain** | 10–14 | Week 3 | Chatbots, AI classification, AI routing |
| **Week 4: Tools and agents** | 15–19 | Week 4 | Agents that call real systems (our portal API) |
| **Week 5: Memory and humans** | 20–23 | Week 5 | Remembering chats, approvals, live streaming |
| **Week 6: Teams of agents and going to production** | 24–27 | Week 6 | Multi-agent setups, debugging, tests, a REST API |
| **Week 7: Capstone** | 28–32 | Week 7 | Ship the Smart Help Desk and demo it |

- **Total: 32 sessions × 30 min = 16 hours, about 7 weeks** at 5 sessions a week.
- At 3 sessions a week it takes about 11 weeks.
- **What to expect:** the team will be *comfortable* after Week 2, *useful on real tasks* after Week 4, and *independently productive* after the capstone, plus 2–4 weeks of real project work. That last stretch is normal for any new framework.
- **Only have 4 weeks?** Use the [4-week plan](4-week-fast-track.md): all 32 sessions (16 h), with two 30-min blocks on 12 of the 20 days.
- **If you fall behind:** the milestone days (9, 14, 19) double as catch-up days. Skip the 🟡 extras before you skip a Must.

---

## 4. How every 30-minute session runs

| Minutes | Block | What happens |
|---|---|---|
| 0–3 | **Warm-up** | One quick question about yesterday (from the quiz someone missed) |
| 3–10 | **Concept** | Facilitator explains today's idea with the office analogy. No code yet. |
| 10–22 | **Vibe-code** | The *Driver* types the prompt into the AI assistant, runs the code, and the team reads it together |
| 22–27 | **Evaluate** | 5-question quiz plus a hands-on check task (see each day) |
| 27–30 | **Wrap-up** | The *Explainer* sums up today in their own words; scores go in the [tracker](progress-tracker.md) |

### Rotating roles (5 people, 5 roles, rotate every day)
| Role | Job |
|---|---|
| **Driver** | Types prompts and runs code (shares screen) |
| **Navigator** | Reads the prompt aloud and checks the AI did what was asked |
| **Tester** | Tries to break it: odd inputs, wrong names, empty text |
| **Explainer** | Explains the code line by line at the end, in plain words |
| **Scribe** | Writes 3 bullet notes in the team notes file and records quiz scores |

Rotation: person A is the Driver on Day 1, the Navigator on Day 2, and so on. Over 5 days everyone plays every role.

---

## 5. Daily evaluation (10 points per person per day)

| Part | Points | How |
|---|---|---|
| Quiz (5 questions) | 5 | 1 point each. Answers are hidden under "Answer key" in each day's section. |
| Hands-on check task | 3 | 3 = works and you can explain it · 2 = works with help · 1 = attempted · 0 = not tried |
| Explain-it-back | 2 | Facilitator picks one person to explain one concept in their own words. Everyone else gives a thumbs up or down; take the average. |

- **Green 8–10:** move on.
- **Yellow 5–7:** that topic becomes tomorrow's warm-up question.
- **Red 0–4:** pair this person with a Green buddy for 10 minutes before the next session.

**Milestones** (Days 9, 14, 19, and the capstone demo on Day 32) are scored out of 20 using the rubric on that day. Record everything in [progress-tracker.md](progress-tracker.md).

---

## 6. What's in this folder

```
learning/langgraph/
├── README.md               <- you are here (overview, feature map, timeline, evaluation)
├── 00-setup-and-cheatsheet.md  <- install, C# -> Python cheat sheet, vibe-coding guide
├── week-1-foundations.md   <- Days 1-5
├── week-2-graph-mechanics.md   <- Days 6-9
├── week-3-adding-the-brain.md  <- Days 10-14
├── week-4-tools-and-agents.md  <- Days 15-19
├── week-5-memory-and-humans.md <- Days 20-23
├── week-6-production.md    <- Days 24-27
├── week-7-capstone.md      <- Days 28-32
├── 4-week-fast-track.md    <- all 32 sessions in 4 weeks (double days)
├── progress-tracker.md     <- scores for the team
├── slides/                <- one self-study PowerPoint deck per day (day00-day32)
└── code/                   <- one runnable file per lesson (tested with LangGraph 1.2)
    ├── requirements.txt, .env.example, llm_setup.py, langgraph.json
    ├── day02 ... day27 *.py
    ├── test_day26_graphs.py
    └── capstone_helpdesk_agent.py   <- reference solution (look only after trying!)
```

The code files are **reference answers**. The intended flow each day: vibe code your own version first, then compare it with the file in `code/`.

**Start here:** [00-setup-and-cheatsheet.md](00-setup-and-cheatsheet.md), then [Week 1](week-1-foundations.md).

**Prefer slides?** Every day is also a self-contained PowerPoint deck in [slides/](slides/README.md), with the concept, an annotated example, the expected output, a vibe-coding prompt, a check task, common mistakes and a quiz.
