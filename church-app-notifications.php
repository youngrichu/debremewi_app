<?php
/**
 * Plugin Name: Church App Notifications
 * Description: Handles push notifications for the Church App
 * Version: 1.0.0
 * Author: Habtamu
 * Author URI: https://github.com/youngrichu
 * Text Domain: church-app-notifications
 */

// If this file is called directly, abort.
if (!defined('WPINC')) {
    die;
}

// Define plugin constants
define('CHURCH_APP_NOTIFICATIONS_VERSION', '1.0.0');
define('CHURCH_APP_NOTIFICATIONS_PLUGIN_DIR', plugin_dir_path(__FILE__));
define('CHURCH_APP_NOTIFICATIONS_PLUGIN_URL', plugin_dir_url(__FILE__));

// Include required files
require_once CHURCH_APP_NOTIFICATIONS_PLUGIN_DIR . 'includes/class-notifications.php';
require_once CHURCH_APP_NOTIFICATIONS_PLUGIN_DIR . 'includes/class-api.php';
require_once CHURCH_APP_NOTIFICATIONS_PLUGIN_DIR . 'includes/class-database.php';
require_once CHURCH_APP_NOTIFICATIONS_PLUGIN_DIR . 'admin/class-admin.php';

// Rename the class to avoid conflicts
class Church_App_Notifications_Main {
    private $api;

    public function __construct() {
        $this->api = new Church_App_Notifications_API();
    }

    public function run() {
        // Initialize REST API routes
        add_action('rest_api_init', array($this->api, 'register_routes'));
        
        // Log when plugin is initialized
        error_log('Church App Notifications plugin initialized');
    }
}

// Activation hook
register_activation_hook(__FILE__, function() {
    require_once CHURCH_APP_NOTIFICATIONS_PLUGIN_DIR . 'includes/class-database.php';
    $database = new Church_App_Notifications_DB();
    $database->create_tables();
    
    // Log activation
    error_log('Church App Notifications plugin activated');
});

// Initialize the plugin
function run_church_app_notifications() {
    $plugin = new Church_App_Notifications_Main();
    $plugin->run();
}

// Hook into WordPress init
add_action('plugins_loaded', 'run_church_app_notifications');

// Add debug endpoint to verify plugin loading
add_action('rest_api_init', function() {
    register_rest_route('church-app/v1', '/debug', array(
        'methods' => 'GET',
        'callback' => function() {
            return new WP_REST_Response(array(
                'status' => 'ok',
                'message' => 'Plugin is loaded and REST API is working',
                'version' => CHURCH_APP_NOTIFICATIONS_VERSION,
                'timestamp' => current_time('mysql')
            ), 200);
        },
        'permission_callback' => '__return_true'
    ));
}); 