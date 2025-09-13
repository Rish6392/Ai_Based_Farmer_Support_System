import React, { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, Smile, Mic, X, Check } from 'lucide-react';
import { cn } from '../utils/cn';
import WAVRecorder from '../utils/WAVRecorder';

const ChatInput = ({ 
  value, 
  onChange, 
  onSend, 
  onKeyPress, 
  disabled, 
  placeholder = "Type your farming question here...",
  isCentered = false,
  onVoiceQuery,
  voiceLanguage = 'Malayalam'
}) => {
  const textareaRef = useRef(null);
  
  // Voice recording states
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const mediaRecorderRef = useRef(null);
  const timerRef = useRef(null);
  const chunksRef = useRef([]);
  const streamRef = useRef(null);
  const wavRecorderRef = useRef(null);
  
  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
    }
  }, [value]);

  // Cleanup voice recording on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
      if (wavRecorderRef.current) {
        try {
          wavRecorderRef.current.stop().catch(() => {});
        } catch (e) {
          // Ignore errors during cleanup
        }
      }
    };
  }, []);

  // Voice recording functions
  const startRecording = async () => {
    try {
      // Reset previous recording
      setAudioBlob(null);
      setRecordingTime(0);
      chunksRef.current = [];

      // Try WAV recording first (more compatible with backend)
      try {
        console.log('Attempting WAV recording...');
        wavRecorderRef.current = new WAVRecorder();
        await wavRecorderRef.current.start();
        
        setIsRecording(true);
        console.log('WAV recording started successfully');
        
        // Start timer
        timerRef.current = setInterval(() => {
          setRecordingTime(prev => prev + 1);
        }, 1000);
        
        return; // Success with WAV recording
      } catch (wavError) {
        console.log('WAV recording failed, falling back to MediaRecorder:', wavError.message);
        wavRecorderRef.current = null;
      }

      // Fallback to MediaRecorder
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 16000,
        } 
      });

      streamRef.current = stream;

      const mimeTypes = [
        'audio/webm;codecs=opus',
        'audio/webm',
        'audio/mp4',
        'audio/mp3',
        ''
      ];

      let mediaRecorder;
      let selectedMimeType;

      for (const mimeType of mimeTypes) {
        if (MediaRecorder.isTypeSupported(mimeType) || mimeType === '') {
          try {
            mediaRecorder = mimeType === '' 
              ? new MediaRecorder(stream)
              : new MediaRecorder(stream, { mimeType });
            selectedMimeType = mimeType || 'default';
            break;
          } catch (e) {
            continue;
          }
        }
      }

      if (!mediaRecorder) {
        throw new Error('No supported audio format found');
      }

      console.log(`Recording with MIME type: ${selectedMimeType}`);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const actualMimeType = mediaRecorder.mimeType || selectedMimeType || 'audio/webm';
        const blob = new Blob(chunksRef.current, { type: actualMimeType });
        setAudioBlob(blob);
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Could not access microphone. Please check permissions.');
    }
  };

  const stopRecording = async () => {
    setIsRecording(false);
    
    // Stop timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    // Handle WAV recording
    if (wavRecorderRef.current) {
      try {
        const wavBlob = await wavRecorderRef.current.stop();
        setAudioBlob(wavBlob);
        console.log('WAV recording stopped successfully:', wavBlob.size, 'bytes');
        wavRecorderRef.current = null;
        return;
      } catch (error) {
        console.error('Error stopping WAV recording:', error);
        wavRecorderRef.current = null;
      }
    }

    // Handle MediaRecorder
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
  };

  const cancelRecording = async () => {
    if (isRecording) {
      await stopRecording();
    }
    
    setAudioBlob(null);
    setRecordingTime(0);
    chunksRef.current = [];
  };

  const sendVoiceMessage = async () => {
    if (!audioBlob || isProcessing || !onVoiceQuery) return;

    setIsProcessing(true);
    
    try {
      console.log('Processing audio blob:', audioBlob.type, audioBlob.size, 'bytes');
      
      // Create file from blob
      const file = new File([audioBlob], `voice-query-${Date.now()}.${audioBlob.type.includes('wav') ? 'wav' : 'webm'}`, { 
        type: audioBlob.type 
      });
      
      await onVoiceQuery(file, voiceLanguage);
      console.log('Voice query successful');
      
      // Reset states after successful send
      setAudioBlob(null);
      setRecordingTime(0);
      
    } catch (error) {
      console.error('Voice query failed:', error);
      alert(`Failed to send voice query: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSend();
  };

  if (isCentered) {
    return (
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-3xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome to KisanSewa!
            </h1>
            <p className="text-lg text-gray-600">
              Your AI-powered farming assistant. How can I help you today?
            </p>
          </div>
          
          <form onSubmit={handleSubmit} className="relative">
            <div className="relative bg-white rounded-2xl border border-gray-300 shadow-lg hover:shadow-xl transition-shadow duration-200 focus-within:ring-2 focus-within:ring-emerald-500 focus-within:border-emerald-500">
              <textarea
                ref={textareaRef}
                value={value}
                onChange={onChange}
                onKeyPress={onKeyPress}
                placeholder={placeholder}
                disabled={disabled}
                rows={1}
                className="w-full resize-none rounded-2xl px-6 py-4 pr-16 text-gray-900 placeholder-gray-500 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed bg-transparent"
                style={{
                  minHeight: '60px',
                  maxHeight: '120px'
                }}
              />
              <div className="absolute right-3 bottom-3 flex items-center gap-2">
                {/* Voice Recording Controls */}
                {isRecording ? (
                  <div className="flex items-center gap-2 bg-red-50 rounded-lg px-2 py-1 border border-red-200">
                    <span className="text-xs text-red-600 font-medium">
                      {formatTime(recordingTime)}
                    </span>
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                    <button
                      type="button"
                      onClick={cancelRecording}
                      className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-100 rounded-lg transition-all duration-200"
                      title="Cancel recording"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={stopRecording}
                      className="p-1.5 text-green-600 hover:text-green-700 hover:bg-green-100 rounded-lg transition-all duration-200"
                      title="Stop recording"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  </div>
                ) : audioBlob ? (
                  <div className="flex items-center gap-2 bg-blue-50 rounded-lg px-2 py-1 border border-blue-200">
                    <span className="text-xs text-blue-600 font-medium">
                      {formatTime(recordingTime)}
                    </span>
                    <button
                      type="button"
                      onClick={cancelRecording}
                      disabled={isProcessing}
                      className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-100 rounded-lg transition-all duration-200 disabled:opacity-50"
                      title="Cancel recording"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={sendVoiceMessage}
                      disabled={isProcessing}
                      className="p-1.5 text-green-600 hover:text-green-700 hover:bg-green-100 rounded-lg transition-all duration-200 disabled:opacity-50"
                      title="Send voice message"
                    >
                      {isProcessing ? (
                        <div className="w-4 h-4 border-2 border-green-300 border-t-green-600 rounded-full animate-spin"></div>
                      ) : (
                        <Check className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                ) : (
                  <>
                    <div className='rounded-full p-1 bg-green-200 border-green-600'>

                    <button
                      type="button"
                      onClick={startRecording}
                      disabled={disabled || isRecording}
                      className="p-2 text-gray-400 hover:text-emerald-600  rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Record voice message"
                    >
                      <Mic className="w-4 h-4" />
                    </button>
                    </div>
                    <button
                      type="submit"
                      disabled={!value.trim() || disabled}
                      className="p-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-lg hover:from-emerald-600 hover:to-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>
            </div>
          </form>
          
          {/* Quick suggestions */}
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            {[
              "What crops should I plant?",
              "How to identify diseases?",
              "Irrigation best practices",
              "Soil improvement tips"
            ].map((suggestion, index) => (
              <button
                key={index}
                onClick={() => onChange({ target: { value: suggestion } })}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full text-sm transition-colors duration-200"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="border-t border-gray-200 bg-white p-4">
      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
        <div className="relative bg-gray-50 rounded-2xl border border-gray-300 focus-within:ring-2 focus-within:ring-emerald-500 focus-within:border-emerald-500 transition-all duration-200">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={onChange}
            onKeyPress={onKeyPress}
            placeholder={placeholder}
            disabled={disabled}
            rows={1}
            className="w-full resize-none rounded-2xl px-4 py-3 pr-24 text-gray-900 placeholder-gray-500 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed bg-transparent"
            style={{
              minHeight: '48px',
              maxHeight: '120px'
            }}
          />
          <div className="absolute right-2 bottom-2 flex items-center gap-1">
            {/* Voice Recording Controls */}
            {isRecording ? (
              <div className="flex items-center gap-1 bg-red-50 rounded-lg px-2 py-1 border border-red-200 mr-1">
                <span className="text-xs text-red-600 font-medium">
                  {formatTime(recordingTime)}
                </span>
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse ml-1"></div>
                <button
                  type="button"
                  onClick={cancelRecording}
                  className="p-1 text-red-500 hover:text-red-700 hover:bg-red-100 rounded transition-all duration-200 ml-1"
                  title="Cancel recording"
                >
                  <X className="w-3 h-3" />
                </button>
                <button
                  type="button"
                  onClick={stopRecording}
                  className="p-1 text-green-600 hover:text-green-700 hover:bg-green-100 rounded transition-all duration-200"
                  title="Stop recording"
                >
                  <Check className="w-3 h-3" />
                </button>
              </div>
            ) : audioBlob ? (
              <div className="flex items-center gap-1 bg-blue-50 rounded-lg px-2 py-1 border border-blue-200 mr-1">
                <span className="text-xs text-blue-600 font-medium">
                  {formatTime(recordingTime)}
                </span>
                <button
                  type="button"
                  onClick={cancelRecording}
                  disabled={isProcessing}
                  className="p-1 text-red-500 hover:text-red-700 hover:bg-red-100 rounded transition-all duration-200 disabled:opacity-50 ml-1"
                  title="Cancel recording"
                >
                  <X className="w-3 h-3" />
                </button>
                <button
                  type="button"
                  onClick={sendVoiceMessage}
                  disabled={isProcessing}
                  className="p-1 text-green-600 hover:text-green-700 hover:bg-green-100 rounded transition-all duration-200 disabled:opacity-50"
                  title="Send voice message"
                >
                  {isProcessing ? (
                    <div className="w-3 h-3 border-2 border-green-300 border-t-green-600 rounded-full animate-spin"></div>
                  ) : (
                    <Check className="w-3 h-3" />
                  )}
                </button>
              </div>
            ) : (
              <>
                <button
                  type="button"
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-white rounded-lg transition-all duration-200"
                  title="Add emoji"
                >
                  <Smile className="w-4 h-4" />
                </button>
                
                <button
                  type="button"
                  onClick={startRecording}
                  disabled={disabled || isRecording}
                  className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Record voice message"
                >
                  <Mic className="w-4 h-4" />
                </button>
                <button
                  type="submit"
                  disabled={!value.trim() || disabled}
                  className="p-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-lg hover:from-emerald-600 hover:to-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md ml-1"
                >
                  <Send className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};

export default ChatInput;