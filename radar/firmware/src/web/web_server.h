#pragma once

#include <ESPAsyncWebServer.h>
#include "config/config.h"
#include "diagnostics/diagnostics.h"
#include "storage/storage.h"
#include "telemetry/telemetry.h"
#include "web/api_handler.h"
#include "web/ota_handler.h"
#include "web/websocket_handler.h"

class RadarWebServer {
 public:
  RadarWebServer();
  void begin(ConfigManager &config,
             NodeManager &nodes,
             RadioEngine &radio,
             SpatialModel &spatial,
             PresenceDetector &detector,
             StorageManager &storage,
             DiagnosticsManager &diagnostics,
             TelemetryManager &telemetry);
  void broadcastTelemetry(const String &payload);

 private:
  bool authorized(AsyncWebServerRequest *request, const String &token) const;
  AsyncWebServer server_;
  WebSocketHandler websocket_;
  ApiHandler api_;
  OTAHandler ota_;
};
