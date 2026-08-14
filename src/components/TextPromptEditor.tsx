import React, { useState } from 'react';
import { Sparkles, Wand2, Trash2, Copy, Check, FileText, Loader2, ArrowLeftRight } from 'lucide-react';
import { SaudiRegionCode } from '../types';

interface TextPromptEditorProps {
  text: string;
  onChangeText: (text: string) => void;
  onGenerateAudio: () => void;
  isGenerating: boolean;
  selectedRegionCode: SaudiRegionCode;
  selectedRegionName: string;
  onOpenTemplates: () => void;
}

export const TextPromptEditor: React.FC<TextPromptEditorProps> = ({
  text,
  onChangeText,
  onGenerateAudio,
  isGenerating,
  selectedRegionCode,
  selectedRegionName,
  onOpenTemplates,
}) => {
  const [isAdapting, setIsAdapting] = useState(false);
  const [adaptedNotice, setAdaptedNotice] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const characterCount = text.length;
  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;

  // AI Dialect adaptation handler
  const handleAdaptToDialect = async () => {
    if (!text.trim() || isAdapting) return;
    setIsAdapting(true);
    setAdaptedNotice(null);

    try {
      const response = await fetch('/api/adapt-dialect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          targetRegion: selectedRegionCode,
        }),
      });

      const data = await response.json();
      if (data.adaptedText) {
        onChangeText(data.adaptedText);
        setAdaptedNotice(
          data.explanation || `تم تكييف النص ليطابق مفردات ${selectedRegionName} بنجاح!`
        );
        setTimeout(() => setAdaptedNotice(null), 8000);
      }
    } catch (err) {
      console.error('Failed to adapt dialect', err);
    } finally {
      setIsAdapting(false);
    }
  };

  const handleCopy = () => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Quick insertion tags according to region
  const quickWords: Record<SaudiRegionCode, string[]> = {
    najdi: ['يا هلا والله ومسهلا', 'أبشر بسعدك', 'ياحبي لك', 'طال عمرك', 'ما قصرت والله'],
    hijazi: ['أهلاً وسهلاً يا سيدي', 'ايش رايكم', 'دحين تمام', 'من عيوني', 'ما عليك يا غالي'],
    eastern: ['شخباركم وعساكم بخير', 'حياكم الله في ديرتنا', 'بعد چبدي', 'خوش جلسة'],
    southern: ['مرحباً ألوف وترحيبة السيل', 'أرحبوا يا رجال', 'جعله مداخيل العافية', 'وش علمك'],
    northern: ['يا بعد حيي وميتي', 'وش نوحك', 'على خشمي', 'بالحيل مبسوطين'],
    fusha_saudi: ['بكل فخر واعتزاز', 'أهلاً بكم ومرحباً', 'طموحنا عنان السماء', 'نسعد بخدمتكم'],
  };

  const currentQuickWords = quickWords[selectedRegionCode] || quickWords.najdi;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label htmlFor="tts-text-input" className="text-sm font-semibold text-stone-200 flex items-center gap-2">
          <FileText className="w-4 h-4 text-emerald-400" />
          <span>٥. النص المراد تحويله إلى كلام</span>
        </label>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenTemplates}
            className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 font-medium transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>اختر نصاً جاهزاً</span>
          </button>
        </div>
      </div>

      {/* Text Area Card */}
      <div className="relative rounded-2xl border border-stone-800 bg-stone-900/90 focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500/40 transition-all shadow-inner">
        <textarea
          id="tts-text-input"
          value={text}
          onChange={(e) => onChangeText(e.target.value)}
          placeholder="اكتب أو الصق النص هنا، مثلاً: يا هلا ومسهلا فيكم، نورتوا مجلسنا وأبشروا بالخير والقهوة الزاهبة..."
          rows={4}
          maxLength={1500}
          className="w-full bg-transparent p-4 text-stone-100 placeholder-stone-500 text-base leading-relaxed resize-none focus:outline-none font-normal"
        />

        {/* Quick Words Bar */}
        <div className="px-4 py-2 border-t border-stone-800/80 bg-stone-950/40 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] text-stone-400 font-medium ml-1">إضافة سريعة:</span>
            {currentQuickWords.map((word, i) => (
              <button
                key={i}
                type="button"
                onClick={() => {
                  const newText = text ? `${text} ${word}` : word;
                  onChangeText(newText);
                }}
                className="text-[11px] px-2 py-0.5 rounded-lg bg-stone-800/90 hover:bg-stone-750 text-stone-300 hover:text-emerald-300 border border-stone-750 transition-all cursor-pointer"
              >
                + {word}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3 text-[11px] text-stone-400">
            <span>{wordCount} كلمة</span>
            <span>•</span>
            <span>{characterCount} / 1500 حرف</span>
          </div>
        </div>
      </div>

      {/* AI Adaptation Notice if applied */}
      {adaptedNotice && (
        <div className="p-3 rounded-xl bg-emerald-950/50 border border-emerald-800/60 text-emerald-300 text-xs flex items-start gap-2 animate-fadeIn">
          <Sparkles className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold mb-0.5">تكييف اللهجة بالذكاء الاصطناعي:</p>
            <p className="text-emerald-200/90 leading-relaxed">{adaptedNotice}</p>
          </div>
        </div>
      )}

      {/* Action Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-1">
        <div className="flex items-center gap-2">
          <button
            id="adapt-dialect-btn"
            type="button"
            disabled={!text.trim() || isAdapting || isGenerating}
            onClick={handleAdaptToDialect}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-gradient-to-r from-amber-900/60 to-amber-950/60 hover:from-amber-800/60 hover:to-amber-900/60 text-amber-200 border border-amber-700/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer shadow-sm"
            title="إعادة صياغة النص بمفردات ومصطلحات اللهجة المختارة تلقائياً"
          >
            {isAdapting ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400" />
            ) : (
              <Wand2 className="w-3.5 h-3.5 text-amber-400" />
            )}
            <span>تكييف النص مع {selectedRegionName} (AI)</span>
          </button>

          <button
            type="button"
            disabled={!text}
            onClick={handleCopy}
            className="p-2 text-stone-400 hover:text-stone-200 rounded-xl bg-stone-900 hover:bg-stone-850 border border-stone-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
            title="نسخ النص"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          </button>

          <button
            type="button"
            disabled={!text}
            onClick={() => onChangeText('')}
            className="p-2 text-stone-400 hover:text-rose-400 rounded-xl bg-stone-900 hover:bg-stone-850 border border-stone-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
            title="مسح النص"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        {/* Generate Primary CTA */}
        <button
          id="generate-tts-submit-btn"
          type="button"
          disabled={!text.trim() || isGenerating}
          onClick={onGenerateAudio}
          className="flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-stone-950 font-bold text-sm sm:text-base shadow-lg shadow-emerald-950/80 hover:shadow-emerald-900/60 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin text-stone-950" />
              <span>جاري توليد الصوت السعودي الفاخر...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5 text-stone-950" />
              <span>توليد الصوت السعودي الآن</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
