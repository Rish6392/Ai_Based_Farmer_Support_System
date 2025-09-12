import React, { useState, useRef, useEffect } from 'react';
import { VOICE_LANGUAGES, LANGUAGES } from '../utils/constants';
import { chatService } from '../services';
import { Sidebar, ChatMessage, ChatInput, LoadingIndicator } from '../components';
import { cn } from '../utils/cn';

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
  const [typingMessageIndex, setTypingMessageIndex] = useState(null);
  const [playingAudio, setPlayingAudio] = useState(null);
  const [ttsLoading, setTtsLoading] = useState({});
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize with empty messages for centered input
  // Welcome message will be added after first user message

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
    setMessages([]);
    setCurrentThreadId('default-thread');
    setTypingMessageIndex(null);
    setInputMessage('');
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
    "How to improve soil quality?",
    "Best fertilizers for vegetables?",
    "Organic farming practices?",
    "Pest control methods?",
    "Weather impact on crops?"
  ];

  // Check if we should show centered input (no messages or only welcome message)
  const shouldShowCenteredInput = messages.length === 0 || 
    (messages.length === 1 && messages[0].role === 'assistant' && !messages[0].content.includes('🎤'));

  return (
    <div className="h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex overflow-hidden">
      {/* Sidebar */}
      <Sidebar
        isCollapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        onNewChat={handleNewChat}
        language={language}
        onLanguageChange={setLanguage}
        voiceLanguage={voiceLanguage}
        onVoiceLanguageChange={setVoiceLanguage}
        onVoiceQuery={handleVoiceQuery}
        knowledgeBaseStatus={knowledgeBaseStatus}
        isLoading={isLoading}
        quickQuestions={quickQuestions}
        onQuickQuestionSelect={setInputMessage}
      />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {shouldShowCenteredInput ? (
          // Centered Input Layout (Initial state)
          <div className="flex-1 flex flex-col">
            <ChatInput
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onSend={handleSendMessage}
              onKeyPress={handleKeyPress}
              disabled={isLoading}
              isCentered={true}
            />
          </div>
        ) : (
          // Chat Layout (After first message)
          <>
            {/* Messages Container */}
            <div className="flex-1 overflow-y-auto">
              <div className="max-w-4xl mx-auto">
                {messages.map((message, index) => (
                  <ChatMessage
                    key={index}
                    message={message}
                    index={index}
                    isTyping={typingMessageIndex === index}
                    onTypingComplete={() => setTypingMessageIndex(null)}
                    onTextToSpeech={handleTextToSpeech}
                    ttsLoading={ttsLoading}
                    typingMessageIndex={typingMessageIndex}
                  />
                ))}

                {/* Loading Indicator */}
                {isLoading && typingMessageIndex === null && (
                  <LoadingIndicator />
                )}
                
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Sticky Input at Bottom */}
            <ChatInput
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onSend={handleSendMessage}
              onKeyPress={handleKeyPress}
              disabled={isLoading}
              isCentered={false}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default ChatbotPage;
