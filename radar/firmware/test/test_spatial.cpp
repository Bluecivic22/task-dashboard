#include <unity.h>
#include "spatial/interpolation.h"
#include "spatial/spatial_model.h"

void test_idw_expected_value() {
  std::vector<InterpolationPoint> points = {{0, 0, 10, 1}, {10, 0, 20, 1}};
  float value = IDWInterpolator::interpolate(0, 0, points, 2.0f);
  TEST_ASSERT_FLOAT_WITHIN(0.001f, 10.0f, value);
}

void test_grid_updates() {
  SpatialModel model;
  SystemConfig cfg; cfg.heatmap_resolution = 4; cfg.grid_width_m = 10; cfg.grid_height_m = 10;
  model.begin(cfg);
  NodeConfig node; node.bssid = "AA"; node.x = 0; node.y = 0; node.baseline_rssi = -60; node.confidence = 1.0f;
  Measurement measurement; measurement.bssid = "AA"; measurement.rssi_smoothed = -50;
  model.update({measurement}, {node}, 2.0f);
  TEST_ASSERT_GREATER_THAN(0.0f, model.cells().front().activity_score);
}

void test_confidence_reduces_with_distance() {
  std::vector<InterpolationPoint> points = {{0, 0, 10, 1}};
  float nearConfidence = IDWInterpolator::confidence(0, 0, points);
  float farConfidence = IDWInterpolator::confidence(10, 10, points);
  TEST_ASSERT_GREATER_THAN(farConfidence, nearConfidence);
}

void setup() {
  UNITY_BEGIN();
  RUN_TEST(test_idw_expected_value);
  RUN_TEST(test_grid_updates);
  RUN_TEST(test_confidence_reduces_with_distance);
  UNITY_END();
}

void loop() {}
