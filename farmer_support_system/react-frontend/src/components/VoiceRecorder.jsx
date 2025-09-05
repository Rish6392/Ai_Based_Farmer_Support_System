import React, { useState, useRef, useEffect } from 'react';
import { FaMicrophone, FaStop, FaPlay, FaPause, FaDownload, FaTrash } from 'react-icons/fa';
import WAVRecorder from '../utils/WAVRecorder';

const VoiceRecorder = ({ onVoiceQuery, voiceLanguage, disabled = false }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [playbackTime, setPlaybackTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [audioBlob, setAudioBlob] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const mediaRecorderRef = useRef(null);
  const audioRef = useRef(null);
  const timerRef = useRef(null);
  const playbackTimerRef = useRef(null);
  const chunksRef = useRef([]);
  const streamRef = useRef(null);
  const wavRecorderRef = useRef(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (playbackTimerRef.current) {
        clearInterval(playbackTimerRef.current);
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
      if (wavRecorderRef.current) {
        try {
          // For cleanup, we don't need to wait for the promise
          wavRecorderRef.current.stop().catch(() => {});
        } catch (e) {
          // Ignore errors during cleanup
        }
      }
    };
  }, []);

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
          sampleRate: 16000,  // Set to 16kHz for speech recognition
        } 
      });

      // Store the stream for later conversion to WAV
      streamRef.current = stream;

      // Try different MIME types in order of preference for compatibility
      const mimeTypes = [
        'audio/webm;codecs=opus',
        'audio/webm',
        'audio/mp4',
        'audio/mp3',
        ''  // Let the browser choose
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
        setDuration(recordingTime);
        
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
        setDuration(recordingTime);
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

  const resetRecording = async () => {
    if (isRecording) {
      await stopRecording();
    }
    if (isPlaying) {
      setIsPlaying(false);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    }
    
    setAudioBlob(null);
    setRecordingTime(0);
    setPlaybackTime(0);
    setDuration(0);
    chunksRef.current = [];
    
    if (playbackTimerRef.current) {
      clearInterval(playbackTimerRef.current);
    }
  };

  const playPauseAudio = () => {
    if (!audioBlob) return;

    if (!audioRef.current) {
      const url = URL.createObjectURL(audioBlob);
      audioRef.current = new Audio(url);
      
      audioRef.current.onended = () => {
        setIsPlaying(false);
        setPlaybackTime(0);
        if (playbackTimerRef.current) {
          clearInterval(playbackTimerRef.current);
        }
      };
    }

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
      if (playbackTimerRef.current) {
        clearInterval(playbackTimerRef.current);
      }
    } else {
      audioRef.current.play();
      setIsPlaying(true);
      
      playbackTimerRef.current = setInterval(() => {
        if (audioRef.current) {
          setPlaybackTime(Math.floor(audioRef.current.currentTime));
        }
      }, 1000);
    }
  };

  const downloadAudio = () => {
    if (!audioBlob) return;

    const url = URL.createObjectURL(audioBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `voice-recording-${new Date().toISOString().slice(0, 19)}.webm`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const sendVoiceQuery = async () => {
    if (!audioBlob || isProcessing) return;

    setIsProcessing(true);
    try {
      console.log('Processing audio blob:', audioBlob.type, audioBlob.size, 'bytes');
      
      // Add a small delay to ensure any file operations are complete
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // If we have a WAV blob (from WAVRecorder), use it directly
      if (audioBlob.type === 'audio/wav') {
        console.log('Using native WAV audio');
        
        // Create a new blob to avoid file handle conflicts
        const wavBlob = new Blob([audioBlob], { type: 'audio/wav' });
        const file = new File([wavBlob], `voice-query-${Date.now()}.wav`, { type: 'audio/wav' });
        
        await onVoiceQuery(file, voiceLanguage);
        console.log('Voice query successful with WAV format');
        resetRecording();
        return;
      }

      // Otherwise, try the original format first (backend can handle conversion)
      try {
        // Create a new blob to avoid file handle conflicts
        const originalBlob = new Blob([audioBlob], { type: audioBlob.type });
        const originalFile = new File([originalBlob], `voice-query-${Date.now()}.webm`, { type: audioBlob.type });
        
        await onVoiceQuery(originalFile, voiceLanguage);
        console.log('Voice query successful with original format');
        resetRecording();
        return;
      } catch (originalError) {
        console.log('Original format failed, attempting conversion:', originalError.message);
        
        // If original format fails, try converting to WAV
        try {
          const wavBlob = await convertWebMToWav(audioBlob);
          console.log('Converted to WAV:', wavBlob.size, 'bytes');
          
          // Add another small delay after conversion
          await new Promise(resolve => setTimeout(resolve, 100));
          
          // Create a new blob to avoid file handle conflicts
          const finalWavBlob = new Blob([wavBlob], { type: 'audio/wav' });
          const file = new File([finalWavBlob], `voice-query-${Date.now()}.wav`, { type: 'audio/wav' });
          
          await onVoiceQuery(file, voiceLanguage);
          console.log('Voice query successful with WAV conversion');
          resetRecording();
        } catch (conversionError) {
          throw new Error(`Both original and converted formats failed: ${conversionError.message}`);
        }
      }
    } catch (error) {
      console.error('Voice query failed:', error);
      alert(`Failed to send voice query: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // Convert WebM audio blob to WAV format
  const convertWebMToWav = async (webmBlob) => {
    try {
      console.log('Converting audio format from:', webmBlob.type);
      
      const audioContext = new (window.AudioContext || window.webkitAudioContext)({
        sampleRate: 16000 // Use 16kHz for speech recognition
      });
      
      const arrayBuffer = await webmBlob.arrayBuffer();
      console.log('Audio array buffer size:', arrayBuffer.byteLength);
      
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
      console.log('Decoded audio buffer:', {
        sampleRate: audioBuffer.sampleRate,
        length: audioBuffer.length,
        duration: audioBuffer.duration,
        channels: audioBuffer.numberOfChannels
      });
      
      // Convert to WAV
      const wavBuffer = audioBufferToWav(audioBuffer);
      const wavBlob = new Blob([wavBuffer], { type: 'audio/wav' });
      
      // Close audio context to free resources
      await audioContext.close();
      
      return wavBlob;
    } catch (error) {
      console.error('Error converting audio:', error);
      throw new Error(`Failed to convert audio format: ${error.message}`);
    }
  };

  // Convert AudioBuffer to WAV format
  const audioBufferToWav = (buffer) => {
    const length = buffer.length;
    const numberOfChannels = buffer.numberOfChannels;
    const sampleRate = buffer.sampleRate;
    const bytesPerSample = 2; // 16-bit
    const blockAlign = numberOfChannels * bytesPerSample;
    const byteRate = sampleRate * blockAlign;
    const dataSize = length * blockAlign;
    const bufferSize = 44 + dataSize;

    const arrayBuffer = new ArrayBuffer(bufferSize);
    const view = new DataView(arrayBuffer);

    // WAV header
    const writeString = (offset, string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };

    writeString(0, 'RIFF');
    view.setUint32(4, bufferSize - 8, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, numberOfChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, byteRate, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, 16, true);
    writeString(36, 'data');
    view.setUint32(40, dataSize, true);

    // Convert audio data
    let offset = 44;
    for (let i = 0; i < length; i++) {
      for (let channel = 0; channel < numberOfChannels; channel++) {
        const sample = Math.max(-1, Math.min(1, buffer.getChannelData(channel)[i]));
        view.setInt16(offset, sample * 0x7FFF, true);
        offset += 2;
      }
    }

    return arrayBuffer;
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getDisplayTime = () => {
    if (isRecording) return formatTime(recordingTime);
    if (isPlaying && duration > 0) return `${formatTime(playbackTime)} / ${formatTime(duration)}`;
    if (duration > 0) return `0:00 / ${formatTime(duration)}`;
    return '0:00 / 0:00';
  };

  const getProgressPercentage = () => {
    if (isRecording) return 0;
    if (duration === 0) return 0;
    return (playbackTime / duration) * 100;
  };

  return (
    <div className="space-y-3">
      {/* Control Buttons */}
      <div className="flex space-x-2">
        {!isRecording ? (
          <button 
            onClick={startRecording}
            disabled={disabled || isProcessing}
            className="flex items-center px-3 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FaMicrophone className="mr-1" />
            Start Recording
          </button>
        ) : (
          <button 
            onClick={stopRecording}
            className="flex items-center px-3 py-1 bg-gray-600 text-white rounded text-xs hover:bg-gray-500 transition-colors"
          >
            <FaStop className="mr-1" />
            Stop
          </button>
        )}
        
        <button 
          onClick={resetRecording}
          disabled={!audioBlob && !isRecording}
          className="flex items-center px-3 py-1 bg-gray-600 text-white rounded text-xs hover:bg-gray-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FaTrash className="mr-1" />
          Reset
        </button>
      </div>
      
      {/* Playback and Download */}
      {audioBlob && (
        <div className="flex space-x-2">
          <button 
            onClick={playPauseAudio}
            className="flex items-center px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-500 transition-colors"
          >
            {isPlaying ? <FaPause className="mr-1" /> : <FaPlay className="mr-1" />}
            {isPlaying ? 'Pause' : 'Play'}
          </button>
          
          <button 
            onClick={downloadAudio}
            className="flex items-center px-3 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-500 transition-colors"
          >
            <FaDownload className="mr-1" />
            Download
          </button>
        </div>
      )}
      
      {/* Send Voice Query Button */}
      {audioBlob && (
        <button 
          onClick={sendVoiceQuery}
          disabled={isProcessing}
          className="w-full px-3 py-2 bg-purple-600 text-white rounded text-sm hover:bg-purple-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isProcessing ? 'Processing...' : 'Send Voice Query'}
        </button>
      )}
      
      {/* Progress Bar */}
      <div className="bg-gray-600 rounded-full h-2">
        <div 
          className="bg-blue-500 h-2 rounded-full transition-all duration-300" 
          style={{ width: `${getProgressPercentage()}%` }}
        ></div>
      </div>
      
      {/* Time Display */}
      <div className="text-xs text-gray-400 text-center">
        {getDisplayTime()}
      </div>
      
      {/* Recording Indicator */}
      {isRecording && (
        <div className="text-center">
          <div className="inline-flex items-center text-red-500 text-sm animate-pulse">
            <div className="w-2 h-2 bg-red-500 rounded-full mr-2 animate-pulse"></div>
            Recording...
          </div>
        </div>
      )}
    </div>
  );
};

export default VoiceRecorder;
