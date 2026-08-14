import React from 'react';
import { VOICE_PERSONAS, VOICE_TONES, EMOTIONAL_EXPRESSIONS } from '../data/saudiData';
import { Gender, VoicePersona, VoiceTone, EmotionalExpression } from '../types';
import { User, Users, Heart, Sparkles, Award, Megaphone, BookOpen, Coffee, Feather, Smile, Check } from 'lucide-react';

interface VoiceAndToneSelectorProps {
  selectedGender: Gender;
  onSelectGender: (gender: Gender) => void;
  selectedVoiceId: string;
  onSelectVoice: (voice: VoicePersona) => void;
  selectedToneId: string;
  onSelectTone: (tone: VoiceTone) => void;
  selectedEmotionId: string;
  onSelectEmotion: (emotion: EmotionalExpression) => void;
}

const ToneIconMap: Record<string, React.ReactNode> = {
  Heart: <Heart className="w-4 h-4 text-rose-400" />,
  Sparkles: <Sparkles className="w-4 h-4 text-amber-400" />,
  Award: <Award className="w-4 h-4 text-emerald-400" />,
  Megaphone: <Megaphone className="w-4 h-4 text-cyan-400" />,
  BookOpen: <BookOpen className="w-4 h-4 text-indigo-400" />,
  Coffee: <Coffee className="w-4 h-4 text-orange-400" />,
  Feather: <Feather className="w-4 h-4 text-purple-400" />,
};

export const VoiceAndToneSelector: React.FC<VoiceAndToneSelectorProps> = ({
  selectedGender,
  onSelectGender,
  selectedVoiceId,
  onSelectVoice,
  selectedToneId,
  onSelectTone,
  selectedEmotionId,
  onSelectEmotion,
}) => {
  const filteredVoices = VOICE_PERSONAS.filter((v) => v.gender === selectedGender);

  return (
    <div className="space-y-6">
      
      {/* 2. Voice Persona & Gender */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-semibold text-stone-200 flex items-center gap-2">
            <User className="w-4 h-4 text-emerald-400" />
            <span>٢. الجنس وشخصية الصوت</span>
          </label>

          {/* Gender Toggle */}
          <div className="flex bg-stone-900 p-1 rounded-xl border border-stone-800">
            <button
              id="gender-female-btn"
              type="button"
              onClick={() => {
                onSelectGender('female');
                const defaultFemale = VOICE_PERSONAS.find((v) => v.gender === 'female');
                if (defaultFemale) onSelectVoice(defaultFemale);
              }}
              className={`flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                selectedGender === 'female'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              <span>أصوات نسائية</span>
              <span className="text-[10px] opacity-80">(٣)</span>
            </button>

            <button
              id="gender-male-btn"
              type="button"
              onClick={() => {
                onSelectGender('male');
                const defaultMale = VOICE_PERSONAS.find((v) => v.gender === 'male');
                if (defaultMale) onSelectVoice(defaultMale);
              }}
              className={`flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                selectedGender === 'male'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              <span>أصوات رجالية</span>
              <span className="text-[10px] opacity-80">(٣)</span>
            </button>
          </div>
        </div>

        {/* Voice Persona Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {filteredVoices.map((voice) => {
            const isSelected = selectedVoiceId === voice.id;
            return (
              <div
                key={voice.id}
                id={`voice-card-${voice.id}`}
                onClick={() => onSelectVoice(voice)}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer text-right flex flex-col justify-between select-none ${
                  isSelected
                    ? 'bg-gradient-to-b from-stone-900 to-emerald-950/30 border-emerald-500 ring-1 ring-emerald-500/40 shadow-md shadow-emerald-950/30'
                    : 'bg-stone-900/70 hover:bg-stone-850 border-stone-800 hover:border-stone-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
                          isSelected
                            ? 'bg-emerald-500 text-stone-950 font-bold'
                            : 'bg-stone-800 text-stone-300'
                        }`}
                      >
                        {voice.name.charAt(0)}
                      </div>
                      <span className="font-bold text-stone-100 text-sm">{voice.name}</span>
                    </div>

                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-stone-800 text-stone-300 font-medium">
                      {voice.tag}
                    </span>
                  </div>

                  <p className="text-xs text-stone-400 leading-relaxed mb-2 font-normal">
                    {voice.personality}
                  </p>
                </div>

                <div className="pt-2 border-t border-stone-800/80 text-[11px] text-emerald-400/90 font-medium">
                  يناسب: {voice.bestSuitedFor}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Voice Tone (نبرة الصوت) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-semibold text-stone-200 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>٣. نبرة الصوت والإلقاء</span>
          </label>
          <span className="text-xs text-stone-400">حدد أسلوب ونمط الأداء الصوتي</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
          {VOICE_TONES.map((tone) => {
            const isSelected = selectedToneId === tone.id;
            return (
              <button
                key={tone.id}
                id={`tone-pill-${tone.id}`}
                type="button"
                onClick={() => onSelectTone(tone)}
                className={`p-2.5 rounded-xl border text-right transition-all cursor-pointer flex flex-col justify-between select-none ${
                  isSelected
                    ? 'bg-amber-950/30 border-amber-500 text-amber-200 ring-1 ring-amber-500/40 shadow-sm'
                    : 'bg-stone-900/60 hover:bg-stone-850 border-stone-800 text-stone-300 hover:border-stone-700'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <div className="flex items-center gap-1.5">
                    {ToneIconMap[tone.icon] || <Sparkles className="w-4 h-4" />}
                    <span className="text-xs font-bold">{tone.name}</span>
                  </div>
                  {isSelected && <Check className="w-3.5 h-3.5 text-amber-400" />}
                </div>
                <p className="text-[10px] text-stone-400 leading-tight">
                  {tone.description}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Emotional Expression (المشاعر والتعبير) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-semibold text-stone-200 flex items-center gap-2">
            <Smile className="w-4 h-4 text-rose-400" />
            <span>٤. التعبير العاطفي والمشاعر</span>
          </label>
          <span className="text-xs text-stone-400">
            تضمين المشاعر الحية في نبرة النطق
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {EMOTIONAL_EXPRESSIONS.map((emotion) => {
            const isSelected = selectedEmotionId === emotion.id;
            return (
              <button
                key={emotion.id}
                id={`emotion-pill-${emotion.id}`}
                type="button"
                onClick={() => onSelectEmotion(emotion)}
                className={`p-2.5 rounded-xl border text-right transition-all cursor-pointer flex items-center justify-between select-none ${
                  isSelected
                    ? 'bg-rose-950/30 border-rose-500 text-rose-200 ring-1 ring-rose-500/40 shadow-sm'
                    : 'bg-stone-900/60 hover:bg-stone-850 border-stone-800 text-stone-300 hover:border-stone-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">{emotion.emoji}</span>
                  <div>
                    <span className="text-xs font-bold block">{emotion.name}</span>
                    <span className="text-[10px] text-stone-400 block">{emotion.description}</span>
                  </div>
                </div>
                {isSelected && <Check className="w-3.5 h-3.5 text-rose-400 shrink-0" />}
              </button>
            );
          })}
        </div>
      </div>

    </div>
  );
};
