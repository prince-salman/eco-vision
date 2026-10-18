import cv2
import numpy as np
import base64
import json
import asyncio
import websockets
import argparse
import time
from typing import Dict, Any, Optional, Tuple, List

class EcoVisionPipeline:
    """
    Eco-Vision 4-Stage Edge Computer Vision Pre-Processing Pipeline:
      1. Background Subtraction (adaptive running statistical model)
      2. Adaptive Frame Skipping (hysteresis window + heartbeat keyframe)
      3. Region-of-Interest (ROI) Extraction & Cropping
      4. Lightweight Feature Tagging & Metadata Serialization
    """
    def __init__(
        self,
        min_activity_ratio: float = 0.015,
        hysteresis_frames: int = 10,
        heartbeat_interval: int = 45,
        roi_padding_pct: float = 0.10,
        subtractor_history: int = 300,
        var_threshold: float = 25.0,
        warmup_frames: int = 2
    ):
        self.min_activity_ratio = min_activity_ratio
        self.hysteresis_frames = hysteresis_frames
        self.heartbeat_interval = heartbeat_interval
        self.roi_padding_pct = roi_padding_pct
        self.warmup_frames = warmup_frames
        
        # Stage 1: Adaptive background subtractor
        self.subtractor = cv2.createBackgroundSubtractorMOG2(
            history=subtractor_history,
            varThreshold=var_threshold,
            detectShadows=False
        )
        
        # State tracking
        self.frame_count = 0
        self.frames_since_sent = 0
        self.hysteresis_countdown = 0
        self.last_state = "IDLE"
        self.kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (5, 5))
        self.smooth_box: Optional[List[float]] = None
        self.last_valid_roi_box: Optional[List[int]] = None

    def process_frame(self, frame: np.ndarray) -> Dict[str, Any]:
        """
        Processes an incoming video frame through the 4 stages.
        Returns telemetry dictionary with state, metrics, and cropped ROI.
        """
        self.frame_count += 1
        h, w = frame.shape[:2]
        
        # Estimate raw reference size (1080p / 4 Mbps baseline or native JPEG)
        _, raw_encoded = cv2.imencode('.jpg', frame, [int(cv2.IMWRITE_JPEG_QUALITY), 80])
        raw_bytes = len(raw_encoded)

        # Stage 1: Background Subtraction
        # Compute foreground mask at 1/2 scale for high-speed edge processing
        small_frame = cv2.resize(frame, (w // 2, h // 2))
        
        # On warmup frames, learn the initial model without false alarm
        if self.frame_count <= self.warmup_frames:
            self.subtractor.apply(small_frame, learningRate=0.9)
            activity_ratio = 0.0
            is_active = False
            fg_mask_small = np.zeros(small_frame.shape[:2], dtype=np.uint8)
        else:
            fg_mask_small = self.subtractor.apply(small_frame)
            fg_mask_small = cv2.morphologyEx(fg_mask_small, cv2.MORPH_OPEN, self.kernel)
            fg_mask_small = cv2.morphologyEx(fg_mask_small, cv2.MORPH_DILATE, self.kernel, iterations=2)
            active_pixels = cv2.countNonZero(fg_mask_small)
            activity_ratio = active_pixels / (fg_mask_small.shape[0] * fg_mask_small.shape[1])
            is_active = activity_ratio >= self.min_activity_ratio

        # Stage 2: Adaptive Frame Skipping with Hysteresis & Heartbeat
        self.frames_since_sent += 1

        if is_active:
            self.hysteresis_countdown = self.hysteresis_frames
            state = "ACTIVE"
        elif self.hysteresis_countdown > 0:
            self.hysteresis_countdown -= 1
            state = "ACTIVE"
        elif self.frames_since_sent >= self.heartbeat_interval:
            state = "HEARTBEAT"
        else:
            state = "IDLE"
            
        self.last_state = state
        
        roi_box = None
        roi_b64 = None
        sent_bytes = 0
        detections: List[Dict[str, Any]] = []

        if state == "ACTIVE":
            self.frames_since_sent = 0
            
            # Stage 3: ROI Bounding Box Extraction with EMA Temporal Smoothing
            contours, _ = cv2.findContours(fg_mask_small, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
            min_contour_area = 25
            valid_contours = [c for c in contours if cv2.contourArea(c) > min_contour_area]
            
            if valid_contours:
                # Enclosing bounding box of all motion areas
                boxes = [cv2.boundingRect(c) for c in valid_contours]
                x_min = min(b[0] for b in boxes)
                y_min = min(b[1] for b in boxes)
                x_max = max(b[0] + b[2] for b in boxes)
                y_max = max(b[1] + b[3] for b in boxes)
                
                # Scale back to original frame coordinates
                scale_x = w / float(small_frame.shape[1])
                scale_y = h / float(small_frame.shape[0])
                
                rx_min = x_min * scale_x
                ry_min = y_min * scale_y
                rx_max = x_max * scale_x
                ry_max = y_max * scale_y
                
                # Add safety margin padding
                pad_w = (rx_max - rx_min) * self.roi_padding_pct
                pad_h = (ry_max - ry_min) * self.roi_padding_pct
                
                target_x0 = max(0, rx_min - pad_w)
                target_y0 = max(0, ry_min - pad_h)
                target_x1 = min(w, rx_max + pad_w)
                target_y1 = min(h, ry_max + pad_h)
                target_w = target_x1 - target_x0
                target_h = target_y1 - target_y0
                
                # Temporal smoothing (EMA)
                if self.smooth_box is None:
                    self.smooth_box = [float(target_x0), float(target_y0), float(target_w), float(target_h)]
                else:
                    alpha = 0.35
                    self.smooth_box[0] += (target_x0 - self.smooth_box[0]) * alpha
                    self.smooth_box[1] += (target_y0 - self.smooth_box[1]) * alpha
                    self.smooth_box[2] += (target_w - self.smooth_box[2]) * alpha
                    self.smooth_box[3] += (target_h - self.smooth_box[3]) * alpha
                
                cx0 = max(0, min(w - 20, int(round(self.smooth_box[0]))))
                cy0 = max(0, min(h - 20, int(round(self.smooth_box[1]))))
                cw = max(20, min(w - cx0, int(round(self.smooth_box[2]))))
                ch = max(20, min(h - cy0, int(round(self.smooth_box[3]))))
                
                roi_box = [cx0, cy0, cw, ch]
                self.last_valid_roi_box = roi_box
                roi_crop = frame[cy0:cy0+ch, cx0:cx0+cw]
            elif self.smooth_box is not None:
                # During hysteresis cooldown, hold the stabilized bounding box
                cx0 = max(0, min(w - 20, int(round(self.smooth_box[0]))))
                cy0 = max(0, min(h - 20, int(round(self.smooth_box[1]))))
                cw = max(20, min(w - cx0, int(round(self.smooth_box[2]))))
                ch = max(20, min(h - cy0, int(round(self.smooth_box[3]))))
                roi_box = [cx0, cy0, cw, ch]
                roi_crop = frame[cy0:cy0+ch, cx0:cx0+cw]
            elif self.last_valid_roi_box is not None:
                roi_box = self.last_valid_roi_box
                roi_crop = frame[roi_box[1]:roi_box[1]+roi_box[3], roi_box[0]:roi_box[0]+roi_box[2]]
            else:
                roi_box = [0, 0, w, h]
                roi_crop = frame
            
            # Stage 4: Lightweight Feature Extraction
            detections.append({
                "label": "motion_event",
                "confidence": min(1.0, round(float(activity_ratio * 4.0 + 0.5), 2)),
                "box": roi_box,
                "area_px": roi_box[2] * roi_box[3]
            })
            
            _, roi_encoded = cv2.imencode('.jpg', roi_crop, [int(cv2.IMWRITE_JPEG_QUALITY), 75])
            sent_bytes = len(roi_encoded)
            roi_b64 = "data:image/jpeg;base64," + base64.b64encode(roi_encoded).decode('utf-8')
            
        elif state == "HEARTBEAT":
            self.smooth_box = None
            self.frames_since_sent = 0
            # Send periodic low-res heartbeat keyframe (1/4 scale)
            hb_frame = cv2.resize(frame, (max(16, w // 4), max(16, h // 4)))
            _, hb_encoded = cv2.imencode('.jpg', hb_frame, [int(cv2.IMWRITE_JPEG_QUALITY), 50])
            sent_bytes = len(hb_encoded)
            roi_b64 = "data:image/jpeg;base64," + base64.b64encode(hb_encoded).decode('utf-8')
            roi_box = [0, 0, w, h]
            
        else: # IDLE
            self.smooth_box = None
            # Only send minimal metadata heartbeat ping
            sent_bytes = 48
            roi_b64 = None
            roi_box = None

        compression_ratio = ((raw_bytes - sent_bytes) / raw_bytes) * 100.0 if raw_bytes > 0 else 0.0

        return {
            "timestamp": time.time(),
            "frame_id": self.frame_count,
            "state": state,
            "activity_ratio": round(float(activity_ratio), 4),
            "raw_bytes": raw_bytes,
            "sent_bytes": sent_bytes,
            "saved_bytes": max(0, raw_bytes - sent_bytes),
            "compression_ratio_pct": round(compression_ratio, 2),
            "roi_box": roi_box,
            "detections": detections,
            "roi_b64": roi_b64,
            "frame_dim": [w, h]
        }

connected_clients = set()

async def ws_handler(websocket):
    connected_clients.add(websocket)
    print(f"[WebSocket] Client connected: {websocket.remote_address}")
    try:
        await websocket.wait_closed()
    finally:
        connected_clients.remove(websocket)
        print(f"[WebSocket] Client disconnected")

def generate_synthetic_frame(t: float, w: int = 640, h: int = 360) -> np.ndarray:
    """Generates a realistic test camera feed with moving object."""
    frame = np.full((h, w, 3), (40, 30, 25), dtype=np.uint8)
    # Floor
    cv2.rectangle(frame, (0, int(h * 0.6)), (w, h), (70, 60, 50), -1)
    # Static structure
    cv2.rectangle(frame, (int(w * 0.1), int(h * 0.2)), (int(w * 0.35), int(h * 0.6)), (30, 25, 20), -1)
    cv2.rectangle(frame, (int(w * 0.65), int(h * 0.2)), (int(w * 0.9), int(h * 0.6)), (30, 25, 20), -1)
    
    # Moving object cycle
    cycle = 10.0
    phase = t % cycle
    if phase < 4.0:
        prog = phase / 4.0
        x = int(-60 + (w + 120) * prog)
        y = int(h * 0.55)
        # Moving box
        cv2.rectangle(frame, (x, y), (x + 80, y + 50), (220, 220, 230), -1)
        cv2.rectangle(frame, (x + 15, y - 25), (x + 65, y), (20, 160, 240), -1)
    
    # Add subtle sensor noise
    noise = np.random.normal(0, 3, (h, w, 3)).astype(np.int16)
    noisy_frame = np.clip(frame.astype(np.int16) + noise, 0, 255).astype(np.uint8)
    return noisy_frame

async def run_worker_loop(video_source: Any, pipeline: EcoVisionPipeline, fps: int = 15):
    if str(video_source).lower() == "synthetic":
        use_synthetic = True
    elif isinstance(video_source, int) or (isinstance(video_source, str) and video_source.isdigit()):
        cap = cv2.VideoCapture(int(video_source))
        if not cap.isOpened():
            print(f"[Notice] Physical webcam index {video_source} not accessible. Using high-fidelity synthetic CCTV stream.")
            use_synthetic = True
    else:
        cap = cv2.VideoCapture(video_source)
        if not cap.isOpened():
            print(f"[Notice] Video file '{video_source}' not found. Using high-fidelity synthetic CCTV stream.")
            use_synthetic = True

    print(f"[Eco-Vision Edge] Capturing at ~{fps} FPS ({'Live Webcam' if not use_synthetic else 'Synthetic CCTV Stream'})...")
    interval = 1.0 / fps
    sim_t = 0.0

    try:
        while True:
            start_t = time.time()
            if use_synthetic or cap is None:
                sim_t += interval
                frame = generate_synthetic_frame(sim_t)
            else:
                ret, frame = cap.read()
                if not ret:
                    cap.set(cv2.CAP_PROP_POS_FRAMES, 0)
                    continue

            telemetry = pipeline.process_frame(frame)
            
            if connected_clients:
                payload = json.dumps(telemetry)
                await asyncio.gather(
                    *[client.send(payload) for client in connected_clients],
                    return_exceptions=True
                )

            elapsed = time.time() - start_t
            sleep_time = max(0.001, interval - elapsed)
            await asyncio.sleep(sleep_time)

    finally:
        if cap is not None:
            cap.release()

async def main(host: str = "0.0.0.0", port: int = 8765, video_source: Any = 0):
    pipeline = EcoVisionPipeline()
    print(f"==================================================")
    print(f"  ECO-VISION ARCHITECTURE - PYTHON EDGE WORKER    ")
    print(f"  WebSocket server listening on ws://{host}:{port}")
    print(f"==================================================")
    
    async with websockets.serve(ws_handler, host, port):
        await run_worker_loop(video_source, pipeline)
if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Eco-Vision Architecture Edge Worker")
    parser.add_argument("--source", default="synthetic", help="Camera index (e.g. 0), path to video file, or 'synthetic'")
    parser.add_argument("--host", default="0.0.0.0", help="Host address for WebSocket server")
    parser.add_argument("--port", type=int, default=8765, help="Port for WebSocket server")
    args = parser.parse_args()

    src = int(args.source) if str(args.source).isdigit() else args.source

    try:
        asyncio.run(main(args.host, args.port, src))
    except KeyboardInterrupt:
        print("\n[Eco-Vision Edge] Terminated gracefully.")
