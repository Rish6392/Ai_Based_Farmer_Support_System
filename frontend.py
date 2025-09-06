import streamlit as st
import requests
from typing import List, Dict
import os
import uuid
import json
import pandas as pd

# To be installed: pip install streamlit-webrtc st_audiorec pandas
from streamlit_webrtc import webrtc_streamer, AudioProcessorBase, WebRtcMode
import st_audiorec

# -------------------- Configuration --------------------
API_URL = "http://localhost:8000"

# -------------------- Utility Functions --------------------
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
        # Increased timeout for potentially long model responses
        response = requests.post(f"{API_URL}/chat", json=payload, timeout=60)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        st.error(f"Failed to send message: {e}")
        return []

# -------------------- Session State Initialization --------------------
if 'thread_id' not in st.session_state:
    st.session_state.thread_id = create_new_thread() or str(uuid.uuid4())

if 'message_history' not in st.session_state:
    st.session_state.message_history = []

# -------------------- Session State Initialization --------------------
if 'thread_id' not in st.session_state:
    st.session_state.thread_id = create_new_thread() or str(uuid.uuid4())

if 'message_history' not in st.session_state:
    st.session_state.message_history = []

# <<< FIX START: Correctly initialize and combine thread lists
if 'chat_threads' not in st.session_state:
    all_threads = get_all_threads()
    # Ensure the current thread is always at the top of a new session's list
    updated_threads = [st.session_state.thread_id]
    for thread in all_threads:
        if thread not in updated_threads:
            updated_threads.append(thread)
    st.session_state.chat_threads = updated_threads
# <<< FIX END

# Store voice language and latest transcription
if 'voice_lang' not in st.session_state:
    st.session_state.voice_lang = "English"
if 'last_transcription' not in st.session_state:
    st.session_state.last_transcription = ""

# Store voice language and latest transcription
if 'voice_lang' not in st.session_state:
    st.session_state.voice_lang = "English"
if 'last_transcription' not in st.session_state:
    st.session_state.last_transcription = ""

# -------------------- Sidebar Controls --------------------
with st.sidebar:
    st.title("⚙️ Controls")
    st.divider()

    # New Chat button
    if st.button("➕ New Chat", use_container_width=True):
        new_id = create_new_thread()
        if new_id:
            st.session_state.thread_id = new_id
        else:
            st.session_state.thread_id = str(uuid.uuid4())
        st.session_state.message_history = []
        st.session_state.chat_threads = get_all_threads() or [st.session_state.thread_id]
        st.rerun()

    # Language selection
    language = st.selectbox(
        "Response Language",
        ["English", "Malayalam", "Hindi", "Spanish", "French", "German", "Chinese", "Arabic"],
        index=0
    )

    st.divider()

    # Voice Input Section (st-audiorec)
    st.subheader("🎤 Voice Input")
    st.info("Record your question here.")
    audio_bytes = st_audiorec.st_audiorec()

    if audio_bytes:
        st.audio(audio_bytes, format="audio/wav")
        if st.button("Send Voice Query", use_container_width=True, type="primary"):
            files = {"file": ("voice_query.wav", audio_bytes, "audio/wav")}
            params = {"language": language}
            try:
                # Increase timeout to 60 seconds to avoid read timeout
                response = requests.post(f"{API_URL}/voice_query", files=files, data=params, timeout=60)
                if response.status_code == 200:
                    result = response.json()
                    transcription = result.get("transcription")
                    if transcription:
                        # Set the transcribed text as the pending input for the chat
                        st.session_state.voice_input = transcription
                        st.success("Voice query transcribed!")
                        st.rerun()
                    else:
                        st.error("Failed to get transcription from response.")
            except requests.exceptions.RequestException as e:
                st.error(f"Could not connect to voice service: {e}")

    st.divider()

    # RAG Status
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

    # Conversation threads
    st.subheader("My Conversations")
    # Limit to the 10 most recent threads
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

# Define tabs
tab1, tab2, tab3 = st.tabs(["💬 Ask Expert", "🌿 Crop Disease Detection", "📊 Dashboard"])

# -------------------- Chatbot Tab --------------------
with tab1:
    st.header("Chat Conversation")

    # Chat messages container
    chat_container = st.container()
    with chat_container:
        for msg in st.session_state.message_history:
            role = msg.get('role', 'assistant')
            content = msg.get('content', '')
            with st.chat_message(role):
                st.markdown(content)

    # Handle different types of input
    user_input = None
    # Prioritize voice input if it exists
    if 'voice_input' in st.session_state and st.session_state.voice_input:
        user_input = st.session_state.pop('voice_input') # Use and remove
    # Then check for input from the disease tab
    elif 'pending_input' in st.session_state and st.session_state.pending_input:
        user_input = st.session_state.pop('pending_input') # Use and remove
    # Finally, check the text input
    else:
        user_input = st.chat_input("Type your message here...")

    if user_input:
        # Add user message to history and display it
        st.session_state.message_history.append({"role": "user", "content": user_input})
        with st.chat_message("user"):
            st.markdown(user_input)

        # Get AI response
        with st.spinner("Thinking..."):
            ai_messages = send_message(
                st.session_state.thread_id,
                st.session_state.message_history,
                language
            )

        # Add AI response(s) to history and display
        if ai_messages:
            for ai_msg in ai_messages:
                with st.chat_message("assistant"):
                    st.markdown(ai_msg.get('content', ''))
                st.session_state.message_history.append(ai_msg)
                
            get_all_threads.clear() # Clear the cache to fetch the latest list
            all_threads = get_all_threads()
            updated_threads = [st.session_state.thread_id] # Keep current at top
            for thread in all_threads:
                if thread not in updated_threads:
                    updated_threads.append(thread)
            st.session_state.chat_threads = updated_threads    
            # Rerun to clear the chat input box after processing
            st.rerun()

# -------------------- Disease Prediction Tab --------------------
with tab2:
    st.header("🔬 Disease Prediction from Medical Images")
    st.info("Upload a medical image for AI-powered disease prediction")

    # Create two columns for upload and results
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
                # To switch tabs, we can't directly do it. We rerun and the user has to click.
                # A more advanced solution might involve session state to set the active tab.
                st.info("Go to the 'Ask Expert' tab to see the question.")
                st.rerun()
        else:
            st.info("Upload and analyze an image to see results here")

# -------------------- Dashboard Tab --------------------
with tab3:
    st.header("📊 Dashboard")
    st.info("This section is under development. Future features will include market prices, weather forecasts, and personalized farm analytics.")
    # Placeholder for future dashboard components
    st.warning("Coming Soon!")