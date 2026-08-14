import React, { useState } from 'react';
import { PRESET_TEMPLATES, SAUDI_REGIONS } from '../data/saudiData';
import { PresetTemplate } from '../types';
import { X, Sparkles, Check, ArrowRight, BookOpen, Volume2 } from 'lucide-react';

interface SamplePhrasesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyTemplate: (template: PresetTemplate) => void;
}

export const SamplePhrasesModal: React.FC<SamplePhrasesModalProps> = ({
  isOpen,
  onClose,
  onApplyTemplate,
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('all');

  if (!isOpen) return null;

  const categories = [
    { id: 'all', label: 'الكل' },
    { id: 'hospitality', label: 'ضيافة وترحاب' },
    { id: 'marketing', label: 'إعلانات تجارية' },
    { id: 'tourism', label: 'سياحة واستكشاف' },
    { id: 'customer_care', label: 'خدمة عملاء وIVR' },
    { id: 'story', label: 'تراث وحكايا' },
    { id: 'celebration', label: 'مناسبات وتهاني' },
    { id: 'casual', label: 'يوميات وعفوية' },
  ];

  const filteredTemplates = activeCategory === 'all'
    ? PRESET_TEMPLATES
    : PRESET_TEMPLATES.filter((t) => t.category === activeCategory);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-3xl bg-stone-900 border border-stone-800 rounded-3xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Modal Header */}
        <div className="p-5 border-b border-stone-800 flex items-center justify-between bg-stone-950/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-950/80 flex items-center justify-center text-amber-400 border border-amber-800/60">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-stone-100">
                مكتبة النماذج والعبارات السعودية الجاهزة
              </h2>
              <p className="text-xs text-stone-400">
                اختر نموذجاً مصمماً بعناية لتجربة اللهجات المختلفة فوراً
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-stone-400 hover:text-stone-100 hover:bg-stone-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Category Tabs */}
        <div className="p-4 border-b border-stone-800 bg-stone-900/60 overflow-x-auto flex gap-1.5 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                activeCategory === cat.id
                  ? 'bg-amber-500 text-stone-950 shadow-md'
                  : 'bg-stone-800/80 text-stone-400 hover:text-stone-200 hover:bg-stone-800'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Templates Grid */}
        <div className="flex-1 overflow-y-auto p-5 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {filteredTemplates.map((template) => {
            const regionInfo = SAUDI_REGIONS.find((r) => r.id === template.region);
            return (
              <div
                key={template.id}
                className="p-4 rounded-2xl bg-stone-950/60 border border-stone-800 hover:border-amber-500/50 hover:bg-stone-950 transition-all flex flex-col justify-between text-right group"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-950/60 text-amber-300 border border-amber-800/50 font-medium">
                      {template.categoryLabel}
                    </span>
                    <span className="text-[11px] font-semibold text-emerald-400">
                      {regionInfo?.name.split(' ')[1] || 'سعودي'}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-stone-100 mb-2 group-hover:text-amber-300 transition-colors">
                    {template.title}
                  </h3>

                  <p className="text-xs text-stone-300 leading-relaxed line-clamp-3 mb-4 font-normal">
                    "{template.text}"
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    onApplyTemplate(template);
                    onClose();
                  }}
                  className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-stone-850 hover:bg-amber-500 text-stone-300 hover:text-stone-950 text-xs font-bold transition-all cursor-pointer shadow-sm"
                >
                  <span>استخدام هذا النموذج</span>
                  <Check className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
};
