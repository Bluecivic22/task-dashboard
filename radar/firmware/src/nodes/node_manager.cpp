#include "nodes/node_manager.h"

void NodeManager::loadFromConfig(const SystemConfig &config) {
  nodes_.clear();
  for (const auto &item : config.node_list) nodes_.push_back(Node{item, {}});
}

void NodeManager::saveToConfig(SystemConfig &config) const {
  config.node_list.clear();
  for (const auto &node : nodes_) config.node_list.push_back(node.config);
}

std::vector<NodeConfig> NodeManager::getActiveNodes() const {
  std::vector<NodeConfig> active;
  for (const auto &node : nodes_) if (node.config.enabled) active.push_back(node.config);
  return active;
}

std::vector<Node> NodeManager::allNodes() const { return nodes_; }

Node *NodeManager::getNodeById(const String &id) {
  for (auto &node : nodes_) if (node.config.id == id) return &node;
  return nullptr;
}

bool NodeManager::addNode(const NodeConfig &node) {
  if (getNodeById(node.id)) return false;
  nodes_.push_back(Node{node, {}});
  return true;
}

bool NodeManager::removeNode(const String &id) {
  for (auto it = nodes_.begin(); it != nodes_.end(); ++it) {
    if (it->config.id == id) {
      nodes_.erase(it);
      return true;
    }
  }
  return false;
}

bool NodeManager::updateNode(const NodeConfig &node) {
  if (auto *existing = getNodeById(node.id)) {
    existing->config = node;
    return true;
  }
  return false;
}

Node *NodeManager::matchMeasurement(const Measurement &measurement) {
  for (auto &node : nodes_) {
    if (!node.config.enabled) continue;
    const bool bssidMatch = !node.config.bssid.isEmpty() && node.config.bssid.equalsIgnoreCase(measurement.bssid);
    const bool channelMatch = node.config.channel == 0 || node.config.channel == measurement.channel;
    if (bssidMatch && channelMatch) {
      node.last_measurement = measurement;
      return &node;
    }
  }
  return nullptr;
}

void NodeManager::updateNodeState(const String &id, bool calibrated, float baseline, float confidence) {
  if (auto *node = getNodeById(id)) {
    node->config.calibrated = calibrated;
    node->config.baseline_rssi = baseline;
    node->config.confidence = confidence;
  }
}
