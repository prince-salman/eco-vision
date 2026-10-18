import numpy as np
import pytest
import sys
import os

sys.path.insert(0, os.path.dirname(__file__))
from edge_worker import EcoVisionPipeline

def test_pipeline_idle_on_static_scene():
    pipeline = EcoVisionPipeline(min_activity_ratio=0.015, heartbeat_interval=45)
    static_frame = np.full((240, 320, 3), 128, dtype=np.uint8)
    
    # Warm up background model with 15 identical frames
    for _ in range(15):
        res = pipeline.process_frame(static_frame)
    
    # After warm-up on static scene, state should be IDLE
    assert res["state"] in ["IDLE", "HEARTBEAT"]
    assert res["activity_ratio"] < 0.015
    assert res["raw_bytes"] > 0
    assert res["sent_bytes"] <= res["raw_bytes"]

def test_pipeline_active_on_motion():
    pipeline = EcoVisionPipeline(min_activity_ratio=0.015, hysteresis_frames=10)
    base_frame = np.full((240, 320, 3), 50, dtype=np.uint8)
    for _ in range(15):
        pipeline.process_frame(base_frame)
    
    # Introduce moving bright block (100x100 pixels in 240x320 frame = ~13% activity)
    motion_frame = base_frame.copy()
    motion_frame[50:150, 50:150] = 240
    res = pipeline.process_frame(motion_frame)
    
    assert res["state"] == "ACTIVE"
    assert res["activity_ratio"] >= 0.015
    assert res["roi_box"] is not None
    # Check bounding box has [x, y, w, h] format
    assert len(res["roi_box"]) == 4
    assert res["roi_b64"] is not None
    assert len(res["roi_b64"]) > 0

def test_pipeline_heartbeat_trigger():
    pipeline = EcoVisionPipeline(min_activity_ratio=0.05, heartbeat_interval=10)
    static_frame = np.full((240, 320, 3), 100, dtype=np.uint8)
    
    # Process 25 frames; heartbeat should trigger every 10 frames
    states = []
    for _ in range(25):
        r = pipeline.process_frame(static_frame)
        states.append(r["state"])
    
    assert "HEARTBEAT" in states
