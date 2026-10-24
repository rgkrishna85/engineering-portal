"""
Day 8 - Parallel desks and REDUCERS (how to MERGE writes instead of overwriting).

Layman: a new-joiner request goes to IT, HR and Facilities AT THE SAME TIME.
Each desk adds an item to the checklist. Without a reducer, the last desk would
ERASE what the others wrote. The reducer says "append, don't replace".

             +--> it_setup --------+
    START -> +--> hr_setup --------+--> summary -> END
             +--> facilities_setup +

Run:  python day08_parallel_reducers.py
"""
import operator
from typing import Annotated, TypedDict

from langgraph.graph import StateGraph, START, END


class State(TypedDict, total=False):
    employee: str
    # Annotated[list, operator.add] = "when two desks write here, ADD the lists together"
    # C# analogy: list.AddRange(...) instead of list = newList
    checklist: Annotated[list[str], operator.add]
    summary: str


def it_setup(state: State) -> dict:
    return {"checklist": [f"IT: laptop + email for {state['employee']}"]}


def hr_setup(state: State) -> dict:
    return {"checklist": [f"HR: contract + payroll for {state['employee']}"]}


def facilities_setup(state: State) -> dict:
    return {"checklist": [f"Facilities: desk + access card for {state['employee']}"]}


def summary(state: State) -> dict:
    return {"summary": f"{len(state['checklist'])} tasks ready for {state['employee']}"}


builder = StateGraph(State)
builder.add_node("it_setup", it_setup)
builder.add_node("hr_setup", hr_setup)
builder.add_node("facilities_setup", facilities_setup)
builder.add_node("summary", summary)

# Fan-out: three edges leave START -> the three desks run in parallel
for desk in ["it_setup", "hr_setup", "facilities_setup"]:
    builder.add_edge(START, desk)
# Fan-in: summary waits until ALL three have finished
builder.add_edge(["it_setup", "hr_setup", "facilities_setup"], "summary")
builder.add_edge("summary", END)
graph = builder.compile()

if __name__ == "__main__":
    result = graph.invoke({"employee": "Arjun", "checklist": []})
    for item in result["checklist"]:
        print(" -", item)
    print(result["summary"])
