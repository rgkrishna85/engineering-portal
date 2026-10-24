"""
llm_setup.py - ONE place to create the AI model, used by every lesson from Day 10.

C# analogy: this is like a small factory class / dependency-injection registration.
Every lesson calls get_llm() instead of hard-coding a provider, so if your company
switches from Anthropic to Azure OpenAI you change ONE line in .env, not 15 files.
"""
import os

from dotenv import load_dotenv
from langchain.chat_models import init_chat_model

load_dotenv()  # reads the .env file (like appsettings.json) into environment variables


def get_llm():
    """Return a chat model, e.g. 'anthropic:claude-sonnet-5-5' (set LLM_MODEL in .env to change)."""
    model_name = os.getenv("LLM_MODEL", "anthropic:claude-sonnet-5-5")
    return init_chat_model(model_name)
