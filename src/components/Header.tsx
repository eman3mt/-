import React from 'react';
import { Volume2, History, Sparkles, BookOpen, Layers } from 'lucide-react';
import { BrandLogo } from './BrandLogo';

interface HeaderProps {
  historyCount: number;
  onOpenHistory: () => void;
  onOpenTemplates: () => void;
  onOpenComparison: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  historyCount,
  onOpenHistory,
  onOpenTemplates,
  onOpenComparison,
}) => {
  return (
    <header className="border-b border-stone-800 bg-stone-950/90 backdrop-blur-md sticky top-0 z-30">
      {/* Top signature bar */}
      <div className="border-b border-stone-900 bg-gradient-to-r from-stone-950 via-cyan-950/20 to-stone-950 px-4 py-1.5 hidden sm:block">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-[11px] text-stone-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-cyan-300 font-medium">المنصة الرسمية لتوليد الصوت السعودي بالذكاء الاصطناعي</span>
            <span className="text-stone-600">•</span>
            <span className="text-stone-300 font-semibold">إيمان المطيري (Eman Al-Mutairi)</span>
          </div>
          <div className="flex items-center gap-3 text-stone-500">
            <span>نبرات ومشاعر واقعية</span>
            <span>•</span>
            <span>أجواء بيئية حية (Ambient Sounds)</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        
        {/* Brand & Logo with the uploaded EM - Eman Al-Mutairi emblem */}
        <div className="flex items-center gap-3.5">
          <BrandLogo size="md" showSubtitle={false} />
          
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-bold text-stone-100 tracking-tight flex items-center gap-2">
                صوت السعودية
              </h1>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-950/80 text-cyan-300 border border-cyan-800/60 font-semibold">
                إيمان المطيري
              </span>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-800/60 font-medium hidden md:inline-block">
                ذكاء اصطناعي سعودي
              </span>
            </div>
            <p className="text-xs text-stone-400 mt-0.5 hidden sm:block">
              تحويل النص إلى كلام فائق الدقة بلهجات مناطق المملكة والمشاعر ونبرات الصوت
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            id="open-templates-btn"
            onClick={onOpenTemplates}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-medium rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-200 border border-stone-800 hover:border-stone-700 transition-all cursor-pointer shadow-sm"
            title="مكتبة النصوص والعبارات السعودية الجاهزة"
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline">نصوص جاهزة</span>
          </button>

          <button
            id="open-dialect-guide-btn"
            onClick={onOpenComparison}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-medium rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-200 border border-stone-800 hover:border-stone-700 transition-all cursor-pointer shadow-sm"
            title="دليل اللهجات السعودية وخصائصها"
          >
            <BookOpen className="w-4 h-4 text-emerald-400" />
            <span className="hidden sm:inline">دليل اللهجات</span>
          </button>

          <button
            id="open-history-btn"
            onClick={onOpenHistory}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-medium rounded-xl bg-cyan-950/60 hover:bg-cyan-900/60 text-cyan-300 border border-cyan-800/60 transition-all cursor-pointer relative shadow-sm"
            title="سجل المقاطع الصوتية المولدة"
          >
            <History className="w-4 h-4 text-cyan-400" />
            <span>السجل</span>
            {historyCount > 0 && (
              <span className="inline-flex items-center justify-center px-1.5 py-0.2 text-[10px] font-bold leading-none text-cyan-100 bg-cyan-600 rounded-full">
                {historyCount}
              </span>
            )}
          </button>
        </div>

      </div>
    </header>
  );
};
