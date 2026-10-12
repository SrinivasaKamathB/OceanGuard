import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldAlert, Wind, Radar, ChevronRight, XCircle } from 'lucide-react';
import { cn } from '../lib/utils';

interface TacticalDrillBannerProps {
  isActive: boolean;
  onNavigate: (view: 'ais' | 'drift' | 'map') => void;
  onStandDown: () => void;
}

export const TacticalDrillBanner: React.FC<TacticalDrillBannerProps> = ({
  isActive,
  onNavigate,
  onStandDown
}) => {
  const [secondsRemaining, setSecondsRemaining] = useState(2700); // 45 minute exercise window

  useEffect(() => {
    if (!isActive) return;
    const interval = setInterval(() => {
      setSecondsRemaining(prev => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [isActive]);

  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;
  const timerStr = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  if (!isActive) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -50, opacity: 0 }}
        className="sticky top-24 z-40 bg-gradient-to-r from-accent/90 via-red-900/90 to-accent/90 border-y border-white/20 backdrop-blur-xl px-6 py-3 shadow-[0_10px_30px_rgba(255,77,0,0.5)]"
      >
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="p-2 rounded-xl bg-surface/80 text-accent animate-pulse">
              <ShieldAlert className="w-5 h-5" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-white font-black text-xs uppercase tracking-widest data-mono">
                  🚨 TACTICAL EMERGENCY DRILL ACTIVE: OPERATION NEPTUNE SHIELD
                </span>
                <span className="px-2 py-0.5 rounded bg-black/40 text-white text-[10px] font-black data-mono tracking-widest">
                  TIME_TO_SANCTUARY: {timerStr}
                </span>
              </div>
              <p className="text-white/80 text-[11px] font-medium hidden sm:block">
                Simulated 1,400 BBL heavy crude discharge in Sector 7-G. High-probability dark ship identified near slick centroid.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate('drift')}
              className="px-4 py-2 rounded-xl bg-surface/90 hover:bg-surface text-primary text-[10px] font-black uppercase tracking-wider data-mono transition-all flex items-center gap-1.5 shadow-md"
            >
              <Wind className="w-3.5 h-3.5" />
              DRIFT_SIMULATOR
            </button>
            <button
              onClick={() => onNavigate('ais')}
              className="px-4 py-2 rounded-xl bg-surface/90 hover:bg-surface text-accent text-[10px] font-black uppercase tracking-wider data-mono transition-all flex items-center gap-1.5 shadow-md"
            >
              <Radar className="w-3.5 h-3.5" />
              AIS_RADAR
            </button>
            <button
              onClick={onStandDown}
              className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-[10px] font-black uppercase tracking-wider data-mono transition-all flex items-center gap-1"
            >
              <XCircle className="w-3.5 h-3.5" />
              STAND_DOWN
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
