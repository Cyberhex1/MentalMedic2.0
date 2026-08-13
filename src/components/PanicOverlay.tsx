import React, { useState } from 'react';
import { ShieldAlert, X, Plus, Sparkles } from 'lucide-react';

interface PanicOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  onLogTask: () => void;
  totalLogged: number;
}

export const PanicOverlay: React.FC<PanicOverlayProps> = ({
  isOpen,
  onClose,
  onLogTask,
  totalLogged,
}) => {
  const [clickAnimation, setClickAnimation] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleClick = () => {
    onLogTask();
    setClickAnimation(true);
    setTimeout(() => setClickAnimation(false), 200);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/90 z-50 flex flex-col items-center justify-center p-6 backdrop-blur-2xl animate-fadeIn">
      {/* Top Exit */}
      <button
        onClick={onClose}
        className="absolute top-6 right-6 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors cursor-pointer"
        title="Exit Panic Mode"
      >
        <X className="w-5 h-5" />
      </button>

      {/* Main Minimal Box */}
      <div className="text-center max-w-sm space-y-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-bold">
          <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
          <span>Panic / De-Escalation Mode</span>
        </div>

        <div>
          <h2 className="text-xl font-bold text-white">Zero-Load Mode Active</h2>
          <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
            All timers and complexity stripped. Simply click the giant button once for every micro Focus Bit you complete. Stop whenever you wish.
          </p>
        </div>

        {/* Giant Clicker Button */}
        <div className="my-8 flex justify-center">
          <button
            onClick={handleClick}
            className={`w-44 h-44 rounded-full bg-pink-500 hover:bg-pink-400 text-white font-extrabold text-5xl shadow-[0_0_50px_rgba(236,72,153,0.5)] flex flex-col items-center justify-center cursor-pointer transition-transform ${
              clickAnimation ? 'scale-90 shadow-[0_0_80px_rgba(236,72,153,0.8)]' : 'hover:scale-105'
            }`}
          >
            <span>{totalLogged}</span>
            <span className="text-xs font-extrabold uppercase tracking-wider text-pink-100 mt-1 flex items-center gap-0.5">
              <Plus className="w-3.5 h-3.5" /> Log Focus Bit
            </span>
          </button>
        </div>

        <div className="text-xs text-slate-400">
          No clocks. No deadlines. Just click when done.
        </div>

        <button
          onClick={onClose}
          className="px-6 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs cursor-pointer border border-white/20 transition-all"
        >
          Return to Dashboard
        </button>
      </div>
    </div>
  );
};
