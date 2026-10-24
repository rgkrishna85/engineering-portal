"""
Day 24 - Multi-agent: a SUPERVISOR sends work to SPECIALIST agents (subgraphs).

Layman: the receptionist (supervisor) does not answer questions herself. She sends
you to the HR specialist or the IT specialist. Each specialist is a full agent with
its OWN tools - a graph inside a graph (a "subgraph").

    START -> supervisor --> hr_agent  (its own tool loop) --> END
                       \\-> it_agent  (its own tool loop) --> END

Run:  python day24_multi_agent.py
"""
from typing import Literal

from langchain.agents import create_agent
from langchain_core.tools import tool
from langgraph.graph import StateGraph, MessagesState, START, END
from pydantic import BaseModel

from llm_setup import get_llm
from day15_tools import get_leave_balance, reset_password

llm = get_llm()


@tool
def check_vpn_status(region: str) -> str:
    """Check whether the company VPN is up in a region (e.g. 'india', 'uae', 'europe')."""
    return f"VPN in {region}: degraded since 09:10, engineers working on it."


hr_agent = create_agent(llm, [get_leave_balance], system_prompt="You are the HR specialist.")
it_agent = create_agent(llm, [reset_password, check_vpn_status], system_prompt="You are the IT specialist.")


class Pick(BaseModel):
    specialist: Literal["hr_agent", "it_agent"]


def supervisor(state: MessagesState) -> dict:
    return {}   # makes no changes; the routing function below decides where to go


def choose_specialist(state: MessagesState) -> str:
    question = state["messages"][-1].content
    return llm.with_structured_output(Pick).invoke(
        f"Which specialist should answer this office question? {question}").specialist


builder = StateGraph(MessagesState)
builder.add_node("supervisor", supervisor)
builder.add_node("hr_agent", hr_agent)      # a compiled graph can be used as a node!
builder.add_node("it_agent", it_agent)
builder.add_edge(START, "supervisor")
builder.add_conditional_edges("supervisor", choose_specialist, ["hr_agent", "it_agent"])
builder.add_edge("hr_agent", END)
builder.add_edge("it_agent", END)
graph = builder.compile()

if __name__ == "__main__":
    for q in ["Is the VPN working in India?", "How many leave days does Arjun have?"]:
        result = graph.invoke({"messages": [{"role": "user", "content": q}]})
        print("Q:", q, "\nA:", result["messages"][-1].content, "\n")
