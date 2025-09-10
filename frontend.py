import streamlit as st
import requests
from typing import List, Dict
import os
import uuid
import json
import pandas as pd
import io  # <<< ADDED IMPORT

# To be installed: pip install streamlit-webrtc st_audiorec pandas gtts
from streamlit_webrtc import webrtc_streamer, AudioProcessorBase, WebRtcMode
import st_audiorec
from gtts import gTTS
import numpy as np  # <<< ADDED IMPORT
from config import KERALA_DISTRICTS
# <<< ADDED IMPORT

# -------------------- Configuration --------------------
API_URL = "http://localhost:8000"

# -------------------- Utility Functions --------------------

# <<< NEW FUNCTION START: Text-to-Speech conversion
@st.cache_data(show_spinner="Generating audio...")
def text_to_speech(text: str, language: str) -> bytes:
    """Converts text to speech using gTTS and returns audio bytes."""
    lang_code_map = {
        "English": "en", "Malayalam": "ml", "Hindi": "hi",
        "Spanish": "es", "French": "fr", "German": "de",
        "Chinese": "zh-CN", "Arabic": "ar"
    }
    lang_code = lang_code_map.get(language, 'en')

    try:
        tts = gTTS(text=text, lang=lang_code, tld="co.in", slow=False)
        audio_fp = io.BytesIO()
        tts.write_to_fp(audio_fp)
        audio_fp.seek(0)
        return audio_fp.read()
    except Exception as e:
        st.error(f"Failed to generate audio: {e}")
        return None
# <<< NEW FUNCTION END

@st.cache_data(show_spinner=False)
def get_all_threads() -> List[str]:
    try:
        response = requests.get(f"{API_URL}/threads", timeout=5)
        response.raise_for_status()
        return response.json().get("threads", [])
    except requests.exceptions.RequestException as e:
        st.error(f"Failed to fetch threads: {e}")
        return []

@st.cache_data(show_spinner=False)
def get_documents() -> List[str]:
    try:
        response = requests.get(f"{API_URL}/documents", timeout=5)
        response.raise_for_status()
        return response.json().get("documents", [])
    except requests.exceptions.RequestException as e:
        st.error(f"Failed to fetch document list: {e}")
        return []

@st.cache_data(show_spinner=False)
def get_processing_status() -> Dict:
    try:
        response = requests.get(f"{API_URL}/processing_status", timeout=5)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        st.error(f"Failed to fetch processing status: {e}")
        return {"total_documents": 0, "processed_chunks": 0}

def create_new_thread() -> str:
    try:
        response = requests.post(f"{API_URL}/new_thread", timeout=5)
        response.raise_for_status()
        return response.json().get("thread_id", "")
    except requests.exceptions.RequestException as e:
        st.error(f"Failed to create new thread: {e}")
        return ""

def load_thread(thread_id: str) -> List[Dict]:
    try:
        response = requests.get(f"{API_URL}/load_thread/{thread_id}", timeout=5)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        st.error(f"Failed to load thread {thread_id}: {e}")
        return []

def send_message(thread_id: str, messages: List[Dict], language: str = "English") -> List[Dict]:
    try:
        payload = {"thread_id": thread_id, "messages": messages, "language": language}
        response = requests.post(f"{API_URL}/chat", json=payload, timeout=60)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        st.error(f"Failed to send message: {e}")
        return []


def log_feedback(thread_id: str, msg_index: int, rating: int):
    """Logs feedback for a specific message."""
    try:
        payload = {"thread_id": thread_id, "message_index": msg_index, "rating": rating}
        requests.post(f"{API_URL}/log-feedback", json=payload, timeout=10)
    except requests.exceptions.RequestException as e:
        # Fail silently on the frontend or show a minor error
        print(f"Could not log feedback: {e}")

def escalate_to_expert(thread_id: str):
    """Calls the backend to escalate a conversation."""
    try:
        payload = {"thread_id": thread_id}
        response = requests.post(f"{API_URL}/escalate-query", json=payload, timeout=30)
        response.raise_for_status()
        st.success("✅ Your query has been sent to an expert for review!")
    except requests.exceptions.RequestException as e:
        st.error(f"Failed to escalate query: {e}")


# -------------------- Session State Initialization --------------------
# (Combined the duplicated blocks for cleanliness)
if 'thread_id' not in st.session_state:
    st.session_state.thread_id = create_new_thread() or str(uuid.uuid4())
if 'message_history' not in st.session_state:
    st.session_state.message_history = []
if 'chat_threads' not in st.session_state:
    all_threads = get_all_threads()
    updated_threads = [st.session_state.thread_id]
    for thread in all_threads:
        if thread not in updated_threads:
            updated_threads.append(thread)
    st.session_state.chat_threads = updated_threads
if 'voice_lang' not in st.session_state:
    st.session_state.voice_lang = "English"
if 'last_transcription' not in st.session_state:
    st.session_state.last_transcription = ""

