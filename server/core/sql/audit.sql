CREATE TABLE audit_logs (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  action ENUM('CREATE', 'READ', 'UPDATE', 'DELETE', 'OTHER') NOT NULL,
  resource VARCHAR(80) NOT NULL,
  resource_id VARCHAR(80) NULL DEFAULT NULL, 
  data JSON NOT NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

  CONSTRAINT audit_logs_user_id_fk
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE,

  INDEX audit_logs_created_at_idx (created_at),
  INDEX audit_logs_resource_action_idx (resource, action),
  INDEX audit_logs_resource_id_idx (resource, resource_id),
  INDEX audit_logs_user_id_idx (user_id)
);
