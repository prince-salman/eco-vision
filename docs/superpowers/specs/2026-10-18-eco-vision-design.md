# Eco-Vision Architecture: Full-Stack Edge & Web System Design Specification

- **Date:** 2026-10-18
- **Project:** Eco-Vision Architecture (Interactive Prototype & Python Edge Worker)
- **Origin:** 7th International Youth Summit (IYS) Essay Competition, Technology Sub-Theme
- **Institution:** President University
- **Team:** Firza Miftahul Ilmi (Leader), Muhamad Salman, Immanuel Elvando Kenjam, Citra Ayu Setyoningputri

---

## 1. Executive Summary & Objective

The goal of this project is to turn the theoretical framework and initial prototype of **Eco-Vision Architecture** into a fully functional, usable dual-engine software system:
1. **Python Edge Worker (`edge_worker.py`)**: A production-ready Python edge computer vision pipeline running OpenCV and lightweight ML, capturing real video/webcams, executing local 4-stage pre-processing, and streaming telemetry + ROI crops over WebSockets.
2. **Eco-Vision Web Dashboard & In-Browser Engine (`eco-vision-web`)**: A modern, high-aesthetic React 19 + Vite + Tailwind CSS web application that can either:
   - Run entirely in-browser using HTML5 Canvas pixel analysis and TensorFlow.js COCO-SSD for instant zero-install testing with webcams or video uploads.
   - Connect live to the Python Edge Worker over WebSocket (`ws://localhost:8765`) to receive real-time streams and live telemetry.
3. **Macro Resource Impact Calculator & Paper Showcase**: Direct implementation of the mathematical model from Section 3.3 of the essay, scaling from 1 camera up to 5,000,000 cameras to measure upstream bandwidth, cloud inference FLOPs, electrical energy (GWh), cooling water (L), and carbon avoidance ($t\text{ CO}_2$).

---

## 2. System Architecture

```
                                  [Video Source]
                                         │
                 ┌───────────────────────┴───────────────────────┐
                 ▼                                               ▼
     [Mode 1: Python Edge Worker]                    [Mode 2: In-Browser Web Engine]
     (OpenCV + NumPy + WebSockets)                   (HTML5 Canvas + TensorFlow.js)
                 │                                               │
                 ├─ Stage 1: Background Subtraction              ├─ Stage 1: Running Average Background
                 ├─ Stage 2: Adaptive Frame Skipping             ├─ Stage 2: Adaptive Activity Throttling
                 ├─ Stage 3: ROI Bounding Box Crop               ├─ Stage 3: Connected Component Bounding Box
                 └─ Stage 4: MobileNet Object Detect             └─ Stage 4: TF.js MobileNet ROI Inference
                 │                                               │
                 ▼ (WebSocket ws://localhost:8765)               ▼
                 └───────────────────────┬───────────────────────┘
                                         ▼
                        [Eco-Vision Web Dashboard]
               ├── Live Dual-View Stream Comparison (Raw vs Eco)
               ├── Real-Time Telemetry Counters (Bytes, FPS, Savings)
               ├── Live Bandwidth Timeline Graph
               ├── Section 3.3 Macro Simulator (6 Sliders + Model Table)
               ├── Interactive 4-Stage Architecture Explainer
               └── IYS Essay & President University Team Modal
```

---

## 3. Detailed Component Specifications

### 3.1 Python Edge Worker (`edge/edge_worker.py`)
- **Language / Runtime:** Python 3.10+
- **Key Dependencies:** `opencv-python`, `numpy`, `websockets`, `asyncio`, `pillow`
- **Modules:**
  - `VideoIngest`: Captures from default camera index (0) or path to video file (`--video path.mp4`).
  - `BackgroundSubtractor`: Uses `cv2.createBackgroundSubtractorMOG2(history=500, varThreshold=25, detectShadows=False)` or adaptive running Gaussian to produce a binary foreground mask.
  - `ActivityScorer`: Computes the ratio of foreground pixels to total frame pixels (`active_ratio`).
    - State `IDLE` when `active_ratio < 0.015`. Skips transmission except for a heartbeat keyframe every 3.0 seconds (45 frames at 15 FPS).
    - State `ACTIVE` when `active_ratio >= 0.015`. Engages full transmission rate with a hysteresis window of 15 frames after motion stops.
  - `RoiExtractor`: Uses `cv2.findContours` on the dilated mask to identify active bounding boxes, merges overlapping regions, adds a 10% safety margin padding, and crops the ROI from the native resolution frame.
  - `LightweightDetector`: Uses OpenCV DNN with MobileNet-SSD or Haar cascades to identify class labels (`person`, `car`, `bicycle`, etc.) inside the cropped ROI.
  - `WebSocketServer`: Listens on `0.0.0.0:8765`. Broadcasts JSON telemetry packets and JPEG Base64 encoded ROI images to connected web clients.

