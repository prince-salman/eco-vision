import uvicorn
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

if __name__ == "__main__":
    print("==================================================================")
    print(" Eco-Vision Production Backend Server v2.4")
    print(" REST API Docs: http://localhost:8001/api/docs")
    print(" WebSocket Hub: ws://localhost:8001/ws/telemetry")
    print("==================================================================")
    uvicorn.run("app.main:app", host="0.0.0.0", port=8001, reload=True)
