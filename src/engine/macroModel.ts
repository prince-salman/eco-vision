import { MacroParams, MacroImpactResult, MacroTableRow } from '../types';

export const DEFAULT_MACRO_PARAMS: MacroParams = {
  cams: 1000000,
  act: 20,
  roi: 50,
  edge: 2.0,
  pue: 1.40,
  grid: 0.45,
};

function formatNumber(n: number, dp: number = 1): string {
  return n.toLocaleString('en-US', {
    maximumFractionDigits: dp,
    minimumFractionDigits: dp,
  });
}

function formatPercent(a: number, b: number): string {
  if (b === 0) return '0%';
  const change = 100 * (b - a) / b;
  const sign = a < b ? '−' : '+';
  return sign + formatNumber(Math.abs(change), 1) + '%';
}

function formatTraffic(tb: number): string {
  return tb >= 1 
    ? formatNumber(tb, 2) + ' Tbps' 
    : formatNumber(tb * 1000, 0) + ' Gbps';
}

export function calculateMacroImpact(params: MacroParams): MacroImpactResult {
  const { cams: N, act, roi, edge: edgePower, pue: PUE, grid: gridIntensity } = params;
  
  const a = act / 100;
  const r = roi / 100;
  const ret = a * r;
  const metadataOverhead = 0.005; // 0.5% metadata overhead per essay Section 3.3
  const effectiveRetention = ret + metadataOverhead;

  // Upstream traffic: 1080p @ 4 Mbps per camera
  const tb = (N * 4e6) / 1e12; // Baseline Tbps
  const tbE = tb * effectiveRetention; // Eco-Vision Tbps
  
  // Exabytes per year (31.536 million seconds / year, 8 bits per byte)
  const eb = (tb * 1e12 / 8 * 31.536e6) / 1e18;
  const ebE = (tbE * 1e12 / 8 * 31.536e6) / 1e18;

  // Cloud inference FLOPs: 15 fps, 50 GFLOP/frame
  const pf = (N * 15 * 50) / 1e6; // Baseline PFLOP/s
  const pfE = pf * ret; // Eco-Vision PFLOP/s (inference only on active ROI)

  // Energy consumption: 10 pJ per FLOP => 1 PFLOP/s = 10 MW IT power
  const itEnergyGwh = (p: number) => (p * 1e4 * 8760) / 1e9;
  
  const rawItGwh = itEnergyGwh(pf);
  const ecoItGwh = itEnergyGwh(pfE);

  const fac = rawItGwh * PUE;
  const facE = ecoItGwh * PUE;
  const facilitySaved = fac - facE;

  // Edge node energy per year: N cameras * edgePower (Watts) * 8760 h / 10^9
  const edgeEnergy = (N * edgePower * 8760) / 1e9;
  const netEnergySaved = facilitySaved - edgeEnergy;

  // Net CO2 avoided (tonnes): net GWh * 1,000,000 kWh * grid (kg/kWh) / 1,000 kg/t = net * grid * 1000
  const co2Avoided = netEnergySaved * gridIntensity * 1000;

  // Cooling water avoided (million Liters): 0.5 L on-site cooling water per IT kWh saved
  // (rawItGwh - ecoItGwh) * 1e6 kWh * 0.5 L / 1e6 = (rawItGwh - ecoItGwh) * 0.5 million Liters
  const waterAvoided = (rawItGwh - ecoItGwh) * 0.5;

  const tableRows: MacroTableRow[] = [
    {
      metric: 'Upstream traffic',
      centralised: `${formatTraffic(tb)} (${formatNumber(eb, 1)} EB)`,
      ecoVision: `${formatTraffic(tbE)} (${formatNumber(ebE, 2)} EB)`,
      change: formatPercent(tbE, tb),
      badgeType: 'good',
    },
    {
      metric: 'Cloud inference load',
      centralised: `${formatNumber(pf, 0)} PFLOP/s`,
      ecoVision: `${formatNumber(pfE, 0)} PFLOP/s`,
      change: formatPercent(pfE, pf),
      badgeType: 'good',
    },
    {
      metric: 'Cloud facility energy',
      centralised: `${formatNumber(fac, 1)} GWh`,
      ecoVision: `${formatNumber(facE, 1)} GWh`,
      change: `−${formatNumber(facilitySaved, 1)} GWh`,
      badgeType: 'good',
    },
    {
      metric: 'Edge node energy',
      centralised: '0 GWh',
      ecoVision: `${formatNumber(edgeEnergy, 1)} GWh`,
      change: `+${formatNumber(edgeEnergy, 1)} GWh`,
      badgeType: 'neutral',
    },
    {
      metric: 'Net energy saved',
      centralised: '—',
      ecoVision: '—',
      change: `${formatNumber(netEnergySaved, 1)} GWh`,
      badgeType: 'keep',
    },
    {
      metric: 'Net CO₂ avoided',
      centralised: '—',
      ecoVision: '—',
      change: `${formatNumber(co2Avoided, 0)} tonnes`,
      badgeType: 'keep',
    },
    {
      metric: 'On-site cooling water saved',
      centralised: '—',
      ecoVision: '—',
      change: `${formatNumber(waterAvoided, 1)} million L`,
      badgeType: 'keep',
    },
  ];

  const summaryText = netEnergySaved > 0
    ? `At these settings the edge filter keeps ${formatNumber(effectiveRetention * 100, 1)}% of the video and avoids about ${formatNumber(netEnergySaved, 1)} GWh and ${formatNumber(co2Avoided, 0)} t CO₂ a year, after paying for the edge nodes.`
    : `At these settings the edge nodes use more energy than they save. Raise scene redundancy or lower node power.`;

  return {
    retentionPct: effectiveRetention * 100,
    rawTrafficTbps: tb,
    rawExabytesYear: eb,
    ecoTrafficTbps: tbE,
    ecoExabytesYear: ebE,
    rawCloudFlopsPflops: pf,
    ecoCloudFlopsPflops: pfE,
    cloudFacilityEnergyGwh: fac,
    ecoFacilityEnergyGwh: facE,
    edgeNodeEnergyGwh: edgeEnergy,
    netEnergySavedGwh: netEnergySaved,
    netCo2AvoidedTonnes: co2Avoided,
    coolingWaterAvoidedMillionL: waterAvoided,
    tableRows,
    summaryText,
  };
}
