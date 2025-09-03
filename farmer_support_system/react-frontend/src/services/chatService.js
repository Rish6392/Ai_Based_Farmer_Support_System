import api from './api';

// Chat service functions
export const chatService = {
  // Get all threads
  getAllThreads: async () => {
    try {
      const response = await api.get('/threads');
      return response.data.threads || [];
    } catch (error) {
      console.error('Failed to fetch threads:', error);
      throw new Error('Failed to fetch threads');
    }
  },

  // Create new thread
  createNewThread: async () => {
    try {
      const response = await api.post('/new_thread');
      return response.data.thread_id;
    } catch (error) {
      console.error('Failed to create new thread:', error);
      throw new Error('Failed to create new thread');
    }
  },

  // Load thread messages
  loadThread: async (threadId) => {
    try {
      const response = await api.get(`/load_thread/${threadId}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to load thread ${threadId}:`, error);
      throw new Error(`Failed to load thread ${threadId}`);
    }
  },

  // Send message to chat
  sendMessage: async (threadId, messages, language = 'English') => {
    try {
      const payload = {
        thread_id: threadId,
        messages: messages,
        language: language
      };
      const response = await api.post('/chat', payload);
      return response.data;
    } catch (error) {
      console.error('Failed to send message:', error);
      throw new Error('Failed to send message');
    }
  },

  // Send voice query
  sendVoiceQuery: async (audioFile, language = 'Malayalam') => {
    try {
      const formData = new FormData();
      formData.append('file', audioFile);
      formData.append('language', language);
      
      const response = await api.post('/voice_query', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Voice query failed:', error);
      throw new Error('Voice query failed');
    }
  }
};
