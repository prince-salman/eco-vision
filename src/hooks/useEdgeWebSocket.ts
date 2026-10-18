import { useState, useEffect, useRef, useCallback } from 'react';
import { TelemetryData } from '../types';

export interface EdgeWebSocketState {
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
  lastPacket: TelemetryData | null;
  serverUrl: string;
  setServerUrl: (url: string) => void;
  reconnect: () => void;
}

export function useEdgeWebSocket(initialUrl: string = 'ws://localhost:8765'): EdgeWebSocketState {
  const [serverUrl, setServerUrl] = useState(initialUrl);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastPacket, setLastPacket] = useState<TelemetryData | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<number | null>(null);
  const cumulativeStatsRef = useRef({
    totalCaptured: 0,
    totalSent: 0,
    cumRaw: 0,
    cumSent: 0,
    cumEnergyWh: 0,
    cumCo2Grams: 0,
    cumWaterMl: 0,
  });

  const connect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    setIsConnecting(true);
    setError(null);

    try {
      const ws = new WebSocket(serverUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setIsConnected(true);
        setIsConnecting(false);
        setError(null);
      };

      ws.onmessage = (event) => {
        try {
          const raw = JSON.parse(event.data);
          const stats = cumulativeStatsRef.current;

          stats.totalCaptured++;
          if (raw.state === 'ACTIVE' || raw.state === 'HEARTBEAT') {
            stats.totalSent++;
          }
          stats.cumRaw += raw.raw_bytes || 0;
          stats.cumSent += raw.sent_bytes || 0;

          const savedGb = Math.max(0, stats.cumRaw - stats.cumSent) / 1e9;
          const energySavedWh = (savedGb * 50) + (stats.totalCaptured - stats.totalSent) * (0.5 / 3600);
          stats.cumEnergyWh = energySavedWh;
          stats.cumCo2Grams = energySavedWh * 0.45;
          stats.cumWaterMl = energySavedWh * 0.5;

          const telemetry: TelemetryData = {
            timestamp: raw.timestamp ? raw.timestamp * 1000 : Date.now(),
            frameId: raw.frame_id || stats.totalCaptured,
            state: raw.state || 'IDLE',
            activityRatio: raw.activity_ratio || 0,
            rawBytes: raw.raw_bytes || 0,
            sentBytes: raw.sent_bytes || 0,
            savedBytes: raw.saved_bytes || 0,
            compressionRatioPct: raw.compression_ratio_pct || 0,
            currentKbps: Math.round(((raw.sent_bytes || 0) * 8 * 15) / 1000),
            baselineKbps: 4000,
            roiBox: raw.roi_box || null,
            detections: raw.detections || [],
            roiB64: raw.roi_b64 || null,
            totalCapturedFrames: stats.totalCaptured,
            totalSentFrames: stats.totalSent,
            cumulativeRawBytes: stats.cumRaw,
            cumulativeSentBytes: stats.cumSent,
            cumulativeEnergySavedWh: Math.round(stats.cumEnergyWh * 10) / 10,
            cumulativeCo2AvoidedGrams: Math.round(stats.cumCo2Grams * 10) / 10,
            cumulativeWaterSavedMl: Math.round(stats.cumWaterMl * 10) / 10,
          };

          setLastPacket(telemetry);
        } catch {
          // Ignore malformed JSON packets
        }
      };

      ws.onerror = () => {
        setError('Connection failed. Verify edge_worker.py is running on ws://localhost:8765');
        setIsConnected(false);
      };

      ws.onclose = () => {
        setIsConnected(false);
        setIsConnecting(false);
        // Automatic reconnection attempt after 3 seconds
        reconnectTimeoutRef.current = window.setTimeout(() => {
          connect();
        }, 3000);
      };
    } catch (err: unknown) {
      setIsConnecting(false);
      setIsConnected(false);
      setError(err instanceof Error ? err.message : 'WebSocket initialization error');
    }
  }, [serverUrl]);

  useEffect(() => {
    connect();
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [connect]);

  return {
    isConnected,
    isConnecting,
    error,
    lastPacket,
    serverUrl,
    setServerUrl,
    reconnect: connect,
  };
}
