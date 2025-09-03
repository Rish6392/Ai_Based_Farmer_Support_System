import api from './api';

// Document service functions
export const documentService = {
  // Get all documents
  getDocuments: async () => {
    try {
      const response = await api.get('/documents');
      return response.data.documents || [];
    } catch (error) {
      console.error('Failed to fetch documents:', error);
      throw new Error('Failed to fetch documents');
    }
  },

  // Get processing status
  getProcessingStatus: async () => {
    try {
      const response = await api.get('/processing_status');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch processing status:', error);
      return { total_documents: 0, processed_chunks: 0 };
    }
  },

  // Upload document
  uploadDocument: async (file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await api.post('/upload_document', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Failed to upload document:', error);
      throw new Error('Failed to upload document');
    }
  },

  // Add single document
  addDocument: async (file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await api.post('/add_document', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Failed to add document:', error);
      throw new Error('Failed to add document');
    }
  },

  // Get document status
  getDocumentStatus: async () => {
    try {
      const response = await api.get('/document_status');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch document status:', error);
      throw new Error('Failed to fetch document status');
    }
  },

  // Sync documents
  syncDocuments: async () => {
    try {
      const response = await api.post('/sync_documents');
      return response.data;
    } catch (error) {
      console.error('Failed to sync documents:', error);
      throw new Error('Failed to sync documents');
    }
  },

  // Reindex documents
  reindexDocuments: async () => {
    try {
      const response = await api.post('/reindex_documents');
      return response.data;
    } catch (error) {
      console.error('Failed to reindex documents:', error);
      throw new Error('Failed to reindex documents');
    }
  }
};
