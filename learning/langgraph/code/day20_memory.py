"""
Day 20 - Short-term memory with a CHECKPOINTER.

Layman: the checkpointer is a FILING CABINET. After every desk, a photocopy of the folder
is filed under a 'thread_id' (one drawer per conversation). Next time the same person
comes back with the same thread_id, we pull out their folder and continue.

On Day 11 WE had to keep the 'history' list ourselves. Now LangGraph does it.

Run:  python day20_memory.py
"""
from langgraph.checkpoint.memory import InMemorySaver

from day11_chatbot import builder   # reuse the Day 11 floor plan

# Same floor plan, but now compiled WITH a filing cabinet.
# InMemorySaver forgets when the program stops. For real apps use
# SqliteSaver / PostgresSaver (pip install langgraph-checkpoint-sqlite / -postgres).
graph = builder.compile(checkpointer=InMemorySaver())

if __name__ == "__main__":
    priya = {"configurable": {"thread_id": "priya-chat-1"}}
    arjun = {"configurable": {"thread_id": "arjun-chat-1"}}

    graph.invoke({"messages": [{"role": "user", "content": "Hi, my name is Priya and I work in IT."}]}, priya)
    graph.invoke({"messages": [{"role": "user", "content": "Hi, I am Arjun."}]}, arjun)

    # Only send the NEW message - the old ones come from the filing cabinet
    r = graph.invoke({"messages": [{"role": "user", "content": "What is my name and team?"}]}, priya)
    print("Priya's thread:", r["messages"][-1].content)

    r = graph.invoke({"messages": [{"role": "user", "content": "What is my name?"}]}, arjun)
    print("Arjun's thread:", r["messages"][-1].content)

    # Peek inside the drawer (time travel: every saved step can be inspected or replayed)
    snapshot = graph.get_state(priya)
    print("Messages stored for Priya:", len(snapshot.values["messages"]))
    print("Number of saved photocopies:", len(list(graph.get_state_history(priya))))
