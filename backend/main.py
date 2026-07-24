import os

from backend.api.routes import router
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.services.llm_service import call_llm

app = FastAPI(
    title="Viral Content Predictor",
    description="Predictor for Short Form Videos",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        origin.strip()
        for origin in os.getenv("FRONTEND_ORIGINS", "http://localhost:3000").split(",")
        if origin.strip()
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(router)


@app.get("/")
def root():
    return {"message": "API is running"}

@app.on_event("startup")
async def warm_up_llm():
    """
    Verifies the hosted LLM path during startup so deployment logs clearly
    show whether Groq is configured before the first analysis request.
    """
    print("Warming up LLM model...")
    result = call_llm("Say hello.", max_tokens=10)
    if result:
        print("LLM warm-up successful.")
    else:
        print("LLM warm-up failed — Groq may not be configured/reachable. Continuing without it.")
