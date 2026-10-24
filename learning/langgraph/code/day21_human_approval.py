"""
Day 21 - Human-in-the-loop: PAUSE the graph and wait for a manager's decision.

Layman: a leave request needs the manager's signature. The folder is put in the manager's
in-tray (interrupt). The process sleeps - for seconds or for days. When the manager
signs (Command(resume=...)), it continues exactly where it stopped.

    START -> check_balance -> manager_approval (PAUSE) -> notify -> END

No LLM needed for this lesson.
Run:  python day21_human_approval.py
"""
from typing import TypedDict

from langgraph.checkpoint.memory import InMemorySaver
from langgraph.graph import StateGraph, START, END
from langgraph.types import interrupt, Command


class LeaveState(TypedDict, total=False):
    employee: str
    days: int
    balance_ok: bool
    decision: str
    message: str


def check_balance(state: LeaveState) -> dict:
    balance = {"priya": 12, "arjun": 3}.get(state["employee"].lower(), 0)
    return {"balance_ok": state["days"] <= balance}


def manager_approval(state: LeaveState) -> dict:
    # interrupt() STOPS the graph here and hands this dict to whoever called invoke().
    # When resumed, interrupt() RETURNS the value the manager sent.
    decision = interrupt({
        "question": f"Approve {state['days']} days leave for {state['employee']}?",
        "balance_ok": state["balance_ok"],
    })
    return {"decision": decision}


def notify(state: LeaveState) -> dict:
    return {"message": f"Dear {state['employee']}, your leave request was {state['decision']}."}


builder = StateGraph(LeaveState)
builder.add_node("check_balance", check_balance)
builder.add_node("manager_approval", manager_approval)
builder.add_node("notify", notify)
builder.add_edge(START, "check_balance")
builder.add_edge("check_balance", "manager_approval")
builder.add_edge("manager_approval", "notify")
builder.add_edge("notify", END)

# A checkpointer is REQUIRED for interrupts - the paused folder must be filed somewhere.
graph = builder.compile(checkpointer=InMemorySaver())

if __name__ == "__main__":
    config = {"configurable": {"thread_id": "leave-req-42"}}

    result = graph.invoke({"employee": "Priya", "days": 5}, config)
    question = result["__interrupt__"][0].value
    print("PAUSED. Manager's in-tray:", question)

    answer = input("Manager, type approved / rejected: ").strip() or "approved"

    result = graph.invoke(Command(resume=answer), config)   # continue where it stopped
    print(result["message"])
