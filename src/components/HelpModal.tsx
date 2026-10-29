import React from 'react';
import { X, MousePointer, Move, ZoomIn, Eye, Sparkles } from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm pointer-events-auto">
      <div className="glass-panel bg-slate-900 rounded-3xl max-w-md w-full border border-amber-500/50 shadow-2xl p-5 md:p-6 text-slate-100 flex flex-col gap-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <span>操作ガイド &amp; 鑑賞の手引き</span>
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition"
            aria-label="閉じる"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex flex-col gap-3 font-sans-ui text-xs">
          <div className="bg-slate-950/70 p-3 rounded-2xl border border-slate-800 flex items-start gap-3">
            <MousePointer className="text-amber-400 flex-shrink-0 mt-0.5" size={18} />
            <div>
              <strong className="text-white block mb-0.5">360度 自由回転</strong>
              <p className="text-slate-300 text-[11px]">
                左ドラッグ（または画面スワイプ）で宇治橋を上下左右あらゆる角度から見渡せます。橋裏や橋脚も見上げ可能です。
              </p>
            </div>
          </div>

          <div className="bg-slate-950/70 p-3 rounded-2xl border border-slate-800 flex items-start gap-3">
            <ZoomIn className="text-amber-400 flex-shrink-0 mt-0.5" size={18} />
            <div>
              <strong className="text-white block mb-0.5">高精細ズーム・接写</strong>
              <p className="text-slate-300 text-[11px]">
                マウスホイール（または2本指ピンチ）で擬宝珠の刻銘や4本角釘の頭まで数十センチの至近距離まで接写できます。
              </p>
            </div>
          </div>

          <div className="bg-slate-950/70 p-3 rounded-2xl border border-slate-800 flex items-start gap-3">
            <Move className="text-amber-400 flex-shrink-0 mt-0.5" size={18} />
            <div>
              <strong className="text-white block mb-0.5">平行移動（パン）</strong>
              <p className="text-slate-300 text-[11px]">
                右ドラッグ（または2本指ドラッグ）で視界の中心を上下左右にスライドできます。
              </p>
            </div>
          </div>

          <div className="bg-slate-950/70 p-3 rounded-2xl border border-slate-800 flex items-start gap-3">
            <Eye className="text-amber-400 flex-shrink-0 mt-0.5" size={18} />
            <div>
              <strong className="text-white block mb-0.5">部位プリセット視点 &amp; 解説ピン</strong>
              <p className="text-slate-300 text-[11px]">
                下部ドックの視点1〜7や画面上の3Dピンをクリックすると、現地写真47枚で精査された重要ポイントへカメラが滑らかに滑空移動します。
              </p>
            </div>
          </div>

          <div className="bg-slate-950/70 p-3 rounded-2xl border border-slate-800 flex items-start gap-3">
            <Sparkles className="text-amber-400 flex-shrink-0 mt-0.5" size={18} />
            <div>
              <strong className="text-white block mb-0.5">構造分解表示（リフトアップ）</strong>
              <p className="text-slate-300 text-[11px]">
                「構造レイヤー・分解」タブ内のスライダーを動かすと、高欄や敷板が垂直にリフトアップし、普段は見えない橋脚の木組や主桁の噛み合わせを直感的に鑑賞できます。
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-3 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-medium text-xs font-sans-ui transition"
          >
            理解しました
          </button>
        </div>
      </div>
    </div>
  );
};
