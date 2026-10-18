import { StreamState, TelemetryData } from '../types';

export interface EdgeEngineOptions {
  analysisWidth?: number;
  analysisHeight?: number;
  activityThreshold?: number; // e.g. 0.015 (1.5% pixels)
  lumaThreshold?: number;     // e.g. 26 brightness diff
  hysteresisFrames?: number;  // e.g. 15 frames
  heartbeatInterval?: number; // e.g. 45 frames (~3s at 15fps)
  roiPaddingPct?: number;     // e.g. 0.12 (12%)
}

export class BrowserEdgePipeline {
  private w: number;
  private h: number;
  private bgModel: Float32Array;
  private isInitialized: boolean = false;
  private frameCount: number = 0;
  private sentFrames: number = 0;
  private framesSinceSent: number = 0;
  private hysteresisCountdown: number = 0;
  private lastValidRoiBox: [number, number, number, number] | null = null;

  private smoothRoiBox: [number, number, number, number] | null = null;

  // Options
  public activityThreshold: number;
  public lumaThreshold: number;
  public hysteresisFrames: number;
  public heartbeatInterval: number;
  public roiPaddingPct: number;

  private cumulativeRawBytes: number = 0;
  private cumulativeSentBytes: number = 0;

  constructor(options: EdgeEngineOptions = {}) {
    this.w = options.analysisWidth ?? 128;
    this.h = options.analysisHeight ?? 72;
    this.activityThreshold = options.activityThreshold ?? 0.005;
    this.lumaThreshold = options.lumaThreshold ?? 20;
    this.hysteresisFrames = options.hysteresisFrames ?? 15;
    this.heartbeatInterval = options.heartbeatInterval ?? 45;
    this.roiPaddingPct = options.roiPaddingPct ?? 0.10;

    this.bgModel = new Float32Array(this.w * this.h);
  }

  public reset(): void {
    this.isInitialized = false;
    this.frameCount = 0;
    this.sentFrames = 0;
    this.framesSinceSent = 0;
    this.hysteresisCountdown = 0;
    this.cumulativeRawBytes = 0;
    this.cumulativeSentBytes = 0;
    this.smoothRoiBox = null;
    this.lastValidRoiBox = null;
    this.bgModel.fill(0);
  }

  /**
   * Process a downscaled ImageData buffer through the 4 stages.
   * nativeWidth & nativeHeight represent original video resolution (e.g. 1920x1080).
   */
  public processFrame(
    analysisImageData: ImageData,
    nativeWidth: number,
    nativeHeight: number,
    maskCanvasContext?: CanvasRenderingContext2D
  ): TelemetryData {
    this.frameCount++;
    this.framesSinceSent++;
    const data = analysisImageData.data;
    const len = this.w * this.h;

    // Stage 1: Running Average Background Subtraction & Block Clustering (Noise Immune)
    let activePixels = 0;
    const blockSize = 8;
    const gridCols = Math.floor(this.w / blockSize); // 16 cols
    const gridRows = Math.floor(this.h / blockSize); // 9 rows
    const blockCounts = new Uint16Array(gridCols * gridRows);

    // Optional visualization mask
    const maskData = maskCanvasContext 
      ? maskCanvasContext.createImageData(this.w, this.h) 
      : null;

    for (let i = 0, p = 0; p < len; i += 4, p++) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const luma = 0.299 * r + 0.587 * g + 0.114 * b;

      if (!this.isInitialized) {
        this.bgModel[p] = luma;
      }

      const diff = Math.abs(luma - this.bgModel[p]);
      const isForeground = diff > this.lumaThreshold;

      if (isForeground) {
        activePixels++;
        const px = p % this.w;
        const py = Math.floor(p / this.w);
        const bx = Math.floor(px / blockSize);
        const by = Math.floor(py / blockSize);
        if (bx < gridCols && by < gridRows) {
          blockCounts[by * gridCols + bx]++;
        }

        if (maskData) {
          maskData.data[i] = 45;      // R (Teal tint)
          maskData.data[i + 1] = 212; // G
          maskData.data[i + 2] = 191; // B
          maskData.data[i + 3] = 220; // Alpha
        }
      } else if (maskData) {
        // Dark transparent backdrop for background
        maskData.data[i] = 11;
        maskData.data[i + 1] = 19;
        maskData.data[i + 2] = 24;
        maskData.data[i + 3] = 160;
      }

      // Adaptive background model update:
      // Slower learning rate for moving objects (0.002), faster for static scene (0.035)
      const alpha = isForeground ? 0.002 : 0.035;
      this.bgModel[p] += alpha * (luma - this.bgModel[p]);
    }

    if (maskCanvasContext && maskData) {
      maskCanvasContext.putImageData(maskData, 0, 0);
    }

