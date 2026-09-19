import csv
import hashlib
from pathlib import Path
from typing import Dict, Any, List, Optional
import pymupdf
from docx import Document as DocxDocument
import openpyxl
from pptx import Presentation

class DocumentParserError(Exception):
    pass

class DocumentParser:
    """
    Unified multi-format document parsing engine.
    Extracts text and coordinates into a normalized page/section schema.
    """

    def parse_document(self, file_path: Path, document_id: Optional[str] = None) -> List[Dict[str, Any]]:
        file_path = Path(file_path)
        if not file_path.exists():
            raise DocumentParserError(f"File not found: {file_path}")

        suffix = file_path.suffix.lower()
        with open(file_path, "rb") as f:
            file_bytes = f.read()
        file_sha256 = hashlib.sha256(file_bytes).hexdigest()
        
        doc_id = document_id or f"DOC-{file_sha256[:10].upper()}"

        if suffix == ".pdf":
            return self._parse_pdf(file_path, doc_id, file_sha256)
        elif suffix == ".docx":
            return self._parse_docx(file_path, doc_id, file_sha256)
        elif suffix in [".xlsx", ".xls"]:
            return self._parse_excel(file_path, doc_id, file_sha256)
        elif suffix == ".csv":
            return self._parse_csv(file_path, doc_id, file_sha256)
        elif suffix == ".pptx":
            return self._parse_pptx(file_path, doc_id, file_sha256)
        elif suffix == ".txt":
            return self._parse_txt(file_path, doc_id, file_sha256)
        elif suffix in [".png", ".jpg", ".jpeg", ".bmp", ".webp"]:
            return self._parse_image(file_path, doc_id, file_sha256)
        else:
            raise DocumentParserError(f"Unsupported document format: {suffix}")

    def _parse_pdf(self, file_path: Path, doc_id: str, sha256: str) -> List[Dict[str, Any]]:
        chunks = []
        doc = pymupdf.open(str(file_path))
        for page_idx in range(len(doc)):
            page = doc[page_idx]
            text = page.get_text("text").strip()
            chunks.append({
                "document_id": doc_id,
                "filename": file_path.name,
                "page_number": page_idx + 1,
                "section": f"Page {page_idx + 1}",
                "text": text,
                "metadata": {
                    "sha256": sha256,
                    "total_pages": len(doc),
                    "is_scanned": len(text) < 50
                }
            })
        doc.close()
        return chunks

    def _parse_docx(self, file_path: Path, doc_id: str, sha256: str) -> List[Dict[str, Any]]:
        chunks = []
        doc = DocxDocument(str(file_path))
        current_section = "General"
        section_paras = []
        page_num = 1

        for p in doc.paragraphs:
            text = p.text.strip()
            if not text:
                continue
            if p.style and "Heading" in p.style.name:
                if section_paras:
                    chunks.append({
                        "document_id": doc_id,
                        "filename": file_path.name,
                        "page_number": page_num,
                        "section": current_section,
                        "text": "\n".join(section_paras),
                        "metadata": {"sha256": sha256}
                    })
                    section_paras = []
                current_section = text
            else:
                section_paras.append(text)

        # Process tables in DOCX
        for t_idx, table in enumerate(doc.tables):
            table_rows = []
            for row in table.rows:
                row_cells = [c.text.strip() for c in row.cells]
                table_rows.append(" | ".join(row_cells))
            if table_rows:
                chunks.append({
                    "document_id": doc_id,
                    "filename": file_path.name,
                    "page_number": page_num,
                    "section": f"Table {t_idx + 1}",
                    "text": "\n".join(table_rows),
                    "metadata": {"sha256": sha256, "is_table": True}
                })

        if section_paras:
            chunks.append({
                "document_id": doc_id,
                "filename": file_path.name,
                "page_number": page_num,
                "section": current_section,
                "text": "\n".join(section_paras),
                "metadata": {"sha256": sha256}
            })

        return chunks

    def _parse_excel(self, file_path: Path, doc_id: str, sha256: str) -> List[Dict[str, Any]]:
        chunks = []
        wb = openpyxl.load_workbook(str(file_path), data_only=True)
        for sheet_idx, sheet_name in enumerate(wb.sheetnames):
            ws = wb[sheet_name]
            rows_data = []
            for r in ws.iter_rows(values_only=True):
                if any(r):
                    clean_row = [str(cell) if cell is not None else "" for cell in r]
                    rows_data.append(" | ".join(clean_row))

            sheet_text = "\n".join(rows_data[:200]) # Cap preview lines per sheet
            chunks.append({
                "document_id": doc_id,
                "filename": file_path.name,
                "page_number": sheet_idx + 1,
                "section": f"Sheet: {sheet_name}",
                "text": sheet_text,
                "metadata": {
                    "sha256": sha256,
                    "sheet_name": sheet_name,
                    "row_count": ws.max_row,
                    "col_count": ws.max_column
                }
            })
        return chunks

    def _parse_csv(self, file_path: Path, doc_id: str, sha256: str) -> List[Dict[str, Any]]:
        with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
            reader = csv.reader(f)
            rows = [", ".join(row) for row in reader if row]

        header = rows[0] if rows else ""
        sample_rows = rows[:100]
        content = "\n".join(sample_rows)

        return [{
            "document_id": doc_id,
            "filename": file_path.name,
            "page_number": 1,
            "section": "CSV Telemetry / Data",
            "text": content,
            "metadata": {
                "sha256": sha256,
                "total_rows": len(rows),
                "header": header
            }
        }]

    def _parse_pptx(self, file_path: Path, doc_id: str, sha256: str) -> List[Dict[str, Any]]:
        chunks = []
        prs = Presentation(str(file_path))
        for slide_idx, slide in enumerate(prs.slides):
            slide_texts = []
            for shape in slide.shapes:
                if hasattr(shape, "text") and shape.text.strip():
                    slide_texts.append(shape.text.strip())

            chunks.append({
                "document_id": doc_id,
                "filename": file_path.name,
                "page_number": slide_idx + 1,
                "section": f"Slide {slide_idx + 1}",
                "text": "\n".join(slide_texts),
                "metadata": {
                    "sha256": sha256,
                    "slide_number": slide_idx + 1,
                    "total_slides": len(prs.slides)
                }
            })
        return chunks

    def _parse_txt(self, file_path: Path, doc_id: str, sha256: str) -> List[Dict[str, Any]]:
        with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
            text = f.read()

        return [{
            "document_id": doc_id,
            "filename": file_path.name,
            "page_number": 1,
            "section": "Document Text",
            "text": text,
            "metadata": {
                "sha256": sha256,
                "char_count": len(text)
            }
        }]

    def _parse_image(self, file_path: Path, doc_id: str, sha256: str) -> List[Dict[str, Any]]:
        from app.tools.ocr_tool import ocr_engine
        ocr_res = ocr_engine.extract_document_ocr(file_path, doc_id)
        pages = ocr_res.get("pages", [])
        if pages:
            return [{
                "document_id": doc_id,
                "filename": file_path.name,
                "page_number": p.get("page_number", 1),
                "section": f"Visual Evidence ({file_path.suffix.upper().replace('.', '')})",
                "text": p.get("text", ""),
                "metadata": {
                    "sha256": sha256,
                    "format": file_path.suffix.upper().replace(".", ""),
                    "confidence": p.get("confidence", 0.92),
                    "engine": p.get("engine", "Local-OCR")
                }
            } for p in pages]

        return [{
            "document_id": doc_id,
            "filename": file_path.name,
            "page_number": 1,
            "section": "Visual Evidence Image",
            "text": f"[IMAGE EVIDENCE: {file_path.name}]",
            "metadata": {
                "sha256": sha256,
                "format": file_path.suffix.upper().replace(".", "")
            }
        }]

document_parser = DocumentParser()

def parse_document(file_path: Path, document_id: Optional[str] = None) -> Dict[str, Any]:
    file_path = Path(file_path)
    chunks = document_parser.parse_document(file_path, document_id)
    text_content = "\n".join([c.get("text", "") for c in chunks])
    return {
        "text_content": text_content,
        "chunks": chunks
    }

