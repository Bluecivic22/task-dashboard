#include <unity.h>
#include <vector>
#include "detection/presence_detector.h"

SystemConfig configWithThresholds() {
  SystemConfig cfg;
  cfg.detection_threshold = 5.0f;
  cfg.confidence_threshold = 0.6f;
  return cfg;
}

std::vector<NodeConfig> nodes() {
  NodeConfig a; a.id = "a"; a.bssid = "AA"; a.confidence = 0.9f; a.baseline_rssi = -60.0f; a.enabled = true;
  NodeConfig b; b.id = "b"; b.bssid = "BB"; b.confidence = 0.9f; b.baseline_rssi = -60.0f; b.enabled = true; b.x = 5.0f;
  return {a, b};
}

void test_idle_without_deviation() {
  PresenceDetector detector;
  detector.begin(configWithThresholds());
  Measurement m1; m1.bssid = "AA"; m1.rssi_smoothed = -60.0f; m1.stability = 1.0f;
  auto estimate = detector.update({m1}, nodes());
  TEST_ASSERT_EQUAL(static_cast<int>(DetectionState::IDLE), static_cast<int>(estimate.state));
}

void test_possible_activity_single_node() {
  PresenceDetector detector;
  detector.begin(configWithThresholds());
  Measurement m1; m1.bssid = "AA"; m1.rssi_smoothed = -52.0f; m1.rssi_derivative = 3.0f; m1.stability = 0.8f;
  auto estimate = detector.update({m1}, nodes());
  TEST_ASSERT_EQUAL(static_cast<int>(DetectionState::POSSIBLE_ACTIVITY), static_cast<int>(estimate.state));
}

void test_likely_presence_multi_node() {
  PresenceDetector detector;
  detector.begin(configWithThresholds());
  Measurement m1; m1.bssid = "AA"; m1.rssi_smoothed = -51.0f; m1.rssi_derivative = 2.0f; m1.stability = 0.9f;
  Measurement m2; m2.bssid = "BB"; m2.rssi_smoothed = -52.0f; m2.rssi_derivative = 2.5f; m2.stability = 0.9f;
  auto estimate = detector.update({m1, m2}, nodes());
  TEST_ASSERT_EQUAL(static_cast<int>(DetectionState::LIKELY_PRESENCE), static_cast<int>(estimate.state));
}

void test_confidence_drops_with_fewer_nodes() {
  PresenceDetector detector;
  detector.begin(configWithThresholds());
  Measurement m1; m1.bssid = "AA"; m1.rssi_smoothed = -51.0f; m1.rssi_derivative = 2.0f; m1.stability = 0.9f;
  auto oneNode = detector.update({m1}, nodes());
  Measurement m2; m2.bssid = "BB"; m2.rssi_smoothed = -52.0f; m2.rssi_derivative = 2.5f; m2.stability = 0.9f;
  auto twoNodes = detector.update({m1, m2}, nodes());
  TEST_ASSERT_GREATER_THAN(oneNode.confidence, twoNodes.confidence);
}

void setup() {
  UNITY_BEGIN();
  RUN_TEST(test_idle_without_deviation);
  RUN_TEST(test_possible_activity_single_node);
  RUN_TEST(test_likely_presence_multi_node);
  RUN_TEST(test_confidence_drops_with_fewer_nodes);
  UNITY_END();
}

void loop() {}
