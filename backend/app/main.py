from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.config import DELIVERABLES_DIR
from app.api.routes_chat import router as chat_router
from app.api.routes_docs import router as docs_router
from app.api.routes_audit import router as audit_router
from app.api.routes_security import router as security_router
from app.api.routes_egress import router as egress_router
from app.core.audit import init_audit_db

# Initialize database
init_audit_db()

app = FastAPI(
    title="Sovereign On-Premise Agentic AI Workbench API",
    description="Zero-Cloud, Air-Gapped Multi-Model Autonomous AI for Defence, Government & PSU Organizations",
    version="2.0.0"
)

# Enable CORS for local workbench dashboard
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Deliverables directory for direct download / preview
app.mount("/deliverables", StaticFiles(directory=str(DELIVERABLES_DIR)), name="deliverables")

# Register Routers
app.include_router(chat_router)
app.include_router(docs_router)
app.include_router(audit_router)
app.include_router(security_router)
app.include_router(egress_router)

@app.get("/")
async def root():
    return {
        "system": "SOVEREIGN AGENTIC AI WORKBENCH (SIH26117)",
        "status": "ONLINE",
        "air_gap_mode": "STRICT_LOCAL_EGRESS_BLOCKED",
        "architecture": "MULTI_MODEL_AGENTIC_WORKBENCH"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)
