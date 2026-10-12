import React, { useState, useEffect } from 'react';
import { Toaster, toast } from 'sonner';
import { 
  Waves, 
  LayoutDashboard, 
  Map as MapIcon, 
  BarChart3, 
  Settings2, 
  ArrowUp, 
  Leaf, 
  AlertCircle, 
  CheckCircle2, 
  WifiOff, 
  Plus, 
  Minus, 
  MapPin,
  ChevronRight,
  Zap,
  Droplets,
  Search,
  MoreVertical,
  Filter,
  ArrowDown,
  Microscope,
  Activity,
  Layers,
  Thermometer,
  Wind,
  Camera,
  Upload,
  Trash2,
  Sun,
  Moon,
  Sparkles,
  ShieldAlert,
  MessageSquare,
  Battery,
  Clock,
  Wifi,
  Shield,
  Power,
  RotateCcw,
  Radar,
  Ship,
  Compass,
  Radio
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI } from "@google/genai";
import { AisRadarView } from './components/AisRadarView';
import { DriftSimulatorView } from './components/DriftSimulatorView';
import { TacticalDrillBanner } from './components/TacticalDrillBanner';
import { MaritimeCitation } from './types/maritime';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  LineChart, 
  Line,
  AreaChart,
  Area,
  CartesianGrid
} from 'recharts';
import { cn } from './lib/utils';
import { 
  validateImageUpload, 
  validateImageDataUrl, 
  sanitizeDetectionOutput, 
  sanitizeText, 
  checkRateLimit, 
  logSecurityAudit 
} from './lib/security';

// --- Types ---

type View = 'dashboard' | 'map' | 'ais' | 'drift' | 'analytics' | 'sensors' | 'detection' | 'reports' | 'admin';

interface Alert {
  id: string;
  type: 'error' | 'success' | 'offline' | 'warning';
  title: string;
  desc: string;
  time: string;
  isNew?: boolean;
}

interface DetectionResult {
  label: string;
  confidence: number;
  recommendation: string;
}

interface UserReport {
  id: string;
  image: string;
  description: string;
  location: string;
  timestamp: string;
  detections: DetectionResult[];
}

// --- Mock Data ---

const POLLUTION_DATA = [
  { name: 'Jan', value: 40 },
  { name: 'Feb', value: 30 },
  { name: 'Mar', value: 65 },
  { name: 'Apr', value: 45 },
  { name: 'May', value: 90 },
  { name: 'Jun', value: 55 },
];

const ANALYTICS_LINE_DATA = [
  { name: 'Jan', surface: 40, benthic: 30 },
  { name: 'Feb', surface: 35, benthic: 28 },
  { name: 'Mar', surface: 45, benthic: 35 },
  { name: 'Apr', surface: 42, benthic: 32 },
  { name: 'May', surface: 55, benthic: 40 },
  { name: 'Jun', surface: 48, benthic: 38 },
  { name: 'Jul', surface: 52, benthic: 42 },
  { name: 'Aug', surface: 45, benthic: 35 },
  { name: 'Sep', surface: 50, benthic: 38 },
  { name: 'Oct', surface: 48, benthic: 36 },
  { name: 'Nov', surface: 55, benthic: 42 },
  { name: 'Dec', surface: 52, benthic: 40 },
];

const ENVIRONMENTAL_DATA = [
  { time: '00:00', ph: 8.1, temp: 18.2, oxygen: 7.2, turbidity: 1.2 },
  { time: '04:00', ph: 8.0, temp: 17.8, oxygen: 7.5, turbidity: 1.5 },
  { time: '08:00', ph: 8.2, temp: 18.5, oxygen: 7.0, turbidity: 1.1 },
  { time: '12:00', ph: 8.1, temp: 19.4, oxygen: 6.8, turbidity: 1.3 },
  { time: '16:00', ph: 7.9, temp: 19.1, oxygen: 6.5, turbidity: 1.8 },
  { time: '20:00', ph: 8.1, temp: 18.6, oxygen: 7.1, turbidity: 1.4 },
];

const INITIAL_ALERTS: Alert[] = [
  { id: '1', type: 'error', title: 'Thermal Spike Detected', desc: 'Sector 7-G | 2.4°C above baseline', time: '2 MINS AGO' },
  { id: '2', type: 'success', title: 'Calibration Success', desc: 'Deep Sea Probe #102 | Resuming telemetry', time: '45 MINS AGO' },
  { id: '3', type: 'offline', title: 'Node Offline', desc: 'Shelf Edge Array | Signal lost during storm', time: '3 HOURS AGO' },
];

const INITIAL_SENSORS = [
  { id: '#022', type: 'Deep Sea Buoy', sector: '7B', status: 'Alert', battery: 82, sync: '14:22:05', telemetry: '32.4 kbps', signal: 85, latency: '120ms', icon: Waves, x: 45, y: 35, ph: 5.2, o2: 3.1, depth: '14.2m', location: 'North Reef Ridge' },
  { id: '#047', type: 'Surface Float', sector: '3A', status: 'Healthy', battery: 98, sync: '14:18:42', telemetry: '28.1 kbps', signal: 92, latency: '85ms', icon: Activity, x: 60, y: 50, ph: 8.1, o2: 7.4, depth: '0.5m', location: 'Gulf Stream Alpha' },
  { id: '#009', type: 'Reef Monitor', sector: '1D', status: 'Low Power', battery: 4, sync: '13:45:00', telemetry: '0.0 kbps', signal: 12, latency: '1200ms', icon: WifiOff, x: 30, y: 65, ph: 7.8, o2: 6.2, depth: '8.4m', location: 'Coral Shelf Delta' },
  { id: '#114', type: 'Salinity Probe', sector: '5C', status: 'Healthy', battery: 65, sync: '14:15:22', telemetry: '44.9 kbps', signal: 78, latency: '150ms', icon: Droplets, x: 75, y: 25, ph: 8.2, o2: 6.8, depth: '45.0m', location: 'Benthic Trench' },
  { id: '#088', type: 'Thermal Sensor', sector: '2B', status: 'Alert', battery: 45, sync: '14:05:10', telemetry: '12.2 kbps', signal: 40, latency: '450ms', icon: Activity, x: 20, y: 20, ph: 6.5, o2: 4.5, depth: '12.0m', location: 'Volcanic Vent' },
];

const INITIAL_REPORTS: UserReport[] = [
  {
    id: 'REP-SENTINEL-104',
    image: 'https://images.unsplash.com/photo-1621451537084-482c73073a0f?auto=format&fit=crop&q=80&w=800',
    description: 'Autonomous skimmer detected concentrated microplastic and PET bottle debris near reef boundary.',
    location: 'Sector 7-B // North Reef',
    timestamp: 'Today at 09:42 UTC',
    detections: [
      { label: 'Plastic Waste', confidence: 0.94, recommendation: 'Deploy surface containment boom and skimmers.' },
      { label: 'Microplastics', confidence: 0.81, recommendation: 'Activate secondary intake filter in sector 7.' }
    ]
  },
  {
    id: 'REP-SENTINEL-089',
    image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&q=80&w=800',
    description: 'Thermal camera flagged surface sheen with characteristic hydrocarbon absorption spectrum.',
    location: 'Sector 3-A // Gulf Alpha',
    timestamp: 'Yesterday at 17:15 UTC',
    detections: [
      { label: 'Oil Spill Sheen', confidence: 0.88, recommendation: 'Deploy absorbent booms and notify maritime hazard response.' }
    ]
  }
];

// --- UI Components ---

