import React, { useState } from 'react';
import { AMBIENT_SOUNDSCAPES } from '../data/saudiData';
import { AmbientSoundId, AmbientSoundscape } from '../types';
import { ambientEngine } from '../utils/ambientAudio';
import {
  Sliders,
  Gauge,
  VolumeX,
  Volume2,
  Sparkles,
  Music,
  ChevronDown,
  ChevronUp,
  Coffee,
  Store,
  Wind,
  Waves,
  CloudRain,
  Play,
  Square,
  Check,
  Palmtree,
  SlidersHorizontal,
  Volume1
} from 'lucide-react';

interface AdvancedOptionsProps {
  speed: number;
  onChangeSpeed: (speed: number) => void;
  pitch: string;
  onChangePitch: (pitch: string) => void;
  ambientSound: AmbientSoundId;
  onChangeAmbientSound: (ambient: AmbientSoundId) => void;
  ambientVolume: number;
  onChangeAmbientVolume: (volume: number) => void;
  isOpen: boolean;
  onToggleOpen: () => void;
}

export const AdvancedOptions: React.FC<AdvancedOptionsProps> = ({
  speed,
  onChangeSpeed,
  pitch,
  onChangePitch,
  ambientSound,
  onChangeAmbientSound,
  ambientVolume,
  onChangeAmbientVolume,
  isOpen,
  onToggleOpen,
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [previewingId, setPreviewingId] = useState<AmbientSoundId | null>(null);

  const speedOptions = [
    { label: '0.75x (متمهل جداً)', value: 0.75 },
    { label: '0.9x (هادئ)', value: 0.9 },
    { label: '1.0x (طبيعي)', value: 1.0 },
    { label: '1.15x (سلس)', value: 1.15 },
    { label: '1.25x (سريع)', value: 1.25 },
    { label: '1.5x (سريع جداً)', value: 1.5 },
  ];

  const pitchOptions = [
    { label: 'منخفض وجهوري', value: 'منخفض وعميق' },
    { label: 'متزن وطبيعي', value: 'عادي ومتوازن' },
    { label: 'مرتفع ونشط', value: 'مرتفع وحاد قليلاً' },
  ];

  const categories = [
    { id: 'all', label: 'كافة الأجواء الصوتية' },
    { id: 'urban', label: 'أماكن ومقاهي' },
    { id: 'heritage', label: 'تراث ومجالس' },
    { id: 'nature', label: 'صحراء وطبيعة' },
  ];

  const filteredAmbients = activeCategory === 'all'
    ? AMBIENT_SOUNDSCAPES
    : AMBIENT_SOUNDSCAPES.filter((s) => s.category === activeCategory || s.id === 'none');

  // Handle ambient preview audio playback
  const handleTogglePreview = (id: AmbientSoundId, e: React.MouseEvent) => {
    e.stopPropagation();
    if (previewingId === id) {
      ambientEngine.stop();
      setPreviewingId(null);
    } else {
      if (id === 'none') {
        ambientEngine.stop();
        setPreviewingId(null);
        return;
      }
      ambientEngine.preview(id, 7000, () => {
        setPreviewingId(null);
      });
      setPreviewingId(id);
    }
  };

  const getAmbientIcon = (iconName: string, className: string = 'w-4 h-4') => {
    switch (iconName) {
      case 'Coffee':
        return <Coffee className={className} />;
      case 'Store':
        return <Store className={className} />;
      case 'Wind':
        return <Wind className={className} />;
      case 'Waves':
        return <Waves className={className} />;
      case 'CloudRain':
        return <CloudRain className={className} />;
      case 'Palmtree':
        return <Palmtree className={className} />;
      case 'CupSoda':
        return <Coffee className={className} />;
      case 'VolumeX':
      default:
        return <VolumeX className={className} />;
    }
  };

  const currentAmbientObj = AMBIENT_SOUNDSCAPES.find((s) => s.id === ambientSound) || AMBIENT_SOUNDSCAPES[0];

  return (
    <div className="rounded-2xl border border-stone-800 bg-stone-900/60 overflow-hidden transition-all">
      {/* Header toggle */}
      <button
        type="button"
        onClick={onToggleOpen}
        className="w-full px-4 py-3.5 flex items-center justify-between text-stone-200 hover:bg-stone-850/80 transition-colors cursor-pointer select-none"
      >
        <div className="flex items-center gap-2 flex-wrap">
          <Sliders className="w-4 h-4 text-emerald-400" />
          <span className="text-sm font-semibold text-stone-100">
            الخيارات المتقدمة والأجواء الصوتية (Ambient Sounds)
          </span>
          <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-stone-800 text-stone-300 font-normal">
            السرعة: {speed}x • الجو: {currentAmbientObj.name.split(' ')[0]} {ambientSound !== 'none' ? `(${Math.round(ambientVolume * 100)}%)` : ''}
          </span>
        </div>

        <div className="text-stone-400">
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      {/* Expanded Content */}
      {isOpen && (
        <div className="p-4 pt-3 border-t border-stone-800/80 space-y-6 bg-stone-950/40 text-right">
          
          {/* 1. Speed Selector */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-stone-300 flex items-center gap-1.5">
                <Gauge className="w-3.5 h-3.5 text-amber-400" />
                <span>سرعة النطق والإلقاء</span>
              </label>
              <span className="text-xs text-amber-400 font-bold">{speed}x</span>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
              {speedOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => onChangeSpeed(opt.value)}
                  className={`py-1.5 px-2 rounded-xl text-xs font-medium border transition-all cursor-pointer ${
                    speed === opt.value
                      ? 'bg-amber-950/50 border-amber-500 text-amber-200 shadow-sm'
                      : 'bg-stone-900 border-stone-800 text-stone-400 hover:text-stone-200 hover:border-stone-700'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* 2. Pitch Selector */}
          <div>
            <label className="text-xs font-semibold text-stone-300 flex items-center gap-1.5 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>طبقة وحدة الصوت</span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {pitchOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => onChangePitch(opt.value)}
                  className={`py-2 px-3 rounded-xl text-xs font-medium border text-center transition-all cursor-pointer ${
                    pitch === opt.value
                      ? 'bg-emerald-950/50 border-emerald-500 text-emerald-200 shadow-sm'
                      : 'bg-stone-900 border-stone-800 text-stone-400 hover:text-stone-200 hover:border-stone-700'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* 3. Expanded Ambient Sounds (الأجواء والمؤثرات الصوتية البيئية) */}
          <div className="space-y-3.5 pt-2 border-t border-stone-800/80">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <label className="text-xs font-bold text-stone-200 flex items-center gap-1.5">
                  <Music className="w-4 h-4 text-indigo-400" />
                  <span>الأجواء الصوتية والمؤثرات الواقعية (Ambient Sounds)</span>
                </label>
                <p className="text-[11px] text-stone-400 mt-0.5">
                  أضف خلفية صوتية محيطية تحاكي المقاهي، الأسواق التراثية، هدوء الصحراء، ومجالس الضيافة.
                </p>
              </div>

              {/* Volume Slider if ambient is enabled */}
              {ambientSound !== 'none' && (
                <div className="flex items-center gap-2 bg-stone-900 border border-stone-800 px-3 py-1.5 rounded-xl">
                  <Volume1 className="w-3.5 h-3.5 text-indigo-400" />
                  <span className="text-[11px] text-stone-300 font-medium">مستوى الخلفية:</span>
                  <input
                    type="range"
                    min="0.05"
                    max="0.8"
                    step="0.05"
                    value={ambientVolume}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      onChangeAmbientVolume(val);
                      ambientEngine.setVolume(val);
                    }}
                    className="w-20 accent-indigo-500 h-1.5 bg-stone-800 rounded-lg cursor-pointer"
                  />
                  <span className="text-[11px] text-indigo-300 font-bold min-w-8 text-center">
                    {Math.round(ambientVolume * 100)}%
                  </span>
                </div>
              )}
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-3 py-1 rounded-xl text-[11px] font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    activeCategory === cat.id
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-stone-900 text-stone-400 hover:text-stone-200 hover:bg-stone-850'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Ambient Soundscape Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {filteredAmbients.map((ambient) => {
                const isSelected = ambientSound === ambient.id;
                const isPreviewing = previewingId === ambient.id;

                return (
                  <div
                    key={ambient.id}
                    onClick={() => {
                      onChangeAmbientSound(ambient.id);
                      if (previewingId && previewingId !== ambient.id) {
                        ambientEngine.stop();
                        setPreviewingId(null);
                      }
                    }}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between relative group ${
                      isSelected
                        ? 'border-indigo-500 bg-gradient-to-b from-indigo-950/50 via-stone-900 to-stone-900 shadow-md shadow-indigo-950/40'
                        : 'border-stone-800 bg-stone-900/70 hover:border-stone-700 hover:bg-stone-900'
                    }`}
                  >
                    {/* Top Row: Icon & Title & Badges */}
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-8 h-8 rounded-xl flex items-center justify-center border transition-all ${
                              isSelected
                                ? 'bg-indigo-900/80 border-indigo-500 text-indigo-300'
                                : 'bg-stone-850 border-stone-800 text-stone-400 group-hover:text-stone-200'
                            }`}
                          >
                            {getAmbientIcon(ambient.icon, 'w-4 h-4')}
                          </div>
                          <div>
                            <h4
                              className={`text-xs font-bold transition-colors ${
                                isSelected ? 'text-indigo-200' : 'text-stone-200'
                              }`}
                            >
                              {ambient.name}
                            </h4>
                            <span className="text-[10px] text-stone-400 block font-normal">
                              {ambient.englishName}
                            </span>
                          </div>
                        </div>

                        {isSelected && (
                          <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0">
                            <Check className="w-3 h-3" />
                          </span>
                        )}
                      </div>

                      <p className="text-[11px] text-stone-300 line-clamp-2 leading-relaxed mb-2.5">
                        {ambient.description}
                      </p>
                    </div>

                    {/* Bottom Row: Sound elements & Live Preview Button */}
                    <div className="pt-2 border-t border-stone-800/80 flex items-center justify-between gap-2">
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-stone-800 text-stone-400 font-medium truncate max-w-[140px]">
                        {ambient.badge}
                      </span>

                      {ambient.id !== 'none' && (
                        <button
                          type="button"
                          onClick={(e) => handleTogglePreview(ambient.id, e)}
                          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-all cursor-pointer ${
                            isPreviewing
                              ? 'bg-rose-950 border-rose-600 text-rose-300 animate-pulse'
                              : 'bg-stone-800 hover:bg-stone-750 border-stone-700 text-stone-300 hover:text-white'
                          }`}
                          title="استمع لعينة من هذا الجو الصوتي"
                        >
                          {isPreviewing ? (
                            <>
                              <Square className="w-2.5 h-2.5 fill-rose-400" />
                              <span>إيقاف المعاينة</span>
                            </>
                          ) : (
                            <>
                              <Play className="w-2.5 h-2.5 fill-stone-300" />
                              <span>معاينة الجو</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      )}
    </div>
  );
};
