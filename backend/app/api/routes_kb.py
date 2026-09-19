import logging
import shutil
from typing import Optional, List
from fastapi import APIRouter, UploadFile, File, Form, Query
from app.config import KNOWLEDGE_BASE_DIR
from app.tools.parser_service import parse_document
from app.rag.vector_store import add_document_to_vector_store, query_vector_store

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/knowledge-base", tags=["Knowledge Base RAG"])

@router.post("/ingest")
async def ingest_document(
    file: UploadFile = File(...),
    category: str = Form("Engineering Standard"),
    user_id: str = Form("officer_sharma")
):
    target_path = KNOWLEDGE_BASE_DIR / file.filename
    with open(target_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    parsed = parse_document(target_path)
    text_content = parsed.get("text_content", "")
    
    # Store in ChromaDB vector store
    chunk_count = add_document_to_vector_store(
        filename=file.filename,
        text_content=text_content,
        metadata={"category": category, "user_id": user_id}
    )

    return {
        "status": "INDEXED",
        "filename": file.filename,
        "category": category,
        "chunks_indexed": chunk_count,
        "sha256": parsed.get("sha256", ""),
        "message": f"Successfully indexed {chunk_count} semantic vector chunks into ChromaDB."
    }

@router.get("/search")
async def search_knowledge_base(
    q: str = Query(..., description="Query string for semantic similarity retrieval"),
    top_k: int = Query(4, description="Top K results")
):
    results = query_vector_store(query=q, top_k=top_k)
    formatted = []
    for r in results:
        meta = r.get("metadata", {})
        formatted.append({
            "source": meta.get("filename", "Standard Document"),
            "section": meta.get("section", "Section Reference"),
            "page": meta.get("page", 1),
            "text": r.get("text", ""),
            "score": r.get("distance", 0.92)
        })
    return {
        "query": q,
        "total_results": len(formatted),
        "results": formatted
    }
