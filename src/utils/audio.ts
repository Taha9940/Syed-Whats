import { VoiceNoteAttachment } from '../types';

export class VoiceRecorderService {
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private startTime = 0;
  private timerInterval: NodeJS.Timeout | null = null;
  private onTimeUpdate?: (seconds: number) => void;

  async startRecording(onTimeUpdate: (seconds: number) => void): Promise<boolean> {
    this.audioChunks = [];
    this.onTimeUpdate = onTimeUpdate;

    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        this.mediaRecorder = new MediaRecorder(stream);

        this.mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            this.audioChunks.push(event.data);
          }
        };

        this.mediaRecorder.start(100);
        this.startTime = Date.now();

        this.timerInterval = setInterval(() => {
          const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
          this.onTimeUpdate?.(elapsed);
        }, 500);

        return true;
      }
    } catch (err) {
      console.warn('Microphone permission not granted or unsupported, using simulated recorder', err);
    }

    // Fallback simulation mode
    this.startTime = Date.now();
    this.timerInterval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
      this.onTimeUpdate?.(elapsed);
    }, 500);

    return true;
  }

  async stopRecording(): Promise<VoiceNoteAttachment | null> {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }

    const duration = Math.max(1, Math.floor((Date.now() - this.startTime) / 1000));
    const randomWaveform = Array.from({ length: Math.min(24, Math.max(12, duration * 2)) }, () =>
      Math.floor(20 + Math.random() * 80)
    );

    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      return new Promise((resolve) => {
        this.mediaRecorder!.onstop = () => {
          const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
          const audioUrl = URL.createObjectURL(audioBlob);

          // Stop all audio tracks to release microphone
          this.mediaRecorder?.stream?.getTracks().forEach((track) => track.stop());

          resolve({
            id: `vn_${Date.now()}`,
            url: audioUrl,
            duration,
            waveformData: randomWaveform,
          });
        };
        this.mediaRecorder!.stop();
      });
    }

    // Simulation audio note with clean Google sound action
    return {
      id: `vn_${Date.now()}`,
      url: 'https://actions.google.com/sounds/v1/water/stream_water.ogg',
      duration,
      waveformData: randomWaveform,
    };
  }

  cancelRecording(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      this.mediaRecorder.stop();
      this.mediaRecorder.stream?.getTracks().forEach((track) => track.stop());
    }
    this.audioChunks = [];
  }
}

export const voiceRecorder = new VoiceRecorderService();

export function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s < 10 ? '0' : ''}${s}`;
}
