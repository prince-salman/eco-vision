# Eco-Vision Architecture Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a complete, functional, dual-engine prototype for **Eco-Vision Architecture** consisting of a standalone Python Edge Worker (OpenCV + WebSockets) and a high-aesthetic React 19 + Vite web dashboard featuring in-browser computer vision, live webcam/video upload, live telemetry, and Section 3.3 macro resource impact simulator.

**Architecture:** A hybrid edge-to-web ecosystem where video is either processed directly in-browser via an HTML5 Canvas CV engine or ingested via an external Python edge worker streaming over WebSocket (`ws://localhost:8765`). The Web Dashboard renders side-by-side comparative streams (Raw 1080p vs Eco-Vision Edge), real-time bandwidth and carbon/water savings counters, interactive 4-stage pipeline visualizations, and macro-scale analytical models.

**Tech Stack:** 
- Python: Python 3.10+, OpenCV (`cv2`), NumPy, WebSockets, asyncio
- Frontend: React 19, TypeScript, Vite, Tailwind CSS, Lucide React, HTML5 Canvas Context2D
- Testing: Pytest (Python), Vitest / TypeScript type-checks (Frontend)

**Spec:** `C:\Users\Salman\.gemini\antigravity\scratch\eco-vision\docs\superpowers\specs\2026-10-18-eco-vision-design.md`

## Global Constraints
- Target directory: `C:\Users\Salman\.gemini\antigravity\scratch\eco-vision`
- Python worker WebSocket port: `8765`
- Section 3.3 Baseline: 1080p stream = 4 Mbps, 15 fps, 50 GFLOP/frame cloud inference, 10 pJ/FLOP, 0.5% metadata overhead, 0.5 L water per IT kWh
- Color palette: Eco-Vision Slate/Teal theme (Background `#0E181E`, Panels `#16252D`, Keep/Accent `#4CC3CC`, Good/Green `#5FD3A6`, Drop/Amber `#E3A24C`, Ink `#E4EDF0`)

---

### Task 1: Python Edge Worker Core & Test Suite

**Files:**
- Create: `edge/requirements.txt`
- Create: `edge/edge_worker.py`
- Create: `edge/test_edge_worker.py`

**Interfaces:**
- Produces:
  - Class `EcoVisionPipeline`: `process_frame(frame: np.ndarray) -> dict` returning `state` ('ACTIVE'|'IDLE'|'HEARTBEAT'), `activity_score`, `roi_box`, `raw_bytes`, `sent_bytes`, `roi_b64`.
  - Server `run_server(host='0.0.0.0', port=8765, video_source=0)` streaming JSON + JPEG ROI over WebSocket.

- [ ] **Step 1: Create `edge/requirements.txt`**
```txt
opencv-python>=4.8.0
numpy>=1.24.0
websockets>=12.0
```

- [ ] **Step 2: Write the failing test `edge/test_edge_worker.py`**
```python
import numpy as np
import pytest
from edge_worker import EcoVisionPipeline

def test_pipeline_idle_on_static_scene():
    pipeline = EcoVisionPipeline(min_activity_ratio=0.015, heartbeat_interval=45)
    static_frame = np.full((480, 640, 3), 128, dtype=np.uint8)
    
    # Warm up background model with 10 identical frames
    for _ in range(10):
        res = pipeline.process_frame(static_frame)
    
    assert res["state"] in ["IDLE", "HEARTBEAT"]
    assert res["sent_bytes"] < res["raw_bytes"]

def test_pipeline_active_on_motion():
    pipeline = EcoVisionPipeline(min_activity_ratio=0.015)
    frame1 = np.zeros((480, 640, 3), dtype=np.uint8)
    for _ in range(10):
        pipeline.process_frame(frame1)
    
    # Introduce moving white square
    frame2 = np.zeros((480, 640, 3), dtype=np.uint8)
    frame2[100:300, 100:300] = 255
    res = pipeline.process_frame(frame2)
    
    assert res["state"] == "ACTIVE"
    assert res["roi_box"] is not None
```

