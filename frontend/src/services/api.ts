// Using native fetch to call our Python FastAPI backend
const API_URL = 'http://localhost:8000/api';

export interface BusLocation {
  id: string;
  bus_id: string;
  latitude: number;
  longitude: number;
  speed: number;
  heading: number;
  timestamp: string;
}

export interface BusStop {
  id: string;
  stop_name: string;
  latitude: number;
  longitude: number;
  route_id?: string;
}

export interface ETA {
  stop_id: string;
  stop_name: string;
  eta_minutes: number;
}

export const getBusLocation = async (busId: string): Promise<BusLocation> => {
  const response = await fetch(`${API_URL}/bus/${busId}/location`);
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to fetch location from backend');
  }
  return await response.json();
};

export const getStops = async (): Promise<BusStop[]> => {
  const response = await fetch(`${API_URL}/stops`);
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to fetch stops from backend');
  }
  return await response.json();
};

export const createStop = async (stop: Omit<BusStop, 'id'>): Promise<BusStop> => {
  const response = await fetch(`${API_URL}/stops`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(stop),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to create stop');
  }
  return await response.json();
};

export const getETA = async (busId: string): Promise<ETA[]> => {
  const response = await fetch(`${API_URL}/bus/${busId}/eta`);
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to fetch ETA');
  }
  return await response.json();
};
