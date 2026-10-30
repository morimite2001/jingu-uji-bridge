import React, { useState } from 'react';
import { Viewpoint } from '../types';
import { ChevronRight, ChevronLeft, CheckCircle2, Info, X } from 'lucide-react';

interface DetailCardProps {
  viewpoint: Viewpoint;
  isWalkthrough: boolean;
}

export const DetailCard: React.FC<DetailCardProps> = ({ viewpoint, isWalkthrough }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isMobileModalOpen, setIsMobileModalOpen] = useState(false);

  if (isWalkthrough) {
    return (
      <div className="fixed top-16 md:top-24 left-2 right-2 md:right-auto md:left-3 z-20 md:max-w-sm pointer-events-auto">
        <div className="glass-panel rounded-2xl p-2.5 md:p-3 shadow-xl bg-slate-900/95 border border-emerald-500/50">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-xs font-bold text-emerald-300 font-sans-ui">
              橋面歩行中（右側通行）
            </span>
          </div>
          <p className="text-[11px] md:text-xs text-slate-200 leading-relaxed font-sans-ui">
            内宮伝統の「右側通行」で渡っています。画面ドラッグで自由視点に切り替わります。
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* MOBILE COMPACT BAR (< md) */}
      <div className="fixed top-16 left-2 right-2 z-20 md:hidden pointer-events-auto flex items-center justify-between gap-1.5">
        <button
          onClick={() => setIsMobileModalOpen(true)}
          className="flex-1 flex items-center justify-between gap-2 px-3 py-1.5 rounded-xl glass-panel bg-slate-900/95 border border-amber-500/50 shadow-lg text-left"
          aria-label="構造解説を開く"
        >
          <div className="flex items-center gap-1.5 truncate">
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold font-sans-ui">
              {viewpoint.number}
            </span>
            <span className="text-xs font-bold text-amber-200 truncate">
              {viewpoint.title.split('：')[0]}
            </span>
          </div>
          <span className="flex items-center gap-1 text-[10px] text-amber-400 font-sans-ui flex-shrink-0 bg-amber-500/10 px-2 py-0.5 rounded-lg border border-amber-500/30">
            <Info size={11} />
            <span>解説</span>
          </span>
        </button>
      </div>

      {/* MOBILE MODAL DIALOG (< md) */}
      {isMobileModalOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex items-end sm:items-center justify-center p-3 bg-black/70 backdrop-blur-sm pointer-events-auto">
          <div className="glass-panel rounded-3xl p-4 bg-slate-900 border border-amber-500/60 shadow-2xl w-full max-h-[80vh] overflow-y-auto flex flex-col gap-3">
            <div className="flex items-start justify-between gap-2 border-b border-slate-800 pb-2.5">
              <div>
                <span className="text-[10px] font-sans-ui text-amber-400 font-semibold block mb-0.5">
                  視点 {viewpoint.number} : {viewpoint.photoRef}
                </span>
                <h3 className="text-sm font-bold text-white">
                  {viewpoint.title}
                </h3>
              </div>
              <button
                onClick={() => setIsMobileModalOpen(false)}
                className="p-1 rounded-full bg-slate-800 text-slate-300 hover:text-white"
                aria-label="閉じる"
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-xs text-slate-200 leading-relaxed font-serif">
              {viewpoint.desc}
            </p>

            <div className="bg-slate-950/70 p-2.5 rounded-2xl border border-slate-800 flex flex-col gap-1.5">
              <span className="text-[10px] uppercase font-bold tracking-wider text-amber-400 font-sans-ui">
                構造ディテール着眼点
              </span>
              {viewpoint.highlights.map((h, i) => (
                <div key={i} className="flex items-start gap-1.5 text-[11px] text-slate-300">
                  <CheckCircle2 size={12} className="text-amber-400 mt-0.5 flex-shrink-0" />
                  <span>{h}</span>
                </div>
              ))}
            </div>

            <button
              onClick={() => setIsMobileModalOpen(false)}
              className="w-full py-2 rounded-xl bg-amber-600 text-white font-medium text-xs font-sans-ui transition"
            >
              閉じる
            </button>
          </div>
        </div>
      )}

      {/* DESKTOP FLOATING CARD (>= md) */}
      <div className="hidden md:block fixed top-24 left-3 z-20 max-w-sm pointer-events-auto transition-all">
        <div className="glass-panel rounded-2xl p-3.5 shadow-xl bg-slate-900/90 border border-amber-500/40">
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-amber-400 font-sans-ui">
                {viewpoint.number}. {viewpoint.title}
              </span>
            </div>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition"
              aria-label={isExpanded ? '解説を折りたたむ' : '解説を展開'}
            >
              {isExpanded ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
            </button>
          </div>

          {isExpanded && (
            <div className="flex flex-col gap-2 mt-2">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-sans-ui px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-medium">
                  {viewpoint.photoRef}
                </span>
                <span className="text-[10px] text-slate-400 font-sans-ui">{viewpoint.subtitle}</span>
              </div>

              <p className="text-xs text-slate-200 leading-relaxed">{viewpoint.desc}</p>

              <div className="border-t border-slate-800 pt-2 flex flex-col gap-1">
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 font-sans-ui">
                  構造ディテール着眼点
                </span>
                {viewpoint.highlights.map((h, i) => (
                  <div key={i} className="flex items-start gap-1.5 text-[11px] text-slate-300">
                    <CheckCircle2 size={12} className="text-amber-400 mt-0.5 flex-shrink-0" />
                    <span>{h}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};
