import { describe, it, expect } from 'vitest';
import { calculateMacroImpact, DEFAULT_MACRO_PARAMS } from './macroModel';

describe('Macro Model Section 3.3', () => {
  it('correctly calculates baseline 1M cameras at default parameters', () => {
    const result = calculateMacroImpact(DEFAULT_MACRO_PARAMS);

    // 1M cameras * 4 Mbps = 4.00 Tbps
    expect(result.rawTrafficTbps).toBeCloseTo(4.0, 2);

    // Eco-Vision retention: 20% activity * 50% ROI + 0.5% metadata = 10.5%
    expect(result.retentionPct).toBeCloseTo(10.5, 1);

    // Eco-Vision traffic: 4.0 * 0.105 = 0.42 Tbps (420 Gbps)
    expect(result.ecoTrafficTbps).toBeCloseTo(0.42, 2);

    // 1M cameras * 15 fps * 50 GFLOP = 750 PFLOP/s
    expect(result.rawCloudFlopsPflops).toBeCloseTo(750, 1);
    expect(result.ecoCloudFlopsPflops).toBeCloseTo(75, 1);

    // Cloud facility energy: 91.98 GWh vs 9.20 GWh => 82.78 GWh saved facility
    expect(result.cloudFacilityEnergyGwh).toBeCloseTo(92.0, 1);
    expect(result.ecoFacilityEnergyGwh).toBeCloseTo(9.2, 1);

    // Edge node energy: 1M * 2W * 8760h / 1e9 = 17.52 GWh
    expect(result.edgeNodeEnergyGwh).toBeCloseTo(17.5, 1);

    // Net energy saved: 82.78 - 17.52 = 65.26 GWh
    expect(result.netEnergySavedGwh).toBeCloseTo(65.3, 1);

    // Net CO2 avoided: 65.262 * 0.45 * 1000 = ~29,368 tonnes
    expect(result.netCo2AvoidedTonnes).toBeCloseTo(29368, 0);

    // Cooling water saved: (65.7 - 6.57) * 0.5 = ~29.57 million Liters
    expect(result.coolingWaterAvoidedMillionL).toBeCloseTo(29.6, 1);
  });

  it('handles custom camera scale properly', () => {
    const custom = { ...DEFAULT_MACRO_PARAMS, cams: 500000 };
    const result = calculateMacroImpact(custom);
    expect(result.rawTrafficTbps).toBeCloseTo(2.0, 2);
  });
});
