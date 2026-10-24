"""
Day 7 - Loops. A desk can send the folder BACK to an earlier desk.

Layman: a quality checker returns a draft reply to the writer until it is good enough
(or until we give up after 3 tries - never loop forever!).

    START -> write_reply -> check_quality --(not ok & tries < 3)--> write_reply
                                          --(ok or tries >= 3)----> END

Run:  python day07_loops.py
"""
from typing import TypedDict

from langgraph.graph import StateGraph, START, END


class State(TypedDict, total=False):
    question: str
    draft: str
    attempts: int
    approved: bool


def write_reply(state: State) -> dict:
    attempts = state.get("attempts", 0) + 1
    # Pretend each attempt gets a little better (an LLM would do this on Day 13+)
    draft = "Thanks." + " We are looking into it." * attempts
    print(f"[write_reply]   attempt {attempts}: {draft}")
    return {"draft": draft, "attempts": attempts}


def check_quality(state: State) -> dict:
    ok = len(state["draft"]) > 60
    print(f"[check_quality] long enough? {ok}")
    return {"approved": ok}


def should_retry(state: State) -> str:
    if state["approved"] or state["attempts"] >= 3:
        return "done"
    return "retry"


builder = StateGraph(State)
builder.add_node("write_reply", write_reply)
builder.add_node("check_quality", check_quality)
builder.add_edge(START, "write_reply")
builder.add_edge("write_reply", "check_quality")
# The dict maps what the router returns -> which node to go to
builder.add_conditional_edges("check_quality", should_retry, {"retry": "write_reply", "done": END})
graph = builder.compile()

if __name__ == "__main__":
    result = graph.invoke({"question": "Printer jammed"})
    print("\nFinal:", result)

    # Safety net: LangGraph counts every step and stops runaway loops with a
    # GraphRecursionError when 'recursion_limit' is reached. Watch it happen:
    from langgraph.errors import GraphRecursionError
    try:
        graph.invoke({"question": "Printer jammed"}, config={"recursion_limit": 3})
    except GraphRecursionError:
        print("\nStopped by recursion_limit=3 - this protects you from infinite loops (and big AI bills).")
