from fastapi import FastAPI
from backend.api.routes import router

app = FastAPI(
    title="Viral Content Predictor",
    description="Predictor for Short Form Videos",
    version="1.0.0"
)

app.include_router(router)

@app.get("/")
def root():
    return {"message": "API is running"}