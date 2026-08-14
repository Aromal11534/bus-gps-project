# Smart Bus Tracking System - Architecture

This document provides a comprehensive architectural overview of the Smart Bus Tracking System.

## 1. System Overview

The system is a real-time tracking application consisting of three main components and a database layer:
1.  **IoT Hardware Module**: Captures live GPS data and transmits it.
2.  **Backend API**: A FastAPI service for data retrieval and logic processing (ETA calculations).
3.  **Frontend Application**: A React dashboard for users to track buses and an admin interface to manage stops.
4.  **Database**: Supabase (PostgreSQL with a REST API layer).

---

## 2. Component Architecture

### 2.1 IoT Module (`/iot`)
*   **Platform**: PlatformIO (Arduino framework, likely targeting ESP32/ESP8266 based on `WiFi.h` usage).
*   **Hardware**: Uses a GPS module (via Software/Hardware Serial using `TinyGPS++`).
*   **Functionality**:
    *   Connects to WiFi.
    *   Synchronizes time via NTP (`pool.ntp.org`).
    *   Reads `latitude`, `longitude`, `speed`, and `heading` from the GPS module.
    *   **Direct Ingestion**: Sends a POST request directly to the Supabase REST API (`/rest/v1/bus_locations`) every 5 seconds. This bypasses the backend for lower latency data ingestion.

### 2.2 Backend (`/backend`)
*   **Framework**: Python with FastAPI and Uvicorn.
*   **Architecture Pattern**: Standard MVC/Service-oriented structure (`api`, `core`, `models`, `schemas`, `services`).
*   **Data Access**: Uses standard `requests` library to communicate with the Supabase REST API instead of the Supabase Python client.
*   **Key Responsibilities**:
    *   **Data Proxy**: Provides endpoints for the frontend to fetch latest locations, historical paths, and list bus stops.
    *   **Logic (ETA Calculation)**: Calculates the Estimated Time of Arrival (ETA) for a bus to upcoming stops. This is done on-the-fly using the Haversine formula (distance calculation) combined with the bus's current average speed.
    *   **Admin Tasks**: Provides a secure endpoint to create new bus stops.
    *   *(Fallback)*: Exposes a `/api/location/update` endpoint protected by an API key, which could be used if IoT devices need to go through the backend instead of Supabase directly.

### 2.3 Frontend (`/frontend`)
*   **Tech Stack**: React 18, TypeScript, Vite, TailwindCSS.
*   **State Management**: Zustand (implied by `useStore.ts` inside `/store`).
*   **Routing**: React Router (`/` for Dashboard, `/admin` for Admin).
*   **Key Features**:
    *   **Dashboard**: Displays a real-time map (likely using Leaflet or Mapbox). Polls the backend every 5 seconds for the latest `busLocation` and `etas`.
    *   **Admin Panel**: Provides forms to add new bus stops (sending data to the backend via `/api/stops`).

### 2.4 Database (Supabase)
Relies on Supabase (PostgreSQL database + Auto-generated PostgREST APIs).
Inferred core tables:
*   `bus_locations`: Stores `bus_id`, `latitude`, `longitude`, `speed`, `heading`, and `timestamp`.
*   `bus_stops`: Stores `id`, `stop_name`, `latitude`, `longitude`, `route_id`.
*   `buses`: Stores bus metadata, such as `route_id`.

---

## 3. Data Flow

### Real-Time Tracking Flow
1.  **GPS Read**: The IoT device reads coordinates from the GPS module.
2.  **Push to DB**: The IoT device sends an HTTP POST with a JSON payload containing the location data directly to Supabase via its Anon/Service key.
3.  **Frontend Polling**: The React Dashboard triggers `fetchBusLocation()` and `fetchETA()` every 5 seconds.
4.  **Backend Processing**:
    *   For location: The FastAPI backend queries Supabase for the most recent entry for the requested `bus_id`.
    *   For ETA: The backend queries the bus's location, the route's stops, calculates distance using Haversine, factors in speed, and returns the sorted ETAs.
5.  **UI Update**: The React app updates the Zustand store and renders the new map pin and ETA list.

---

## 4. Local Development

The project includes a `start.py` script that acts as an orchestrator. Running `python start.py` spawns two separate terminal instances:
1.  **Backend**: Runs `uvicorn app.main:app --reload --host 0.0.0.0 --port 8000`
2.  **Frontend**: Runs `npm run dev` (running Vite on port 5173).

## 5. Potential Improvements
*   **WebSockets vs Polling**: The frontend currently polls every 5 seconds. Moving to WebSockets (via FastAPI or Supabase Realtime subscriptions directly in the frontend) would reduce network overhead and improve real-time smoothness.
*   **IoT Security**: The IoT device currently hardcodes the `SUPABASE_ANON_KEY`. Depending on Row Level Security (RLS) in Supabase, this might be a vulnerability if not locked down to insert-only for specific tables.
