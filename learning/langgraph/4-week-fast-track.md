# 4-week fast track (20 sessions × 30 min)

The same program as the 7-week plan, squeezed into **20 sessions, about 10 hours**. Every lesson, quiz and code file is reused from the week files. This page only changes the **schedule** and the **way each session runs**.

## What makes 4 weeks possible

| Change | Why it saves time |
|---|---|
| **Setup as homework before Day 1** (the [setup guide](00-setup-and-cheatsheet.md), about 20 min each) | Gives back most of a session |
| **Python cheat sheet as homework** (read it before Day 1) | Removes old Day 2 |
| **Two lessons per session** on the easier topics | 32 sessions become 20 |
| **"Modify, don't build"** on merged days: run the reference file in `code/`, then vibe code the *check task* change | Building from scratch takes 3× longer |
| **Shorter evaluation:** pick 3 quiz questions from the two lessons, plus the check task | 5 min instead of 8 |
| **Cut to "learn on the job":** Store (old Day 23) and Multi-agent (old Day 24) | Nice to have, not needed for the capstone |
| **2 milestones instead of 3**, and a 5-day capstone | Keeps the capstone, which is where learning sticks |

**Trade-off:** 10 hours instead of 16 means less practice time. Expect the team to need a buddy more often during the first real tasks after the course. If a topic scores 🔴, re-run it as the next day's warm-up instead of slowing the schedule.

## Session format on merged days (30 min)
| Min | Block |
|---|---|
| 0–2 | Warm-up question from yesterday |
| 2–10 | Concept for **both** lessons (office analogy, about 4 min each) |
| 10–22 | Run reference file 1 → vibe code its check task; run reference file 2 (its check task is homework if time runs out) |
| 22–27 | Quiz: 3 questions + check task score |
| 27–30 | Explain-back + Scribe notes |

Single-lesson days follow the normal format from the [README](README.md#4-how-every-30-minute-session-runs).

---

## Week 1: Graphs without AI (no API key needed)

| Day | Topic | Uses lessons (old day) | Code |
|---|---|---|---|
| 1 | What LangGraph is + vibe-coding rules | 1, 3 | `day04_first_graph.py` (install check) |
| 2 | First graph + state and chains | 4, 5 | `day04_first_graph.py`, `day05_state_and_chain.py` |
| 3 | Conditional edges (routing) | 6 | `day06_routing.py` |
| 4 | Loops + parallel steps and reducers | 7, 8 | `day07_loops.py`, `day08_parallel_reducers.py` |
| 5 | 🏁 **Milestone 1** (old Day 9 task, 20 min build + demos) | 9 | — |

## Week 2: Adding AI and tools

| Day | Topic | Uses lessons (old day) | Code |
|---|---|---|---|
| 6 | Talking to an LLM + chatbot in a graph | 10, 11 | `day10_first_llm_call.py`, `day11_chatbot.py` |
| 7 | Structured output (the AI fills in a form) | 12 | `day12_structured_output.py` |
| 8 | AI routing + prompting tips | 13, 14 (concept only) | `day13_llm_router.py` |
| 9 | Tools + agent by hand | 15, 16 | `day15_tools.py`, `day16_agent_by_hand.py` |
| 10 | Prebuilt agent + portal API tools | 17, 18 | `day17_prebuilt_agent.py`, `day18_portal_tools.py` |

## Week 3: Memory, people and production

| Day | Topic | Uses lessons (old day) | Code |
|---|---|---|---|
| 11 | 🏁 **Milestone 2**: Portal Assistant (old Day 19 task, plus the "not in policy" test from old Day 14) | 14, 19 | — |
| 12 | Memory: checkpointer and threads | 20 | `day20_memory.py` |
| 13 | Human-in-the-loop (manager approval) | 21 | `day21_human_approval.py` |
| 14 | Streaming + LangSmith/Studio debugging | 22, 25 | `day22_streaming.py`, `langgraph.json` |
| 15 | Testing + serving as an API for C# | 26, 27 | `test_day26_graphs.py`, `day27_api_server.py` |

## Week 4: Capstone, the Smart Office Help Desk

Follow [week-7-capstone.md](week-7-capstone.md) exactly. It's already 5 sessions.

| Day | Capstone step |
|---|---|
| 16 | Design + skeleton |
| 17 | Build the parts |
| 18 | Join up + 10 test questions |
| 19 | Compare with the reference + wire into the portal |
| 20 | 🏆 Demo day |

**Learn on the job afterwards:** Long-term memory with Store (`day23_long_term_memory.py`), Multi-agent (`day24_multi_agent.py`), and the "What to learn next" list at the end of the capstone page.

## Tracking
Use [progress-tracker.md](progress-tracker.md) and write the fast-track day number next to the old day number. Milestones are still scored /20; merged days are scored /10 (3 quiz + 3 check task + 2 explain-back + 2 for the second lesson's check task, or its homework).
