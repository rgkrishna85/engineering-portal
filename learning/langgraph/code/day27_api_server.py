"""
Day 27 - Put a graph behind a web API so C# / the Next.js portal can call it.

Run:   uvicorn day27_api_server:app --reload --port 8000
Test:  open http://localhost:8000/docs   (Swagger UI - just like ASP.NET Core!)

Call it from C#:
    using var http = new HttpClient();
    var response = await http.PostAsJsonAsync("http://localhost:8000/ask",
        new { question = "My VPN is down", thread_id = "user-42" });
    var body = await response.Content.ReadFromJsonAsync<AskResponse>();
    // public record AskResponse(string Department, string Answer);
"""
from fastapi import FastAPI
from pydantic import BaseModel

from day06_routing import graph   # swap for your capstone graph later

app = FastAPI(title="Help Desk Graph API")


class AskRequest(BaseModel):
    question: str
    thread_id: str = "default"


class AskResponse(BaseModel):
    department: str
    answer: str


@app.post("/ask", response_model=AskResponse)
def ask(request: AskRequest) -> AskResponse:
    result = graph.invoke({"question": request.question},
                          {"configurable": {"thread_id": request.thread_id}})
    return AskResponse(department=result["department"], answer=result["answer"])
