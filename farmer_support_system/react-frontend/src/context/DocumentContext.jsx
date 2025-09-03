import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { documentService } from '../services';

// Initial state
const initialState = {
  documents: [],
  processingStatus: {
    total_documents: 0,
    processed_chunks: 0
  },
  loading: false,
  error: null,
};

// Action types
const ActionTypes = {
  SET_DOCUMENTS: 'SET_DOCUMENTS',
  SET_PROCESSING_STATUS: 'SET_PROCESSING_STATUS',
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
};

// Reducer
const documentReducer = (state, action) => {
  switch (action.type) {
    case ActionTypes.SET_DOCUMENTS:
      return { ...state, documents: action.payload };
    case ActionTypes.SET_PROCESSING_STATUS:
      return { ...state, processingStatus: action.payload };
    case ActionTypes.SET_LOADING:
      return { ...state, loading: action.payload };
    case ActionTypes.SET_ERROR:
      return { ...state, error: action.payload };
    case ActionTypes.CLEAR_ERROR:
      return { ...state, error: null };
    default:
      return state;
  }
};

// Context
const DocumentContext = createContext();

// Provider component
export const DocumentProvider = ({ children }) => {
  const [state, dispatch] = useReducer(documentReducer, initialState);

  // Load initial data
  useEffect(() => {
    loadDocuments();
    loadProcessingStatus();
  }, []);

  const loadDocuments = async () => {
    try {
      const documents = await documentService.getDocuments();
      dispatch({ type: ActionTypes.SET_DOCUMENTS, payload: documents });
    } catch (error) {
      dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
    }
  };

  const loadProcessingStatus = async () => {
    try {
      const status = await documentService.getProcessingStatus();
      dispatch({ type: ActionTypes.SET_PROCESSING_STATUS, payload: status });
    } catch (error) {
      console.error('Failed to load processing status:', error);
    }
  };

  const uploadDocument = async (file) => {
    try {
      dispatch({ type: ActionTypes.SET_LOADING, payload: true });
      await documentService.uploadDocument(file);
      
      // Refresh documents and status
      await loadDocuments();
      await loadProcessingStatus();
    } catch (error) {
      dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
      throw error;
    } finally {
      dispatch({ type: ActionTypes.SET_LOADING, payload: false });
    }
  };

  const syncDocuments = async () => {
    try {
      dispatch({ type: ActionTypes.SET_LOADING, payload: true });
      await documentService.syncDocuments();
      
      // Refresh status
      await loadProcessingStatus();
    } catch (error) {
      dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
      throw error;
    } finally {
      dispatch({ type: ActionTypes.SET_LOADING, payload: false });
    }
  };

  const reindexDocuments = async () => {
    try {
      dispatch({ type: ActionTypes.SET_LOADING, payload: true });
      await documentService.reindexDocuments();
      
      // Refresh documents and status
      await loadDocuments();
      await loadProcessingStatus();
    } catch (error) {
      dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
      throw error;
    } finally {
      dispatch({ type: ActionTypes.SET_LOADING, payload: false });
    }
  };

  const clearError = () => {
    dispatch({ type: ActionTypes.CLEAR_ERROR });
  };

  const value = {
    ...state,
    loadDocuments,
    loadProcessingStatus,
    uploadDocument,
    syncDocuments,
    reindexDocuments,
    clearError,
  };

  return (
    <DocumentContext.Provider value={value}>
      {children}
    </DocumentContext.Provider>
  );
};

// Hook to use document context
export const useDocuments = () => {
  const context = useContext(DocumentContext);
  if (!context) {
    throw new Error('useDocuments must be used within a DocumentProvider');
  }
  return context;
};
