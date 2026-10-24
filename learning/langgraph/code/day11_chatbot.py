"""
Day 11 - The LLM inside a graph node: a simple chatbot.

MessagesState is a ready-made State with ONE field: 'messages' (the chat history).
It has a built-in reducer (add_messages) that APPENDS new messages instead of replacing them.

    START -> chatbot -> END

Run:  python day11_chatbot.py      (type 'quit' to stop)
"""
from langchain_core.messages import SystemMessage
from langgraph.graph import StateGraph, MessagesState, START, END

from llm_setup import get_llm

llm = get_llm()
SYSTEM = SystemMessage(content="You are the office help desk. Be short and friendly.")


def chatbot(state: MessagesState) -> dict:
    reply = llm.invoke([SYSTEM] + state["messages"])
    return {"messages": [reply]}       # appended to history thanks to the reducer


builder = StateGraph(MessagesState)
builder.add_node("chatbot", chatbot)
builder.add_edge(START, "chatbot")
builder.add_edge("chatbot", END)
graph = builder.compile()

if __name__ == "__main__":
    history = []
    while True:
        text = input("You: ")
        if text.strip().lower() in ("quit", "exit"):
            break
        history.append({"role": "user", "content": text})   # a dict works as a message too
        result = graph.invoke({"messages": history})
        history = result["messages"]                         # WE keep the memory (Day 20 fixes this)
        print("Bot:", history[-1].content)
