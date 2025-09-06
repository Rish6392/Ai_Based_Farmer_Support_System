from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, TypedDict, Annotated
import uuid, sqlite3, shutil, os
import tempfile
import json
import traceback
import speech_recognition as sr
from dotenv import load_dotenv
from langchain_core.messages import HumanMessage, BaseMessage, AIMessage, SystemMessage
from langgraph.graph import StateGraph, START, END
from langgraph.graph.message import add_messages
from langgraph.checkpoint.sqlite import SqliteSaver
from langchain_openai import ChatOpenAI
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_pinecone import PineconeVectorStore
from langchain.chains import create_retrieval_chain
from langchain.chains.combine_documents import create_stuff_documents_chain
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from pinecone import Pinecone
from models.prediction import PredictionPipeline
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)
load_dotenv()

# -------------------- RAG Setup --------------------
try:
    pc = Pinecone(api_key=os.getenv("PINECONE_API_KEY"))
    index_name = os.getenv("PINECONE_INDEX_NAME", "medical-chatbot")
    
    model_name = os.getenv("HUGGINGFACE_MODEL", "sentence-transformers/all-MiniLM-L6-v2")
    embeddings = HuggingFaceEmbeddings(
        model_name=model_name,
        model_kwargs={'device': 'cpu'},
        encode_kwargs={'normalize_embeddings': True}
    )
    
    embedding_dimension = len(embeddings.embed_query("test"))
    logger.info(f"Using embedding model: {model_name} with dimension: {embedding_dimension}")
    
    if index_name in pc.list_indexes().names():
        index = pc.Index(index_name)
        index_stats = index.describe_index_stats()
        if index_stats.get('dimension') != embedding_dimension:
            logger.warning(f"Index dimension ({index_stats.get('dimension')}) doesn't match embedding dimension ({embedding_dimension})")
        
        vector_store = PineconeVectorStore(
            index=index,
            embedding=embeddings,
            text_key="text"
        )
        retriever = vector_store.as_retriever(search_kwargs={"k": 3})
    else:
        logger.warning(f"Pinecone index '{index_name}' not found. RAG features will be disabled.")
        retriever = None
except Exception as e:
    logger.error(f"Could not initialize Pinecone: {e}. RAG features will be disabled.")
    retriever = None

# -------------------- LLM Setup --------------------
from langchain_groq import ChatGroq

llm = ChatGroq(
    api_key=os.getenv("GROQ_API_KEY"),
    model="llama-3.1-8b-instant",
    temperature=0.7,
)

# -------------------- LangGraph Setup --------------------
class ChatState(TypedDict):
    messages: Annotated[list[BaseMessage], add_messages]
    # Keep track of language per-thread
    language: str 

def retrieve_context(query: str) -> str:
    if retriever is None: return ""
    try:
        docs = retriever.get_relevant_documents(query)
        return "\n\n".join([doc.page_content for doc in docs])
    except Exception as e:
        logger.error(f"Error retrieving context: {e}")
        return ""

def chat_node(state: ChatState):
    messages = state['messages']
    language = state.get('language', 'English') # Default to English
    
    # Get the last human message for context retrieval
    last_human_msg_content = ""
    if messages and isinstance(messages[-1], HumanMessage):
        last_human_msg_content = messages[-1].content
    
    if not last_human_msg_content:
        return {"messages": [AIMessage(content="I didn't receive a message to respond to.")]}

    # Prepare messages for the LLM
    llm_messages = list(messages)

    # <<< CHANGE START: More robust system prompt management
    # Check if a system message is already present
    has_system_message = any(isinstance(m, SystemMessage) for m in llm_messages)

    # If it's the start of the chat (no system message), add one.
    if not has_system_message:
        context = retrieve_context(last_human_msg_content)
        
        context_prompt = f"Use the following context to answer: {context}" if context else ""
        language_prompt = f"Your primary language for responding is {language}. Provide answers in {language} unless the user explicitly asks for another."

        system_content = f"""You are a helpful agricultural advisory assistant for farmers in Kerala. {language_prompt}
Be accurate, helpful, and provide practical, actionable advice. Consider local Kerala conditions.
If you don't know the answer, say so.
{context_prompt}"""
        
        system_msg = SystemMessage(content=system_content.strip())
        llm_messages.insert(0, system_msg)
    # <<< CHANGE END

    try:
        response = llm.invoke(llm_messages)
        return {"messages": [response]}
    except Exception as e:
        logger.error(f"LLM invoke error: {e}")
        return {"messages": [AIMessage(content=f"Sorry, I encountered an error: {str(e)}")]}

# -------------------- SQLite & Graph Compilation --------------------
script_dir = os.path.dirname(os.path.abspath(__file__))
# Join that directory path with the database filename
db_path = os.path.join(script_dir, "chatbot.db")
print(f"--- Connecting to database at: {db_path} ---") # For debugging

conn = sqlite3.connect(database=db_path, check_same_thread=False)
checkpointer = SqliteSaver(conn=conn)

