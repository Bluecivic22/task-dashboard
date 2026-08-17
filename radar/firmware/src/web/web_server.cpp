#include "web/web_server.h"

#include <LittleFS.h>

RadarWebServer::RadarWebServer() : server_(80) {}

bool RadarWebServer::authorized(AsyncWebServerRequest *request, const String &token) const {
  if (token.isEmpty()) return true;
  return request->hasHeader("Authorization") && request->getHeader("Authorization")->value() == "Bearer " + token;
}

void RadarWebServer::begin(ConfigManager &config,
                           NodeManager &nodes,
                           RadioEngine &radio,
                           SpatialModel &spatial,
                           PresenceDetector &detector,
                           StorageManager &storage,
                           DiagnosticsManager &diagnostics,
                           TelemetryManager &) {
  DefaultHeaders::Instance().addHeader("Access-Control-Allow-Origin", "*");
  DefaultHeaders::Instance().addHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  websocket_.begin(server_);
  api_.begin(server_, config, nodes, radio, spatial, detector, storage, diagnostics);
  ota_.begin(server_, config.get().ota_password);
  server_.serveStatic("/", LittleFS, "/").setDefaultFile("index.html");
  server_.onNotFound([](AsyncWebServerRequest *request) { request->send(404, "application/json", "{\"error\":\"not_found\"}"); });
  server_.begin();
}

void RadarWebServer::broadcastTelemetry(const String &payload) { websocket_.broadcast(payload); }
