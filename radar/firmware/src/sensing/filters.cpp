#include "sensing/filters.h"

MovingAverageFilter::MovingAverageFilter(size_t window) : window_(window) {}

float MovingAverageFilter::add(float value) {
  values_.push_back(value);
  sum_ += value;
  while (values_.size() > window_) {
    sum_ -= values_.front();
    values_.pop_front();
  }
  return this->value();
}

float MovingAverageFilter::value() const { return values_.empty() ? 0.0f : sum_ / values_.size(); }

ExponentialSmoothingFilter::ExponentialSmoothingFilter(float alpha) : alpha_(alpha) {}

float ExponentialSmoothingFilter::add(float value) {
  if (!initialized_) {
    smoothed_ = value;
    initialized_ = true;
  } else {
    smoothed_ = (alpha_ * value) + ((1.0f - alpha_) * smoothed_);
  }
  return smoothed_;
}

float ExponentialSmoothingFilter::value() const { return smoothed_; }

MedianFilter::MedianFilter(size_t window) : window_(window) {}

float MedianFilter::add(float value) {
  values_.push_back(value);
  while (values_.size() > window_) values_.pop_front();
  return this->value();
}

float MedianFilter::value() const {
  if (values_.empty()) return 0.0f;
  std::vector<float> sorted(values_.begin(), values_.end());
  std::sort(sorted.begin(), sorted.end());
  const size_t mid = sorted.size() / 2;
  if (sorted.size() % 2 == 0) return (sorted[mid - 1] + sorted[mid]) / 2.0f;
  return sorted[mid];
}

OutlierRejectionFilter::OutlierRejectionFilter(size_t window, float sigmaThreshold)
    : window_(window), sigmaThreshold_(sigmaThreshold) {}

float OutlierRejectionFilter::mean() const {
  if (values_.empty()) return 0.0f;
  return std::accumulate(values_.begin(), values_.end(), 0.0f) / values_.size();
}

float OutlierRejectionFilter::stdev() const {
  if (values_.size() < 2) return 0.0f;
  const float avg = mean();
  float sum = 0.0f;
  for (float value : values_) sum += (value - avg) * (value - avg);
  return std::sqrt(sum / values_.size());
}

float OutlierRejectionFilter::add(float value) {
  rejected_ = false;
  if (values_.size() >= 3) {
    const float sigma = stdev();
    if (sigma > 0.0f && std::fabs(value - mean()) > sigmaThreshold_ * sigma) {
      rejected_ = true;
      return values_.back();
    }
  }
  values_.push_back(value);
  while (values_.size() > window_) values_.pop_front();
  return value;
}

bool OutlierRejectionFilter::lastRejected() const { return rejected_; }

BaselineTracker::BaselineTracker(float alpha, float driftThreshold)
    : baselineFilter_(alpha), driftThreshold_(driftThreshold) {}

float BaselineTracker::add(float value) { return baselineFilter_.add(value); }
float BaselineTracker::baseline() const { return baselineFilter_.value(); }
float BaselineTracker::deviation(float value) const { return value - baseline(); }
bool BaselineTracker::isEnvironmentalChange(float value) const { return std::fabs(deviation(value)) >= driftThreshold_; }
