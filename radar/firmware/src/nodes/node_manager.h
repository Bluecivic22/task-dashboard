#pragma once

#include <vector>
#include "config/config.h"
#include "nodes/node.h"

class NodeManager {
 public:
  void loadFromConfig(const SystemConfig &config);
  void saveToConfig(SystemConfig &config) const;
  std::vector<NodeConfig> getActiveNodes() const;
  std::vector<Node> allNodes() const;
  Node *getNodeById(const String &id);
  bool addNode(const NodeConfig &node);
  bool removeNode(const String &id);
  bool updateNode(const NodeConfig &node);
  Node *matchMeasurement(const Measurement &measurement);
  void updateNodeState(const String &id, bool calibrated, float baseline, float confidence);

 private:
  std::vector<Node> nodes_;
};
