# Troubleshooting

## No detections
- Verify at least 2 enabled nodes are calibrated.
- Check channel/BSSID mapping.
- Confirm baseline duration was long enough.
- Lower detection threshold only after reviewing noise levels.

## Frequent false positives
- Inspect fans, HVAC, blinds, and reflective metal surfaces.
- Review recent logs and variance charts.
- Re-calibrate with a quieter RF environment.
- Increase smoothing and confidence thresholds.

## Web dashboard disconnected
- Confirm firmware/server WebSocket URL.
- Check token mismatch.
- Use simulation mode to isolate UI issues.

## CSI unavailable
- Expected on many stock Arduino ESP32-S3 builds.
- Ensure ESP-IDF CSI support is enabled if required.

## Storage or performance problems
- Lower history retention.
- Reduce heatmap resolution.
- Enable pruning and inspect diagnostics for free space and heap.
