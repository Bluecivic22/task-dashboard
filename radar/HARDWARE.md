# Hardware Notes

## ESP32-S3 Pinout Guidance
The firmware is board-agnostic for sensing because Wi-Fi scans do not require external radios beyond the ESP32-S3 itself. Recommended optional peripherals:
- Status LED: GPIO 48
- User button: GPIO 0
- External watchdog/reset line: optional
- I2C diagnostics display (optional): GPIO 8/9

## Power Requirements
- 5 V USB-C supply
- Prefer supplies capable of 1 A for stable Wi-Fi + PSRAM usage
- Brownouts can corrupt calibration and flash writes

## Antenna Placement
- Place nodes at room edges, 1-1.5 m above ground
- Avoid direct adjacency to large metal objects or routers
- Maintain line-of-sight overlap where practical
- Separate nodes enough to maximize spatial diversity

## CSI Requirements
CSI extraction is hardware and SDK dependent:
- ESP32-S3 must have CSI hooks enabled in the underlying ESP-IDF Wi-Fi stack
- Stock Arduino builds may expose no CSI API; the project will fall back to RSSI-only mode
- Use external antennas only where your board variant supports them

## Placement Recommendations
- Minimum useful deployment: 2 nodes
- Better occupancy confidence: 3-4 nodes
- Calibrate with the room empty and during a representative walk path
