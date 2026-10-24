"""
Day 4 - Your first LangGraph graph. NO AI yet - just plain functions.

Layman picture:  a folder (STATE) is handed to one desk (NODE), the clerk writes on it,
and it goes down the hallway (EDGE) to the exit (END).

    START --> greet_desk --> END

Run:  python day04_first_graph.py
"""
from typing import TypedDict

from langgraph.graph import StateGraph, START, END


# 1. STATE: what is written on the folder. (C#: a DTO class)
class State(TypedDict):
    name: str
    message: str


# 2. NODE: a normal function. It READS the state and RETURNS only what it wants to change.
def greet_desk(state: State) -> dict:
    return {"message": f"Hello {state['name']}, welcome to the help desk!"}


# 3. BUILD the graph (C#: like a builder pattern - new GraphBuilder().AddNode(...).Build())
builder = StateGraph(State)
builder.add_node("greet_desk", greet_desk)
builder.add_edge(START, "greet_desk")
builder.add_edge("greet_desk", END)

# 4. COMPILE = "lock the floor plan" so it can be run
graph = builder.compile()

if __name__ == "__main__":
    # 5. INVOKE = hand in a folder and get the finished folder back
    result = graph.invoke({"name": "Priya"})
    print(result)
    # {'name': 'Priya', 'message': 'Hello Priya, welcome to the help desk!'}
