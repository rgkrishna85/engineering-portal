"""
Day 23 - Long-term memory with a STORE.

Checkpointer (Day 20) = memory of ONE conversation (one drawer per thread).
Store             = memory ACROSS ALL conversations - like an employee profile card
                    ("Priya prefers email", "Arjun is in the Pune office").

No LLM needed for this lesson.
Run:  python day23_long_term_memory.py
"""
from typing import TypedDict

from langgraph.checkpoint.memory import InMemorySaver
from langgraph.graph import StateGraph, START, END
from langgraph.store.base import BaseStore
from langgraph.store.memory import InMemoryStore


class State(TypedDict, total=False):
    user: str
    text: str
    reply: str


# Ask for 'store' as a keyword argument and LangGraph hands it to your node automatically
# (C# analogy: constructor dependency injection).
def remember_or_answer(state: State, *, store: BaseStore) -> dict:
    namespace = ("profiles", state["user"])          # like a folder path: profiles/priya
    if state["text"].lower().startswith("remember"):
        fact = state["text"][len("remember"):].strip(" :")
        store.put(namespace, f"fact-{len(store.search(namespace))}", {"fact": fact})
        return {"reply": f"Got it, I will remember: {fact}"}
    facts = [item.value["fact"] for item in store.search(namespace)]
    return {"reply": f"What I know about {state['user']}: {facts or 'nothing yet'}"}


builder = StateGraph(State)
builder.add_node("remember_or_answer", remember_or_answer)
builder.add_edge(START, "remember_or_answer")
builder.add_edge("remember_or_answer", END)
graph = builder.compile(checkpointer=InMemorySaver(), store=InMemoryStore())

if __name__ == "__main__":
    # Two DIFFERENT threads (conversations) - the store still connects them
    graph.invoke({"user": "priya", "text": "remember: I prefer email over phone"},
                 {"configurable": {"thread_id": "monday-chat"}})
    r = graph.invoke({"user": "priya", "text": "what do you know?"},
                     {"configurable": {"thread_id": "friday-chat"}})
    print(r["reply"])
