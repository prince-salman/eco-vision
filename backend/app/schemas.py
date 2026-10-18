from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, Field

class CameraCreate(BaseModel):
    id: str = Field(..., example="cam-05")
    name: str = Field(..., example="Warehouse Gate East")
    location: str = Field("Main Facility", example="Perimeter Gate")
    rtsp_url: Optional[str] = Field(None, example="rtsp://192.168.1.50:554/live")
    resolution: str = Field("1080p", example="1080p")
    fps: int = Field(15, example=15)
    power_draw_w: float = Field(2.0, example=2.0)

class CameraResponse(BaseModel):
    id: str
    name: str
    location: str
    rtsp_url: Optional[str]
    status: str
    resolution: str
    fps: int
    power_draw_w: float
    firmware_version: str
    last_heartbeat: datetime

    class Config:
        from_attributes = True

class EventCreate(BaseModel):
    camera_id: str
    state: str = Field(..., example="ACTIVE")
    activity_pct: float = Field(..., example=24.5)
    roi_x: Optional[int] = None
    roi_y: Optional[int] = None
    roi_w: Optional[int] = None
    roi_h: Optional[int] = None
    current_kbps: float = Field(..., example=412.0)
    saved_pct: float = Field(..., example=89.7)
    label: str = Field("Movement", example="Vehicle / Person")
    confidence: float = Field(0.95, example=0.98)

class EventResponse(BaseModel):
    id: int
    camera_id: str
    timestamp: datetime
    state: str
    activity_pct: float
    roi_x: Optional[int]
    roi_y: Optional[int]
    roi_w: Optional[int]
    roi_h: Optional[int]
    current_kbps: float
    saved_pct: float
    label: str
    confidence: float

    class Config:
        from_attributes = True

class SimulationRequest(BaseModel):
    cams: int = Field(1000000, description="Camera Fleet Size")
    act: float = Field(20.0, description="Scene Activity Percentage (5-80%)")
    roi: float = Field(50.0, description="ROI Share of Active Frame (10-100%)")
    edge: float = Field(2.0, description="Edge Node Power in Watts")
    pue: float = Field(1.4, description="Data Center PUE (1.1-2.0)")
    grid: float = Field(0.45, description="Grid Carbon Intensity kg/kWh")

class SimulationResponse(BaseModel):
    retention_pct: float
    raw_traffic_tbps: float
    raw_exabytes_yr: float
    eco_traffic_tbps: float
    eco_exabytes_yr: float
    raw_cloud_flops_pflops: float
    eco_cloud_flops_pflops: float
    cloud_facility_energy_gwh: float
    eco_facility_energy_gwh: float
    edge_node_energy_gwh: float
    net_energy_saved_gwh: float
    net_co2_avoided_tonnes: float
    cooling_water_avoided_million_l: float
    summary: str
