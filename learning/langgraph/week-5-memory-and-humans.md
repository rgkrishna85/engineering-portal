# Week 5: Memory and humans (Days 20–23)

**Goal of the week:** conversations that remember, workflows that pause for a manager, live progress, and long-term memory.

---

## Day 20: Short-term memory (checkpointer and threads)

**Goal:** let LangGraph remember conversations for you.

**Layman picture:** the **checkpointer** is a **filing cabinet**. After every desk, a photocopy of the folder is filed in a drawer labelled with a **thread_id** (one drawer per conversation). When Priya comes back with her thread id, we open her drawer and continue. Arjun's drawer is separate.

**Concept (7 min)**
- `builder.compile(checkpointer=InMemorySaver())`
- Every call passes `config = {"configurable": {"thread_id": "priya-chat-1"}}`
- Now you send **only the new message**. The history comes out of the drawer.
- `graph.get_state(config)` shows the latest folder. `graph.get_state_history(config)` lists every photocopy. You can resume from an older one ("time travel").
- `InMemorySaver` forgets when the program stops. In real apps use `SqliteSaver` or `PostgresSaver` (separate pip packages). This also gives **durable execution**: the work survives a crash.

**Vibe-code (12 min)**
```
CONTEXT: LangGraph 1.x. Reuse the builder from day11_chatbot.py.
GOAL: Compile it with InMemorySaver. Simulate two users (Priya and Arjun) with different
      thread_ids. Each tells the bot their name, then asks "What is my name?".
      Send only the new message each time. Finally print how many messages and snapshots
      are stored for Priya using get_state and get_state_history.
```
Compare with `code/day20_memory.py`.

**Check task (3 pts):** prove the threads are separate: ask Arjun's thread "What is Priya's team?" It must *not* know. Explain why.

**Quiz**
1. What is a thread_id, in the office picture?
2. What changes in how you call `invoke` once you have a checkpointer?
3. Why is `InMemorySaver` not enough for production?
4. What does `get_state_history` give you?
5. Name one business reason to keep threads separate.

<details><summary>Answer key</summary>

1. The label on a filing-cabinet drawer: one conversation.
2. You pass a config with `thread_id` and send only the new input.
3. It lives in RAM and is lost when the process restarts. Use SQLite or Postgres.
4. Every saved snapshot of the state, step by step (for debugging and time travel).
5. Privacy: one employee must never see another employee's conversation or data.
</details>

---

## Day 21: Human-in-the-loop (pause for approval)

**Goal:** stop the graph, wait for a human decision, then continue.

**Layman picture:** a leave request needs the **manager's signature**. The folder goes into the manager's **in-tray** and the process **sleeps**, for a minute or for three days. When the manager signs, it continues *exactly where it stopped*.
```
START -> check_balance -> manager_approval (PAUSE) -> notify -> END
```

**Concept (7 min)**
- Inside a node: `decision = interrupt({"question": "Approve?"})`. This **stops** the run.
- The caller sees `result["__interrupt__"]`, the in-tray item.
- To continue: `graph.invoke(Command(resume="approved"), config)`. Now `interrupt()` *returns* `"approved"`.
- A **checkpointer is required**, because the paused folder must be filed somewhere.
- Use it for anything risky: sending emails, approving money, changing data, publishing.
- Also good to know: `compile(interrupt_before=["node"])` always pauses before a node. It's handy for debugging.

**Vibe-code (12 min)**
```
CONTEXT: LangGraph 1.x, interrupt and Command from langgraph.types, InMemorySaver.
GOAL: Leave approval graph: check_balance (fake balances) -> manager_approval which calls
      interrupt() with a question -> notify. Run until it pauses, print the in-tray question,
      read approved/rejected from input(), resume with Command(resume=...), print the message.
      No LLM needed.
```
Compare with `code/day21_human_approval.py`.

**Check task (3 pts):** if `balance_ok` is False, skip the manager and go straight to `notify` with "rejected: not enough balance". (Hint: a conditional edge after `check_balance`.)

**Quiz**
1. What does `interrupt()` do the first time it runs, and what does it return after resume?
2. Why is a checkpointer required?
3. How do you resume a paused graph?
4. Can the human answer days later? What is needed for that?
5. Name 3 places in our portal workflows where a human approval node fits.

