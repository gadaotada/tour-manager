CREATE TABLE clients (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(160) NOT NULL,
    egn VARCHAR(11) NOT NULL,
    address VARCHAR(500) DEFAULT NULL,
    phone_number VARCHAR(20) DEFAULT NULL,
    email VARCHAR(254) DEFAULT NULL,
    version INT UNSIGNED NOT NULL DEFAULT 1,
    created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),

    INDEX clients_name_idx (name),
    INDEX clients_egn_idx (egn),
    INDEX clients_address_idx (address),
    INDEX clients_email_idx (email),
    INDEX clients_created_at_idx (created_at),
    INDEX clients_updated_at_idx (updated_at)
);
