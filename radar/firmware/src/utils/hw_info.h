#pragma once

#include "common_types.h"

class HardwareInfo {
 public:
  static DeviceInfo detect(bool csiAvailable);
};
