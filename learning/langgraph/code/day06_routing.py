"""
Day 6 - Conditional edges (routing). The receptionist decides WHICH hallway to take.

This is exactly what our portal's /api/chat does today with 'if lower.includes("leave")...'
but expressed as a graph:

                    +--> hr_desk ---------+
    START -> triage +--> it_desk ---------+--> END
                    +--> facilities_desk -+
                    +--> unknown_desk ----+

Run:  python day06_routing.py
"""
from typing import TypedDict, Literal

from langgraph.graph import StateGraph, START, END


class State(TypedDict, total=False):
    question: str
    department: str
    answer: str


def triage(state: State) -> dict:
    q = state["question"].lower()
    if any(word in q for word in ["leave", "vacation", "salary", "holiday"]):
        dept = "hr"
    elif any(word in q for word in ["laptop", "vpn", "password", "email"]):
        dept = "it"
    elif any(word in q for word in ["chair", "ac", "parking", "desk"]):
        dept = "facilities"
    else:
        dept = "unknown"
    return {"department": dept}


def hr_desk(state: State) -> dict:
    return {"answer": "HR: You have 24 days of annual leave. Apply 2 weeks in advance."}


def it_desk(state: State) -> dict:
    return {"answer": "IT: Please restart and reconnect the VPN. Still broken? Call ext. 4040."}


def facilities_desk(state: State) -> dict:
    return {"answer": "Facilities: A technician will visit your floor today."}


def unknown_desk(state: State) -> dict:
    return {"answer": "Sorry, I could not understand. A human will contact you."}


# The ROUTER function: looks at the folder and returns the NAME of the next desk.
def route_by_department(state: State) -> Literal["hr_desk", "it_desk", "facilities_desk", "unknown_desk"]:
    return {
        "hr": "hr_desk",
        "it": "it_desk",
        "facilities": "facilities_desk",
    }.get(state["department"], "unknown_desk")


builder = StateGraph(State)
builder.add_node("triage", triage)
builder.add_node("hr_desk", hr_desk)
builder.add_node("it_desk", it_desk)
builder.add_node("facilities_desk", facilities_desk)
builder.add_node("unknown_desk", unknown_desk)

builder.add_edge(START, "triage")
builder.add_conditional_edges("triage", route_by_department)   # <-- the "if/else" hallway
for desk in ["hr_desk", "it_desk", "facilities_desk", "unknown_desk"]:
    builder.add_edge(desk, END)

graph = builder.compile()

if __name__ == "__main__":
    for q in ["How many vacation days do I have?",
              "My VPN keeps disconnecting",
              "The AC on floor 3 is broken",
              "What is the meaning of life?"]:
        result = graph.invoke({"question": q})
        print(f"{q!r:45} -> [{result['department']}] {result['answer']}")
