#pragma once

#include <ESPAsyncWebServer.h>
#include <ArduinoJson.h>
#include "telemetry/telemetry.h"

class WebSocketHandler {
 public:
  WebSocketHandler();
  void begin(AsyncWebServer &server);
  void broadcast(const String &payload);
  void broadcastType(const String &type, JsonVariantConst payload);
  AsyncWebSocket &socket();

 private:
  AsyncWebSocket ws_;
};
