<?php
/**
 * API functionality for notifications
 */
class Church_App_Notifications_API {
    private $namespace = 'church-app/v1';

    public function register_routes() {
        // Log registration attempt
        error_log('Registering notification routes at: ' . $this->namespace);

        // Make sure the namespace is correct
        $this->namespace = 'church-app/v1';

        // Add a debug endpoint with proper namespace
        register_rest_route($this->namespace, '/test', array(
            'methods' => WP_REST_Server::READABLE, // Use proper constant for GET
            'callback' => function() {
                return new WP_REST_Response(array(
                    'status' => 'ok',
                    'message' => 'Notifications API is working',
                    'timestamp' => current_time('mysql'),
                    'namespace' => $this->namespace
                ), 200);
            },
            'permission_callback' => '__return_true'
        ));

        // Log the full URL of the test endpoint
        error_log('Test endpoint URL: ' . rest_url($this->namespace . '/test'));

        register_rest_route($this->namespace, '/notifications', array(
            'methods' => WP_REST_Server::READABLE,
            'callback' => array($this, 'get_notifications'),
            'permission_callback' => '__return_true'
        ));

        // Add mark as read endpoint
        register_rest_route($this->namespace, '/notifications/(?P<id>\d+)/read', array(
            'methods' => 'PUT',
            'callback' => array($this, 'mark_notification_read'),
            'permission_callback' => '__return_true', // Temporarily allow all for testing
            'args' => array(
                'id' => array(
                    'validate_callback' => function($param) {
                        return is_numeric($param);
                    }
                )
            )
        ));

        // Add endpoint for sending notifications to specific users
        register_rest_route($this->namespace, '/notifications/send', array(
            'methods' => 'POST',
            'callback' => array($this, 'send_notification'),
            'permission_callback' => '__return_true',
            'args' => array(
                'user_id' => array(
                    'required' => true,
                    'type' => 'integer',
                    'description' => 'User ID (0 for all users)',
                ),
                'title' => array(
                    'required' => true,
                    'type' => 'string',
                ),
                'body' => array(
                    'required' => true,
                    'type' => 'string',
                ),
                'type' => array(
                    'required' => false,
                    'type' => 'string',
                    'default' => 'general',
                ),
            )
        ));
    
        // Log after registration
        error_log('Routes registered successfully');

        // Add this test endpoint for creating a notification
        register_rest_route($this->namespace, '/test-notification', array(
            'methods' => 'POST',
            'callback' => function() {
                global $wpdb;
                $table_name = $wpdb->prefix . 'app_notifications';
                
                // Create an unread notification
                $result = $wpdb->insert(
                    $table_name,
                    array(
                        'user_id' => 10, // Your test user ID
                        'title' => 'New Test Notification',
                        'body' => 'This is an unread test notification',
                        'type' => 'general',
                        'is_read' => '0',
                        'created_at' => current_time('mysql')
                    ),
                    array('%d', '%s', '%s', '%s', '%s', '%s')
                );

                if ($result === false) {
                    return new WP_Error('db_error', 'Failed to create test notification');
                }

                return new WP_REST_Response(array(
                    'success' => true,
                    'message' => 'Test notification created'
                ), 200);
            },
            'permission_callback' => '__return_true'
        ));
    }

    // Add this function to your class to ensure the plugin is loaded properly
    public function init() {
        add_action('rest_api_init', array($this, 'register_routes'));
    }
    
    private function get_user_from_jwt($request) {
        try {
            error_log('Starting get_user_from_jwt');
            
            $auth_header = $request->get_header('Authorization');
            error_log('Auth header: ' . print_r($auth_header, true));
            
            if (!$auth_header) {
                error_log('No Authorization header found');
                return null;
            }

            // Extract token
            if (!preg_match('/Bearer\s(\S+)/', $auth_header, $matches)) {
                error_log('Invalid Authorization header format');
                return null;
            }

            $jwt = $matches[1];
            error_log('Extracted JWT: ' . $jwt);

            // Use Simple JWT Login plugin's authentication
            require_once(ABSPATH . 'wp-content/plugins/simple-jwt-login/src/Modules/SimpleJWTLoginAuthentication.php');
            $auth = new \SimpleJWTLogin\Modules\SimpleJWTLoginAuthentication();
            
            try {
                $user_data = $auth->getUserFromToken($jwt);
                if ($user_data && isset($user_data->ID)) {
                    error_log('Successfully authenticated user: ' . $user_data->ID);
                    return $user_data;
                }
            } catch (Exception $e) {
                error_log('JWT Authentication error: ' . $e->getMessage());
            }

            error_log('Failed to authenticate user with JWT');
            return null;

        } catch (Exception $e) {
            error_log('Error in get_user_from_jwt: ' . $e->getMessage());
            return null;
        }
    }

