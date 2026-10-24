"""
Day 17 - The same agent as Day 16 in ONE line, using the prebuilt create_agent.

You built it by hand yesterday so you know what is inside the box. In real projects,
start with create_agent and only hand-build when you need custom steps.

Run:  python day17_prebuilt_agent.py
"""
from langchain.agents import create_agent

from llm_setup import get_llm
from day15_tools import get_leave_balance, reset_password

agent = create_agent(
    model=get_llm(),
    tools=[get_leave_balance, reset_password],
    system_prompt="You are the office help desk. Use tools when you need real data.",
)

if __name__ == "__main__":
    result = agent.invoke({"messages": [{"role": "user", "content": "How many leave days does Ravi have?"}]})
    print(result["messages"][-1].content)