    this.isInitialized = true;
    const activityRatio = activePixels / len;

    // Find bounding box from active blocks (filters out isolated sensor noise specks)
    let minBx = gridCols, maxBx = -1, minBy = gridRows, maxBy = -1;
    let activeBlockCount = 0;
    const minPixelsPerBlock = 5; // requires at least 5 active pixels in an 8x8 block

    for (let by = 0; by < gridRows; by++) {
      for (let bx = 0; bx < gridCols; bx++) {
        if (blockCounts[by * gridCols + bx] >= minPixelsPerBlock) {
          activeBlockCount++;
          if (bx < minBx) minBx = bx;
          if (bx > maxBx) maxBx = bx;
          if (by < minBy) minBy = by;
          if (by > maxBy) maxBy = by;
        }
      }
    }

    // Stage 2: Adaptive Frame Skipping with Hysteresis & Heartbeat
    const hasMotion = activeBlockCount > 0 && activityRatio >= this.activityThreshold;
    let state: StreamState = 'IDLE';

    if (hasMotion) {
      this.hysteresisCountdown = this.hysteresisFrames;
      state = 'ACTIVE';
    } else if (this.hysteresisCountdown > 0) {
      this.hysteresisCountdown--;
      state = 'ACTIVE';
    } else if (this.framesSinceSent >= this.heartbeatInterval) {
      state = 'HEARTBEAT';
    } else {
      state = 'IDLE';
    }

    // Baseline uncompressed/H.264 reference frame:
    // 1080p @ 4 Mbps, 15 fps = 4,000,000 / (8 * 15) = ~33,333 bytes/frame
    const baselineBytesPerFrame = Math.round((4e6) / (8 * 15));
    const rawBytes = baselineBytesPerFrame;
    let sentBytes = 0;
    let roiBox: [number, number, number, number] | null = null;

    if (state === 'ACTIVE') {
      this.sentFrames++;
      this.framesSinceSent = 0;

      // Stage 3: ROI Bounding Box Extraction with EMA Smoothing & Padding
      if (maxBx >= 0 && maxBy >= 0) {
        // Pixel coordinates in analysis frame
        const pMinX = minBx * blockSize;
        const pMinY = minBy * blockSize;
        const pMaxX = Math.min(this.w, (maxBx + 1) * blockSize);
        const pMaxY = Math.min(this.h, (maxBy + 1) * blockSize);

        // Scale to native video dimensions
        const scaleX = nativeWidth / this.w;
        const scaleY = nativeHeight / this.h;

        let natX0 = pMinX * scaleX;
        let natY0 = pMinY * scaleY;
        let natX1 = pMaxX * scaleX;
        let natY1 = pMaxY * scaleY;

        // Apply safety padding
        const padW = (natX1 - natX0) * this.roiPaddingPct;
        const padH = (natY1 - natY0) * this.roiPaddingPct;

        natX0 = Math.max(0, Math.floor(natX0 - padW));
        natY0 = Math.max(0, Math.floor(natY0 - padH));
        natX1 = Math.min(nativeWidth, Math.ceil(natX1 + padW));
        natY1 = Math.min(nativeHeight, Math.ceil(natY1 + padH));

        const targetW = natX1 - natX0;
        const targetH = natY1 - natY0;

        // Temporal EMA Smoothing (prevents jitter and flickering)
        if (this.smoothRoiBox === null) {
          this.smoothRoiBox = [natX0, natY0, targetW, targetH];
        } else {
          const smoothAlpha = 0.35;
          this.smoothRoiBox[0] += (natX0 - this.smoothRoiBox[0]) * smoothAlpha;
          this.smoothRoiBox[1] += (natY0 - this.smoothRoiBox[1]) * smoothAlpha;
          this.smoothRoiBox[2] += (targetW - this.smoothRoiBox[2]) * smoothAlpha;
          this.smoothRoiBox[3] += (targetH - this.smoothRoiBox[3]) * smoothAlpha;
        }

        const clampedX = Math.max(0, Math.min(nativeWidth - 30, Math.round(this.smoothRoiBox[0])));
        const clampedY = Math.max(0, Math.min(nativeHeight - 30, Math.round(this.smoothRoiBox[1])));
        const clampedW = Math.max(30, Math.min(nativeWidth - clampedX, Math.round(this.smoothRoiBox[2])));
        const clampedH = Math.max(30, Math.min(nativeHeight - clampedY, Math.round(this.smoothRoiBox[3])));

        roiBox = [clampedX, clampedY, clampedW, clampedH];
        this.lastValidRoiBox = roiBox;
        const roiAreaRatio = (clampedW * clampedH) / (nativeWidth * nativeHeight);

        // Sent bytes proportional to cropped ROI pixel area + 0.5% metadata
        sentBytes = Math.round(baselineBytesPerFrame * (roiAreaRatio + 0.005));
      } else if (this.smoothRoiBox) {
        // During hysteresis motion decay, hold the stabilized bounding box steady
        const clampedX = Math.max(0, Math.min(nativeWidth - 30, Math.round(this.smoothRoiBox[0])));
        const clampedY = Math.max(0, Math.min(nativeHeight - 30, Math.round(this.smoothRoiBox[1])));
        const clampedW = Math.max(30, Math.min(nativeWidth - clampedX, Math.round(this.smoothRoiBox[2])));
        const clampedH = Math.max(30, Math.min(nativeHeight - clampedY, Math.round(this.smoothRoiBox[3])));

        roiBox = [clampedX, clampedY, clampedW, clampedH];
        const roiAreaRatio = (clampedW * clampedH) / (nativeWidth * nativeHeight);
        sentBytes = Math.round(baselineBytesPerFrame * (roiAreaRatio + 0.005));
      } else if (this.lastValidRoiBox) {
        roiBox = this.lastValidRoiBox;
        const roiAreaRatio = (roiBox[2] * roiBox[3]) / (nativeWidth * nativeHeight);
        sentBytes = Math.round(baselineBytesPerFrame * (roiAreaRatio + 0.005));
      } else {
        roiBox = [0, 0, nativeWidth, nativeHeight];
        sentBytes = baselineBytesPerFrame;
      }
    } else if (state === 'HEARTBEAT') {
      this.smoothRoiBox = null;
      this.sentFrames++;
      this.framesSinceSent = 0;
      // Low-res heartbeat keyframe (1/16th pixels, ~6% bytes)
      sentBytes = Math.round(baselineBytesPerFrame * 0.06);
      roiBox = [0, 0, nativeWidth, nativeHeight];
    } else {
      this.smoothRoiBox = null;
      // IDLE: tiny metadata ping (~48 bytes)
      sentBytes = 48;
      roiBox = null;
    }

