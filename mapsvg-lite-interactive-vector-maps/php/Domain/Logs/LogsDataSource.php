<?php

namespace MapSVG;

class LogsDataSource
{

  public function find($query)
  {
    $log_file = defined('WP_DEBUG_LOG') && is_string(WP_DEBUG_LOG) ? WP_DEBUG_LOG : WP_CONTENT_DIR . '/debug.log';
    if (!file_exists($log_file)) {
      $log_file = ini_get('error_log');
    }

    if (!file_exists($log_file)) {
      throw new \Exception("Debug log file not found: $log_file");
    }

    // Check if the file is readable
    if (!is_readable($log_file)) {
      throw new \Exception("Debug log file is not readable: $log_file");
    }


    try {
      $logs = $this->getLastLogs($log_file, 300);
      return $logs;
    } catch (\Exception $e) {
      throw new \Exception("Error reading debug log: " . $e->getMessage());
    }
  }

  private function getLastLogs($filepath, $n)
  {
    try {
      $file = new \SplFileObject($filepath, 'r');
    } catch (\RuntimeException $e) {
      throw new \Exception("Unable to access log file: " . $e->getMessage());
    }
    $file->seek(PHP_INT_MAX);
    $last_line = $file->key();

    $logs = [];
    $currentLog = null;
    $inStackTrace = false;

    for ($i = max(0, $last_line - $n); $i <= $last_line; $i++) {
      $file->seek($i);
      $line = rtrim($file->current());

      if (preg_match('/^\[(\d{2}-\w{3}-\d{4} \d{2}:\d{2}:\d{2} UTC)\]\s*(.*)$/', $line, $matches)) {
        if ($currentLog) {
          if (empty($currentLog['stack_trace'])) {
            unset($currentLog['stack_trace']);
          }
          $logs[] = $currentLog;
        }
        $currentLog = [
          'datetime' => $matches[1],
          'message' => stripslashes($matches[2]),
          'type' => $this->getLogType($matches[2]),
          'stack_trace' => []
        ];
        $inStackTrace = false;
      } elseif ($currentLog) {
        if (trim($line) === 'Stack trace:') {
          $inStackTrace = true;
          $currentLog['stack_trace'] = [];
        } elseif ($inStackTrace) {
          $currentLog['stack_trace'][] = stripslashes(trim($line));
        } else {
          $currentLog['message'] .= "\n" . stripslashes($line);
        }
      }
    }

    if ($currentLog) {
      if (empty($currentLog['stack_trace'])) {
        unset($currentLog['stack_trace']);
      }
      $logs[] = $currentLog;
    }

    return array_reverse($logs);
  }

  private function getLogType($message)
  {
    if (
      stripos($message, 'fatal error') !== false ||
      stripos($message, 'uncaught exception') !== false ||
      stripos($message, 'error:') !== false
    ) {
      return 'ERROR';
    } elseif (
      stripos($message, 'warning') !== false ||
      stripos($message, 'notice') !== false
    ) {
      return 'WARNING';
    } else {
      return 'INFO';
    }
  }

  public function findOne($query)
  {
    return [];
  }

  public function create($data)
  {
    return [];
  }

  public function update($data, $query)
  {
    return [];
  }

  public function delete($query)
  {
    return [];
  }

  public function isUnique(array $criteria): bool
  {
    return true;
  }
}
