import React, { useState, useEffect, useRef } from 'react';
import { useChat } from '../context/ChatContext';
import { useDocuments } from '../context/DocumentContext';
import { VOICE_LANGUAGES, LANGUAGES } from '../utils/constants';
import { chatService } from '../services';
import Button from '../components/Button';
import Input from '../components/Input';
import Loading from '../components/Loading';
import VoiceRecorder from '../components/VoiceRecorder';
import { Send, Plus, Mic, MicOff } from 'lucide-react';

const ChatPage = () => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [language, setLanguage] = useState('English');
  const [voiceLanguage, setVoiceLanguage] = useState('Malayalam');
  const [isLoading, setIsLoading] = useState(false);
  const [knowledgeBaseStatus, setKnowledgeBaseStatus] = useState({
    total_documents: 0,
    processed_chunks: 0
  });
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage = {
      role: 'user',
      content: inputValue.trim(),
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
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
          thread_id: 'default-thread',
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
    setMessages([]);
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

  return (
    <div className="flex h-full bg-gray-900 text-white">
      {/* Main Chat Area - 3/4 width */}
      <div className="flex-1 flex flex-col px-6 py-4">
        <h2 className="text-xl font-semibold text-white mb-4">Chat Conversation</h2>
        
        {/* Messages Container */}
        <div className="flex-1 bg-gray-800 rounded-lg p-4 overflow-y-auto mb-4 border border-gray-700">
          {messages.length === 0 && (
            <div className="text-center text-gray-400 mt-8">
              <h3 className="text-lg font-medium mb-2">Welcome to Digital Krishi Officer!</h3>
              <p>Ask me anything about farming, crops, or agricultural practices.</p>
            </div>
          )}
          
          {messages.map((message, index) => (
            <div
              key={index}
              className={`mb-4 flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  message.role === 'user'
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-700 text-gray-100'
                }`}
              >
                <p className="whitespace-pre-wrap">{message.content}</p>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start mt-4">
              <div className="bg-gray-700 rounded-lg px-4 py-2">
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
        <div className="flex space-x-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message here..."
            className="flex-1 px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isLoading}
            className="px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send size={20} />
          </button>
        </div>
      </div>

      {/* Sidebar - 1/4 width */}
      <div className="w-80 flex flex-col space-y-4 bg-gray-800 px-4 py-4 border-l border-gray-700">
        <h2 className="text-xl font-semibold text-white">Controls</h2>
        
        {/* New Chat Button */}
        <button
          onClick={handleNewChat}
          className="w-full flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <Plus size={16} className="mr-2" />
          New Chat
        </button>

        {/* Language Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Response Language
          </label>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="English">English</option>
            <option value="Malayalam">Malayalam</option>
            <option value="Hindi">Hindi</option>
            <option value="Spanish">Spanish</option>
            <option value="French">French</option>
            <option value="German">German</option>
            <option value="Chinese">Chinese</option>
            <option value="Arabic">Arabic</option>
          </select>
        </div>

        {/* Conversation Threads */}
        <div>
          <h3 className="text-lg font-medium text-white mb-2">My Conversations</h3>
          <div className="space-y-1 max-h-48 overflow-y-auto">
            <button className="w-full text-left px-3 py-2 rounded-md text-sm bg-gray-700 text-gray-300 hover:bg-gray-600 transition-colors">
              💬 f71d31f0...
            </button>
            <button className="w-full text-left px-3 py-2 rounded-md text-sm bg-gray-700 text-gray-300 hover:bg-gray-600 transition-colors">
              💬 6796d6ee...
            </button>
            <button className="w-full text-left px-3 py-2 rounded-md text-sm bg-gray-700 text-gray-300 hover:bg-gray-600 transition-colors">
              💬 f9419fc7...
            </button>
          </div>
        </div>

        <hr className="border-gray-600" />

        {/* Knowledge Base Status */}
        <div>
          <h3 className="text-lg font-medium text-white mb-2">📚 Knowledge Base</h3>
          <div className="bg-gray-700 border border-gray-600 rounded-lg p-3">
            <details className="cursor-pointer">
              <summary className="text-sm font-medium text-gray-300 mb-2">System Status</summary>
              <div className="mt-2 space-y-2">
                <div className={`text-sm ${getStatusColor()}`}>
                  {getStatusText()}
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="font-medium text-gray-300">Documents</span>
                    <div className="text-lg font-bold text-white">
                      {knowledgeBaseStatus.total_documents}
                    </div>
                  </div>
                  <div>
                    <span className="font-medium text-gray-300">Chunks</span>
                    <div className="text-lg font-bold text-white">
                      {knowledgeBaseStatus.processed_chunks}
                    </div>
                  </div>
                </div>
              </div>
            </details>
          </div>
        </div>

        <hr className="border-gray-600" />

        {/* Voice Input Section */}
        <div>
          <h3 className="text-lg font-medium text-white mb-2">🎤 Voice Input</h3>
          <div className="bg-blue-900 bg-opacity-50 border border-blue-700 rounded-lg p-3">
            <p className="text-sm text-blue-200 mb-3">
              Record your question and get instant advice in Malayalam or other languages.
            </p>
            
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Speech Language
                </label>
                <select
                  value={voiceLanguage}
                  onChange={(e) => setVoiceLanguage(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Malayalam">Malayalam</option>
                  <option value="English">English</option>
                  <option value="Hindi">Hindi</option>
                  <option value="Spanish">Spanish</option>
                  <option value="French">French</option>
                  <option value="German">German</option>
                  <option value="Chinese">Chinese</option>
                  <option value="Arabic">Arabic</option>
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
      </div>
    </div>
  );
};

export default ChatPage;
