# Eco-Vision Architecture: Full-Stack Edge & Web System

> **7th International Youth Summit (IYS) Essay Competition**  
> **Main Theme:** Bridging Ideas and Youth Creativity to Shape Solutions for Tomorrow's Challenges  
> **Sub-Theme:** Technology  
> **Institution:** President University  
> **Authors:** Firza Miftahul Ilmi (Team Leader), Muhamad Salman, Immanuel Elvando Kenjam, Citra Ayu Setyoningputri

---

## 🌟 Executive Summary

One camera streaming 1080p video at 4 Mbps generates ~43 GB every day. Multiplied across 1,000,000 cameras, this unthrottled traffic floods networks with 4 Tbps (~16 Exabytes/year), consuming hundreds of GWh in data center power and millions of liters of evaporative cooling water—mostly to transmit and process empty rooms.

**Eco-Vision Architecture** introduces a paradigm shift: **Decide at the camera lens what is worth sending.** By running lightweight temporal filtering, adaptive frame skipping, and ROI cropping on edge silicon, Eco-Vision cuts upstream network traffic, cloud inference load, and cooling water consumption by **~90%** while protecting institutional detection accuracy through recall-first tuning.

---

## 🚀 Quickstart Guide

### Option A: One-Click Windows Launch
Double-click `run_eco_vision.bat` in this directory. It will automatically:
1. Start the Python Edge Worker on `ws://localhost:8765`.
2. Start the Vite React development server on `http://localhost:5173`.
3. Open your default web browser to the dashboard.

### Option B: Manual Terminal Execution

#### 1. Run the Web Dashboard
```bash
# In this directory:
npm install
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser. You can immediately test:
- **Sample Footage:** Simulated surveillance loading dock with moving delivery carts.
- **Live Webcam:** Real-time in-browser edge computer vision via your webcam.
- **Upload Video:** Drag-and-drop any `.mp4` or `.webm` security footage.

#### 2. Run the Python Edge Worker (Optional for external feeds)
```bash
# In a separate terminal:
pip install -r edge/requirements.txt
python edge/edge_worker.py --source 0 --port 8765
```
Switch the Web Dashboard to **"Python Edge (Live)"** mode to view the real-time WebSocket stream!

---

## 🧩 The 4-Stage Eco-Vision Pipeline

| Stage | Mechanism | Mathematical Formulation | Function |
|---|---|---|---|
| **01. Background Subtraction** | Adaptive running statistical model | $B_t(x, y) = (1 - \alpha) B_{t-1}(x,y) + \alpha I_t(x,y)$ | Absorbs lighting drift (dawn, shadows) and camera sensor noise without false triggers. |
| **02. Adaptive Frame Skipping** | Activity scoring & hysteresis | $\text{Activity} = \frac{\sum \text{Foreground}}{\text{Total Pixels}}$ | Drops idle frame transmission to near-zero with periodic 3s heartbeat keyframes; ramps up to 30fps upon motion. |
| **03. ROI Cropping** | Connected component contours | $\text{ROI} = [x_{min}-p, y_{min}-p, w+2p, h+2p]$ | Crops only the active bounding box at native 1080p resolution, discarding static walls and empty space. |
| **04. Feature Extraction** | Quantized Edge TPU MobileNet | JSON Metadata (~200 B) + ROI Crop | Extracts class labels, confidence scores, and embeddings. Tuned for 100% recall with cloud arbitration. |

---

## 📊 Section 3.3 Resource Model Validation

For a fleet of **1,000,000 cameras** at baseline default assumptions (20% activity, 50% ROI area, 2.0 W edge power, 1.4 PUE, 0.45 kg/kWh grid intensity):

- **Upstream Traffic:** Reduced from **4.00 Tbps (15.8 EB/year)** to **0.42 Tbps (1.66 EB/year)** (**−89.5%**).
- **Cloud Inference:** Reduced from **750 PFLOP/s** to **75 PFLOP/s** (**−90.0%**).
- **Facility Energy:** Reduced from **92.0 GWh** to **9.2 GWh** (**−82.8 GWh saved**).
- **Edge Node Consumption:** **+17.5 GWh/year**.
- **Net Electrical Energy Saved:** **65.3 GWh/year** (Net positive even after paying for edge nodes).
- **Net CO₂ Emissions Avoided:** **~29,368 tonnes CO₂/year**.
- **On-Site Cooling Water Saved:** **~29.6 million Liters/year**.

---

## 🧪 Testing & Verification

Run the automated test suites for both frontend and backend:

```bash
# Python Edge Worker Unit Tests
python -m pytest edge/test_edge_worker.py -v

# Analytical Model Unit Tests
npm run test
```

---

## 🏛️ Team & Acknowledgements

Created for the **7th International Youth Summit (IYS) Essay Competition** by students of **President University**:
- **Firza Miftahul Ilmi** — *Team Leader (Architectural Concept & Research Formulation)*
- **Muhamad Salman** — *Team Member (Edge Computer Vision & Full-Stack Prototyping)*
- **Immanuel Elvando Kenjam** — *Team Member (Resource Impact Modeling & Analytical Calculations)*
- **Citra Ayu Setyoningputri** — *Team Member (Environmental Policy & Lifecycle Assessment)*
