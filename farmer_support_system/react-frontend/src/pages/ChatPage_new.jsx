import React, { useState, useRef, useEffect } from 'react';
import { Send, Plus, Mic, MicOff } from 'lucide-react';

const ChatPage = () => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [language, setLanguage] = useState('English');
  const [voiceLanguage, setVoiceLanguage] = useState('Malayalam');
  const [isRecording, setIsRecording] = useState(false);
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
      // Simulate API call
      setTimeout(() => {
        const aiResponse = {
          role: 'assistant',
          content: `Thank you for your question: "${userMessage.content}". I'm here to help with your farming queries.`,
          timestamp: new Date().toISOString()
        };
        setMessages(prev => [...prev, aiResponse]);
        setIsLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Failed to send message:', error);
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

  const handleVoiceRecord = () => {
    setIsRecording(!isRecording);
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
    <div className="flex h-full bg-white">
      {/* Main Chat Area - 3/4 width */}
      <div className="flex-1 flex flex-col mr-4">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Chat Conversation</h2>
        
        {/* Messages Container */}
        <div className="flex-1 border border-gray-200 rounded-lg p-4 overflow-y-auto mb-4">
          {messages.length === 0 && (
            <div className="text-center text-gray-500 mt-8">
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
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                <p className="whitespace-pre-wrap">{message.content}</p>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start mt-4">
              <div className="bg-gray-100 rounded-lg px-4 py-2">
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
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isLoading}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send size={20} />
          </button>
        </div>
      </div>

      {/* Sidebar - 1/4 width */}
      <div className="w-80 flex flex-col space-y-4">
        <h2 className="text-xl font-semibold text-gray-800">Controls</h2>
        
        {/* New Chat Button */}
        <button
          onClick={handleNewChat}
          className="w-full flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          <Plus size={16} className="mr-2" />
          New Chat
        </button>

        {/* Language Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Response Language
          </label>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
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
          <h3 className="text-lg font-medium text-gray-800 mb-2">My Conversations</h3>
          <div className="space-y-1 max-h-48 overflow-y-auto">
            <button className="w-full text-left px-3 py-2 rounded-md text-sm bg-gray-100 text-gray-700 hover:bg-gray-200">
              💬 abcd1234...
            </button>
            <button className="w-full text-left px-3 py-2 rounded-md text-sm bg-gray-100 text-gray-700 hover:bg-gray-200">
              💬 efgh5678...
            </button>
          </div>
        </div>

        <hr className="border-gray-300" />

        {/* Knowledge Base Status */}
        <div>
          <h3 className="text-lg font-medium text-gray-800 mb-2">📚 Knowledge Base</h3>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
            <details className="cursor-pointer">
              <summary className="text-sm font-medium text-gray-700 mb-2">System Status</summary>
              <div className="mt-2 space-y-2">
                <div className={`text-sm ${getStatusColor()}`}>
                  {getStatusText()}
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="font-medium">Documents</span>
                    <div className="text-lg font-bold text-gray-900">
                      {knowledgeBaseStatus.total_documents}
                    </div>
                  </div>
                  <div>
                    <span className="font-medium">Chunks</span>
                    <div className="text-lg font-bold text-gray-900">
                      {knowledgeBaseStatus.processed_chunks}
                    </div>
                  </div>
                </div>
              </div>
            </details>
          </div>
        </div>

        <hr className="border-gray-300" />

        {/* Voice Input Section */}
        <div>
          <h3 className="text-lg font-medium text-gray-800 mb-2">🎤 Voice Input (st-audiorec)</h3>
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              
              <button
                onClick={handleVoiceRecord}
                className={`w-full flex items-center justify-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  isRecording
                    ? 'bg-red-600 text-white hover:bg-red-700'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {isRecording ? (
                  <>
                    <MicOff size={16} className="mr-2" />
                    Stop Recording
                  </>
                ) : (
                  <>
                    <Mic size={16} className="mr-2" />
                    Start Recording
                  </>
                )}
              </button>
              
              {isRecording && (
                <div className="text-center">
                  <div className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-red-100 text-red-800">
                    <div className="w-2 h-2 bg-red-500 rounded-full mr-2 animate-pulse"></div>
                    Recording...
                  </div>
                </div>
              )}
              
              <button
                className="w-full px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 transition-colors"
              >
                Send Voice Query
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