### 3.2 In-Browser Computer Vision Engine (`src/engine/`)
- **Direct Canvas Pixel Processing:**
  - 96x54 downscaled motion detection buffer for ultra-low latency background modeling.
  - Per-pixel running background estimation: `bg[p] += alpha * (luma - bg[p])`.
  - Morphological noise cleaning and bounding box computation.
- **On-Device Machine Learning:**
  - Integrates TensorFlow.js COCO-SSD (MobileNet v2 int8).
  - Inference is evaluated **exclusively on the cropped ROI bounding box**, never on the full frame, validating the FLOPs reduction thesis of the paper.

### 3.3 Web Dashboard UI (`src/components/`)
- **Hero & Stream Panel:**
  - Dual canvas viewer with live side-by-side comparison:
    - Left: Raw Camera Feed (simulated full 1080p, 4 Mbps uncompressed cloud ingest).
    - Right: Eco-Vision Edge Feed (adaptive mask, high-contrast ROI box, object tags, heartbeat indicator).
  - Stream Status Pill: `Active: Sending ROI crop`, `Heartbeat Keyframe`, or `Idle: Skipping frames`.
- **Live Telemetry Bar:**
  - Transmitted Bytes vs Baseline Bytes.
  - Real-time Bandwidth (Kbps vs 4,000 Kbps baseline).
  - Live Data Reduction % (typically 85% - 95%).
  - Live Energy Saved (Wh / kWh accumulated).
  - Live CO₂ Avoided (grams / kg).
  - Live Cooling Water Saved (mL / L).
- **Macro Analytical Model Simulator (Section 3.3):**
  - Sliders:
    1. Cameras ($N$): 10,000 to 5,000,000 (default: 1,000,000)
    2. Scene Activity Share ($a$): 5% to 80% (default: 20%)
    3. ROI Share of Active Frame ($r$): 10% to 100% (default: 50%)
    4. Edge Node Power: 0.5 W to 5.0 W (default: 2.0 W)
    5. Data Center PUE: 1.10 to 2.00 (default: 1.40)
    6. Grid Carbon Intensity: 0.10 to 0.90 kg/kWh (default: 0.45 kg/kWh)
  - Calculations matching Section 3.3 of the essay:
    - Upstream traffic: $N \times 4\text{ Mbps} / 10^{12} \text{ Tbps}$; Eco traffic: $\text{Base} \times (a \cdot r + 0.005)$.
    - Cloud inference: $N \times 15\text{ fps} \times 50\text{ GFLOP} / 10^6 \text{ PFLOP/s}$; Eco inference: $\text{Base} \times (a \cdot r)$.
    - Facility energy: $\text{IT\_Energy} \times \text{PUE}$.
    - Edge node energy: $N \times \text{EdgePower} \times 8760 / 10^9 \text{ GWh}$.
    - Net energy saved: $\text{FacilitySaved} - \text{EdgeEnergy}$.
    - Net $\text{CO}_2$ avoided: $\text{NetSaved} \times \text{GridIntensity} \times 1000 \text{ tonnes}$.
    - Cooling water avoided: $(\text{CloudIT}_{\text{saved}}) \times 0.5 \text{ L/kWh}$.
- **Interactive 4-Stage Architecture Explainer:**
  - Interactive cards explaining:
    1. Background Subtraction
    2. Adaptive Frame Skipping (Hysteresis & Heartbeat)
    3. ROI Cropping
    4. Lightweight Edge Feature Extraction
- **IYS Essay & Team Modal:**
  - Complete paper text reader, references (IEA, Patterson, Luccioni, Malmodin, Li, Wu, Hu, Lin), and President University team credits.

---

## 4. Verification & Testing Plan
- [ ] Test Python edge worker connects to webcam/video file and starts WebSocket server on port 8765.
- [ ] Test React app builds cleanly with Vite without TypeScript or linter errors.
- [ ] Test Webcam ingest in browser via `getUserMedia()`.
- [ ] Test sample video playback and drag-and-drop video upload.
- [ ] Test real-time background subtraction and bounding box extraction.
- [ ] Test WebSocket connection from Web Dashboard to Python worker with real-time telemetry streaming.
- [ ] Test Section 3.3 macro model calculations against known essay values (e.g. 1M cameras = 4 Tbps raw, ~810 GWh net energy saved, ~364,000 t CO₂ avoided).

---
