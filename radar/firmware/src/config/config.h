#pragma once

#include <ArduinoJson.h>
#include <Preferences.h>
#include "common_types.h"

class ConfigManager {
 public:
  bool begin();
  const SystemConfig &get() const;
  SystemConfig &mutableConfig();
  void resetToDefaults();
  bool save();
  bool load();
  bool updateFromJson(JsonVariantConst input, String *error = nullptr);
  void toJson(JsonDocument &doc) const;
  bool validate(const SystemConfig &cfg, String *error = nullptr) const;

 private:
  NodeConfig nodeFromJson(JsonObjectConst obj) const;
  void nodeToJson(const NodeConfig &node, JsonArray array) const;
  Preferences preferences;
  bool preferencesReady = false;
  SystemConfig config;
};
