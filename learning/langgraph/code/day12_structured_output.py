"""
Day 12 - Structured output: make the LLM fill in a FORM instead of writing free text.

C# analogy: instead of getting back a string and parsing it, you get back a typed object,
like JsonSerializer.Deserialize<TicketClassification>(...). Pydantic BaseModel ~ a C# class
with validation attributes.

Run:  python day12_structured_output.py
"""
from typing import Literal

from pydantic import BaseModel, Field

from llm_setup import get_llm


class TicketClassification(BaseModel):
    department: Literal["hr", "it", "facilities", "unknown"] = Field(description="Which team should handle it")
    urgency: Literal["low", "medium", "high"] = Field(description="How urgent the problem is")
    summary: str = Field(description="One short sentence describing the problem")


classifier = get_llm().with_structured_output(TicketClassification)

if __name__ == "__main__":
    for text in ["My laptop screen went black 5 minutes before a client demo!!",
                 "Can I carry forward my unused leave to next year?",
                 "The coffee machine on floor 2 is leaking"]:
        result: TicketClassification = classifier.invoke(text)
        print(f"{result.department:11} {result.urgency:7} {result.summary}")