- [ ] **Step 3: Run test to verify it fails**
Run: `python -m pytest edge/test_edge_worker.py`
Expected: FAIL (ModuleNotFoundError: No module named 'edge_worker')

- [ ] **Step 4: Implement `edge/edge_worker.py`**
Implement `EcoVisionPipeline` with:
- Background subtraction via MOG2 or adaptive running mean.
- Adaptive activity scoring and hysteresis window.
- Contours & bounding box ROI extraction with safety padding.
- Base64 JPEG encoding for the cropped ROI.
- WebSocket server `run_server()`.

- [ ] **Step 5: Run tests to verify they pass**
Run: `python -m pytest edge/test_edge_worker.py`
Expected: PASS

---

### Task 2: React + Vite + Tailwind CSS Project Setup & TypeScript Types

**Files:**
- Create: `package.json`
- Create: `vite.config.ts`
- Create: `tsconfig.json`
- Create: `index.html`
- Create: `src/types/index.ts`
- Create: `src/index.css`

**Interfaces:**
- Produces:
  - `TelemetryData`: `{ sentFrames: number, totalFrames: number, sentBytes: number, totalBytes: number, currentKbps: number, savedEnergyWh: number, savedCo2Grams: number, savedWaterMl: number, state: 'ACTIVE' | 'IDLE' | 'HEARTBEAT' }`
  - `MacroParams`: `{ cams: number, act: number, roi: number, edge: number, pue: number, grid: number }`

- [ ] **Step 1: Initialize Vite React TypeScript project configuration**
- [ ] **Step 2: Configure Tailwind CSS v4/v3 with Eco-Vision design tokens**
- [ ] **Step 3: Define TypeScript contracts in `src/types/index.ts`**
- [ ] **Step 4: Verify build with `npm run build`**

---

### Task 3: In-Browser Edge CV Engine & Macro Model Logic

**Files:**
- Create: `src/engine/macroModel.ts`
- Create: `src/engine/macroModel.test.ts`
- Create: `src/engine/edgeEngine.ts`

**Interfaces:**
- Consumes: `MacroParams`, `TelemetryData`
- Produces:
  - `calculateMacroImpact(params: MacroParams): MacroImpactResult`
  - `BrowserEdgePipeline`: Canvas processing class maintaining running background model, foreground mask, activity metric, and ROI bounding box calculation.

