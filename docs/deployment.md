# Deployment Instructions

## Backend Deployment

Deploy the backend directly using Python and a process manager.

1. **Prepare backend environment**:
   ```bash
   cd backend
   python -m venv venv
   venv\Scripts\activate
   pip install -r requirements.txt
   ```

2. **Create production environment file**:
   ```ini
   SUPABASE_URL=your_supabase_url
   SUPABASE_KEY=your_supabase_service_key
   IOT_API_KEY=optional_device_api_key
   ```

3. **Run FastAPI with Uvicorn**:
   ```bash
   uvicorn app.main:app --host 0.0.0.0 --port 8000
   ```

4. **Run as a background service**:
   - Use NSSM/WinSW on Windows.
   - Use systemd/supervisor on Linux.

## Frontend Deployment (Static Site)

The frontend can be deployed to Vercel, Netlify, or any static site host.

1. **Build the Project**:
   ```bash
   cd frontend
   npm run build
   ```
   This generates a `dist` folder.

2. **Deploy**:
   - **Vercel**: Run `vercel` in the project root.
   - **Netlify**: Drag and drop the `dist` folder to the Netlify dashboard.

## Database
The database is managed by Supabase, so no manual deployment is needed. Ensure RLS policies are correctly applied for production security.

## IoT Device
Once the firmware is flashed, the ESP32 runs independently. Ensure it has a stable power source (USB power bank or 5V adapter) and Wi-Fi access.
