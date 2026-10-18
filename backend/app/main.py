import io
import csv
import json
import asyncio
from typing import List, Optional
from datetime import datetime

from fastapi import FastAPI, Depends, HTTPException, Query, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from .database import engine, get_db, Base
from .models import CameraNode, DetectionEvent, TelemetrySnapshot
from .schemas import (
    CameraCreate, CameraResponse, EventCreate, EventResponse,
    SimulationRequest, SimulationResponse
)

# Initialize database schema
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Eco-Vision Architecture API",
    description="Backend API and WebSocket stream relay for Eco-Vision Architecture",
    version="2.4.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc"
)

# CORS middleware for local Vite and production deployments
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Seed initial cameras if empty
def seed_initial_data():
    from .database import SessionLocal
    db = SessionLocal()
    try:
        count = db.query(CameraNode).count()
        if count == 0:
            initial_cams = [
                CameraNode(
                    id="cam-01",
                    name="Loading Dock Alpha",
                    location="Industrial Logistics Bay",
                    rtsp_url="rtsp://192.168.1.101:554/ch01",
                    status="ONLINE",
                    resolution="1080p",
                    fps=15,
                    power_draw_w=2.0,
                    firmware_version="v2.4.1-edge"
                ),
                CameraNode(
                    id="cam-02",
                    name="Corridor Logistics Bravo",
                    location="Storage Facility Floor 2",
                    rtsp_url="rtsp://192.168.1.102:554/ch01",
                    status="IDLE",
                    resolution="1080p",
                    fps=15,
                    power_draw_w=1.8,
                    firmware_version="v2.4.1-edge"
                ),
                CameraNode(
                    id="cam-03",
                    name="Perimeter Fence Charlie",
                    location="North Security Boundary",
                    rtsp_url="rtsp://192.168.1.103:554/ch01",
                    status="IDLE",
                    resolution="1080p",
                    fps=15,
                    power_draw_w=2.1,
                    firmware_version="v2.4.1-edge"
                ),
                CameraNode(
                    id="cam-04",
                    name="Campus Main Gate Delta",
                    location="President University Entrance",
                    rtsp_url="rtsp://192.168.1.104:554/ch01",
                    status="ONLINE",
                    resolution="1080p",
                    fps=15,
                    power_draw_w=2.0,
                    firmware_version="v2.4.1-edge"
                ),
            ]
            db.add_all(initial_cams)
            db.commit()
    finally:
        db.close()

seed_initial_data()

# ----------------- WebSocket Connection Manager -----------------
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast(self, message: dict):
        for connection in list(self.active_connections):
            try:
                await connection.send_text(json.dumps(message))
            except Exception:
                self.disconnect(connection)

manager = ConnectionManager()

# ----------------- REST Endpoints -----------------

@app.get("/api/v1/health")
def get_health():
    return {
        "status": "healthy",
        "service": "Eco-Vision Backend & Edge Orchestration Engine",
        "version": "2.4.0",
        "timestamp": datetime.utcnow().isoformat(),
        "database": "sqlite:///ecovision.db",
        "active_clients": len(manager.active_connections)
    }

@app.get("/api/v1/cameras", response_model=List[CameraResponse])
def list_cameras(db: Session = Depends(get_db)):
    return db.query(CameraNode).all()

@app.post("/api/v1/cameras", response_model=CameraResponse)
def create_camera(payload: CameraCreate, db: Session = Depends(get_db)):
    existing = db.query(CameraNode).filter(CameraNode.id == payload.id).first()
    if existing:
        raise HTTPException(status_code=400, detail=f"Camera with ID '{payload.id}' already exists")
    cam = CameraNode(**payload.dict())
    db.add(cam)
    db.commit()
    db.refresh(cam)
    return cam

@app.delete("/api/v1/cameras/{camera_id}")
def delete_camera(camera_id: str, db: Session = Depends(get_db)):
    cam = db.query(CameraNode).filter(CameraNode.id == camera_id).first()
    if not cam:
        raise HTTPException(status_code=404, detail="Camera not found")
    db.delete(cam)
    db.commit()
    return {"message": f"Camera {camera_id} successfully decommissioned"}

@app.get("/api/v1/events", response_model=List[EventResponse])
def list_events(
    camera_id: Optional[str] = None,
    state: Optional[str] = None,
    limit: int = Query(100, le=500),
    db: Session = Depends(get_db)
):
    query = db.query(DetectionEvent).order_by(DetectionEvent.timestamp.desc())
    if camera_id:
        query = query.filter(DetectionEvent.camera_id == camera_id)
    if state:
        query = query.filter(DetectionEvent.state == state)
    return query.limit(limit).all()

