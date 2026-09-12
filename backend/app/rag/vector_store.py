import chromadb
from chromadb.config import Settings
from pathlib import Path
from typing import List, Dict, Any
from app.config import CHROMA_DIR, KNOWLEDGE_BASE_DIR
from app.rag.embeddings import embedder
from app.tools.ocr_tool import extract_document_text_and_ocr

class SovereignVectorStore:
    def __init__(self):
        self.client = chromadb.PersistentClient(path=str(CHROMA_DIR))
        self.collection = self.client.get_or_create_collection(
            name="sovereign_kb",
            metadata={"description": "Sovereign Defence & PSU Knowledge Base"}
        )

    async def ingest_document(self, file_path: Path, department: str = "General", classification: str = "RESTRICTED") -> Dict[str, Any]:
        parsed = extract_document_text_and_ocr(file_path)
        chunks_added = 0

        for p_idx, page in enumerate(parsed["pages"]):
            page_text = page["text"]
            if not page_text.strip():
                continue
                
            # Chunk by paragraphs / roughly 500 chars
            paragraphs = [p.strip() for p in page_text.split("\n\n") if len(p.strip()) > 30]
            if not paragraphs:
                paragraphs = [page_text]

            for c_idx, para in enumerate(paragraphs):
                chunk_id = f"{file_path.name}_p{page['page_number']}_c{c_idx}"
                embedding = await embedder.get_embedding(para)
                
                metadata = {
                    "source": file_path.name,
                    "page": page["page_number"],
                    "department": department,
                    "classification": classification,
                    "is_scanned": page.get("is_scanned", False)
                }

                self.collection.upsert(
                    ids=[chunk_id],
                    embeddings=[embedding],
                    documents=[para],
                    metadatas=[metadata]
                )
                chunks_added += 1

        return {
            "filename": file_path.name,
            "total_pages": parsed["total_pages"],
            "chunks_indexed": chunks_added,
            "status": "SUCCESSFULLY_INDEXED"
        }

    async def search_relevant_chunks(self, query: str, top_k: int = 4) -> List[Dict[str, Any]]:
        query_emb = await embedder.get_embedding(query)
        count = self.collection.count()
        if count == 0:
            return []

        results = self.collection.query(
            query_embeddings=[query_emb],
            n_results=min(top_k, count),
            include=["documents", "metadatas", "distances"]
        )

        formatted_results = []
        if results and results.get("documents"):
            docs = results["documents"][0]
            metas = results["metadatas"][0]
            dists = results["distances"][0] if "distances" in results else [0]*len(docs)

            for doc, meta, dist in zip(docs, metas, dists):
                formatted_results.append({
                    "content": doc,
                    "source": meta.get("source", "Unknown"),
                    "page": meta.get("page", 1),
                    "department": meta.get("department", "General"),
                    "score": round(1.0 - float(dist), 3) if dist else 0.95
                })

        return formatted_results

    def get_indexed_documents(self) -> List[Dict[str, Any]]:
        count = self.collection.count()
        if count == 0:
            return []
        all_data = self.collection.get(include=["metadatas"])
        unique_sources = {}
        if all_data and all_data.get("metadatas"):
            for meta in all_data["metadatas"]:
                src = meta.get("source")
                if src:
                    if src not in unique_sources:
                        unique_sources[src] = {
                            "filename": src,
                            "department": meta.get("department", "General"),
                            "classification": meta.get("classification", "RESTRICTED"),
                            "pages": set()
                        }
                    unique_sources[src]["pages"].add(meta.get("page", 1))

        output = []
        for src, info in unique_sources.items():
            output.append({
                "filename": src,
                "department": info["department"],
                "classification": info["classification"],
                "total_pages": len(info["pages"])
            })
        return output

vector_store = SovereignVectorStore()
