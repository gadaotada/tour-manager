CREATE TABLE sessions (
  sid VARCHAR(128) NOT NULL PRIMARY KEY,
  data LONGTEXT NOT NULL,
  expires_at DATETIME(3) NOT NULL,
  INDEX sessions_expires_at_idx (expires_at)
);
