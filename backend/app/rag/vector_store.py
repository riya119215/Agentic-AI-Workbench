import chromadb
from chromadb.config import Settings
from pathlib import Path
from typing import List, Dict, Any, Optional
import logging

from app.config import CHROMA_DIR
from app.rag.embeddings import embedding_gateway, EmbeddingUnavailableError
from app.tools.parser_service import document_parser

logger = logging.getLogger(__name__)

class SovereignVectorStore:
    """
    Persistent On-Premise Vector Database and RAG retrieval service.
    Integrates with ChromaDB and supports workspace-level isolation.
    """
    def __init__(self):
        self.client = chromadb.PersistentClient(path=str(CHROMA_DIR))
        self.default_collection = self.client.get_or_create_collection(
            name="sovereign_kb",
            metadata={"description": "Sovereign Defence & PSU Knowledge Base"}
        )

    def _get_workspace_collection(self, workspace_id: Optional[str] = None):
        if workspace_id:
            safe_name = f"ws_{workspace_id.lower().replace('-', '_')}"
            return self.client.get_or_create_collection(
                name=safe_name,
                metadata={"workspace_id": workspace_id}
            )
        return self.default_collection

    async def ingest_document(
        self,
        file_path: Path,
        workspace_id: Optional[str] = None,
        department: str = "General",
        classification: str = "RESTRICTED"
    ) -> Dict[str, Any]:
        """
        Parses, chunks, embeds, and stores document in ChromaDB.
        """
        parsed_chunks = document_parser.parse_document(file_path)
        collection = self._get_workspace_collection(workspace_id)
        
        chunks_added = 0
        for chunk in parsed_chunks:
            text = chunk.get("text", "").strip()
            if not text:
                continue

            # Split large pages into paragraph-sized chunks (~500 chars)
            paragraphs = [p.strip() for p in text.split("\n\n") if len(p.strip()) > 30]
            if not paragraphs:
                paragraphs = [text]

            for c_idx, para in enumerate(paragraphs):
                chunk_id = f"{chunk['document_id']}_p{chunk['page_number']}_c{c_idx}"
                
                try:
                    embedding = await embedding_gateway.get_embedding(para)
                except EmbeddingUnavailableError:
                    return {
                        "status": "RAG_NOT_READY",
                        "error": "Local embedding provider offline. Document parsing succeeded, but vectors could not be indexed.",
                        "filename": file_path.name,
                        "chunks_indexed": 0
                    }

                metadata = {
                    "document_id": chunk["document_id"],
                    "source": chunk["filename"],
                    "page": int(chunk["page_number"]),
                    "section": str(chunk.get("section", f"Page {chunk['page_number']}")),
                    "department": department,
                    "classification": classification,
                    "sha256": chunk.get("metadata", {}).get("sha256", ""),
                    "workspace_id": workspace_id or "global"
                }

                collection.upsert(
                    ids=[chunk_id],
                    embeddings=[embedding],
                    documents=[para],
                    metadatas=[metadata]
                )
                chunks_added += 1

        return {
            "status": "SUCCESSFULLY_INDEXED",
            "filename": file_path.name,
            "document_id": parsed_chunks[0]["document_id"] if parsed_chunks else "UNKNOWN",
            "chunks_indexed": chunks_added,
            "workspace_id": workspace_id or "global"
        }

    async def search_relevant_chunks(
        self,
        query: str,
        workspace_id: Optional[str] = None,
        top_k: int = 4
    ) -> List[Dict[str, Any]]:
        """
        Retrieves Top-K semantic chunks from ChromaDB with exact clause and page references.
        """
        collection = self._get_workspace_collection(workspace_id)
        count = collection.count()
        if count == 0:
            return []

        try:
            query_emb = await embedding_gateway.get_embedding(query)
        except EmbeddingUnavailableError:
            logger.warning("RAG search invoked while local embedding provider is offline.")
            return []

        results = collection.query(
            query_embeddings=[query_emb],
            n_results=min(top_k, count),
            include=["documents", "metadatas", "distances"]
        )

        formatted = []
        if results and results.get("documents"):
            docs = results["documents"][0]
            metas = results["metadatas"][0]
            dists = results["distances"][0] if "distances" in results else [0] * len(docs)

            for doc, meta, dist in zip(docs, metas, dists):
                formatted.append({
                    "content": doc,
                    "source": meta.get("source", "Unknown"),
                    "document_id": meta.get("document_id", "N/A"),
                    "page": meta.get("page", 1),
                    "section": meta.get("section", "General"),
                    "department": meta.get("department", "General"),
                    "classification": meta.get("classification", "RESTRICTED"),
                    "sha256": meta.get("sha256", ""),
                    "score": round(1.0 - float(dist), 3) if dist else 0.95
                })

        return formatted

    def delete_document(self, filename: str, workspace_id: Optional[str] = None) -> int:
        collection = self._get_workspace_collection(workspace_id)
        all_data = collection.get(include=["metadatas"])
        if not all_data or not all_data.get("ids"):
            return 0

        ids_to_delete = []
        for doc_id, meta in zip(all_data["ids"], all_data["metadatas"]):
            if meta.get("source") == filename:
                ids_to_delete.append(doc_id)

        if ids_to_delete:
            collection.delete(ids=ids_to_delete)
        return len(ids_to_delete)

    def get_indexed_documents(self, workspace_id: Optional[str] = None) -> List[Dict[str, Any]]:
        collection = self._get_workspace_collection(workspace_id)
        count = collection.count()
        if count == 0:
            return []

        all_data = collection.get(include=["metadatas"])
        unique_sources = {}
        if all_data and all_data.get("metadatas"):
            for meta in all_data["metadatas"]:
                src = meta.get("source")
                if src:
                    if src not in unique_sources:
                        unique_sources[src] = {
                            "filename": src,
                            "document_id": meta.get("document_id", "N/A"),
                            "department": meta.get("department", "General"),
                            "classification": meta.get("classification", "RESTRICTED"),
                            "sha256": meta.get("sha256", ""),
                            "pages": set()
                        }
                    unique_sources[src]["pages"].add(meta.get("page", 1))

        output = []
        for src, info in unique_sources.items():
            output.append({
                "filename": src,
                "document_id": info["document_id"],
                "department": info["department"],
                "classification": info["classification"],
                "sha256": info["sha256"],
                "total_pages": len(info["pages"])
            })
        return output

vector_store = SovereignVectorStore()
