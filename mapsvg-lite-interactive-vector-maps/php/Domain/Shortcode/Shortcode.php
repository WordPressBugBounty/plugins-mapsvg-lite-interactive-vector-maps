<?php

namespace MapSVG;

class Shortcode
{

  /** Shared policy for REST fragments and standalone shortcode pages. */
  public static function isAllowed(string $shortcode): bool
  {
    $name = self::getName($shortcode);
    if (in_array($name, (array) Options::get('allowed_shortcodes'), true)) return true;
    if ($name !== 'mapsvg' || !is_user_logged_in() || !current_user_can('edit_posts')) return false;

    // The exception grants one MapSVG embed, never adjacent or nested third-party shortcodes.
    return preg_match('/\A\s*' . get_shortcode_regex(['mapsvg']) . '\s*\z/s', $shortcode, $match) === 1
      && $match[1] === '' && $match[5] === '' && $match[6] === '';
  }

  /**
   * Extracts the shortcode name from a shortcode string.
   * Example: [my_shortcode attr="value"] => my_shortcode
   *
   * @param string $shortcode
   * @return string|null
   */
  public static function getName(string $shortcode): ?string
  {
    if (preg_match('/\\[\\s*([a-zA-Z0-9_\\-]+)\\b/', $shortcode, $matches)) {
      return $matches[1];
    }
    return null;
  }
}
