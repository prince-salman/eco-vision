import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from .database import Base

class CameraNode(Base):
    __tablename__ = "camera_nodes"

    id = Column(String(32), primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    location = Column(String(100), default="Main Facility")
    rtsp_url = Column(String(255), nullable=True)
    status = Column(String(20), default="ONLINE")  # ONLINE, IDLE, OFFLINE
    resolution = Column(String(20), default="1080p")
    fps = Column(Integer, default=15)
    power_draw_w = Column(Float, default=2.0)
    firmware_version = Column(String(20), default="v2.4.1-edge")
    last_heartbeat = Column(DateTime, default=datetime.datetime.utcnow)

    events = relationship("DetectionEvent", back_populates="camera", cascade="all, delete-orphan")

class DetectionEvent(Base):
    __tablename__ = "detection_events"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    camera_id = Column(String(32), ForeignKey("camera_nodes.id"), index=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow, index=True)
    state = Column(String(20), nullable=False)  # ACTIVE, IDLE, HEARTBEAT
    activity_pct = Column(Float, default=0.0)
    roi_x = Column(Integer, nullable=True)
    roi_y = Column(Integer, nullable=True)
    roi_w = Column(Integer, nullable=True)
    roi_h = Column(Integer, nullable=True)
    current_kbps = Column(Float, default=0.0)
    saved_pct = Column(Float, default=0.0)
    label = Column(String(50), default="Movement")
    confidence = Column(Float, default=0.95)

    camera = relationship("CameraNode", back_populates="events")

class TelemetrySnapshot(Base):
    __tablename__ = "telemetry_snapshots"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow, index=True)
    total_cameras = Column(Integer, default=4)
    active_cameras = Column(Integer, default=1)
    aggregate_kbps = Column(Float, default=420.0)
    baseline_kbps = Column(Float, default=16000.0)
    bandwidth_saved_pct = Column(Float, default=89.5)
    cumulative_energy_saved_wh = Column(Float, default=0.0)
    cumulative_co2_kg = Column(Float, default=0.0)
    cumulative_water_l = Column(Float, default=0.0)
