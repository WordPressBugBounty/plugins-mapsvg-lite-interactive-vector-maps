<?php

namespace MapSVG;

/**
 * Class for enabling debug logging in wp-config.php
 *
 * @since 1.0.0
 */
class LogConfig
{

  private $wpConfigPath;

  /**
   * Class constructor
   */
  public function __construct()
  {
    $this->wpConfigPath = $this->findWpConfig();
  }

  /**
   * Find wp-config.php file
   *
   * @return string|null Path to wp-config.php or null if not found
   */
  private function findWpConfig()
  {
    if (file_exists(ABSPATH . 'wp-config.php')) {
      return ABSPATH . 'wp-config.php';
    } elseif (file_exists(dirname(ABSPATH) . '/wp-config.php') && !file_exists(dirname(ABSPATH) . '/wp-settings.php')) {
      return dirname(ABSPATH) . '/wp-config.php';
    }
    return null;
  }

  /**
   * Enable debug logging in wp-config.php
   *
   * @return bool True if successful, false otherwise
   */
  public function enable()
  {
    if (!$this->wpConfigPath) {
      return false;
    }

    $content = file_get_contents($this->wpConfigPath);

    $constants = [
      'WP_DEBUG' => 'true',
      'WP_DEBUG_LOG' => 'true',
      'WP_DEBUG_DISPLAY' => 'false'
    ];

    foreach ($constants as $constant => $value) {
      $content = $this->updateConstant($content, $constant, $value);
    }

    return file_put_contents($this->wpConfigPath, $content) !== false;
  }

  /**
   * Disable debug logging in wp-config.php
   *
   * @return bool True if successful, false otherwise
   */
  public function disable()
  {
    if (!$this->wpConfigPath) {
      return false;
    }

    $content = file_get_contents($this->wpConfigPath);

    $constants = [
      'WP_DEBUG' => 'false',
      'WP_DEBUG_LOG' => 'false',
      'WP_DEBUG_DISPLAY' => 'false'
    ];

    foreach ($constants as $constant => $value) {
      $content = $this->updateConstant($content, $constant, $value);
    }

    return file_put_contents($this->wpConfigPath, $content) !== false;
  }

  /**
   * Update or add a constant in wp-config.php content
   *
   * @param string $content The wp-config.php content
   * @param string $constant The constant name
   * @param string $value The constant value
   * @return string Updated content
   */
  private function updateConstant($content, $constant, $value)
  {
    if (preg_match("/define\(\s*['\"]" . preg_quote($constant, '/') . "['\"]\s*,\s*(.+?)\s*\);/", $content)) {
      return preg_replace("/define\(\s*['\"]" . preg_quote($constant, '/') . "['\"]\s*,\s*(.+?)\s*\);/", "define('$constant', $value);", $content);
    } else {
      return $content . "\ndefine('$constant', $value);";
    }
  }

  /**
   * Check if debug logging is enabled in wp-config.php
   *
   * This method reads the wp-config.php file and checks if the WP_DEBUG constant
   * is set to true. It considers 'true', 'TRUE', or '1' as valid enabled values.
   *
   * @return bool True if WP_DEBUG is enabled, false otherwise or if wp-config.php is not accessible
   */
  public function isEnabled()
  {
    return defined('WP_DEBUG') && WP_DEBUG === true &&
      defined('WP_DEBUG_LOG') && WP_DEBUG_LOG === true;
  }
}
