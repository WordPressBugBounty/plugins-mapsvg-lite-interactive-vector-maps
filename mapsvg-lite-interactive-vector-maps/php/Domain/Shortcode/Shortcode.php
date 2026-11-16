<?php

namespace MapSVG;

class Shortcode
{

  /** Shared policy for one complete shortcode in REST fragments and standalone pages. */
  public static function isAllowed(string $shortcode): bool
  {
    $name = self::getName($shortcode);
    // do_shortcode() preserves HTML outside matches and in enclosing content.
    // Never accept visitor-authored markup, even inside shortcode attributes.
    if ($name === null || strpos($shortcode, '<') !== false
      || preg_match('/\A\s*' . get_shortcode_regex([$name]) . '\s*\z/s', $shortcode, $match) !== 1
      || $match[1] !== '' || $match[6] !== '') return false;

    $allowed = (array) Options::get('allowed_shortcodes');
    if (in_array($name, $allowed, true)) return self::containsOnlyAllowedShortcodes($shortcode, $allowed);
    if ($name !== 'mapsvg' || !is_user_logged_in() || !current_user_can('edit_posts')) return false;

    // The exception grants one MapSVG embed, never adjacent or nested third-party shortcodes.
    return $match[5] === '';
  }

  /** An allowed first tag cannot authorize adjacent or enclosed third-party tags. */
  private static function containsOnlyAllowedShortcodes(string $content, array $allowed): bool
  {
    if (preg_match_all('/' . get_shortcode_regex() . '/s', $content, $matches, PREG_SET_ORDER) === false) return false;
    foreach ($matches as $match) {
      // WordPress renders [[tag]] literally, without calling its handler.
      if ($match[1] === '[' && $match[6] === ']') continue;
      if (!in_array($match[2], $allowed, true)) return false;
      if ($match[5] !== '' && !self::containsOnlyAllowedShortcodes($match[5], $allowed)) return false;
    }
    return true;
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
