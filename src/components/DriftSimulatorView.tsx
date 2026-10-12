import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Wind, 
  Waves, 
  Compass, 
  Timer, 
  Play, 
  Pause, 
  RotateCcw, 
  AlertTriangle, 
  ShieldCheck, 
  Radio, 
  Download, 
  Send, 
  Eye, 
  Layers,
  Sparkles,
  X,
  Droplets
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '../lib/utils';
import { logSecurityAudit, checkRateLimit } from '../lib/security';

interface DriftSimulatorViewProps {
  onDrillInitiated?: () => void;
  isDrillActive?: boolean;
}

export const DriftSimulatorView: React.FC<DriftSimulatorViewProps> = ({ 
  onDrillInitiated, 
  isDrillActive = false 
}) => {
  const [forecastHour, setForecastHour] = useState<number>(12);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentSpeedMps, setCurrentSpeedMps] = useState<number>(1.4);
  const [currentAngleDeg, setCurrentAngleDeg] = useState<number>(45); // NE direction
  const [windKnots, setWindKnots] = useState<number>(18);
  const [substance, setSubstance] = useState<'Crude Bunker' | 'Diesel Sheen' | 'Microplastics'>('Crude Bunker');
  const [boomsDeployed, setBoomsDeployed] = useState<boolean>(false);
  const [isNotmarModalOpen, setIsNotmarModalOpen] = useState<boolean>(false);

  // Auto-play interval
  useEffect(() => {
    let interval: any;
    if (isPlaying) {
      interval = setInterval(() => {
        setForecastHour(prev => {
          if (prev >= 48) {
            setIsPlaying(false);
            return 48;
          }
          return prev + 2;
        });
      }, 350);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  // Derived physics calculations
  const driftDistanceKm = Number((forecastHour * (currentSpeedMps * 3.6 * 0.7 + windKnots * 0.05 * 1.852) * (boomsDeployed ? 0.2 : 1.0)).toFixed(1));
  const plumeAreaSqKm = Number((1.2 + forecastHour * 0.9 * (boomsDeployed ? 0.3 : 1.0)).toFixed(1));
  const bioSanctuaryDistanceKm = 36;
  const hoursUntilSanctuaryImpact = Math.max(0, Number(((bioSanctuaryDistanceKm - driftDistanceKm) / Math.max(0.5, (currentSpeedMps * 3.6))).toFixed(1)));
  const isSanctuaryBreached = driftDistanceKm >= bioSanctuaryDistanceKm;

  // Pixel coordinates for the simulated plume centroid
  const radianAngle = (currentAngleDeg - 90) * (Math.PI / 180);
  const offsetDistancePx = (driftDistanceKm / 60) * 180;
  const plumeCenterX = 45 + Math.cos(radianAngle) * (offsetDistancePx / 10);
  const plumeCenterY = 48 + Math.sin(radianAngle) * (offsetDistancePx / 10);

  const handleToggleBooms = () => {
    const nextState = !boomsDeployed;
    setBoomsDeployed(nextState);
    if (nextState) {
      toast.success("Containment Booms Deployed", {
        description: "1,200m high-buoyancy ocean barrier rings anchored. Plume expansion restricted by 75%."
      });
      logSecurityAudit('DEPLOY_CONTAINMENT_BOOMS', 'SECTOR_7G', 'Virtual and physical rapid deployment booms active');
    } else {
      toast.info("Booms Retrieved / Inactive");
    }
  };

  const handleBroadcastNotmar = () => {
    if (!checkRateLimit('BROADCAST_NOTMAR', 3, 15000)) {
      toast.warning("Broadcast Throttled", { description: "NAVTEX international frequency cool-down active." });
      return;
    }

    logSecurityAudit('BROADCAST_NOTMAR', 'GLOBAL_MARITIME', 'Emergency Notice to Mariners issued for Sector 7-G');
    setIsNotmarModalOpen(false);
    toast.success("NAVTEX NOTMAR Broadcast Dispatched", {
      description: "Emergency Navigational Warning transmitted on 518 kHz. Commercial traffic alerted to divert."
    });
  };

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="glass-dark rounded-[2.5rem] p-8 md:p-10 border border-white/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="px-3 py-1 rounded-full bg-primary/20 text-primary text-[10px] font-black uppercase tracking-widest data-mono border border-primary/30 flex items-center gap-1.5">
                <Wind className="w-3.5 h-3.5 animate-pulse" />
                HYDRODYNAMIC_DRIFT_ENGINE
              </span>
              {isDrillActive && (
                <span className="px-3 py-1 rounded-full bg-accent/20 text-accent text-[10px] font-black uppercase tracking-widest data-mono border border-accent/40 animate-pulse">
                  🚨 TACTICAL_DRILL_SIMULATION
                </span>
              )}
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight uppercase">
              OCEAN CURRENT DRIFT & <span className="text-primary neon-text">PLUME TRAJECTORY SIMULATOR</span>
            </h2>
            <p className="text-white/50 text-xs md:text-sm mt-2 max-w-2xl font-medium">
              Real-time Eulerian-Lagrangian particle dispersion modeling calculating crude slick trajectory, coastal sanctuary threat windows, and containment boom barrier positioning.
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-4">
            <div className="bg-white/5 border border-white/10 rounded-2xl px-5 py-3 text-center">
              <span className="text-[10px] font-black uppercase tracking-widest text-white/40 block data-mono">FORECAST_HORIZON</span>
              <span className="text-2xl font-black text-primary data-mono">T+{forecastHour} HOURS</span>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl px-5 py-3 text-center">
              <span className="text-[10px] font-black uppercase tracking-widest text-white/40 block data-mono">PROJECTED_AREA</span>
              <span className="text-2xl font-black text-white data-mono">{plumeAreaSqKm} KM²</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Trajectory Map (Left) + Physics Controls (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Ocean Basin Canvas Display */}
        <div className="lg:col-span-8 relative h-[680px] rounded-[2.5rem] overflow-hidden border border-white/10 glass shadow-2xl bg-[#020b14]">
          {/* Base Ocean Background Texture */}
          <img 
            src="https://images.unsplash.com/photo-1518176258769-f24305436571?auto=format&fit=crop&q=80&w=2000"
            alt="Ocean Bathymetry"
            className="w-full h-full object-cover opacity-20 filter contrast-150 brightness-75 pointer-events-none"
            referrerPolicy="no-referrer"
          />

          {/* Current Vectors Grid (Animated arrows) */}
          <div className="absolute inset-0 pointer-events-none opacity-30 overflow-hidden">
            <svg className="w-full h-full">
              <defs>
                <pattern id="currentGrid" width="80" height="80" patternUnits="userSpaceOnUse">
                  <g transform={`rotate(${currentAngleDeg - 90}, 40, 40)`}>
                    <line x1="20" y1="40" x2="60" y2="40" stroke="#00f5ff" strokeWidth="1.5" strokeDasharray="3 3" />
                    <polygon points="56,36 64,40 56,44" fill="#00f5ff" />
                  </g>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#currentGrid)" />
            </svg>
          </div>

          {/* Bio-Sanctuary Shoreline Protected Boundary */}
          <div className="absolute top-8 right-8 z-20 glass-dark border border-white/10 rounded-2xl p-4 max-w-xs">
            <div className="flex items-center gap-2 mb-1">
              <ShieldCheck className={cn("w-4 h-4", isSanctuaryBreached ? "text-error animate-pulse" : "text-primary")} />
              <span className="text-[10px] font-black uppercase tracking-widest text-white data-mono">
                CAPE HATTERAS BIO-SANCTUARY
              </span>
            </div>
            <p className="text-[11px] text-white/60 font-medium">
              {isSanctuaryBreached ? (
                <span className="text-error font-bold">⚠️ CRITICAL: Marine sanctuary buffer perimeter breached by hydrocarbon slick.</span>
              ) : (
                `Distance to sanctuary: ${(bioSanctuaryDistanceKm - driftDistanceKm).toFixed(1)} km (Impact window: ~${hoursUntilSanctuaryImpact}h)`
              )}
            </p>
          </div>

          {/* Initial Spill Origin Marker */}
          <div 
            className="absolute z-20 flex flex-col items-center pointer-events-none"
            style={{ top: '48%', left: '45%' }}
          >
            <div className="w-4 h-4 rounded-full bg-accent border-2 border-white shadow-[0_0_15px_rgba(255,77,0,1)] animate-ping" />
            <span className="px-2 py-0.5 mt-2 rounded bg-surface/90 border border-white/10 text-[8px] font-black text-accent data-mono uppercase tracking-widest">
              ORIGIN // SECTOR 7-G
            </span>
          </div>

          {/* Projected Dispersion Plume Ellipse */}
          <motion.div
            className={cn(
              "absolute rounded-[48%] border-2 pointer-events-none transition-all duration-300",
              substance === 'Crude Bunker' ? "bg-amber-950/40 border-accent shadow-[0_0_50px_rgba(255,77,0,0.5)]" :
              substance === 'Diesel Sheen' ? "bg-cyan-900/40 border-primary shadow-[0_0_40px_rgba(0,245,255,0.4)]" :
              "bg-purple-900/40 border-purple-400 shadow-[0_0_40px_rgba(168,85,247,0.4)]"
            )}
            style={{
              top: `${plumeCenterY}%`,
              left: `${plumeCenterX}%`,
              width: `${Math.min(380, 70 + plumeAreaSqKm * 8)}px`,
              height: `${Math.min(260, 50 + plumeAreaSqKm * 5)}px`,
              transform: `translate(-50%, -50%) rotate(${currentAngleDeg - 30}deg)`,
            }}
          >
            {/* Concentric high-density core */}
            <div className="absolute inset-4 rounded-[45%] bg-accent/30 blur-sm pointer-events-none" />

            {/* Simulated Booms Barrier Ring around Plume */}
            {boomsDeployed && (
              <div className="absolute -inset-3 rounded-[50%] border-2 border-dashed border-yellow-400 animate-spin" style={{ animationDuration: '30s' }}>
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded bg-yellow-400 text-surface text-[8px] font-black uppercase tracking-widest data-mono">
                  BOOM_BARRIER_LOCKED
                </span>
              </div>
            )}
          </motion.div>

          {/* Trajectory Drift Arrow Line */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            <line 
              x1="45%" 
              y1="48%" 
              x2={`${plumeCenterX}%`} 
              y2={`${plumeCenterY}%`} 
              stroke="#00f5ff" 
              strokeWidth="2.5" 
              strokeDasharray="6 6"
              className="animate-pulse"
            />
          </svg>

          {/* Time Scrubber Control Bar at Bottom */}
          <div className="absolute bottom-6 left-6 right-6 z-30 glass-dark p-6 rounded-[2rem] border border-white/10 shadow-2xl">
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="p-3 rounded-2xl bg-primary text-surface hover:scale-105 active:scale-95 transition-all shadow-[0_0_15px_rgba(0,245,255,0.4)]"
                  >
                    {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
                  </button>
                  <button 
                    onClick={() => { setForecastHour(0); setIsPlaying(false); }}
                    className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-all"
                  >
                    <RotateCcw className="w-5 h-5" />
                  </button>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/40 block data-mono">SCRUB_TIMELINE</span>
                    <span className="text-lg font-black text-white data-mono">T+{forecastHour}H PROJECTION</span>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/40 block data-mono">DRIFT_DISTANCE</span>
                    <span className="text-lg font-black text-primary data-mono">{driftDistanceKm} KM</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/40 block data-mono">EST_IMPACT</span>
                    <span className={cn("text-lg font-black data-mono", isSanctuaryBreached ? "text-error" : "text-white")}>
                      {isSanctuaryBreached ? "BREACHED" : `${hoursUntilSanctuaryImpact} HOURS`}
                    </span>
                  </div>
                </div>
              </div>

              {/* Slider Input */}
              <input 
                type="range" 
                min="0" 
                max="48" 
                step="1"
                value={forecastHour}
                onChange={(e) => setForecastHour(Number(e.target.value))}
                className="w-full accent-primary h-2 bg-white/10 rounded-lg cursor-pointer"
              />

              <div className="flex justify-between text-[9px] font-black text-white/40 data-mono uppercase tracking-widest">
                <span>T+0H (DETECTION)</span>
                <span>T+12H (MID-TRANSIT)</span>
                <span>T+24H (COASTAL ALERT)</span>
                <span>T+48H (SANCTUARY IMPACT)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Physics Controls & Intervention Panel (Right) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="glass-dark rounded-[2.5rem] p-8 border border-white/10 shadow-2xl space-y-6">
            <h3 className="text-lg font-black text-white uppercase tracking-tight flex items-center gap-2">
              <Compass className="w-5 h-5 text-primary" />
              HYDRODYNAMIC CONTROLS
            </h3>

            {/* Current Speed */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold data-mono">
                <span className="text-white/40">CURRENT_VELOCITY:</span>
                <span className="text-primary">{currentSpeedMps} M/S ({(currentSpeedMps * 1.94).toFixed(1)} KN)</span>
              </div>
              <input 
                type="range" 
                min="0.2" 
                max="3.5" 
                step="0.1"
                value={currentSpeedMps}
                onChange={(e) => setCurrentSpeedMps(Number(e.target.value))}
                className="w-full accent-primary h-2 bg-white/10 rounded-lg cursor-pointer"
              />
            </div>

            {/* Current Angle */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold data-mono">
                <span className="text-white/40">CURRENT_DIRECTION:</span>
                <span className="text-primary">{currentAngleDeg}° (VECTOR NE)</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="360" 
                step="5"
                value={currentAngleDeg}
                onChange={(e) => setCurrentAngleDeg(Number(e.target.value))}
                className="w-full accent-primary h-2 bg-white/10 rounded-lg cursor-pointer"
              />
            </div>

            {/* Wind Speed */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold data-mono">
                <span className="text-white/40">SURFACE_WIND:</span>
                <span className="text-primary">{windKnots} KNOTS (FORCE 5)</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="45" 
                step="1"
                value={windKnots}
                onChange={(e) => setWindKnots(Number(e.target.value))}
                className="w-full accent-primary h-2 bg-white/10 rounded-lg cursor-pointer"
              />
            </div>

            {/* Substance Selector */}
            <div className="space-y-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-white/40 block data-mono">CONTAMINANT_VISCOSITY</span>
              <div className="grid grid-cols-3 gap-2">
                {(['Crude Bunker', 'Diesel Sheen', 'Microplastics'] as const).map(type => (
                  <button
                    key={type}
                    onClick={() => setSubstance(type)}
                    className={cn(
                      "py-2 px-1 rounded-xl text-[9px] font-black uppercase tracking-wider data-mono transition-all border",
                      substance === type 
                        ? "bg-primary text-surface border-primary" 
                        : "bg-white/5 border-white/10 text-white/60 hover:text-white"
                    )}
                  >
                    {type.split(' ')[0]}
                  </button>
                ))}
              </div>
            </div>

            {/* Barrier Intervention Buttons */}
            <div className="pt-4 border-t border-white/10 space-y-3">
              <button
                onClick={handleToggleBooms}
                className={cn(
                  "w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl flex items-center justify-center gap-2",
                  boomsDeployed 
                    ? "bg-yellow-400 text-surface shadow-[0_0_20px_rgba(250,204,21,0.5)]" 
                    : "bg-white/5 hover:bg-white/10 border border-white/20 text-white"
                )}
              >
                <ShieldCheck className="w-4 h-4" />
                {boomsDeployed ? "RETRIEVE BOOMS (BARRIER ENGAGED)" : "DEPLOY RAPID CONTAINMENT BOOMS"}
              </button>

              <button
                onClick={() => setIsNotmarModalOpen(true)}
                className="w-full py-4 rounded-2xl bg-accent hover:bg-accent/90 text-white font-black text-xs uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(255,77,0,0.4)] flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
              >
                <Radio className="w-4 h-4" />
                BROADCAST NAVTEX / NOTMAR NOTICE
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* NOTMAR Broadcast Modal */}
      <AnimatePresence>
        {isNotmarModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="max-w-2xl w-full glass-dark rounded-[2.5rem] border border-accent/40 shadow-[0_25px_100px_rgba(255,77,0,0.4)] p-8 md:p-10 relative overflow-hidden"
            >
              <button 
                onClick={() => setIsNotmarModalOpen(false)}
                className="absolute top-6 right-6 p-2 rounded-xl bg-white/5 text-white/50 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3 mb-6">
                <span className="p-3 rounded-2xl bg-accent text-white">
                  <Radio className="w-6 h-6 animate-pulse" />
                </span>
                <div>
                  <h3 className="text-xl font-black text-white uppercase tracking-tight">COAST GUARD NOTICE TO MARINERS // NOTMAR 2026-44</h3>
                  <p className="text-white/40 text-[10px] font-black uppercase tracking-widest data-mono">
                    URGENT NAVIGATIONAL HAZARD BROADCAST (NAVTEX 518 KHZ)
                  </p>
                </div>
              </div>

              <div className="space-y-4 text-xs text-white/80 font-medium mb-8 bg-black/60 p-6 rounded-2xl border border-white/10 data-mono leading-relaxed">
                <div className="text-accent font-black">
                  SECURITE // SECURITE // SECURITE
                </div>
                <div>
                  1. COAST GUARD SECTOR COMMAND HAS ESTABLISHED A MARITIME EXCLUSION SAFETY ZONE IN SECTOR 7-G (34°22.4'N 075°40.1'W) DUE TO UNCONTROLLED HYDROCARBON SURFACE SLICK.
                </div>
                <div>
                  2. PROJECTED DRIFT VECTOR: {currentAngleDeg}° AT {(currentSpeedMps * 1.94).toFixed(1)} KNOTS. EST PLUME AREA: {plumeAreaSqKm} KM².
                </div>
                <div>
                  3. ALL COMMERCIAL VESSELS, TRAWLERS, AND PLEASURE CRAFT ADVISE MAINTAINING 5 NM CLEARANCE. CONTAINMENT BOOM RIGGING VESSELS UNDERWAY.
                </div>
                <div className="text-white/40 border-t border-white/10 pt-2 text-[10px]">
                  BROADCAST CODE: USCG-NOTMAR-SEC7G-URGENT // CANCEL AT 141200Z OCT 26
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setIsNotmarModalOpen(false)}
                  className="flex-1 py-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-black text-xs uppercase tracking-widest"
                >
                  DISMISS
                </button>
                <button
                  onClick={handleBroadcastNotmar}
                  className="flex-1 py-4 rounded-2xl bg-accent hover:bg-accent/90 text-white font-black text-xs uppercase tracking-widest shadow-lg flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  TRANSMIT TO ALL MARITIME STATIONS
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
