#pragma once

#include <deque>
#include <vector>
#include "common_types.h"

class MeasurementBuffer {
 public:
  explicit MeasurementBuffer(size_t capacity = 100) : capacity_(capacity) {}

  void push(const Measurement &measurement) {
    data_.push_back(measurement);
    while (data_.size() > capacity_) data_.pop_front();
  }

  bool empty() const { return data_.empty(); }
  size_t size() const { return data_.size(); }
  Measurement latest() const { return data_.empty() ? Measurement{} : data_.back(); }
  std::vector<Measurement> values() const { return std::vector<Measurement>(data_.begin(), data_.end()); }

 private:
  size_t capacity_;
  std::deque<Measurement> data_;
};
