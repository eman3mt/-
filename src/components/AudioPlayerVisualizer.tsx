import React, { useEffect, useRef, useState } from 'react';
import { GeneratedAudioItem, AmbientSoundId } from '../types';
import { AMBIENT_SOUNDSCAPES } from '../data/saudiData';
import { formatDuration, downloadAudioFile } from '../utils/audioUtils';
import { ambientEngine } from '../utils/ambientAudio';
import {
  Play,
  Pause,
  Download,
  RotateCcw,
  Volume2,
  VolumeX,
  Volume1,
  Heart,
  Copy,
  Check,
  Sparkles,
  MapPin,
  Smile,
  Mic,
  Gauge,
  Music,
  Coffee,
  Store,
  Wind,
  Waves,
  CloudRain,
  Palmtree,
  Sliders,
  Layers,
  ChevronDown
} from 'lucide-react';

interface AudioPlayerVisualizerProps {
  item: GeneratedAudioItem | null;
  activeAmbientSound?: AmbientSoundId;
  ambientVolume?: number;
  onToggleFavorite?: (id: string) => void;
}

export const AudioPlayerVisualizer: React.FC<AudioPlayerVisualizerProps> = ({
  item,
  activeAmbientSound,
  ambientVolume = 0.35,
  onToggleFavorite,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isLooping, setIsLooping] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isAmbientMuted, setIsAmbientMuted] = useState(false);
  const [isRenderingMix, setIsRenderingMix] = useState(false);
  const [downloadMenuOpen, setDownloadMenuOpen] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Resolved ambient sound from item or active prop
  const currentAmbientId = item?.ambientSound || activeAmbientSound || 'none';
  const ambientObj = AMBIENT_SOUNDSCAPES.find((s) => s.id === currentAmbientId) || AMBIENT_SOUNDSCAPES[0];

  // Setup Audio Object when item changes
  useEffect(() => {
    if (!item?.wavBlobUrl) return;

    if (audioRef.current) {
      audioRef.current.pause();
    }

    ambientEngine.stop();

    const audio = new Audio(item.wavBlobUrl);
    audioRef.current = audio;
    audio.loop = isLooping;

    audio.onloadedmetadata = () => {
      setDuration(audio.duration || item.durationSeconds || 1.0);
      setCurrentTime(0);
      // Auto-play newly generated audio
      audio.play().then(() => {
        setIsPlaying(true);
        if (currentAmbientId !== 'none' && !isAmbientMuted) {
          ambientEngine.start(currentAmbientId, ambientVolume);
        }
      }).catch(() => setIsPlaying(false));
    };

    audio.ontimeupdate = () => {
      setCurrentTime(audio.currentTime);
    };

    audio.onended = () => {
      if (!isLooping) {
        setIsPlaying(false);
        setCurrentTime(0);
        ambientEngine.stop();
      }
    };

    return () => {
      audio.pause();
      ambientEngine.stop();
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [item?.wavBlobUrl, currentAmbientId]);

  // Sync ambient engine volume with prop changes
  useEffect(() => {
    if (isAmbientMuted) {
      ambientEngine.setVolume(0);
    } else {
      ambientEngine.setVolume(ambientVolume);
    }
  }, [ambientVolume, isAmbientMuted]);

  // Handle Play/Pause
  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      ambientEngine.stop();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
        if (currentAmbientId !== 'none' && !isAmbientMuted) {
          ambientEngine.start(currentAmbientId, ambientVolume);
        }
      }).catch(console.error);
    }
  };

  // Handle Seek
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!audioRef.current) return;
    const time = parseFloat(e.target.value);
    audioRef.current.currentTime = time;
    setCurrentTime(time);
  };

  // Handle Loop
  const toggleLoop = () => {
    if (audioRef.current) {
      audioRef.current.loop = !isLooping;
    }
    setIsLooping(!isLooping);
  };

  // Handle Mute Voice
  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
    }
    setIsMuted(!isMuted);
  };

  // Handle Toggle Ambient Mute in Player
  const toggleAmbientMute = () => {
    const nextMuted = !isAmbientMuted;
    setIsAmbientMuted(nextMuted);
    if (nextMuted) {
      ambientEngine.setVolume(0);
    } else {
      ambientEngine.setVolume(ambientVolume);
      if (isPlaying && currentAmbientId !== 'none') {
        ambientEngine.start(currentAmbientId, ambientVolume);
      }
    }
  };

  // Handle Pure Voice Download
  const handleDownloadPure = () => {
    if (!item?.wavBlobUrl) return;
    const safeRegion = item.regionName.replace(/\s+/g, '_');
    const safeVoice = item.voiceName.replace(/\s+/g, '_');
    const filename = `صوت_سعودي_${safeRegion}_${safeVoice}_نقي_${Date.now()}.wav`;
    downloadAudioFile(item.wavBlobUrl, filename);
    setDownloadMenuOpen(false);
  };

  // Handle Mixed Voice + Ambient Soundscape Download
  const handleDownloadMixed = async () => {
    if (!item?.audioBase64 || currentAmbientId === 'none') {
      handleDownloadPure();
      return;
    }

    try {
      setIsRenderingMix(true);
      const mixedBlob = await ambientEngine.renderMixedWavBlob(
        item.audioBase64,
        currentAmbientId,
        ambientVolume,
        24000
      );
      const mixedUrl = URL.createObjectURL(mixedBlob);
      const safeRegion = item.regionName.replace(/\s+/g, '_');
      const safeVoice = item.voiceName.replace(/\s+/g, '_');
      const safeAmbient = ambientObj.name.replace(/\s+/g, '_');
      const filename = `صوت_سعودي_${safeRegion}_${safeVoice}_مع_${safeAmbient}_${Date.now()}.wav`;
      downloadAudioFile(mixedUrl, filename);
    } catch (err) {
      console.error('Failed to render mixed audio, falling back to pure audio', err);
      handleDownloadPure();
    } finally {
      setIsRenderingMix(false);
      setDownloadMenuOpen(false);
    }
  };

  // Handle Copy Text
  const handleCopyText = () => {
    if (!item?.text) return;
    navigator.clipboard.writeText(item.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Get Ambient Icon
  const getAmbientIcon = (iconName: string) => {
    switch (iconName) {
      case 'Coffee':
        return <Coffee className="w-3.5 h-3.5" />;
      case 'Store':
        return <Store className="w-3.5 h-3.5" />;
      case 'Wind':
        return <Wind className="w-3.5 h-3.5" />;
      case 'Waves':
        return <Waves className="w-3.5 h-3.5" />;
      case 'CloudRain':
        return <CloudRain className="w-3.5 h-3.5" />;
      case 'Palmtree':
        return <Palmtree className="w-3.5 h-3.5" />;
      case 'CupSoda':
        return <Coffee className="w-3.5 h-3.5" />;
      default:
        return <Music className="w-3.5 h-3.5" />;
    }
  };

  // Animated Waveform Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let phase = 0;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const width = canvas.width;
      const height = canvas.height;
      const bars = 48;
      const barWidth = width / bars - 2;

      for (let i = 0; i < bars; i++) {
        let barHeight: number;
        if (isPlaying) {
          // Dynamic wave animation when playing
          const progress = duration > 0 ? currentTime / duration : 0;
          const dist = Math.abs(i / bars - progress);
          const activeBoost = Math.max(0, 1 - dist * 3) * 15;
          const wave = Math.sin(i * 0.4 + phase) * 12 + Math.cos(i * 0.2 - phase * 1.5) * 8;
          barHeight = Math.max(4, Math.abs(wave) + 10 + activeBoost);
        } else {
          // Static calm wave when paused
          const staticWave = Math.sin(i * 0.3) * 8 + 12;
          barHeight = Math.max(4, staticWave);
        }

        const x = i * (barWidth + 2);
        const y = (height - barHeight) / 2;

        const isPast = duration > 0 ? (i / bars) <= (currentTime / duration) : false;

        const gradient = ctx.createLinearGradient(0, 0, 0, height);
        if (isPast) {
          gradient.addColorStop(0, '#10b981'); // Emerald 500
          gradient.addColorStop(1, '#059669'); // Emerald 600
        } else {
          gradient.addColorStop(0, '#44403c'); // Stone 700
          gradient.addColorStop(1, '#292524'); // Stone 800
        }

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, barHeight, 3);
        ctx.fill();
      }

      if (isPlaying) {
        phase += 0.08;
      }
      animationFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [isPlaying, currentTime, duration]);

  if (!item) {
    return (
      <div className="rounded-2xl border border-dashed border-stone-800 bg-stone-950/40 p-8 text-center flex flex-col items-center justify-center space-y-3">
        <div className="w-14 h-14 rounded-2xl bg-stone-900 flex items-center justify-center text-stone-600 border border-stone-800">
          <Volume2 className="w-7 h-7" />
        </div>
        <div className="max-w-sm">
          <h3 className="text-stone-300 font-semibold text-sm">مشغل الصوت السعودي في انتظارك</h3>
          <p className="text-stone-500 text-xs mt-1 leading-relaxed">
            اختر اللهجة، شخصية الصوت، النبرة، والمشاعر، وأضف خلفية بيئية (مقهى شعبي، سوق قديم، أو هدوء الصحراء) واضغط على زر "توليد الصوت السعودي".
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      id="saudi-audio-player"
      className="rounded-3xl border border-emerald-500/30 bg-gradient-to-b from-stone-900 via-stone-900 to-emerald-950/20 p-5 sm:p-6 shadow-2xl shadow-emerald-950/50 space-y-5"
    >
      {/* Top Bar: Metadata & Badges */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-800/80 pb-4">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-800/60 font-semibold">
            <MapPin className="w-3.5 h-3.5 text-emerald-400" />
            {item.regionName}
          </span>

          <span className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-stone-800 text-stone-200 border border-stone-700">
            <Mic className="w-3.5 h-3.5 text-stone-400" />
            {item.voiceName}
          </span>

          <span className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-amber-950/50 text-amber-300 border border-amber-800/50">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            {item.tone}
          </span>

          <span className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-rose-950/50 text-rose-300 border border-rose-800/50">
            <Smile className="w-3.5 h-3.5 text-rose-400" />
            {item.emotion}
          </span>

          <span className="flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-stone-800/80 text-stone-400">
            <Gauge className="w-3 h-3" />
            {item.speed}x
          </span>
        </div>

        {/* Favorite & Copy */}
        <div className="flex items-center gap-1.5">
          {onToggleFavorite && (
            <button
              type="button"
              onClick={() => onToggleFavorite(item.id)}
              className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                item.isFavorite
                  ? 'bg-rose-950/60 border-rose-700 text-rose-400'
                  : 'bg-stone-800/80 hover:bg-stone-800 border-stone-700 text-stone-400 hover:text-stone-200'
              }`}
              title={item.isFavorite ? 'إزالة من المفضلة' : 'إضافة إلى المفضلة'}
            >
              <Heart className={`w-4 h-4 ${item.isFavorite ? 'fill-rose-400' : ''}`} />
            </button>
          )}

          <button
            type="button"
            onClick={handleCopyText}
            className="p-2 rounded-xl bg-stone-800/80 hover:bg-stone-800 border border-stone-700 text-stone-300 transition-colors cursor-pointer"
            title="نسخ النص المنطوق"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Active Ambient Atmosphere Badge & Ambient Controller */}
      {currentAmbientId !== 'none' && (
        <div className="flex items-center justify-between flex-wrap gap-2 px-3.5 py-2.5 rounded-2xl bg-indigo-950/40 border border-indigo-800/50 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-900/80 flex items-center justify-center text-indigo-300">
              {getAmbientIcon(ambientObj.icon)}
            </div>
            <div>
              <span className="text-stone-400 text-[11px] block">الجو الصوتي المرفق:</span>
              <span className="font-bold text-indigo-200">{ambientObj.name}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleAmbientMute}
              className={`px-2.5 py-1 rounded-lg border text-[11px] font-semibold transition-all cursor-pointer flex items-center gap-1 ${
                isAmbientMuted
                  ? 'bg-stone-800 border-stone-700 text-stone-400'
                  : 'bg-indigo-900/60 border-indigo-600 text-indigo-200'
              }`}
            >
              {isAmbientMuted ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3 text-indigo-400" />}
              <span>{isAmbientMuted ? 'الخلفية مكتومة' : `الخلفية نشطة (${Math.round(ambientVolume * 100)}%)`}</span>
            </button>
          </div>
        </div>
      )}

      {/* Spoken Text Display */}
      <div className="bg-stone-950/60 rounded-2xl p-4 border border-stone-800/90 text-right">
        <p className="text-stone-100 text-sm sm:text-base leading-relaxed font-normal">
          "{item.text}"
        </p>
      </div>

      {/* Waveform Visualizer Canvas */}
      <div className="bg-stone-950/80 rounded-2xl p-3 border border-stone-800/80 flex items-center justify-center">
        <canvas
          ref={canvasRef}
          width={560}
          height={60}
          className="w-full h-14 rounded-lg"
        />
      </div>

      {/* Seekbar & Time */}
      <div className="space-y-1">
        <input
          type="range"
          min="0"
          max={duration || 1}
          step="0.01"
          value={currentTime}
          onChange={handleSeek}
          className="w-full h-2 bg-stone-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
        />
        <div className="flex items-center justify-between text-xs text-stone-400 font-mono">
          <span>{formatDuration(currentTime)}</span>
          <span>{formatDuration(duration)}</span>
        </div>
      </div>

      {/* Player Controls & Download Dropdown */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-1">
        
        {/* Playback Controls */}
        <div className="flex items-center gap-3">
          <button
            id="play-pause-btn"
            type="button"
            onClick={togglePlay}
            className="w-12 h-12 rounded-2xl bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-stone-950 flex items-center justify-center shadow-lg shadow-emerald-950/80 transition-all cursor-pointer"
            title={isPlaying ? 'إيقاف مؤقت' : 'تشغيل الصوت'}
          >
            {isPlaying ? (
              <Pause className="w-6 h-6 fill-stone-950" />
            ) : (
              <Play className="w-6 h-6 fill-stone-950 ml-0.5" />
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              if (audioRef.current) {
                audioRef.current.currentTime = 0;
                audioRef.current.play().then(() => {
                  setIsPlaying(true);
                  if (currentAmbientId !== 'none' && !isAmbientMuted) {
                    ambientEngine.start(currentAmbientId, ambientVolume);
                  }
                });
              }
            }}
            className="p-2.5 rounded-xl bg-stone-800 hover:bg-stone-750 text-stone-300 border border-stone-700 transition-all cursor-pointer"
            title="إعادة من البداية"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={toggleLoop}
            className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
              isLooping
                ? 'bg-emerald-950/70 border-emerald-600 text-emerald-300'
                : 'bg-stone-800 hover:bg-stone-750 text-stone-400 border-stone-700'
            }`}
            title="تكرار مستمر"
          >
            <span className="text-xs font-bold">🔁</span>
          </button>

          <button
            type="button"
            onClick={toggleMute}
            className="p-2.5 rounded-xl bg-stone-800 hover:bg-stone-750 text-stone-300 border border-stone-700 transition-all cursor-pointer"
            title={isMuted ? 'إلغاء الكتم' : 'كتم الصوت'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>

        {/* Download Group with Options (Pure WAV vs Mixed WAV) */}
        <div className="relative w-full sm:w-auto">
          {currentAmbientId === 'none' ? (
            <button
              id="download-audio-btn"
              type="button"
              onClick={handleDownloadPure}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-stone-100 hover:bg-white text-stone-950 font-bold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all cursor-pointer active:scale-95"
              title="تنزيل الملف الصوتي بصيغة WAV نقية 24kHz"
            >
              <Download className="w-4 h-4 text-stone-950" />
              <span>تنزيل المقطع الصوتي (WAV نقية)</span>
            </button>
          ) : (
            <div className="flex items-center gap-1.5 w-full sm:w-auto">
              <button
                type="button"
                onClick={handleDownloadMixed}
                disabled={isRenderingMix}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-stone-950 font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer disabled:opacity-50"
                title="تنزيل مقطع الصوت مدمجاً مع المؤثرات البيئية"
              >
                <Layers className="w-4 h-4" />
                <span>{isRenderingMix ? 'جارٍ دمج الأجواء...' : 'تنزيل مدمج مع الأجواء'}</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadPure}
                className="px-3.5 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-750 text-stone-200 border border-stone-700 font-semibold text-xs transition-all cursor-pointer"
                title="تنزيل الصوت المنطوق فقط بدون خلفية"
              >
                <span>صوت نقي</span>
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
