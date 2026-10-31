# Frontend Skills — AI-Based Farmer Support System

## Overview

This skill covers all frontend development patterns, conventions, and workflows for the **Digital Krishi Officer** Streamlit application ([`frontend.py`](../../frontend.py)).

---

## Stack

| Layer | Technology |
|-------|-----------|
| UI Framework | [Streamlit](https://streamlit.io/) |
| Audio Input | `st-audiorec` (`st_audiorec`) |
| Voice Streaming | `streamlit-webrtc` |
| HTTP Client | `requests` |
| State Management | `st.session_state` |
| Backend API | FastAPI at `http://localhost:8000` |

---

## Project Structure (Frontend-relevant)

```
Ai_Based_Farmer_Support_System/
├── frontend.py              # Main Streamlit app entry point
├── requirements.txt         # All Python dependencies
└── .agent/
    ├── AGENT.md             # Agent behaviour guide
    └── skills/
        └── frontend/
            └── SKILL.md     # ← This file
```

---

## Running the Frontend

```bash
# Start the backend first (FastAPI on port 8000)
python backend.py

# Then start the Streamlit frontend
streamlit run frontend.py
```

> The frontend expects the backend API at `http://localhost:8000`. Change the `API_URL` constant in `frontend.py` if needed.

---

## Page Layout & Tabs

The app uses a **3-tab layout**:

| Tab | Key | Description |
|-----|-----|-------------|
| `💬 Ask Expert` | `tab1` | Main chatbot interface with sidebar controls |
| `🌿 Crop Disease Detection` | `tab2` | Image upload + AI disease prediction |
| `📊 Dashboard` | `tab3` | System metrics and knowledge-base status |

### Column Splits

- **Tab 1** — `chat_col` (3/4) + `control_col` (1/4)
- **Tab 2** — `upload_col` (1/2) + `result_col` (1/2)

---

## Session State Keys

| Key | Type | Purpose |
|-----|------|---------|
| `thread_id` | `str` | Active conversation thread UUID |
| `message_history` | `List[Dict]` | `[{"role": "user"/"assistant", "content": "..."}]` |
| `chat_threads` | `List[str]` | All thread IDs fetched from backend |
| `voice_lang` | `str` | Selected language for voice recording |
| `last_transcription` | `str` | Most recent voice-to-text result |
| `pending_input` | `str` | Message injected from voice/disease tab into chat |
| `prediction_results` | `Dict` | Last disease prediction payload |

---

## Backend API Calls

All calls target `API_URL = "http://localhost:8000"`.

| Function | Method | Endpoint | Returns |
|----------|--------|----------|---------|
| `get_all_threads()` | GET | `/threads` | `List[str]` |
| `get_documents()` | GET | `/documents` | `List[str]` |
| `get_processing_status()` | GET | `/processing_status` | `{total_documents, processed_chunks}` |
| `create_new_thread()` | POST | `/new_thread` | `str` (thread_id) |
| `load_thread(id)` | GET | `/load_thread/{id}` | `List[Dict]` |
| `send_message(...)` | POST | `/chat` | `List[Dict]` |
| Voice query | POST | `/voice_query` | `{answer, transcription}` |
| Disease prediction | POST | `/api/predict-disease/` | `{prediction, probabilities}` |

### Caching

`get_all_threads()`, `get_documents()`, and `get_processing_status()` are decorated with `@st.cache_data(show_spinner=False)`. Call `st.cache_data.clear()` or use `st.rerun()` when you need fresh data after mutations.

---

## Voice Input Flow

```
User records → st_audiorec() returns bytes
     ↓
"Send Voice Query" button clicked
     ↓
POST /voice_query  (multipart: file + language)
     ↓
Backend transcribes (Google Speech Recognition)
     ↓
answer injected into st.session_state.pending_input
     ↓
st.rerun() → chat_input picks it up and sends to /chat
```

Supported languages and codes (used on backend):

```python
{
    "Malayalam": "ml-IN",
    "English":   "en-US",
    "Hindi":     "hi-IN",
    "Spanish":   "es-ES",
    "French":    "fr-FR",
    "German":    "de-DE",
    "Chinese":   "zh-CN",
    "Arabic":    "ar-SA"
}
```

---

## Disease Detection Flow

```
User uploads image (jpg/jpeg/png)
     ↓
"🔍 Analyze Image" button
     ↓
POST /api/predict-disease/  (multipart: file)
     ↓
{prediction: str, probabilities: List[float]}
     ↓
Stored in st.session_state.prediction_results
     ↓
Bar chart + top-3 table rendered in result_col
     ↓
Optional: "💬 Ask about this prediction" → pending_input → chat
```

---

## Adding New UI Features — Checklist

1. **New tab**: Add entry to `st.tabs([...])` and wrap content in `with tabN:`.
2. **New session state key**: Initialise it in the "Session State Initialization" block (lines 74-89 in `frontend.py`).
3. **New API endpoint call**: Add a helper function near the top of `frontend.py` following the existing pattern (`try / requests.X / response.raise_for_status() / return ...`).
4. **Caching**: Decorate read-only API calls with `@st.cache_data(show_spinner=False)`.
5. **Mutations**: After any write operation, call `st.rerun()` to refresh the UI.

---

## Styling Conventions

- Page config: `st.set_page_config(page_title="Digital Krishi Officer", page_icon="🌾", layout="wide")`
- Use `st.divider()` between logical sections in the sidebar/control column.
- Use `st.expander(...)` for collapsible sections (e.g. Knowledge Base status).
- Emojis are used as icon prefixes for all headers and buttons.
- Sidebar footer: `st.sidebar.caption(...)`.

---

## Known Issues & Gotchas

| Issue | Notes |
|-------|-------|
| `st_audiorec` may not produce a WAV header | Wrap in `io.BytesIO` if backend rejects raw bytes |
| `streamlit-webrtc` imported but not wired to a widget | Reserved for future live-streaming support |
| `@st.cache_data` won't reflect backend changes until rerun | Always call `st.rerun()` after mutations |
| `use_column_width=True` deprecated | Replace with `use_container_width=True` in newer Streamlit versions |
| Tab 3 (Dashboard) is declared but body not implemented | Needs metrics/charts implementation |

---

## Dependencies (Frontend-specific)

```
streamlit
streamlit-webrtc
streamlit-audiorec
requests
```

Install with:
```bash
pip install -r requirements.txt
```
