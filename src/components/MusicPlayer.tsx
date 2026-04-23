import { useState, useRef, useEffect } from 'react';
import { Play, Pause, SkipForward, SkipBack, Volume2, AudioLines } from 'lucide-react';

const TRACKS = [
  {
    id: 1,
    title: "Neon Echoes",
    artist: "SynthAI - Model X",
    url: "https://www.soundhelix.com/examples/src/SoundHelix-Song-1.mp3"
  },
  {
    id: 2,
    title: "Cybernetic Groove",
    artist: "SynthAI - Model Y",
    url: "https://www.soundhelix.com/examples/src/SoundHelix-Song-2.mp3"
  },
  {
    id: 3,
    title: "Digital Horizon",
    artist: "SynthAI - Model Z",
    url: "https://www.soundhelix.com/examples/src/SoundHelix-Song-3.mp3"
  }
];

export default function MusicPlayer() {
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const currentTrack = TRACKS[currentTrackIndex];

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  useEffect(() => {
    if (isPlaying && audioRef.current) {
      audioRef.current.play().catch(e => {
        console.error("Audio playback failed:", e);
        setIsPlaying(false);
      });
    }
  }, [currentTrackIndex, isPlaying]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(e => console.error("Audio play error", e));
    }
    setIsPlaying(!isPlaying);
  };

  const handleNext = () => {
    setCurrentTrackIndex((prev) => (prev + 1) % TRACKS.length);
  };

  const handlePrev = () => {
    setCurrentTrackIndex((prev) => (prev - 1 + TRACKS.length) % TRACKS.length);
  };

  const handleEnded = () => {
    handleNext();
  };

  return (
    <div className="glass p-4 md:p-6 w-full flex flex-col md:flex-row items-center justify-between gap-4">
      <audio
        ref={audioRef}
        src={currentTrack.url}
        onEnded={handleEnded}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        preload="metadata"
      />
      
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 w-full">
        {/* Track Info */}
        <div className="flex items-center gap-4 w-full md:w-1/3">
          <div className="w-12 h-12 rounded-lg bg-pink-500 flex items-center justify-center flex-shrink-0">
            <AudioLines className={`text-white w-6 h-6 ${isPlaying ? 'animate-pulse' : ''}`} />
          </div>
          <div className="flex flex-col overflow-hidden">
            <span className="font-bold text-sm tracking-wide truncate">
              {currentTrack.title}
            </span>
            <span className="text-slate-400 text-xs truncate">
              {currentTrack.artist}
            </span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-6 w-full md:w-1/3 text-slate-300 flex-shrink-0">
          <button 
            onClick={handlePrev} 
            className="hover:text-white transition-colors p-2 rounded-full"
          >
            <SkipBack className="w-5 h-5 fill-current" />
          </button>
          
          <button 
            onClick={togglePlay}
            className="w-10 h-10 flex items-center justify-center rounded-full border border-white text-white hover:bg-white/10 transition-all transform hover:scale-105 flex-shrink-0"
          >
            {isPlaying ? (
              <Pause className="w-5 h-5 fill-current" />
            ) : (
              <Play className="w-5 h-5 fill-current translate-x-0.5" />
            )}
          </button>
          
          <button 
            onClick={handleNext}
            className="hover:text-white transition-colors p-2 rounded-full"
          >
            <SkipForward className="w-5 h-5 fill-current" />
          </button>
        </div>

        {/* Volume */}
        <div className="hidden md:flex items-center justify-end gap-3 w-1/3 text-slate-400">
          <Volume2 className="w-4 h-4 fill-current flex-shrink-0" />
          <div className="w-24 h-1 bg-slate-700 rounded-full relative cursor-pointer overflow-hidden border border-slate-700/50">
             <div 
               className="absolute left-0 top-0 h-full bg-slate-400 rounded-full pointer-events-none" 
               style={{ width: `${volume * 100}%` }}
             ></div>
             <input
               type="range"
               min="0"
               max="1"
               step="0.01"
               value={volume}
               onChange={(e) => setVolume(parseFloat(e.target.value))}
               className="absolute inset-0 opacity-0 cursor-pointer w-full"
             />
          </div>
        </div>
      </div>
    </div>
  );
}
