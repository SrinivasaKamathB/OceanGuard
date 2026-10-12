<div align="center">

# 🌊 OceanGuard
### Autonomous Marine Environmental Surveillance & Incident Defense Network

[![Live Demo](https://img.shields.io/badge/Live%20Console-oceanguard--vclj.onrender.com-00f5ff?style=for-the-badge&logo=render&logoColor=white)](https://oceanguard-vclj.onrender.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)
[![Security Audited](https://img.shields.io/badge/Security-0%20Vulnerabilities-success?style=for-the-badge)](src/lib/security.ts)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue?style=for-the-badge&logo=typescript&logoColor=white)](tsconfig.json)
[![React](https://img.shields.io/badge/React-19-61dafb?style=for-the-badge&logo=react&logoColor=black)](package.json)

<br />

**A sovereign, real-time command console engineered for Coast Guards, maritime authorities, port operators, and ocean conservation organizations to detect, attribute, and contain marine ecological hazards.**

[Explore Live Console](https://oceanguard-vclj.onrender.com) • [Key Features](#-core-capabilities) • [Partners & Team](#-partners--collaborators) • [Quick Start](#-quick-start-local-development)

</div>

---

## 🌐 Live Deployment

The latest version of OceanGuard is live on Render:

### 🚀 **[https://oceanguard-vclj.onrender.com](https://oceanguard-vclj.onrender.com)**

> **Immediate Interactive Features Available on Live URL:**
> - **Live AIS Radar**: Real-time vessel tracking and Dark Ship correlation near Sector 7-G.
> - **Plume Drift Simulator**: Physics trajectory projections from T+0h to T+48h with virtual containment booms.
> - **Tactical Crisis Drill**: 1-click Coast Guard interdiction exercise with automated NOTMAR alerts.
> - **Satellite Vision Telemetry**: Instant multispectral sample analyzer for microplastics and crude hydrocarbons.

---

## 📖 What is OceanGuard?

Illegal bilge dumping, unmonitored crude oil spills, and plastic accumulation threaten global marine ecosystems and coastal sovereignty. Existing surveillance tools are fragmented across siloed radar screens, delayed satellite sweeps, and disconnected buoy telemetry.

**OceanGuard unifies these systems into a single defense-grade tactical console:**
1. **Detects** surface slicks and biochemical anomalies using satellite and drone multispectral vision.
2. **Attributes** pollution sources by correlating slick coordinates with AIS vessel transponder trails to expose covert "dark ships".
3. **Projects** spill drift vectors through an Eulerian-Lagrangian hydrodynamic particle simulation engine.
4. **Executes** immediate interdiction workflows, including legal MARPOL Form CG-718A violation citations and international NAVTEX/NOTMAR emergency broadcasts.

---

## 👥 Team & Contributors

- **Team Lead**: [Shreesha Anand Pujar](https://github.com/ShreeshaAnandPujar)
- [Srinivasa Kamath B](https://github.com/SrinivasaKamathB)
- [Ashwitha Ramesh](https://github.com/Ashwitha-Ramesh)
- [Harshitha Raghu](https://github.com/Harshitha-Raghu11)

---

## ✨ Core Capabilities

### 1. 🚢 Live AIS Vessel Radar & "Dark Ship" Attribution
- **Plan Position Indicator (PPI) Radar Screen**: 360° rotating radar sweep, concentric nautical range rings (5, 10, 20 NM), and azimuth markers.
- **Dark Transponder Isolation**: Automatically isolates vessels that switch off AIS transponders to execute illicit night-time bilge discharges.
- **Spatio-Temporal Retro-Correlation**: Calculates historical track intercepts to attribute spills directly to responsible vessels (e.g., `GHOST_TRANSPONDER_TX09` flagged with 98% confidence).
- **Official MARPOL Form CG-718A Citations**: Generates formal Coast Guard violation notices with assessed statutory penalties ($2,500,000 USD), cryptographic SHA-256 evidence seals, and automated archival to mission logs.
- **Tactical Intercept Dispatch**: Dispatches patrol cutters (e.g., USCGC Sentinel WPC-1101) with live tactical ETAs.

### 2. 🌊 Ocean Current Drift & Plume Simulator
- **Eulerian-Lagrangian Trajectory Engine**: Real-time particle flow canvas modeling ocean basin current velocities and wind drift.
- **T+ Forecast Scrubbing (0 to 48 Hours)**: Interactive slider predicting contaminant dispersion geometry and area growth.
- **Marine Bio-Sanctuary Impact Warning**: Calculates impact countdowns for protected marine reserves (e.g., Cape Hatteras Sanctuary).
- **Rapid Containment Boom Deployment**: Simulates surface barrier boom rings that reduce plume spread velocity by 75%.
- **NAVTEX / NOTMAR Broadcast Generator**: Instantly formats official Notice to Mariners emergency teletype warnings on international 518 kHz channels.

### 3. 🚨 Tactical Emergency Readiness Drill System
- **Single-Click Exercise Trigger**: Launches high-readiness simulations (Operation Neptune Shield).
- **Urgent HUD Alert Banner**: Persistent countdown timer and instant navigation between drift projections and intercept radar.
- **Stand-Down Controls**: Reset simulation parameters to baseline surveillance with cryptographic audit logging.

### 4. 🛰️ Multispectral Neural AI Vision
- **Computer Vision Diagnostics**: Automated segmentation of synthetic-aperture radar (SAR), thermal, and optical imagery.
- **Severity & Confidence Scoring**: Pinpoints hydrocarbon sheens, microplastics, and biochemical runoff with actionable response recommendations.
- **One-Click Demo Inspector**: Preloaded high-resolution multispectral sentinel images for offline and field demonstrations.

### 5. 📡 IoT Buoy Sensor Network Telemetry
- **Continuous Edge Monitoring**: Real-time water quality tracking across global sectors: pH, Turbidity, Dissolved O₂, and Water Temperature.
- **Automated Health Matrix**: Live signal integrity, transmission latency, battery reserves, and calibration status.

---

## 🏛️ System Architecture

```
                       [ MULTI-CONSTELLATION SATELLITES ]
                          (Sentinel-2 SAR / Thermal / Optical)
                                           │
                                           ▼
[ IoT BUOY SENSOR MESH ] ──────► [ OCEANGUARD DEFENSE CORE ] ◄────── [ AIS VESSEL RADAR ]
 (pH, O₂, Turbidity, Temp)                 │                             (Live Fleet Telemetry)
                                           │
                 ┌─────────────────────────┴─────────────────────────┐
                 ▼                                                   ▼
     [ HYDRODYNAMIC DRIFT ENGINE ]                       [ DARK SHIP ATTRIBUTION ]
  • Eulerian-Lagrangian Particles                     • Spatio-Temporal Intercepts
  • 48-Hour Forecast Dispersion                       • MARPOL Form CG-718A Citations
  • Rapid Boom Barrier Modeling                       • Cutter Interception Vectors
                 │                                                   │
                 └─────────────────────────┬─────────────────────────┘
                                           ▼
                       [ TACTICAL COMMAND CONSOLE (WEB) ]
                           https://oceanguard-vclj.onrender.com
```

---

## 🛠️ Technology Stack

| Layer | Technologies Used |
| :--- | :--- |
| **Frontend Framework** | React 19, TypeScript 5.8, Vite 6 |
| **Styling & Theme** | Tailwind CSS 4, Custom Ocean Glow Design Tokens, Glassmorphism |
| **Animations & HUD** | Motion (Framer Motion 12), Custom Scanline Shaders |
| **Data Visualization** | Recharts 3, Responsive Telemetry Curves |
| **Icons & Indicators** | Lucide React |
| **Security & Auditing** | In-memory token bucket rate limiting, OWASP LLM02 schema validation, strict CSP, SHA-256 evidence hashing |
| **Deployment** | Render Static Site CDN, Global Edge HTTPS |

---

## 🚀 Quick Start (Local Development)

### Prerequisites
- Node.js (v18.0.0 or higher)
- npm or bun

### 1. Clone the Repository
```bash
git clone https://github.com/SrinivasaKamathB/OceanGuard.git
cd OceanGuard
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
```bash
cp .env.example .env.local
```
*(Optional: Add your Gemini API key to `.env.local` to enable live vision inference).*

### 4. Start Local Development Server
```bash
npm run dev
```
Open **`http://localhost:3000`** in your browser.

---

## 🛡️ Security & Quality Assurance

- **0 Known Vulnerabilities**: Audited and maintained with clean package dependency overrides (`npm audit`).
- **Strict Content Security Policy (CSP)**: Hardened headers rejecting unsafe external scripts, SVGs, and untrusted image origins.
- **OWASP LLM02 Guardrails**: Strict schema validation and prompt sanitation preventing indirect prompt injections.
- **Cryptographic Audit Journal**: Every simulated citation, boom deployment, and node calibration is timestamped and recorded.

---

## 📜 License

Distributed under the **MIT License**. See [`LICENSE`](LICENSE) for complete terms.

```
Copyright (c) 2026 OceanGuard Contributors
Permission is hereby granted, free of charge, to any person obtaining a copy of this software...
```
