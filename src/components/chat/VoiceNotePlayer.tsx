import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause } from 'lucide-react';
import { VoiceNoteAttachment } from '../../types';
import { formatDuration } from '../../utils/audio';

interface VoiceNotePlayerProps {
  voiceNote: VoiceNoteAttachment;
  isOwnMessage: boolean;
}

export const VoiceNotePlayer: React.FC<VoiceNotePlayerProps> = ({ voiceNote, isOwnMessage }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0); // 0 to 1
  const [currentTime, setCurrentTime] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = new Audio(voiceNote.url);
    audioRef.current = audio;

    audio.ontimeupdate = () => {
      if (audio.duration) {
        setProgress(audio.currentTime / audio.duration);
        setCurrentTime(audio.currentTime);
      }
    };

    audio.onended = () => {
      setIsPlaying(false);
      setProgress(0);
      setCurrentTime(0);
    };

    return () => {
      audio.pause();
      audio.src = '';
    };
  }, [voiceNote.url]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch((err) => {
        console.warn('Audio play failed, simulating play', err);
        setIsPlaying(true);
        // Fallback simulation timer
        const duration = voiceNote.duration || 10;
        let elapsed = 0;
        const interval = setInterval(() => {
          elapsed += 0.5;
          setProgress(Math.min(1, elapsed / duration));
          setCurrentTime(elapsed);
          if (elapsed >= duration) {
            clearInterval(interval);
            setIsPlaying(false);
            setProgress(0);
            setCurrentTime(0);
          }
        }, 500);
      });
    }
  };

  const waveform = voiceNote.waveformData || [30, 50, 70, 40, 80, 60, 45, 90, 65, 35, 20, 55, 75, 40];

  return (
    <div className="flex items-center gap-3 py-1 px-1 min-w-[220px] max-w-[280px]">
      <button
        onClick={togglePlay}
        className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-all shadow-sm ${
          isOwnMessage
            ? 'bg-white text-[#16324F] hover:bg-slate-100'
            : 'bg-[#16B8A6] text-white hover:bg-[#14a090]'
        }`}
        title={isPlaying ? 'Pause voice message' : 'Play voice message'}
      >
        {isPlaying ? <Pause size={17} className="fill-current" /> : <Play size={17} className="fill-current ml-0.5" />}
      </button>

      <div className="flex-1 flex flex-col justify-center gap-1.5">
        <div className="flex items-center gap-1 h-7">
          {waveform.map((height, idx) => {
            const barProgress = idx / waveform.length;
            const isPlayed = barProgress <= progress;

            return (
              <div
                key={idx}
                className="flex-1 rounded-full transition-all duration-150"
                style={{
                  height: `${Math.max(15, height)}%`,
                  backgroundColor: isPlayed
                    ? isOwnMessage ? '#FFFFFF' : '#16B8A6'
                    : isOwnMessage ? 'rgba(255, 255, 255, 0.35)' : 'rgba(148, 163, 184, 0.4)',
                }}
              />
            );
          })}
        </div>

        <div className="flex items-center justify-between text-[11px] font-mono opacity-80 leading-none">
          <span>{formatDuration(isPlaying ? currentTime : voiceNote.duration)}</span>
          <span className="text-[10px] uppercase tracking-wider font-semibold opacity-70">Voice Note</span>
        </div>
      </div>
    </div>
  );
};
