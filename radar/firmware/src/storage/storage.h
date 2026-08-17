#pragma once

#include <ArduinoJson.h>
#include <LittleFS.h>

class StorageManager {
 public:
  bool begin();
  bool saveJson(const String &path, JsonDocument &doc);
  bool loadJson(const String &path, JsonDocument &doc);
  bool saveLayout(JsonDocument &doc);
  bool loadLayout(JsonDocument &doc);
  bool appendEvent(const String &eventType, JsonVariantConst payload);
  void prune(uint32_t retentionHours);
  bool clearHistory();
};
