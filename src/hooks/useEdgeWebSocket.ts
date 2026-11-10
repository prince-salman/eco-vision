import { useState, useEffect, useRef } from 'react';
import { TelemetryData } from '../types';

export interface UseEdgeWebSocketReturn {
  isConnected: boolean;
  lastPacket: TelemetryData | null;
  error: string | null;
}

export function useEdgeWebSocket(url: string = 'ws://localhost:8765'): UseEdgeWebSocketReturn {
  const [isConnected, setIsConnected] = useState(false);
  const [lastPacket, setLastPacket] = useState<TelemetryData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<number | null>(null);

  // Cumulative tracking for WebSocket stream
  const cumulativeStatsRef = useRef({
    totalCaptured: 0,
    totalSent: 0,
    cumRaw: 0,
    cumSent: 0,
    cumEnergyWh: 0,
    cumCo2Grams: 0,
    cumWaterMl: 0,
  });

  useEffect(() => {
    let isSubscribed = true;

    const connect = () => {
      try {
        const ws = new WebSocket(url);
        wsRef.current = ws;

        ws.onopen = () => {
          if (!isSubscribed) return;
          setIsConnected(true);
          setError(null);
        };

        ws.onmessage = (event) => {
          if (!isSubscribed) return;
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
              latencyMs: raw.latency_ms || 2.4,
              embeddingPreview: raw.embedding_preview || [12, -45, 98, -14, 5, 88, -23, 41, 10, -5, 34, -77],
              hardwareMemoryKb: 138,
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
          // Auto-reconnect after 3 seconds
          if (isSubscribed) {
            reconnectTimeoutRef.current = window.setTimeout(() => {
              connect();
            }, 3000);
          }
        };
      } catch (err: unknown) {
        if (!isSubscribed) return;
        const msg = err instanceof Error ? err.message : 'WebSocket initialization failed';
        setError(msg);
        setIsConnected(false);
        reconnectTimeoutRef.current = window.setTimeout(() => {
          connect();
        }, 4000);
      }
    };

    connect();

    return () => {
      isSubscribed = false;
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [url]);

  return {
    isConnected,
    lastPacket,
    error,
  };
}