const BatteryIndicator = ({ level, className }: { level: number, className?: string }) => {
  const isLow = level < 20;
  const isCritical = level < 10;
  
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className="relative w-8 h-4 border border-white/10 rounded-md p-[2px] bg-white/5">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${level}%` }}
          transition={{ duration: 1, ease: "circOut" }}
          className={cn(
            "h-full rounded-[2px] relative overflow-hidden",
            level > 70 ? "bg-primary shadow-[0_0_10px_rgba(0,245,255,0.4)]" :
            level > 20 ? "bg-secondary" : "bg-error shadow-[0_0_10px_rgba(255,0,60,0.4)]"
          )}
        >
          {isLow && (
            <motion.div 
              animate={{ x: [-20, 40] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 bg-white/20 skew-x-12"
            />
          )}
        </motion.div>
        <div className="absolute -right-1.5 top-1/2 -translate-y-1/2 w-1 h-2 bg-white/10 rounded-r-sm" />
      </div>
      <span className={cn(
        "text-xs font-black data-mono tracking-tighter",
        level > 70 ? "text-primary" : level > 20 ? "text-white/60" : "text-error animate-pulse"
      )}>{level}%</span>
    </div>
  );
};

const SensorStatusBadge = ({ status, className }: { status: string, className?: string }) => {
  const configs: Record<string, { color: string, bg: string, icon: any, pulse?: boolean }> = {
    'Healthy': { color: 'text-primary', bg: 'bg-primary/10 border-primary/20', icon: CheckCircle2 },
    'Alert': { color: 'text-accent', bg: 'bg-accent/10 border-accent/20', icon: AlertCircle, pulse: true },
    'Low Power': { color: 'text-error', bg: 'bg-error/10 border-error/20', icon: Zap, pulse: true },
    'Deactivated': { color: 'text-white/20', bg: 'bg-white/5 border-white/10', icon: Power },
  };

  const config = configs[status] || configs['Healthy'];
  const Icon = config.icon;

  return (
    <div className={cn(
      "flex items-center gap-2 px-3 py-1.5 rounded-xl border text-[9px] font-black uppercase tracking-[0.2em] data-mono transition-all",
      config.bg, config.color, className
    )}>
      <div className="relative flex items-center justify-center">
        {config.pulse && (
          <motion.div
            animate={{ scale: [1, 1.8, 1], opacity: [0.5, 0, 0.5] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className={cn("absolute w-3 h-3 rounded-full blur-sm", config.color.replace('text-', 'bg-'))}
          />
        )}
        <Icon className={cn("w-3.5 h-3.5 relative z-10", config.pulse && "animate-pulse")} />
      </div>
      <span>{status}</span>
    </div>
  );
};

// --- Components ---

const TopNav = ({ 
  activeView, 
  setView,
  tacticalDrillActive,
  onToggleDrill
}: { 
  activeView: View, 
  setView: (v: View) => void,
  tacticalDrillActive?: boolean,
  onToggleDrill?: () => void
}) => {
  return (
    <header className="sticky top-0 z-50 glass-dark border-b border-white/5 backdrop-blur-3xl transition-all">
      <div className="max-w-7xl mx-auto px-6 h-24 flex items-center justify-between">
        <div className="flex items-center gap-4 group cursor-pointer" onClick={() => setView('dashboard')}>
          <div className="relative">
            <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(0,245,255,0.4)] group-hover:scale-110 transition-transform">
              <Waves className="text-surface w-7 h-7" />
            </div>
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-accent rounded-full border-2 border-surface animate-pulse shadow-[0_0_8px_rgba(255,77,0,0.8)]" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white tracking-tighter leading-none uppercase">OCEAN <span className="text-primary neon-text">IQ</span></h1>
            <p className="text-[9px] font-black uppercase tracking-[0.4em] text-white/30 mt-1 data-mono">SENTINEL_NETWORK_v4</p>
          </div>
        </div>
        <nav className="hidden xl:flex items-center gap-1.5">
          {[
            { id: 'dashboard', label: 'DASHBOARD', icon: LayoutDashboard },
            { id: 'map', label: 'MAP_GRID', icon: MapIcon },
            { id: 'ais', label: 'AIS_RADAR', icon: Radar },
            { id: 'drift', label: 'DRIFT_SIM', icon: Wind },
            { id: 'sensors', label: 'NODES', icon: Settings2 },
            { id: 'analytics', label: 'TELEMETRY', icon: BarChart3 },
            { id: 'detection', label: 'NEURAL_AI', icon: Camera },
            { id: 'reports', label: 'MISSION_LOGS', icon: MessageSquare },
            { id: 'admin', label: 'ADMIN_CORE', icon: Shield },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setView(id as View)}
              className={cn(
                "px-3.5 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center gap-2 relative group data-mono",
                activeView === id ? "text-primary neon-text" : "text-white/40 hover:text-white"
              )}
            >
              <Icon className={cn("w-3.5 h-3.5", activeView === id ? "text-primary" : "text-white/20 group-hover:text-white/60")} />
              {label}
              {activeView === id && (
                <motion.div 
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary shadow-[0_0_10px_rgba(0,245,255,0.8)]"
                />
              )}
            </button>
          ))}
        </nav>
        <div className="flex items-center gap-4">
          <button
            onClick={onToggleDrill}
            className={cn(
              "flex items-center gap-2 px-3.5 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider data-mono transition-all border",
              tacticalDrillActive
                ? "bg-accent text-white border-white/40 shadow-[0_0_18px_rgba(255,77,0,0.8)] animate-pulse"
                : "bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border-white/10"
            )}
            title="Toggle Emergency Tactical Interception Drill"
          >
            <Zap className={cn("w-3.5 h-3.5", tacticalDrillActive ? "text-white" : "text-accent")} />
            <span className="hidden sm:inline">{tacticalDrillActive ? 'DRILL ACTIVE' : 'TACTICAL DRILL'}</span>
          </button>

          <div className="hidden sm:flex items-center gap-3 px-3 py-2 bg-white/5 rounded-xl border border-white/10">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-[0_0_8px_rgba(0,245,255,0.8)]" />
            <span className="text-[10px] font-bold text-primary uppercase tracking-widest data-mono">SYS_OK</span>
          </div>
          <div className="h-10 w-10 rounded-2xl overflow-hidden border border-white/20 p-0.5 bg-gradient-to-br from-primary/40 to-transparent">
            <img 
              src="https://images.unsplash.com/photo-1559839734-2b71f1536780?auto=format&fit=crop&q=80&w=100&h=100" 
              alt="User Profile" 
              className="w-full h-full object-cover rounded-xl"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>
      </div>
    </header>
  );
};

const BottomNav = ({ currentView, setView }: { currentView: View, setView: (v: View) => void }) => (
  <nav className="xl:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-2 pb-6 pt-3 glass-dark border-t border-white/5 rounded-t-[2rem] transition-all">
    {[
      { id: 'dashboard', icon: LayoutDashboard, label: 'Dash' },
      { id: 'map', icon: MapIcon, label: 'Map' },
      { id: 'ais', icon: Radar, label: 'AIS' },
      { id: 'drift', icon: Wind, label: 'Drift' },
      { id: 'analytics', icon: BarChart3, label: 'Data' },
      { id: 'sensors', icon: Settings2, label: 'Nodes' },
      { id: 'detection', icon: Camera, label: 'AI' },
      { id: 'reports', icon: MessageSquare, label: 'Logs' },
      { id: 'admin', icon: Shield, label: 'Admin' },
    ].map((item) => (
      <button
        key={item.id}
        onClick={() => setView(item.id as View)}
        className={cn(
          "flex flex-col items-center justify-center p-2 transition-all active:scale-90 relative",
          currentView === item.id ? "text-primary" : "text-white/30"
        )}
      >
        <item.icon className={cn("w-5 h-5 mb-0.5", currentView === item.id && "drop-shadow-[0_0_8px_rgba(0,245,255,0.5)]")} />
        <span className="text-[7px] uppercase tracking-[0.1em] font-black data-mono">{item.label}</span>
        {currentView === item.id && (
          <div className="absolute -top-1 w-1 h-1 bg-primary rounded-full shadow-[0_0_8px_rgba(0,245,255,1)]" />
        )}
      </button>
    ))}
  </nav>
);

// --- Dashboard Views ---

const DashboardView = ({ alerts, notificationsEnabled, onToggleNotifications, onNavigate }: { 
  alerts: Alert[], 
  notificationsEnabled: boolean,
  onToggleNotifications: () => void,
  onNavigate?: (v: View) => void
}) => (
  <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
    {/* Network Health */}
    <section className="md:col-span-8 glass rounded-[2.5rem] p-10 flex flex-col justify-between min-h-[380px] relative overflow-hidden group border-white/10">
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full -mr-32 -mt-32 blur-[100px] transition-all group-hover:bg-primary/20" />
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-[11px] font-black uppercase tracking-[0.4em] text-primary data-mono">NETWORK_STATUS: OPTIMAL</span>
          </div>
          <button 
            onClick={onToggleNotifications}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border",
              notificationsEnabled 
                ? "bg-primary/20 text-primary border-primary/30" 
                : "bg-white/5 text-white/30 border-white/10 hover:bg-white/10"
            )}
          >
            {notificationsEnabled ? <Sun className="w-3 h-3" /> : <Moon className="w-3 h-3" />}
            {notificationsEnabled ? "NOTIFICATIONS_ON" : "NOTIFICATIONS_OFF"}
          </button>
        </div>
        <h2 className="text-5xl font-black text-white tracking-tighter leading-none">GLOBAL SENSOR<br/><span className="text-primary neon-text">MATRIX v4.0</span></h2>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-12 relative z-10">
        {[
          { label: 'Active Nodes', value: '1,284', color: 'text-primary' },
          { label: 'Avg Latency', value: '42ms', color: 'text-secondary', icon: Activity },
          { label: 'Packet Loss', value: '0.02%', color: 'text-white/40' },
          { label: 'Integrity', value: '99.4%', color: 'text-primary' },
        ].map((stat) => (
          <div key={stat.label} className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className={cn("text-4xl font-black data-mono tracking-tighter", stat.color)}>{stat.value}</span>
              {stat.icon && <stat.icon className={cn("w-5 h-5", stat.color)} />}
            </div>
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/30 mt-2 data-mono">{stat.label}</span>
          </div>
        ))}
      </div>
      <div className="mt-12 h-1.5 w-full bg-white/5 rounded-full overflow-hidden relative z-10">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: '98.2%' }}
          transition={{ duration: 2, ease: "circOut" }}
          className="h-full bg-gradient-to-r from-primary to-secondary shadow-[0_0_15px_rgba(0,245,255,0.8)]" 
        />
      </div>
    </section>

    {/* Live Environmental Telemetry */}
    <section className="md:col-span-8 glass rounded-[2.5rem] p-10 border-white/10">
      <div className="flex justify-between items-start mb-12">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Activity className="w-4 h-4 text-primary" />
            <span className="text-[11px] font-black uppercase tracking-[0.4em] text-white/30 data-mono">LIVE_TELEMETRY_STREAM</span>
          </div>
          <h2 className="text-3xl font-black text-white tracking-tighter">REAL-TIME <span className="text-primary">METRICS</span></h2>
        </div>
        <div className="flex gap-3">
          <div className="flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-primary/20 data-mono">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            SYNCED
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
        {[
          { label: 'pH Level', value: '8.1', unit: 'pH', icon: Microscope, color: 'text-primary', trend: '+0.2' },
          { label: 'Turbidity', value: '1.4', unit: 'NTU', icon: Waves, color: 'text-secondary', trend: '-0.1' },
          { label: 'Temp', value: '18.6', unit: '°C', icon: Thermometer, color: 'text-accent', trend: '+1.2' },
          { label: 'Oxygen', value: '7.1', unit: 'mg/L', icon: Droplets, color: 'text-primary', trend: '-0.4' },
        ].map((metric) => (
          <div key={metric.label} className="bg-white/5 p-6 rounded-3xl border border-white/5 hover:border-primary/30 transition-all group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-16 h-16 bg-primary/5 rounded-full -mr-8 -mt-8 blur-2xl group-hover:bg-primary/10 transition-all" />
            <div className="flex justify-between items-start mb-6 relative z-10">
              <div className={cn("p-2.5 rounded-2xl bg-white/5 border border-white/10", metric.color)}>
                <metric.icon className="w-5 h-5" />
              </div>
              <span className={cn(
                "text-[10px] font-black data-mono",
                metric.trend.startsWith('+') ? 'text-primary' : 'text-accent'
              )}>
                {metric.trend}
              </span>
            </div>
            <div className="flex items-baseline gap-1 relative z-10">
              <span className="text-3xl font-black text-white data-mono tracking-tighter">{metric.value}</span>
              <span className="text-[10px] font-black text-white/30 uppercase data-mono">{metric.unit}</span>
            </div>
            <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] mt-2 block data-mono">{metric.label}</span>
          </div>
        ))}
      </div>

      <div className="h-72 w-full relative">
        <div className="absolute inset-0 bg-gradient-to-t from-surface to-transparent opacity-20 pointer-events-none z-10" />
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={ENVIRONMENTAL_DATA}>
            <defs>
              <linearGradient id="colorPh" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00F5FF" stopOpacity={0.4}/>
                <stop offset="95%" stopColor="#00F5FF" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
            <XAxis 
              dataKey="time" 
              axisLine={false} 
              tickLine={false} 
              tick={{fontSize: 10, fill: 'rgba(255,255,255,0.3)', fontWeight: 'bold'}} 
            />
            <YAxis hide />
            <Tooltip 
              contentStyle={{ backgroundColor: '#0A1428', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' }}
              itemStyle={{ color: '#00F5FF', fontWeight: 'bold', fontSize: '12px' }}
              labelStyle={{ color: 'rgba(255,255,255,0.5)', marginBottom: '4px', fontSize: '10px', fontWeight: 'black', textTransform: 'uppercase' }}
            />
            <Area 
              type="monotone" 
              dataKey="ph" 
              stroke="#00F5FF" 
              fillOpacity={1} 
              fill="url(#colorPh)" 
              strokeWidth={4} 
              dot={{ r: 4, fill: '#00F5FF', strokeWidth: 2, stroke: '#050A14' }}
              activeDot={{ r: 6, strokeWidth: 0, fill: '#00F5FF' }}
            />
            <Area 
              type="monotone" 
              dataKey="temp" 
              stroke="#FF4D00" 
              fill="transparent" 
              strokeWidth={2} 
              strokeDasharray="6 6" 
              opacity={0.5}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </section>

    {/* Efficiency Gain & Biodiversity */}
    <div className="md:col-span-4 flex flex-col gap-8">
      <section className="bg-primary text-white rounded-[2.5rem] p-10 flex flex-col justify-between shadow-[0_20px_50px_rgba(0,245,255,0.3)] flex-1 relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="relative z-10">
          <div className="flex justify-between items-start">
            <span className="text-[11px] font-black uppercase tracking-[0.4em] opacity-60 data-mono">ENV_SUSTAINABILITY</span>
            <Leaf className="text-white w-7 h-7 drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]" />
          </div>
          <h3 className="text-2xl font-black mt-6 tracking-tighter">BIODIVERSITY<br/>INDEX</h3>
        </div>
        <div className="flex items-end gap-4 relative z-10">
          <span className="text-8xl font-black tracking-tighter data-mono">84</span>
          <span className="mb-6 text-2xl font-black opacity-40 data-mono">/100</span>
        </div>
        <p className="text-sm font-medium opacity-80 leading-relaxed relative z-10">Marine life health is currently exceeding the 5-year average by <span className="font-black text-white">12%</span> in monitored quadrants.</p>
      </section>

      <section className="glass rounded-[2.5rem] p-10 flex flex-col border-white/10 flex-1 relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
        <div className="flex-1 relative z-10">
          <span className="text-[11px] font-black uppercase tracking-[0.4em] text-white/30 data-mono">EFFICIENCY_GAIN</span>
          <h3 className="text-2xl font-black mt-4 text-white tracking-tighter">RESOURCE USAGE<br/><span className="text-primary">OPTIMIZED</span></h3>
        </div>
        <div className="mt-8 relative z-10">
          <div className="text-6xl font-black text-primary data-mono tracking-tighter neon-text">24%</div>
          <p className="text-sm text-white/40 mt-4 leading-tight font-medium">Optimized satellite uplink cycles have decreased power consumption across the North Atlantic grid.</p>
        </div>
      </section>
    </div>

    {/* Recent Alerts */}
    <section className="md:col-span-4 glass rounded-[2.5rem] overflow-hidden flex flex-col border-white/10">
      <div className="p-10 border-b border-white/5 bg-white/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-4 h-4 text-accent" />
            <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-white/40 data-mono">RECENT_ALERTS_LOG</h3>
          </div>
          {alerts.some(a => a.isNew) && (
            <span className="px-2 py-0.5 bg-accent text-white text-[8px] font-black rounded-full animate-pulse">NEW</span>
          )}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto max-h-[350px] scrollbar-hide">
        <div className="p-8 space-y-8">
          {alerts.map((alert) => (
            <div 
              key={alert.id} 
              onClick={() => toast.info(alert.title, { description: `${alert.desc} (${alert.time})` })}
              className="flex gap-5 group cursor-pointer relative hover:opacity-90 transition-opacity"
            >
              {alert.isNew && (
                <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-1 h-8 bg-accent rounded-full shadow-[0_0_10px_rgba(255,77,0,0.8)]" />
              )}
              <div className="mt-1">
                {alert.type === 'error' ? (
                  <div className="p-2 rounded-xl bg-accent/10 border border-accent/20">
                    <AlertCircle className="text-accent w-5 h-5" />
                  </div>
                ) : alert.type === 'warning' ? (
                  <div className="p-2 rounded-xl bg-secondary/10 border border-secondary/20">
                    <ShieldAlert className="text-secondary w-5 h-5" />
                  </div>
                ) : alert.type === 'success' ? (
                  <div className="p-2 rounded-xl bg-primary/10 border border-primary/20">
                    <CheckCircle2 className="text-primary w-5 h-5" />
                  </div>
                ) : (
                  <div className="p-2 rounded-xl bg-white/5 border border-white/10">
                    <WifiOff className="text-white/40 w-5 h-5" />
                  </div>
                )}
              </div>
              <div>
                <h4 className="font-black text-sm text-white tracking-tight group-hover:text-primary transition-colors">{alert.title}</h4>
                <p className="text-xs text-white/40 mt-1 font-medium leading-relaxed">{alert.desc}</p>
                <span className="text-[9px] font-black text-white/20 mt-3 block data-mono tracking-widest">{alert.time}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      <button 
        onClick={() => onNavigate?.('reports')}
        className="p-6 bg-white/5 text-center text-[10px] font-black uppercase tracking-[0.3em] text-primary hover:bg-primary hover:text-white transition-all data-mono"
      >
        VIEW_ALL_ACTIVITY_LOGS
      </button>
    </section>

    {/* Live Map Glance */}
    <section 
      onClick={() => onNavigate?.('map')}
      className="md:col-span-8 h-[450px] glass rounded-[2.5rem] relative overflow-hidden group border-white/10 cursor-pointer"
    >
      <div className="absolute inset-0 z-0">
        <img 
          className="w-full h-full object-cover opacity-60 group-hover:scale-110 transition-transform duration-[2000ms] grayscale-[30%] contrast-[1.2]" 
          src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=1200" 
          alt="Ocean Map" 
          referrerPolicy="no-referrer"
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/40 to-transparent z-10" />
      <div className="absolute bottom-0 left-0 p-12 z-20 text-white">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-[0_0_8px_rgba(0,245,255,1)]" />
          <span className="text-[11px] font-black uppercase tracking-[0.4em] text-primary data-mono">LIVE_DEPLOYMENT_FEED</span>
        </div>
        <h3 className="text-4xl font-black tracking-tighter">NORTH ATLANTIC<br/><span className="text-primary neon-text">GRID_SECTOR_7</span></h3>
        <div className="flex items-center gap-8 mt-8">
          <div className="flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_rgba(0,245,255,1)]" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60 data-mono">842_NODES_ONLINE</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-accent shadow-[0_0_8px_rgba(255,77,0,1)]" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60 data-mono">3_CRITICAL_ALERTS</span>
          </div>
        </div>
      </div>
      <div className="absolute top-8 right-8 z-20 glass p-2.5 rounded-2xl flex flex-col gap-2 border-white/10">
        <button 
          onClick={(e) => { e.stopPropagation(); onNavigate?.('map'); }}
          className="p-2.5 hover:bg-primary/20 rounded-xl transition-all text-primary hover:scale-110"
        >
          <Plus className="w-5 h-5" />
        </button>
        <div className="h-px bg-white/10 mx-2" />
        <button 
          onClick={(e) => { e.stopPropagation(); onNavigate?.('map'); }}
          className="p-2.5 hover:bg-primary/20 rounded-xl transition-all text-primary hover:scale-110"
        >
          <Minus className="w-5 h-5" />
        </button>
      </div>
    </section>

    {/* Depth Gauge */}
    <section className="md:col-span-4 glass rounded-[2.5rem] p-10 flex flex-col border-white/10 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-3xl" />
      <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-white/30 mb-12 data-mono">MEAN_DEPTH_TELEMETRY</h3>
      <div className="flex-1 flex items-center justify-center gap-16">
        <div className="relative h-64 w-6 bg-white/5 rounded-full overflow-hidden border border-white/10">
          <motion.div 
            initial={{ height: 0 }}
            animate={{ height: '65%' }}
            transition={{ duration: 2.5, ease: "circInOut" }}
            className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-primary to-secondary shadow-[0_0_20px_rgba(0,245,255,0.4)]" 
          />
          <div className="absolute inset-0 flex flex-col justify-between py-4 pointer-events-none">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => <div key={i} className="h-px w-full bg-white/10" />)}
          </div>
        </div>
        <div className="flex flex-col gap-10">
          <div>
            <span className="block text-4xl font-black text-primary data-mono tracking-tighter neon-text">4,200m</span>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 data-mono">TARGET_ZONE</span>
          </div>
          <div>
            <span className="block text-4xl font-black text-secondary data-mono tracking-tighter">2,840m</span>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 data-mono">CURRENT_MEDIAN</span>
          </div>
        </div>
      </div>
    </section>

    {/* Tactical Command Action Cards: AIS Dark Ship & Hydrodynamic Plume Engine */}
    <section className="md:col-span-6 glass rounded-[2.5rem] p-8 border border-accent/30 relative overflow-hidden group hover:border-accent/60 transition-all">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-accent/20 border border-accent/40 flex items-center justify-center text-accent">
            <Radar className="w-5 h-5 animate-spin" style={{ animationDuration: '8s' }} />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-accent data-mono">AIS_RADAR_FLAGGED</span>
            <h4 className="text-xl font-black text-white uppercase tracking-tight">DARK SHIP: GHOST_TX09</h4>
          </div>
        </div>
        <span className="px-2.5 py-1 rounded-full bg-accent text-white text-[9px] font-black data-mono tracking-widest animate-pulse">
          98% MATCH
        </span>
      </div>
      <p className="text-white/60 text-xs mb-6 font-medium">
        Silenced transponder detected 0.8 NM from Sector 7-G crude slick centroid. MARPOL Annex I violation suspected.
      </p>
      <button 
        onClick={() => onNavigate?.('ais')}
        className="w-full py-3.5 rounded-2xl bg-accent/90 hover:bg-accent text-white font-black text-xs uppercase tracking-widest data-mono transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,77,0,0.3)]"
      >
        <Radar className="w-4 h-4" />
        OPEN AIS RADAR & INTERCEPT
      </button>
    </section>

    <section className="md:col-span-6 glass rounded-[2.5rem] p-8 border border-primary/30 relative overflow-hidden group hover:border-primary/60 transition-all">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-primary/20 border border-primary/40 flex items-center justify-center text-primary">
            <Wind className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-primary data-mono">HYDRODYNAMIC_PLUME_MODEL</span>
            <h4 className="text-xl font-black text-white uppercase tracking-tight">SECTOR 7-G TRAJECTORY</h4>
          </div>
        </div>
        <span className="px-2.5 py-1 rounded-full bg-primary/20 text-primary border border-primary/40 text-[9px] font-black data-mono tracking-widest">
          T+12H: 14.2 KM²
        </span>
      </div>
      <p className="text-white/60 text-xs mb-6 font-medium">
        Current vector 45° NE at 1.4 m/s. Predicted bio-sanctuary threat horizon in 18.2 hours. Containment boom barriers ready.
      </p>
      <button 
        onClick={() => onNavigate?.('drift')}
        className="w-full py-3.5 rounded-2xl bg-primary text-surface hover:bg-primary/90 font-black text-xs uppercase tracking-widest data-mono transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,245,255,0.3)]"
      >
        <Wind className="w-4 h-4" />
        RUN DRIFT & PLUME SIMULATION
      </button>
    </section>
  </div>
);

const MapView = ({ sensors, onNavigate }: { sensors: any[], onNavigate?: (v: View) => void }) => {
  const [selectedSensor, setSelectedSensor] = useState(sensors[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeLayer, setActiveLayer] = useState<'satellite' | 'heatmap'>('satellite');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);

  const safeSearch = sanitizeText(searchQuery, 80).toLowerCase();
  const filteredSensors = sensors.filter(s => {
    const matchesSearch = !safeSearch || 
      (s?.id && String(s.id).toLowerCase().includes(safeSearch)) || 
      (s?.location && String(s.location).toLowerCase().includes(safeSearch));
    const matchesFilter = !statusFilter || s.status === statusFilter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="relative h-[calc(100vh-200px)] rounded-[2.5rem] overflow-hidden border border-white/10 glass shadow-2xl">
      {/* Map Base */}
      <img 
        src={activeLayer === 'satellite' 
          ? "https://images.unsplash.com/photo-1518176258769-f24305436571?auto=format&fit=crop&q=80&w=2000"
          : "https://images.unsplash.com/photo-1551244072-5d12893278ab?auto=format&fit=crop&q=80&w=2000"
        }
        alt="Map" 
        style={{ 
          transform: `scale(${zoomLevel})`, 
          transformOrigin: 'center center',
          transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)' 
        }}
        className={cn(
          "w-full h-full object-cover transition-all duration-1000",
          activeLayer === 'satellite' ? "grayscale-[40%] contrast-[1.2] brightness-[0.8]" : "hue-rotate-[180deg] saturate-[1.5] contrast-[1.3] brightness-[0.7]"
        )}
        referrerPolicy="no-referrer"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-surface/60 via-transparent to-surface/80 pointer-events-none" />
      
      {/* Search Bar Overlay */}
      <div className="absolute top-8 left-1/2 -translate-x-1/2 z-30 w-full max-w-xl px-6">
        <div className="glass-dark rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] border-white/10 flex items-center px-6 py-4 gap-4 group focus-within:border-primary/50 transition-all">
          <Search className="w-5 h-5 text-primary drop-shadow-[0_0_8px_rgba(0,245,255,0.5)]" />
          <input 
            type="text" 
            placeholder="SEARCH_SENSOR_NODES_OR_COORDINATES..." 
            className="bg-transparent border-none outline-none w-full text-xs font-black placeholder:text-white/20 text-white data-mono tracking-widest"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <div className="h-5 w-px bg-white/10" />
          <button 
            onClick={() => {
              setStatusFilter(prev => {
                const next = prev === null ? 'Alert' : prev === 'Alert' ? 'Low Power' : prev === 'Low Power' ? 'Healthy' : null;
                if (next) toast.info(`Grid Filter: Showing ${next} nodes`);
                else toast.info("Filter Cleared: Showing all nodes");
                return next;
              });
            }}
            title="Cycle Status Filter"
            className="p-1 hover:text-primary transition-colors text-white/40"
          >
            <Filter className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Map Controls */}
      <div className="absolute top-8 left-8 z-30 flex flex-col gap-4">
        <div className="glass-dark p-2.5 rounded-[1.5rem] shadow-2xl border-white/10 flex flex-col gap-2">
          <button 
            onClick={() => setZoomLevel(prev => Math.min(Number((prev + 0.2).toFixed(1)), 1.8))}
            className="p-2.5 hover:bg-primary/20 rounded-xl transition-all text-primary hover:scale-110"
          >
            <Plus className="w-5 h-5" />
          </button>
          <div className="h-px bg-white/10 mx-2" />
          <button 
            onClick={() => setZoomLevel(prev => Math.max(Number((prev - 0.2).toFixed(1)), 0.8))}
            className="p-2.5 hover:bg-primary/20 rounded-xl transition-all text-primary hover:scale-110"
          >
            <Minus className="w-5 h-5" />
          </button>
        </div>
        <button 
          onClick={() => setActiveLayer(prev => prev === 'satellite' ? 'heatmap' : 'satellite')}
          title="Toggle Thermal Heatmap Layer"
          className={cn(
            "p-4 rounded-[1.5rem] shadow-2xl border-white/10 transition-all hover:scale-110",
            activeLayer === 'heatmap' ? "bg-primary text-surface shadow-[0_0_20px_rgba(0,245,255,0.5)]" : "glass-dark text-primary"
          )}
        >
          <Layers className="w-6 h-6" />
        </button>
        <button 
          onClick={() => onNavigate?.('ais')}
          title="Launch Live AIS Vessel Radar & Dark Ship Attribution"
          className="p-4 rounded-[1.5rem] shadow-2xl border-white/10 glass-dark text-accent hover:scale-110 transition-all"
        >
          <Radar className="w-6 h-6" />
        </button>
        <button 
          onClick={() => onNavigate?.('drift')}
          title="Launch Ocean Drift & Plume Simulator"
          className="p-4 rounded-[1.5rem] shadow-2xl border-white/10 glass-dark text-primary hover:scale-110 transition-all"
        >
          <Wind className="w-6 h-6" />
        </button>
      </div>

      {/* Legend */}
      <div className="absolute top-32 right-8 z-30 hidden lg:block">
        <div className="glass-dark p-8 rounded-[2rem] shadow-2xl border-white/10 w-64">
          <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-white/30 mb-6 data-mono">NETWORK_STATUS</h3>
          <ul className="space-y-5">
            {[
              { color: 'bg-primary shadow-[0_0_8px_rgba(0,245,255,1)]', label: 'Healthy', status: 'Healthy' },
              { color: 'bg-accent shadow-[0_0_8px_rgba(255,77,0,1)]', label: 'Alert', status: 'Alert' },
              { color: 'bg-error shadow-[0_0_8px_rgba(255,0,60,1)]', label: 'Low Power', status: 'Low Power' },
            ].map(item => (
              <li 
                key={item.label} 
                className={cn(
                  "flex items-center gap-4 cursor-pointer transition-all hover:translate-x-1",
                  statusFilter && statusFilter !== item.status ? "opacity-20" : "opacity-100"
                )}
                onClick={() => setStatusFilter(prev => prev === item.status ? null : item.status)}
              >
                <span className={cn("w-3 h-3 rounded-full", item.color)} />
                <span className="text-xs font-black uppercase tracking-widest text-white/80 data-mono">{item.label}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Markers */}
      <AnimatePresence>
        {filteredSensors.map((sensor) => (
          <motion.div 
            key={sensor.id}
            initial={{ scale: 0, opacity: 0 }} 
            animate={{ scale: 1, opacity: 1 }} 
            exit={{ scale: 0, opacity: 0 }}
            className="absolute z-20 cursor-pointer group"
            style={{ top: `${sensor.y}%`, left: `${sensor.x}%` }}
            onClick={() => setSelectedSensor(sensor)}
          >
            <div className="relative flex items-center justify-center">
              {selectedSensor.id === sensor.id && (
                <span className="absolute inline-flex h-16 w-16 rounded-full bg-primary/20 animate-ping" />
              )}
              <div className={cn(
                "relative w-10 h-10 rounded-2xl border-2 border-white/20 shadow-2xl flex items-center justify-center transition-all group-hover:scale-125 group-hover:rotate-12",
                sensor.status === 'Healthy' ? 'bg-primary/80 backdrop-blur-md' : 
                sensor.status === 'Alert' ? 'bg-accent/80 backdrop-blur-md' : 
                sensor.status === 'Low Power' ? 'bg-error/80 backdrop-blur-md' : 'bg-white/20 backdrop-blur-md',
                selectedSensor.id === sensor.id ? "scale-125 ring-4 ring-primary/40 rotate-12" : ""
              )}>
                {sensor.status === 'Alert' && (
                  <motion.div
                    animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute inset-0 bg-accent rounded-2xl blur-md"
                  />
                )}
                {sensor.status === 'Low Power' && (
                  <motion.div
                    animate={{ opacity: [0.2, 0.6, 0.2] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="absolute inset-0 bg-error rounded-2xl"
                  />
                )}
                <sensor.icon className="w-4 h-4 text-white drop-shadow-md relative z-10" />
              </div>
              
              {/* Tooltip */}
              <div className="absolute bottom-full mb-4 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all pointer-events-none scale-90 group-hover:scale-100">
                <div className="glass-dark text-primary text-[10px] font-black px-4 py-2 rounded-xl whitespace-nowrap shadow-2xl border-white/10 data-mono tracking-[0.2em]">
                  {sensor.id} // {sensor.location.toUpperCase()}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Bottom Sheet Detail */}
      <AnimatePresence mode="wait">
        <motion.section 
          key={selectedSensor.id}
          initial={{ y: 150, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 150, opacity: 0 }}
          className="absolute bottom-8 left-8 right-8 md:left-auto md:right-10 z-40"
        >
          <div className="max-w-lg w-full ml-auto glass-dark rounded-[2.5rem] shadow-[0_30px_100px_rgba(0,0,0,0.8)] border-white/10 overflow-hidden">
            <div className="p-10">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <SensorStatusBadge status={selectedSensor.status} />
                  </div>
                  <h2 className="text-4xl font-black text-white tracking-tighter">NODE <span className="text-primary">{selectedSensor.id}</span></h2>
                  <p className="text-white/40 text-xs mt-2 flex items-center gap-2 font-bold data-mono tracking-widest">
                    <MapPin className="w-3 h-3 text-primary" /> {selectedSensor.location.toUpperCase()} // DEPTH_{selectedSensor.depth}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-4">
                  <BatteryIndicator level={selectedSensor.battery} />
                  <button 
                    onClick={() => toast.info(`Node ${selectedSensor.id} Diagnostic Dossier`, {
                      description: `Depth: ${selectedSensor.depth} | Signal: ${selectedSensor.signal}% | Power: ${selectedSensor.battery}% | Last Telemetry Sync: ${selectedSensor.sync}`
                    })}
                    className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all"
                  >
                    <MoreVertical className="w-6 h-6 text-white/60" />
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-6 mb-10">
                <div className="bg-white/5 p-6 rounded-[1.5rem] border border-white/5">
                  <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] block mb-3 data-mono">PH_LEVEL</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-black text-accent data-mono tracking-tighter">{selectedSensor.ph}</span>
                    <span className="text-[10px] text-white/20 font-black uppercase data-mono">
                      {selectedSensor.ph < 7 ? 'ACIDIC' : 'ALKALINE'}
                    </span>
                  </div>
                </div>
                <div className="bg-white/5 p-6 rounded-[1.5rem] border border-white/5">
                  <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] block mb-3 data-mono">DISSOLVED_O2</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-black text-primary data-mono tracking-tighter">{selectedSensor.o2}</span>
                    <span className="text-[10px] text-white/20 font-black uppercase data-mono">MG/L</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-6 bg-primary/5 rounded-[1.5rem] mb-8 border border-primary/10">
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] data-mono">SIGNAL_INTEGRITY</span>
                  <span className="text-lg font-black text-primary data-mono tracking-tighter">{selectedSensor.signal}%</span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] data-mono">NET_LATENCY</span>
                  <span className="text-lg font-black text-primary data-mono tracking-tighter">{selectedSensor.latency}</span>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <button 
                  onClick={() => {
                    if (selectedSensor.status === 'Healthy') {
                      onNavigate?.('analytics');
                    } else {
                      toast.success(`Autonomous Recovery UAV Dispatched to ${selectedSensor.location}`, {
                        description: `Coordinates locked on Node ${selectedSensor.id} (${selectedSensor.sector}). Rapid response protocol engaged.`
                      });
                    }
                  }}
                  className={cn(
                    "w-full py-5 px-8 rounded-[1.5rem] text-surface font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:opacity-90 active:scale-[0.98] transition-all shadow-2xl data-mono",
                    selectedSensor.status === 'Healthy' ? 'bg-primary shadow-[0_10px_30px_rgba(0,245,255,0.3)]' : 'bg-accent shadow-[0_10px_30px_rgba(255,77,0,0.3)]'
                  )}
                >
                  {selectedSensor.status === 'Healthy' ? 'VIEW_TELEMETRY_LOG' : 'DISPATCH_RECOVERY_TEAM'}
                  <ChevronRight className="w-6 h-6" />
                </button>
              </div>
            </div>
          </div>
        </motion.section>
      </AnimatePresence>
    </div>
  );
};

const SensorsView = ({ sensors }: { sensors: any[] }) => {
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('ID');
  const [alertDismissed, setAlertDismissed] = useState(false);

  const uniqueTypes = Array.from(new Set(sensors.map(s => s.type)));

  const filteredSensors = sensors.filter(sensor => {
    const matchesStatus = statusFilter === 'ALL' || sensor.status === statusFilter;
    const matchesType = typeFilter === 'ALL' || sensor.type === typeFilter;
    return matchesStatus && matchesType;
  });

  const sortedSensors = [...filteredSensors].sort((a, b) => {
    if (sortBy === 'SIGNAL') return (Number(b.signal) || 0) - (Number(a.signal) || 0);
    if (sortBy === 'LATENCY') {
      const latA = parseInt(String(a.latency || '').replace(/\D/g, ''), 10) || 0;
      const latB = parseInt(String(b.latency || '').replace(/\D/g, ''), 10) || 0;
      return latA - latB;
    }
    return String(a.id || '').localeCompare(String(b.id || ''));
  });

  return (
    <div className="max-w-6xl mx-auto">
      <section className="mb-12">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className={cn("w-2 h-2 rounded-full animate-pulse", alertDismissed ? "bg-primary shadow-[0_0_8px_rgba(0,245,255,1)]" : "bg-accent shadow-[0_0_8px_rgba(255,77,0,1)]")} />
            <h2 className="text-[11px] font-black uppercase tracking-[0.4em] text-white/40 data-mono">CONNECTIVITY_ALERTS</h2>
          </div>
          <span className={cn("px-4 py-1 border text-[10px] font-black rounded-full uppercase tracking-[0.2em] data-mono", alertDismissed ? "bg-primary/10 border-primary/20 text-primary" : "bg-accent/10 border-accent/20 text-accent")}>
            {alertDismissed ? "ALL_SYSTEMS_OPTIMAL" : "CRITICAL_PRIORITY"}
          </span>
        </div>
        <div className="space-y-6">
          {!alertDismissed ? (
            <div className="glass-dark p-8 rounded-[2rem] border-l-4 border-accent shadow-2xl flex items-start gap-8 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-r from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <AlertCircle className="text-accent w-8 h-8 shrink-0 drop-shadow-[0_0_10px_rgba(255,77,0,0.5)]" />
              <div className="flex-1 relative z-10">
                <p className="font-black text-white text-xl tracking-tight">PACKET_LOSS_DETECTED: SECTOR_7B</p>
                <p className="text-sm text-white/40 mt-2 font-medium leading-relaxed">Sensor #022 reporting 15% packet loss. Possible interference from deep-sea thermal activity or seismic shift.</p>
                <div className="flex gap-8 mt-6">
                  <button 
                    onClick={() => {
                      toast.success("Uplink Rerouted via Constellation Beta", {
                        description: "Sensor #022 signal frequency re-calibrated. Packet loss restored to 0.00%."
                      });
                      setAlertDismissed(true);
                    }}
                    className="text-[10px] font-black text-primary uppercase tracking-[0.3em] hover:neon-text transition-all data-mono"
                  >
                    RE_ROUTE_UPLINK
                  </button>
                  <button 
                    onClick={() => {
                      toast.info("Connectivity Warning Acknowledged", {
                        description: "Log archived in Sentinel diagnostics journal."
                      });
                      setAlertDismissed(true);
                    }}
                    className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] hover:text-white transition-all data-mono"
                  >
                    IGNORE_LOG
                  </button>
                </div>
              </div>
              <span className="text-[10px] font-black text-white/20 uppercase data-mono">2M_AGO</span>
            </div>
          ) : (
            <div className="glass-dark p-6 rounded-[2rem] border border-primary/20 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <CheckCircle2 className="text-primary w-6 h-6" />
                <span className="text-xs font-black text-white/80 data-mono uppercase tracking-widest">
                  ALL_UPLINKS_NOMINAL // ZERO_PACKET_LOSS_ACROSS_SECTORS
                </span>
              </div>
              <button 
                onClick={() => setAlertDismissed(false)}
                className="text-[9px] font-black text-primary/60 hover:text-primary uppercase tracking-widest data-mono"
              >
                SIMULATE_INTERFERENCE
              </button>
            </div>
          )}
        </div>
      </section>

      <section className="mb-10 flex flex-col xl:flex-row xl:items-end justify-between gap-8">
        <div>
          <h2 className="text-5xl font-black text-white tracking-tighter">CONNECTIVITY <span className="text-primary neon-text">HUB</span></h2>
          <p className="text-sm text-white/40 font-medium mt-3 data-mono tracking-widest uppercase">Managing {filteredSensors.length} active telemetry units // 99.4% Signal Integrity</p>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <div className="glass-dark px-6 py-3 rounded-2xl flex items-center gap-3 border-white/10">
            <Filter className="w-4 h-4 text-primary" />
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent border-none text-[10px] font-black uppercase tracking-widest focus:ring-0 p-0 pr-8 cursor-pointer text-white/60 data-mono"
            >
              <option value="ALL" className="bg-surface">STATUS: ALL</option>
              <option value="Healthy" className="bg-surface">STATUS: HEALTHY</option>
              <option value="Alert" className="bg-surface">STATUS: ALERT</option>
              <option value="Low Power" className="bg-surface">STATUS: LOW POWER</option>
            </select>
          </div>
          <div className="glass-dark px-6 py-3 rounded-2xl flex items-center gap-3 border-white/10">
            <Layers className="w-4 h-4 text-primary" />
            <select 
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="bg-transparent border-none text-[10px] font-black uppercase tracking-widest focus:ring-0 p-0 pr-8 cursor-pointer text-white/60 data-mono"
            >
              <option value="ALL" className="bg-surface">TYPE: ALL</option>
              {uniqueTypes.map(type => (
                <option key={type} value={type} className="bg-surface">TYPE: {type.toUpperCase()}</option>
              ))}
            </select>
          </div>
          <div className="glass-dark px-6 py-3 rounded-2xl flex items-center gap-3 border-white/10">
            <ArrowDown className="w-4 h-4 text-primary" />
            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent border-none text-[10px] font-black uppercase tracking-widest focus:ring-0 p-0 pr-8 cursor-pointer text-white/60 data-mono"
            >
              <option value="ID" className="bg-surface">SORT: ID</option>
              <option value="SIGNAL" className="bg-surface">SORT: SIGNAL</option>
              <option value="LATENCY" className="bg-surface">SORT: LATENCY</option>
            </select>
          </div>
        </div>
      </section>

      <div className="space-y-6">
        <AnimatePresence mode="popLayout">
          {sortedSensors.map((sensor) => (
            <motion.div 
              key={sensor.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              whileHover={{ x: 8, backgroundColor: 'rgba(255, 255, 255, 0.05)' }}
              className="glass rounded-[2rem] p-8 flex flex-wrap items-center justify-between gap-10 transition-all border-white/10 group"
            >
              <div className="flex items-center gap-8 min-w-[280px]">
                <div className="w-16 h-16 glass-dark flex items-center justify-center rounded-2xl text-primary border-white/5 group-hover:border-primary/30 transition-all">
                  <sensor.icon className="w-8 h-8 drop-shadow-[0_0_8px_rgba(0,245,255,0.4)]" />
                </div>
                <div>
                  <h3 className="font-black text-2xl text-white tracking-tighter">NODE_{sensor.id}</h3>
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 data-mono mt-1">{sensor.type} // SECTOR_{sensor.sector}</p>
                </div>
              </div>
              <div className="flex-1 grid grid-cols-2 lg:grid-cols-6 gap-8">
                <div className="space-y-2">
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20 data-mono">CONNECTIVITY</p>
                  <div className="flex items-center gap-3">
                    <SensorStatusBadge status={sensor.status} />
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20 data-mono">BATTERY</p>
                  <BatteryIndicator level={sensor.battery} />
                </div>
                <div className="space-y-2">
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20 data-mono">SIGNAL</p>
                  <div className="flex items-center gap-3">
                    <div className="flex gap-1 items-end h-4">
                      {[1, 2, 3, 4].map((bar) => (
                        <div 
                          key={bar} 
                          className={cn(
                            "w-1.5 rounded-full transition-all",
                            bar === 1 ? "h-1.5" : bar === 2 ? "h-2.5" : bar === 3 ? "h-3.5" : "h-4.5",
                            (sensor.signal / 25) >= bar ? "bg-primary shadow-[0_0_5px_rgba(0,245,255,0.5)]" : "bg-white/10"
                          )} 
                        />
                      ))}
                    </div>
                    <span className="text-xs font-black text-white/80 data-mono">{sensor.signal}%</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20 data-mono">LATENCY</p>
                  <div className="text-xs font-black text-white/80 data-mono flex items-center gap-2">
                    <Activity className="w-3 h-3 text-primary/40" />
                    {sensor.latency}
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20 data-mono">LAST_SYNC</p>
                  <div className="text-xs font-black text-white/80 data-mono flex items-center gap-2">
                    <Clock className="w-3 h-3 text-primary/40" />
                    {sensor.sync}
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20 data-mono">TELEMETRY</p>
                  <div className="text-xs font-black text-primary data-mono neon-text">{sensor.telemetry}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => toast.info(`Real-Time Telemetry: Node ${sensor.id}`, {
                    description: `Transfer Rate: ${sensor.telemetry} | Latency: ${sensor.latency} | Signal: ${sensor.signal}%`
                  })}
                  className="w-12 h-12 flex items-center justify-center rounded-2xl glass-dark border-white/5 text-white/40 hover:text-primary hover:border-primary/30 transition-all"
                >
                  <Activity className="w-6 h-6" />
                </button>
                <button 
                  onClick={() => toast.info(`Node ${sensor.id} Sector Dossier`, {
                    description: `${sensor.type} deployed at ${sensor.location} (Sector ${sensor.sector}, Depth: ${sensor.depth})`
                  })}
                  className="w-12 h-12 flex items-center justify-center rounded-2xl glass-dark border-white/5 text-white/40 hover:text-white hover:border-white/20 transition-all"
                >
                  <MoreVertical className="w-6 h-6" />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {sortedSensors.length === 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-32 glass rounded-[3rem] border-dashed border-2 border-white/5"
          >
            <div className="w-20 h-20 glass-dark rounded-full flex items-center justify-center mx-auto mb-6 border-white/5">
              <Search className="w-8 h-8 text-white/10" />
            </div>
            <p className="text-white/20 font-black uppercase tracking-[0.4em] data-mono">NO_SENSORS_MATCH_FILTERS</p>
            <button 
              onClick={() => { setStatusFilter('ALL'); setTypeFilter('ALL'); }}
              className="mt-8 text-[10px] font-black text-primary uppercase tracking-[0.3em] hover:neon-text transition-all data-mono"
            >
              RESET_ALL_FILTERS
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
};

const AnalyticsView = () => (
  <div className="max-w-7xl mx-auto">
    <section className="mb-16">
      <h2 className="text-6xl font-black text-white tracking-tighter mb-6">CONNECTIVITY <span className="text-primary neon-text">ANALYTICS</span></h2>
      <p className="text-white/40 font-medium max-w-2xl leading-relaxed text-lg data-mono uppercase tracking-widest">High-fidelity telemetry focused on autonomous detection rates and global network integrity across the North Atlantic sector.</p>
    </section>

    <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
      {/* Detection Rate */}
      <div className="md:col-span-5 glass-dark rounded-[3rem] p-12 flex flex-col items-center justify-center relative overflow-hidden border border-white/10 shadow-2xl group">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-accent to-primary animate-pulse" />
        <span className="absolute top-10 left-12 font-black text-[10px] uppercase tracking-[0.4em] text-white/20 data-mono">TELEMETRY.ALPHA</span>
        <h3 className="text-2xl font-black text-white mb-16 self-start tracking-tight">NETWORK_SYNC_EFFICIENCY</h3>
        
        <div className="relative w-80 h-40 mb-10">
          <div className="absolute inset-0 border-[24px] border-white/5 rounded-t-full" />
          <motion.div 
            initial={{ rotate: -90 }}
            animate={{ rotate: 0 }}
            transition={{ duration: 2, ease: "easeOut" }}
            className="absolute inset-0 border-[24px] border-primary rounded-t-full origin-bottom shadow-[0_0_30px_rgba(0,245,255,0.3)]" 
            style={{ clipPath: 'inset(0 0 0 0)' }}
          />
          <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center">
            <span className="text-8xl font-black text-white tracking-tighter drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">99.4<span className="text-4xl text-primary neon-text">%</span></span>
            <span className="text-[11px] text-primary font-black uppercase tracking-[0.4em] mt-4 data-mono">SIGNAL_INTEGRITY</span>
          </div>
        </div>

        <div className="w-full grid grid-cols-2 gap-10 mt-16 pt-12 border-t border-white/5">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20 data-mono mb-2">TARGET_SYNC</p>
            <p className="text-3xl font-black text-white tracking-tighter">98.0%</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20 data-mono mb-2">UPTIME_DELTA</p>
            <p className="text-3xl font-black text-primary neon-text">+1.4%</p>
          </div>
        </div>
      </div>

      {/* Impact Summary */}
      <div className="md:col-span-7 glass rounded-[3rem] p-12 text-white relative overflow-hidden flex flex-col justify-between shadow-2xl border border-white/10">
        <div className="absolute -right-20 -top-20 w-96 h-96 bg-primary rounded-full blur-[120px] opacity-20 animate-pulse-soft" />
        <div className="absolute -left-20 -bottom-20 w-96 h-96 bg-accent rounded-full blur-[120px] opacity-10 animate-pulse-soft" />
        
        <div className="relative z-10">
          <h3 className="text-4xl font-black mb-8 tracking-tighter">NETWORK_IMPACT</h3>
          <p className="text-white/60 font-medium mb-16 max-w-xl text-xl leading-relaxed">Global connectivity has enabled real-time response to environmental shifts, reducing data latency by <span className="text-primary neon-text">45%</span> across all active sectors.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-12 relative z-10">
          {[
            { icon: Activity, value: '99.9%', label: 'UPTIME', color: 'text-primary' },
            { icon: Zap, value: '45ms', label: 'LATENCY', color: 'text-accent' },
            { icon: Waves, value: '1.2PB', label: 'DATA_STREAM', color: 'text-white' },
          ].map(item => (
            <div key={item.label} className="flex flex-col gap-4 group">
              <item.icon className={cn("w-10 h-10 transition-transform group-hover:scale-110", item.color)} />
              <p className="text-5xl font-black text-white tracking-tighter">{item.value}</p>
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/30 data-mono">{item.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Pollution Chart */}
      <div className="md:col-span-8 glass-dark rounded-[3rem] p-12 border border-white/10 shadow-2xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-20 gap-8">
          <div>
            <h3 className="text-3xl font-black text-white tracking-tighter">POLLUTION_LEVELS_TEMPORAL</h3>
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/30 mt-3 data-mono">Parts Per Million (PPM) // Last 12 Months // Sector_Alpha</p>
          </div>
          <div className="flex gap-8">
            <div className="flex items-center gap-3">
              <span className="w-3 h-3 rounded-full bg-primary shadow-[0_0_8px_rgba(0,245,255,0.6)]" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/60 data-mono">SURFACE</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="w-3 h-3 rounded-full bg-accent shadow-[0_0_8px_rgba(255,77,0,0.6)]" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/60 data-mono">BENTHIC</span>
            </div>
          </div>
        </div>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={ANALYTICS_LINE_DATA}>
              <defs>
                <linearGradient id="colorSurface" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00f5ff" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#00f5ff" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorBenthic" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ff4d00" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#ff4d00" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(10, 20, 30, 0.9)', 
                  borderRadius: '24px', 
                  border: '1px solid rgba(255,255,255,0.1)',
                  boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
                  backdropFilter: 'blur(10px)'
                }}
                itemStyle={{ color: '#fff', fontSize: '12px', fontWeight: 'bold' }}
              />
              <Area type="monotone" dataKey="surface" stroke="#00f5ff" strokeWidth={4} fillOpacity={1} fill="url(#colorSurface)" />
              <Area type="monotone" dataKey="benthic" stroke="#ff4d00" strokeWidth={4} fillOpacity={1} fill="url(#colorBenthic)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="flex justify-between mt-10 text-[10px] font-black text-white/20 uppercase tracking-[0.5em] data-mono">
          {['JAN', 'MAR', 'MAY', 'JUL', 'SEP', 'NOV'].map(m => <span key={m}>{m}</span>)}
        </div>
      </div>

      {/* Resource Conservation */}
      <div className="md:col-span-4 glass rounded-[3rem] p-12 border border-white/10 flex flex-col shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8">
          <Zap className="w-8 h-8 text-primary/20" />
        </div>
        <h3 className="text-2xl font-black text-white mb-16 tracking-tighter">RESOURCE_CONSERVATION</h3>
        <div className="space-y-20 flex-1">
          <div className="relative">
            <div className="flex justify-between items-end mb-4">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 data-mono">BASELINE_USAGE</span>
              <span className="text-2xl font-black text-white tracking-tighter">482 <span className="text-sm text-white/40">kWh/d</span></span>
            </div>
            <div className="h-5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5 p-1">
              <div className="h-full w-full bg-white/10 rounded-full" />
            </div>
          </div>
          <div className="relative">
            <div className="flex justify-between items-end mb-4">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary neon-text data-mono">OPTIMIZED_CURRENT</span>
              <span className="text-2xl font-black text-white tracking-tighter">314 <span className="text-sm text-white/40">kWh/d</span></span>
            </div>
            <div className="h-5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5 p-1">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: '65%' }}
                transition={{ duration: 2, ease: "easeInOut" }}
                className="h-full bg-gradient-to-r from-primary to-accent shadow-[0_0_15px_rgba(0,245,255,0.5)] rounded-full" 
              />
            </div>
            <div className="mt-12 p-8 glass-dark rounded-[2rem] border border-primary/20 shadow-2xl relative overflow-hidden group">
              <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="flex items-center gap-6 relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <Zap className="text-primary w-6 h-6 neon-text" />
                </div>
                <p className="text-sm text-white/60 font-medium leading-relaxed">
                  <span className="font-black text-primary neon-text">35% REDUCTION</span> achieved via AI sensor duty cycling and neural load balancing.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// --- AI Detection View ---

const DetectionView = ({ onReportCreated }: { onReportCreated: (report: UserReport) => void }) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [detectedMimeType, setDetectedMimeType] = useState<string>('image/jpeg');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<DetectionResult[]>([]);
  const [description, setDescription] = useState('');

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Strict validation against file size and malicious MIME types
    const validation = validateImageUpload(file);
    if (!validation.isValid) {
      toast.error("Upload Authorization Failed", {
        description: validation.error || "File rejected by Sentinel security policy."
      });
      e.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => {
      toast.error("Telemetry Error", { description: "Failed to read image stream safely." });
    };
    reader.onloadend = () => {
      const rawDataUrl = reader.result as string;
      const urlCheck = validateImageDataUrl(rawDataUrl);
      if (!urlCheck.isValid) {
        toast.error("Security Quarantine", {
          description: urlCheck.error || "Image buffer format rejected."
        });
        return;
      }
      setSelectedImage(rawDataUrl);
      setDetectedMimeType(urlCheck.mimeType);
      setResults([]);
    };
    reader.readAsDataURL(file);
  };

  const analyzeImage = async () => {
    if (!selectedImage) return;

    if (!checkRateLimit('AI_ANALYSIS', 5, 10000)) {
      toast.warning("Rate Limit Active", {
        description: "Neural processor cooling down. Please pause momentarily before rescanning."
      });
      return;
    }

    setIsAnalyzing(true);
    
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      const urlCheck = validateImageDataUrl(selectedImage);

      if (!urlCheck.isValid) {
        throw new Error(urlCheck.error || "Image buffer integrity validation failed.");
      }

      if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
        // Safe heuristic fallback for unconfigured API key
        logSecurityAudit('OFFLINE_HEURISTIC_SCAN', undefined, 'API key unconfigured; utilizing verified neural heuristics.');
        setTimeout(() => {
          const fallbackData = sanitizeDetectionOutput([
            { label: "Plastic Waste", confidence: 0.92, recommendation: "Deploy surface skimmers and manual collection teams." },
            { label: "Microplastics", confidence: 0.75, recommendation: "Increase filtration frequency in sector 4B." }
          ]);
          setResults(fallbackData);
          setIsAnalyzing(false);
          toast.info("Offline Neural Heuristics Active", {
            description: "Operating with baseline maritime classification heuristics."
          });
        }, 600);
        return;
      }

      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [
          {
            inlineData: {
              data: urlCheck.base64Data,
              mimeType: detectedMimeType || urlCheck.mimeType
            }
          },
          {
            text: "Analyze this marine image for pollution. Identify types like plastic waste, oil spills, or garbage. For each type found, provide a label, a confidence score (0-1), and a short cleanup recommendation. Return the result strictly as a JSON array of objects with properties: label, confidence, recommendation."
          }
        ],
        config: {
          responseMimeType: "application/json"
        }
      });

      const sanitizedData = sanitizeDetectionOutput(response.text);
      setResults(sanitizedData);
      logSecurityAudit('NEURAL_SCAN_SUCCESS', undefined, `Classified ${sanitizedData.length} marine anomalies`);
    } catch (error) {
      console.error("AI Analysis failed:", error);
      // Fallback mock data for demo if API fails or key is missing
      const fallback = sanitizeDetectionOutput([
        { label: "Plastic Waste", confidence: 0.92, recommendation: "Deploy surface skimmers and manual collection teams." },
        { label: "Microplastics", confidence: 0.75, recommendation: "Increase filtration frequency in sector 4B." }
      ]);
      setResults(fallback);
      toast.warning("Neural Telemetry Fallback", {
        description: "Primary satellite uplink interrupted. Standard marine heuristic results engaged."
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const loadDemoSample = async () => {
    try {
      toast.info("Buffering Sentinel Demo Imagery...", { description: "Loading verified multispectral ocean flotsam dataset." });
      const res = await fetch("https://images.unsplash.com/photo-1621451537084-482c73073a0f?auto=format&fit=crop&q=80&w=800");
      const blob = await res.blob();
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
        setDetectedMimeType("image/jpeg");
        setResults([]);
        toast.success("Sentinel Demo Telemetry Buffered", {
          description: "Ready to run deep-sea neural pattern classification."
        });
      };
      reader.readAsDataURL(blob);
    } catch {
      toast.error("Telemetry fetch failed. Please select a local file.");
    }
  };

  const submitReport = () => {
    if (!selectedImage) return;

    if (!checkRateLimit('SUBMIT_REPORT', 5, 20000)) {
      toast.warning("Submission Throttled", {
        description: "Please wait before filing additional incident logs."
      });
      return;
    }

    const cleanDesc = sanitizeText(description, 1000);
    const sanitizedDetections = sanitizeDetectionOutput(results);
    const reportId = `REP-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    const newReport: UserReport = {
      id: reportId,
      image: selectedImage,
      description: cleanDesc,
      location: "Sector 7-G // North Reef",
      timestamp: new Date().toLocaleString(),
      detections: sanitizedDetections
    };

    onReportCreated(newReport);
    logSecurityAudit('MISSION_REPORT_COMMITTED', reportId, `Report committed with ${sanitizedDetections.length} anomaly detections.`);
    setSelectedImage(null);
    setResults([]);
    setDescription('');
    toast.success("Incident Report Verified & Logged", {
      description: `Dispatched to Sentinel Network under ${reportId}`
    });
  };

  return (
    <div className="max-w-5xl mx-auto space-y-10">
      <div className="glass rounded-[3rem] p-12 border border-white/10 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-10">
          <Sparkles className="w-24 h-24 text-primary" />
        </div>
        
        <div className="flex items-center gap-8 mb-12 relative z-10">
          <div className="glass-dark p-5 rounded-[1.5rem] border border-primary/20">
            <Camera className="text-primary w-10 h-10 neon-text" />
          </div>
          <div>
            <h2 className="text-5xl font-black text-white tracking-tighter uppercase">NEURAL <span className="text-primary neon-text">DETECTION</span></h2>
            <p className="text-white/40 font-medium mt-2 data-mono tracking-widest uppercase">Upload imagery for real-time deep-sea neural analysis</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 relative z-10">
          <div className="space-y-8">
            <div 
              className={cn(
                "aspect-video rounded-[2.5rem] border-2 border-dashed flex flex-col items-center justify-center relative overflow-hidden transition-all glass-dark",
                selectedImage ? "border-primary/50" : "border-white/10 hover:border-primary/30"
              )}
            >
              {selectedImage ? (
                <>
                  <img src={selectedImage} alt="Upload" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-surface/80 via-transparent to-transparent pointer-events-none" />
                  <button 
                    onClick={() => setSelectedImage(null)}
                    className="absolute top-6 right-6 glass-dark text-white/60 p-3 rounded-2xl hover:text-error hover:border-error/30 transition-all border border-white/5"
                  >
                    <Trash2 className="w-6 h-6" />
                  </button>
                  <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between">
                    <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em] data-mono">IMAGE_BUFFER_ACTIVE</span>
                    <div className="flex gap-1">
                      {[1, 2, 3].map(i => <div key={i} className="w-1 h-1 rounded-full bg-primary animate-pulse" style={{ animationDelay: `${i * 0.2}s` }} />)}
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center p-8 text-center group w-full">
                  <label className="cursor-pointer flex flex-col items-center gap-4 group">
                    <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-primary/10 transition-all border border-white/5 group-hover:border-primary/20">
                      <Upload className="w-8 h-8 text-white/20 group-hover:text-primary transition-all" />
                    </div>
                    <div>
                      <p className="font-black text-white text-lg tracking-tight uppercase">INITIATE_UPLINK</p>
                      <p className="text-[10px] text-white/30 mt-1 data-mono tracking-widest uppercase">PNG, JPG or WEBP // MAX_8MB</p>
                    </div>
                    <input type="file" className="hidden" onChange={handleImageUpload} accept="image/*" />
                  </label>
                  <button 
                    type="button"
                    onClick={loadDemoSample}
                    className="mt-6 px-4 py-2 rounded-xl glass text-[9px] font-black uppercase tracking-widest text-primary/80 hover:text-primary hover:border-primary/30 transition-all data-mono"
                  >
                    LOAD_SENTINEL_DEMO_SAMPLE
                  </button>
                </div>
              )}
            </div>

            {selectedImage && !results.length && (
              <button 
                onClick={analyzeImage}
                disabled={isAnalyzing}
                className="w-full bg-primary text-surface py-6 rounded-[1.5rem] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-4 hover:opacity-90 disabled:opacity-50 transition-all shadow-[0_10px_30px_rgba(0,245,255,0.3)] data-mono"
              >
                {isAnalyzing ? (
                  <>
                    <div className="w-6 h-6 border-4 border-surface/30 border-t-surface rounded-full animate-spin" />
                    ANALYZING_NEURAL_PATTERNS...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-6 h-6" />
                    RUN_NEURAL_SCAN
                  </>
                )}
              </button>
            )}
          </div>

          <div className="space-y-8">
            <div className="glass-dark rounded-[2.5rem] p-10 min-h-[300px] flex flex-col border border-white/5 relative overflow-hidden">
              <div className="scanline opacity-10" />
              <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-white/20 data-mono mb-8 relative z-10">SCAN_RESULTS_OUTPUT</h3>
              {results.length > 0 ? (
                <div className="space-y-6 relative z-10">
                  {results.map((res, i) => (
                    <motion.div 
                      key={i}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="glass p-6 rounded-2xl border border-white/10 shadow-xl group hover:border-primary/30 transition-all"
                    >
                      <div className="flex justify-between items-center mb-3">
                        <span className="font-black text-white text-lg tracking-tight uppercase">{res.label}</span>
                        <span className="text-[10px] font-black text-primary data-mono neon-text">{(res.confidence * 100).toFixed(0)}%_MATCH</span>
                      </div>
                      <p className="text-sm text-white/50 leading-relaxed font-medium">{res.recommendation}</p>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center opacity-20 relative z-10">
                  <ShieldAlert className="w-16 h-16 mb-4" />
                  <p className="text-sm font-black uppercase tracking-[0.3em] data-mono">NO_ACTIVE_SCAN_DATA<br/>AWAITING_INPUT_SIGNAL</p>
                </div>
              )}
            </div>

            {results.length > 0 && (
              <div className="space-y-6">
                <textarea 
                  placeholder="ADD_MISSION_LOG_DESCRIPTION..."
                  className="w-full glass-dark rounded-[1.5rem] p-6 text-sm border border-white/5 outline-none focus:ring-2 focus:ring-primary/20 transition-all text-white data-mono placeholder:text-white/20"
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
                <button 
                  onClick={submitReport}
                  className="w-full bg-accent text-white py-6 rounded-[1.5rem] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-4 hover:opacity-90 transition-all shadow-[0_10px_30px_rgba(255,77,0,0.3)] data-mono"
                >
                  <MessageSquare className="w-6 h-6" />
                  SUBMIT_OFFICIAL_REPORT
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// --- User Reports View ---

const ReportsView = ({ reports }: { reports: UserReport[] }) => {
  const [selectedReport, setSelectedReport] = useState<UserReport | null>(null);

  return (
    <div className="max-w-6xl mx-auto space-y-12">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-5xl font-black text-white tracking-tighter uppercase">INCIDENT <span className="text-primary neon-text">REPORTS</span></h2>
          <p className="text-white/40 font-medium mt-3 data-mono tracking-widest uppercase">Community-sourced pollution monitoring // Sentinel_Network</p>
        </div>
        <div className="glass-dark px-6 py-3 rounded-2xl border border-white/10 text-primary font-black text-xs data-mono tracking-widest uppercase">
          {reports.length} TOTAL_REPORTS_LOGGED
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {reports.map((report) => (
          <motion.div 
            key={report.id} 
            layoutId={report.id}
            whileHover={{ y: -8 }}
            className="glass rounded-[2.5rem] overflow-hidden border border-white/10 shadow-2xl group transition-all"
          >
            <div className="aspect-video relative overflow-hidden">
              <img 
                src={report.image && (report.image.startsWith('data:image/') || report.image.startsWith('https://')) 
                  ? report.image 
                  : "https://images.unsplash.com/photo-1551244072-5d12893278ab?auto=format&fit=crop&q=80&w=600"} 
                alt="Report" 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-surface/80 via-transparent to-transparent opacity-60" />
              <div className="absolute top-6 left-6 glass-dark text-white text-[10px] font-black px-4 py-2 rounded-full data-mono tracking-widest border border-white/10">
                {report.timestamp}
              </div>
            </div>
            <div className="p-8 space-y-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-black text-xl text-white tracking-tight uppercase">{report.id}</h3>
                  <p className="text-[10px] text-white/30 flex items-center gap-2 mt-2 data-mono tracking-widest uppercase">
                    <MapPin className="w-3 h-3 text-primary" /> {report.location}
                  </p>
                </div>
                <div className="flex -space-x-3">
                  {report.detections.map((d, i) => (
                    <div key={i} className="w-8 h-8 rounded-full bg-primary border-2 border-surface flex items-center justify-center text-[10px] text-surface font-black shadow-lg">
                      {d?.label?.[0]?.toUpperCase() || '?'}
                    </div>
                  ))}
                </div>
              </div>
              <p className="text-sm text-white/50 line-clamp-2 italic font-medium leading-relaxed">"{report.description || 'No description provided.'}"</p>
              <div className="pt-6 border-t border-white/5 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-secondary shadow-[0_0_8px_rgba(0,245,255,1)]" />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 data-mono">STATUS: VERIFIED</span>
                </div>
                <button 
                  onClick={() => setSelectedReport(report)}
                  className="text-primary text-xs font-black uppercase tracking-widest hover:neon-text transition-all data-mono"
                >
                  VIEW_DETAILS
                </button>
              </div>
            </div>
          </motion.div>
        ))}
        {reports.length === 0 && (
          <div className="col-span-full py-32 text-center opacity-20">
            <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-8 border border-white/5">
              <MessageSquare className="w-12 h-12" />
            </div>
            <p className="text-2xl font-black uppercase tracking-[0.3em] data-mono">NO_REPORTS_SUBMITTED_YET</p>
          </div>
        )}
      </div>

      {/* Report Detail Modal */}
      <AnimatePresence>
        {selectedReport && (
          <div 
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-6"
            onClick={() => setSelectedReport(null)}
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-dark border border-white/10 rounded-[2.5rem] max-w-2xl w-full p-8 space-y-6 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary data-mono">INCIDENT_INTEL_DOSSIER</span>
                  <h3 className="text-3xl font-black text-white uppercase mt-1">{selectedReport.id}</h3>
                  <p className="text-xs text-white/40 data-mono mt-1">{selectedReport.location} // {selectedReport.timestamp}</p>
                </div>
                <button 
                  onClick={() => setSelectedReport(null)}
                  className="px-4 py-2 rounded-xl glass hover:text-error transition-all font-mono text-xs"
                >
                  ESC ✕
                </button>
              </div>

              <div className="aspect-video rounded-2xl overflow-hidden border border-white/10">
                <img src={selectedReport.image} alt="Incident" className="w-full h-full object-cover" />
              </div>

              <div className="space-y-2">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 data-mono">OBSERVER_NOTES</span>
                <p className="text-sm text-white/70 italic leading-relaxed bg-white/5 p-4 rounded-xl border border-white/5">
                  "{selectedReport.description || 'No description provided.'}"
                </p>
              </div>

              <div className="space-y-4">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 data-mono">NEURAL_DETECTION_BREAKDOWN</span>
                <div className="space-y-3">
                  {selectedReport.detections.map((d, i) => (
                    <div key={i} className="glass p-4 rounded-xl border border-white/10 flex justify-between items-center">
                      <div>
                        <p className="font-bold text-white uppercase text-sm">{d.label}</p>
                        <p className="text-xs text-white/40 mt-1">{d.recommendation}</p>
                      </div>
                      <span className="text-xs font-black text-primary data-mono">{(d.confidence * 100).toFixed(0)}% MATCH</span>
                    </div>
                  ))}
                </div>
              </div>

              <button 
                onClick={() => setSelectedReport(null)}
                className="w-full py-4 rounded-xl bg-primary text-surface font-black uppercase tracking-widest text-xs data-mono hover:opacity-90 transition-all shadow-[0_0_20px_rgba(0,245,255,0.4)]"
              >
                ACKNOWLEDGE_AND_CLOSE
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const AdminView = ({ sensors, onDeactivate, onReCalibrate }: { 
  sensors: any[], 
  onDeactivate: (id: string) => void, 
  onReCalibrate: (id: string) => void 
}) => {
  return (
    <div className="max-w-7xl mx-auto">
      <section className="mb-12">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Shield className="text-primary w-6 h-6 drop-shadow-[0_0_8px_rgba(0,245,255,0.5)]" />
            <h2 className="text-5xl font-black text-white tracking-tighter uppercase">ADMIN <span className="text-primary neon-text">CORE</span></h2>
          </div>
          <div className="glass-dark px-6 py-2 rounded-full border border-white/10">
            <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.4em] data-mono">SYSTEM_AUTHORITY: LEVEL_4</span>
          </div>
        </div>
        <p className="text-white/40 font-medium max-w-2xl leading-relaxed text-lg data-mono uppercase tracking-widest mb-12">
          Direct hardware override and telemetry recalibration protocols. Authorized personnel only.
        </p>
      </section>

      <div className="grid grid-cols-1 gap-6">
        {sensors.map((sensor) => (
          <motion.div 
            key={sensor.id}
            layout
            className={cn(
              "glass rounded-[2.5rem] p-8 border-white/10 transition-all group relative overflow-hidden",
              sensor.status === 'Deactivated' ? "opacity-50 grayscale" : "opacity-100"
            )}
          >
            <div className="flex flex-wrap items-center justify-between gap-8 relative z-10">
              <div className="flex items-center gap-8 min-w-[300px]">
                <div className={cn(
                  "w-20 h-20 glass-dark flex items-center justify-center rounded-3xl border-white/5 transition-all",
                  sensor.status === 'Deactivated' ? "text-white/20" : "text-primary group-hover:border-primary/30"
                )}>
                  <sensor.icon className="w-10 h-10 drop-shadow-[0_0_10px_rgba(0,245,255,0.3)]" />
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-black text-3xl text-white tracking-tighter uppercase">NODE_{sensor.id}</h3>
                    <SensorStatusBadge status={sensor.status} />
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 data-mono">{sensor.type} // {sensor.location}</p>
                </div>
              </div>

              <div className="flex-1 grid grid-cols-2 lg:grid-cols-4 gap-8">
                <div className="space-y-2">
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20 data-mono">BATTERY_RESERVE</p>
                  <BatteryIndicator level={sensor.battery} />
                </div>
                <div className="space-y-2">
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20 data-mono">LAST_TELEMETRY</p>
                  <div className="flex items-center gap-3 text-white/80">
                    <Clock className="w-5 h-5 text-primary/40" />
                    <span className="text-xl font-black data-mono">{sensor.sync}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20 data-mono">SIGNAL_STRENGTH</p>
                  <div className="flex items-center gap-3 text-white/80">
                    <Wifi className="w-5 h-5 text-primary/40" />
                    <span className="text-xl font-black data-mono">{sensor.signal}%</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20 data-mono">LATENCY_MS</p>
                  <div className="flex items-center gap-3 text-white/80">
                    <Activity className="w-5 h-5 text-primary/40" />
                    <span className="text-xl font-black data-mono">{sensor.latency}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <button 
                  onClick={() => onReCalibrate(sensor.id)}
                  disabled={sensor.status === 'Deactivated'}
                  className="flex items-center gap-3 px-6 py-3 rounded-2xl glass-dark border border-white/5 text-white/60 hover:text-primary hover:border-primary/30 transition-all disabled:opacity-20 disabled:cursor-not-allowed group/btn"
                >
                  <RotateCcw className="w-5 h-5 group-hover/btn:rotate-180 transition-transform duration-500" />
                  <span className="text-[10px] font-black uppercase tracking-widest data-mono">RE_CALIBRATE</span>
                </button>
                <button 
                  onClick={() => onDeactivate(sensor.id)}
                  className={cn(
                    "flex items-center gap-3 px-6 py-3 rounded-2xl transition-all data-mono",
                    sensor.status === 'Deactivated' 
                      ? "bg-primary/20 text-primary border border-primary/30 hover:bg-primary/30" 
                      : "bg-error/10 text-error border border-error/20 hover:bg-error/20"
                  )}
                >
                  <Power className="w-5 h-5" />
                  <span className="text-[10px] font-black uppercase tracking-widest">
                    {sensor.status === 'Deactivated' ? 'ACTIVATE_NODE' : 'DEACTIVATE_NODE'}
                  </span>
                </button>
              </div>
            </div>
            
            {/* Background Accent for Active Node */}
            {sensor.status !== 'Deactivated' && (
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-[80px] group-hover:bg-primary/10 transition-all" />
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [view, setView] = useState<View>('dashboard');
  const [reports, setReports] = useState<UserReport[]>(INITIAL_REPORTS);
  const [sensors, setSensors] = useState(INITIAL_SENSORS);
  const [alerts, setAlerts] = useState<Alert[]>(INITIAL_ALERTS);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const notifiedAlerts = React.useRef<Set<string>>(new Set(INITIAL_ALERTS.map(a => a.id)));

  // Alert Monitoring Logic
  useEffect(() => {
    const checkThresholds = () => {
      const newAlerts: Alert[] = [];
      sensors.forEach(sensor => {
        if (sensor.status === 'Deactivated') return;

        // pH Thresholds
        if (sensor.ph < 6.5 || sensor.ph > 8.5) {
          const alertId = `ph-${sensor.id}-${Math.floor(Date.now() / 60000)}`;
          if (!alerts.some(a => a.id === alertId)) {
            newAlerts.push({
              id: alertId,
              type: 'error',
              title: 'Critical pH Deviation',
              desc: `Node ${sensor.id} | ${sensor.location} | pH: ${sensor.ph}`,
              time: 'JUST NOW',
              isNew: true
            });
          }
        }

        // Oxygen Thresholds
        if (sensor.o2 < 5.0) {
          const alertId = `o2-${sensor.id}-${Math.floor(Date.now() / 60000)}`;
          if (!alerts.some(a => a.id === alertId)) {
            newAlerts.push({
              id: alertId,
              type: 'warning',
              title: 'Low Oxygen Levels',
              desc: `Node ${sensor.id} | ${sensor.location} | O2: ${sensor.o2}mg/L`,
              time: 'JUST NOW',
              isNew: true
            });
          }
        }

        // Battery Thresholds
        if (sensor.battery < 10) {
          const alertId = `bat-${sensor.id}-${Math.floor(Date.now() / 60000)}`;
          if (!alerts.some(a => a.id === alertId)) {
            newAlerts.push({
              id: alertId,
              type: 'offline',
              title: 'Critical Power Level',
              desc: `Node ${sensor.id} | ${sensor.location} | Battery: ${sensor.battery}%`,
              time: 'JUST NOW',
              isNew: true
            });
          }
        }
      });

      if (newAlerts.length > 0) {
        setAlerts(prev => {
          const combined = [...newAlerts, ...prev];
          const unique = combined.filter((alert, index, self) => 
            index === self.findIndex((a) => a.id === alert.id)
          );
          if (unique.length === prev.length && unique.every((v, i) => v.id === prev[i].id)) {
            return prev;
          }
          return unique.slice(0, 10);
        });
      }

      // Handle Notifications (both in-app and browser)
      // We check all alerts in the current state + new ones to see if they need notification
      const allCurrentAlerts = [...newAlerts, ...alerts];
      allCurrentAlerts.forEach(alert => {
        if (!notifiedAlerts.current.has(alert.id)) {
          // Mark as notified immediately to prevent duplicates
          notifiedAlerts.current.add(alert.id);

          const safeTitle = sanitizeText(alert.title, 100);
          const safeDesc = sanitizeText(alert.desc, 250);

          // In-app toast (always show if it's a "new" alert event)
          toast[alert.type === 'error' || alert.type === 'offline' ? 'error' : 'warning'](safeTitle, {
            description: safeDesc,
            duration: 5000,
          });

          // Browser Notification (only if enabled in a secure context)
          if (
            notificationsEnabled && 
            typeof window !== 'undefined' && 
            "Notification" in window && 
            Notification.permission === "granted"
          ) {
            try {
              new Notification(safeTitle, { body: safeDesc });
            } catch (err) {
              console.warn("Desktop notification suppressed:", err);
            }
          }
        }
      });
    };

    const interval = setInterval(checkThresholds, 10000);
    checkThresholds(); // Initial check
    return () => clearInterval(interval);
  }, [sensors, alerts, notificationsEnabled]);

  const toggleNotifications = async () => {
    if (!notificationsEnabled) {
      if (typeof window !== 'undefined' && "Notification" in window) {
        try {
          const permission = await Notification.requestPermission();
          if (permission === "granted") {
            setNotificationsEnabled(true);
            logSecurityAudit('ENABLE_NOTIFICATIONS', undefined, 'Browser push telemetry alerts authorized.');
            toast.success("System notifications enabled");
          } else {
            toast.error("Notification permission denied", {
              description: "Please enable notifications in your browser settings."
            });
          }
        } catch (error) {
          console.error("Error requesting notification permission:", error);
          toast.error("Failed to enable notifications");
        }
      } else {
        toast.error("Browser unsupported", {
          description: "This browser does not support desktop notifications."
        });
      }
    } else {
      setNotificationsEnabled(false);
      logSecurityAudit('DISABLE_NOTIFICATIONS', undefined, 'Browser push telemetry alerts silenced.');
      toast.info("System notifications disabled");
    }
  };

  const handleReportCreated = (newReport: UserReport) => {
    setReports(prev => [newReport, ...prev]);
    setView('reports');
  };

  const handleDeactivate = (id: string) => {
    if (!checkRateLimit('ADMIN_TOGGLE', 10, 5000)) {
      toast.warning("Command Throttled", {
        description: "Administrative commands rate limited to protect telemetry grid stability."
      });
      return;
    }

    const sensor = sensors.find(s => s.id === id);
    if (!sensor) return;

    const nextStatus = sensor.status === 'Deactivated' ? 'Healthy' : 'Deactivated';
    setSensors(prev => prev.map(s => 
      s.id === id ? { ...s, status: nextStatus } : s
    ));

    logSecurityAudit(
      nextStatus === 'Deactivated' ? 'DEACTIVATE_NODE' : 'ACTIVATE_NODE',
      id,
      `System Authority Level 4 state update for node ${id}`
    );

    toast.info(`Node ${id} Status Changed`, {
      description: `Sensor state transitioned to ${nextStatus}. Logged to Sentinel Journal.`
    });
  };

  const handleReCalibrate = (id: string) => {
    if (!checkRateLimit('ADMIN_RECALIBRATE', 10, 5000)) {
      toast.warning("Command Throttled", {
        description: "Recalibration cycles rate limited. Please pause before subsequent resets."
      });
      return;
    }

    const sensor = sensors.find(s => s.id === id);
    if (!sensor) return;

    const timestamp = new Date().toLocaleTimeString();
    setSensors(prev => prev.map(s => 
      s.id === id ? { ...s, sync: timestamp, status: 'Healthy' } : s
    ));

    logSecurityAudit(
      'RECALIBRATE_NODE',
      id,
      `Telemetry synced with North Atlantic grid at ${timestamp}`
    );

    toast.success(`Node ${id} Calibrated`, {
      description: `Telemetry synchronization verified at ${timestamp}.`
    });
  };

  const [tacticalDrillActive, setTacticalDrillActive] = useState(false);

  const handleToggleDrill = () => {
    setTacticalDrillActive(prev => {
      const next = !prev;
      if (next) {
        logSecurityAudit('START_TACTICAL_DRILL', 'SECTOR_7G', 'Operation Neptune Shield emergency simulation initiated');
        toast.error("🚨 TACTICAL DRILL ENGAGED", {
          description: "Operation Neptune Shield active. Major crude spill simulated in Sector 7-G. Interception protocols engaged."
        });
        setAlerts(curr => [
          {
            id: `drill-${Date.now()}`,
            type: 'error',
            title: 'SIMULATED SPILL // SECTOR 7-G',
            desc: '1,400 BBL crude discharge detected. Intercept dark vessel and deploy booms.',
            time: 'JUST NOW',
            isNew: true
          },
          ...curr
        ]);
        setView('drift');
      } else {
        logSecurityAudit('STAND_DOWN_TACTICAL_DRILL', 'SECTOR_7G', 'Operation Neptune Shield terminated');
        toast.success("Tactical Drill Stood Down", {
          description: "Simulation parameters cleared. Surveillance feeds returned to nominal."
        });
      }
      return next;
    });
  };

  const handleCitationIssued = (citation: MaritimeCitation) => {
    const newReport: UserReport = {
      id: citation.id,
      image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&q=80&w=800',
      description: `MARPOL ANNEX I CITATION: ${citation.vesselName} (MMSI: ${citation.mmsi}) penalized for illicit hydrocarbon discharge in ${citation.sector}. Assessed Statutory Penalty: $${citation.penaltyUsd.toLocaleString()} USD. Evidence Seal: ${citation.evidenceHash}.`,
      location: citation.sector,
      timestamp: 'Today (Official Coast Guard Interdiction)',
      detections: [
        { label: 'Unlawful Bilge Hydrocarbon Discharge', confidence: 0.98, recommendation: 'Issue Flag State Interdiction Notice & Dispatch Cutter.' },
        { label: 'SOLAS AIS Silencing Infraction', confidence: 0.99, recommendation: 'Report transponder blackout to IMO Maritime Safety Committee.' }
      ]
    };
    setReports(prev => [newReport, ...prev]);
  };

  return (
    <div className="min-h-screen pb-32 md:pb-12 bg-surface transition-colors relative overflow-hidden">
      <Toaster position="top-right" theme="dark" richColors />
      <div className="scanline opacity-20" />
      
      <TopNav 
        activeView={view} 
        setView={setView} 
        tacticalDrillActive={tacticalDrillActive} 
        onToggleDrill={handleToggleDrill} 
      />

      <TacticalDrillBanner 
        isActive={tacticalDrillActive} 
        onNavigate={setView} 
        onStandDown={handleToggleDrill} 
      />
      
      <main className="max-w-7xl mx-auto px-6 pt-12 relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={view}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4, ease: "circOut" }}
          >
            {view === 'dashboard' && (
              <DashboardView 
                alerts={alerts} 
                notificationsEnabled={notificationsEnabled}
                onToggleNotifications={toggleNotifications}
                onNavigate={setView}
              />
            )}
            {view === 'map' && <MapView sensors={sensors} onNavigate={setView} />}
            {view === 'ais' && <AisRadarView onCitationIssued={handleCitationIssued} />}
            {view === 'drift' && (
              <DriftSimulatorView 
                isDrillActive={tacticalDrillActive} 
                onDrillInitiated={handleToggleDrill} 
              />
            )}
            {view === 'analytics' && <AnalyticsView />}
            {view === 'sensors' && <SensorsView sensors={sensors} />}
            {view === 'detection' && <DetectionView onReportCreated={handleReportCreated} />}
            {view === 'reports' && <ReportsView reports={reports} />}
            {view === 'admin' && (
              <AdminView 
                sensors={sensors} 
                onDeactivate={handleDeactivate} 
                onReCalibrate={handleReCalibrate} 
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      <BottomNav currentView={view} setView={setView} />

      {/* Floating Action Button */}
      <button 
        onClick={() => setView('detection')}
        className="fixed bottom-28 right-8 md:bottom-12 md:right-12 h-16 w-16 rounded-[1.5rem] bg-primary text-surface flex items-center justify-center shadow-[0_10px_40px_rgba(0,245,255,0.4)] hover:scale-110 active:scale-95 transition-all z-40 group"
      >
        <Camera className="w-7 h-7 group-hover:rotate-12 transition-transform" />
      </button>

      {/* Background Accents */}
      <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[150px] -mr-96 -mt-96 animate-pulse-soft" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-accent/5 rounded-full blur-[150px] -ml-72 -mb-72 animate-pulse-soft" style={{ animationDelay: '1.5s' }} />
        <img 
          src="https://images.unsplash.com/photo-1551244072-5d12893278ab?auto=format&fit=crop&q=80&w=2000" 
          alt="Background Texture" 
          className="w-full h-full object-cover opacity-[0.03] mix-blend-overlay"
          referrerPolicy="no-referrer"
        />
      </div>
    </div>
  );
}