@app.post("/api/v1/events", response_model=EventResponse)
async def create_event(payload: EventCreate, db: Session = Depends(get_db)):
    event = DetectionEvent(**payload.dict())
    db.add(event)
    
    # Update camera heartbeat
    cam = db.query(CameraNode).filter(CameraNode.id == payload.camera_id).first()
    if cam:
        cam.status = "ONLINE" if payload.state == "ACTIVE" else "IDLE"
        cam.last_heartbeat = datetime.utcnow()
    
    db.commit()
    db.refresh(event)

    # Broadcast to WebSocket subscribers
    await manager.broadcast({
        "type": "DETECTION_EVENT",
        "data": {
            "id": event.id,
            "camera_id": event.camera_id,
            "timestamp": event.timestamp.isoformat(),
            "state": event.state,
            "activity_pct": event.activity_pct,
            "current_kbps": event.current_kbps,
            "saved_pct": event.saved_pct,
            "roi": [event.roi_x, event.roi_y, event.roi_w, event.roi_h] if event.roi_w else None
        }
    })

    return event

@app.get("/api/v1/events/export")
def export_events_csv(db: Session = Depends(get_db)):
    events = db.query(DetectionEvent).order_by(DetectionEvent.timestamp.desc()).limit(1000).all()
    
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow([
        "ID", "Camera ID", "Timestamp (UTC)", "State", "Activity (%)",
        "ROI X", "ROI Y", "ROI Width", "ROI Height",
        "Current Kbps", "Bandwidth Saved (%)", "Label", "Confidence"
    ])
    
    for ev in events:
        writer.writerow([
            ev.id, ev.camera_id, ev.timestamp.isoformat(), ev.state, ev.activity_pct,
            ev.roi_x or "", ev.roi_y or "", ev.roi_w or "", ev.roi_h or "",
            ev.current_kbps, ev.saved_pct, ev.label, ev.confidence
        ])
    
    output.seek(0)
    filename = f"eco-vision-events-{datetime.utcnow().strftime('%Y%m%d-%H%M%S')}.csv"
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )

@app.post("/api/v1/model/simulate", response_model=SimulationResponse)
def simulate_macro_model(req: SimulationRequest):
    """
    Mathematical Analytical Model from Section 3.3 of the Research Paper:
    - 1080p @ 4 Mbps (500 KB/s) unthrottled
    - Active fraction: act / 100
    - ROI frame share: roi / 100
    - Overhead: 0.5% (heartbeat + JSON metadata)
    - 50 GFLOP/frame inference @ 15 fps
    - Cloud accelerator efficiency: 10 pJ/FLOP = 1e-11 J/FLOP
    - Cooling water: 0.5 L per IT kWh
    """
    cams = req.cams
    act_frac = req.act / 100.0
    roi_frac = req.roi / 100.0
    overhead_frac = 0.005

    # 1. Traffic calculation
    raw_traffic_tbps = (cams * 4.0) / 1e6
    retention_factor = (act_frac * roi_frac) + overhead_frac
    eco_traffic_tbps = raw_traffic_tbps * retention_factor
    retention_pct = round(retention_factor * 100, 2)

    seconds_in_year = 365.25 * 24 * 3600
    # Bytes per second = Tbps * 1e12 / 8
    raw_bytes_yr = raw_traffic_tbps * 1e12 / 8 * seconds_in_year
    eco_bytes_yr = eco_traffic_tbps * 1e12 / 8 * seconds_in_year
    raw_exabytes_yr = round(raw_bytes_yr / 1e18, 2)
    eco_exabytes_yr = round(eco_bytes_yr / 1e18, 2)

    # 2. Compute load (FLOPs)
    # 50 GFLOPs * 15 fps = 750 GFLOP/s per cam
    raw_flops_per_cam = 50e9 * 15
    raw_cloud_flops_pflops = round((cams * raw_flops_per_cam) / 1e15, 1)
    eco_cloud_flops_pflops = round((cams * raw_flops_per_cam * act_frac) / 1e15, 1)

    # 3. Energy consumption
    joules_per_flop = 10e-12  # 10 pJ/FLOP
    raw_it_power_w = cams * raw_flops_per_cam * joules_per_flop
    eco_it_power_w = cams * raw_flops_per_cam * act_frac * joules_per_flop

    hours_in_year = 365.25 * 24
    raw_facility_energy_gwh = (raw_it_power_w * req.pue * hours_in_year) / 1e9
    eco_facility_energy_gwh = (eco_it_power_w * req.pue * hours_in_year) / 1e9

    edge_power_w = cams * req.edge
    edge_node_energy_gwh = (edge_power_w * hours_in_year) / 1e9

    net_energy_saved_gwh = round(raw_facility_energy_gwh - (eco_facility_energy_gwh + edge_node_energy_gwh), 1)

    # 4. Environmental impact
    net_co2_avoided_tonnes = round((net_energy_saved_gwh * 1e6 * req.grid) / 1000, 0)
    it_energy_saved_kwh = ((raw_it_power_w - eco_it_power_w) * hours_in_year) / 1e3
    cooling_water_avoided_million_l = round((it_energy_saved_kwh * 0.5) / 1e6, 1)

    summary = (
        f"For {cams:,} cameras, Eco-Vision cuts upstream network traffic by {100 - retention_pct:.1f}% "
        f"(from {raw_traffic_tbps:.2f} Tbps to {eco_traffic_tbps:.2f} Tbps). "
        f"Net energy saved is {net_energy_saved_gwh} GWh/yr, avoiding {net_co2_avoided_tonnes:,.0f} tonnes CO2 "
        f"and {cooling_water_avoided_million_l} million liters of cooling water annually."
    )

    return SimulationResponse(
        retention_pct=retention_pct,
        raw_traffic_tbps=round(raw_traffic_tbps, 2),
        raw_exabytes_yr=raw_exabytes_yr,
        eco_traffic_tbps=round(eco_traffic_tbps, 2),
        eco_exabytes_yr=eco_exabytes_yr,
        raw_cloud_flops_pflops=raw_cloud_flops_pflops,
        eco_cloud_flops_pflops=eco_cloud_flops_pflops,
        cloud_facility_energy_gwh=round(raw_facility_energy_gwh, 1),
        eco_facility_energy_gwh=round(eco_facility_energy_gwh, 1),
        edge_node_energy_gwh=round(edge_node_energy_gwh, 1),
        net_energy_saved_gwh=net_energy_saved_gwh,
        net_co2_avoided_tonnes=net_co2_avoided_tonnes,
        cooling_water_avoided_million_l=cooling_water_avoided_million_l,
        summary=summary
    )

