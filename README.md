# OceanGuard
### Autonomous Marine Environmental Surveillance & Incident Defense Network

[![Live Deployment](https://img.shields.io/badge/Live%20Demo-OceanGuard%20Console-00f5ff?style=for-the-badge&logo=firefox)](YOUR_DEPLOYMENT_URL_HERE)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)
[![Security: Audited](https://img.shields.io/badge/Security-Hardened%20(0%20Vulnerabilities)-success?style=for-the-badge)](src/lib/security.ts)

**OceanGuard** is a sovereign maritime monitoring and pollution defense platform designed for Coast Guards, maritime authorities, port operators, and ocean environmental protection agencies. It combines multi-constellation satellite imagery, edge IoT telemetry buoys, AIS vessel radar correlation, and deep neural vision analysis to detect, attribute, and respond to marine ecological threats in real time.

---

## 🌐 Live Deployment & Interactive Demo

> **Live Console URL**: **[YOUR_DEPLOYMENT_URL_HERE](YOUR_DEPLOYMENT_URL_HERE)**  
> *(Drop your deployed URL here — supports Vercel, Netlify, Cloudflare Pages, or Docker)*

- **Interactive AIS Radar**: Track commercial vessels and isolate dark ships operating near pollution centroids.
- **Hydrodynamic Plume Simulator**: Scrub forecast trajectories from T+0h to T+48h and test rapid containment booms.
- **Tactical Emergency Drills**: One-click simulation drills triggering automated Coast Guard Notices to Mariners (NOTMAR).

---

## 🤝 Project Partners & Collaborators

We collaborate with maritime organizations, research institutions, and defense partners to build sovereign ocean protection solutions:

| Partner / Organization | Focus Area | Role & Contribution |
| :--- | :--- | :--- |
| **Partner Name / Agency** | Maritime Defense & AIS Feeds | Vessel traffic radar integration & interdiction protocol |
| **Partner Name / Institution** | Marine Bio-Conservation | Ecological sanctuary boundaries & telemetry validation |
| **Partner Name / Tech Partner** | Edge Sensor Mesh | Buoy hardware deployment & low-latency satellite uplink |

*(To add or update partner profiles, edit this table with their names, logos, or institutional links)*

---

## 👥 Core Team & Contributors

- **Lead Architect**: [Your Name](https://github.com/YOUR_GITHUB_USERNAME) — System Architecture, Security Hardening & Neural Vision Pipeline
- **Team Partner 1**: [Partner Name](https://github.com/) — Role / Specialization
- **Team Partner 2**: [Partner Name](https://github.com/) — Role / Specialization

---

## Key Capabilities

- **Command Center & Tactical Telemetry**: Real-time monitoring of ocean health indices, water quality (pH, Turbidity, Dissolved Oxygen, Temperature), and active incident status across global maritime defense sectors.
- **Multispectral Satellite & Drone Vision**: Automated computer vision pipeline with thermal, infrared, and synthetic-aperture radar (SAR) overlays for microplastic detection, crude oil slick mapping, and chemical runoff tracking.
- **Live AIS Vessel Tracking & Dark Ship Attribution**: Correlate detected oil slicks with AIS transponder paths to identify non-compliant vessels and dark ships operating with silenced transponders.
- **Hydrodynamic Plume & Drift Simulator**: Particle trajectory engine projecting 6h, 12h, and 24h slick drift vectors based on real-time current velocity and surface wind force.
- **Tactical Emergency Drills & NOTMAR Generation**: Instant one-click simulation drills triggering automated alerts and official Coast Guard Notice to Mariners (NOTMAR) dossiers.
- **Defense-Grade Hardening**: Zero runtime vulnerabilities (`npm audit`), strict Content Security Policy (CSP), OWASP LLM02 schema validation, in-memory rate limiting, and SHA-256 audit logging.

---

## System Architecture

```
[IoT Sensor Buoys (Mesh Network)]
               │
               ▼
[Edge Telemetry Gateway] ───────► [OceanGuard Defense Core] ◄────── [Sentinel-2 / SAR Satellite Uplinks]
                                          │
                   ┌──────────────────────┴──────────────────────┐
                   ▼                                             ▼
       [AIS Dark Ship Attribution]                 [Neural Vision & Drift Simulator]
                   │                                             │
                   └──────────────────────┬──────────────────────┘
                                          ▼
                         [Coast Guard Tactical Command Console]
```

---

## Quick Start

### Prerequisites
- Node.js (v18.0.0 or later)
- npm or bun

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/YOUR_USERNAME/oceanguard.git
   cd oceanguard
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   ```bash
   cp .env.example .env.local
   ```
   Add your Gemini API key to `.env.local`:
   ```env
   GEMINI_API_KEY="your-api-key-here"
   ```

4. Launch the Tactical Command Console:
   ```bash
   npm run dev
   ```
   Access the dashboard locally at `http://localhost:3000`.

---

## Production Build & Verification

```bash
# Typecheck & Lint (0 errors)
npm run lint

# Production Bundle Build
npm run build

# Preview Production Build
npm run preview
```

---

## License & Security
Distributed under the **MIT License**. See [`LICENSE`](LICENSE) for more information.

All telemetry feeds and incident dossiers are logged with cryptographic timestamps for sovereign maritime surveillance and rapid spill interdiction.
