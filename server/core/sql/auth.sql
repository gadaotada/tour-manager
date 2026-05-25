CREATE TABLE users (
  id VARCHAR(36) NOT NULL PRIMARY KEY,
  username VARCHAR(120) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  display_name VARCHAR(160) NOT NULL,
  role ENUM('ADMIN', 'MODERATOR', 'EMPLOYEE') NOT NULL,
  is_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  settings JSON NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  INDEX users_role_idx (role),
  INDEX users_is_enabled_idx (is_enabled)
);

CREATE TABLE user_permission_overrides (
  user_id VARCHAR(36) NOT NULL,
  permission VARCHAR(120) NOT NULL,
  effect ENUM('ALLOW', 'DENY') NOT NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (user_id, permission),
  CONSTRAINT user_permission_overrides_user_id_fk
    FOREIGN KEY (user_id) REFERENCES users (id)
    ON DELETE CASCADE
);
