import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, MicOff, Bot, User, Plus } from 'lucide-react';
import { VOICE_LANGUAGES, LANGUAGES } from '../utils/constants';
import { chatService } from '../services';
import VoiceRecorder from '../components/VoiceRecorder';

const ChatbotPage = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [language, setLanguage] = useState('English');
  const [voiceLanguage, setVoiceLanguage] = useState('Malayalam');
  const [isLoading, setIsLoading] = useState(false);
  const [knowledgeBaseStatus, setKnowledgeBaseStatus] = useState({
    total_documents: 0,
    processed_chunks: 0
  });
  const [threads, setThreads] = useState([]);
  const [currentThreadId, setCurrentThreadId] = useState('default-thread');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize with welcome message
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([{
        role: 'assistant',
        content: "Hello! I'm your AI farming assistant. How can I help you today?",
        timestamp: new Date().toISOString()
      }]);
    }
  }, []);

  // Load knowledge base status
  useEffect(() => {
    const loadKnowledgeBaseStatus = async () => {
      try {
        const response = await fetch('http://localhost:8000/processing_status');
        if (response.ok) {
          const status = await response.json();
          setKnowledgeBaseStatus(status);
        }
      } catch (error) {
        console.error('Failed to load knowledge base status:', error);
      }
    };

    loadKnowledgeBaseStatus();
    const interval = setInterval(loadKnowledgeBaseStatus, 10000); // Check every 10 seconds
    return () => clearInterval(interval);
  }, []);

  // Load threads
  useEffect(() => {
    const loadThreads = async () => {
      try {
        const threadsData = await chatService.getAllThreads();
        setThreads(threadsData);
      } catch (error) {
        console.error('Failed to load threads:', error);
      }
    };

    loadThreads();
  }, []);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = {
      role: 'user',
      content: inputMessage.trim(),
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Real API call to your backend
      // Convert messages to only include role and content (not timestamp)
      const apiMessages = [...messages, userMessage].map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      const response = await fetch('http://localhost:8000/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          thread_id: currentThreadId,
          messages: apiMessages,
          language: language
        })
      });

      if (response.ok) {
        const aiMessages = await response.json();
        if (aiMessages && aiMessages.length > 0) {
          aiMessages.forEach(msg => {
            const messageWithTimestamp = {
              ...msg,
              timestamp: new Date().toISOString()
            };
            setMessages(prev => [...prev, messageWithTimestamp]);
          });
        }
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      const errorMessage = {
        role: 'assistant',
        content: `Failed to send message: ${error.message}. Please check if the backend server is running on http://localhost:8000`,
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleNewChat = () => {
    setMessages([{
      role: 'assistant',
      content: "Hello! I'm your AI farming assistant. How can I help you today?",
      timestamp: new Date().toISOString()
    }]);
    setCurrentThreadId('default-thread');
  };

  const handleVoiceQuery = async (audioFile, language) => {
    try {
      setIsLoading(true);
      console.log('Sending voice query with file:', audioFile.name, audioFile.type, audioFile.size, 'bytes');
      
      const result = await chatService.sendVoiceQuery(audioFile, language);
      console.log('Voice query result:', result);
      
      if (result.answer) {
        // Add transcription as user message
        const userMessage = {
          role: 'user',
          content: `🎤 ${result.transcription || 'Voice query'}`,
          timestamp: new Date().toISOString(),
        };
        
        // Add AI response
        const aiMessage = {
          role: 'assistant',
          content: result.answer,
          timestamp: new Date().toISOString(),
        };
        
        setMessages(prev => [...prev, userMessage, aiMessage]);
      }
    } catch (error) {
      console.error('Voice query failed:', error);
      const errorMessage = {
        role: 'assistant',
        content: `Sorry, I couldn't process your voice query. Error: ${error.message}`,
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = () => {
    const { total_documents, processed_chunks } = knowledgeBaseStatus;
    if (total_documents > 0 && processed_chunks > 0) return 'text-green-600';
    if (total_documents > 0) return 'text-yellow-600';
    return 'text-gray-500';
  };

  const getStatusText = () => {
    const { total_documents, processed_chunks } = knowledgeBaseStatus;
    if (total_documents > 0 && processed_chunks > 0) return '🟢 Ready';
    if (total_documents > 0) return '🟠 Processing...';
    return '⚪ No documents';
  };

  const quickQuestions = [
    "What crops should I plant this season?",
    "How do I identify plant diseases?",
    "What's the best irrigation schedule?",
    "How to improve soil quality?"
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto h-screen flex flex-col">
        {/* Header */}
        <div className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">KisanSewa AI Assistant</h1>
                <p className="text-sm text-green-600 flex items-center">
                  <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
                  Online
                </p>
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-4 text-sm text-gray-600">
              <span>Powered by AI</span>
              <div className="w-px h-4 bg-gray-300"></div>
              <span>24/7 Support</span>
            </div>
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex">
          {/* Main Chat */}
          <div className="flex-1 flex flex-col">
            {/* Messages Container */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex items-start space-x-3 ${
                    message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                  }`}
                >
                  {/* Avatar */}
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    message.role === 'user' 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-green-500 text-white'
                  }`}>
                    {message.role === 'user' ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
                  </div>
                  
                  {/* Message Content */}
                  <div className={`max-w-xs md:max-w-md lg:max-w-lg ${
                    message.role === 'user' ? 'text-right' : 'text-left'
                  }`}>
                    <div className={`rounded-2xl px-4 py-3 shadow-sm ${
                      message.role === 'user'
                        ? 'bg-blue-500 text-white rounded-br-md'
                        : 'bg-white border border-gray-200 text-gray-900 rounded-bl-md'
                    }`}>
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                    </div>
                    <p className="text-xs text-gray-500 mt-1 px-2">
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}

              {/* Typing Indicator */}
              {isLoading && (
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                  <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="bg-white border-t border-gray-200 p-6">
              <div className="flex items-end space-x-3">
                <div className="flex-1">
                  <div className="relative">
                    <textarea
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Type your farming question here..."
                      rows={1}
                      className="w-full resize-none border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                      style={{
                        minHeight: '48px',
                        maxHeight: '120px'
                      }}
                    />
                  </div>
                </div>
                <button
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim() || isLoading}
                  className="bg-green-500 hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed text-white p-3 rounded-lg transition-colors flex-shrink-0"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="hidden lg:block w-80 bg-white border-l border-gray-200">
            <div className="p-6">
              {/* New Chat Button */}
              <button
                onClick={handleNewChat}
                className="w-full flex items-center justify-center px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors mb-6"
              >
                <Plus size={16} className="mr-2" />
                New Chat
              </button>

              {/* Language Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Response Language
                </label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  {LANGUAGES.map(lang => (
                    <option key={lang} value={lang}>{lang}</option>
                  ))}
                </select>
              </div>

              {/* Quick Questions */}
              <h3 className="font-semibold text-gray-900 mb-4">Quick Questions</h3>
              <div className="space-y-2 mb-6">
                {quickQuestions.map((question, index) => (
                  <button
                    key={index}
                    onClick={() => setInputMessage(question)}
                    className="w-full text-left p-3 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors border border-gray-200 hover:border-green-300"
                  >
                    {question}
                  </button>
                ))}
              </div>

              {/* Knowledge Base Status */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-4">📚 Knowledge Base</h3>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                  <details className="cursor-pointer">
                    <summary className="text-sm font-medium text-gray-700 mb-2">System Status</summary>
                    <div className="mt-2 space-y-2">
                      <div className={`text-sm ${getStatusColor()}`}>
                        {getStatusText()}
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="font-medium text-gray-700">Documents</span>
                          <div className="text-lg font-bold text-gray-900">
                            {knowledgeBaseStatus.total_documents}
                          </div>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Chunks</span>
                          <div className="text-lg font-bold text-gray-900">
                            {knowledgeBaseStatus.processed_chunks}
                          </div>
                        </div>
                      </div>
                    </div>
                  </details>
                </div>
              </div>

              {/* Voice Input Section */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-4">🎤 Voice Input</h3>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-sm text-blue-700 mb-3">
                    Record your question and get instant advice in Malayalam or other languages.
                  </p>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Speech Language
                      </label>
                      <select
                        value={voiceLanguage}
                        onChange={(e) => setVoiceLanguage(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {VOICE_LANGUAGES.map(lang => (
                          <option key={lang} value={lang}>{lang}</option>
                        ))}
                      </select>
                    </div>
                    
                    <VoiceRecorder 
                      onVoiceQuery={handleVoiceQuery}
                      voiceLanguage={voiceLanguage}
                      disabled={isLoading}
                    />
                  </div>
                </div>
              </div>

              {/* Features */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-4">Features</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-green-600 text-sm">🌱</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Crop Advice</p>
                      <p className="text-xs text-gray-600">Get personalized recommendations</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 text-sm">🔍</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Disease Detection</p>
                      <p className="text-xs text-gray-600">AI-powered plant analysis</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                      <span className="text-purple-600 text-sm">🎤</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Voice Support</p>
                      <p className="text-xs text-gray-600">Speak your questions</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatbotPage;
