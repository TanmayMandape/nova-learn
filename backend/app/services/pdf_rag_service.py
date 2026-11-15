import os
import shutil
import tempfile
from typing import Dict, Any, Tuple, List, Optional
import fitz  # PyMuPDF
import pytesseract
from PIL import Image
from pdf2image import convert_from_path

from langchain_community.document_loaders import PyMuPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_chroma import Chroma
from langchain_core.embeddings import Embeddings
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.documents import Document
import chromadb
from app.config import settings

# Tell pytesseract where tesseract is installed if on Windows
if os.path.exists(r"C:\Program Files\Tesseract-OCR\tesseract.exe"):
    pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"

# Storage paths
CHROMA_BASE_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "data", "chroma_db")
UPLOADS_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "data", "uploads")
os.makedirs(CHROMA_BASE_DIR, exist_ok=True)
os.makedirs(UPLOADS_DIR, exist_ok=True)


class SimpleEmbeddings(Embeddings):
    """Embeddings wrapper utilizing Chroma's built-in default embedding function."""
    def embed_documents(self, texts: List[str]) -> List[List[float]]:
        ef = chromadb.utils.embedding_functions.DefaultEmbeddingFunction()
        return ef(texts)

    def embed_query(self, text: str) -> List[float]:
        ef = chromadb.utils.embedding_functions.DefaultEmbeddingFunction()
        return ef([text])[0]


# In-memory registry of active RAG chains per classroom
_classroom_chains: Dict[str, Any] = {}
_classroom_vectorstores: Dict[str, Any] = {}


def is_scanned_pdf(pdf_path: str) -> bool:
    try:
        doc = fitz.open(pdf_path)
        total_text = ""
        for page in doc:
            total_text += page.get_text()
        return len(total_text.strip()) < 100
    except Exception:
        return False


def load_normal_pdf(pdf_path: str) -> List[Document]:
    doc = fitz.open(pdf_path)
    documents = []
    for i, page in enumerate(doc):
        text = page.get_text()
        if text.strip():
            # Also detect figures/images if present
            image_list = page.get_images(full=True)
            documents.append(Document(
                page_content=text,
                metadata={
                    "page": i,
                    "source": os.path.basename(pdf_path),
                    "figures_detected": len(image_list)
                }
            ))
    return documents


def load_scanned_pdf(pdf_path: str) -> List[Document]:
    print(f"Scanned PDF detected ({pdf_path}). Running OCR with Tesseract...")
    documents = []
    try:
        images = convert_from_path(pdf_path)
        for i, image in enumerate(images):
            text = pytesseract.image_to_string(image)
            if text.strip():
                documents.append(Document(
                    page_content=text,
                    metadata={"page": i, "source": os.path.basename(pdf_path), "figures_detected": 0}
                ))
    except Exception as e:
        print(f"OCR warning: {e}. Falling back to standard PyMuPDF extraction.")
        return load_normal_pdf(pdf_path)
    return documents


def extract_figures_summary(pdf_path: str) -> List[dict]:
    figures = []
    try:
        doc = fitz.open(pdf_path)
        for i, page in enumerate(doc):
            images = page.get_images(full=True)
            if images:
                figures.append({
                    "page": i + 1,
                    "count": len(images),
                    "description": f"Page {i + 1}: {len(images)} figure(s)/diagram(s) detected"
                })
    except Exception as e:
        print(f"Figure extraction error: {e}")
    return figures


