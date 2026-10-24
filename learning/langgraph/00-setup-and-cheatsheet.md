# Setup, C# → Python cheat sheet, and vibe-coding guide

Read this before Day 1. The facilitator should finish the setup on their own machine **the day before** Day 1.

---

## A. One-time setup (≈ 20 min per person)

### Windows (most C# teams)
1. Install **Python 3.12 or newer** from <https://www.python.org/downloads/>. **Tick "Add python.exe to PATH"** on the first installer screen.
2. Install **VS Code** and its **Python** extension (by Microsoft). Visual Studio also works, but VS Code is simpler for Python.
3. Install an AI coding assistant: **Claude Code**, **GitHub Copilot** (Chat), or **Cursor**. Use whichever your company allows.
4. Open a terminal in this repo and run:
   ```powershell
   cd learning\langgraph\code
   py -m venv .venv                 # a private "packages folder" for this project (like a NuGet packages folder)
   .venv\Scripts\activate           # turn it on; you'll see (.venv) in the prompt
   pip install -r requirements.txt  # like "dotnet restore"
   copy .env.example .env           # then open .env and paste your API key
   python day04_first_graph.py      # should print a greeting from the help desk
   ```
   If PowerShell blocks `activate`, run this once: `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned`.

### Mac / Linux
```bash
cd learning/langgraph/code
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
python day04_first_graph.py
```

### API key (needed from Day 10)
- Days 1–9 need **no AI key** and cost nothing.
- From Day 10 you need a key for a model provider. The default is Anthropic Claude (`ANTHROPIC_API_KEY`, from <https://console.anthropic.com>).
- On Azure OpenAI or OpenAI instead? Change `LLM_MODEL` in `.env` and `pip install langchain-openai`. Every lesson calls `get_llm()` from `llm_setup.py`, so you only change it in one place.
- **Never commit `.env`.** It's already in `code/.gitignore`.
- Cost: the whole course costs a few dollars of AI calls per person. Watch `usage_metadata` (Day 10).

### For Day 18 and the capstone: run the portal
From the repo root: `npm install`, then `npm run dev`. The portal runs at http://localhost:3000, and the agent's tools call its `/api/...` endpoints.

---

## B. C# → Python cheat sheet (only what LangGraph needs)

| C# | Python | Note |
|---|---|---|
| `var name = "Ravi";` | `name = "Ravi"` | No `var`, no `;` |
| `{ ... }` blocks | indentation (4 spaces) | **Indentation is the syntax.** Mixing it up = error |
| `// comment` | `# comment` | `"""docstring"""` for longer text |
| `string Greet(string p) { return $"Hi {p}"; }` | `def greet(p: str) -> str:`<br>`    return f"Hi {p}"` | Type hints are optional "documentation" |
| `null` | `None` | |
| `true / false` | `True / False` | Capital letter! |
| `&&  \|\|  !` | `and  or  not` | |
| `new List<string>{"a","b"}` | `["a", "b"]` | `.append(x)` instead of `.Add(x)` |
| `new Dictionary<string,object>{{"id",1}}` | `{"id": 1}` | Read: `d["id"]` · safe read: `d.get("id", default)` |
| `record Ticket(int Id, string Text);` | `class Ticket(TypedDict):`<br>`    id: int`<br>`    text: str` | Used for **State** |
| class with `[Required]` attributes | `class X(BaseModel): ...` (Pydantic) | Used for **structured output** |
| `foreach (var t in tags)` | `for t in tags:` | |
| `x => x * 2` | `lambda x: x * 2` | |
| `using System.Linq;` | `from typing import TypedDict` | Imports |
| `try { } catch (Exception e) { }` | `try: ... except Exception as e: ...` | |
| `async Task<T> M()` / `await` | `async def m():` / `await` | LangGraph has `ainvoke`, `astream` |
| `[Attribute]` on a method | `@decorator` on a function | e.g. `@tool` |
| `dotnet restore` / NuGet | `pip install -r requirements.txt` / PyPI | |
| `appsettings.json` | `.env` file + `load_dotenv()` | |
| xUnit `[Fact]` + `Assert.Equal` | `def test_x():` + `assert a == b` (pytest) | Day 26 |
| ASP.NET Core minimal API | FastAPI | Day 27, even has Swagger at `/docs` |

**The five errors you'll see most often, and what they mean:**
| Error | Meaning |
|---|---|
| `IndentationError` | Spaces are wrong. Let VS Code format it. |
| `KeyError: 'answer'` | You read a state field that no desk has written yet. Use `state.get("answer")`. |
| `ModuleNotFoundError` | Venv not activated, or a package isn't installed. |
| `GraphRecursionError` | Your loop never ends. Check the router function. |
| `401 / authentication` | API key missing or wrong in `.env`. |

---

## C. Vibe-coding guide

**Vibe coding** = you describe *what* you want in plain English, the AI assistant writes the code, and **you stay responsible** for running, reading and understanding it.

### The loop (use it every day)
1. **Describe:** write the prompt with the template below.
2. **Generate:** the AI writes the code.
3. **Run:** always run it immediately. Code that hasn't been run doesn't count.
4. **Read:** ask the AI: *"Explain this code line by line for a C# developer who is new to Python."*
5. **Break:** the Tester tries odd inputs. Ask the AI: *"What inputs would break this?"*
6. **Compare:** look at the reference file in `code/`. What's different, and why?
7. **Own it:** the Explainer explains it without looking at the AI's explanation.

### Prompt template
```
CONTEXT:  I'm learning LangGraph (Python, LangGraph 1.x). I come from C#. Keep code simple
          with comments that compare to C# where useful.
GOAL:     <what the program should do, in plain words>
STRUCTURE:<the nodes / edges you want, e.g. "START -> triage -> (hr | it) -> END">
RULES:    - one file, runnable with `python file.py`
          - use get_llm() from llm_setup.py for any AI model
          - print what each node does
OUTPUT:   The code, then a 5-line explanation.
```

### Golden rules
- ✋ **Never keep code nobody in the team can explain.** If the Explainer can't explain it, ask the AI to simplify it.
- 🧪 **Run it before you believe it.** AI assistants write confident code that is sometimes wrong.
- 📌 **Say "LangGraph 1.x" in every prompt.** AI assistants often produce *older* LangGraph code. Watch for these:
  - `from langgraph.prebuilt import create_react_agent`: older; today use `from langchain.agents import create_agent`
  - `MemorySaver`: older name; today `InMemorySaver` (both still work)
  - `builder.set_entry_point("x")`: older style; prefer `builder.add_edge(START, "x")`
  - `from langchain.chat_models import ChatOpenAI`: very old; use `init_chat_model` or `langchain_openai`
- 🔑 **Never paste API keys into prompts or code.** Keys live in `.env` only.
- 🪜 **Small steps.** Ask for one new node at a time, not "build the whole app".
- 🐞 **When it breaks:** paste the *full* error to the AI: *"Here is the error. Explain what it means in simple words, then fix it."*

### Useful prompts to keep handy
- *"Draw this graph as a Mermaid diagram so I can paste it into mermaid.live."*
- *"Add print statements so I can see the state after every node."*
- *"Rewrite this so a beginner can read it: shorter functions, clear names, comments."*
- *"Write 3 pytest tests for this graph."*
- *"What is the C# equivalent of this Python line?"*
