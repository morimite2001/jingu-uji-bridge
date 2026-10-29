import React from 'react';
import { X, CheckCircle, Shield, Calendar, Compass, Hash } from 'lucide-react';
import { BRIDGE_SPECS } from '../utils/bridgeMath';

interface SpecsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SpecsModal: React.FC<SpecsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm pointer-events-auto">
      <div className="glass-panel bg-slate-900 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-amber-500/50 shadow-2xl p-5 md:p-6 text-slate-100 flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-800 pb-3">
          <div>
            <span className="text-xs text-amber-400 font-semibold tracking-widest font-sans-ui block mb-1">
              BRIDGE STRUCTURE SPECIFICATIONS
            </span>
            <h2 className="text-lg md:text-xl font-bold tracking-wide text-white">
              伊勢神宮 宇治橋 橋梁構造・技術仕様書
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition"
            aria-label="閉じる"
          >
            <X size={20} />
          </button>
        </div>

        {/* Specs Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 font-sans-ui text-xs">
          <div className="bg-slate-950/70 p-3 rounded-2xl border border-slate-800">
            <div className="flex items-center gap-1.5 text-slate-400 mb-1">
              <Compass size={14} className="text-amber-400" />
              <span>全長（実物）</span>
            </div>
            <div className="text-base font-bold text-white">{BRIDGE_SPECS.actualLengthMeters} m</div>
            <div className="text-[10px] text-slate-400 mt-0.5">33間（約101.8m）</div>
          </div>

          <div className="bg-slate-950/70 p-3 rounded-2xl border border-slate-800">
            <div className="flex items-center gap-1.5 text-slate-400 mb-1">
              <Compass size={14} className="text-amber-400" />
              <span>橋面全幅</span>
            </div>
            <div className="text-base font-bold text-white">{BRIDGE_SPECS.deckWidthMeters} m</div>
            <div className="text-[10px] text-slate-400 mt-0.5">有効内幅 7.30m + 張り出し</div>
          </div>

          <div className="bg-slate-950/70 p-3 rounded-2xl border border-slate-800">
            <div className="flex items-center gap-1.5 text-slate-400 mb-1">
              <Compass size={14} className="text-amber-400" />
              <span>中央反り高</span>
            </div>
            <div className="text-base font-bold text-white">{BRIDGE_SPECS.archRiseMeters} m</div>
            <div className="text-[10px] text-slate-400 mt-0.5">緩やかな放物線アーチ</div>
          </div>

          <div className="bg-slate-950/70 p-3 rounded-2xl border border-slate-800">
            <div className="flex items-center gap-1.5 text-slate-400 mb-1">
              <Hash size={14} className="text-amber-400" />
              <span>擬宝珠総数</span>
            </div>
            <div className="text-base font-bold text-white">{BRIDGE_SPECS.giboshiCount} 基</div>
            <div className="text-[10px] text-slate-400 mt-0.5">本橋12基 + 袖高欄4基</div>
          </div>

          <div className="bg-slate-950/70 p-3 rounded-2xl border border-slate-800">
            <div className="flex items-center gap-1.5 text-slate-400 mb-1">
              <Hash size={14} className="text-amber-400" />
              <span>橋脚列数</span>
            </div>
            <div className="text-base font-bold text-white">{BRIDGE_SPECS.piersCount} 列</div>
            <div className="text-[10px] text-slate-400 mt-0.5">各列4本（計44本角柱）</div>
          </div>

          <div className="bg-slate-950/70 p-3 rounded-2xl border border-slate-800">
            <div className="flex items-center gap-1.5 text-slate-400 mb-1">
              <Calendar size={14} className="text-amber-400" />
              <span>架替周期</span>
            </div>
            <div className="text-base font-bold text-white">{BRIDGE_SPECS.rebuildCycleYears} 年</div>
            <div className="text-[10px] text-slate-400 mt-0.5">式年遷宮に先立ち斎行</div>
          </div>
        </div>

        {/* Architectural Features */}
        <div className="flex flex-col gap-2.5">
          <h3 className="text-xs font-bold text-amber-300 font-sans-ui uppercase tracking-wider">
            日本屈指の伝統木造橋梁技術
          </h3>

          <div className="bg-slate-950/70 p-3 rounded-2xl border border-slate-800 flex flex-col gap-2 text-xs">
            <div className="flex items-start gap-2">
              <CheckCircle size={15} className="text-amber-400 mt-0.5 flex-shrink-0" />
              <div>
                <strong className="text-white block mb-0.5">木組構造と耐久設計</strong>
                <p className="text-slate-300 leading-relaxed text-[11px]">
                  上部工は全て良質な国産檜（ヒノキ）を使用。高欄架木の継手には4本角釘の黒鉄覆輪金物、束柱は伝統的な「くり形」加工が施され、雨水の浸入を防ぎつつ風雨による膨縮を逃がす匠の木組みが用いられています。
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <Shield size={15} className="text-amber-400 mt-0.5 flex-shrink-0" />
              <div>
                <strong className="text-white block mb-0.5">上流木除け杭（Aフレーム）の治水力学</strong>
                <p className="text-slate-300 leading-relaxed text-[11px]">
                  五十鈴川の増水時に上流から流下する大径流木が直接橋脚に衝突するのを防ぐため、橋脚より約9m上流の川床に7基の独立した木除け杭が打たれています。斜めの前控え材と白い水切り板が流木を受け流します。
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <CheckCircle size={15} className="text-amber-400 mt-0.5 flex-shrink-0" />
              <div>
                <strong className="text-white block mb-0.5">「御裳濯川 御橋」の擬宝珠と萬寿神札</strong>
                <p className="text-slate-300 leading-relaxed text-[11px]">
                  西詰北側（外側向かって左手）の擬宝珠には、五十鈴川の古名である「御裳濯川」の陰刻が刻まれており、内部には橋の安全を守る神札（萬寿神札）が納められています。参拝者が手を触れて参拝する伝統があります。
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-3 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-medium text-xs font-sans-ui transition"
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
};
