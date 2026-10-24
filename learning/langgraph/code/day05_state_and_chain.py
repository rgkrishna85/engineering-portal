"""
Day 5 - State with several fields, a chain of desks, and drawing the graph.

    START --> receive --> clean_text --> assign_id --> END

Run:  python day05_state_and_chain.py
"""
from typing import TypedDict

from langgraph.graph import StateGraph, START, END


class TicketState(TypedDict, total=False):   # total=False: fields may be missing at the start
    raw_text: str
    clean_text: str
    ticket_id: str
    log: str


def receive(state: TicketState) -> dict:
    print("[receive]    got:", state["raw_text"])
    return {"log": "received"}


def clean_text(state: TicketState) -> dict:
    cleaned = state["raw_text"].strip().lower()
    print("[clean_text] ->", cleaned)
    return {"clean_text": cleaned, "log": state["log"] + " > cleaned"}


def assign_id(state: TicketState) -> dict:
    ticket_id = f"TKT-{len(state['clean_text']):04d}"
    print("[assign_id]  ->", ticket_id)
    return {"ticket_id": ticket_id, "log": state["log"] + " > id assigned"}


builder = StateGraph(TicketState)
builder.add_node("receive", receive)
builder.add_node("clean_text", clean_text)
builder.add_node("assign_id", assign_id)
builder.add_edge(START, "receive")
builder.add_edge("receive", "clean_text")
builder.add_edge("clean_text", "assign_id")
builder.add_edge("assign_id", END)
graph = builder.compile()

if __name__ == "__main__":
    result = graph.invoke({"raw_text": "   My VPN is NOT working   "})
    print("\nFinal folder:", result)

    # Draw the floor plan. Paste the output into https://mermaid.live to see a picture.
    print("\nMermaid diagram:\n")
    print(graph.get_graph().draw_mermaid())
