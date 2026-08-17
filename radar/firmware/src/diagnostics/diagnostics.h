#pragma once

#include <ESPAsyncWebServer.h>
#include <ArduinoJson.h>
#include "common_types.h"
#include "nodes/node_manager.h"
#include "utils/logger.h"

class DiagnosticsManager {
 public:
  void begin(const DeviceInfo &deviceInfo, const NodeManager *nodes);
  void exportJson(JsonDocument &doc) const;
  bool selfTest() const;
  void logsResponse(AsyncWebServerRequest *request) const;

 private:
  DeviceInfo info_;
  const NodeManager *nodes_ = nullptr;
};
