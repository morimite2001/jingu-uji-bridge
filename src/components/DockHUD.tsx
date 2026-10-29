import React, { useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  Layers,
  Sparkles,
  Navigation,
  Pin,
  Sliders,
  Sun,
  Droplets
} from 'lucide-react';
import { VIEWPOINTS } from '../data/viewpoints';
import { StructureLayer, SurfaceCondition, Viewpoint } from '../types';

interface DockHUDProps {
  currentViewpoint: Viewpoint;
  onSelectViewpoint: (vp: Viewpoint) => void;
  surfaceCondition: SurfaceCondition;
  onToggleSurface: (cond: SurfaceCondition) => void;
  activeLayer: StructureLayer;
  onSelectLayer: (layer: StructureLayer) => void;
  explodedOffset: number;
  onChangeExploded: (offset: number) => void;
  showAnnotations: boolean;
  onToggleAnnotations: (show: boolean) => void;
  isWalkthrough: boolean;
  onToggleWalkthrough: () => void;
}

export const DockHUD: React.FC<DockHUDProps> = ({
  currentViewpoint,
  onSelectViewpoint,
  surfaceCondition,
  onToggleSurface,
  activeLayer,
  onSelectLayer,
  explodedOffset,
  onChangeExploded,
  showAnnotations,
  onToggleAnnotations,
  isWalkthrough,
  onToggleWalkthrough
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState<'viewpoints' | 'layers' | 'settings'>('viewpoints');

  const layersList: { id: StructureLayer; label: string; icon: string }[] = [
    { id: 'all', label: '全構造表示', icon: '🏯' },
    { id: 'railings', label: '高欄・擬宝珠', icon: '🏺' },
    { id: 'deck', label: '敷板・主桁・中央縁木', icon: '🛤️' },
    { id: 'substructure', label: '橋脚群・X字筋交い', icon: '🪵' },
    { id: 'river', label: '五十鈴川・木除け杭・堰', icon: '🌊' },
    { id: 'approaches', label: '橋詰・神明鳥居・石垣', icon: '🧱' },
  ];

  return (
    <div
      className={`fixed z-30 transition-all duration-300 ease-out left-1/2 -translate-x-1/2 w-full max-w-4xl px-3 ${
        isCollapsed ? 'bottom-2' : 'bottom-4'
      }`}
    >
      {/* Collapse / Expand Toggle Tab */}
      <div className="flex justify-center mb-1">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-amber-300 text-xs font-sans-ui border border-slate-700/80 shadow-lg transition"
          aria-label={isCollapsed ? 'コントロールパネルを展開' : 'コントロールパネルを収納'}
        >
          {isCollapsed ? (
            <>
              <ChevronUp size={14} className="text-amber-400" />
              <span>パネルを展開</span>
            </>
          ) : (
            <>
              <ChevronDown size={14} className="text-amber-400" />
              <span>禅ビュー（全画面表示）</span>
            </>
          )}
        </button>
      </div>

      {/* Main Control Panel Dock */}
      {!isCollapsed && (
        <div className="glass-panel rounded-2xl p-3 md:p-3.5 shadow-2xl bg-slate-900/95 border border-slate-700/80 flex flex-col gap-2.5">
          {/* Subheader: Mode Tabs & Quick Toggles */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2">
            {/* Nav Tabs */}
            <div className="flex items-center gap-1 bg-slate-950/70 p-1 rounded-xl border border-slate-800">
              <button
                onClick={() => setActiveTab('viewpoints')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-sans-ui transition ${
                  activeTab === 'viewpoints'
                    ? 'bg-amber-600 text-white font-semibold shadow'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Navigation size={13} />
                <span>部位視点（全47枚）</span>
              </button>

              <button
                onClick={() => setActiveTab('layers')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-sans-ui transition ${
                  activeTab === 'layers'
                    ? 'bg-amber-600 text-white font-semibold shadow'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Layers size={13} />
                <span>構造レイヤー・分解</span>
              </button>

              <button
                onClick={() => setActiveTab('settings')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-sans-ui transition ${
                  activeTab === 'settings'
                    ? 'bg-amber-600 text-white font-semibold shadow'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Sliders size={13} />
                <span>質感・環境設定</span>
              </button>
            </div>

            {/* Right Quick Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={onToggleWalkthrough}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-sans-ui font-medium transition shadow border ${
                  isWalkthrough
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-400'
                    : 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border-amber-500/40'
                }`}
              >
                <span>🚶</span>
                <span>{isWalkthrough ? 'ウォークスルー停止' : '橋面歩行（右側通行）'}</span>
              </button>

              <label className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-950/70 border border-slate-800 cursor-pointer text-xs font-sans-ui text-slate-300 hover:text-white">
                <input
                  type="checkbox"
                  checked={showAnnotations}
                  onChange={(e) => onToggleAnnotations(e.target.checked)}
                  className="w-3.5 h-3.5 accent-amber-500 rounded cursor-pointer"
                />
                <Pin size={12} className="text-amber-400" />
                <span className="hidden sm:inline">解説ピン</span>
              </label>
            </div>
          </div>

          {/* TAB 1: Architectural Viewpoints */}
          {activeTab === 'viewpoints' && (
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-1.5">
              {VIEWPOINTS.map((vp) => {
                const isActive = currentViewpoint.id === vp.id && !isWalkthrough;
                return (
                  <button
                    key={vp.id}
                    onClick={() => onSelectViewpoint(vp)}
                    className={`flex flex-col text-left p-2 rounded-xl transition border ${
                      isActive
                        ? 'bg-amber-600 text-white border-amber-400 shadow-md shadow-amber-600/30'
                        : 'bg-slate-800/80 hover:bg-slate-700/90 text-slate-300 border-slate-700/60'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] font-sans-ui mb-0.5 opacity-80">
                      <span>視点 {vp.number}</span>
                      <span className="truncate ml-1">{vp.photoRef.split('〜')[0]}</span>
                    </div>
                    <span className="text-xs font-bold truncate">{vp.title.split('：')[0]}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* TAB 2: Architectural Layer Filter & Exploded Lift Slider */}
          {activeTab === 'layers' && (
            <div className="flex flex-col gap-2">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-1.5">
                {layersList.map((layer) => {
                  const isSelected = activeLayer === layer.id;
                  return (
                    <button
                      key={layer.id}
                      onClick={() => onSelectLayer(layer.id)}
                      className={`flex items-center gap-1.5 px-2.5 py-2 rounded-xl text-xs font-sans-ui font-medium transition border ${
                        isSelected
                          ? 'bg-amber-600 text-white border-amber-400 shadow-md shadow-amber-600/30'
                          : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300 border-slate-700/60'
                      }`}
                    >
                      <span>{layer.icon}</span>
                      <span className="truncate">{layer.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Exploded / Lift Slider */}
              <div className="flex items-center gap-3 bg-slate-950/70 p-2.5 rounded-xl border border-slate-800">
                <div className="flex items-center gap-1.5 text-xs font-sans-ui text-amber-300 flex-shrink-0">
                  <Sparkles size={14} />
                  <span>構造分解（リフトアップ）:</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.02"
                  value={explodedOffset}
                  onChange={(e) => onChangeExploded(parseFloat(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                />
                <span className="text-xs font-sans-ui text-slate-300 font-mono w-10 text-right">
                  {Math.round(explodedOffset * 100)}%
                </span>
                {explodedOffset > 0 && (
                  <button
                    onClick={() => onChangeExploded(0)}
                    className="text-[11px] text-slate-400 hover:text-white px-2 py-0.5 rounded bg-slate-800 border border-slate-700"
                  >
                    リセット
                  </button>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: Material & Weather Conditions */}
          {activeTab === 'settings' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                onClick={() => onToggleSurface('wet')}
                className={`flex items-center justify-between p-3 rounded-xl border text-left transition ${
                  surfaceCondition === 'wet'
                    ? 'bg-amber-600/90 text-white border-amber-400 shadow-md shadow-amber-600/30'
                    : 'bg-slate-800/80 text-slate-300 border-slate-700/60 hover:bg-slate-700'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Droplets className="text-sky-300 flex-shrink-0" size={18} />
                  <div>
                    <div className="text-xs font-bold">💧 湿潤木肌・増水河川（現地写真準拠）</div>
                    <div className="text-[10px] text-slate-200/80 mt-0.5 font-sans-ui">
                      雨天直後のしっとり濡れた檜の艶感と黄褐色の豊かな五十鈴川
                    </div>
                  </div>
                </div>
                {surfaceCondition === 'wet' && <span className="text-xs">✓</span>}
              </button>

              <button
                onClick={() => onToggleSurface('dry')}
                className={`flex items-center justify-between p-3 rounded-xl border text-left transition ${
                  surfaceCondition === 'dry'
                    ? 'bg-amber-600/90 text-white border-amber-400 shadow-md shadow-amber-600/30'
                    : 'bg-slate-800/80 text-slate-300 border-slate-700/60 hover:bg-slate-700'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Sun className="text-amber-300 flex-shrink-0" size={18} />
                  <div>
                    <div className="text-xs font-bold">☀️ 乾燥檜肌・清流モード</div>
                    <div className="text-[10px] text-slate-200/80 mt-0.5 font-sans-ui">
                      快晴時の明るい白木肌・マットな質感と透明なエメラルドグリーンの五十鈴川
                    </div>
                  </div>
                </div>
                {surfaceCondition === 'dry' && <span className="text-xs">✓</span>}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