- [ ] **Step 1: Write test `src/engine/macroModel.test.ts` for Section 3.3 equations**
```typescript
import { describe, it, expect } from 'vitest';
import { calculateMacroImpact, DEFAULT_MACRO_PARAMS } from './macroModel';

describe('Macro Model Section 3.3', () => {
  it('correctly calculates baseline 1M cameras at default parameters', () => {
    const result = calculateMacroImpact(DEFAULT_MACRO_PARAMS);
    expect(result.rawTrafficTbps).toBeCloseTo(4.0, 1);
    expect(result.netEnergySavedGwh).toBeGreaterThan(700);
    expect(result.netCo2AvoidedTonnes).toBeGreaterThan(300000);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**
Run: `npx vitest run src/engine/macroModel.test.ts`
Expected: FAIL

- [ ] **Step 3: Implement `src/engine/macroModel.ts`**
Implement the analytical equations:
- $N \times 4\text{ Mbps}$ baseline
- Traffic reduction: $\text{Base} \times (a \cdot r + 0.005)$
- Cloud FLOPs reduction: $\text{Base} \times (a \cdot r)$
- Net energy saved, $\text{CO}_2$ avoided, and cooling water avoided.

- [ ] **Step 4: Run test to verify it passes**
Run: `npx vitest run src/engine/macroModel.test.ts`
Expected: PASS

- [ ] **Step 5: Implement `src/engine/edgeEngine.ts`**
Implement pixel-level canvas processing for running average background subtraction, frame activity calculation, hysteresis counter, and bounding box determination.

---

### Task 4: WebSocket Hook & Video Feed Input Manager

**Files:**
- Create: `src/hooks/useEdgeWebSocket.ts`
- Create: `src/hooks/useVideoFeed.ts`

**Interfaces:**
- Produces:
  - `useEdgeWebSocket(url: string)`: `{ isConnected, lastPacket, connect, disconnect }`
  - `useVideoFeed()`: `{ videoRef, sourceMode, setSourceMode, startWebcam, stopWebcam, loadVideoFile, availableSampleVideos }`

- [ ] **Step 1: Implement `useEdgeWebSocket.ts` with auto-reconnect and state synchronization**
- [ ] **Step 2: Implement `useVideoFeed.ts` managing Webcam permissions, sample surveillance clips, and drag-and-drop file uploads**

---

### Task 5: Dual-View Stream Viewer & Real-Time Telemetry Dashboard

**Files:**
- Create: `src/components/StreamViewer.tsx`
- Create: `src/components/TelemetryBar.tsx`
- Create: `src/components/BandwidthChart.tsx`

**Interfaces:**
- Consumes: `useVideoFeed`, `useEdgeWebSocket`, `BrowserEdgePipeline`
- Produces:
  - Interactive video canvas side-by-side (Raw Stream vs Eco-Vision Mask & ROI Bounding Box)
  - Real-time HUD showing "ACTIVE: Sending ROI Crop", "HEARTBEAT", or "IDLE: Skipping frames"
  - Telemetry HUD with live counters for Bandwidth, Energy, $\text{CO}_2$, and Water.

- [ ] **Step 1: Build `StreamViewer.tsx` with dual canvas synchronization and SVG bounding box overlay**
- [ ] **Step 2: Build `TelemetryBar.tsx` with animated counters and metric pills**
- [ ] **Step 3: Build `BandwidthChart.tsx` with smooth canvas/SVG line chart comparing 4 Mbps baseline vs live Eco-Vision bandwidth**

---

### Task 6: Macro Analytical Simulator & Interactive 4-Stage Architecture Explainer

**Files:**
- Create: `src/components/MacroSimulator.tsx`
- Create: `src/components/ArchitectureStages.tsx`

**Interfaces:**
- Consumes: `calculateMacroImpact`, `MacroParams`
- Produces:
  - 6 slider interactive scenario simulator with annual savings summary & comparison table.
  - Interactive walkthrough of the 4 pipeline stages (Background Subtraction, Adaptive Frame Skipping, ROI Cropping, Edge Feature Extraction).

- [ ] **Step 1: Implement `MacroSimulator.tsx` with formatted sliders and live data table**
- [ ] **Step 2: Implement `ArchitectureStages.tsx` with visual diagrams, formulas, and expandable explanations**

---

### Task 7: Navigation, Essay Reader Modal & Team Showcase

**Files:**
- Create: `src/components/Navbar.tsx`
- Create: `src/components/EssayModal.tsx`
- Create: `src/components/TeamCard.tsx`
- Modify: `src/App.tsx`

**Interfaces:**
- Produces:
  - Top navigation with source mode selector (Webcam / Sample Video / Upload / Python Live)
  - Full modal viewer containing the text of the 7th IYS Essay
  - Team credits card highlighting President University and team members

- [ ] **Step 1: Build `Navbar.tsx` with status indicators and mode switcher**
- [ ] **Step 2: Build `EssayModal.tsx` with Diátaxis-clean typography and bibliographic references**
- [ ] **Step 3: Assemble everything in `src/App.tsx`**

---

### Task 8: Verification, Standalone Scripts & End-to-End Testing

**Files:**
- Create: `run_eco_vision.bat`
- Create: `README.md`

- [ ] **Step 1: Run frontend build `npm run build` to verify zero type or build errors**
- [ ] **Step 2: Test Python edge worker execution with simulated webcam/video**
- [ ] **Step 3: Test live WebSocket streaming from Python worker to React Web App**
- [ ] **Step 4: Create convenient Windows one-click start script `run_eco_vision.bat`**
- [ ] **Step 5: Write comprehensive `README.md` with execution and demo instructions**

---
