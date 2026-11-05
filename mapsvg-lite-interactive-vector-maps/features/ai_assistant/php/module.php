<?php

namespace MapSVG\Paid\AiAssistant;

use MapSVG\AiChatController;
use MapSVG\AiChatsController;
use MapSVG\AiProviderConfig;
use MapSVG\AiSettingsController;
use MapSVG\Core\ModuleInterface;
use MapSVG\Core\ModuleRegistry;

$domainDir = __DIR__ . '/Domain/Ai';
foreach (array(
    'AiChatsRepository.php',
    'AiProviderConfig.php',
    'AiRuntimeContext.php',
    'AiCsvAttachments.php',
    'AiMapRegions.php',
    'AiImageMaps.php',
    'AiControlCenter.php',
    'AiTools.php',
    'OpenAiCompatibleClient.php',
    'AiSettingsController.php',
    'AiChatsController.php',
    'AiAgentClient.php',
    'AiExecutionStore.php',
    'AiExecutor.php',
    'AiChatController.php',
) as $file) {
    require_once $domainDir . '/' . $file;
}

final class AiAssistantModule implements ModuleInterface
{
    public function id(): string
    {
        return 'mapsvg/ai-assistant';
    }

    public function boot(ModuleRegistry $registry): void
    {
        $this->registerRoutes($registry);

        add_filter('mapsvg_react_admin_secret_option_keys', function ($keys) {
            $keys = is_array($keys) ? $keys : array();
            foreach (AiProviderConfig::SECRET_KEYS as $key) {
                $keys[] = $key;
            }
            return array_values(array_unique($keys));
        });

        add_filter('mapsvg_react_admin_bootstrap_params', function ($params) {
            if (!is_array($params)) {
                $params = array();
            }
            $params['ai'] = AiProviderConfig::publicSettings();
            return $params;
        });
    }

    public function registerRoutes(ModuleRegistry $registry): void
    {
        $registry->rest()->register($this->id(), '/ai/maps/(?P<mapId>\d+)/regions/(?P<analysisId>[a-f0-9]{32})', array(
            'methods' => 'POST', 'callback' => '\\MapSVG\\AiMapRegions::endpoint', 'permission_callback' => '\\MapSVG\\AiMapRegions::allowed',
        ));
        $registry->rest()->register($this->id(), '/ai/attachments/csv', array(
            'methods' => 'POST',
            'callback' => '\\MapSVG\\AiCsvAttachments::upload',
            'permission_callback' => '\\MapSVG\\AiCsvAttachments::allowed',
        ));
        $registry->rest()->register($this->id(), '/ai/settings', array(
            array(
                'methods' => 'GET',
                'callback' => '\\MapSVG\\AiSettingsController::get',
                'permission_callback' => array($this, 'canEditPosts'),
            ),
            array(
                'methods' => 'PUT',
                'callback' => '\\MapSVG\\AiSettingsController::update',
                'permission_callback' => array($this, 'canEditPosts'),
            ),
        ));

        $registry->rest()->register($this->id(), '/ai/chat', array(
            array(
                'methods' => 'POST',
                'callback' => '\\MapSVG\\AiChatController::chat',
                'permission_callback' => array($this, 'canEditPosts'),
            ),
        ));

        $registry->rest()->register($this->id(), '/ai/chats', array(
            array(
                'methods' => 'GET',
                'callback' => '\\MapSVG\\AiChatsController::index',
                'permission_callback' => array($this, 'canEditPosts'),
            ),
            array(
                'methods' => 'POST',
                'callback' => '\\MapSVG\\AiChatsController::create',
                'permission_callback' => array($this, 'canEditPosts'),
            ),
        ));

        $registry->rest()->register($this->id(), '/ai/chats/(?P<id>\\d+)', array(
            array(
                'methods' => 'GET',
                'callback' => '\\MapSVG\\AiChatsController::get',
                'permission_callback' => array($this, 'canEditPosts'),
            ),
            array(
                'methods' => 'PUT',
                'callback' => '\\MapSVG\\AiChatsController::update',
                'permission_callback' => array($this, 'canEditPosts'),
            ),
            array(
                'methods' => 'DELETE',
                'callback' => '\\MapSVG\\AiChatsController::delete',
                'permission_callback' => array($this, 'canEditPosts'),
            ),
        ));
    }

    public function canEditPosts(): bool
    {
        return current_user_can('edit_posts');
    }
}

add_action('mapsvg/register', function (ModuleRegistry $registry): void {
    $registry->register(new AiAssistantModule());
});
