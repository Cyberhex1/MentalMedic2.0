import React from 'react';

interface CuteUiDecoratorProps {
  enabled?: boolean;
}

export const CuteUiDecorator: React.FC<CuteUiDecoratorProps> = ({ enabled = true }) => {
  if (!enabled) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-30 overflow-hidden">
      {/* Floating Sparkles in corners */}
      <div className="absolute top-6 left-6 text-pink-400/60 text-lg animate-bounce duration-[3000ms] select-none">
        ✨
      </div>
      <div className="absolute top-12 right-12 text-purple-400/60 text-xl animate-pulse duration-[2500ms] select-none">
        🌸
      </div>
      <div className="absolute bottom-16 left-10 text-amber-400/50 text-base animate-bounce duration-[4000ms] select-none">
        💫
      </div>
      <div className="absolute bottom-8 right-8 text-pink-400/60 text-lg animate-pulse duration-[3000ms] select-none">
        ⭐
      </div>
    </div>
  );
};
