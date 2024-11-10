<?php
/**
 * Plugin Name: Church App Profile Handler
 * Description: Handles user profile data for the Church App
 * Version: 1.0
 * Author: Habtamu
 */

defined('ABSPATH') or die('Direct access not allowed');

class ChurchAppProfile {
    public function __construct() {
        add_action('rest_api_init', array($this, 'register_routes'));
    }

    public function register_routes() {
        register_rest_route('wp/v2', '/user-profile', array(
            'methods' => 'POST',
            'callback' => array($this, 'update_profile'),
            'permission_callback' => array($this, 'check_auth'),
        ));

        register_rest_route('wp/v2', '/user-profile', array(
            'methods' => 'GET',
            'callback' => array($this, 'get_profile'),
            'permission_callback' => array($this, 'check_auth'),
        ));
    }

    public function check_auth($request) {
        $auth_header = $request->get_header('Authorization');
        if (!$auth_header || strpos($auth_header, 'Bearer ') !== 0) {
            return false;
        }

        $token = str_replace('Bearer ', '', $auth_header);
        
        try {
            $user_data = apply_filters('simple_jwt_login_verify_token', $token);
            if (!empty($user_data) && isset($user_data['user'])) {
                wp_set_current_user($user_data['user']->ID);
                return true;
            }
        } catch (Exception $e) {
            return false;
        }

        return false;
    }

    public function update_profile($request) {
        $user_id = get_current_user_id();
        if (!$user_id) {
            return new WP_Error('no_user', 'User not found', array('status' => 404));
        }

        $params = $request->get_params();
        
        // Update basic user data
        $user_data = array(
            'ID' => $user_id
        );

        if (isset($params['firstName'])) {
            $user_data['first_name'] = sanitize_text_field($params['firstName']);
        }
        if (isset($params['lastName'])) {
            $user_data['last_name'] = sanitize_text_field($params['lastName']);
        }

        wp_update_user($user_data);
        
        // Update meta fields
        $meta_fields = array(
            'phone_number' => $params['phoneNumber'],
            'gender' => $params['gender'],
            'christian_name' => $params['christianName'],
            'residency_city' => $params['residencyCity'],
            'is_onboarding_complete' => $params['isOnboardingComplete'],
        );

        foreach ($meta_fields as $key => $value) {
            if (isset($value)) {
                update_user_meta($user_id, $key, sanitize_text_field($value));
            }
        }
        
        return array(
            'success' => true,
            'user' => array(
                'id' => $user_id,
                'firstName' => get_user_meta($user_id, 'first_name', true),
                'lastName' => get_user_meta($user_id, 'last_name', true),
                'phoneNumber' => get_user_meta($user_id, 'phone_number', true),
                'gender' => get_user_meta($user_id, 'gender', true),
                'christianName' => get_user_meta($user_id, 'christian_name', true),
                'residencyCity' => get_user_meta($user_id, 'residency_city', true),
                'isOnboardingComplete' => get_user_meta($user_id, 'is_onboarding_complete', true),
            ),
        );
    }

    public function get_profile($request) {
        $user_id = get_current_user_id();
        if (!$user_id) {
            return new WP_Error('no_user', 'User not found', array('status' => 404));
        }

        $user = get_userdata($user_id);
        
        return array(
            'success' => true,
            'user' => array(
                'id' => $user_id,
                'username' => $user->user_login,
                'email' => $user->user_email,
                'firstName' => get_user_meta($user_id, 'first_name', true),
                'lastName' => get_user_meta($user_id, 'last_name', true),
                'phoneNumber' => get_user_meta($user_id, 'phone_number', true),
                'gender' => get_user_meta($user_id, 'gender', true),
                'christianName' => get_user_meta($user_id, 'christian_name', true),
                'residencyCity' => get_user_meta($user_id, 'residency_city', true),
                'isOnboardingComplete' => get_user_meta($user_id, 'is_onboarding_complete', true),
            ),
        );
    }
}

// Initialize the plugin
new ChurchAppProfile();