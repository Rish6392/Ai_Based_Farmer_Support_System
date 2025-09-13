import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mic, MicOff, Home, ArrowLeft, Volume2, VolumeX } from 'lucide-react';
import VoiceRecorder from '../components/VoiceRecorder';
import { useChat } from '../context/ChatContext';
import chatService from '../services/chatService';

const VoicePage = () => {
  const navigate = useNavigate();
  const { addMessage } = useChat();
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [voiceLanguage, setVoiceLanguage] = useState('Malayalam');
  const [isProcessing, setIsProcessing] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [currentSuggestion, setCurrentSuggestion] = useState('');
  const [error, setError] = useState('');

  // Farming-specific suggestions
  const farmingSuggestions = [
    "What's the best time to plant rice in Kerala?",
    "How to identify pest damage in coconut trees?",
    "Weather forecast for farming today",
    "Organic fertilizer recommendations for vegetables",
    "Disease symptoms in tomato plants",
    "Water management for paddy fields",
    "Best crops for monsoon season", 
    "Soil testing procedures for farmers",
    "Market prices for agricultural products",
    "Government schemes for farmers"
  ];

  const languages = [
    { code: 'Malayalam', name: 'മലയാളം' },
    { code: 'Hindi', name: 'हिन्दी' },
    { code: 'English', name: 'English' },
    { code: 'Tamil', name: 'தமிழ்' },
    { code: 'Telugu', name: 'తెలుగు' },
    { code: 'Kannada', name: 'ಕನ್ನಡ' }
  ];

  // Rotate suggestions every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSuggestion(farmingSuggestions[Math.floor(Math.random() * farmingSuggestions.length)]);
    }, 3000);

    // Set initial suggestion
    setCurrentSuggestion(farmingSuggestions[0]);

    return () => clearInterval(interval);
  }, []);

  const handleVoiceQuery = async (audioFile, language) => {
    try {
      setIsProcessing(true);
      setError('');
      console.log('Processing voice query...', audioFile, language);
      
      // Use the existing chat service to send voice query
      const result = await chatService.sendVoiceQuery(audioFile, language);
      console.log('Voice query result:', result);
      
      // Add voice message to chat context
      addMessage({
        id: Date.now(),
        type: 'user',
        content: `🎤 Voice query`,
        timestamp: new Date()
      });

      // Add response to chat context if available
      if (result.response) {
        addMessage({
          id: Date.now() + 1,
          type: 'assistant',
          content: result.response,
          timestamp: new Date()
        });
      }
      
      setIsProcessing(false);
      // Navigate to chat to see the conversation
      navigate('/chat');
      
    } catch (error) {
      console.error('Voice query failed:', error);
      setError(`Sorry, I couldn't process your voice query. ${error.message}`);
      setIsProcessing(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setTranscript(suggestion);
    // Navigate to chat with the suggestion as a message
    addMessage({
      id: Date.now(),
      type: 'user', 
      content: suggestion,
      timestamp: new Date()
    });
    navigate('/chat');
  };

  const handleGoHome = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-white flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-white/80 backdrop-blur-sm border-b border-gray-200">
        <button 
          onClick={() => navigate(-1)}
          className="p-2 rounded-full hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-gray-700" />
        </button>
        
        {/* Language Selector */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center bg-white rounded-full px-4 py-2 border border-gray-300 shadow-sm">
            <span className="text-blue-600 mr-2">🌐</span>
            <select
              value={voiceLanguage}
              onChange={(e) => setVoiceLanguage(e.target.value)}
              className="bg-transparent border-none outline-none text-sm font-medium text-gray-700"
            >
              {languages.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.name}
                </option>
              ))}
            </select>
          </div>
          
          <button
            onClick={() => setAudioEnabled(!audioEnabled)}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            {audioEnabled ? (
              <Volume2 className="w-6 h-6 text-gray-700" />
            ) : (
              <VolumeX className="w-6 h-6 text-gray-700" />
            )}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-8">
        {/* Voice Visual Indicator */}
        <div className="mb-8">
          <div className={`relative ${isListening ? 'animate-pulse' : ''}`}>
            {/* Outer rings for listening effect */}
            {isListening && (
              <>
                <div className="absolute inset-0 rounded-full bg-blue-400 opacity-20 animate-ping" style={{ animationDelay: '0s' }}></div>
                <div className="absolute inset-0 rounded-full bg-blue-400 opacity-15 animate-ping" style={{ animationDelay: '0.2s' }}></div>
                <div className="absolute inset-0 rounded-full bg-blue-400 opacity-10 animate-ping" style={{ animationDelay: '0.4s' }}></div>
              </>
            )}
            
            {/* Main microphone icon - clickable */}
            <button 
              className={`w-32 h-32 rounded-full flex items-center justify-center transition-all duration-300 ${
                isListening 
                  ? 'bg-blue-500 shadow-xl' 
                  : isProcessing 
                  ? 'bg-orange-500 shadow-lg' 
                  : 'bg-green-500 shadow-lg hover:shadow-xl hover:scale-105'
              }`}
              onClick={() => {
                // This will trigger the hidden VoiceRecorder component
                const voiceButton = document.querySelector('.voice-recorder-container button');
                if (voiceButton) {
                  voiceButton.click();
                }
              }}
              disabled={isProcessing}
            >
              {isListening ? (
                <div className="flex space-x-1">
                  <div className="w-2 h-8 bg-white rounded animate-bounce" style={{ animationDelay: '0s' }}></div>
                  <div className="w-2 h-6 bg-white rounded animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-10 bg-white rounded animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-6 bg-white rounded animate-bounce" style={{ animationDelay: '0.3s' }}></div>
                  <div className="w-2 h-8 bg-white rounded animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                </div>
              ) : isProcessing ? (
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent"></div>
              ) : (
                <Mic className="w-12 h-12 text-white" />
              )}
            </button>
          </div>
        </div>

        {/* Status Text */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            {isListening ? 'Listening...' : isProcessing ? 'Processing...' : 'Voice Assistant'}
          </h1>
          <p className="text-gray-600 mb-2">
            {isListening 
              ? 'Speak your farming question' 
              : isProcessing 
              ? 'Understanding your query...' 
              : 'Voice-powered farming assistance'
            }
          </p>
          {error && (
            <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-2 rounded-lg max-w-md mx-auto">
              {error}
            </div>
          )}
        </div>

        {/* Hidden Voice Recorder Component */}
        <div className="voice-recorder-container absolute opacity-0 pointer-events-none">
          <VoiceRecorder
            onVoiceQuery={handleVoiceQuery}
            voiceLanguage={voiceLanguage}
            disabled={isProcessing}
          />
        </div>

        {/* Suggestions Section */}
        <div className="w-full max-w-md">
          <div className="text-center mb-6">
            <p className="text-sm text-gray-500 mb-4">Try asking:</p>
            
            {/* Current rotating suggestion */}
            <div 
              className="bg-white rounded-lg p-4 mb-4 shadow-sm border border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => handleSuggestionClick(currentSuggestion)}
            >
              <p className="text-gray-700">{currentSuggestion}</p>
            </div>
          </div>

          {/* Quick suggestion buttons */}
          <div className="grid grid-cols-2 gap-3">
            {farmingSuggestions.slice(0, 4).map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleSuggestionClick(suggestion)}
                className="p-3 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 hover:border-green-300 transition-all duration-200 text-sm text-gray-700 text-left"
              >
                <div className="truncate">
                  {suggestion.length > 30 ? `${suggestion.substring(0, 30)}...` : suggestion}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-6 bg-white/80 backdrop-blur-sm border-t border-gray-200">
        <div className="text-center">
          <button
            onClick={handleGoHome}
            className="flex items-center justify-center space-x-2 mx-auto px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-full transition-colors shadow-lg"
          >
            <Home className="w-5 h-5" />
            <span>Go Home</span>
          </button>
          <p className="text-xs text-gray-500 mt-3">
            The page you're looking for doesn't exist. Let's get you back to helping farmers!
          </p>
        </div>
      </div>
    </div>
  );
};

export default VoicePage;