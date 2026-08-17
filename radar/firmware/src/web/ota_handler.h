#pragma once

#include <ESPAsyncWebServer.h>

class OTAHandler {
 public:
  void begin(AsyncWebServer &server, const String &password);
};