    private function get_user_id_from_token($token) {
        try {
            error_log('Validating token: ' . $token);

            if (empty($token)) {
                error_log('Empty token provided');
                return null;
            }

            // Parse token parts
            $parts = explode('.', $token);
            if (count($parts) !== 3) {
                error_log('Invalid token format - wrong number of segments');
                return null;
            }

            // Decode payload
            $payload = $parts[1];
            $payload = str_replace(['-', '_'], ['+', '/'], $payload);
            $payload = base64_decode($payload);
            
            if ($payload === false) {
                error_log('Failed to decode base64 payload');
                return null;
            }

            $data = json_decode($payload);
            if (json_last_error() !== JSON_ERROR_NONE) {
                error_log('Failed to decode JSON payload: ' . json_last_error_msg());
                return null;
            }

            // Check for id in the correct location based on your token structure
            if (isset($data->id)) {
                error_log('Found user ID in token: ' . $data->id);
                return $data->id;
            }

            error_log('Token payload: ' . print_r($data, true));
            error_log('No user ID found in token payload');
            return null;

        } catch (Exception $e) {
            error_log('Error in get_user_id_from_token: ' . $e->getMessage());
            return null;
        }
    }

    public function get_notifications($request) {
        try {
            global $wpdb;
            $table_name = $wpdb->prefix . 'app_notifications';
            
            // Get authorization header
            $auth_header = $request->get_header('Authorization');
            error_log('Auth header received: ' . $auth_header);

            if (!$auth_header) {
                return new WP_Error(
                    'no_auth_token', 
                    'No authentication token found', 
                    array('status' => 401)
                );
            }

            // Extract token
            if (!preg_match('/Bearer\s(\S+)/', $auth_header, $matches)) {
                error_log('Invalid Authorization header format');
                return new WP_Error(
                    'invalid_auth_format', 
                    'Invalid authorization format', 
                    array('status' => 401)
                );
            }

            $token = $matches[1];
            error_log('Extracted token: ' . $token);

            $user_id = $this->get_user_id_from_token($token);
            error_log('User ID from token: ' . ($user_id ? $user_id : 'null'));
            
            if (!$user_id) {
                return new WP_Error(
                    'invalid_token', 
                    'Invalid or expired token', 
                    array('status' => 401)
                );
            }

            // Get notifications for this user and global notifications
            $notifications = $wpdb->get_results($wpdb->prepare(
                "SELECT * FROM $table_name WHERE user_id = %d OR user_id = 0 ORDER BY created_at DESC",
                $user_id
            ));

            if ($wpdb->last_error) {
                error_log('Database error: ' . $wpdb->last_error);
                return new WP_Error('db_error', 'Database error occurred', array('status' => 500));
            }

            error_log('Returning notifications for user ' . $user_id . ': ' . print_r($notifications, true));
            return new WP_REST_Response($notifications, 200);

        } catch (Exception $e) {
            error_log('Error in get_notifications: ' . $e->getMessage());
            return new WP_Error('server_error', $e->getMessage(), array('status' => 500));
        }
    }

    public function send_notification($request) {
        global $wpdb;
        $table_name = $wpdb->prefix . 'app_notifications';
        
        $user_id = $request['user_id'];
        $title = sanitize_text_field($request['title']);
        $body = sanitize_textarea_field($request['body']);
        $type = sanitize_text_field($request['type']);

        // Insert notification into database
        $result = $wpdb->insert(
            $table_name,
            array(
                'user_id' => $user_id,
                'title' => $title,
                'body' => $body,
                'type' => $type,
                'is_read' => '0',
                'created_at' => current_time('mysql')
            ),
            array('%d', '%s', '%s', '%s', '%s', '%s')
        );

        if ($result === false) {
            return new WP_Error(
                'db_error',
                'Failed to create notification',
                array('status' => 500)
            );
        }

        // Send push notification only to specified user(s)
        if ($user_id > 0) {
            // Send to specific user
            $token = get_user_meta($user_id, 'expo_push_token', true);
            if ($token) {
                $this->send_push_notification($token, $title, $body);
            }
        } else {
            // Send to all users
            $users = get_users();
            foreach ($users as $user) {
                $token = get_user_meta($user->ID, 'expo_push_token', true);
                if ($token) {
                    $this->send_push_notification($token, $title, $body);
                }
            }
        }

        return new WP_REST_Response(array(
            'success' => true,
            'message' => 'Notification sent successfully'
        ), 200);
    }

