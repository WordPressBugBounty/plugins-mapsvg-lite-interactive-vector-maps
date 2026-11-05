<div class="mapsvg-dashboard" id="mapsvg-admin">
    <div class="row">
        <div class="col-sm-6">
            <h1 style="margin-bottom: 20px;">
                <span style="text-decoration: none; outline: none; box-shadow: none;">
                    <img src="<?php echo esc_attr(MAPSVG_PLUGIN_RELATIVE_URL); ?>/img/logo.svg" style="height: 25px;" />
                </span>
            </h1>
        </div>
        <div class="col-sm-6" style="text-align: right; line-height: 72px;">
            <div class="float-end" style="padding-left: 20px;">
                <button id="btnCustomizationModal" class="btn btn-sm btn-outline-secondary" data-toggle="modal" data-target="#customizationModal"><i class="bi-question-circle"></i> Support</button>
            </div>

            <div class="float-end">
                <!-- START purchase_code -->
                <?php
                $licenseUi = isset($data['licenseUi']) && is_array($data['licenseUi']) ? $data['licenseUi'] : null;
                if ($licenseUi && !empty($licenseUi['enabled'])) :
                ?>
                    <a href="#"
                        id="mapsvg-enter-purchase-code-link"><?php echo !empty($licenseUi['hasCode']) ? 'License' : '<b>Activate</b>'; ?></a>
                    | <?php endif; ?>
                <!-- END REPLACE -->

                <a href="https://mapsvg.com/docs" target="_blank">Docs</a>

                | <a href="https://mapsvg.com/changelog" target="_blank">Changelog</a> <span class="badge badge-version"><?php echo esc_html(str_replace("mapsvg-", "", MAPSVG_PLAN) . "-" . MAPSVG_VERSION . ($data['gitBranch'] ? ' <i class="bi bi-git"></i> ' . $data['gitBranch'] : '')); ?></span>
                <?php if (MAPSVG_DEBUG) { ?>
                    | <a href="#" id="mapsvg-btn-phpinfo" data-loading-text="Getting info...">PHPInfo</a>
                <?php } ?>

            </div>
        </div>
    </div>

    <!-- START purchase_code -->
    <?php
    $licenseUi = isset($data['licenseUi']) && is_array($data['licenseUi']) ? $data['licenseUi'] : ['enabled' => false];
    if (!empty($licenseUi['enabled'])) :
    ?>
        <div id="mapsvg-license-page-alerts" class="<?php echo (!empty($licenseUi['showLicenseError']) || !empty($licenseUi['showLicenseWarning']) || !empty($licenseUi['showActivatePrompt'])) ? 'mb-3' : ''; ?>">
            <div class="alert alert-danger" role="alert" id="mapsvg-page-license-error"
                data-error-persistent="<?php echo !empty($licenseUi['showLicenseError']) ? '1' : '0'; ?>"
                data-modal-error-html="<?php echo esc_attr($licenseUi['modalErrorHtml'] ?? ''); ?>"
                <?php echo !empty($licenseUi['showLicenseError']) ? '' : "style='display:none'"; ?>>
                <div class="mapsvg-license-error-message<?php echo (!empty($licenseUi['showDomainRecheck']) || !empty($licenseUi['showCancelledCta'])) ? ' mb-2' : ''; ?>">
                    <?php
                    if (!empty($licenseUi['showLicenseError']) && !empty($licenseUi['errorHtml'])) {
                        echo $licenseUi['errorHtml']; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- LicenseStatus::formatAlertHtml()
                    }
                    ?>
                </div>
                <button type="button" class="btn btn-outline-secondary mapsvg-btn-recheck-license"
                    data-loading-text="Checking..."
                    <?php echo (!empty($licenseUi['showLicenseError']) && !empty($licenseUi['showDomainRecheck'])) ? '' : "style='display:none'"; ?>>
                    I updated domain settings
                </button>
                <button type="button" class="btn btn-outline-secondary mapsvg-btn-enter-new-license"
                    <?php echo !empty($licenseUi['showCancelledCta']) ? '' : "style='display:none'"; ?>>
                    Enter new license key
                </button>
            </div>

            <div class="alert alert-warning" role="alert" id="mapsvg-page-license-warning"
                data-warning-persistent="<?php echo !empty($licenseUi['showLicenseWarning']) ? '1' : '0'; ?>"
                data-modal-warning-html="<?php echo esc_attr($licenseUi['modalWarningHtml'] ?? ''); ?>"
                <?php echo !empty($licenseUi['showLicenseWarning']) ? '' : "style='display:none'"; ?>>
                <div class="mapsvg-license-warning-message<?php echo !empty($licenseUi['showLicenseWarning']) ? ' mb-2' : ''; ?>">
                    <?php
                    if (!empty($licenseUi['showLicenseWarning']) && !empty($licenseUi['warningHtml'])) {
                        echo $licenseUi['warningHtml']; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- LicenseStatus::formatDomainLimitSoftAlertHtml()
                    }
                    ?>
                </div>
                <button type="button" class="btn btn-outline-secondary mapsvg-btn-recheck-license"
                    data-loading-text="Checking..."
                    <?php echo !empty($licenseUi['showLicenseWarning']) ? '' : "style='display:none'"; ?>>
                    Recheck after fixing sites
                </button>
            </div>

            <div class="alert alert-info alert-dismissible" role="alert" id="mapsvg-alert-activate-prompt"
                <?php echo !empty($licenseUi['showActivatePrompt']) ? '' : "style='display:none'"; ?>>
                <button type="button" class="btn-close" id="mapsvg-dismiss-activate-prompt" aria-label="Close"></button>
                <div class="mb-2">
                    Enter your license key to enable automatic updates.
                    Get your license key from
                    <a href="https://mapsvg.com/dashboard" target="_blank" rel="noopener noreferrer">MapSVG Dashboard <i class="bi bi-box-arrow-up-right" aria-hidden="true"></i></a>.
                </div>
                <button type="button" class="btn btn-primary" id="mapsvg-btn-open-activate-modal">
                    Activate
                </button>
            </div>
        </div>
    <?php endif; ?>
    <!-- END REPLACE -->