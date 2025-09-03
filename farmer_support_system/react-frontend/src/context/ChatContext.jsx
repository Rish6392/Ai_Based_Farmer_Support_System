import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { chatService } from '../services';

// Initial state
const initialState = {
  currentThreadId: null,
  messageHistory: [],
  chatThreads: [],
  language: 'English',
  loading: false,
  error: null,
  pendingInput: null,
};

// Action types
const ActionTypes = {
  SET_CURRENT_THREAD: 'SET_CURRENT_THREAD',
  SET_MESSAGE_HISTORY: 'SET_MESSAGE_HISTORY',
  ADD_MESSAGE: 'ADD_MESSAGE',
  ADD_MESSAGES: 'ADD_MESSAGES',
  SET_CHAT_THREADS: 'SET_CHAT_THREADS',
  SET_LANGUAGE: 'SET_LANGUAGE',
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  SET_PENDING_INPUT: 'SET_PENDING_INPUT',
  CLEAR_ERROR: 'CLEAR_ERROR',
};

// Reducer
const chatReducer = (state, action) => {
  switch (action.type) {
    case ActionTypes.SET_CURRENT_THREAD:
      return { ...state, currentThreadId: action.payload };
    case ActionTypes.SET_MESSAGE_HISTORY:
      return { ...state, messageHistory: action.payload };
    case ActionTypes.ADD_MESSAGE:
      return { 
        ...state, 
        messageHistory: [...state.messageHistory, action.payload] 
      };
    case ActionTypes.ADD_MESSAGES:
      return { 
        ...state, 
        messageHistory: [...state.messageHistory, ...action.payload] 
      };
    case ActionTypes.SET_CHAT_THREADS:
      return { ...state, chatThreads: action.payload };
    case ActionTypes.SET_LANGUAGE:
      return { ...state, language: action.payload };
    case ActionTypes.SET_LOADING:
      return { ...state, loading: action.payload };
    case ActionTypes.SET_ERROR:
      return { ...state, error: action.payload };
    case ActionTypes.SET_PENDING_INPUT:
      return { ...state, pendingInput: action.payload };
    case ActionTypes.CLEAR_ERROR:
      return { ...state, error: null };
    default:
      return state;
  }
};

// Context
const ChatContext = createContext();

// Provider component
export const ChatProvider = ({ children }) => {
  const [state, dispatch] = useReducer(chatReducer, initialState);

  // Initialize on mount
  useEffect(() => {
    initializeChat();
  }, []);

  const initializeChat = async () => {
    try {
      dispatch({ type: ActionTypes.SET_LOADING, payload: true });
      
      // Get existing threads
      const threads = await chatService.getAllThreads();
      dispatch({ type: ActionTypes.SET_CHAT_THREADS, payload: threads });
      
      // Create new thread if no threads exist
      if (threads.length === 0) {
        const newThreadId = await chatService.createNewThread();
        dispatch({ type: ActionTypes.SET_CURRENT_THREAD, payload: newThreadId });
        dispatch({ type: ActionTypes.SET_CHAT_THREADS, payload: [newThreadId] });
      } else {
        // Use the first thread as current
        dispatch({ type: ActionTypes.SET_CURRENT_THREAD, payload: threads[0] });
        // Load thread messages
        const messages = await chatService.loadThread(threads[0]);
        dispatch({ type: ActionTypes.SET_MESSAGE_HISTORY, payload: messages });
      }
    } catch (error) {
      dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
    } finally {
      dispatch({ type: ActionTypes.SET_LOADING, payload: false });
    }
  };

  const createNewThread = async () => {
    try {
      dispatch({ type: ActionTypes.SET_LOADING, payload: true });
      const newThreadId = await chatService.createNewThread();
      dispatch({ type: ActionTypes.SET_CURRENT_THREAD, payload: newThreadId });
      dispatch({ type: ActionTypes.SET_MESSAGE_HISTORY, payload: [] });
      
      // Update threads list
      const threads = await chatService.getAllThreads();
      dispatch({ type: ActionTypes.SET_CHAT_THREADS, payload: threads });
    } catch (error) {
      dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
    } finally {
      dispatch({ type: ActionTypes.SET_LOADING, payload: false });
    }
  };

  const loadThread = async (threadId) => {
    try {
      dispatch({ type: ActionTypes.SET_LOADING, payload: true });
      const messages = await chatService.loadThread(threadId);
      dispatch({ type: ActionTypes.SET_CURRENT_THREAD, payload: threadId });
      dispatch({ type: ActionTypes.SET_MESSAGE_HISTORY, payload: messages });
    } catch (error) {
      dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
    } finally {
      dispatch({ type: ActionTypes.SET_LOADING, payload: false });
    }
  };

  const sendMessage = async (message) => {
    try {
      dispatch({ type: ActionTypes.SET_LOADING, payload: true });
      
      // Add user message immediately
      const userMessage = { role: 'user', content: message };
      dispatch({ type: ActionTypes.ADD_MESSAGE, payload: userMessage });
      
      // Prepare messages for API
      const allMessages = [...state.messageHistory, userMessage];
      
      // Send to API
      const aiMessages = await chatService.sendMessage(
        state.currentThreadId,
        allMessages,
        state.language
      );
      
      // Add AI responses
      dispatch({ type: ActionTypes.ADD_MESSAGES, payload: aiMessages });
    } catch (error) {
      dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
    } finally {
      dispatch({ type: ActionTypes.SET_LOADING, payload: false });
    }
  };

  const sendVoiceQuery = async (audioFile, voiceLanguage) => {
    try {
      dispatch({ type: ActionTypes.SET_LOADING, payload: true });
      const result = await chatService.sendVoiceQuery(audioFile, voiceLanguage);
      
      if (result.answer) {
        dispatch({ type: ActionTypes.SET_PENDING_INPUT, payload: result.answer });
      }
    } catch (error) {
      dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
    } finally {
      dispatch({ type: ActionTypes.SET_LOADING, payload: false });
    }
  };

  const setLanguage = (language) => {
    dispatch({ type: ActionTypes.SET_LANGUAGE, payload: language });
  };

  const clearError = () => {
    dispatch({ type: ActionTypes.CLEAR_ERROR });
  };

  const setPendingInput = (input) => {
    dispatch({ type: ActionTypes.SET_PENDING_INPUT, payload: input });
  };

  const value = {
    ...state,
    createNewThread,
    loadThread,
    sendMessage,
    sendVoiceQuery,
    setLanguage,
    clearError,
    setPendingInput,
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};

// Hook to use chat context
export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};
