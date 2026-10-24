# Week 3: Adding the AI brain (Days 10–14)

**Goal of the week:** put an LLM (Large Language Model) inside graph nodes: chat, classify, and route by meaning.
**You need an API key from Day 10.** See [setup](00-setup-and-cheatsheet.md#api-key-needed-from-day-10).

---

## Day 10: Talking to an LLM

**Goal:** call an AI model, understand messages, and understand tokens (= cost).

**Layman picture:** the LLM is a very well-read new employee who has read the whole internet but knows **nothing about our company**. To use them you give:
- a **SystemMessage**: their job description ("You are the office help desk…")
- a **HumanMessage**: what the person asked

and they return an **AIMessage**: their reply.

**Concept (7 min)**
- Models: Claude, GPT, Gemini, and others. `init_chat_model("provider:model")` connects to any of them. Ours lives in `llm_setup.py`.
- **Tokens**: pieces of words. You pay per token in and per token out. See `reply.usage_metadata`.
- The model **does not remember** between calls unless you send the history again (Days 11 and 20).
- It can **make things up** ("hallucinate"). That's why we later give it tools and real data.

**Vibe-code (12 min)**
```
CONTEXT: LangGraph 1.x / LangChain 1.x beginner. Use get_llm() from llm_setup.py.
GOAL: Send a SystemMessage ("friendly office help desk, 2 sentences") and a HumanMessage
      ("I forgot my password") to the model. Print the reply text, its type and token usage.
```
Compare with `code/day10_first_llm_call.py`.

**Check task (3 pts):** change the system message to make the bot answer like a pirate, then like a formal lawyer. What changed, and what stayed the same? Note how many tokens each used.

**Quiz**
1. What are the three main message types?
2. What is a token, and why do you care?
3. Does the model remember your previous call?
4. Why do we use `get_llm()` instead of creating the model in every file?
5. What is a "hallucination"?

<details><summary>Answer key</summary>

1. SystemMessage (instructions), HumanMessage (user), AIMessage (model reply). Day 15 adds ToolMessage.
2. A piece of a word. You pay per token, and the model has a maximum number of tokens it can read at once.
3. No. Each call is independent; you must send the history.
4. One place to change the provider or model (like dependency injection).
5. The model confidently states something false or made up.
</details>

---

## Day 11: A chatbot inside a graph

**Goal:** put the LLM in a node and use `MessagesState`.

**Layman picture:**
```
START -> chatbot -> END
```
The folder now holds the **conversation transcript**. The chatbot desk reads the whole transcript and adds its reply at the bottom.

**Concept (7 min)**
- `MessagesState`: a built-in state with one field, `messages`, plus the `add_messages` reducer (it **appends**).
- A node returns `{"messages": [reply]}`, and it's *added* to the history, not replacing it.
- Messages can be dicts: `{"role": "user", "content": "hi"}`.
- In today's version **we** keep the history list ourselves. Day 20 hands that job to LangGraph.

**Vibe-code (12 min)**
```
CONTEXT: LangGraph 1.x, use MessagesState and get_llm() from llm_setup.py.
GOAL: A terminal chatbot: one node 'chatbot' that calls the LLM with a system message
      plus all messages. A while-loop reads input, invokes the graph with the history,
      prints the reply, and stops on 'quit'.
```
Compare with `code/day11_chatbot.py`.

**Check task (3 pts):** have a 3-turn chat. Tell it your name in turn 1 and ask for it in turn 3: it remembers. Now change the code to send **only the new message** each time: it forgets. Explain why.

**Quiz**
1. What field does `MessagesState` contain?
2. What does the `add_messages` reducer do?
3. Why does the bot remember your name in today's code?
4. What would make it forget?
5. Where does the system message go: in the state, or added in the node?

<details><summary>Answer key</summary>

1. `messages`.
2. Appends new messages to the list (and can update a message with the same id).
3. Because we send the whole history back in each time.
4. Sending only the latest message.
5. In our code it's added in the node, so it isn't stored in the history again on every turn.
</details>

---

## Day 12: Structured output, where the AI fills in a form

**Goal:** get a **typed object** back from the AI instead of free text.

**Layman picture:** instead of asking the employee to "write me a note about this ticket", you hand them a **form** with boxes: Department ☐ HR ☐ IT ☐ Facilities · Urgency ☐ Low ☐ Medium ☐ High · Summary ____.

**Concept (7 min)**
- Define the form with **Pydantic** `BaseModel`, like a C# class with validation attributes.
- `llm.with_structured_output(MyForm)` returns a Python object, so there's no string parsing.
- `Literal["hr", "it"]` limits the choices. `Field(description=...)` tells the AI what each box means.
- This is the most useful trick for business apps: classification, data extraction, and filling forms from emails.

**Vibe-code (12 min)**
```
CONTEXT: LangChain 1.x, Pydantic v2, get_llm() from llm_setup.py.
GOAL: Classify help desk tickets into a Pydantic model TicketClassification with
      department (hr/it/facilities/unknown), urgency (low/medium/high) and a one-line summary.
      Use with_structured_output. Test on 3 example tickets and print a neat table.
```
Compare with `code/day12_structured_output.py`.

**Check task (3 pts):** add a field `needs_human: bool` with the description "True if the user is angry or the issue is legal/safety related". Test it with an angry message.

**Quiz**
1. What does `with_structured_output` give you back?
2. Why use `Literal[...]` for department?
3. What is the role of `Field(description=...)`?
4. What is the C# analogy for a Pydantic model?
5. Name two real uses for structured output in our company.

<details><summary>Answer key</summary>

1. An instance of your Pydantic class with typed fields.
2. It restricts the AI to fixed allowed values, so the router can rely on them.
3. It tells the AI what to put in that field (it's part of the prompt).
4. A DTO class with `[Required]`/validation attributes, deserialized from JSON.
5. Examples: classifying tickets, extracting leave dates from emails, pulling project data from documents, tagging review comments.
</details>

---

## Day 13: An AI receptionist (LLM routing)

**Goal:** replace Day 6's keyword router with an AI that understands meaning.

**Layman picture:** same floor plan as Day 6, but the receptionist now *understands* "my machine won't boot after the update" means IT, even though no keyword like "laptop" appears.

**Concept (7 min)**
- `triage` now uses structured output (`Route` with a `Literal` department).
- The **graph doesn't change**, only what happens inside one node. That's the power of graphs: swap the brain, keep the plan.
- Each department desk can have its own instructions (its own system prompt).
- A *node factory* function (`make_desk`) builds similar nodes, like a C# method that returns a `Func<>`.

**Vibe-code (12 min)**
```
CONTEXT: LangGraph 1.x, get_llm() from llm_setup.py.
GOAL: Take my Day 6 routing graph and replace keyword triage with an LLM using
      with_structured_output(Route) where Route.department is Literal hr/it/facilities/unknown.
      Each desk should also use the LLM with its own short instructions.
      Test: "My machine won't boot", "Payslip is wrong", "Meeting room B is freezing".
```
Compare with `code/day13_llm_router.py`.

**Check task (3 pts):** run the same 3 questions through **both** the Day 6 graph and the Day 13 graph. Write down which ones the keyword version got wrong.

**Quiz**
1. What changed in the graph structure from Day 6 to Day 13?
2. Why use structured output for routing instead of free text?
3. What is one downside of an LLM router compared with keywords?
4. What is a node factory?
5. When would you still choose keyword routing?

<details><summary>Answer key</summary>

1. Nothing. Only the inside of the `triage` node (and the desks) changed.
2. The router needs an exact value like `"it"`. Free text could be "I think this is IT-related".
3. It's slower, costs money, and is not 100% predictable.
4. A function that creates and returns node functions with different settings.
5. When rules are simple and exact, speed and cost matter, or for a cheap pre-filter before the LLM.
</details>

---

## Day 14: 🏁 Milestone 2, prompting skills and the AI help desk v1 (scored out of 20)

**Concept (8 min), good prompts:** be specific about the role, give the policies or facts, set the format and length, give 1–2 examples, and say what to do when unsure ("If not in the policy, say you don't know"). Bad prompt: *"Answer HR questions."* Good prompt: *"You are the HR desk. Answer ONLY from the policy below in max 3 sentences. If the answer isn't in the policy, say 'Please contact HR at ext. 2000'."*

**Task (15 min, two teams):** build **AI Help Desk v1**:
- Copy the `POLICIES` text from `src/app/api/chat/route.js` into the prompt.
- LLM triage → `policy_desk` (answers only from the policies) or `unknown_desk`.
- Test with 5 questions, including one that is **not** in any policy. The bot must not make up an answer.

**Rubric (20)**
| Criterion | Points |
|---|---|
| Uses structured output for routing | 4 |
| Answers come only from the policy text (no made-up facts) | 5 |
| Handles the "not in policy" question honestly | 4 |
| Clear, specific prompts (reviewed by the other team) | 3 |
| Explain-back by a randomly chosen member | 4 |

**Last 7 min:** the teams swap and try to trick each other's bot. Note which prompt changes fixed the tricks.
