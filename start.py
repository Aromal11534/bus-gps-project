import subprocess
import os
import sys
import time
import signal

def start_services():
    # Get the current directory (root of the project)
    root_dir = os.path.dirname(os.path.abspath(__file__))
    
    backend_dir = os.path.join(root_dir, "backend")
    frontend_dir = os.path.join(root_dir, "frontend")

    print("\n🚀 Starting Smart Bus Tracking System...")

    # Start Backend (FastAPI)
    print("📡 Starting Backend (FastAPI) in a new window...")
    try:
        # Use start to open in a new window on Windows
        subprocess.Popen(
            ["start", "cmd", "/k", "python", "-m", "uvicorn", "app.main:app", "--reload", "--host", "0.0.0.0", "--port", "8000"],
            cwd=backend_dir,
            shell=True
        )
    except Exception as e:
        print(f"❌ Failed to start Backend: {e}")
        return

    # Start Frontend (Vite)
    print("💻 Starting Frontend (React/Vite) in a new window...")
    try:
        subprocess.Popen(
            ["start", "cmd", "/k", "npm", "run", "dev"],
            cwd=frontend_dir,
            shell=True
        )
    except Exception as e:
        print(f"❌ Failed to start Frontend: {e}")
        return

    print("\n✅ Both services are starting in separate windows!")
    print("🔗 Backend: http://localhost:8000")
    print("🔗 Frontend: http://localhost:5173")
    print("\nClose the new windows to stop the services.\n")

if __name__ == "__main__":
    start_services()
