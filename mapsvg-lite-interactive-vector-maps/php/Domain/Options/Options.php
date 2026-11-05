<?php

namespace MapSVG;

use MapSVG\DataLayer\Store\PluginTableStore;

/**
 * Class that manages global MapSVG settings in the database.
 * @package MapSVG
 */
class Options
{
    static $options;
    static $protected = array('allowed_shortcodes');
    static $cache = array();

    private static function store(): PluginTableStore
    {
        return new PluginTableStore('settings');
    }

    private static function setCache($optionsOrKey, $value = null)
    {
        if (!isset(static::$options)) {
            static::$options = array();
        }
        if (is_string($optionsOrKey) && isset($value)) {
            static::$options[$optionsOrKey] = $value;
        } elseif (is_array($optionsOrKey)) {
            static::$options = $optionsOrKey;
        }
    }

    private static function getCache($field = null)
    {
        if (isset($field) && isset(static::$options[$field])) {
            return static::$options[$field];
        } elseif (!isset($field) && isset(static::$options)) {
            return static::$options;
        }
        return null;
    }

    public static function getAll()
    {
        $response = array();
        foreach (self::store()->all() as $field) {
            $response[$field['key']] = static::decodeValue(
                $field['key'],
                $field['value']
            );
        }
        static::setCache($response);
        // Legacy account API tokens must not reach either admin bootstrap or REST responses.
        unset($response['apiKey']);
        return $response;
    }

    public static function get($field)
    {
        if (isset(static::$options) && is_array(static::$options) && array_key_exists($field, static::$options)) {
            return static::$options[$field];
        }

        $row = self::store()->findOne(array('key' => $field));
        $value = $row === null ? null : $row['value'];
        $value = static::decodeValue($field, $value);
        static::setCache($field, $value);
        return $value;
    }

    public static function set($field, $value)
    {
        if (!static::hasAccessTo($field)) {
            return;
        }

        $store = self::store();
        $encoded = static::encodeValue($field, $value);
        if ($store->findOne(array('key' => $field)) !== null) {
            $store->update(
                array('value' => $encoded),
                array('key' => $field)
            );
        } else {
            $store->insert(array(
                'key' => $field,
                'value' => $encoded,
            ));
        }
        static::setCache($field, $value);
    }

    public static function setAll($fields)
    {
        foreach ($fields as $key => $value) {
            static::set($key, $value);
        }
    }

    public static function delete($field)
    {
        if (!static::hasAccessTo($field)) {
            return false;
        }

        self::store()->delete(array('key' => $field));
        static::clearCache($field);
        return true;
    }

    private static function clearCache($field = null)
    {
        if ($field === null) {
            static::$cache = array();
        } else {
            unset(static::$cache[$field]);
        }
    }

    public static function decodeValue($field, $value)
    {
        if (in_array(
            $field,
            array('seen_whats_new', 'debug', 'chatConsentAccepted')
        )) {
            return (bool) $value;
        }

        if (in_array(
            $field,
            array(
                'mappable_post_types',
                'allowed_shortcodes',
                'post_editor_last_map',
            )
        )) {
            $decoded = $value === null ? null : json_decode($value, true);
            if (is_array($decoded)) {
                return $decoded;
            }
            return $decoded !== null ? array($decoded) : array();
        }

        return $value;
    }

    public static function encodeValue($field, $value)
    {
        if (is_array($value) && in_array(
            $field,
            array(
                'mappable_post_types',
                'allowed_shortcodes',
                'post_editor_last_map',
            )
        )) {
            if (in_array(
                $field,
                array('mappable_post_types', 'allowed_shortcodes')
            )) {
                foreach ($value as &$item) {
                    $item = trim($item);
                }
                unset($item);
                $value = array_unique($value);
            }
            return wp_json_encode($value, JSON_UNESCAPED_UNICODE);
        }

        return $value;
    }

    public static function hasAccessTo($fieldName)
    {
        $isProtected = in_array($fieldName, static::$protected);
        return $isProtected ? current_user_can('create_users') : true;
    }
}
