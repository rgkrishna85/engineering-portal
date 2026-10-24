"""
Day 26 - Testing graphs with pytest (C# analogy: xUnit / NUnit tests).

Run:  pytest -q test_day26_graphs.py
"""
from langgraph.types import Command

from day06_routing import graph as routing_graph
from day08_parallel_reducers import graph as onboarding_graph
from day21_human_approval import graph as leave_graph


def test_vpn_question_goes_to_it():
    result = routing_graph.invoke({"question": "my vpn is down"})
    assert result["department"] == "it"


def test_unknown_question_goes_to_human():
    result = routing_graph.invoke({"question": "tell me a joke"})
    assert result["department"] == "unknown"


def test_onboarding_creates_three_tasks():
    result = onboarding_graph.invoke({"employee": "Test User", "checklist": []})
    assert len(result["checklist"]) == 3


def test_leave_request_pauses_then_resumes():
    config = {"configurable": {"thread_id": "test-leave-1"}}
    paused = leave_graph.invoke({"employee": "Arjun", "days": 10}, config)
    assert "__interrupt__" in paused                     # it stopped for the manager
    assert paused["__interrupt__"][0].value["balance_ok"] is False   # Arjun has only 3 days

    final = leave_graph.invoke(Command(resume="rejected"), config)
    assert "rejected" in final["message"]
