import React, { useState } from 'react';
import { Viewpoint } from '../types';
import { ChevronRight, ChevronLeft, CheckCircle2 } from 'lucide-react';

interface DetailCardProps {
  viewpoint: Viewpoint;
  isWalkthrough: boolean;
}

export const DetailCard: React.FC<DetailCardProps> = ({ viewpoint, isWalkthrough }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  if (isWalkthrough) {
    return (
      <div className="fixed top-48 left-3 z-20 max-w-sm pointer-events-auto">
        <div className="glass-panel rounded-2xl p-3 shadow-xl bg-slate-900/90 border border-emerald-500/50">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span className="text-xs font-bold text-emerald-300 font-sans-ui">
              橋面ウォークスルー再生中
            </span>
          </div>
          <p className="text-xs text-slate-200 leading-relaxed font-sans-ui">
            東詰（内宮側大鳥居）から西詰（大広場側大鳥居）へ向かって、内宮伝統の「右側通行」で渡っています。マウスドラッグで自由視点に切り替えられます。
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed top-48 left-3 z-20 max-w-sm pointer-events-auto transition-all">
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
  );
};