@app.get("/api/v1/research/paper")
def get_paper_metadata():
    return {
        "title": "Eco-Vision Architecture: Mitigating Data Center Resource Consumption Through Local Computer Vision Pre-Processing",
        "competition": "7th International Youth Summit (IYS) Essay Competition",
        "main_theme": "Bridging Ideas and Youth Creativity to Shape Solutions for Tomorrow’s Challenges",
        "sub_theme": "Technology",
        "institution": "President University",
        "team": {
            "leader": "Firza Miftahul Ilmi",
            "members": [
                "Muhammad Salman",
                "Immanuel Elvando Kenjam",
                "Citra Ayu Setyoningputri"
            ]
        },
        "sections": [
            {
                "id": "3.1",
                "title": "The Unseen Environmental Burden of Centralized Computer Vision Pipelines",
                "focus": "Analysis of 43 GB/day per camera waste, 415 TWh global DC consumption (IEA, 2025), and evaporative water footprint."
            },
            {
                "id": "3.2",
                "title": "The Eco-Vision Paradigm: Mechanics of Local Pre-Processing",
                "focus": "4-stage pipeline: Local Background Subtraction, Adaptive Frame Skipping, ROI Cropping, and Lightweight Feature Extraction."
            },
            {
                "id": "3.3",
                "title": "Quantifiable Resource Mitigation and Efficiency Benchmarks",
                "focus": "Analytical model for 1M cameras: 89.5% traffic reduction, 90% cloud inference reduction, 65 GWh net energy savings."
            },
            {
                "id": "3.4",
                "title": "Youth-Led Implementation Strategy and Scalability",
                "focus": "Companion SBC boards for heterogeneous RTSP fleets, environmental drift calibration, and 3-stage rollout roadmap."
            }
        ]
    }

# ----------------- WebSocket Live Telemetry Stream -----------------
@app.websocket("/ws/telemetry")
async def websocket_telemetry_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        # Initial greeting packet
        await websocket.send_text(json.dumps({
            "type": "INITIAL_HANDSHAKE",
            "message": "Connected to Eco-Vision Central WebSocket Hub",
            "timestamp": datetime.utcnow().isoformat()
        }))
        while True:
            # Echo or receive custom client signals
            data = await websocket.receive_text()
            try:
                parsed = json.loads(data)
                # If edge client sent telemetry, broadcast it to all dashboards!
                if parsed.get("type") == "EDGE_TELEMETRY":
                    await manager.broadcast(parsed)
            except Exception:
                pass
    except WebSocketDisconnect:
        manager.disconnect(websocket)