graph = StateGraph(ChatState)
graph.add_node("chat_node", chat_node)
graph.add_edge(START, "chat_node")
graph.add_edge("chat_node", END)
chatbot = graph.compile(checkpointer=checkpointer)

# -------------------- FastAPI Setup --------------------
app = FastAPI(title="RAG LangGraph Chatbot API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"]
)

# -------------------- Pydantic Models --------------------
class Message(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    thread_id: str  # Made thread_id mandatory for clarity
    messages: List[Message]
    language: str = "English"

class NewThreadResponse(BaseModel):
    thread_id: str
    
# ... (other Pydantic models are fine) ...
class ThreadListResponse(BaseModel):
    threads: List[str]

class DocumentListResponse(BaseModel):
    documents: List[str]

class ProcessingStatusResponse(BaseModel):
    total_documents: int
    processed_chunks: int

# -------------------- Utility Functions --------------------
def generate_thread_id():
    return str(uuid.uuid4())

def retrieve_all_threads():
    """
    Definitive Version: Correctly sorts conversations using the 'checkpoint_id' column.
    """
    try:
        with conn:
            cursor = conn.cursor()
            # Step 1: Select all thread_ids, correctly sorted by the chronological checkpoint_id.
            cursor.execute(
                "SELECT thread_id FROM checkpoints ORDER BY checkpoint_id DESC"
            )
            rows = cursor.fetchall()

            # Step 2: Create a unique list in Python, which preserves the correct sorted order.
            unique_thread_ids = []
            seen_ids = set()
            for row in rows:
                thread_id = row[0]
                if thread_id not in seen_ids:
                    unique_thread_ids.append(thread_id)
                    seen_ids.add(thread_id)
            
            return unique_thread_ids
            
    except Exception as e:
        if "no such table" in str(e) or "no such column" in str(e):
            logger.warning(f"Database query failed (table or column might be missing): {e}")
            return []
        
        logger.error(f"Failed to retrieve threads directly from database: {e}")
        traceback.print_exc()
        return []


def convert_messages(messages: List[Message]) -> List[BaseMessage]:
    converted = []
    for m in messages:
        if m.role == 'user':
            converted.append(HumanMessage(content=m.content))
        elif m.role == 'assistant':
            converted.append(AIMessage(content=m.content))
    return converted

# -------------------- API Endpoints --------------------


# Add this new temporary endpoint to your backend.py file

@app.get("/debug-schema")
def debug_schema():
    """
    A temporary endpoint to read the exact schema of the checkpoints table.
    """
    try:
        with conn:
            cursor = conn.cursor()
            # This command asks the database to describe the 'checkpoints' table
            cursor.execute("PRAGMA table_info(checkpoints);")
            schema_info = cursor.fetchall()
            
            if not schema_info:
                return {"error": "Could not retrieve schema. The 'checkpoints' table may not exist."}

            # Format the result into a readable JSON
            columns = [
                {"column_index": row[0], "name": row[1], "type": row[2], "can_be_null": not row[3]}
                for row in schema_info
            ]
            return {"table_name": "checkpoints", "schema": columns}
            
    except Exception as e:
        return {"error": str(e), "traceback": traceback.format_exc()}


@app.post("/chat", response_model=List[Message])
def chat_endpoint(request: ChatRequest):
    # <<< CHANGE START: This is the main fix.
    # We no longer pass the whole history. LangGraph's checkpointer handles that.
    # We only pass the NEWEST message from the user.
    
    thread_id = request.thread_id
    CONFIG = {'configurable': {'thread_id': thread_id}}
    
    if not request.messages:
        raise HTTPException(status_code=400, detail="No messages provided.")
        
    # Extract only the last message from the list sent by the frontend
    last_user_message = request.messages[-1]
    if last_user_message.role != 'user':
        raise HTTPException(status_code=400, detail="Last message must be from the user.")

    # Convert just the new message
    new_message_converted = HumanMessage(content=last_user_message.content)
    
    try:
        # Invoke the chatbot with only the new message and the language preference
        # The checkpointer will load the previous messages for this thread_id automatically
        response = chatbot.invoke(
            {
                'messages': [new_message_converted],
                'language': request.language
            }, 
            config=CONFIG
        )
        
        # The graph's response contains the new AI message(s).
        # We find the last AIMessage, which is our reply.
        ai_reply = None
        for msg in reversed(response['messages']):
            if isinstance(msg, AIMessage):
                ai_reply = {"role": "assistant", "content": msg.content}
                break
        
        if ai_reply:
            return [ai_reply]
        else:
            raise HTTPException(status_code=500, detail="AI did not generate a response.")

    except Exception as e:
        logger.error(f"Chat endpoint error for thread {thread_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    # <<< CHANGE END

@app.post("/new_thread", response_model=NewThreadResponse)
def new_thread():
    thread_id = generate_thread_id()
    return NewThreadResponse(thread_id=thread_id)
    
@app.get("/load_thread/{thread_id}", response_model=List[Message])
def load_thread(thread_id: str):
    try:
        state = chatbot.get_state(config={'configurable': {'thread_id': thread_id}})
        
        # State can be None if thread doesn't exist
        if not state:
            return []
            
        messages = state.values.get('messages', [])
        formatted = []
        for msg in messages:
            if isinstance(msg, HumanMessage):
                role = 'user'
            elif isinstance(msg, AIMessage):
                role = 'assistant'
            # We don't need to send the system message to the frontend
            elif isinstance(msg, SystemMessage):
                continue
            else:
                continue
            formatted.append({'role': role, 'content': msg.content})
        return formatted
    except Exception as e:
        # Catch cases where the thread might not exist in the checkpointer
        logger.error(f"Could not load thread {thread_id}: {e}")
        return []

# ... (The rest of your endpoints like /voice_query, /documents, etc., are fine and remain unchanged) ...
@app.post("/voice_query")
async def voice_query(file: UploadFile = File(...), language: str = Form("Malayalam")):
    """
    Accepts a voice query (audio file), transcribes it, and returns RAG chatbot answer.
    """
    try:
        # Save uploaded audio to temp file
        with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as temp_audio:
            shutil.copyfileobj(file.file, temp_audio)
            temp_audio_path = temp_audio.name

        # Transcribe audio
        recognizer = sr.Recognizer()
        with sr.AudioFile(temp_audio_path) as source:
            audio_data = recognizer.record(source)
            # Use Malayalam or selected language
            lang_code = {
                "Malayalam": "ml-IN", "English": "en-US", "Hindi": "hi-IN", "Spanish": "es-ES", "French": "fr-FR", "German": "de-DE", "Chinese": "zh-CN", "Arabic": "ar-SA"
            }.get(language, "ml-IN")
            try:
                query_text = recognizer.recognize_google(audio_data, language=lang_code)
            except sr.UnknownValueError:
                os.remove(temp_audio_path)
                raise HTTPException(status_code=400, detail="Google Speech Recognition could not understand audio")
            except sr.RequestError as e:
                os.remove(temp_audio_path)
                raise HTTPException(status_code=503, detail=f"Could not request results from Google Speech Recognition service; {e}")
            # <<< CHANGE END

        os.remove(temp_audio_path)

        # Pass transcribed text to RAG chatbot
        # Use a new thread for each voice query (or you can use session)
        thread_id = str(uuid.uuid4())
        messages = [HumanMessage(content=query_text)]
        CONFIG = {'configurable': {'thread_id': thread_id}}
        response = chatbot.invoke({'messages': messages, 'language': language}, config=CONFIG)
        
        ai_messages = response['messages']
        # Find the last AI message in the response
        answer = "No answer generated."
        for msg in reversed(ai_messages):
            if isinstance(msg, AIMessage):
                answer = msg.content
                break
        return {"transcription": query_text}
    except Exception as e:
        # Clean up temp file in case of an early error
        if 'temp_audio_path' in locals() and os.path.exists(temp_audio_path):
            os.remove(temp_audio_path)
        logger.error(f"Voice query processing failed: {e}")
        raise HTTPException(status_code=500, detail=f"Voice query failed: {str(e)}")

@app.get("/threads", response_model=ThreadListResponse)
def get_all_threads():
    threads = retrieve_all_threads()
    return ThreadListResponse(threads=threads)
    
@app.get("/documents", response_model=DocumentListResponse)
def get_documents():
    """Get list of documents in the knowledge base"""
    try:
        documents_folder = "documents"
        if os.path.exists(documents_folder):
            documents = [f for f in os.listdir(documents_folder) if os.path.isfile(os.path.join(documents_folder, f))]
            return DocumentListResponse(documents=documents)
        return DocumentListResponse(documents=[])
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/processing_status", response_model=ProcessingStatusResponse)
def get_processing_status():
    """Get the status of document processing"""
    try:
        documents_folder = "documents"
        total_docs = 0
        if os.path.exists(documents_folder):
            total_docs = len([f for f in os.listdir(documents_folder) if os.path.isfile(os.path.join(documents_folder, f))])
        
        # Get chunk count from Pinecone if available
        processed_chunks = 0
        if retriever and index_name in pc.list_indexes().names():
            index = pc.Index(index_name)
            stats = index.describe_index_stats()
            processed_chunks = stats.get('total_vector_count', 0)
        
        return ProcessingStatusResponse(total_documents=total_docs, processed_chunks=processed_chunks)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/predict-disease/")
async def predict_disease(file: UploadFile = File(...)):
    try:
        temp_file_path = f"temp_{file.filename}"
        with open(temp_file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        pipeline = PredictionPipeline(temp_file_path)
        result = pipeline.predict()

        os.remove(temp_file_path)
        
        # Ensure result has the expected structure
        if result and isinstance(result, list) and "image" in result[0]:
            return {"prediction": result[0]["image"], "probabilities": result[0].get("probabilities")}
        else:
            return {"error": "Prediction result in unexpected format."}
            
    except Exception as e:
        logger.error(f"Prediction error: {e}")
        # Clean up temp file in case of error
        if 'temp_file_path' in locals() and os.path.exists(temp_file_path):
            os.remove(temp_file_path)
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)