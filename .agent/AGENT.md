# AGENT.md — Digital Krishi Officer (AI-Based Farmer Support System)

> This file is the primary guide for any AI coding agent working in this repository.
> Read it fully before making any changes.

---

## 🌾 Project Summary

**Digital Krishi Officer** (കൃഷി സഹായി) is an AI-powered agricultural advisory platform built for Kerala farmers. It combines:

- A **Streamlit** frontend (`frontend.py`) for chat, voice queries, and crop-disease image analysis.
- A **FastAPI** backend (`backend.py`) exposing a RAG chatbot (LangGraph + Pinecone + Groq LLM) and a disease-prediction CNN pipeline.
- A **SQLite** conversation checkpoint store (`chatbot.db`).
- A **Pinecone** vector store for document retrieval.
- A **TensorFlow/CNN model** (`models/prediction.py`) for crop-disease classification.

---

## 📁 Repository Layout

```
Ai_Based_Farmer_Support_System/
├── frontend.py              # Streamlit UI (chat, voice, disease detection)
├── backend.py               # FastAPI server (RAG, LLM, prediction API)
├── document_processor.py    # Chunks & indexes documents into Pinecone
├── documents_manager.py     # Document lifecycle management
├── add_new_documents.py     # CLI helper to add docs without full reindex
├── delete_index.py          # Utility to wipe the Pinecone index
├── init_documents.py        # One-time bootstrap of the knowledge base
├── models/
│   └── prediction.py        # PredictionPipeline (TF model inference)
├── documents/               # Farming PDFs / knowledge base source files
├── farmer_support_system/   # (Reserved / future modular expansion)
├── requirements.txt         # All Python dependencies
├── chatbot.db               # SQLite LangGraph checkpoint store
└── .agent/
    ├── AGENT.md             # ← You are here
    └── skills/
        └── frontend/
            └── SKILL.md     # Detailed frontend patterns & conventions
```

---

## 🔑 Environment Variables

Create a `.env` file in the project root:

```env
# LLM
GROQ_API_KEY=<your-groq-api-key>

# Vector Store
PINECONE_API_KEY=<your-pinecone-api-key>
PINECONE_INDEX_NAME=medical-chatbot   # rename for agriculture if desired

# Embedding model (optional override)
HUGGINGFACE_MODEL=sentence-transformers/all-MiniLM-L6-v2
```

> **Never commit `.env` to version control.** It is already in `.gitignore`.

---

## 🚀 Running the System

```bash
# 1. Install dependencies
pip install -r requirements.txt

# 2. Bootstrap knowledge base (first run only)
python init_documents.py

# 3. Start backend
python backend.py          # FastAPI on http://localhost:8000

# 4. Start frontend (separate terminal)
streamlit run frontend.py  # Streamlit on http://localhost:8501
```

---

## 🏗️ Architecture

```
┌─────────────────────────────────┐
│         Streamlit Frontend       │
│  frontend.py  (port 8501)        │
│  ┌──────────┐ ┌───────────────┐ │
│  │ Chat Tab │ │ Disease Tab   │ │
│  │ + Voice  │ │ (image upload)│ │
│  └────┬─────┘ └──────┬────────┘ │
└───────┼──────────────┼──────────┘
        │  HTTP/REST   │
┌───────▼──────────────▼──────────┐
│         FastAPI Backend          │
│  backend.py  (port 8000)         │
│  ┌──────────────────────────┐   │
│  │  LangGraph RAG Chatbot   │   │
│  │  ┌──────┐  ┌──────────┐  │   │
│  │  │ LLM  │  │ Pinecone │  │   │
│  │  │(Groq)│  │Retriever │  │   │
│  │  └──────┘  └──────────┘  │   │
│  │  SQLite Checkpointer     │   │
│  └──────────────────────────┘   │
│  ┌──────────────────────────┐   │
│  │  TF Disease Predictor    │   │
│  │  models/prediction.py    │   │
│  └──────────────────────────┘   │
└─────────────────────────────────┘
```

