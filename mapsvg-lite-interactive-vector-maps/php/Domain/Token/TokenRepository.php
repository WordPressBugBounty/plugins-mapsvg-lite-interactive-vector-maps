<?php

namespace MapSVG;

class TokenRepository extends Repository
{
    public static $className = 'Token';

    public function touch($token)
    {
        $token->lastUsedAt = gmdate('Y-m-d H:i:s');
        $this->update($token);
    }

    public function checkTokenPermission($token, $permission, $returnToken = false)
    {
        $token = $this->findOne(["hashedToken" => md5($token)]);
        if ($token) {
            if ($token->hasPermission($permission) || ($permission === "logs" && $token->hasPermission("wp"))) {
                return $returnToken ? $token : true;
            }
        }
        return false;
    }
}
