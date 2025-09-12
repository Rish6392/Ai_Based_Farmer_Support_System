// WAV Audio Recorder using Web Audio API
class WAVRecorder {
  constructor() {
    this.isRecording = false;
    this.audioContext = null;
    this.source = null;
    this.processor = null;
    this.stream = null;
    this.recordingLength = 0;
    this.recordingBuffers = [];
    this.sampleRate = 16000; // 16kHz for speech recognition
  }

  async start() {
    try {
      // Get user media
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: this.sampleRate,
        }
      });

      // Create audio context
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)({
        sampleRate: this.sampleRate
      });

      // Create source from stream
      this.source = this.audioContext.createMediaStreamSource(this.stream);

      // Create script processor (deprecated but more compatible)
      const bufferSize = 4096;
      this.processor = this.audioContext.createScriptProcessor(bufferSize, 1, 1);

      // Reset recording data
      this.recordingLength = 0;
      this.recordingBuffers = [];

      // Process audio data
      this.processor.onaudioprocess = (e) => {
        if (!this.isRecording) return;
        
        const inputData = e.inputBuffer.getChannelData(0);
        const buffer = new Float32Array(inputData.length);
        buffer.set(inputData);
        this.recordingBuffers.push(buffer);
        this.recordingLength += buffer.length;
      };

      // Connect nodes
      this.source.connect(this.processor);
      this.processor.connect(this.audioContext.destination);

      this.isRecording = true;
    } catch (error) {
      console.error('Error starting WAV recording:', error);
      throw error;
    }
  }

  stop() {
    this.isRecording = false;

    // Add a small delay to ensure all audio processing is complete
    return new Promise((resolve) => {
      setTimeout(() => {
        if (this.processor) {
          this.processor.disconnect();
          this.processor = null;
        }

        if (this.source) {
          this.source.disconnect();
          this.source = null;
        }

        if (this.stream) {
          this.stream.getTracks().forEach(track => track.stop());
          this.stream = null;
        }

        try {
          const wavBlob = this.exportWAV();
          
          if (this.audioContext) {
            this.audioContext.close().then(() => {
              this.audioContext = null;
              resolve(wavBlob);
            }).catch(() => {
              this.audioContext = null;
              resolve(wavBlob);
            });
          } else {
            resolve(wavBlob);
          }
        } catch (error) {
          if (this.audioContext) {
            this.audioContext.close().catch(() => {});
            this.audioContext = null;
          }
          throw error;
        }
      }, 50); // Small delay to ensure all operations complete
    });
  }

  exportWAV() {
    if (this.recordingLength === 0) {
      throw new Error('No audio data recorded');
    }

    // Combine all buffers
    const result = new Float32Array(this.recordingLength);
    let offset = 0;
    for (const buffer of this.recordingBuffers) {
      result.set(buffer, offset);
      offset += buffer.length;
    }

    // Convert to WAV
    const wavBuffer = this.encodeWAV(result, this.sampleRate);
    return new Blob([wavBuffer], { type: 'audio/wav' });
  }

  encodeWAV(samples, sampleRate) {
    const buffer = new ArrayBuffer(44 + samples.length * 2);
    const view = new DataView(buffer);

    // WAV header
    const writeString = (offset, string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };

    const int16 = (n) => [n & 0xff, (n >> 8) & 0xff];
    const int32 = (n) => [n & 0xff, (n >> 8) & 0xff, (n >> 16) & 0xff, (n >> 24) & 0xff];

    writeString(0, 'RIFF');
    view.setUint32(4, buffer.byteLength - 8, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true); // PCM format
    view.setUint16(20, 1, true);  // Mono
    view.setUint16(22, 1, true);  // 1 channel
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true); // byte rate
    view.setUint16(32, 2, true);  // block align
    view.setUint16(34, 16, true); // bits per sample
    writeString(36, 'data');
    view.setUint32(40, samples.length * 2, true);

    // Convert samples to 16-bit PCM
    const int16Array = new Int16Array(buffer, 44, samples.length);
    for (let i = 0; i < samples.length; i++) {
      const sample = Math.max(-1, Math.min(1, samples[i]));
      int16Array[i] = sample * 0x7FFF;
    }

    return buffer;
  }
}

export default WAVRecorder;
