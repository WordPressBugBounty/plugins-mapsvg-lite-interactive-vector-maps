<?php

declare(strict_types=1);
namespace MapSVG\App\Data\Query;

final class WordPressQueryContext implements QueryAccessContext
{
    private int $site;
    private int $user;
    private bool $editor;
    private function __construct(int $site, int $user, bool $editor)
    {
        $this->site = $site;
        $this->user = $user;
        $this->editor = $editor;
    }
    public static function capture(): self
    {
        if (!function_exists('get_current_blog_id') || !function_exists('get_current_user_id')
            || !function_exists('current_user_can')) throw new \LogicException('WordPress identity is unavailable.');
        $site = (int) get_current_blog_id();
        $user = (int) get_current_user_id();
        if ($site < 1 || $user < 0) throw new \LogicException('Invalid WordPress identity.');
        return new self($site, $user, $user > 0 && current_user_can('edit_posts'));
    }
    public function siteId(): int { return $this->site; }
    public function userId(): int { return $this->user; }
    public function canEditQueries(): bool { return $this->editor; }
}
