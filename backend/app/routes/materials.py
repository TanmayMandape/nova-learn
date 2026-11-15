import os
import shutil
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Query
from pydantic import BaseModel
from typing import Optional, List
from app.services.db import db
from app.services.pdf_rag_service import (
    process_and_index_pdf,
    query_pdf_explainer,
    UPLOADS_DIR
)

router = APIRouter(prefix="/materials", tags=["Materials & PDF AI"])


@router.post("/upload")
async def upload_pdf_material(
    file: UploadFile = File(...),
    classroom_id: str = Form(...),
    title: Optional[str] = Form(None)
):
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files (.pdf) are supported.")

    # Secure filename and save path
    safe_filename = f"{classroom_id[:8]}_{file.filename}"
    save_path = os.path.join(UPLOADS_DIR, safe_filename)

    with open(save_path, "wb") as f:
        shutil.copyfileobj(file.file, f)

    try:
        vectorstore, pages, chunks, pdf_type, figures = process_and_index_pdf(
            pdf_path=save_path,
            classroom_id=classroom_id
        )

        doc_title = title or file.filename.replace(".pdf", "").replace("_", " ").title()

        saved = db.save_material(
            classroom_id=classroom_id,
            title=doc_title,
            filename=file.filename,
            file_path=save_path,
            doc_type=pdf_type,
            pages=pages,
            chunks=chunks
        )

        return {
            "success": True,
            "status": "ready",
            "material": saved,
            "stats": {
                "pages": pages,
                "chunks": chunks,
                "type": pdf_type,
                "figures_detected": len(figures),
                "figures": figures
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"PDF indexing error: {str(e)}")


@router.get("/")
async def list_materials(classroom_id: Optional[str] = Query(None)):
    materials = db.get_materials(classroom_id=classroom_id)
    return {"materials": materials}


class ExplainerQueryRequest(BaseModel):
    classroom_id: str
    query: str


@router.post("/query")
async def explain_concept(req: ExplainerQueryRequest):
    if not req.query.strip():
        raise HTTPException(status_code=400, detail="Query cannot be empty")

    response_data = query_pdf_explainer(
        classroom_id=req.classroom_id,
        query=req.query.strip()
    )

    return response_data
