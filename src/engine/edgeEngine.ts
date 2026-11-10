import { StreamState, TelemetryData } from '../types';

export interface EdgeEngineOptions {
  analysisWidth?: number;
  analysisHeight?: number;
  activityThreshold?: number; // e.g. 0.005 (0.5% pixels)
  lumaThreshold?: number;     // e.g. 20 brightness diff
  hysteresisFrames?: number;  // e.g. 15 frames
  heartbeatInterval?: number; // e.g. 45 frames (~3s at 15fps)
  roiPaddingPct?: number;     // e.g. 0.10 (10%)
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

  // Options (public & tunable in real-time)
  public activityThreshold: number;
  public lumaThreshold: number;
  public hysteresisFrames: number;
  public heartbeatInterval: number;
  public roiPaddingPct: number;

  private cumulativeRawBytes: number = 0;
  private cumulativeSentBytes: number = 0;

  // Cached block grid
  private lastBlockGrid: number[] = [];

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
    this.lastBlockGrid = [];
    this.bgModel.fill(0);
  }

  /**
   * Get an ImageData representation of the learned background model (Stage 1 view).
   */
  public getBackgroundModelImageData(ctx: CanvasRenderingContext2D): ImageData {
    const imgData = ctx.createImageData(this.w, this.h);
    const data = imgData.data;
    const len = this.w * this.h;
    for (let p = 0, i = 0; p < len; p++, i += 4) {
      const val = Math.min(255, Math.max(0, Math.round(this.bgModel[p])));
      data[i] = val;
      data[i + 1] = val;
      data[i + 2] = val;
      data[i + 3] = 255;
    }
    return imgData;
  }

  /**
   * Process a downscaled ImageData buffer through the 4 stages.
   */
  public processFrame(
    analysisImageData: ImageData,
    nativeWidth: number,
    nativeHeight: number,
    maskCanvasContext?: CanvasRenderingContext2D
  ): TelemetryData {
    const startTime = performance.now();
    this.frameCount++;
    this.framesSinceSent++;
    const data = analysisImageData.data;
    const len = this.w * this.h;

    // Stage 1: Running Average Background Subtraction & Block Clustering
    let activePixels = 0;
    const blockSize = 8;
    const gridCols = Math.floor(this.w / blockSize); // 16 cols
    const gridRows = Math.floor(this.h / blockSize); // 9 rows
    const totalBlocks = gridCols * gridRows;
    const blockCounts = new Uint16Array(totalBlocks);

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
          maskData.data[i + 3] = 230; // Alpha
        }
      } else if (maskData) {
        // Dark translucent backdrop for background
        maskData.data[i] = 11;
        maskData.data[i + 1] = 19;
        maskData.data[i + 2] = 24;
        maskData.data[i + 3] = 160;
      }

      // Adaptive background model update:
      // Slower rate for moving objects (0.002), faster for static scene (0.035)
      const alpha = isForeground ? 0.002 : 0.035;
      this.bgModel[p] += alpha * (luma - this.bgModel[p]);
    }

    if (maskCanvasContext && maskData) {
      maskCanvasContext.putImageData(maskData, 0, 0);
    }

    this.isInitialized = true;
    const activityRatio = activePixels / len;

    // Find bounding box from active blocks
    let minBx = gridCols, maxBx = -1, minBy = gridRows, maxBy = -1;
    let activeBlockCount = 0;
    const minPixelsPerBlock = 5;
    const blockGrid: number[] = new Array(totalBlocks);

    for (let by = 0; by < gridRows; by++) {
      for (let bx = 0; bx < gridCols; bx++) {
        const idx = by * gridCols + bx;
        const count = blockCounts[idx];
        const isActive = count >= minPixelsPerBlock;
        blockGrid[idx] = isActive ? 1 : 0;

        if (isActive) {
          activeBlockCount++;
          if (bx < minBx) minBx = bx;
          if (bx > maxBx) maxBx = bx;
          if (by < minBy) minBy = by;
          if (by > maxBy) maxBy = by;
        }
      }
    }

    this.lastBlockGrid = blockGrid;

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

    // Baseline uncompressed reference:
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
        const pMinX = minBx * blockSize;
        const pMinY = minBy * blockSize;
        const pMaxX = Math.min(this.w, (maxBx + 1) * blockSize);
        const pMaxY = Math.min(this.h, (maxBy + 1) * blockSize);

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

        // Temporal EMA Smoothing
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

        sentBytes = Math.round(baselineBytesPerFrame * (roiAreaRatio + 0.005));
      } else if (this.smoothRoiBox) {
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
      sentBytes = Math.round(baselineBytesPerFrame * 0.06);
      roiBox = [0, 0, nativeWidth, nativeHeight];
    } else {
      this.smoothRoiBox = null;
      sentBytes = 48; // IDLE metadata ping
      roiBox = null;
    }

    const savedBytes = Math.max(0, rawBytes - sentBytes);
    this.cumulativeRawBytes += rawBytes;
    this.cumulativeSentBytes += sentBytes;

    const compressionRatioPct = rawBytes > 0 
      ? ((rawBytes - sentBytes) / rawBytes) * 100 
      : 0;

    const currentKbps = Math.round((sentBytes * 8 * 15) / 1000);
    const baselineKbps = 4000;

    const cumulativeSavedBytes = Math.max(0, this.cumulativeRawBytes - this.cumulativeSentBytes);
    const savedGb = cumulativeSavedBytes / 1e9;
    
    // 50 GFLOP/frame inference = 0.5 J per frame in cloud inference
    const cumulativeEnergySavedWh = (savedGb * 50) + (this.frameCount - this.sentFrames) * (0.5 / 3600);
    const cumulativeCo2AvoidedGrams = cumulativeEnergySavedWh * 0.45;
    const cumulativeWaterSavedMl = cumulativeEnergySavedWh * 0.5;

    // Stage 4: Generate simulated MobileNet quantized int8 embedding
    const sampleSeed = (this.frameCount * 13) % 256;
    const embeddingPreview: number[] = [];
    for (let e = 0; e < 12; e++) {
      const v = ((sampleSeed * (e + 3) + 37) % 256) - 128;
      embeddingPreview.push(v);
    }

    const latencyMs = Math.round((performance.now() - startTime) * 100) / 100;
    // Edge RAM footprint estimate (~138 KB): bgModel (36.8KB) + analysis buffers (36.8KB) + model weights (64KB)
    const hardwareMemoryKb = 138;

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
        label: activityRatio > 0.15 ? 'Vehicle / Forklift' : 'Pedestrian / Target',
        confidence: Math.min(0.98, Math.round((activityRatio * 2 + 0.75) * 100) / 100),
        box: roiBox ?? undefined,
      }] : [],
      totalCapturedFrames: this.frameCount,
      totalSentFrames: this.sentFrames,
      cumulativeRawBytes: this.cumulativeRawBytes,
      cumulativeSentBytes: this.cumulativeSentBytes,
      cumulativeEnergySavedWh: Math.round(cumulativeEnergySavedWh * 10) / 10,
      cumulativeCo2AvoidedGrams: Math.round(cumulativeCo2AvoidedGrams * 10) / 10,
      cumulativeWaterSavedMl: Math.round(cumulativeWaterSavedMl * 10) / 10,
      latencyMs,
      embeddingPreview,
      activeBlockCount,
      totalBlocks,
      activeBlockGrid: this.lastBlockGrid,
      hardwareMemoryKb
    };
  }
}
