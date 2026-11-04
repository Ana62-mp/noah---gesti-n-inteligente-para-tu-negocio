/**
 * Web Speech Recognition & Synthesis service with simulated audio fallback
 */

// Declare SpeechRecognition interfaces
interface IWindow extends Window {
  SpeechRecognition?: any;
  webkitSpeechRecognition?: any;
}

export class SpeechService {
  private recognition: any = null;
  private isListening: boolean = false;
  private simulationInterval: any = null;

  constructor() {
    const win = typeof window !== 'undefined' ? (window as unknown as IWindow) : null;
    if (win) {
      const SpeechRec = win.SpeechRecognition || win.webkitSpeechRecognition;
      if (SpeechRec) {
        this.recognition = new SpeechRec();
        this.recognition.continuous = false;
        this.recognition.interimResults = true;
        this.recognition.lang = 'es-EC';
      }
    }
  }

  public isSupported(): boolean {
    return Boolean(this.recognition);
  }

  public startListening(
    onResult: (transcript: string, isFinal: boolean) => void,
    onError: (err: string) => void,
    onEnd: () => void
  ) {
    if (!this.recognition) {
      onError('El navegador no soporta SpeechRecognition. Puedes usar el botón "Simular audio" o escribir.');
      return;
    }

    try {
      this.isListening = true;
      this.recognition.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }

        const transcript = finalTranscript || interimTranscript;
        onResult(transcript, Boolean(finalTranscript));
      };

      this.recognition.onerror = (event: any) => {
        this.isListening = false;
        onError(event.error === 'not-allowed' ? 'Permiso de micrófono denegado.' : 'Error al capturar voz.');
      };

      this.recognition.onend = () => {
        this.isListening = false;
        onEnd();
      };

      this.recognition.start();
    } catch (e: any) {
      this.isListening = false;
      onError(e.message || 'Error al iniciar reconocimiento');
    }
  }

  public stopListening() {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
      this.isListening = false;
    }
    if (this.simulationInterval) {
      clearInterval(this.simulationInterval);
      this.simulationInterval = null;
    }
  }

  /**
   * Simulates real-time word-by-word audio transcription
   */
  public simulateAudioTranscription(
    scriptText: string,
    onWord: (partialText: string, isFinished: boolean) => void,
    speedMs: number = 140
  ) {
    this.stopListening();
    const words = scriptText.split(' ');
    let currentIndex = 0;
    let accumulated = '';

    this.simulationInterval = setInterval(() => {
      if (currentIndex < words.length) {
        accumulated += (currentIndex > 0 ? ' ' : '') + words[currentIndex];
        currentIndex++;
        const isFinished = currentIndex >= words.length;
        onWord(accumulated, isFinished);
        if (isFinished) {
          clearInterval(this.simulationInterval);
          this.simulationInterval = null;
        }
      }
    }, speedMs);
  }

  /**
   * Text-to-speech to read Noah's answers in voice
   */
  public speak(text: string, onStart?: () => void, onEnd?: () => void) {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel(); // Stop any pending speech

    // Clean markdown/symbols from text
    const cleanText = text
      .replace(/\*\*/g, '')
      .replace(/#/g, '')
      .replace(/\[.*?\]/g, '')
      .replace(/\(.*?\)/g, '');

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'es-EC';
    utterance.rate = 1.05;
    utterance.pitch = 1.0;

    // Try to find a Latin American / Spanish voice
    const voices = window.speechSynthesis.getVoices();
    const esVoice =
      voices.find((v) => v.lang.includes('es-EC') || v.lang.includes('es-419') || v.lang.includes('es-CO') || v.lang.includes('es-MX')) ||
      voices.find((v) => v.lang.startsWith('es'));

    if (esVoice) {
      utterance.voice = esVoice;
    }

    if (onStart) utterance.onstart = onStart;
    if (onEnd) utterance.onend = onEnd;

    window.speechSynthesis.speak(utterance);
  }

  public stopSpeaking() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }
}

export const speechService = new SpeechService();
