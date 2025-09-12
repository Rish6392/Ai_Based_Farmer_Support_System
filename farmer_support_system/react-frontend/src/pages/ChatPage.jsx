import React, { useState, useEffect, useRef } from 'react';
import { chatService } from '../services';
import VoiceRecorder from '../components/VoiceRecorder';
import ChatMessage from '../components/ChatMessage';
import { Send, Plus } from 'lucide-react';

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
  const [ttsLoading, setTtsLoading] = useState({});
  const [playingAudio, setPlayingAudio] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (playingAudio) {
        playingAudio.pause();
        setPlayingAudio(null);
      }
    };
  }, [playingAudio]);

  const handleSendMessage = async (messageText = null, currentMessages = null, manageLoading = true) => {
    const messageToSend = messageText || inputValue.trim();
    const currentMessageList = currentMessages || messages;
    
    if (!messageToSend || isLoading) return;

    // Only create and add user message if messageText is not provided
    // (when messageText is provided, it means the message was already added)
    let userMessage = null;
    let updatedMessages = currentMessageList;
    
    if (!messageText) {
      userMessage = {
        role: 'user',
        content: messageToSend,
        timestamp: new Date().toISOString()
      };
      updatedMessages = [...currentMessageList, userMessage];
      setMessages(updatedMessages);
      setInputValue('');
    }
    
    if (manageLoading) {
      setIsLoading(true);
    }

    try {
      // Real API call to your backend using chatService
      // Convert messages to only include role and content (not timestamp)
      const apiMessages = updatedMessages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      const aiMessages = await chatService.sendMessage('default-thread', apiMessages, language);
      
      if (aiMessages && aiMessages.length > 0) {
        const messagesWithTimestamp = aiMessages.map(msg => ({
          ...msg,
          timestamp: new Date().toISOString()
        }));
        setMessages(prev => [...prev, ...messagesWithTimestamp]);
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
      if (manageLoading) {
        setIsLoading(false);
      }
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

  // Utility function to clean markdown formatting for text-to-speech
  const cleanMarkdownForTTS = (text) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold **text**
      .replace(/\*(.*?)\*/g, '$1') // Remove italic *text*
      .replace(/`(.*?)`/g, '$1') // Remove code `text`
      .replace(/#{1,6}\s/g, '') // Remove headers # ## ###
      .replace(/\[(.*?)\]\(.*?\)/g, '$1') // Remove links [text](url) -> text
      .replace(/^\s*[-*+]\s/gm, '') // Remove list bullets
      .replace(/^\s*\d+\.\s/gm, '') // Remove numbered lists
      .replace(/\n{2,}/g, '. ') // Replace multiple newlines with period and space
      .replace(/\n/g, ' ') // Replace single newlines with space
      .trim();
  };

  const handleTextToSpeech = async (text, messageIndex) => {
    try {
      // Stop any currently playing audio
      if (playingAudio) {
        playingAudio.pause();
        setPlayingAudio(null);
      }

      // Set loading state for this message
      setTtsLoading(prev => ({ ...prev, [messageIndex]: true }));

      // Clean markdown formatting from text before sending to TTS
      const cleanText = cleanMarkdownForTTS(text);

      // Call TTS service
      const result = await chatService.textToSpeech(cleanText, language);
      
      if (result.success && result.audio_data) {
        // Convert base64 to audio blob
        const audioBytes = atob(result.audio_data);
        const audioArray = new Uint8Array(audioBytes.length);
        for (let i = 0; i < audioBytes.length; i++) {
          audioArray[i] = audioBytes.charCodeAt(i);
        }
        const audioBlob = new Blob([audioArray], { type: 'audio/mp3' });
        const audioUrl = URL.createObjectURL(audioBlob);
        
        // Create and play audio
        const audio = new Audio(audioUrl);
        setPlayingAudio(audio);
        
        audio.onended = () => {
          setPlayingAudio(null);
          URL.revokeObjectURL(audioUrl);
        };
        
        audio.onerror = () => {
          console.error('Audio playback failed');
          setPlayingAudio(null);
          URL.revokeObjectURL(audioUrl);
        };
        
        await audio.play();
      }
    } catch (error) {
      console.error('Text-to-speech failed:', error);
      // Could show a toast or error message here
    } finally {
      setTtsLoading(prev => ({ ...prev, [messageIndex]: false }));
    }
  };

  const handleVoiceQuery = async (audioFile, language) => {
    try {
      setIsLoading(true);
      console.log('Sending voice query with file:', audioFile.name, audioFile.type, audioFile.size, 'bytes');
      
      const result = await chatService.sendVoiceQuery(audioFile, language);
      console.log('Voice query result:', result);
      
      if (result.transcription) {
        // Add transcription as user message (like Streamlit version)
        const transcriptionText = result.transcription;
        const userMessage = {
          role: 'user',
          content: `🎤 ${transcriptionText}`,
          timestamp: new Date().toISOString(),
        };
        
        // Add user message first
        const newMessages = [...messages, userMessage];
        setMessages(newMessages);
        
        // Now send the transcription through normal chat flow (like Streamlit)
        // Don't let handleSendMessage manage loading since we're managing it here
        await handleSendMessage(transcriptionText, newMessages, false);
      } else if (result.answer) {
        // Fallback: if no transcription but has answer, use the old flow
        const userMessage = {
          role: 'user',
          content: `🎤 Voice query`,
          timestamp: new Date().toISOString(),
        };
        
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
            <ChatMessage
              key={index}
              message={message}
              index={index}
              onTextToSpeech={handleTextToSpeech}
              ttsLoading={ttsLoading}
              typingMessageIndex={null} // No typing animation in ChatPage
              customStyles={{
                user: 'bg-red-600 text-white',
                assistant: 'bg-gray-700 text-gray-100'
              }}
            />
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
