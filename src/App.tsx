import React, { useState, useEffect } from 'react';
import { SAUDI_REGIONS, VOICE_PERSONAS, VOICE_TONES, EMOTIONAL_EXPRESSIONS, PRESET_TEMPLATES, AMBIENT_SOUNDSCAPES } from './data/saudiData';
import {
  SaudiRegionCode,
  SaudiRegion,
  Gender,
  VoicePersona,
  VoiceTone,
  EmotionalExpression,
  GeneratedAudioItem,
  PresetTemplate,
  AmbientSoundId,
} from './types';
import { pcmToWavBlob, calculatePcmDuration } from './utils/audioUtils';
import { Header } from './components/Header';
import { DialectSelector } from './components/DialectSelector';
import { VoiceAndToneSelector } from './components/VoiceAndToneSelector';
import { TextPromptEditor } from './components/TextPromptEditor';
import { AdvancedOptions } from './components/AdvancedOptions';
import { AudioPlayerVisualizer } from './components/AudioPlayerVisualizer';
import { HistoryPanel } from './components/HistoryPanel';
import { SamplePhrasesModal } from './components/SamplePhrasesModal';
import { DialectComparisonModal } from './components/DialectComparisonModal';
import { BrandLogo } from './components/BrandLogo';
import { AlertCircle, CheckCircle2, Sparkles, Volume2 } from 'lucide-react';

const LOCAL_STORAGE_KEY = 'saudi_tts_history_v1';

