"""
Day 22 - Streaming: watch the folder move desk by desk (instead of waiting for the end).

Why: users hate a spinner for 20 seconds. Streaming lets your UI show
"Routing to IT desk..." and type the AI's answer word by word, like ChatGPT.

Run:  python day22_streaming.py
"""
from day06_routing import graph as keyword_graph   # no LLM needed for part 1

print("--- Part 1: stream_mode='updates' -> one event per desk ---")
for event in keyword_graph.stream({"question": "My VPN is down"}, stream_mode="updates"):
    for desk, changes in event.items():
        print(f"{desk:10} wrote {changes}")

print("\n--- Part 2: stream_mode='messages' -> LLM answer token by token ---")
try:
    from day11_chatbot import graph as chat_graph
    for token, metadata in chat_graph.stream(
            {"messages": [{"role": "user", "content": "Give me 3 tips to keep my laptop fast."}]},
            stream_mode="messages"):
        print(token.content if isinstance(token.content, str) else "", end="", flush=True)
    print()
except Exception as error:   # e.g. no API key yet
    print("Part 2 needs an LLM API key:", error)
