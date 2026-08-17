#include "utils/logger.h"

Logger &Logger::instance() {
  static Logger logger;
  return logger;
}

void Logger::begin(LogLevel level) {
  currentLevel = level;
  Serial.begin(115200);
}

void Logger::setLevel(LogLevel level) { currentLevel = level; }

bool Logger::shouldEmit(LogLevel level) const {
  return static_cast<uint8_t>(level) <= static_cast<uint8_t>(currentLevel);
}

String Logger::levelName(LogLevel level) const {
  switch (level) {
    case LogLevel::ERROR: return "ERROR";
    case LogLevel::WARN: return "WARN";
    case LogLevel::INFO: return "INFO";
    case LogLevel::DEBUG: return "DEBUG";
    case LogLevel::TRACE: return "TRACE";
  }
  return "INFO";
}

bool Logger::isRateLimited(const String &key, uint64_t now) {
  auto it = lastEmission.find(key);
  if (it != lastEmission.end() && now - it->second < rateLimitMs) {
    return true;
  }
  lastEmission[key] = now;
  return false;
}

void Logger::log(LogLevel level, const String &subsystem, const String &message) {
  if (!shouldEmit(level)) {
    return;
  }
  const uint64_t now = millis();
  const String signature = subsystem + ":" + message;
  if (isRateLimited(signature, now)) {
    return;
  }

  LogEntry entry{now, levelName(level), subsystem, message};
  buffer.push_back(entry);
  while (buffer.size() > maxEntries) {
    buffer.pop_front();
  }

  Serial.printf("[%llu][%s][%s] %s
", entry.timestamp, entry.level.c_str(), subsystem.c_str(), message.c_str());
}

std::vector<LogEntry> Logger::recent() const {
  return std::vector<LogEntry>(buffer.begin(), buffer.end());
}
