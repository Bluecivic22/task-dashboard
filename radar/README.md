# RADAR

RADAR is a complete ESP32-S3 Wi-Fi passive sensing stack composed of embedded firmware, a Node.js companion server, and a premium forged-carbon React dashboard. The system estimates environmental activity and likely presence using passive RSSI/CSI-derived features without capturing packet payloads.

## Overview
- **Firmware**: ESP32-S3 Arduino/PlatformIO project for scanning, filtering, spatial mapping, presence detection, storage, OTA, REST, and WebSocket telemetry.
- **Server**: Companion Node.js service for historical analytics, calibration reports, simulation, and richer processing.
- **Web UI**: React/Vite dashboard with forged carbon / gold visual identity, simulation mode, diagnostics, and calibration workflows.

## Hardware Requirements
- ESP32-S3-DevKitC-1 with 16 MB flash recommended
- Optional PSRAM strongly recommended for higher history retention
- Stable 5 V USB-C power source
- 1-4 passive sensing nodes placed around a room perimeter

See [HARDWARE.md](./HARDWARE.md) for placement and CSI notes.

## Quick Start
1. **Firmware**
   - Install PlatformIO.
   - Open `radar/` as a PlatformIO project.
   - Build/upload `env:esp32-s3-devkitc-1`.
2. **Server**
   - `cd radar/server`
   - `npm install`
   - `npm start`
3. **Web UI**
   - `cd radar/web`
   - `npm install`
   - `npm run dev`

## Dashboard Access
- Firmware standalone UI: device serves static assets from flash when bundled.
- Companion web dashboard: defaults to Vite dev server URL and connects via WebSocket.
- Server REST API: `/api/history`, `/api/heatmap/history`, `/api/events`, simulation endpoints.

## Simulation Mode
The browser can run fully offline synthetic telemetry. Use the **Simulation Controls** panel to inject movement, noise, sensor failure, and environmental drift without ESP32 hardware.

## Build & Test
- Firmware unit tests: `pio test -e esp32-s3-devkitc-1`
- Server tests: `cd radar/server && node --test tests/server/`
- Web tests/build: `cd radar/web && npm test && npm run build`

## Limitations
- RSSI-only presence sensing is probabilistic and environment dependent.
- CSI support on ESP32-S3 depends on ESP-IDF components and may not be available in stock Arduino builds.
- Multiperson tracking is approximate and best handled by the companion server.
- Metal obstructions, moving fans, or dynamic Wi-Fi environments reduce confidence.
