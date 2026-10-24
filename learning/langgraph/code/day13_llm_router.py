"""
Day 13 - Replace Day 6's keyword "if/else" receptionist with an LLM receptionist.

Same floor plan as Day 6, but triage now UNDERSTANDS language:
"my machine won't boot" -> IT, even though no keyword like 'laptop' appears.

Run:  python day13_llm_router.py
"""
from typing import Literal, TypedDict

from pydantic import BaseModel
from langgraph.graph import StateGraph, START, END

from llm_setup import get_llm

llm = get_llm()


class State(TypedDict, total=False):
    question: str
    department: str
    answer: str


class Route(BaseModel):
    department: Literal["hr", "it", "facilities", "unknown"]


def triage(state: State) -> dict:
    router = llm.with_structured_output(Route)
    decision = router.invoke(
        "Classify this office help desk question into hr, it, facilities or unknown.\n"
        f"Question: {state['question']}"
    )
    return {"department": decision.department}


def make_desk(dept_name: str, instructions: str):
    """Factory that builds a desk node (C#: a method returning a Func<State, dict>)."""
    def desk(state: State) -> dict:
        reply = llm.invoke(f"You are the {dept_name} desk. {instructions}\nQuestion: {state['question']}")
        return {"answer": f"[{dept_name}] {reply.content}"}
    return desk


def route(state: State) -> str:
    return state["department"]


builder = StateGraph(State)
builder.add_node("triage", triage)
builder.add_node("hr", make_desk("HR", "Annual leave is 24 days; apply 2 weeks ahead. Answer in 2 sentences."))
builder.add_node("it", make_desk("IT", "Give 2 practical troubleshooting steps."))
builder.add_node("facilities", make_desk("Facilities", "Promise a technician visit and give a time window."))
builder.add_node("unknown", lambda state: {"answer": "I am not sure. A human colleague will contact you."})

builder.add_edge(START, "triage")
builder.add_conditional_edges("triage", route, ["hr", "it", "facilities", "unknown"])
for desk in ["hr", "it", "facilities", "unknown"]:
    builder.add_edge(desk, END)
graph = builder.compile()

if __name__ == "__main__":
    for q in ["My machine won't boot after the update",
              "Who do I talk to about my payslip being wrong?",
              "It is freezing cold in meeting room B"]:
        print(q, "\n   ->", graph.invoke({"question": q})["answer"], "\n")
