"""
Day 10 - Talking to an LLM (no graph yet). Needs your API key in .env.

Layman: the LLM is a very well-read new employee. You give it
  - a SystemMessage  = the job description ("You are the HR help desk...")
  - a HumanMessage   = what the person asked
and it gives back an AIMessage = its reply.

Run:  python day10_first_llm_call.py
"""
from langchain_core.messages import HumanMessage, SystemMessage

from llm_setup import get_llm

llm = get_llm()

messages = [
    SystemMessage(content="You are a friendly office help desk assistant. Answer in 2 sentences."),
    HumanMessage(content="I forgot my password. What should I do?"),
]

reply = llm.invoke(messages)        # C#: var reply = await client.SendAsync(messages);
print(type(reply).__name__)         # AIMessage
print(reply.content)                # the text answer
print(reply.usage_metadata)         # how many tokens (= how much money) it cost
