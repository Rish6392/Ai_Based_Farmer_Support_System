// Constants used throughout the application

export const API_ENDPOINTS = {
  CHAT: '/chat',
  THREADS: '/threads',
  NEW_THREAD: '/new_thread',
  LOAD_THREAD: '/load_thread',
  VOICE_QUERY: '/voice_query',
  DOCUMENTS: '/documents',
  PROCESSING_STATUS: '/processing_status',
  UPLOAD_DOCUMENT: '/upload_document',
  PREDICT_DISEASE: '/api/predict-disease/',
  SYNC_DOCUMENTS: '/sync_documents',
  REINDEX_DOCUMENTS: '/reindex_documents'
};

export const LANGUAGES = [
  'English',
  'Malayalam', 
  'Hindi',
  'Spanish',
  'French',
  'German',
  'Chinese',
  'Arabic'
];

export const VOICE_LANGUAGES = [
  'Malayalam',
  'English',
  'Hindi',
  'Spanish',
  'French',
  'German',
  'Chinese',
  'Arabic'
];

export const SUPPORTED_FILE_TYPES = {
  IMAGES: ['jpg', 'jpeg', 'png'],
  DOCUMENTS: ['pdf', 'doc', 'docx', 'txt', 'md']
};

export const FILE_SIZE_LIMITS = {
  IMAGE: 10 * 1024 * 1024, // 10MB
  DOCUMENT: 50 * 1024 * 1024 // 50MB
};

export const MESSAGE_ROLES = {
  USER: 'user',
  ASSISTANT: 'assistant',
  SYSTEM: 'system'
};

export const PROCESSING_STATUS = {
  READY: 'ready',
  PROCESSING: 'processing',
  EMPTY: 'empty',
  ERROR: 'error'
};
