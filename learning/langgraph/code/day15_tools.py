"""
Day 15 - Tools: give the LLM "hands".

Layman: the LLM is a smart employee who cannot see our systems. A TOOL is a phone
extension it is allowed to call ("check leave balance", "reset password").
The LLM does NOT run the tool itself - it ASKS us to run it (a 'tool call').

Run:  python day15_tools.py
"""
from langchain_core.tools import tool

from llm_setup import get_llm


# @tool turns a normal function into a tool. The DOCSTRING is what the LLM reads to decide
# when to use it - so write it clearly, like an API doc for a colleague.
@tool
def get_leave_balance(employee_name: str) -> str:
    """Look up how many days of annual leave an employee has left."""
    fake_hr_database = {"priya": 12, "arjun": 3, "ravi": 20}
    days = fake_hr_database.get(employee_name.lower())
    return f"{employee_name} has {days} leave days left." if days is not None else "Employee not found."


@tool
def reset_password(username: str) -> str:
    """Send a password reset link to the user's registered email."""
    return f"Reset link sent to {username}@company.com"


llm_with_tools = get_llm().bind_tools([get_leave_balance, reset_password])

if __name__ == "__main__":
    reply = llm_with_tools.invoke("How many leave days does Priya have left?")
    print("Text  :", reply.content)
    print("Asked to call:", reply.tool_calls)
    # e.g. [{'name': 'get_leave_balance', 'args': {'employee_name': 'Priya'}, 'id': '...'}]

    # WE run the tool the LLM asked for:
    for call in reply.tool_calls:
        chosen = {"get_leave_balance": get_leave_balance, "reset_password": reset_password}[call["name"]]
        print("Tool result:", chosen.invoke(call["args"]))
