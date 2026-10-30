import React, { useState } from 'react';
import { Volume2, VolumeX, Info, HelpCircle, Camera } from 'lucide-react';
import { audioEngine } from '../utils/audioEngine';

interface HeaderHUDProps {
  onOpenSpecs: () => void;
  onOpenHelp: () => void;
  onCaptureScreenshot: () => void;
}

export const HeaderHUD: React.FC<HeaderHUDProps> = ({
  onOpenSpecs,
  onOpenHelp,
  onCaptureScreenshot
}) => {
  const [isMuted, setIsMuted] = useState(true);

  const handleToggleAudio = () => {
    const muted = audioEngine.toggleMute();
    setIsMuted(muted);
    if (!muted) {
      audioEngine.playShrineChime();
    }
  };

  return (
    <header className="fixed top-2 left-2 right-2 md:left-3 md:right-auto z-30 pointer-events-none flex flex-col gap-1.5 md:max-w-xl">
      <div className="glass-panel rounded-2xl p-2.5 md:p-3.5 shadow-2xl pointer-events-auto border-l-4 border-amber-500 bg-slate-900/90">
        <div className="flex items-center justify-between gap-2 md:items-start md:gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 mb-0.5">
              <span className="text-[9px] md:text-[10px] tracking-wider text-amber-300 font-semibold px-1.5 md:px-2 py-0.5 rounded bg-amber-500/20 font-sans-ui whitespace-nowrap">
                写真47枚精査
              </span>
              <span className="text-[9px] md:text-[10px] text-slate-400 font-sans-ui hidden sm:inline whitespace-nowrap">
                本体特化・樹木撤去済
              </span>
            </div>
            <h1 className="text-sm md:text-lg font-bold tracking-wider text-white truncate">
              伊勢神宮 宇治橋 3D橋梁構造ビューア
            </h1>
            <p className="text-[11px] text-slate-300 mt-1 leading-relaxed hidden md:block">
              高欄のくり形束柱、4本角釘継手、擬宝珠の「御裳濯川 御橋」陰刻、中央縁木、X字筋交い橋脚群、Aフレーム木除け杭まで精密再現。
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-1 md:gap-1.5 flex-shrink-0">
            <button
              onClick={handleToggleAudio}
              className={`p-1.5 md:p-2 rounded-xl border transition ${
                !isMuted
                  ? 'bg-amber-600 text-white border-amber-400 shadow-md shadow-amber-600/30'
                  : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-700'
              }`}
              title={isMuted ? '五十鈴川の清流音を再生' : '清流音をミュート'}
              aria-label="音声切替"
            >
              {!isMuted ? <Volume2 size={15} /> : <VolumeX size={15} />}
            </button>

            <button
              onClick={onCaptureScreenshot}
              className="p-1.5 md:p-2 rounded-xl bg-slate-800/80 text-slate-300 border border-slate-700 hover:bg-slate-700 hover:text-white transition"
              title="3D画面を高解像度保存"
              aria-label="画面キャプチャ"
            >
              <Camera size={15} />
            </button>

            <button
              onClick={onOpenSpecs}
              className="p-1.5 md:p-2 rounded-xl bg-slate-800/80 text-slate-300 border border-slate-700 hover:bg-slate-700 hover:text-white transition"
              title="橋梁構造仕様・スペック"
              aria-label="構造仕様"
            >
              <Info size={15} />
            </button>

            <button
              onClick={onOpenHelp}
              className="p-1.5 md:p-2 rounded-xl bg-slate-800/80 text-slate-300 border border-slate-700 hover:bg-slate-700 hover:text-white transition"
              title="操作ガイド"
              aria-label="操作ガイド"
            >
              <HelpCircle size={15} />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