---

## 🔌 API Endpoints Reference

| Method | Path | Description |
|--------|------|-------------|
| GET | `/threads` | List all conversation thread IDs |
| POST | `/new_thread` | Create a new thread, returns `{thread_id}` |
| GET | `/load_thread/{id}` | Load message history for a thread |
| POST | `/chat` | Send messages, get AI response |
| POST | `/voice_query` | Upload audio → transcribe → chat answer |
| GET | `/documents` | List documents in knowledge base |
| GET | `/processing_status` | Document & chunk counts |
| POST | `/add_document` | Upload + index a single document |
| POST | `/upload_document` | Upload + full reprocess |
| POST | `/sync_documents` | Process only new/modified docs |
| POST | `/reindex_documents` | Wipe + reindex all docs |
| GET | `/document_status` | Per-doc processing status |
| POST | `/api/predict-disease/` | Image → disease prediction |

---

## 🧠 Agent Skills

| Skill | Path | When to use |
|-------|------|-------------|
| **Frontend** | `.agent/skills/frontend/SKILL.md` | Modifying `frontend.py`, adding tabs/widgets, session state, or API calls from the UI |

> More skills will be added here as the codebase grows (e.g., `backend`, `rag-pipeline`, `model-training`).

---

## 📋 Coding Conventions

### Python
- Use `typing` annotations everywhere (`List`, `Dict`, `Optional`).
- FastAPI endpoints: always use Pydantic models for request/response.
- Log with the module-level `logger = logging.getLogger(__name__)`.
- Wrap all external I/O (DB, API calls, file ops) in `try/except` with logged errors.

### Streamlit
- Always initialise session state keys in the "Session State Initialization" block.
- Use `@st.cache_data(show_spinner=False)` on read-only API calls.
- Call `st.rerun()` after any state mutation that should refresh the UI.
- See `.agent/skills/frontend/SKILL.md` for full frontend conventions.

### Git
- Commit messages: `type(scope): short description` (e.g., `feat(frontend): add dashboard tab`).
- Do not commit `chatbot.db`, `.env`, or model weight files.

---

## ⚠️ Known Issues

| Area | Issue | Fix / Workaround |
|------|-------|-----------------|
| Frontend | Tab 3 (Dashboard) body is empty | Needs implementation |
| Frontend | `use_column_width=True` deprecation warning | Replace with `use_container_width=True` |
| Frontend | `streamlit-webrtc` imported but unused | Remove import or wire to a widget |
| Backend | Groq model name `openai/gpt-oss-120b` may not exist | Verify current Groq model catalogue |
| Backend | `get_relevant_documents` deprecated in newer LangChain | Use `retriever.invoke(query)` |
| Backend | `chatbot.db` WAL files not cleaned up | Run `PRAGMA wal_checkpoint` periodically |
| RAG | Pinecone index dimension mismatch logs warning | Recreate index if embedding model changes |

---

## 🧪 Testing

No test suite exists yet. Recommended additions:

```
tests/
├── test_backend.py    # FastAPI TestClient tests
├── test_frontend.py   # Streamlit AppTest (st.testing)
└── test_pipeline.py   # Document processor + prediction unit tests
```

---

## 📚 Key Dependencies

| Package | Purpose |
|---------|---------|
| `streamlit` | Frontend UI |
| `fastapi` + `uvicorn` | REST API server |
| `langgraph` | Stateful chat graph |
| `langchain-groq` | Groq LLM integration |
| `langchain-pinecone` | Vector store retrieval |
| `langchain-huggingface` | HuggingFace embeddings |
| `pinecone-client` | Pinecone SDK |
| `tensorflow` | Crop disease CNN model |
| `SpeechRecognition` | Voice query transcription |
| `st-audiorec` | Browser audio recording widget |
| `python-dotenv` | Environment variable loading |
