import React, { useState } from 'react';
import { GeneratedAudioItem } from '../types';
import { downloadAudioFile, formatDuration } from '../utils/audioUtils';
import {
  History,
  X,
  Play,
  Download,
  Trash2,
  Heart,
  Search,
  Filter,
  Volume2,
  MapPin,
  Calendar,
  Sparkles
} from 'lucide-react';

interface HistoryPanelProps {
  isOpen: boolean;
  onClose: () => void;
  history: GeneratedAudioItem[];
  onSelectAudioItem: (item: GeneratedAudioItem) => void;
  onToggleFavorite: (id: string) => void;
  onDeleteHistoryItem: (id: string) => void;
  onClearAllHistory: () => void;
}

export const HistoryPanel: React.FC<HistoryPanelProps> = ({
  isOpen,
  onClose,
  history,
  onSelectAudioItem,
  onToggleFavorite,
  onDeleteHistoryItem,
  onClearAllHistory,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterFavorites, setFilterFavorites] = useState(false);

  if (!isOpen) return null;

  const filteredHistory = history.filter((item) => {
    const matchesSearch =
      item.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.regionName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.voiceName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFav = filterFavorites ? item.isFavorite : true;
    return matchesSearch && matchesFav;
  });

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-stone-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-md bg-stone-900 h-full border-r border-stone-800 flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-stone-800 flex items-center justify-between bg-stone-950/50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-950 flex items-center justify-center text-emerald-400 border border-emerald-800/60">
              <History className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-stone-100">سجل المقاطع الصوتية</h2>
              <p className="text-xs text-stone-400">{history.length} مقطع مولد محفوظ محلياً</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-stone-400 hover:text-stone-100 hover:bg-stone-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Filter Bar */}
        <div className="p-4 border-b border-stone-800/80 space-y-3 bg-stone-900/80">
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="ابحث في السجل..."
              className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3.5 py-2 pl-9 text-xs text-stone-100 placeholder-stone-500 focus:outline-none focus:border-emerald-500"
            />
            <Search className="w-3.5 h-3.5 text-stone-500 absolute left-3 top-3" />
          </div>

          <div className="flex items-center justify-between text-xs">
            <button
              onClick={() => setFilterFavorites(!filterFavorites)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-colors cursor-pointer ${
                filterFavorites
                  ? 'bg-rose-950/60 border-rose-700 text-rose-300'
                  : 'bg-stone-950 border-stone-800 text-stone-400 hover:text-stone-200'
              }`}
            >
              <Heart className={`w-3.5 h-3.5 ${filterFavorites ? 'fill-rose-400 text-rose-400' : ''}`} />
              <span>المفضلة فقط</span>
            </button>

            {history.length > 0 && (
              <button
                onClick={onClearAllHistory}
                className="text-stone-400 hover:text-rose-400 transition-colors cursor-pointer flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>مسح الكل</span>
              </button>
            )}
          </div>
        </div>

        {/* History List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {filteredHistory.length === 0 ? (
            <div className="text-center py-12 text-stone-500 space-y-2">
              <Volume2 className="w-8 h-8 mx-auto opacity-30" />
              <p className="text-sm">لا توجد مقاطع صوتية مطابقة.</p>
              <p className="text-xs">المقاطع التي تولدها ستظهر هنا تلقائياً لسهولة الرجوع إليها وتنزيلها.</p>
            </div>
          ) : (
            filteredHistory.map((item) => (
              <div
                key={item.id}
                className="p-3.5 rounded-2xl bg-stone-950/60 border border-stone-800 hover:border-emerald-500/50 transition-all space-y-2.5 text-right"
              >
                {/* Meta Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-md border border-emerald-900">
                      {item.regionName}
                    </span>
                    <span className="text-[11px] text-stone-300 bg-stone-800 px-1.5 py-0.5 rounded">
                      {item.voiceName}
                    </span>
                    <span className="text-[10px] text-stone-400">
                      {item.tone}
                    </span>
                  </div>

                  <button
                    onClick={() => onToggleFavorite(item.id)}
                    className="text-stone-500 hover:text-rose-400 transition-colors cursor-pointer p-1"
                  >
                    <Heart
                      className={`w-4 h-4 ${
                        item.isFavorite ? 'fill-rose-400 text-rose-400' : ''
                      }`}
                    />
                  </button>
                </div>

                {/* Text excerpt */}
                <p className="text-xs text-stone-200 line-clamp-2 leading-relaxed font-normal">
                  "{item.text}"
                </p>

                {/* Controls */}
                <div className="flex items-center justify-between pt-1 border-t border-stone-800/80 text-xs">
                  <span className="text-[10px] text-stone-400">
                    {new Date(item.timestamp).toLocaleTimeString('ar-SA', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => onSelectAudioItem(item)}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-stone-950 font-bold text-[11px] transition-all cursor-pointer"
                    >
                      <Play className="w-3 h-3 fill-stone-950" />
                      <span>تشغيل</span>
                    </button>

                    <button
                      onClick={() => {
                        if (item.wavBlobUrl) {
                          downloadAudioFile(item.wavBlobUrl, `صوت_سعودي_${item.regionName}_${Date.now()}.wav`);
                        }
                      }}
                      className="p-1.5 rounded-lg bg-stone-800 hover:bg-stone-750 text-stone-300 transition-colors cursor-pointer"
                      title="تنزيل WAV"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => onDeleteHistoryItem(item.id)}
                      className="p-1.5 rounded-lg bg-stone-800 hover:bg-rose-950/60 text-stone-400 hover:text-rose-400 transition-colors cursor-pointer"
                      title="حذف"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
};