    const savedBytes = Math.max(0, rawBytes - sentBytes);
    this.cumulativeRawBytes += rawBytes;
    this.cumulativeSentBytes += sentBytes;

    const compressionRatioPct = rawBytes > 0 
      ? ((rawBytes - sentBytes) / rawBytes) * 100 
      : 0;

    // Real-time bitrates
    const currentKbps = Math.round((sentBytes * 8 * 15) / 1000);
    const baselineKbps = 4000;

    // Real-world cumulative savings translation:
    // Cumulative saved data -> kWh -> CO2 -> Water
    // 10 pJ per FLOP, 50 GFLOP/frame = 0.5 J per frame in cloud inference
    // + network transmission energy (~0.05 kWh per GB)
    const cumulativeSavedBytes = Math.max(0, this.cumulativeRawBytes - this.cumulativeSentBytes);
    const savedGb = cumulativeSavedBytes / 1e9;
    
    // Cloud IT + Network energy saved in Watt-hours
    const cumulativeEnergySavedWh = (savedGb * 50) + (this.frameCount - this.sentFrames) * (0.5 / 3600);
    // Grid carbon intensity ~0.45 kg CO2/kWh = 0.45 g/Wh
    const cumulativeCo2AvoidedGrams = cumulativeEnergySavedWh * 0.45;
    // On-site cooling water: 0.5 mL per Wh
    const cumulativeWaterSavedMl = cumulativeEnergySavedWh * 0.5;

    return {
      timestamp: Date.now(),
      frameId: this.frameCount,
      state,
      activityRatio: Math.round(activityRatio * 1000) / 1000,
      rawBytes,
      sentBytes,
      savedBytes,
      compressionRatioPct: Math.round(compressionRatioPct * 10) / 10,
      currentKbps,
      baselineKbps,
      roiBox,
      detections: hasMotion ? [{
        label: 'Motion Target',
        confidence: Math.min(0.98, Math.round((activityRatio * 4 + 0.6) * 100) / 100),
        box: roiBox ?? undefined,
      }] : [],
      totalCapturedFrames: this.frameCount,
      totalSentFrames: this.sentFrames,
      cumulativeRawBytes: this.cumulativeRawBytes,
      cumulativeSentBytes: this.cumulativeSentBytes,
      cumulativeEnergySavedWh: Math.round(cumulativeEnergySavedWh * 10) / 10,
      cumulativeCo2AvoidedGrams: Math.round(cumulativeCo2AvoidedGrams * 10) / 10,
      cumulativeWaterSavedMl: Math.round(cumulativeWaterSavedMl * 10) / 10,
    };
  }
}
