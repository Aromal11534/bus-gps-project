# Setup Instructions

## Prerequisites
- **Node.js** (v18+)
- **Python** (v3.9+)
- **Supabase Account**
- **Arduino IDE** 2.x (for ESP32 firmware upload)

## 1. Database Setup (Supabase)
1. Create a new project in Supabase.
2. Go to the SQL Editor and run the schema script provided in `docs/database_schema.md` (or use the migration files in `backend/migrations` if available).
3. Get your `SUPABASE_URL` and `SUPABASE_KEY` (Anon & Service Role).

## 2. Backend Setup
1. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```
2. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Create a `.env` file based on `.env.example`:
   ```ini
   SUPABASE_URL=your_supabase_url
   SUPABASE_KEY=your_supabase_service_key
   IOT_API_KEY=optional_device_api_key
   ```
5. Run the server:
   ```bash
   uvicorn app.main:app --reload
   ```

## 3. Frontend Setup
1. Navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file:
   ```ini
   VITE_API_URL=http://localhost:8000/api
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```
4. Run the development server:
   ```bash
   npm run dev
   ```

## 4. IoT Device Setup
1. Open Arduino IDE and install **ESP32 by Espressif Systems** from Boards Manager.
2. Install libraries from Library Manager: **TinyGPSPlus** and **ArduinoJson**.
3. Open sketch file `iot/SmartBusTracker/SmartBusTracker.ino`.
4. Update `WIFI_SSID`, `WIFI_PASSWORD`, `API_URL`, `API_KEY`, and `BUS_ID`.
5. Select your ESP32 board and COM port, then upload the sketch.
6. Open Serial Monitor at `115200` baud to verify Wi-Fi, GPS lock, and upload status.