    private function send_push_notification($token, $title, $body) {
        $message = array(
            'to' => $token,
            'sound' => 'default',
            'title' => $title,
            'body' => $body,
        );

        $ch = curl_init('https://exp.host/--/api/v2/push/send');
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, array('Content-Type: application/json'));
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($message));
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        $response = curl_exec($ch);
        curl_close($ch);

        error_log('Push notification sent to ' . $token . ': ' . $response);
        return $response;
    }

    public function mark_notification_read($request) {
        global $wpdb;
        $table_name = $wpdb->prefix . 'app_notifications';
        $notification_id = $request['id'];

        // Add debug logging
        error_log('Attempting to mark notification as read: ' . $notification_id);

        // Update the notification
        $result = $wpdb->update(
            $table_name,
            array('is_read' => '1'),  // Make sure it's a string '1' to match the schema
            array('id' => $notification_id),
            array('%s'),  // Format for is_read
            array('%d')   // Format for id
        );

        if ($result === false) {
            error_log('Failed to update notification: ' . $wpdb->last_error);
            return new WP_Error(
                'update_failed',
                'Failed to mark notification as read',
                array('status' => 500)
            );
        }

        // Verify the update
        $updated_notification = $wpdb->get_row(
            $wpdb->prepare(
                "SELECT * FROM $table_name WHERE id = %d",
                $notification_id
            )
        );

        error_log('Updated notification: ' . print_r($updated_notification, true));

        return new WP_REST_Response(
            array(
                'success' => true,
                'message' => 'Notification marked as read',
                'notification' => $updated_notification
            ),
            200
        );
    }

    public function register_post_hooks() {
        // Hook into post publication
        add_action('publish_post', array($this, 'handle_post_published'), 10, 2);
    }

    public function handle_post_published($post_id, $post) {
        error_log('Post published: ' . $post_id);
        
        try {
            global $wpdb;
            $table_name = $wpdb->prefix . 'app_notifications';

            // Create notification for all users (user_id = 0)
            $result = $wpdb->insert(
                $table_name,
                array(
                    'user_id' => 0, // 0 means all users
                    'title' => 'New Blog Post: ' . $post->post_title,
                    'body' => wp_trim_words($post->post_content, 20, '...'), // First 20 words
                    'type' => 'blog_post',
                    'is_read' => '0',
                    'created_at' => current_time('mysql'),
                    'reference_id' => $post_id, // Store the post ID
                    'reference_type' => 'post'
                ),
                array('%d', '%s', '%s', '%s', '%s', '%s', '%d', '%s')
            );

            if ($result === false) {
                error_log('Failed to create notification for post: ' . $wpdb->last_error);
                return;
            }

            // Send push notifications to all users
            $this->send_push_notifications_for_post($post);

        } catch (Exception $e) {
            error_log('Error creating post notification: ' . $e->getMessage());
        }
    }

    private function send_push_notifications_for_post($post) {
        global $wpdb;
        
        // Get all user tokens
        $tokens = $wpdb->get_col("
            SELECT meta_value 
            FROM {$wpdb->usermeta} 
            WHERE meta_key = 'expo_push_token'
        ");

        foreach ($tokens as $token) {
            if (empty($token)) continue;

            $message = array(
                'to' => $token,
                'sound' => 'default',
                'title' => 'New Blog Post: ' . $post->post_title,
                'body' => wp_trim_words($post->post_content, 20, '...'),
                'data' => array(
                    'type' => 'blog_post',
                    'post_id' => $post->ID
                ),
            );

            $this->send_push_notification($message);
        }
    }

    private function send_push_notification($message) {
        $ch = curl_init('https://exp.host/--/api/v2/push/send');
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, array('Content-Type: application/json'));
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($message));
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        $response = curl_exec($ch);
        curl_close($ch);

        error_log('Push notification sent: ' . $response);
    }

private static function isValidToken($token) {
    try {
        // Just check if the token exists and has the correct format
        $parts = explode('.', $token);
        if (count($parts) !== 3) return false;

        // Basic structure validation is enough since our tokens don't have expiration
        return true;
    } catch (Exception $e) {
        return false;
    }
}
}
