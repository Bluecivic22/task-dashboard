# Development

## Firmware
- Install PlatformIO in VS Code or CLI.
- Open `radar/` as the PlatformIO project root.
- Build: `pio run -e esp32-s3-devkitc-1`
- Test: `pio test -e esp32-s3-devkitc-1`
- Monitor: `pio device monitor -b 115200`

## Server
```bash
cd radar/server
npm install
npm start
```
Run tests:
```bash
node --test tests/server/
```

## Web UI
```bash
cd radar/web
npm install
npm run dev
npm test
npm run build
```

## Contributing
- Keep new files under `radar/`
- Preserve confidence-driven outputs; avoid false precision
- Prefer explicit units and graceful disconnected-state behavior
- Add targeted tests when adjusting processing logic
