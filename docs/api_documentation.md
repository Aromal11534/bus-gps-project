# API Documentation

The backend exposes a RESTful API built with FastAPI.

## Base URL
`http://localhost:8000` (Local development)

## Endpoints

### Bus Location

#### 1. Update Bus Location
Receives GPS data from the IoT device.

- **URL**: `/api/location/update`
- **Method**: `POST`
- **Request Body**:
  ```json
  {
    "bus_id": "BUS101",
    "latitude": 9.9312,
    "longitude": 76.2673,
    "speed": 35.5,
    "heading": 90.0,
    "timestamp": "2023-10-27T10:00:00Z"
  }
  ```
- **Response**: `200 OK`
  ```json
  {
    "status": "success",
    "message": "Location updated"
  }
  ```

#### 2. Get Latest Bus Location
Retrieves the most recent location for a specific bus.

- **URL**: `/api/bus/{bus_id}/location`
- **Method**: `GET`
- **Response**: `200 OK`
  ```json
  {
    "bus_id": "BUS101",
    "latitude": 9.9312,
    "longitude": 76.2673,
    "speed": 35.5,
    "last_updated": "2023-10-27T10:00:00Z"
  }
  ```

#### 3. Get Bus Location History
Retrieves historical path for a bus (e.g., last 1 hour).

- **URL**: `/api/bus/{bus_id}/history`
- **Method**: `GET`
- **Query Params**: `limit` (default 100)
- **Response**: `200 OK`
  ```json
  [
    { "latitude": 9.9312, "longitude": 76.2673, "speed": 30.0, "heading": 88.2, "timestamp": "..." },
    { "latitude": 9.9310, "longitude": 76.2670, "speed": 29.5, "heading": 90.0, "timestamp": "..." }
  ]
  ```

#### 4. Get ETA
Calculates estimated time of arrival to upcoming stops.

- **URL**: `/api/bus/{bus_id}/eta`
- **Method**: `GET`
- **Response**: `200 OK`
  ```json
  [
    {
      "stop_id": "stop-uuid-1",
      "stop_name": "Central Station",
      "eta_minutes": 5
    },
    {
      "stop_id": "stop-uuid-2",
      "stop_name": "Market Road",
      "eta_minutes": 12
    }
  ]
  ```

### Bus Stops

#### 5. Get All Stops
Retrieves a list of all bus stops.

- **URL**: `/api/stops`
- **Method**: `GET`
- **Response**: `200 OK`
  ```json
  [
    {
      "id": "uuid",
      "stop_name": "Central Station",
      "latitude": 9.9350,
      "longitude": 76.2700
    }
  ]
  ```

#### 6. Add Bus Stop
Adds a new bus stop (Admin only).

- **URL**: `/api/stops`
- **Method**: `POST`
- **Request Body**:
  ```json
  {
    "stop_name": "New Stop",
    "latitude": 9.9400,
    "longitude": 76.2800,
    "route_id": "route-uuid"
  }
  ```
- **Response**: `201 Created`

## Authentication
- **API Key**: Used for `/api/location/update` when `IOT_API_KEY` is configured (Header: `X-API-Key`).
- **JWT**: Not yet enabled in this version.
