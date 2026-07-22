from backend.api.routes import router
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.services.llm_service import call_ollama

app = FastAPI(
    title="Viral Content Predictor",
    description="Predictor for Short Form Videos",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Vite dev server
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
    Pre-loads the Ollama model into memory on server startup so the
    first real analysis request doesn't pay the model-load cost.
    """
    print("Warming up LLM model...")
    result = call_ollama("Say hello.", max_tokens=10)
    if result:
        print("LLM warm-up successful.")
    else:
        print("LLM warm-up failed — Ollama may not be running. Continuing without it.")
