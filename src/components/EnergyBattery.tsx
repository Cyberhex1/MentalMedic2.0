import React from 'react';
import { BatteryCharging, BatteryWarning, BatteryMedium, Zap, RefreshCw } from 'lucide-react';

interface EnergyBatteryProps {
  battery: number; // 0 - 100
  onRecharge: () => void;
  onDrain: (amount: number) => void;
  onSetBattery?: (level: number) => void;
}

export const EnergyBattery: React.FC<EnergyBatteryProps> = ({ battery, onRecharge, onDrain, onSetBattery }) => {
  const getBatteryColor = () => {
    if (battery <= 25) return 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.4)]';
    if (battery <= 55) return 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.3)]';
    return 'bg-pink-500 shadow-[0_0_8px_rgba(236,72,153,0.3)]';
  };

  const getBatteryIcon = () => {
    if (battery <= 25) return <BatteryWarning className="w-4 h-4 text-rose-500 animate-pulse" />;
    if (battery <= 55) return <BatteryMedium className="w-4 h-4 text-amber-500" />;
    return <BatteryCharging className="w-4 h-4 text-pink-500" />;
  };

  const handleBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!onSetBattery) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percent = Math.round((clickX / rect.width) * 100);
    const clamped = Math.max(0, Math.min(100, Math.round(percent / 5) * 5));
    onSetBattery(clamped);
  };

  return (
    <div className="flex items-center gap-2 bg-white/90 border border-pink-200/90 shadow-sm shadow-pink-500/5 backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs font-medium text-slate-700">
      <div className="flex items-center gap-1.5">
        {getBatteryIcon()}
        <span className="text-slate-500 font-medium">Battery:</span>
      </div>

      <div
        onClick={handleBarClick}
        title="Click anywhere on bar to set battery percentage directly (auto-lowers as you complete bits)"
        className="w-14 h-3 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-300 cursor-pointer hover:border-pink-400 transition-colors"
      >
        <div
          className={`h-full rounded-full transition-all duration-500 ${getBatteryColor()}`}
          style={{ width: `${Math.max(5, battery)}%` }}
        />
      </div>

      <span className="font-bold text-slate-800 min-w-[32px] text-right font-mono">{battery}%</span>

      <div className="flex gap-1 ml-1 border-l border-slate-300 pl-1.5">
        <button
          onClick={onRecharge}
          title="Somatic Recharge (+25%)"
          className="p-1 hover:bg-pink-50 rounded-full text-pink-600 hover:text-pink-700 transition-colors cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => onDrain(10)}
          title="Manual Drain Task (-10%)"
          className="p-1 hover:bg-rose-50 rounded-full text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
        >
          <Zap className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
