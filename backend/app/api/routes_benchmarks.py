from fastapi import APIRouter
from app.core.benchmarks import benchmark_engine

router = APIRouter(prefix="/api/benchmarks", tags=["Benchmarks & Profiling"])

@router.get("/run")
async def run_benchmark():
    return benchmark_engine.run_full_benchmark()
