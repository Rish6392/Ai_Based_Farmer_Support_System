import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, MicOff, Bot, User, Plus, Volume2 } from 'lucide-react';
import { VOICE_LANGUAGES, LANGUAGES } from '../utils/constants';
import { chatService } from '../services';
import VoiceRecorder from '../components/VoiceRecorder';
import ReactMarkdown from 'react-markdown';

// Typing animation component for AI messages
const TypingMessage = ({ content, isTyping, onTypingComplete }) => {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [hasCompleted, setHasCompleted] = useState(false);
  const typingIntervalRef = useRef(null);

  useEffect(() => {
    // Clear any existing interval
    if (typingIntervalRef.current) {
      clearInterval(typingIntervalRef.current);
    }

    // If not typing or already completed, show full content immediately
    if (!isTyping || hasCompleted) {
      setDisplayedText(content);
      setCurrentIndex(content.length);
      return;
    }

    // Reset state for new typing animation
    setDisplayedText('');
    setCurrentIndex(0);
    setHasCompleted(false);

    // Start typing animation with a small delay
    const startDelay = setTimeout(() => {
      typingIntervalRef.current = setInterval(() => {
        setCurrentIndex((prevIndex) => {
          const nextIndex = prevIndex + 1;
          
          if (nextIndex > content.length) {
            clearInterval(typingIntervalRef.current);
            setHasCompleted(true);
            onTypingComplete && onTypingComplete();
            return content.length;
          }

          setDisplayedText(content.substring(0, nextIndex));
          return nextIndex;
        });
      }, 10); // Changed from 30ms to 10ms for 3x faster typing speed
    }, 100);

    return () => {
      clearTimeout(startDelay);
      if (typingIntervalRef.current) {
        clearInterval(typingIntervalRef.current);
      }
    };
  }, [content, isTyping]); // Removed onTypingComplete from dependencies to prevent loops

  return (
    <div className="whitespace-pre-wrap text-sm leading-relaxed">
      <ReactMarkdown
        components={{
          // Custom styling for markdown elements
          p: ({ children }) => <p className="mb-2 last:mb-0 text-sm leading-relaxed">{children}</p>,
          strong: ({ children }) => <strong className="font-semibold text-green-700">{children}</strong>,
          em: ({ children }) => <em className="italic text-gray-700">{children}</em>,
          ul: ({ children }) => <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal list-inside mb-2 space-y-1">{children}</ol>,
          li: ({ children }) => <li className="text-sm">{children}</li>,
          code: ({ children }) => <code className="bg-gray-100 px-1 py-0.5 rounded text-xs font-mono">{children}</code>,
          h1: ({ children }) => <h1 className="text-lg font-bold mb-2 text-green-800">{children}</h1>,
          h2: ({ children }) => <h2 className="text-base font-bold mb-2 text-green-700">{children}</h2>,
          h3: ({ children }) => <h3 className="text-sm font-bold mb-1 text-green-600">{children}</h3>,
        }}
      >
        {displayedText}
      </ReactMarkdown>
      {isTyping && !hasCompleted && currentIndex < content.length && (
        <span className="animate-pulse text-green-400 ml-1 font-bold">|</span>
      )}
    </div>
  );
};

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
  const [typingMessageIndex, setTypingMessageIndex] = useState(null); // Track which message is typing
  const [playingAudio, setPlayingAudio] = useState(null); // Track which message is playing audio
  const [ttsLoading, setTtsLoading] = useState({}); // Track TTS loading state per message
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
      const welcomeMessage = {
        role: 'assistant',
        content: "Hello! I'm your AI farming assistant. How can I help you today?",
        timestamp: new Date().toISOString()
      };
      setMessages([welcomeMessage]);
      
      // Start typing animation after message is set
      setTimeout(() => {
        setTypingMessageIndex(0);
      }, 30);
    }
  }, []);

  // Load knowledge base status
  useEffect(() => {
    const loadKnowledgeBaseStatus = async () => {
      try {
        const status = await chatService.getProcessingStatus();
        setKnowledgeBaseStatus(status);
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

  const handleSendMessage = async (messageText = null, currentMessages = null, manageLoading = true) => {
    const messageToSend = messageText || inputMessage.trim();
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
      setInputMessage('');
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

      const aiMessages = await chatService.sendMessage(currentThreadId, apiMessages, language);
      
      if (aiMessages && aiMessages.length > 0) {
        // Add all AI messages first
        const newAIMessages = aiMessages.map(msg => ({
          ...msg,
          timestamp: new Date().toISOString()
        }));

        setMessages(prev => {
          const updatedMessages = [...prev, ...newAIMessages];
          
          // Set typing animation for the last AI message
          const lastAIMessageIndex = updatedMessages.length - 1;
          if (newAIMessages[newAIMessages.length - 1].role === 'assistant') {
            // Use setTimeout to trigger typing after render
            setTimeout(() => {
              setTypingMessageIndex(lastAIMessageIndex);
            }, 20);
          }
          
          return updatedMessages;
        });
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      const errorMessage = {
        role: 'assistant',
        content: `Failed to send message: ${error.message}. Please check if the backend server is running on http://localhost:8000`,
        timestamp: new Date().toISOString()
      };
      setMessages(prev => {
        const newMessages = [...prev, errorMessage];
        
        // Start typing animation for error message
        setTimeout(() => {
          setTypingMessageIndex(newMessages.length - 1);
        }, 20);
        
        return newMessages;
      });
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
    const welcomeMessage = {
      role: 'assistant',
      content: "Hello! I'm your AI farming assistant. How can I help you today?",
      timestamp: new Date().toISOString()
    };
    setMessages([welcomeMessage]);
    setCurrentThreadId('default-thread');
    
    // Start typing animation for new welcome message
    setTimeout(() => {
      setTypingMessageIndex(0);
    }, 10);
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
        
        // Update messages with user message first
        setMessages(prev => {
          const newMessages = [...prev, userMessage];
          
          // Now send the transcription through normal chat flow (like Streamlit)
          // Don't let handleSendMessage manage loading since we're managing it here
          handleSendMessage(transcriptionText, newMessages, false);
          
          return newMessages;
        });
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
        
        setMessages(prev => {
          const newMessages = [...prev, userMessage, aiMessage];
          
          // Start typing animation for AI response
          setTimeout(() => {
            setTypingMessageIndex(newMessages.length - 1);
          }, 10);
          
          return newMessages;
        });
      }
    } catch (error) {
      console.error('Voice query failed:', error);
      const errorMessage = {
        role: 'assistant',
        content: `Sorry, I couldn't process your voice query. Error: ${error.message}`,
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => {
        const newMessages = [...prev, errorMessage];
        
        // Start typing animation for error message
        setTimeout(() => {
          setTypingMessageIndex(newMessages.length - 1);
        }, 10);
        
        return newMessages;
      });
    } finally {
      setIsLoading(false);
    }
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
    <div className="bg-gray-50" style={{ height: '100vh', display: 'grid', gridTemplateRows: 'auto 1fr' }}>
      <div className="flex flex-col" style={{ height: '100vh' }}>
        {/* Header */}


        {/* Chat Area */}
        <div style={{ height: 'calc(100vh - 80px)', display: 'flex' }}>
          {/* Main Chat */}
          <div className="flex-1" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            {/* Messages Container */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4" style={{ height: 'calc(100% - 100px)' }}>
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
                      {message.role === 'assistant' ? (
                        <TypingMessage
                          content={message.content}
                          isTyping={typingMessageIndex === index}
                          onTypingComplete={() => setTypingMessageIndex(null)}
                        />
                      ) : (
                        <ReactMarkdown
                          components={{
                            p: ({ children }) => <p className="text-sm leading-relaxed mb-2 last:mb-0">{children}</p>,
                            strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                            em: ({ children }) => <em className="italic">{children}</em>,
                            ul: ({ children }) => <ul className="list-disc list-inside space-y-1">{children}</ul>,
                            ol: ({ children }) => <ol className="list-decimal list-inside space-y-1">{children}</ol>,
                            li: ({ children }) => <li className="text-sm">{children}</li>,
                            code: ({ children }) => <code className="bg-blue-400 bg-opacity-50 px-1 py-0.5 rounded text-xs font-mono">{children}</code>,
                          }}
                        >
                          {message.content}
                        </ReactMarkdown>
                      )}
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-xs text-gray-500 px-2">
                        {new Date(message.timestamp).toLocaleTimeString()}
                      </p>
                      
                      {/* Read Aloud Button for Assistant Messages */}
                      {message.role === 'assistant' && (
                        <button
                          onClick={() => handleTextToSpeech(message.content, index)}
                          disabled={ttsLoading[index] || typingMessageIndex === index}
                          className="ml-2 p-1 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Read aloud"
                        >
                          {ttsLoading[index] ? (
                            <div className="w-4 h-4 border-2 border-gray-300 border-t-green-600 rounded-full animate-spin"></div>
                          ) : (
                            <Volume2 className="w-4 h-4" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {/* Thinking Indicator - Only show when waiting for API response, not during typing */}
              {isLoading && typingMessageIndex === null && (
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
            <div className="bg-white border-t border-gray-200 p-6" style={{ height: '100px', flexShrink: 0 }}>
              <div className="flex items-end space-x-3">
                <div className="flex-1">
                  <div className="relative">
                    <textarea
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Type your farming question here..."
                      rows={1}
                      disabled={isLoading}
                      className="w-full resize-none border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
          <div className="hidden lg:flex w-80 bg-white border-l border-gray-200 flex-col" style={{ height: '100%' }}>
            <div 
              className="flex-1 overflow-y-auto p-6 pb-8"
              style={{
                scrollbarWidth: 'thin',
                scrollbarColor: '#cbd5e0 #f7fafc',
                height: '100%'
              }}
            >
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
