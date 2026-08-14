import React, { useState } from 'react';
import { SAUDI_REGIONS } from '../data/saudiData';
import { SaudiRegionCode, SaudiRegion } from '../types';
import { X, BookOpen, MapPin, Sparkles, Check, Volume2 } from 'lucide-react';

interface DialectComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectRegionAndPhrase: (phrase: string, regionCode: SaudiRegionCode) => void;
}

export const DialectComparisonModal: React.FC<DialectComparisonModalProps> = ({
  isOpen,
  onClose,
  onSelectRegionAndPhrase,
}) => {
  const [selectedTab, setSelectedTab] = useState<SaudiRegionCode>('najdi');

  if (!isOpen) return null;

  const currentRegion = SAUDI_REGIONS.find((r) => r.id === selectedTab) || SAUDI_REGIONS[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-3xl bg-stone-900 border border-stone-800 rounded-3xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="p-5 border-b border-stone-800 flex items-center justify-between bg-stone-950/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-950/80 flex items-center justify-center text-emerald-400 border border-emerald-800/60">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-stone-100">
                دليل وأطلس اللهجات السعودية
              </h2>
              <p className="text-xs text-stone-400">
                استكشف تنوع وثراء اللهجات في شتى مناطق المملكة وخصائصها الصوتية
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

        {/* Region Selector Tabs */}
        <div className="p-3 border-b border-stone-800 bg-stone-900/60 overflow-x-auto flex gap-2 scrollbar-none">
          {SAUDI_REGIONS.map((region) => (
            <button
              key={region.id}
              onClick={() => setSelectedTab(region.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                selectedTab === region.id
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'bg-stone-800/80 text-stone-300 hover:text-white hover:bg-stone-800'
              }`}
            >
              <span>{region.name.split(' ')[1]}</span>
            </button>
          ))}
        </div>

        {/* Tab Detail Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-right">
          <div className="space-y-2">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h3 className="text-xl font-bold text-stone-100 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-emerald-400" />
                {currentRegion.name}
              </h3>
              <span className="text-xs px-3 py-1 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800/60 font-medium">
                {currentRegion.badge}
              </span>
            </div>
            <p className="text-xs text-stone-400 font-medium">{currentRegion.subTitle}</p>
            <p className="text-sm text-stone-300 leading-relaxed pt-2">
              {currentRegion.description}
            </p>
          </div>

          {/* Iconic Phrase Card */}
          <div className="p-4 rounded-2xl bg-stone-950 border border-emerald-800/40 space-y-2">
            <span className="text-xs font-bold text-emerald-400 block">العبارة النموذجية:</span>
            <p className="text-sm text-stone-100 font-medium leading-relaxed">
              "{currentRegion.samplePhrase}"
            </p>
            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => {
                  onSelectRegionAndPhrase(currentRegion.samplePhrase, currentRegion.id);
                  onClose();
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-stone-950 font-bold text-xs transition-all cursor-pointer"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>تجربة هذا النص فوراً</span>
              </button>
            </div>
          </div>

          {/* Regional Lexicon / Words */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-stone-200 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>أشهر المفردات والتعابير اليومية:</span>
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {currentRegion.iconicWords.map((word, i) => (
                <div
                  key={i}
                  className="p-2.5 rounded-xl bg-stone-950/70 border border-stone-800 text-center text-xs font-semibold text-stone-200"
                >
                  {word}
                </div>
              ))}
            </div>
          </div>

          {/* Included Cities & Provinces */}
          <div className="space-y-2 pt-2 border-t border-stone-800/80">
            <span className="text-xs font-bold text-stone-400">المدن والمحافظات المشمولة:</span>
            <div className="flex flex-wrap gap-1.5">
              {currentRegion.provinces.map((prov, i) => (
                <span
                  key={i}
                  className="text-xs px-2.5 py-1 rounded-lg bg-stone-850 text-stone-300 border border-stone-800"
                >
                  {prov}
                </span>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
