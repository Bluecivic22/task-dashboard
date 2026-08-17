#include "storage/storage.h"

bool StorageManager::begin() { return LittleFS.begin(true); }

bool StorageManager::saveJson(const String &path, JsonDocument &doc) {
  File file = LittleFS.open(path, FILE_WRITE);
  if (!file) return false;
  serializeJsonPretty(doc, file);
  file.close();
  return true;
}

bool StorageManager::loadJson(const String &path, JsonDocument &doc) {
  File file = LittleFS.open(path, FILE_READ);
  if (!file) return false;
  auto err = deserializeJson(doc, file);
  file.close();
  return err == DeserializationError::Ok;
}

bool StorageManager::saveLayout(JsonDocument &doc) { return saveJson("/layout.json", doc); }
bool StorageManager::loadLayout(JsonDocument &doc) { return loadJson("/layout.json", doc); }

bool StorageManager::appendEvent(const String &eventType, JsonVariantConst payload) {
  JsonDocument doc;
  loadJson("/events.json", doc);
  JsonArray events = doc["events"].is<JsonArray>() ? doc["events"].as<JsonArray>() : doc["events"].to<JsonArray>();
  JsonObject event = events.add<JsonObject>();
  event["type"] = eventType;
  event["timestamp"] = millis();
  event["payload"] = payload;
  return saveJson("/events.json", doc);
}

void StorageManager::prune(uint32_t) {
  if (LittleFS.totalBytes() == 0) return;
  const float usage = static_cast<float>(LittleFS.usedBytes()) / LittleFS.totalBytes();
  if (usage > 0.85f) {
    LittleFS.remove("/history.bin");
  }
}

bool StorageManager::clearHistory() {
  LittleFS.remove("/events.json");
  LittleFS.remove("/history.bin");
  LittleFS.remove("/measurements.json");
  return true;
}
