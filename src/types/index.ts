export type StreamState = 'ACTIVE' | 'IDLE' | 'HEARTBEAT';

export type VideoSourceMode = 
  | 'browser_webcam'
  | 'browser_sample'
  | 'browser_upload'
  | 'python_live';

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Detection {
  label: string;
  confidence: number;
  box?: [number, number, number, number];
  area_px?: number;
}

export interface TelemetryData {
  timestamp: number;
  frameId: number;
  state: StreamState;
  activityRatio: number;
  rawBytes: number;
  sentBytes: number;
  savedBytes: number;
  compressionRatioPct: number;
  currentKbps: number;
  baselineKbps: number;
  roiBox: [number, number, number, number] | null;
  detections: Detection[];
  roiB64?: string | null;
  totalCapturedFrames: number;
  totalSentFrames: number;
  cumulativeRawBytes: number;
  cumulativeSentBytes: number;
  cumulativeEnergySavedWh: number;
  cumulativeCo2AvoidedGrams: number;
  cumulativeWaterSavedMl: number;
}

export interface MacroParams {
  cams: number; // 10,000 to 5,000,000
  act: number;  // 5% to 80% (Scene activity)
  roi: number;  // 10% to 100% (ROI share of active frame)
  edge: number; // 0.5 to 5.0 W (Edge node power)
  pue: number;  // 1.10 to 2.00 (Data center PUE)
  grid: number; // 0.10 to 0.90 kg/kWh (Grid carbon intensity)
}

export interface MacroTableRow {
  metric: string;
  centralised: string;
  ecoVision: string;
  change: string;
  badgeType: 'good' | 'keep' | 'neutral';
}

export interface MacroImpactResult {
  retentionPct: number;
  rawTrafficTbps: number;
  rawExabytesYear: number;
  ecoTrafficTbps: number;
  ecoExabytesYear: number;
  rawCloudFlopsPflops: number;
  ecoCloudFlopsPflops: number;
  cloudFacilityEnergyGwh: number;
  ecoFacilityEnergyGwh: number;
  edgeNodeEnergyGwh: number;
  netEnergySavedGwh: number;
  netCo2AvoidedTonnes: number;
  coolingWaterAvoidedMillionL: number;
  tableRows: MacroTableRow[];
  summaryText: string;
}
