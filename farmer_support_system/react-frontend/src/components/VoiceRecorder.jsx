import React, { useState, useRef, useEffect } from 'react';
import { FaMicrophone, FaStop, FaPlay, FaPause, FaDownload, FaTrash } from 'react-icons/fa';

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
    };
  }, []);

  const startRecording = async () => {
    try {
      // Reset previous recording
      setAudioBlob(null);
      setRecordingTime(0);
      chunksRef.current = [];

      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        } 
      });

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm;codecs=opus' });
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

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
  };

  const resetRecording = () => {
    if (isRecording) {
      stopRecording();
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
      // Convert blob to file
      const file = new File([audioBlob], 'voice-query.webm', { type: 'audio/webm' });
      await onVoiceQuery(file, voiceLanguage);
      
      // Reset after successful send
      resetRecording();
    } catch (error) {
      console.error('Voice query failed:', error);
      alert('Failed to send voice query. Please try again.');
    } finally {
      setIsProcessing(false);
    }
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
