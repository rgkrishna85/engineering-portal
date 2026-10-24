"""
Day 16 - Build an AGENT by hand (the famous "ReAct loop").

Layman: the employee thinks -> picks up the phone (tool) -> hears the answer -> thinks again
-> ... -> finally replies to the customer. The LOOP is just a conditional edge (Day 7!).

    START -> agent --(wants a tool?)--> tools --> agent  (loop)
                   --(no more tools)--> END

Run:  python day16_agent_by_hand.py
"""
from langchain_core.messages import SystemMessage
from langgraph.graph import StateGraph, MessagesState, START, END
from langgraph.prebuilt import ToolNode, tools_condition

from llm_setup import get_llm
from day15_tools import get_leave_balance, reset_password

tools = [get_leave_balance, reset_password]
llm_with_tools = get_llm().bind_tools(tools)
SYSTEM = SystemMessage(content="You are the office help desk. Use tools when you need real data.")


def agent(state: MessagesState) -> dict:
    return {"messages": [llm_with_tools.invoke([SYSTEM] + state["messages"])]}


builder = StateGraph(MessagesState)
builder.add_node("agent", agent)
builder.add_node("tools", ToolNode(tools))          # prebuilt node that runs whatever tool was asked for
builder.add_edge(START, "agent")
builder.add_conditional_edges("agent", tools_condition)   # prebuilt router: "tools" or END
builder.add_edge("tools", "agent")                  # after the phone call, think again
graph = builder.compile()

if __name__ == "__main__":
    result = graph.invoke({"messages": [{"role": "user",
                                         "content": "Check Arjun's leave balance and reset password for user ravi."}]})
    for m in result["messages"]:
        m.pretty_print()      # shows every step: human -> ai(tool calls) -> tool results -> ai(final)
