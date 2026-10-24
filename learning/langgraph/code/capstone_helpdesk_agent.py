"""
CAPSTONE (Days 28-32) - Reference solution: the "Smart Office Help Desk".

It upgrades our portal's keyword chatbot (src/app/api/chat/route.js) into a LangGraph app
that uses EVERYTHING from the course:

  Day 6/13  routing        - an LLM decides what kind of request it is
  Day 12    structured out - leave details are pulled out of free text into a form
  Day 16-18 agent+tools  - portal questions are answered with real API data
  Day 20    memory         - each user has their own thread
  Day 21    human approval - leave requests pause for the manager

                      +--> policy_answer ------------------------------+
  START -> classify --+--> portal_agent (tools loop) ------------------+--> END
                      +--> extract_leave -> manager_approval -> notify +

Try to build your OWN version first with vibe coding. Compare with this afterwards.
Run:  python capstone_helpdesk_agent.py
"""
from typing import Literal

from langchain.agents import create_agent
from langchain_core.messages import AIMessage, SystemMessage
from langgraph.checkpoint.memory import InMemorySaver
from langgraph.graph import StateGraph, MessagesState, START, END
from langgraph.types import interrupt, Command
from pydantic import BaseModel, Field

from llm_setup import get_llm
from day18_portal_tools import list_projects, list_employees

llm = get_llm()

POLICIES = """
Leave: 24 days annual leave, apply 2 weeks in advance, manager approval required.
Travel: pre-approval by manager; international travel needs VP approval.
Training: 40 hours per year; certification reimbursement up to $2,000.
Timesheet: submit weekly by Friday 5 PM; minimum increment 0.5 hours.
Work from home: 3 days office, 2 days remote; core hours 10 AM - 4 PM.
"""


class HelpDeskState(MessagesState):          # chat history + our own extra fields
    intent: str
    employee: str
    days: int
    decision: str


class Intent(BaseModel):
    intent: Literal["policy", "portal_data", "leave_request"] = Field(
        description="policy = company rules question; portal_data = projects/employees/workload; "
                    "leave_request = the user wants to APPLY for leave")


class LeaveForm(BaseModel):
    employee: str = Field(description="Name of the person asking for leave")
    days: int = Field(description="Number of leave days requested")


def classify(state: HelpDeskState) -> dict:
    result = llm.with_structured_output(Intent).invoke(state["messages"])
    return {"intent": result.intent}


def policy_answer(state: HelpDeskState) -> dict:
    system = SystemMessage(content=f"Answer ONLY from these policies, briefly:\n{POLICIES}")
    return {"messages": [llm.invoke([system] + state["messages"])]}


portal_agent = create_agent(llm, [list_projects, list_employees],
                            system_prompt="Answer questions about our engineering portal using the tools.")


def extract_leave(state: HelpDeskState) -> dict:
    form = llm.with_structured_output(LeaveForm).invoke(state["messages"])
    return {"employee": form.employee, "days": form.days}


def manager_approval(state: HelpDeskState) -> dict:
    decision = interrupt(f"Approve {state['days']} day(s) leave for {state['employee']}? (approved/rejected)")
    return {"decision": decision}


def notify(state: HelpDeskState) -> dict:
    text = f"Your request for {state['days']} day(s) leave was {state['decision']} by your manager."
    return {"messages": [AIMessage(content=text)]}


def route(state: HelpDeskState) -> str:
    return {"policy": "policy_answer", "portal_data": "portal_agent",
            "leave_request": "extract_leave"}[state["intent"]]


builder = StateGraph(HelpDeskState)
builder.add_node("classify", classify)
builder.add_node("policy_answer", policy_answer)
builder.add_node("portal_agent", portal_agent)
builder.add_node("extract_leave", extract_leave)
builder.add_node("manager_approval", manager_approval)
builder.add_node("notify", notify)

builder.add_edge(START, "classify")
builder.add_conditional_edges("classify", route, ["policy_answer", "portal_agent", "extract_leave"])
builder.add_edge("policy_answer", END)
builder.add_edge("portal_agent", END)
builder.add_edge("extract_leave", "manager_approval")
builder.add_edge("manager_approval", "notify")
builder.add_edge("notify", END)
graph = builder.compile(checkpointer=InMemorySaver())


def chat(text: str, thread_id: str) -> None:
    config = {"configurable": {"thread_id": thread_id}}
    result = graph.invoke({"messages": [{"role": "user", "content": text}]}, config)
    while "__interrupt__" in result:                       # waiting for the manager
        answer = input(f"  [MANAGER] {result['__interrupt__'][0].value} ") or "approved"
        result = graph.invoke(Command(resume=answer), config)
    print("Bot:", result["messages"][-1].content, "\n")


if __name__ == "__main__":
    chat("How many days do I need to work from office?", "priya-1")
    chat("Which projects are on hold?", "priya-1")
    chat("I'm Priya and I'd like 3 days of leave next month", "priya-1")
