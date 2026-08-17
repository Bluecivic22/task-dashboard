#pragma once

#include <Arduino.h>
#include <deque>
#include <map>
#include <vector>

struct LogEntry {
  uint64_t timestamp = 0;
  String level;
  String subsystem;
  String message;
};

enum class LogLevel : uint8_t { ERROR = 0, WARN = 1, INFO = 2, DEBUG = 3, TRACE = 4 };

class Logger {
 public:
  static Logger &instance();
  void begin(LogLevel level = LogLevel::INFO);
  void setLevel(LogLevel level);
  void log(LogLevel level, const String &subsystem, const String &message);
  std::vector<LogEntry> recent() const;

 private:
  Logger() = default;
  bool shouldEmit(LogLevel level) const;
  bool isRateLimited(const String &key, uint64_t now);
  String levelName(LogLevel level) const;

  LogLevel currentLevel = LogLevel::INFO;
  std::deque<LogEntry> buffer;
  std::map<String, uint64_t> lastEmission;
  size_t maxEntries = 100;
  uint32_t rateLimitMs = 250;
};

#define LOG_ERROR(subsystem, message) Logger::instance().log(LogLevel::ERROR, subsystem, message)
#define LOG_WARN(subsystem, message) Logger::instance().log(LogLevel::WARN, subsystem, message)
#define LOG_INFO(subsystem, message) Logger::instance().log(LogLevel::INFO, subsystem, message)
#define LOG_DEBUG(subsystem, message) Logger::instance().log(LogLevel::DEBUG, subsystem, message)
#define LOG_TRACE(subsystem, message) Logger::instance().log(LogLevel::TRACE, subsystem, message)
