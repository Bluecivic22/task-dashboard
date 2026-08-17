#include <unity.h>
#include <ArduinoJson.h>
#include "config/config.h"

void test_default_config() {
  ConfigManager manager;
  manager.resetToDefaults();
  TEST_ASSERT_EQUAL(2000, manager.get().sampling_rate_ms);
  TEST_ASSERT_EQUAL_FLOAT(0.3f, manager.get().smoothing_alpha);
}

void test_invalid_values_rejected() {
  ConfigManager manager;
  manager.resetToDefaults();
  JsonDocument doc;
  doc["smoothing_alpha"] = 2.0f;
  String error;
  TEST_ASSERT_FALSE(manager.updateFromJson(doc.as<JsonVariantConst>(), &error));
}

void test_round_trip() {
  ConfigManager manager;
  manager.resetToDefaults();
  JsonDocument out;
  manager.toJson(out);
  ConfigManager other;
  other.resetToDefaults();
  String error;
  TEST_ASSERT_TRUE(other.updateFromJson(out.as<JsonVariantConst>(), &error));
  TEST_ASSERT_EQUAL(manager.get().heatmap_resolution, other.get().heatmap_resolution);
}

void setup() {
  UNITY_BEGIN();
  RUN_TEST(test_default_config);
  RUN_TEST(test_invalid_values_rejected);
  RUN_TEST(test_round_trip);
  UNITY_END();
}

void loop() {}
