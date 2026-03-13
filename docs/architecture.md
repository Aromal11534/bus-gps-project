# System Architecture

## Overview
The Smart Bus Tracking System is an IoT-based platform designed to track buses in real-time. It consists of an IoT device (ESP32 + GPS), a cloud database (Supabase), a backend API service (FastAPI), and a frontend dashboard (ReactJS).

## Components

### 1. IoT Device Layer
- **Hardware**: ESP32 microcontroller, NEO-6M GPS module.
- **Function**: Reads GPS NMEA data, parses latitude/longitude, and sends data to the backend via HTTP POST.
- **Communication**: Wi-Fi (HTTP/HTTPS).

### 2. Cloud Layer (Database)
- **Service**: Supabase (PostgreSQL).
- **Function**: Stores bus locations, routes, stops, and bus information.
- **Features**: Real-time subscriptions (optional), Row Level Security (RLS).

### 3. Backend Layer
- **Framework**: Python FastAPI.
- **Function**:
  - Receives location updates from IoT devices.
  - Exposes APIs for the frontend (bus locations, history, stops, ETA).
  - Handles business logic (ETA calculation, data validation).
- **Deployment**: Python service on VM or cloud instance.

### 4. Frontend Layer
- **Framework**: ReactJS (Vite).
- **UI Library**: TailwindCSS.
- **Map Library**: Leaflet (react-leaflet).
- **Function**: Displays real-time bus locations, routes, and ETAs on an interactive map. Admin interface for managing stops.

## Architecture Diagram

```mermaid
graph TD
    subgraph IoT_Device [IoT Device Layer]
        GPS[NEO-6M GPS Module] -->|NMEA Data| ESP32[ESP32 Microcontroller]
        ESP32 -->|HTTP POST (JSON)| Backend
    end

    subgraph Backend_Layer [Backend Layer]
        Backend[FastAPI Service]
        Backend -->|Read/Write| DB[(Supabase PostgreSQL)]
    end

    subgraph Frontend_Layer [Frontend Layer]
        Web[ReactJS Dashboard] -->|HTTP GET/POST| Backend
        Web -->|Realtime Subscriptions (Optional)| DB
    end

    User((User/Admin)) -->|View Dashboard| Web
```

## Data Flow
1. **GPS Data Acquisition**: The NEO-6M module receives signals from GPS satellites and sends NMEA sentences to the ESP32 via UART.
2. **Data Processing**: The ESP32 parses the NMEA data to extract latitude, longitude, speed, and timestamp.
3. **Data Transmission**: The ESP32 formats the data as a JSON payload and sends it to the FastAPI backend via an HTTP POST request.
4. **Data Storage**: The backend validates the data and stores it in the Supabase `bus_locations` table.
5. **Data Retrieval**: The React frontend polls the backend API (or listens to Supabase Realtime) to get the latest bus locations.
6. **Visualization**: The frontend updates the bus marker on the OpenStreetMap layer using Leaflet.
