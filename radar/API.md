# API Reference

## Firmware REST
### GET `/api/status`
Returns device info and system health.

### GET `/api/nodes`
Returns all configured nodes.

### POST `/api/nodes`
Create/update a node.
```json
{ "id": "n1", "name": "North", "bssid": "AA:BB:CC:DD:EE:FF", "x": 1.2, "y": 8.4, "channel": 6 }
```

### PUT `/api/nodes/{id}` / DELETE `/api/nodes/{id}`
Modify or remove a node.

### GET `/api/measurements`
Recent processed measurements.

### GET `/api/presence`
Current `PresenceEstimate`.

### GET `/api/spatial`
Current heatmap / spatial model cells.

### Calibration
- `GET /api/calibration`
- `POST /api/calibration/start`
- `POST /api/calibration/stop`
- `POST /api/calibration/baseline`

### Config/Layout
- `GET /api/config`
- `POST /api/config`
- `GET /api/layout`
- `POST /api/layout`

### Maintenance
- `GET /api/logs`
- `POST /api/restart`
- `POST /api/factory-reset`
- `POST /api/clear-history`
- `GET /api/diagnostics`

## WebSocket `/ws`
### Outbound message types
- `TELEMETRY`
- `PRESENCE`
- `NODES`
- `SPATIAL`
- `CALIBRATION`
- `SYSTEM`
- `ERROR`

### Example telemetry envelope
```json
{
  "type": "TELEMETRY",
  "payload": {
    "timestamp": 1723881600000,
    "presence_estimate": { "state": "LIKELY_PRESENCE", "confidence": 0.74 },
    "measurements": []
  }
}
```

## Server REST Additions
- `GET /api/history?start=&end=&node=`
- `GET /api/heatmap/history`
- `GET /api/events`
- `POST /api/simulation/start`
- `POST /api/simulation/stop`
- `POST /api/simulation/config`
