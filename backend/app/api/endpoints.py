from datetime import datetime
import math
from typing import List, Optional
import requests

from fastapi import APIRouter, Header, HTTPException, Query

from app.core.config import settings
from app.schemas.schemas import (
    BusLocationCreate,
    BusLocationHistoryItem,
    BusLocationResponse,
    BusStopCreate,
    BusStopResponse,
    ETAResponse,
)

router = APIRouter()

def get_supabase_headers():
    return {
        "apikey": settings.SUPABASE_KEY.strip(),
        "Authorization": f"Bearer {settings.SUPABASE_KEY.strip()}",
        "Content-Type": "application/json"
    }


def haversine(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    radius_km = 6371
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (
        math.sin(dlat / 2) * math.sin(dlat / 2)
        + math.cos(math.radians(lat1))
        * math.cos(math.radians(lat2))
        * math.sin(dlon / 2)
        * math.sin(dlon / 2)
    )
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return radius_km * c


def validate_iot_api_key(x_api_key: Optional[str]) -> None:
    required_key = settings.IOT_API_KEY.strip()
    if not required_key:
        return
    if x_api_key != required_key:
        raise HTTPException(status_code=401, detail="Invalid API key")

@router.post("/location/update", response_model=dict)
def update_location(location: BusLocationCreate, x_api_key: Optional[str] = Header(default=None)):
    validate_iot_api_key(x_api_key)
    data = location.model_dump()
    if not data.get("timestamp"):
        data["timestamp"] = datetime.utcnow().isoformat()

    try:
        url = f"{settings.SUPABASE_URL.strip()}/rest/v1/bus_locations"
        response = requests.post(url, headers=get_supabase_headers(), json=data)
        if response.status_code not in [200, 201]:
            raise HTTPException(status_code=response.status_code, detail=response.text)
        return {"status": "success", "message": "Location updated"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/bus/{bus_id}/location", response_model=BusLocationResponse)
def get_latest_location(bus_id: str):
    try:
        url = f"{settings.SUPABASE_URL.strip()}/rest/v1/bus_locations?bus_id=eq.{bus_id}&order=timestamp.desc&limit=1"
        response = requests.get(url, headers=get_supabase_headers())
        
        if response.status_code != 200:
            raise HTTPException(status_code=response.status_code, detail=response.text)
        
        data = response.json()
        if not data:
            print(f"INFO: No location data found for bus {bus_id}")
            raise HTTPException(status_code=404, detail=f"Location not found for bus: {bus_id}")

        return data[0]
    except HTTPException:
        raise
    except Exception as e:
        error_msg = str(e)
        print(f"ERROR in get_latest_location: {error_msg}")
        raise HTTPException(status_code=500, detail=f"Database error: {error_msg}")

@router.get("/bus/{bus_id}/history", response_model=List[BusLocationHistoryItem])
def get_location_history(bus_id: str, limit: int = Query(default=100, ge=1, le=1000)):
    try:
        url = f"{settings.SUPABASE_URL.strip()}/rest/v1/bus_locations?bus_id=eq.{bus_id}&select=latitude,longitude,speed,heading,timestamp&order=timestamp.desc&limit={limit}"
        response = requests.get(url, headers=get_supabase_headers())
        if response.status_code != 200:
            raise HTTPException(status_code=response.status_code, detail=response.text)
        return response.json()
    except HTTPException:
        raise
    except Exception as e:
        error_msg = str(e)
        raise HTTPException(status_code=500, detail=f"Database error: {error_msg}")

@router.get("/stops", response_model=List[BusStopResponse])
def get_stops():
    try:
        url = f"{settings.SUPABASE_URL.strip()}/rest/v1/bus_stops?select=*&order=stop_name.asc"
        response = requests.get(url, headers=get_supabase_headers())
        if response.status_code != 200:
            raise HTTPException(status_code=response.status_code, detail=response.text)
        return response.json()
    except Exception as e:
        print(f"ERROR in get_stops: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/stops", response_model=BusStopResponse, status_code=201)
def create_stop(stop: BusStopCreate):
    try:
        url = f"{settings.SUPABASE_URL.strip()}/rest/v1/bus_stops"
        headers = get_supabase_headers()
        headers["Prefer"] = "return=representation"
        response = requests.post(url, headers=headers, json=stop.model_dump(exclude_none=True))
        if response.status_code not in [200, 201]:
            raise HTTPException(status_code=response.status_code, detail=response.text)
        data = response.json()
        if not data:
            raise HTTPException(status_code=500, detail="Failed to create stop")
        return data[0]
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/bus/{bus_id}/eta", response_model=List[ETAResponse])
def get_eta(bus_id: str):
    try:
        headers = get_supabase_headers()
        
        # 1. Get current bus location
        loc_url = f"{settings.SUPABASE_URL.strip()}/rest/v1/bus_locations?bus_id=eq.{bus_id}&order=timestamp.desc&limit=1"
        loc_response = requests.get(loc_url, headers=headers)
        if loc_response.status_code != 200:
            raise HTTPException(status_code=loc_response.status_code, detail=loc_response.text)
        
        loc_data = loc_response.json()
        if not loc_data:
            raise HTTPException(status_code=404, detail="Bus location not found")

        current_loc = loc_data[0]

        # 2. Get bus/route info
        bus_url = f"{settings.SUPABASE_URL.strip()}/rest/v1/buses?id=eq.{bus_id}&select=route_id&limit=1"
        bus_response = requests.get(bus_url, headers=headers)
        route_id = None
        if bus_response.status_code == 200:
            bus_data = bus_response.json()
            route_id = bus_data[0]["route_id"] if bus_data else None

        # 3. Get stops
        if route_id:
            stops_url = f"{settings.SUPABASE_URL.strip()}/rest/v1/bus_stops?route_id=eq.{route_id}&select=*"
        else:
            stops_url = f"{settings.SUPABASE_URL.strip()}/rest/v1/bus_stops?select=*"
        
        stops_response = requests.get(stops_url, headers=headers)
        if stops_response.status_code != 200:
            raise HTTPException(status_code=stops_response.status_code, detail=stops_response.text)
        
        stops = stops_response.json()

        # 4. Calculate ETAs
        etas = []
        avg_speed_kmh = current_loc.get("speed") or 30.0
        if avg_speed_kmh < 5:
            avg_speed_kmh = 30.0

        for stop in stops:
            dist_km = haversine(
                current_loc["latitude"],
                current_loc["longitude"],
                stop["latitude"],
                stop["longitude"],
            )
            time_hours = dist_km / avg_speed_kmh
            minutes = max(0, int(time_hours * 60))

            etas.append({
                "stop_id": stop["id"],
                "stop_name": stop["stop_name"],
                "eta_minutes": minutes,
            })

        return sorted(etas, key=lambda x: x["eta_minutes"])
    except HTTPException:
        raise
    except Exception as e:
        error_msg = str(e)
        print(f"ERROR in get_eta: {error_msg}")
        raise HTTPException(status_code=500, detail=f"Database error: {error_msg}")
