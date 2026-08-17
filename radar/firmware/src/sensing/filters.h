#pragma once

#include <algorithm>
#include <cmath>
#include <deque>
#include <numeric>
#include <vector>

class MovingAverageFilter {
 public:
  explicit MovingAverageFilter(size_t window = 5);
  float add(float value);
  float value() const;

 private:
  size_t window_;
  std::deque<float> values_;
  float sum_ = 0.0f;
};

class ExponentialSmoothingFilter {
 public:
  explicit ExponentialSmoothingFilter(float alpha = 0.3f);
  float add(float value);
  float value() const;

 private:
  float alpha_;
  bool initialized_ = false;
  float smoothed_ = 0.0f;
};

class MedianFilter {
 public:
  explicit MedianFilter(size_t window = 5);
  float add(float value);
  float value() const;

 private:
  size_t window_;
  std::deque<float> values_;
};

class OutlierRejectionFilter {
 public:
  OutlierRejectionFilter(size_t window = 12, float sigmaThreshold = 2.5f);
  float add(float value);
  bool lastRejected() const;

 private:
  float mean() const;
  float stdev() const;
  size_t window_;
  float sigmaThreshold_;
  bool rejected_ = false;
  std::deque<float> values_;
};

class BaselineTracker {
 public:
  BaselineTracker(float alpha = 0.02f, float driftThreshold = 8.0f);
  float add(float value);
  float baseline() const;
  bool isEnvironmentalChange(float value) const;
  float deviation(float value) const;

 private:
  ExponentialSmoothingFilter baselineFilter_;
  float driftThreshold_;
};
