class SpeechToText {
  constructor() {
    // Check browser support for Web Speech API
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    this.recognition = new SpeechRecognition();
    this.setupRecognition();
  }

  setupRecognition() {
    this.recognition.continuous = false;
    this.recognition.interimResults = true;
    this.recognition.lang = 'en-US';
  }

  async transcribe(audioBlob) {
    return new Promise((resolve, reject) => {
      // For now, we'll use the Web Speech API
      // In production, you would send the audio blob to a speech-to-text service
      // like Azure Speech Services, Google Cloud Speech-to-Text, etc.

      const reader = new FileReader();
      
      reader.onload = (event) => {
        // For demo purposes, you can integrate with Azure Speech Services
        // or another transcription service
        this.transcribeWithWebSpeechAPI(audioBlob, resolve, reject);
      };

      reader.onerror = () => {
        reject(new Error('Failed to read audio blob'));
      };

      reader.readAsArrayBuffer(audioBlob);
    });
  }

  transcribeWithWebSpeechAPI(audioBlob, resolve, reject) {
    // Create audio context and decode the audio
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const reader = new FileReader();

    reader.onload = (event) => {
      audioContext.decodeAudioData(
        event.target.result,
        (audioBuffer) => {
          // Use Web Speech API for transcription
          this.recognition.onstart = () => {
            console.log('Speech recognition started');
          };

          this.recognition.onresult = (event) => {
            let interimTranscript = '';
            let finalTranscript = '';

            for (let i = event.resultIndex; i < event.results.length; i++) {
              const transcript = event.results[i][0].transcript;

              if (event.results[i].isFinal) {
                finalTranscript += transcript + ' ';
              } else {
                interimTranscript += transcript;
              }
            }

            if (finalTranscript) {
              resolve(finalTranscript.trim());
            }
          };

          this.recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            reject(new Error(`Speech recognition error: ${event.error}`));
          };

          this.recognition.onend = () => {
            console.log('Speech recognition ended');
          };

          // Start the recognition process
          this.recognition.start();
        },
        (error) => {
          console.error('Failed to decode audio:', error);
          reject(new Error('Failed to decode audio'));
        }
      );
    };

    reader.onerror = () => {
      reject(new Error('Failed to read audio blob'));
    };

    reader.readAsArrayBuffer(audioBlob);
  }

  setLanguage(lang) {
    this.recognition.lang = lang;
  }
}

export default SpeechToText;