if 'feedback' not in st.session_state:
    st.session_state.feedback = {}

# -------------------- Sidebar Controls --------------------
with st.sidebar:
    st.title("⚙️ Controls")
    st.divider()

    if st.button("➕ New Chat", use_container_width=True):
        new_id = create_new_thread()
        if new_id:
            st.session_state.thread_id = new_id
        else:
            st.session_state.thread_id = str(uuid.uuid4())
        st.session_state.message_history = []
        st.session_state.chat_threads = get_all_threads() or [st.session_state.thread_id]
        st.rerun()

    language = st.selectbox(
        "Response Language",
        ["English", "Malayalam", "Hindi", "Spanish", "French", "German", "Chinese", "Arabic"],
        index=0
    )

    st.divider()
    st.subheader("🎤 Voice Input")
    st.info("Record your question here.")
    audio_bytes = st_audiorec.st_audiorec()

    if audio_bytes:
        st.audio(audio_bytes, format="audio/wav")
        if st.button("Send Voice Query", use_container_width=True, type="primary"):
            files = {"file": ("voice_query.wav", audio_bytes, "audio/wav")}
            params = {"language": language}
            try:
                response = requests.post(f"{API_URL}/voice_query", files=files, data=params, timeout=60)
                if response.status_code == 200:
                    result = response.json()
                    transcription = result.get("transcription")
                    if transcription:
                        st.session_state.voice_input = transcription
                        st.success("Voice query transcribed!")
                        st.rerun()
                    else:
                        st.error("Failed to get transcription from response.")
            except requests.exceptions.RequestException as e:
                st.error(f"Could not connect to voice service: {e}")

    st.divider()
    st.subheader("📚 Knowledge Base")
    with st.expander("System Status", expanded=False):
        status = get_processing_status()
        total_docs = status.get("total_documents", 0)
        processed_chunks = status.get("processed_chunks", 0)
        if total_docs > 0 and processed_chunks > 0:
            st.success("🟢 Ready")
        elif total_docs > 0:
            st.warning("🟠 Processing...")
        else:
            st.info("⚪ No documents loaded")
        st.metric("Documents", total_docs)
        st.metric("Chunks", processed_chunks)
    st.divider()
    st.subheader("My Conversations")
    for idx, thread_id in enumerate(st.session_state.chat_threads[:10]):
        short_id = thread_id[:8]
        if st.button(f"💬 {short_id}...", key=f"chat_{idx}", use_container_width=True):
            st.session_state.thread_id = thread_id
            st.session_state.message_history = load_thread(thread_id)
            st.rerun()

# -------------------- Main UI --------------------
st.set_page_config(page_title="Digital Krishi Officer", page_icon="🌾", layout="wide")
st.title("🌾 Digital Krishi Officer - കൃഷി സഹായി")
st.caption("AI-powered farming assistant for Kerala farmers")

tab1, tab2, tab3 = st.tabs(["💬 Ask Expert", "🌿 Crop Disease Detection", "📊 Dashboard"])

# -------------------- Chatbot Tab --------------------
with tab1:
    chat_container = st.container(height=400)

    
    with chat_container:
        # We use enumerate to get an index for unique keys
        for idx, msg in enumerate(st.session_state.message_history):
            role = msg.get('role', 'assistant')
            content = msg.get('content', '')
            with st.chat_message(role):
                st.markdown(content)
                # Add the "Read Aloud" button only for assistant messages
                if role == 'assistant':
                    feedback_key = f"feedback_{idx}"
                    feedback_given = st.session_state.feedback.get(feedback_key)
                    # We create 5 columns to neatly space out all the buttons
                    col1, col2, col3, col4, col5 = st.columns([2, 1, 1, 2, 5])
                    
                    # Column 1: Read Aloud Button
                    with col1:
                        if st.button("🔊 Read", key=f"read_aloud_{idx}"):
                            audio_bytes = text_to_speech(content, language)
                            if audio_bytes:
                                # Display the audio player right below the button
                                st.audio(audio_bytes, format="audio/mp3")

                    # Column 2: Thumbs Up Button
                    with col2:
                        if st.button("👍", key=f"thumbs_up_{idx}", disabled=bool(feedback_given)):
                            st.session_state.feedback[feedback_key] = "👍"
                            log_feedback(st.session_state.thread_id, idx, 1)
                            st.rerun()
                    
                    # Column 3: Thumbs Down Button
                    with col3:
                        if st.button("👎", key=f"thumbs_down_{idx}", disabled=bool(feedback_given)):
                            st.session_state.feedback[feedback_key] = "👎"
                            log_feedback(st.session_state.thread_id, idx, -1)
                            st.rerun()

                    # Column 4: Conditional Escalate Button
                    # This only appears if the user has clicked "👎"
                    if st.session_state.feedback.get(feedback_key) == "👎":
                        with col4:
                            if st.button("Escalate", key=f"escalate_{idx}"):
                                escalate_to_expert(st.session_state.thread_id)
                                st.session_state.feedback[feedback_key] = "escalated"
                    
                    # Display confirmation messages below the main content
                    if st.session_state.feedback.get(feedback_key) == "👍":
                        st.caption("Thanks for your feedback!")
                    if st.session_state.feedback.get(feedback_key) == "escalated":
                        st.caption("This query has been escalated to an expert.")
    # <<< MODIFICATION END

    user_input = None
    if 'voice_input' in st.session_state and st.session_state.voice_input:
        user_input = st.session_state.pop('voice_input')
    elif 'pending_input' in st.session_state and st.session_state.pending_input:
        user_input = st.session_state.pop('pending_input')
    else:
        user_input = st.chat_input("Type your message here...")

    if user_input:
        st.session_state.message_history.append({"role": "user", "content": user_input})
        with st.chat_message("user"):
            st.markdown(user_input)

        with st.spinner("Thinking..."):
            ai_messages = send_message(
                st.session_state.thread_id,
                st.session_state.message_history,
                language
            )

        if ai_messages:
            for ai_msg in ai_messages:
                with st.chat_message("assistant"):
                    st.markdown(ai_msg.get('content', ''))
                st.session_state.message_history.append(ai_msg)
            
            get_all_threads.clear()
            all_threads = get_all_threads()
            updated_threads = [st.session_state.thread_id]
            for thread in all_threads:
                if thread not in updated_threads:
                    updated_threads.append(thread)
            st.session_state.chat_threads = updated_threads
            st.rerun()

