from pathlib import Path
import os

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from src.router.diagnostics import router as diagnostics_router
from src.router.exports import router as exports_router
from src.router.agents import router as agents_router
from src.router.evaluate import router as evaluate_router

load_dotenv(Path(__file__).with_name(".env"))

app = FastAPI()

LOCAL_CORS_ORIGINS = {
    "http://localhost:5173",
}
CORS_ALLOWED_ORIGINS_ENV = "WEBSLIDES_CORS_ALLOWED_ORIGINS"


def get_cors_allowed_origins() -> list[str]:
    configured = {
        value.strip().rstrip("/")
        for value in os.getenv(CORS_ALLOWED_ORIGINS_ENV, "").split(",")
        if value.strip()
    }
    return sorted(LOCAL_CORS_ORIGINS | configured)


app.add_middleware(
    CORSMiddleware,
    allow_origins=get_cors_allowed_origins(),
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    return {"message": "Hello World"}


app.include_router(diagnostics_router)
app.include_router(exports_router)
app.include_router(agents_router)
app.include_router(evaluate_router)


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
