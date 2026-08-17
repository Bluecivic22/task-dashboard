#include <unity.h>
#include "sensing/filters.h"

void test_moving_average_converges() {
  MovingAverageFilter filter(3);
  filter.add(1.0f);
  filter.add(2.0f);
  TEST_ASSERT_FLOAT_WITHIN(0.001f, 2.0f, filter.add(3.0f));
}

void test_ema_extremes() {
  ExponentialSmoothingFilter zeroAlpha(0.0f);
  zeroAlpha.add(10.0f);
  TEST_ASSERT_FLOAT_WITHIN(0.001f, 10.0f, zeroAlpha.add(20.0f));
  ExponentialSmoothingFilter oneAlpha(1.0f);
  oneAlpha.add(10.0f);
  TEST_ASSERT_FLOAT_WITHIN(0.001f, 20.0f, oneAlpha.add(20.0f));
}

void test_median_filter() {
  MedianFilter filter(5);
  filter.add(1.0f);
  filter.add(100.0f);
  filter.add(2.0f);
  TEST_ASSERT_FLOAT_WITHIN(0.001f, 2.0f, filter.add(3.0f));
}

void test_outlier_rejection() {
  OutlierRejectionFilter filter(8, 1.5f);
  filter.add(1.0f); filter.add(1.1f); filter.add(0.9f); filter.add(1.05f);
  filter.add(10.0f);
  TEST_ASSERT_TRUE(filter.lastRejected());
}

void test_baseline_tracker_stabilizes() {
  BaselineTracker tracker(0.2f, 5.0f);
  for (int i = 0; i < 20; ++i) tracker.add(-60.0f);
  TEST_ASSERT_FLOAT_WITHIN(0.5f, -60.0f, tracker.baseline());
}

void setup() {
  UNITY_BEGIN();
  RUN_TEST(test_moving_average_converges);
  RUN_TEST(test_ema_extremes);
  RUN_TEST(test_median_filter);
  RUN_TEST(test_outlier_rejection);
  RUN_TEST(test_baseline_tracker_stabilizes);
  UNITY_END();
}

void loop() {}
