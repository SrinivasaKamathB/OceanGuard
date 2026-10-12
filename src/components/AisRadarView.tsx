import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Radar, 
  Ship, 
  AlertOctagon, 
  Radio, 
  ShieldAlert, 
  FileText, 
  Send, 
  Crosshair, 
  Navigation, 
  CheckCircle2, 
  Layers, 
  Search,
  Filter,
  Eye,
  EyeOff,
  Clock,
  Compass,
  MapPin,
  ChevronRight,
  X
} from 'lucide-react';
import { toast } from 'sonner';
import { AisVessel, MaritimeCitation } from '../types/maritime';
import { INITIAL_AIS_VESSELS } from '../lib/maritimeData';
import { cn } from '../lib/utils';
import { logSecurityAudit, checkRateLimit } from '../lib/security';

interface AisRadarViewProps {
  onCitationIssued?: (citation: MaritimeCitation) => void;
}

export const AisRadarView: React.FC<AisRadarViewProps> = ({ onCitationIssued }) => {
  const [vessels] = useState<AisVessel[]>(INITIAL_AIS_VESSELS);
  const [selectedVessel, setSelectedVessel] = useState<AisVessel>(INITIAL_AIS_VESSELS[0]);
  const [filterMode, setFilterMode] = useState<'ALL' | 'DARK_ONLY' | 'TANKER_ONLY'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCitationModalOpen, setIsCitationModalOpen] = useState(false);
  const [radarZoom, setRadarZoom] = useState(1);
  const [interceptorDispatched, setInterceptorDispatched] = useState<Record<string, boolean>>({});

  const filteredVessels = vessels.filter(v => {
    const matchesSearch = !searchQuery || 
      v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.mmsi.includes(searchQuery) ||
      v.flagCountry.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (filterMode === 'DARK_ONLY') return matchesSearch && v.transponderStatus === 'SILENCED_DARK';
    if (filterMode === 'TANKER_ONLY') return matchesSearch && v.vesselType === 'Crude Tanker';
    return matchesSearch;
  });

  const handleDispatchInterceptor = (vessel: AisVessel) => {
    if (!checkRateLimit(`INTERCEPT_${vessel.id}`, 3, 10000)) {
      toast.warning("Dispatch Throttled", { description: "Tactical cutter communications queue is active." });
      return;
    }

    setInterceptorDispatched(prev => ({ ...prev, [vessel.id]: true }));
    logSecurityAudit(
      'DISPATCH_CUTTER_INTERCEPT',
      vessel.mmsi,
      `USCGC Sentinel dispatched to intercept ${vessel.name} at coordinates (${vessel.x}%, ${vessel.y}%)`
    );

    toast.error(`Tactical Intercept Dispatched to ${vessel.name}`, {
      description: `USCGC Sentinel (WPC-1101) underway. Intercept vector locked. ETA: 38 minutes. High alert protocol engaged.`
    });
  };

  const handleIssueCitation = (vessel: AisVessel) => {
    const citation: MaritimeCitation = {
      id: `CIT-MARPOL-${Date.now().toString().slice(-6)}`,
      vesselName: vessel.name,
      mmsi: vessel.mmsi,
      imo: vessel.imo,
      flagState: vessel.flagCountry,
      timestamp: new Date().toUTCString(),
      sector: 'SECTOR 7-G (NORTH REEF CONTIGUOUS ZONE)',
      estimatedVolumeBbl: 1400,
      violationCode: vessel.violatingRegulation || 'MARPOL 73/78 Annex I Reg 15',
      penaltyUsd: 2500000,
      evidenceHash: `SHA256:${Math.random().toString(36).substring(2, 10)}${Math.random().toString(36).substring(2, 10)}`.toUpperCase()
    };

    onCitationIssued?.(citation);
    logSecurityAudit(
      'MARITIME_CITATION_ISSUED',
      vessel.mmsi,
      `Citation ${citation.id} issued for ${citation.violationCode}. Assessment: $2.5M USD`
    );

    setIsCitationModalOpen(false);
    toast.success(`MARPOL Violation Citation ${citation.id} Transmitted`, {
      description: `Dispatched to IMO Registry and ${vessel.flagCountry} Flag State Authority. Evidence dossier sealed.`
    });
  };

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="glass-dark rounded-[2.5rem] p-8 md:p-10 border border-white/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="px-3 py-1 rounded-full bg-primary/20 text-primary text-[10px] font-black uppercase tracking-widest data-mono border border-primary/30 flex items-center gap-1.5">
                <Radar className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '6s' }} />
                AIS_RADAR_TACTICAL_SUITE
              </span>
              <span className="px-3 py-1 rounded-full bg-accent/20 text-accent text-[10px] font-black uppercase tracking-widest data-mono border border-accent/30 flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5" />
                POLLUTION_ATTRIBUTION_ACTIVE
              </span>
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight uppercase">
              LIVE AIS VESSEL TRACKING & <span className="text-primary neon-text">DARK SHIP INTERCEPT</span>
            </h2>
            <p className="text-white/50 text-xs md:text-sm mt-2 max-w-2xl font-medium">
              Correlating real-time transponder telemetry against satellite SAR slicks to identify covert bilge dumping, transponder silencing, and MARPOL Annex I environmental infractions.
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-4">
            <div className="bg-white/5 border border-white/10 rounded-2xl px-5 py-3 text-center">
              <span className="text-[10px] font-black uppercase tracking-widest text-white/40 block data-mono">TRACKED_FLEET</span>
              <span className="text-2xl font-black text-white data-mono">{vessels.length} VESSELS</span>
            </div>
            <div className="bg-accent/10 border border-accent/30 rounded-2xl px-5 py-3 text-center">
              <span className="text-[10px] font-black uppercase tracking-widest text-accent/80 block data-mono">DARK_TRANSPONDERS</span>
              <span className="text-2xl font-black text-accent data-mono animate-pulse">1 HIGH RISK</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Radar Screen (Left) + Intelligence Dossier (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Radar View Container */}
        <div className="lg:col-span-8 relative h-[680px] rounded-[2.5rem] overflow-hidden border border-white/10 glass shadow-2xl bg-[#030d18]">
          {/* Radar Background Circular Grid */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-40">
            {/* Range Rings */}
            <div className="w-[180px] h-[180px] rounded-full border border-primary/20" />
            <div className="absolute w-[360px] h-[360px] rounded-full border border-primary/25" />
            <div className="absolute w-[540px] h-[540px] rounded-full border border-primary/20" />
            <div className="absolute w-[680px] h-[680px] rounded-full border border-primary/15 border-dashed" />
            {/* Crosshairs */}
            <div className="absolute inset-x-0 top-1/2 h-px bg-primary/20" />
            <div className="absolute inset-y-0 left-1/2 w-px bg-primary/20" />
          </div>

          {/* Rotating Radar Sweep Beam */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div 
              className="w-[700px] h-[700px] rounded-full origin-center animate-spin"
              style={{ 
                animationDuration: '5s',
                animationTimingFunction: 'linear',
                background: 'conic-gradient(from 0deg, rgba(0, 245, 255, 0.25) 0deg, rgba(0, 245, 255, 0.05) 45deg, transparent 60deg, transparent 360deg)'
              }}
            />
          </div>

          {/* Azimuth Degree Labels */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 text-[10px] font-black tracking-widest text-primary/60 data-mono pointer-events-none">000° N</div>
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-[10px] font-black tracking-widest text-primary/60 data-mono pointer-events-none">180° S</div>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black tracking-widest text-primary/60 data-mono pointer-events-none">090° E</div>
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[10px] font-black tracking-widest text-primary/60 data-mono pointer-events-none">270° W</div>

          {/* Simulated Crude Oil Slick Polygon in Sector 7-G */}
          <div 
            className="absolute rounded-[40%] bg-accent/20 border-2 border-accent/60 blur-[1px] animate-pulse pointer-events-none"
            style={{ 
              top: '34%', 
              left: '42%', 
              width: '120px', 
              height: '80px',
              transform: 'rotate(-25deg)',
              boxShadow: '0 0 30px rgba(255, 77, 0, 0.35)'
            }}
          >
            <div className="absolute -top-6 left-2 px-2 py-0.5 rounded bg-accent/90 text-surface text-[8px] font-black data-mono uppercase tracking-widest">
              SLICK_SECTOR_7G // 1,400 BBL
            </div>
          </div>

          {/* Intercept Correlation Line from Dark Ship to Slick */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            <line 
              x1="44%" 
              y1="38%" 
              x2="47%" 
              y2="37%" 
              stroke="#ff4d00" 
              strokeWidth="2" 
              strokeDasharray="4 4" 
              className="animate-pulse"
            />
          </svg>

          {/* Top Controls Overlay */}
          <div className="absolute top-6 left-6 right-6 z-30 flex flex-wrap items-center justify-between gap-4 pointer-events-auto">
            {/* Search */}
            <div className="glass-dark px-4 py-2.5 rounded-2xl border-white/10 flex items-center gap-3 w-72">
              <Search className="w-4 h-4 text-primary" />
              <input 
                type="text" 
                placeholder="SEARCH_MMSI_OR_SHIP..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border-none outline-none text-xs font-bold text-white data-mono tracking-widest placeholder:text-white/30 w-full"
              />
            </div>

            {/* Filter Tabs */}
            <div className="glass-dark p-1.5 rounded-2xl border-white/10 flex items-center gap-2">
              <button 
                onClick={() => setFilterMode('ALL')}
                className={cn(
                  "px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider data-mono transition-all",
                  filterMode === 'ALL' ? "bg-primary text-surface shadow-[0_0_12px_rgba(0,245,255,0.4)]" : "text-white/50 hover:text-white"
                )}
              >
                ALL ({vessels.length})
              </button>
              <button 
                onClick={() => setFilterMode('DARK_ONLY')}
                className={cn(
                  "px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider data-mono transition-all flex items-center gap-1.5",
                  filterMode === 'DARK_ONLY' ? "bg-accent text-white shadow-[0_0_12px_rgba(255,77,0,0.5)]" : "text-white/50 hover:text-white"
                )}
              >
                <EyeOff className="w-3 h-3" />
                DARK / SUSPECT (1)
              </button>
              <button 
                onClick={() => setFilterMode('TANKER_ONLY')}
                className={cn(
                  "px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider data-mono transition-all",
                  filterMode === 'TANKER_ONLY' ? "bg-primary text-surface" : "text-white/50 hover:text-white"
                )}
              >
                TANKERS
              </button>
            </div>
          </div>

          {/* Vessel Plot Markers on Radar */}
          {filteredVessels.map(vessel => {
            const isDark = vessel.transponderStatus === 'SILENCED_DARK';
            const isSelected = selectedVessel.id === vessel.id;

            return (
              <motion.div
                key={vessel.id}
                onClick={() => setSelectedVessel(vessel)}
                className="absolute z-20 cursor-pointer group"
                style={{ top: `${vessel.y}%`, left: `${vessel.x}%` }}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                whileHover={{ scale: 1.25 }}
              >
                {/* Historical Trail Dots */}
                {isSelected && (
                  <div className="absolute pointer-events-none">
                    {vessel.trail.map((point, idx) => (
                      <div 
                        key={idx}
                        className={cn(
                          "absolute w-2 h-2 rounded-full",
                          isDark ? "bg-accent/60" : "bg-primary/50"
                        )}
                        style={{
                          left: `${(point.x - vessel.x) * 10}px`,
                          top: `${(point.y - vessel.y) * 10}px`
                        }}
                      />
                    ))}
                  </div>
                )}

                {/* Pulsing Target Ring */}
                <div className="relative flex items-center justify-center">
                  {isSelected && (
                    <span className={cn(
                      "absolute inline-flex h-16 w-16 rounded-full animate-ping opacity-60",
                      isDark ? "bg-accent/40" : "bg-primary/40"
                    )} />
                  )}

                  {/* Marker Node */}
                  <div className={cn(
                    "w-9 h-9 rounded-2xl flex items-center justify-center border-2 transition-all shadow-xl",
                    isDark 
                      ? "bg-accent/90 border-white text-white shadow-[0_0_20px_rgba(255,77,0,0.8)] animate-pulse" 
                      : "bg-[#052233]/90 border-primary/50 text-primary shadow-[0_0_15px_rgba(0,245,255,0.4)]",
                    isSelected ? "scale-125 ring-4 ring-white/40" : ""
                  )}>
                    <Ship className="w-4 h-4" style={{ transform: `rotate(${vessel.headingDeg}deg)` }} />
                  </div>

                  {/* Callout Label */}
                  <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 whitespace-nowrap pointer-events-none">
                    <div className={cn(
                      "px-2.5 py-1 rounded-xl text-[9px] font-black data-mono tracking-widest border backdrop-blur-md shadow-2xl",
                      isDark 
                        ? "bg-accent/90 text-white border-white/30" 
                        : "glass-dark text-white/90 border-white/10"
                    )}>
                      {vessel.name} // {vessel.speedKnots} KN
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}

          {/* Bottom Radar Status Strip */}
          <div className="absolute bottom-6 left-6 right-6 z-20 flex items-center justify-between glass-dark px-6 py-3 rounded-2xl border-white/10 text-[10px] font-black data-mono uppercase tracking-widest text-white/60">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5 text-primary">
                <Radio className="w-3.5 h-3.5 animate-pulse" />
                AIS FREQ 161.975 MHZ
              </span>
              <span className="hidden sm:inline text-white/30">|</span>
              <span className="hidden sm:inline">RADAR RANGE: 30 NM</span>
            </div>
            <div className="flex items-center gap-2 text-accent">
              <AlertOctagon className="w-3.5 h-3.5" />
              <span>CORRELATION THRESHOLD: 90%+</span>
            </div>
          </div>
        </div>

        {/* Intelligence Dossier Panel (Right) */}
        <div className="lg:col-span-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedVessel.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="glass-dark rounded-[2.5rem] p-6 border border-white/10 shadow-2xl relative overflow-y-auto flex flex-col justify-between max-h-[680px]"
            >
              <div>
                {/* Header & Badges */}
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className={cn(
                        "px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest data-mono border",
                        selectedVessel.transponderStatus === 'SILENCED_DARK'
                          ? "bg-accent/20 text-accent border-accent/40 animate-pulse"
                          : "bg-primary/20 text-primary border-primary/40"
                      )}>
                        {selectedVessel.transponderStatus === 'SILENCED_DARK' ? '🚨 SILENCED (DARK SHIP)' : '🟢 AIS_ACTIVE'}
                      </span>
                    </div>
                    <h3 className="text-xl font-black text-white tracking-tight">{selectedVessel.name}</h3>
                    <p className="text-white/40 text-[10px] font-bold data-mono tracking-widest mt-0.5">
                      MMSI: {selectedVessel.mmsi} // IMO: {selectedVessel.imo}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] font-black text-white/40 uppercase tracking-widest data-mono block">FLAG</span>
                    <span className="text-xs font-black text-white">{selectedVessel.flag}</span>
                  </div>
                </div>

                {/* Telemetry Metrics */}
                <div className="grid grid-cols-2 gap-2.5 mb-4">
                  <div className="bg-white/5 border border-white/5 rounded-2xl p-3">
                    <span className="text-[8px] font-black uppercase tracking-widest text-white/40 data-mono block mb-0.5">SPEED_HEADING</span>
                    <span className="text-base font-black text-primary data-mono">{selectedVessel.speedKnots} KN // {selectedVessel.headingDeg}°</span>
                  </div>
                  <div className="bg-white/5 border border-white/5 rounded-2xl p-3">
                    <span className="text-[8px] font-black uppercase tracking-widest text-white/40 data-mono block mb-0.5">DISTANCE_TO_SLICK</span>
                    <span className={cn(
                      "text-base font-black data-mono",
                      selectedVessel.distanceToSlickNm < 2 ? "text-accent" : "text-white"
                    )}>
                      {selectedVessel.distanceToSlickNm} NM
                    </span>
                  </div>
                  <div className="bg-white/5 border border-white/5 rounded-2xl p-3">
                    <span className="text-[8px] font-black uppercase tracking-widest text-white/40 data-mono block mb-0.5">VESSEL_TYPE</span>
                    <span className="text-xs font-black text-white truncate block">{selectedVessel.vesselType}</span>
                  </div>
                  <div className="bg-white/5 border border-white/5 rounded-2xl p-3">
                    <span className="text-[8px] font-black uppercase tracking-widest text-white/40 data-mono block mb-0.5">DISPLACEMENT</span>
                    <span className="text-xs font-black text-white data-mono">{selectedVessel.dwtTons.toLocaleString()} DWT</span>
                  </div>
                </div>

                {/* Attribution & Risk Evaluation Card */}
                <div className={cn(
                  "p-4 rounded-2xl border mb-4",
                  selectedVessel.riskScore > 80 
                    ? "bg-accent/10 border-accent/30" 
                    : "bg-white/5 border-white/10"
                )}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[9px] font-black uppercase tracking-widest text-white/50 data-mono">CORRELATION</span>
                    <span className={cn(
                      "text-xs font-black data-mono px-2 py-0.5 rounded",
                      selectedVessel.riskScore > 80 ? "bg-accent text-white" : "bg-primary/20 text-primary"
                    )}>
                      {selectedVessel.riskScore}% PROBABILITY
                    </span>
                  </div>
                  <p className="text-[11px] text-white/80 leading-relaxed font-medium mb-2">
                    {selectedVessel.transponderStatus === 'SILENCED_DARK' 
                      ? "⚠️ AIS transponder was manually silenced 194 mins ago upstream of Sector 7-G slick centroid. Drift retro-projection matches track within 0.8 NM."
                      : "Vessel transit path remains consistent with international shipping corridor. No anomalous engine slowdown observed."}
                  </p>
                  {selectedVessel.violatingRegulation && (
                    <div className="text-[9px] font-bold text-accent data-mono border-t border-accent/20 pt-1.5">
                      INFRACTION: {selectedVessel.violatingRegulation}
                    </div>
                  )}
                </div>
              </div>

              {/* Action Interventions */}
              <div className="space-y-2.5 pt-3 border-t border-white/10">
                {selectedVessel.riskScore > 80 ? (
                  <>
                    <button
                      onClick={() => setIsCitationModalOpen(true)}
                      className="w-full py-4 rounded-2xl bg-accent hover:bg-accent/90 text-white font-black text-xs uppercase tracking-widest transition-all shadow-[0_0_25px_rgba(255,77,0,0.4)] flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
                    >
                      <FileText className="w-4 h-4" />
                      ISSUE MARPOL CITATION ($2.5M)
                    </button>
                    <button
                      onClick={() => handleDispatchInterceptor(selectedVessel)}
                      disabled={interceptorDispatched[selectedVessel.id]}
                      className={cn(
                        "w-full py-3.5 rounded-2xl border font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2",
                        interceptorDispatched[selectedVessel.id]
                          ? "bg-white/10 border-white/10 text-white/40 cursor-not-allowed"
                          : "bg-white/5 hover:bg-white/10 border-white/20 text-white"
                      )}
                    >
                      <Navigation className="w-4 h-4 text-primary" />
                      {interceptorDispatched[selectedVessel.id] ? "CUTTER UNDERWAY (ETA 38M)" : "DISPATCH USCG INTERCEPTOR"}
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => toast.info(`Logged Monitoring Log for ${selectedVessel.name}`, { description: "Normal shipping corridor transit confirmed." })}
                    className="w-full py-3.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-black text-xs uppercase tracking-widest transition-all"
                  >
                    CONFIRM COMPLIANT TRANSIT
                  </button>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* MARPOL Citation Modal */}
      <AnimatePresence>
        {isCitationModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="max-w-2xl w-full glass-dark rounded-[2.5rem] border border-accent/40 shadow-[0_25px_100px_rgba(255,77,0,0.4)] p-8 md:p-10 relative overflow-hidden"
            >
              <button 
                onClick={() => setIsCitationModalOpen(false)}
                className="absolute top-6 right-6 p-2 rounded-xl bg-white/5 text-white/50 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3 mb-6">
                <span className="p-3 rounded-2xl bg-accent text-white">
                  <ShieldAlert className="w-6 h-6" />
                </span>
                <div>
                  <h3 className="text-xl font-black text-white uppercase tracking-tight">MARITIME VIOLATION CITATION // FORM CG-718A</h3>
                  <p className="text-white/40 text-[10px] font-black uppercase tracking-widest data-mono">
                    OFFICIAL NOTICE OF SPECIAL AREA CONTAMINANT DISCHARGE
                  </p>
                </div>
              </div>

              <div className="space-y-4 text-xs text-white/80 font-medium mb-8 bg-white/5 p-6 rounded-2xl border border-white/10 data-mono">
                <div className="flex justify-between border-b border-white/10 pb-2">
                  <span className="text-white/40">TARGET_VESSEL:</span>
                  <span className="font-black text-white">{selectedVessel.name}</span>
                </div>
                <div className="flex justify-between border-b border-white/10 pb-2">
                  <span className="text-white/40">MMSI / IMO:</span>
                  <span className="font-black text-white">{selectedVessel.mmsi} // {selectedVessel.imo}</span>
                </div>
                <div className="flex justify-between border-b border-white/10 pb-2">
                  <span className="text-white/40">VIOLATION:</span>
                  <span className="font-black text-accent">{selectedVessel.violatingRegulation}</span>
                </div>
                <div className="flex justify-between border-b border-white/10 pb-2">
                  <span className="text-white/40">ESTIMATED_DISCHARGE:</span>
                  <span className="font-black text-white">1,400 BBLS (CRUDE HYDROCARBONS)</span>
                </div>
                <div className="flex justify-between border-b border-white/10 pb-2">
                  <span className="text-white/40">STATUTORY_PENALTY:</span>
                  <span className="font-black text-primary text-base">$2,500,000 USD (OIL POLLUTION ACT 1990)</span>
                </div>
                <div className="flex justify-between pt-1">
                  <span className="text-white/40">CRYPTOGRAPHIC_EVIDENCE_HASH:</span>
                  <span className="text-[10px] text-white/60">SHA256:7E9F4A81BC93... (SEALED)</span>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setIsCitationModalOpen(false)}
                  className="flex-1 py-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-black text-xs uppercase tracking-widest"
                >
                  CANCEL
                </button>
                <button
                  onClick={() => handleIssueCitation(selectedVessel)}
                  className="flex-1 py-4 rounded-2xl bg-accent hover:bg-accent/90 text-white font-black text-xs uppercase tracking-widest shadow-lg flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  TRANSMIT TO IMO & FLAG STATE
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