export default function App() {
  // State for selections
  const [selectedRegion, setSelectedRegion] = useState<SaudiRegionCode>('najdi');
  const [selectedGender, setSelectedGender] = useState<Gender>('female');
  const [selectedVoice, setSelectedVoice] = useState<VoicePersona>(
    VOICE_PERSONAS.find((v) => v.id === 'noura') || VOICE_PERSONAS[0]
  );
  const [selectedTone, setSelectedTone] = useState<VoiceTone>(VOICE_TONES[0]);
  const [selectedEmotion, setSelectedEmotion] = useState<EmotionalExpression>(EMOTIONAL_EXPRESSIONS[0]);
  
  // Text input state with initial authentic Saudi hospitality phrase
  const [text, setText] = useState<string>(
    'يا هلا ومسهلا فيكم، نورتوا مجلسنا وأسفرت باطلالتكم الكريمة، أبشروا بالخير والقهوة الزاهبة طال عمركم!'
  );

  // Advanced options state
  const [speed, setSpeed] = useState<number>(1.0);
  const [pitch, setPitch] = useState<string>('عادي ومتوازن');
  const [ambientSound, setAmbientSound] = useState<AmbientSoundId>('folk_cafe');
  const [ambientVolume, setAmbientVolume] = useState<number>(0.35);
  const [isAdvancedOpen, setIsAdvancedOpen] = useState<boolean>(false);

  // Audio generation & player state
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [currentAudioItem, setCurrentAudioItem] = useState<GeneratedAudioItem | null>(null);
  const [history, setHistory] = useState<GeneratedAudioItem[]>([]);

  // Modals state
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);
  const [isTemplatesOpen, setIsTemplatesOpen] = useState<boolean>(false);
  const [isComparisonOpen, setIsComparisonOpen] = useState<boolean>(false);

  // Load history from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Reconstruct blob URLs if base64 exists
        const restored: GeneratedAudioItem[] = parsed.map((item: any) => {
          if (item.audioBase64) {
            const blob = pcmToWavBlob(item.audioBase64, 24000);
            return {
              ...item,
              wavBlobUrl: URL.createObjectURL(blob),
            };
          }
          return item;
        });
        setHistory(restored);
        if (restored.length > 0) {
          setCurrentAudioItem(restored[0]);
        }
      }
    } catch (e) {
      console.warn('Failed to load history from localStorage', e);
    }
  }, []);

  // Save history to localStorage (saving metadata & base64 without blob URLs)
  const saveHistoryToStorage = (items: GeneratedAudioItem[]) => {
    try {
      const storable = items.slice(0, 30).map((item) => ({
        id: item.id,
        timestamp: item.timestamp,
        text: item.text,
        audioBase64: item.audioBase64,
        durationSeconds: item.durationSeconds,
        regionCode: item.regionCode,
        regionName: item.regionName,
        voiceName: item.voiceName,
        gender: item.gender,
        tone: item.tone,
        emotion: item.emotion,
        speed: item.speed,
        pitch: item.pitch,
        ambientSound: item.ambientSound,
        ambientSoundName: item.ambientSoundName,
        ambientVolume: item.ambientVolume,
        isFavorite: item.isFavorite,
      }));
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(storable));
    } catch (e) {
      console.warn('Failed to save history', e);
    }
  };

  // Generate TTS Audio via Server
  const handleGenerateAudio = async () => {
    if (!text.trim() || isGenerating) return;

    setIsGenerating(true);
    setErrorMessage(null);

    const regionObj = SAUDI_REGIONS.find((r) => r.id === selectedRegion);
    const regionName = regionObj ? regionObj.name : 'اللهجة النجدية';
    const ambientObj = AMBIENT_SOUNDSCAPES.find((a) => a.id === ambientSound);

    try {
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: text.trim(),
          regionName,
          regionCode: selectedRegion,
          gender: selectedGender,
          voiceName: selectedVoice.geminiVoice,
          tone: selectedTone.name,
          emotion: selectedEmotion.name,
          speed,
          pitch,
          ambientSound,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.audioBase64) {
        throw new Error(data.error || 'فشل في توليد الصوت. يرجى المحاولة مرة أخرى.');
      }

      // Convert PCM base64 to standard WAV Blob URL for seamless browser playback and direct download
      const wavBlob = pcmToWavBlob(data.audioBase64, data.sampleRate || 24000);
      const wavUrl = URL.createObjectURL(wavBlob);
      const durationSeconds = calculatePcmDuration(data.audioBase64, data.sampleRate || 24000);

      const newItem: GeneratedAudioItem = {
        id: 'tts_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
        timestamp: Date.now(),
        text: text.trim(),
        audioBase64: data.audioBase64,
        wavBlobUrl: wavUrl,
        durationSeconds,
        regionCode: selectedRegion,
        regionName,
        voiceName: selectedVoice.name,
        gender: selectedGender,
        tone: selectedTone.name,
        emotion: selectedEmotion.name,
        speed,
        pitch,
        ambientSound,
        ambientSoundName: ambientObj ? ambientObj.name : undefined,
        ambientVolume,
        isFavorite: false,
      };

      setCurrentAudioItem(newItem);
      const updatedHistory = [newItem, ...history];
      setHistory(updatedHistory);
      saveHistoryToStorage(updatedHistory);

      // Scroll smoothly to player if on mobile
      const playerEl = document.getElementById('saudi-audio-player');
      if (playerEl) {
        playerEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    } catch (err: any) {
      console.error('Generation Error:', err);
      setErrorMessage(err?.message || 'حدث خطأ أثناء معالجة الطلب الصوتي.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Toggle Favorite in History
  const handleToggleFavorite = (id: string) => {
    const updated = history.map((item) =>
      item.id === id ? { ...item, isFavorite: !item.isFavorite } : item
    );
    setHistory(updated);
    saveHistoryToStorage(updated);
    if (currentAudioItem && currentAudioItem.id === id) {
      setCurrentAudioItem({
        ...currentAudioItem,
        isFavorite: !currentAudioItem.isFavorite,
      });
    }
  };

  // Delete Item from History
  const handleDeleteHistoryItem = (id: string) => {
    const updated = history.filter((item) => item.id !== id);
    setHistory(updated);
    saveHistoryToStorage(updated);
    if (currentAudioItem && currentAudioItem.id === id) {
      setCurrentAudioItem(updated.length > 0 ? updated[0] : null);
    }
  };

  // Clear all history
  const handleClearAllHistory = () => {
    if (window.confirm('هل أنت متأكد من رغبتك في مسح كافة المقاطع المسجلة؟')) {
      setHistory([]);
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    }
  };

  // Apply Template
  const handleApplyTemplate = (template: PresetTemplate) => {
    setText(template.text);
    setSelectedRegion(template.region);

    const voice = VOICE_PERSONAS.find((v) => v.id === template.recommendedVoice);
    if (voice) {
      setSelectedVoice(voice);
      setSelectedGender(voice.gender);
    }

    const tone = VOICE_TONES.find((t) => t.id === template.recommendedTone);
    if (tone) setSelectedTone(tone);

    const emotion = EMOTIONAL_EXPRESSIONS.find((e) => e.id === template.recommendedEmotion);
    if (emotion) setSelectedEmotion(emotion);

    if (template.recommendedAmbient) {
      setAmbientSound(template.recommendedAmbient);
    }
  };

  // Handle region sample phrase preview
  const handlePreviewSamplePhrase = (phrase: string, region: SaudiRegion) => {
    setText(phrase);
    setSelectedRegion(region.id);
  };

  const currentRegionObj = SAUDI_REGIONS.find((r) => r.id === selectedRegion) || SAUDI_REGIONS[0];

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col selection:bg-emerald-600 selection:text-white">
      
      {/* App Header */}
      <Header
        historyCount={history.length}
        onOpenHistory={() => setIsHistoryOpen(true)}
        onOpenTemplates={() => setIsTemplatesOpen(true)}
        onOpenComparison={() => setIsComparisonOpen(true)}
      />

      {/* Main Content Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8">
        
        {/* Error Notification */}
        {errorMessage && (
          <div className="p-4 rounded-2xl bg-rose-950/80 border border-rose-800 text-rose-200 text-sm flex items-start gap-3 shadow-lg animate-fadeIn">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-bold">تنبيه أثناء توليد الصوت:</p>
              <p className="text-xs text-rose-300 mt-0.5">{errorMessage}</p>
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-xs text-rose-400 hover:text-rose-200 font-semibold cursor-pointer"
            >
              إغلاق
            </button>
          </div>
        )}

        {/* Studio Grid: Config on Right, Visualizer & Controls on Left (RTL) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Main Controls Section (Right side in RTL, cols 7) */}
          <div className="lg:col-span-7 space-y-7">
            
            {/* 1. Region & Dialect Selection */}
            <DialectSelector
              selectedRegion={selectedRegion}
              onSelectRegion={setSelectedRegion}
              onPreviewSamplePhrase={handlePreviewSamplePhrase}
            />

            {/* 2. Voice, Tone, & Emotion Selection */}
            <VoiceAndToneSelector
              selectedGender={selectedGender}
              onSelectGender={setSelectedGender}
              selectedVoiceId={selectedVoice.id}
              onSelectVoice={setSelectedVoice}
              selectedToneId={selectedTone.id}
              onSelectTone={setSelectedTone}
              selectedEmotionId={selectedEmotion.id}
              onSelectEmotion={setSelectedEmotion}
            />

            {/* 3. Text Prompt Editor */}
            <TextPromptEditor
              text={text}
              onChangeText={setText}
              onGenerateAudio={handleGenerateAudio}
              isGenerating={isGenerating}
              selectedRegionCode={selectedRegion}
              selectedRegionName={currentRegionObj.name}
              onOpenTemplates={() => setIsTemplatesOpen(true)}
            />

            {/* 4. Advanced Options with Expanded Ambient Soundscapes */}
            <AdvancedOptions
              speed={speed}
              onChangeSpeed={setSpeed}
              pitch={pitch}
              onChangePitch={setPitch}
              ambientSound={ambientSound}
              onChangeAmbientSound={setAmbientSound}
              ambientVolume={ambientVolume}
              onChangeAmbientVolume={setAmbientVolume}
              isOpen={isAdvancedOpen}
              onToggleOpen={() => setIsAdvancedOpen(!isAdvancedOpen)}
            />

          </div>

          {/* Player & Preview Section (Left side in RTL, cols 5) */}
          <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-28">
            
            {/* Active Configuration Summary Badge */}
            <div className="p-4 rounded-2xl bg-stone-900/80 border border-stone-800 text-xs space-y-2">
              <div className="flex items-center justify-between text-stone-300 font-semibold">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                  <span>الإعدادات الصوتية الحالية</span>
                </span>
                <span className="text-emerald-400 font-bold">
                  {currentRegionObj.name.split(' ')[1]}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-stone-400 pt-1">
                <div>
                  <span className="text-stone-500">الصوت: </span>
                  <span className="text-stone-200">{selectedVoice.name}</span>
                </div>
                <div>
                  <span className="text-stone-500">النبرة: </span>
                  <span className="text-stone-200">{selectedTone.name.split(' ')[0]}</span>
                </div>
                <div>
                  <span className="text-stone-500">المشاعر: </span>
                  <span className="text-stone-200">{selectedEmotion.name.split(' ')[0]}</span>
                </div>
                <div>
                  <span className="text-stone-500">السرعة: </span>
                  <span className="text-stone-200">{speed}x</span>
                </div>
                <div className="col-span-2 pt-1 border-t border-stone-800/80 flex items-center justify-between">
                  <span className="text-stone-500">الجو الصوتي: </span>
                  <span className="text-indigo-300 font-semibold">
                    {AMBIENT_SOUNDSCAPES.find((a) => a.id === ambientSound)?.name || 'نقي بدون خلفية'}
                  </span>
                </div>
              </div>
            </div>

            {/* Live Audio Player Card & Waveform Visualizer */}
            <AudioPlayerVisualizer
              item={currentAudioItem}
              activeAmbientSound={ambientSound}
              ambientVolume={ambientVolume}
              onToggleFavorite={handleToggleFavorite}
            />

            {/* Quick Tips & Cultural Insights */}
            <div className="p-4 rounded-2xl bg-stone-900/40 border border-stone-800/80 text-xs text-stone-400 space-y-2">
              <h4 className="font-bold text-stone-300 flex items-center gap-1.5">
                <Volume2 className="w-3.5 h-3.5 text-amber-400" />
                <span>تجربة صوتية واقعية ومتكاملة:</span>
              </h4>
              <p className="leading-relaxed text-stone-400">
                يمكنك معاينة أي جو صوتي (مثل مقهى شعبي، سوق قديم، أو سكون الصحراء) من قائمة الخيارات المتقدمة قبل التوليد، أو تنزيل المقطع مدمجاً مع المؤثرات البيئية أو بصيغة نقية للمونتاج.
              </p>
            </div>

          </div>

        </div>

      </main>

      {/* Footer */}
      <footer className="border-t border-stone-800/80 py-8 bg-stone-950 text-center text-xs text-stone-500 space-y-3">
        <div className="flex justify-center items-center">
          <BrandLogo size="sm" showSubtitle={true} />
        </div>
        <p className="font-medium text-stone-400">
          منصة صوت السعودية • إشراف وتطوير إيمان المطيري (Eman Al-Mutairi)
        </p>
        <p className="text-stone-500 text-[11px]">
          توليد صوتي فائق الدقة بلهجات مناطق المملكة والمشاعر ونبرات الصوت مع أجواء واقعية
        </p>
      </footer>

      {/* History Drawer */}
      <HistoryPanel
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={history}
        onSelectAudioItem={(item) => {
          setCurrentAudioItem(item);
          setIsHistoryOpen(false);
        }}
        onToggleFavorite={handleToggleFavorite}
        onDeleteHistoryItem={handleDeleteHistoryItem}
        onClearAllHistory={handleClearAllHistory}
      />

      {/* Preset Phrases Modal */}
      <SamplePhrasesModal
        isOpen={isTemplatesOpen}
        onClose={() => setIsTemplatesOpen(false)}
        onApplyTemplate={handleApplyTemplate}
      />

      {/* Dialect Comparison & Guide Modal */}
      <DialectComparisonModal
        isOpen={isComparisonOpen}
        onClose={() => setIsComparisonOpen(false)}
        onSelectRegionAndPhrase={(phrase, regionCode) => {
          setText(phrase);
          setSelectedRegion(regionCode);
        }}
      />

    </div>
  );
}
