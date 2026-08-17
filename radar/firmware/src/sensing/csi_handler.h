#pragma once

#include <vector>

struct CsiFeatures {
  float mean_amplitude = 0.0f;
  float variance = 0.0f;
  float subcarrier_correlation = 0.0f;
  float temporal_gradient = 0.0f;
};

class CSIHandler {
 public:
  bool begin(bool requested);
  bool isAvailable() const;
  CsiFeatures latest() const;
  void injectSample(const std::vector<float> &amplitudes);

 private:
  bool available_ = false;
  CsiFeatures latest_;
  float previousMean_ = 0.0f;
};
