"""
Day 2 - Python for C# developers (only what LangGraph needs).
Run:  python day02_python_for_csharp.py
"""
from typing import TypedDict

# 1) Variables: no 'var', no type, no semicolons.        C#: var name = "Ravi";
name = "Ravi"
ticket_count = 3

# 2) Dictionary = Dictionary<string, object>.            C#: var ticket = new Dictionary<string, object>{...};
ticket = {"id": 101, "text": "My laptop will not start", "priority": "high"}
print(ticket["text"])          # read a value
ticket["status"] = "open"      # add / change a value

# 3) List = List<T>.                                      C#: var tags = new List<string>{"it","laptop"};
tags = ["it", "laptop"]
tags.append("urgent")

# 4) Functions. Indentation replaces { }. Type hints are optional "documentation".
#    C#: string Greet(string person) { return $"Hello {person}"; }
def greet(person: str) -> str:
    return f"Hello {person}"   # f-string = C# $"" interpolation

print(greet(name))

# 5) if / else.  'and', 'or', 'not' instead of &&, ||, !
if ticket["priority"] == "high" and "laptop" in ticket["text"]:
    print("Send to IT immediately")
else:
    print("Normal queue")

# 6) TypedDict = a dictionary with a known shape. Think of it as a C# 'record' / DTO.
#    LangGraph uses this to describe the "State" (the folder that travels between desks).
class Ticket(TypedDict):
    id: int
    text: str
    priority: str

t: Ticket = {"id": 102, "text": "Need leave next week", "priority": "low"}
print(t)

# 7) Loops
for tag in tags:
    print("tag:", tag)
