<?php

namespace MapSVG;

/**
 * Class Token
 * Represents a token for authentication and authorization purposes.
 */
class Token extends Model
{
  const ACCESS_RIGHTS = ['read', 'write', 'wp', 'logs', 'googlesheet'];

  public $id;
  public $token;
  public $tokenFirstFour;
  public $hashedToken;
  public $createdAt;
  public $lastUsedAt;
  public $accessRights;

  /**
   * Token constructor.
   *
   * @param array|null $data Initial data for the token.
   */
  public function __construct($data = null)
  {
    parent::__construct($data);
    $this->accessRights = $data['accessRights'] ?? [];
    // Ensure accessRights values are properly typed

    $this->id = $data['id'] ?? null;
    $this->token          = $data['token'] ?? bin2hex(random_bytes(16)); // Generate a 32-character random token
    $this->createdAt      = $data['createdAt'] ?? date('Y-m-d H:i:s');
    $this->lastUsedAt     = $data['lastUsedAt'] ?? null;
    $this->hashedToken    = $data['hashedToken'] ?? md5($this->token);
    $this->tokenFirstFour = $data['tokenFirstFour'] ?? substr($this->token, 0, 4);
  }

  /**
   * Get the raw token value.
   *
   * @return string The raw token value.
   */
  public function getRawToken()
  {
    return $this->token;
  }

  /**
   * Get the token data as an associative array.
   *
   * @return array The token data.
   */
  public function getData()
  {
    return [
      'id' => $this->id,
      'tokenFirstFour' => $this->tokenFirstFour,
      'hashedToken' => $this->hashedToken,
      'createdAt' => $this->createdAt,
      'lastUsedAt' => $this->lastUsedAt,
      'accessRights' => $this->accessRights,
    ];
  }

  /**
   * Check if the token has a specific permission.
   *
   * @param string $permission The permission to check.
   * @return bool True if the token has the permission, false otherwise.
   */
  public function hasPermission($permission)
  {
    if (!is_array($this->accessRights)) {
      return false;
    }
    return isset($this->accessRights[$permission]) && $this->accessRights[$permission] === true;
  }
}
