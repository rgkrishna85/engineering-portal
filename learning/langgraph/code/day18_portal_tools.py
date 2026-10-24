"""
Day 18 - Tools that call OUR engineering portal's real API.

First start the portal in another terminal (from the repo root):
    npm install
    npm run dev          -> http://localhost:3000

Then run:  python day18_portal_tools.py
"""
import os

import requests
from langchain.agents import create_agent
from langchain_core.tools import tool

from llm_setup import get_llm

PORTAL = os.getenv("PORTAL_URL", "http://localhost:3000")


def _get(path: str, params: dict | None = None):
    try:
        response = requests.get(f"{PORTAL}{path}", params=params, timeout=10)
        response.raise_for_status()
        return response.json()
    except requests.RequestException as error:
        # Return the error as TEXT so the LLM can explain it, instead of crashing the agent
        return f"Portal not reachable ({error}). Is 'npm run dev' running?"


@tool
def list_projects(status: str = "all", search: str = "") -> str:
    """List engineering projects. status can be 'all', 'active', 'completed' or 'on_hold'.
    search filters by project name or client name."""
    data = _get("/api/projects", {"status": status, "search": search})
    if isinstance(data, str):
        return data
    rows = [f"{p['name']} | client={p.get('client')} | status={p['status']} | "
            f"hours {p.get('spent_hours')}/{p.get('budget_hours')}" for p in data]
    return "\n".join(rows) or "No projects found."


@tool
def list_employees() -> str:
    """List employees with their role and utilization percentage."""
    data = _get("/api/employees")
    if isinstance(data, str):
        return data
    return "\n".join(f"{e['name']} | {e.get('role')} | utilization={e.get('utilization')}%" for e in data)


agent = create_agent(
    model=get_llm(),
    tools=[list_projects, list_employees],
    system_prompt="You answer questions about our engineering portal. Always use the tools for facts.",
)

if __name__ == "__main__":
    for q in ["Which projects are over 80% of their budget hours?",
              "Who is the most loaded employee right now?"]:
        result = agent.invoke({"messages": [{"role": "user", "content": q}]})
        print("Q:", q, "\nA:", result["messages"][-1].content, "\n")
