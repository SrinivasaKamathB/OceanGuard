export interface AisVessel {
  id: string;
  name: string;
  callsign: string;
  mmsi: string;
  imo: string;
  vesselType: 'Crude Tanker' | 'Container Carrier' | 'Commercial Trawler' | 'Bulk Carrier' | 'Unidentified (Dark)';
  flag: string;
  flagCountry: string;
  lengthMeters: number;
  dwtTons: number;
  speedKnots: number;
  headingDeg: number;
  x: number; // 0 - 100 percentage for radar map coordinate
  y: number; // 0 - 100 percentage for radar map coordinate
  transponderStatus: 'ACTIVE' | 'SILENCED_DARK' | 'ANOMALOUS_SPOOF';
  lastPingMinAgo: number;
  distanceToSlickNm: number;
  riskScore: number; // 0 - 100
  correlationVerdict: 'HIGH_PROBABILITY_SOURCE' | 'TRANSIT_CLEAR' | 'MONITORING';
  violatingRegulation?: string;
  destination: string;
  eta: string;
  trail: { x: number; y: number; time: string }[];
}

export interface DriftPlumeState {
  forecastHour: number; // 0, 6, 12, 24, 48
  currentVelocityMps: number; // 0.2 - 3.5 m/s
  currentDirectionDeg: number; // 0 - 360
  windSpeedKnots: number; // 0 - 45
  spillType: 'Bunker Crude (API 18)' | 'Marine Diesel (API 34)' | 'Microplastic Slurry';
  boomsDeployed: boolean;
}

export interface MaritimeCitation {
  id: string;
  vesselName: string;
  mmsi: string;
  imo: string;
  flagState: string;
  timestamp: string;
  sector: string;
  estimatedVolumeBbl: number;
  violationCode: string;
  penaltyUsd: number;
  evidenceHash: string;
}
