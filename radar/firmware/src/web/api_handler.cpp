#include "web/api_handler.h"

#include <ArduinoJson.h>

namespace {
String getNodeIdFromUrl(AsyncWebServerRequest *request) {
  String url = request->url();
  int pos = url.lastIndexOf('/');
  return pos >= 0 ? url.substring(pos + 1) : "";
}
}

void ApiHandler::begin(AsyncWebServer &server,
                       ConfigManager &config,
                       NodeManager &nodes,
                       RadioEngine &radio,
                       SpatialModel &spatial,
                       PresenceDetector &detector,
                       StorageManager &storage,
                       DiagnosticsManager &diagnostics) {
  server.on("/api/status", HTTP_GET, [&](AsyncWebServerRequest *request) {
    JsonDocument doc;
    diagnostics.exportJson(doc);
    String body;
    serializeJson(doc, body);
    request->send(200, "application/json", body);
  });

  server.on("/api/nodes", HTTP_GET, [&](AsyncWebServerRequest *request) {
    JsonDocument doc;
    JsonArray arr = doc["nodes"].to<JsonArray>();
    for (const auto &node : nodes.allNodes()) {
      JsonObject obj = arr.add<JsonObject>();
      obj["id"] = node.config.id;
      obj["name"] = node.config.name;
      obj["bssid"] = node.config.bssid;
      obj["x"] = node.config.x;
      obj["y"] = node.config.y;
      obj["channel"] = node.config.channel;
      obj["enabled"] = node.config.enabled;
      obj["calibrated"] = node.config.calibrated;
      obj["confidence"] = node.config.confidence;
    }
    String body;
    serializeJson(doc, body);
    request->send(200, "application/json", body);
  });

  server.on("/api/nodes", HTTP_POST, [&](AsyncWebServerRequest *request) {}, nullptr,
            [&](AsyncWebServerRequest *request, uint8_t *data, size_t len, size_t, size_t) {
              JsonDocument doc;
              deserializeJson(doc, data, len);
              NodeConfig node;
              node.id = String((const char *)(doc["id"] | ""));
              node.name = String((const char *)(doc["name"] | ""));
              node.bssid = String((const char *)(doc["bssid"] | ""));
              node.x = doc["x"] | 0.0f;
              node.y = doc["y"] | 0.0f;
              node.channel = doc["channel"] | 0;
              node.enabled = doc["enabled"] | true;
              node.calibrated = doc["calibrated"] | false;
              node.baseline_rssi = doc["baseline_rssi"] | -60.0f;
              node.confidence = doc["confidence"] | 0.5f;
              request->send(nodes.addNode(node) ? 201 : 409, "application/json", "{\"ok\":true}");
            });

  server.on("/api/nodes/.*", HTTP_PUT, [&](AsyncWebServerRequest *request) {}, nullptr,
            [&](AsyncWebServerRequest *request, uint8_t *data, size_t len, size_t, size_t) {
              JsonDocument doc;
              deserializeJson(doc, data, len);
              NodeConfig node;
              node.id = getNodeIdFromUrl(request);
              node.name = String((const char *)(doc["name"] | node.id.c_str()));
              node.bssid = String((const char *)(doc["bssid"] | ""));
              node.x = doc["x"] | 0.0f;
              node.y = doc["y"] | 0.0f;
              node.channel = doc["channel"] | 0;
              node.enabled = doc["enabled"] | true;
              node.calibrated = doc["calibrated"] | false;
              node.baseline_rssi = doc["baseline_rssi"] | -60.0f;
              node.confidence = doc["confidence"] | 0.5f;
              request->send(nodes.updateNode(node) ? 200 : 404, "application/json", "{\"ok\":true}");
            });

  server.on("/api/nodes/.*", HTTP_DELETE, [&](AsyncWebServerRequest *request) {
    request->send(nodes.removeNode(getNodeIdFromUrl(request)) ? 200 : 404, "application/json", "{\"ok\":true}");
  });

  server.on("/api/measurements", HTTP_GET, [&](AsyncWebServerRequest *request) {
    JsonDocument doc;
    JsonArray arr = doc["measurements"].to<JsonArray>();
    for (const auto &measurement : radio.latestMeasurements()) {
      JsonObject obj = arr.add<JsonObject>();
      obj["bssid"] = measurement.bssid;
      obj["ssid"] = measurement.ssid;
      obj["rssi"] = measurement.rssi;
      obj["rssi_smoothed"] = measurement.rssi_smoothed;
      obj["rssi_variance"] = measurement.rssi_variance;
      obj["rssi_derivative"] = measurement.rssi_derivative;
    }
    String body;
    serializeJson(doc, body);
    request->send(200, "application/json", body);
  });

  server.on("/api/presence", HTTP_GET, [&](AsyncWebServerRequest *request) {
    JsonDocument doc;
    const auto presence = detector.latest();
    doc["state"] = static_cast<int>(presence.state);
    doc["presence_probability"] = presence.presence_probability;
    doc["movement_probability"] = presence.movement_probability;
    doc["confidence"] = presence.confidence;
    String body;
    serializeJson(doc, body);
    request->send(200, "application/json", body);
  });

  server.on("/api/spatial", HTTP_GET, [&](AsyncWebServerRequest *request) {
    JsonDocument doc;
    spatial.getHeatmapData(doc);
    String body;
    serializeJson(doc, body);
    request->send(200, "application/json", body);
  });

  server.on("/api/calibration", HTTP_GET, [&](AsyncWebServerRequest *request) {
    request->send(200, "application/json", "{\"active\":false,\"quality\":0.0}");
  });
  server.on("/api/calibration/start", HTTP_POST, [&](AsyncWebServerRequest *request) { request->send(202, "application/json", "{\"started\":true}"); });
  server.on("/api/calibration/stop", HTTP_POST, [&](AsyncWebServerRequest *request) { request->send(200, "application/json", "{\"stopped\":true}"); });
  server.on("/api/calibration/baseline", HTTP_POST, [&](AsyncWebServerRequest *request) { request->send(200, "application/json", "{\"baseline_recorded\":true}"); });

  server.on("/api/config", HTTP_GET, [&](AsyncWebServerRequest *request) {
    JsonDocument doc;
    config.toJson(doc);
    String body;
    serializeJson(doc, body);
    request->send(200, "application/json", body);
  });
  server.on("/api/config", HTTP_POST, [&](AsyncWebServerRequest *request) {}, nullptr,
            [&](AsyncWebServerRequest *request, uint8_t *data, size_t len, size_t, size_t) {
              JsonDocument doc;
              deserializeJson(doc, data, len);
              String error;
              if (config.updateFromJson(doc.as<JsonVariantConst>(), &error)) {
                request->send(200, "application/json", "{\"saved\":true}");
              } else {
                request->send(400, "application/json", String("{\"saved\":false,\"error\":\"") + error + "\"}");
              }
            });

  server.on("/api/layout", HTTP_GET, [&](AsyncWebServerRequest *request) {
    JsonDocument doc;
    storage.loadLayout(doc);
    String body;
    serializeJson(doc, body);
    request->send(200, "application/json", body);
  });
  server.on("/api/layout", HTTP_POST, [&](AsyncWebServerRequest *request) {}, nullptr,
            [&](AsyncWebServerRequest *request, uint8_t *data, size_t len, size_t, size_t) {
              JsonDocument doc;
              deserializeJson(doc, data, len);
              request->send(storage.saveLayout(doc) ? 200 : 500, "application/json", "{\"saved\":true}");
            });

  server.on("/api/logs", HTTP_GET, [&](AsyncWebServerRequest *request) { diagnostics.logsResponse(request); });
  server.on("/api/restart", HTTP_POST, [&](AsyncWebServerRequest *request) { request->send(202, "application/json", "{\"restart\":true}"); ESP.restart(); });
  server.on("/api/factory-reset", HTTP_POST, [&](AsyncWebServerRequest *request) { storage.clearHistory(); config.resetToDefaults(); config.save(); request->send(200, "application/json", "{\"factory_reset\":true}"); });
  server.on("/api/clear-history", HTTP_POST, [&](AsyncWebServerRequest *request) { storage.clearHistory(); request->send(200, "application/json", "{\"cleared\":true}"); });
  server.on("/api/diagnostics", HTTP_GET, [&](AsyncWebServerRequest *request) {
    JsonDocument doc;
    diagnostics.exportJson(doc);
    String body;
    serializeJson(doc, body);
    request->send(200, "application/json", body);
  });
}
