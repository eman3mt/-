import React from 'react';
import { SAUDI_REGIONS } from '../data/saudiData';
import { SaudiRegionCode, SaudiRegion } from '../types';
import { MapPin, CheckCircle2, Volume2, Sparkles } from 'lucide-react';

interface DialectSelectorProps {
  selectedRegion: SaudiRegionCode;
  onSelectRegion: (region: SaudiRegionCode) => void;
  onPreviewSamplePhrase: (phrase: string, region: SaudiRegion) => void;
}

export const DialectSelector: React.FC<DialectSelectorProps> = ({
  selectedRegion,
  onSelectRegion,
  onPreviewSamplePhrase,
}) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold text-stone-200 flex items-center gap-2">
          <MapPin className="w-4 h-4 text-emerald-400" />
          <span>١. اختر المنطقة واللهجة السعودية</span>
        </label>
        <span className="text-xs text-stone-400">
          اختر من بين ٦ لهجات ومناطق رئيسية بالمملكة
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {SAUDI_REGIONS.map((region) => {
          const isSelected = selectedRegion === region.id;
          return (
            <div
              key={region.id}
              id={`region-card-${region.id}`}
              onClick={() => onSelectRegion(region.id)}
              className={`relative rounded-2xl p-4 border transition-all cursor-pointer text-right flex flex-col justify-between group select-none ${
                isSelected
                  ? 'bg-gradient-to-b from-stone-900 via-stone-900 to-emerald-950/40 border-emerald-500 ring-1 ring-emerald-500/50 shadow-lg shadow-emerald-950/40'
                  : 'bg-stone-900/70 hover:bg-stone-850 border-stone-800 hover:border-stone-700'
              }`}
            >
              {/* Top Row: Title & Badge */}
              <div>
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-3.5 h-3.5 rounded-full flex items-center justify-center border ${
                        isSelected
                          ? 'border-emerald-400 bg-emerald-500 text-white'
                          : 'border-stone-600 bg-stone-800'
                      }`}
                    >
                      {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                    <h3 className="font-bold text-stone-100 text-sm group-hover:text-emerald-300 transition-colors">
                      {region.name}
                    </h3>
                  </div>

                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                      isSelected
                        ? 'bg-emerald-900/60 text-emerald-300 border border-emerald-700/50'
                        : 'bg-stone-800 text-stone-400'
                    }`}
                  >
                    {region.badge}
                  </span>
                </div>

                <p className="text-xs text-stone-400 mb-2 font-medium">
                  {region.subTitle}
                </p>

                <p className="text-[11px] text-stone-400/90 leading-relaxed mb-3">
                  {region.description}
                </p>
              </div>

              {/* Bottom: Iconic Words & Sample Phrase Button */}
              <div className="pt-2 border-t border-stone-800/80 mt-auto">
                <div className="flex flex-wrap gap-1 mb-2.5">
                  {region.iconicWords.slice(0, 4).map((word, i) => (
                    <span
                      key={i}
                      className="text-[10px] bg-stone-950/80 text-stone-300 px-1.5 py-0.5 rounded border border-stone-800/80"
                    >
                      {word}
                    </span>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onPreviewSamplePhrase(region.samplePhrase, region);
                  }}
                  className="w-full flex items-center justify-center gap-1.5 text-[11px] font-medium py-1.5 px-2 rounded-xl bg-stone-950/60 hover:bg-emerald-950/50 text-stone-300 hover:text-emerald-300 border border-stone-800/60 hover:border-emerald-800/50 transition-all cursor-pointer"
                  title="استمع إلى عبارة نموذجية بهذه اللهجة"
                >
                  <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>تطبيق عبارة نموذجية</span>
                </button>
              </div>

              {isSelected && (
                <div className="absolute top-2 left-2 text-emerald-400">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
