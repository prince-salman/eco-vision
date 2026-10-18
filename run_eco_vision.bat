@echo off
title Eco-Vision Architecture Launcher
echo ===================================================================
echo               ECO-VISION ARCHITECTURE LAUNCHER
echo      7th International Youth Summit (IYS) Essay Competition
echo                      President University
echo ===================================================================
echo.
echo [1/2] Starting Python Edge Worker WebSocket server on ws://localhost:8765...
start "Eco-Vision Python Edge Worker" cmd /k "python edge/edge_worker.py --source 0 --port 8765"

echo [2/2] Starting React + Vite Web Dashboard on http://localhost:5173...
echo.
echo Opening browser...
start http://localhost:5173
npm run dev

pause
