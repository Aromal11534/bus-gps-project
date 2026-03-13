from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from uuid import UUID

# --- Shared Schemas ---

class BusLocationBase(BaseModel):
    latitude: float
    longitude: float
    speed: Optional[float] = 0.0
    heading: Optional[float] = 0.0

class BusLocationCreate(BusLocationBase):
    bus_id: str  # Can be UUID or string identifier from device
    timestamp: Optional[datetime] = None

class BusLocationResponse(BusLocationBase):
    id: UUID
    bus_id: str
    timestamp: datetime

    class Config:
        from_attributes = True

class BusStopBase(BaseModel):
    stop_name: str
    latitude: float
    longitude: float
    route_id: Optional[UUID] = None

class BusStopCreate(BusStopBase):
    pass

class BusStopResponse(BusStopBase):
    id: UUID

    class Config:
        from_attributes = True

class ETAResponse(BaseModel):
    stop_id: UUID
    stop_name: str
    eta_minutes: int


class BusLocationHistoryItem(BaseModel):
    latitude: float
    longitude: float
    speed: Optional[float] = 0.0
    heading: Optional[float] = 0.0
    timestamp: datetime
