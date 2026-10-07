import React, { useEffect, useState } from 'react';

interface SplashScreenProps {
  onFinish: () => void;
  appName?: string;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ 
  onFinish, 
  appName = "Wordora" 
}) => {
  const [fadeState, setFadeState] = useState<'entering' | 'visible' | 'exiting'>('entering');

  useEffect(() => {
    // Smooth Android splash timing
    const enterTimer = setTimeout(() => {
      setFadeState('visible');
    }, 100);

    const exitTimer = setTimeout(() => {
      setFadeState('exiting');
    }, 1400);

    const finishTimer = setTimeout(() => {
      onFinish();
    }, 1800);

    return () => {
      clearTimeout(enterTimer);
      clearTimeout(exitTimer);
      clearTimeout(finishTimer);
    };
  }, [onFinish]);

  return (
    <div 
      onClick={onFinish}
      className={`fixed inset-0 z-50 flex flex-col items-center justify-between p-8 bg-gradient-to-b from-[#0a1628] via-[#071324] to-[#040b15] text-white transition-opacity duration-400 select-none cursor-pointer ${
        fadeState === 'exiting' ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6 max-w-xs">
        {/* Official Wordora Logo Icon with Glow */}
        <div className="relative group">
          <div className="absolute -inset-4 bg-blue-500/25 rounded-3xl blur-2xl animate-pulse" />
          <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-3xl overflow-hidden shadow-2xl shadow-blue-600/40 border border-blue-400/30 transform transition-transform duration-500 scale-100 active:scale-95">
            <img 
              src="/wordora-logo.png" 
              alt="Wordora Official Logo"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>

        {/* Application Name & Tagline */}
        <div className="space-y-1.5">
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-blue-100 to-cyan-200 bg-clip-text text-transparent">
            {appName}
          </h1>
          <p className="text-xs text-blue-200/80 font-medium tracking-wide">
            Mobile Word Processor & Document Hub
          </p>
        </div>

        {/* Android Material-Style Subtle Spinner */}
        <div className="pt-4 flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-blue-500/30 border-t-cyan-400 rounded-full animate-spin" />
        </div>
      </div>

      {/* Splash Footer */}
      <div className="text-center space-y-1">
        <p className="text-[11px] text-blue-200/60 font-medium">
          Created by Arif Ahmed Adi
        </p>
        <p className="text-[10px] text-slate-500">
          Android Edition · Version 2.4
        </p>
      </div>
    </div>
  );
};
