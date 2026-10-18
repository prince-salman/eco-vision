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
            
            # Stage 3: ROI Bounding Box Extraction
            contours, _ = cv2.findContours(fg_mask_small, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
            min_contour_area = 30
            valid_contours = [c for c in contours if cv2.contourArea(c) > min_contour_area]
            
            if valid_contours:
                # Enclosing bounding box of all motion areas
                x_min, y_min = w // 2, h // 2
                x_max, y_max = 0, 0
                for c in valid_contours:
                    bx, by, bw, bh = cv2.boundingRect(c)
                    x_min = min(x_min, bx)
                    y_min = min(y_min, by)
                    x_max = max(x_max, bx + bw)
                    y_max = max(y_max, by + bh)
                
                # Scale back to original frame coordinates
                x_min *= 2
                y_min *= 2
                x_max *= 2
                y_max *= 2
                
                # Add safety margin padding
                pad_w = int((x_max - x_min) * self.roi_padding_pct)
                pad_h = int((y_max - y_min) * self.roi_padding_pct)
                
                rx0 = max(0, x_min - pad_w)
                ry0 = max(0, y_min - pad_h)
                rx1 = min(w, x_max + pad_w)
                ry1 = min(h, y_max + pad_h)
                rw = rx1 - rx0
                rh = ry1 - ry0
                
                roi_box = [int(rx0), int(ry0), int(rw), int(rh)]
                roi_crop = frame[ry0:ry1, rx0:rx1]
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
            self.frames_since_sent = 0
            # Send periodic low-res heartbeat keyframe (1/4 scale)
            hb_frame = cv2.resize(frame, (max(16, w // 4), max(16, h // 4)))
            _, hb_encoded = cv2.imencode('.jpg', hb_frame, [int(cv2.IMWRITE_JPEG_QUALITY), 50])
            sent_bytes = len(hb_encoded)
            roi_b64 = "data:image/jpeg;base64," + base64.b64encode(hb_encoded).decode('utf-8')
            roi_box = [0, 0, w, h]
            
        else: # IDLE
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

async def run_worker_loop(video_source: Any, pipeline: EcoVisionPipeline, fps: int = 15):
    cap = cv2.VideoCapture(video_source)
    if not cap.isOpened():
        print(f"[Error] Could not open video source: {video_source}")
        return

    print(f"[Eco-Vision Edge] Capturing from {video_source} at ~{fps} FPS...")
    interval = 1.0 / fps

    try:
        while True:
            start_t = time.time()
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
        cap.release()

async def main(host: str = "0.0.0.0", port: int = 8765, video_source: Any = 0):
    pipeline = EcoVisionPipeline()
    print(f"==================================================")
    print(f"  ECO-VISION ARCHITECTURE - PYTHON EDGE WORKER    ")
    print(f"  WebSocket server listening on ws://{host}:{port}")
    print(f"==================================================")
    
    server = await websockets.serve(ws_handler, host, port)
    await run_worker_loop(video_source, pipeline)

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Eco-Vision Architecture Edge Worker")
    parser.add_argument("--source", default=0, help="Camera index (e.g. 0) or path to video file")
    parser.add_argument("--host", default="0.0.0.0", help="Host address for WebSocket server")
    parser.add_argument("--port", type=int, default=8765, help="Port for WebSocket server")
    args = parser.parse_args()

    src = int(args.source) if str(args.source).isdigit() else args.source

    try:
        asyncio.run(main(args.host, args.port, src))
    except KeyboardInterrupt:
        print("\n[Eco-Vision Edge] Terminated gracefully.")