<details><summary>Answer key</summary>

1. The first time, it pauses the graph and sends its value to the caller. After resume, it returns the value passed in `Command(resume=...)`.
2. The paused state must be saved so it can be picked up later.
3. `graph.invoke(Command(resume=value), config)` with the **same** thread_id.
4. Yes, with a persistent checkpointer (SQLite or Postgres) instead of the in-memory one.
5. Examples: leave/travel approval, engineering review sign-off, client deliverable release, timesheet exceptions.
</details>

---

## Day 22: Streaming (watch it work live)

**Goal:** show progress step by step, and type the AI's answer word by word.

**Layman picture:** instead of waiting at the counter for 20 seconds, the receptionist calls out *"Sending you to IT… IT is checking… here's your answer…"*

**Concept (7 min)**
- `graph.stream(input, stream_mode="updates")`: one event per desk, showing what it wrote.
- `stream_mode="values"`: the full folder after every step.
- `stream_mode="messages"`: LLM tokens as they're generated (ChatGPT-style typing).
- `stream_mode="custom"`: your own progress messages from inside nodes.
- Async versions: `astream`, `ainvoke` (like C# `await foreach`).

**Vibe-code (12 min)**
```
CONTEXT: LangGraph 1.x.
GOAL: (1) Stream my day06_routing graph with stream_mode="updates" and print which node wrote
      what. (2) Stream my day11_chatbot graph with stream_mode="messages" and print the tokens
      as they arrive on one line.
```
Compare with `code/day22_streaming.py`.

**Check task (3 pts):** stream `day16_agent_by_hand.py` with `stream_mode="updates"` and print a friendly line per step, for example "🤔 thinking…", "📞 calling get_leave_balance…", "✅ answer ready".

**Quiz**
1. Name the stream mode for "one event per node".
2. Which mode gives the typing effect?
3. Why does streaming matter for users?
4. What is the async version of `stream`?
5. Does streaming change the final result?

<details><summary>Answer key</summary>

1. `updates`.
2. `messages`.
3. Long waits feel broken. Live progress builds trust and feels faster.
4. `astream`.
5. No. It only shows the same work as it happens.
</details>

---

## Day 23: Long-term memory (the Store)

**Goal:** remember facts about a user across *all* conversations.

**Layman picture:** the checkpointer is the drawer for **one conversation**. The **Store** is the **employee profile card** that every conversation can read: "Priya prefers email", "Arjun works from the Pune office".

**Concept (7 min)**
- `compile(checkpointer=..., store=InMemoryStore())`
- A node gets the store by adding a `store` keyword argument: `def node(state, *, store: BaseStore)`. That's dependency injection, like in C#.
- `store.put(namespace, key, value)` saves. `store.search(namespace)` reads. A namespace is like a folder path: `("profiles", "priya")`.
- In production, use a database-backed store. Stores also support **semantic search** (find memories by meaning).

**Vibe-code (12 min)**
```
CONTEXT: LangGraph 1.x, InMemoryStore from langgraph.store.memory, BaseStore injection.
GOAL: One node: if the text starts with "remember", save the fact under ("profiles", user);
      otherwise list everything known about the user. Show that a fact saved in thread
      "monday-chat" is visible in thread "friday-chat". No LLM needed.
```
Compare with `code/day23_long_term_memory.py`.

**Check task (3 pts):** add a second user and prove each user only sees their own facts.

**Quiz**
1. Checkpointer vs Store: which is per-conversation and which is across conversations?
2. How does a node get access to the store?
3. What is a namespace?
4. Give one good and one *bad* (privacy-risky) thing to store about an employee.
5. Which kind of search lets you find memories "by meaning"?

<details><summary>Answer key</summary>

1. The checkpointer is per conversation (thread). The Store is across all conversations.
2. Declare a `store` keyword parameter in the node and LangGraph injects it.
3. A folder-like path (a tuple) that groups memories, for example `("profiles", "priya")`.
4. Good: preferred contact method or office location. Bad: health details or passwords, which must never be stored.
5. Semantic (vector/embedding) search.
</details>
