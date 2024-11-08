<?php

class Database {
    public function create_tables() {
        global $wpdb;
        $table_name = $wpdb->prefix . 'app_notifications';
        
        $charset_collate = $wpdb->get_charset_collate();

        $sql = "CREATE TABLE IF NOT EXISTS $table_name (
            id bigint(20) NOT NULL AUTO_INCREMENT,
            user_id bigint(20) NOT NULL,
            title varchar(255) NOT NULL,
            body text NOT NULL,
            type varchar(50) NOT NULL,
            is_read char(1) NOT NULL DEFAULT '0',
            created_at datetime NOT NULL,
            reference_id bigint(20) DEFAULT NULL,
            reference_type varchar(50) DEFAULT NULL,
            PRIMARY KEY  (id)
        ) $charset_collate;";

        require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
        dbDelta($sql);
    }
} 