def process_and_index_pdf(pdf_path: str, classroom_id: str) -> Tuple[Any, int, int, str, List[dict]]:
    if is_scanned_pdf(pdf_path):
        pages = load_scanned_pdf(pdf_path)
        pdf_type = "scanned (OCR)"
    else:
        pages = load_normal_pdf(pdf_path)
        pdf_type = "digital"

    if not pages:
        # Fallback single page document
        pages = [Document(page_content="Course study notes uploaded.", metadata={"page": 0, "source": os.path.basename(pdf_path)})]

    figures = extract_figures_summary(pdf_path)

    # Chunking
    splitter = RecursiveCharacterTextSplitter(chunk_size=800, chunk_overlap=100)
    chunks = splitter.split_documents(pages)
    if not chunks:
        chunks = pages

    # Persistent Chroma directory for this classroom
    classroom_chroma_dir = os.path.join(CHROMA_BASE_DIR, f"class_{classroom_id}")
    embeddings = SimpleEmbeddings()

    vectorstore = Chroma.from_documents(
        documents=chunks,
        embedding=embeddings,
        persist_directory=classroom_chroma_dir,
    )

    chains = build_explainer_chains(vectorstore)
    _classroom_chains[classroom_id] = chains
    _classroom_vectorstores[classroom_id] = vectorstore

    return vectorstore, len(pages), len(chunks), pdf_type, figures


def get_vectorstore_for_classroom(classroom_id: str):
    if classroom_id in _classroom_vectorstores:
        return _classroom_vectorstores[classroom_id]

    classroom_chroma_dir = os.path.join(CHROMA_BASE_DIR, f"class_{classroom_id}")
    if os.path.exists(classroom_chroma_dir):
        try:
            embeddings = SimpleEmbeddings()
            vectorstore = Chroma(
                persist_directory=classroom_chroma_dir,
                embedding_function=embeddings
            )
            _classroom_vectorstores[classroom_id] = vectorstore
            _classroom_chains[classroom_id] = build_explainer_chains(vectorstore)
            return vectorstore
        except Exception as e:
            print(f"Error loading vectorstore for {classroom_id}: {e}")
    return None


def format_docs(docs: List[Document]) -> str:
    return "\n\n".join([
        f"[Page {doc.metadata.get('page', 0) + 1} - {doc.metadata.get('source', 'Notes')}]: {doc.page_content}"
        for doc in docs
    ])


def build_explainer_chains(vectorstore):
    retriever = vectorstore.as_retriever(search_kwargs={"k": 4})

    def run_query(concept_or_question: str) -> Dict[str, str]:
        docs = retriever.invoke(concept_or_question)
        context = format_docs(docs)

        # Attempt Groq LLM if key is available, else use structured educational synthesis
        from app.services.ai_services import call_llm_json

        prompt = f"""You are PracticalAI, an expert AI study assistant for university engineering students.
Based on the following course materials, answer the question in exactly 5 sections.

Context:
{context}

Question:
{concept_or_question}

Return ONLY a JSON object with these 5 keys:
{{
  "answer": "A clear, thorough explanation from the notes with page references where available.",
  "realworld": "A concrete real-world example or industry analogy where this concept is actually used today (e.g. Netflix, Tesla, AWS, Google).",
  "code": "A clean, runnable Python code snippet illustrating the concept with helpful comments.",
  "why": "Why an engineering student needs this concept, what problem it solves, and where it is applied.",
  "next": "Exactly 3 related topics to learn next with brief 1-line reasons."
}}"""

        res = call_llm_json(prompt, context=context, question=concept_or_question)
        return res

    return {"explain": run_query, "retriever": retriever}


def query_pdf_explainer(classroom_id: str, query: str) -> Dict[str, str]:
    if classroom_id in _classroom_chains:
        return _classroom_chains[classroom_id]["explain"](query)

    vs = get_vectorstore_for_classroom(classroom_id)
    if vs:
        return _classroom_chains[classroom_id]["explain"](query)

    # If no PDF uploaded for this classroom yet, provide a helpful message
    return {
        "answer": f"No course materials or PDFs have been uploaded to this classroom yet. Once faculty uploads a syllabus or notes PDF, full RAG-based explanations will appear here.",
        "realworld": "Upload course documents in the Faculty Dashboard to enable real-world engineering analogies.",
        "code": "# Once course PDFs are uploaded, sample code demonstrating the concepts will generate here.\nprint('Awaiting course documents')",
        "why": "Learning with AI-grounded course notes accelerates concept mastery.",
        "next": "1. Ask your faculty to upload lecture slides.\n2. Review recorded lectures in AI Notes."
    }
