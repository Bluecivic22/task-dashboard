# Architecture

## Layers
### Firmware
1. **Config/Storage**: versioned configuration, retention policies, persisted layouts/calibration.
2. **Sensing**: RSSI scan engine plus optional CSI abstraction.
3. **Spatial**: IDW interpolation into a 2D grid of `SpatialCell` values.
4. **Detection**: temporal/multi-node fusion and hysteretic state machine.
5. **Telemetry/Web**: REST, WebSocket, diagnostics, OTA.

### Server
- Receives telemetry relay streams
- Stores measurements and events in SQLite
- Performs stronger temporal analysis, position smoothing, and calibration analytics
- Hosts simulation for development and demos

### Web UI
- WebSocket-driven global `RadarContext`
- Diagnostics, floor plan editing, calibration, settings, and dashboard views
- Client-side interpolation for smooth rendering and offline simulation support

## Data Flow
1. Firmware scans nearby access points and updates per-BSSID buffers.
2. Filters smooth transient noise and track baseline drift.
3. Node measurements are spatially interpolated into a heatmap.
4. Presence detector fuses deviation, derivative, correlation, and node confidence.
5. Telemetry broadcasts JSON snapshots.
6. Server stores/augments telemetry and serves historical APIs.
7. Web UI renders real-time and historical views.

## AI/ML Design Philosophy
This project intentionally favors transparent signal processing over opaque black-box inference on-device:
- explainable features
- explicit confidence scores
- graceful degradation when CSI is absent
- server-side extensibility for stronger tracking models

## Interfaces
- **Firmware REST**: operational control, diagnostics, calibration, configuration
- **Firmware WebSocket**: near-real-time telemetry and control messages
- **Server REST**: historical queries, replay, simulation
- **Server/WebSocket**: relay + processed insights
