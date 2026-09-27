import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  PhoneOff,
  Volume2,
  VolumeX,
  SwitchCamera,
  Maximize2,
  Minimize2,
  Shield,
  Wifi,
} from 'lucide-react';
import { CallSession, User } from '../../types';
import { formatDuration } from '../../utils/audio';

interface CallModalProps {
  session: CallSession;
  currentUser: User;
  onEndCall: () => void;
}

export const CallModal: React.FC<CallModalProps> = ({ session, currentUser, onEndCall }) => {
  const [callStatus, setCallStatus] = useState<CallSession['status']>(session.status);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(session.type === 'voice');
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [isFullscreen, setIsFullscreen] = useState(false);

  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize camera and microphone if video call
  useEffect(() => {
    let active = true;

    async function setupMedia() {
      try {
        if (session.type === 'video' && navigator.mediaDevices?.getUserMedia) {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode },
            audio: true,
          });

          if (active) {
            mediaStreamRef.current = stream;
            if (localVideoRef.current) {
              localVideoRef.current.srcObject = stream;
            }
          }
        }
      } catch (err) {
        console.warn('Camera / Microphone not available or permission denied', err);
      }
    }

    setupMedia();

    // Call state transitions: Calling -> Ringing (after 1s) -> Connected (after 3s)
    const ringTimeout = setTimeout(() => {
      setCallStatus('ringing');
    }, 1200);

    const connectTimeout = setTimeout(() => {
      setCallStatus('connected');
      timerRef.current = setInterval(() => {
        setDuration((prev) => prev + 1);
      }, 1000);
    }, 3200);

    return () => {
      active = false;
      clearTimeout(ringTimeout);
      clearTimeout(connectTimeout);
      if (timerRef.current) clearInterval(timerRef.current);
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, [session.type, facingMode]);

  // Toggle local mute
  const toggleMute = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getAudioTracks().forEach((track) => {
        track.enabled = isMuted; // unmuting
      });
    }
    setIsMuted(!isMuted);
  };

  // Toggle local camera
  const toggleVideo = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getVideoTracks().forEach((track) => {
        track.enabled = isVideoOff;
      });
    }
    setIsVideoOff(!isVideoOff);
  };

  // Flip camera
  const toggleCameraFacing = () => {
    setFacingMode((prev) => (prev === 'user' ? 'environment' : 'user'));
  };

  const participant = session.participant;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-[#0B132B]/95 backdrop-blur-md text-white select-none ${
        isFullscreen ? 'p-0' : 'p-3 sm:p-6'
      }`}
    >
      <div
        className={`relative w-full ${
          isFullscreen ? 'h-full rounded-none' : 'max-w-2xl h-[85vh] rounded-3xl'
        } bg-gradient-to-b from-[#16324F] to-[#101820] shadow-2xl border border-slate-700/60 overflow-hidden flex flex-col justify-between`}
      >
        {/* Top Control Bar */}
        <div className="p-4 sm:p-6 flex items-center justify-between z-20">
          <div className="flex items-center gap-2 bg-black/30 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 text-xs">
            <Shield size={14} className="text-[#16B8A6]" />
            <span className="font-semibold tracking-wide">SYED E2EE Call</span>
            <span className="opacity-40">•</span>
            <Wifi size={14} className="text-emerald-400" />
            <span className="text-emerald-400 font-mono text-[11px]">HD Audio</span>
          </div>

          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="w-9 h-9 rounded-full bg-black/30 hover:bg-black/50 backdrop-blur-md flex items-center justify-center text-white/80 hover:text-white transition-colors border border-white/10"
            title="Toggle fullscreen"
          >
            {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>
        </div>

        {/* Center Calling Area */}
        <div className="flex-1 flex flex-col items-center justify-center px-4 relative z-10">
          {session.type === 'video' && !isVideoOff && (
            <div className="absolute inset-0 z-0 flex items-center justify-center overflow-hidden">
              {/* Simulated remote high-tech stream background */}
              <img
                src={participant.avatar}
                alt={participant.username}
                className="w-full h-full object-cover filter blur-2xl opacity-20 scale-125"
              />
            </div>
          )}

          {/* Caller Avatar with Animated Radar Ring */}
          <div className="relative mb-6">
            {callStatus !== 'connected' && (
              <>
                <div className="absolute inset-0 rounded-full border-2 border-[#16B8A6]/60 animate-radar pointer-events-none" />
                <div
                  className="absolute inset-0 rounded-full border-2 border-sky-400/40 animate-radar pointer-events-none"
                  style={{ animationDelay: '0.8s' }}
                />
              </>
            )}

            <div className="relative w-28 h-28 sm:w-36 sm:h-36 rounded-full overflow-hidden border-4 border-[#16B8A6]/70 shadow-2xl p-1 bg-slate-900/60">
              <img
                src={participant.avatar}
                alt={participant.username}
                className="w-full h-full rounded-full object-cover"
              />
            </div>

            {callStatus === 'connected' && (
              <div className="absolute bottom-1 right-2 w-5 h-5 bg-emerald-500 rounded-full border-2 border-[#101820] flex items-center justify-center">
                <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
              </div>
            )}
          </div>

          {/* User Details */}
          <h2 className="text-2xl font-black tracking-tight text-white mb-1">
            {participant.username}
          </h2>
          <p className="text-xs font-mono font-medium text-slate-300/80 mb-3 bg-white/10 px-2.5 py-0.5 rounded-md">
            UID: {participant.uid}
          </p>

          {/* Call Status Indicator */}
          <div className="text-center font-medium">
            {callStatus === 'calling' && (
              <p className="text-sm text-sky-300 font-medium animate-pulse">Calling...</p>
            )}
            {callStatus === 'ringing' && (
              <p className="text-sm text-teal-300 font-medium animate-pulse">Ringing...</p>
            )}
            {callStatus === 'connected' && (
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-base font-mono font-bold tracking-wider text-emerald-400">
                  {formatDuration(duration)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Small Local Video Preview Pip for Video Call */}
        {session.type === 'video' && (
          <div className="absolute top-20 right-4 sm:right-6 z-20 w-28 h-36 sm:w-36 sm:h-48 rounded-2xl overflow-hidden bg-slate-900 border-2 border-white/20 shadow-2xl">
            {isVideoOff ? (
              <div className="w-full h-full flex flex-col items-center justify-center bg-slate-800 text-slate-400 text-xs">
                <VideoOff size={22} className="mb-1" />
                <span>Camera Off</span>
              </div>
            ) : (
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover transform -scale-x-100"
              />
            )}
            <span className="absolute bottom-2 left-2 text-[10px] bg-black/60 px-1.5 py-0.5 rounded-md font-medium text-white/90">
              You
            </span>
          </div>
        )}

        {/* Bottom Call Controls Toolbar */}
        <div className="p-6 bg-gradient-to-t from-[#0B132B] to-transparent z-20 flex flex-col items-center gap-4">
          <div className="flex items-center justify-center gap-3 sm:gap-5 flex-wrap">
            {/* Microphone Toggle */}
            <button
              onClick={toggleMute}
              className={`w-13 h-13 rounded-full flex items-center justify-center transition-all ${
                isMuted
                  ? 'bg-rose-500 text-white'
                  : 'bg-white/15 hover:bg-white/25 text-white backdrop-blur-md'
              }`}
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? <MicOff size={22} /> : <Mic size={22} />}
            </button>

            {/* Video Camera Toggle */}
            <button
              onClick={toggleVideo}
              className={`w-13 h-13 rounded-full flex items-center justify-center transition-all ${
                isVideoOff
                  ? 'bg-rose-500 text-white'
                  : 'bg-white/15 hover:bg-white/25 text-white backdrop-blur-md'
              }`}
              title={isVideoOff ? 'Turn Camera On' : 'Turn Camera Off'}
            >
              {isVideoOff ? <VideoOff size={22} /> : <Video size={22} />}
            </button>

            {/* Speaker Toggle */}
            <button
              onClick={() => setIsSpeakerOn(!isSpeakerOn)}
              className={`w-13 h-13 rounded-full flex items-center justify-center transition-all ${
                !isSpeakerOn
                  ? 'bg-slate-700 text-slate-400'
                  : 'bg-white/15 hover:bg-white/25 text-white backdrop-blur-md'
              }`}
              title={isSpeakerOn ? 'Speaker On' : 'Speaker Off'}
            >
              {isSpeakerOn ? <Volume2 size={22} /> : <VolumeX size={22} />}
            </button>

            {/* Flip Camera if video call */}
            {session.type === 'video' && !isVideoOff && (
              <button
                onClick={toggleCameraFacing}
                className="w-13 h-13 rounded-full bg-white/15 hover:bg-white/25 text-white backdrop-blur-md flex items-center justify-center transition-all"
                title="Switch Camera (Front/Back)"
              >
                <SwitchCamera size={22} />
              </button>
            )}

            {/* End Call Button */}
            <button
              onClick={onEndCall}
              className="w-15 h-15 rounded-full bg-rose-600 hover:bg-rose-700 text-white flex items-center justify-center shadow-lg transition-transform active:scale-95 ml-2"
              title="End Call"
            >
              <PhoneOff size={26} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