# -------------------- Disease Prediction Tab --------------------
# (This section remains unchanged)
with tab2:
    st.header("🔬 Disease Prediction from Medical Images")
    st.info("Upload a medical image for AI-powered disease prediction")

    upload_col, result_col = st.columns([1, 1])

    with upload_col:
        st.subheader("Upload Image")
        uploaded_file = st.file_uploader(
            "Choose a medical image",
            type=["jpg", "jpeg", "png"],
            help="Supported formats: JPG, JPEG, PNG"
        )

        if uploaded_file:
            st.image(uploaded_file, caption="Uploaded Image", use_column_width=True)

            if st.button("🔍 Analyze Image", type="primary", use_container_width=True):
                with st.spinner("Analyzing image..."):
                    try:
                        uploaded_file.seek(0)
                        file_tuple = (
                            uploaded_file.name,
                            uploaded_file.read(),
                            uploaded_file.type or "application/octet-stream"
                        )
                        response = requests.post(
                            f"{API_URL}/api/predict-disease/",
                            files={"file": file_tuple},
                            timeout=60
                        )

                        if response.status_code == 200:
                            st.session_state.prediction_results = response.json()
                            st.success("Analysis complete!")
                        else:
                            st.error(f"Analysis failed: {response.status_code}")
                            if response.text:
                                st.error(f"Error details: {response.text}")

                    except requests.exceptions.RequestException as e:
                        st.error(f"Request failed: {e}")
                    except Exception as e:
                        st.error(f"Unexpected error: {e}")

    with result_col:
        st.subheader("Analysis Results")

        if 'prediction_results' in st.session_state and st.session_state.prediction_results:
            results = st.session_state.prediction_results
            prediction = results.get('prediction', 'No prediction available')
            probabilities = results.get("probabilities", [])

            st.metric("Predicted Disease", prediction)

            if probabilities:
                try:
                    top_prob = max(probabilities)
                    st.metric("Confidence", f"{top_prob:.2%}")

                    st.divider()
                    st.subheader("Probability Distribution")

                    if len(probabilities) > 1:
                        labels = [f"Class {i}" for i in range(len(probabilities))]
                        df = pd.DataFrame({'Class': labels, 'Probability': probabilities})
                        df = df.sort_values('Probability', ascending=False)
                        st.bar_chart(df.set_index('Class'))

                        st.subheader("Top Predictions")
                        for _, row in df.head(3).iterrows():
                            st.write(f"**{row['Class']}**: {row['Probability']:.2%}")
                    else:
                        st.info("Single class prediction")

                except Exception as e:
                    st.error(f"Error processing probabilities: {e}")
                    st.json(probabilities)
            else:
                st.warning("No probability information available")

            st.divider()
            if st.button("💬 Ask about this prediction in chat"):
                question = f"I just received a disease prediction of '{prediction}' from an uploaded image. Can you tell me more about this condition and its remedies?"
                st.session_state.pending_input = question
                st.info("Go to the 'Ask Expert' tab to see the question.")
                st.rerun()
        else:
            st.info("Upload and analyze an image to see results here")

# -------------------- Dashboard Tab --------------------
with tab3:
    st.header("🌾 Find the Best Crop for Your Land (Automated)")
    st.info("Upload your Soil Health Card and select your district to automatically fill the form.")

    