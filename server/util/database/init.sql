CREATE DATABASE FinalYearProject;
USE FinalYearProject;


CREATE TABLE position (
	pos_id INT AUTO_INCREMENT NOT NULL, 
    pos_name VARCHAR(255) NOT NULL, 
    pos_description LONGTEXT NOT NULL, 
    PRIMARY KEY (pos_id)
);

INSERT INTO position (pos_name, pos_description) 
VALUES ("superuser", "having highest power in this system"), 
("admin", "having control on contact, account, allow to view project, order detail"), 
("project manager", "having control over project, quotation, material and order.")

CREATE TABLE `user` (
	user_id VARCHAR(255) NOT NULL, 
    user_email VARCHAR(255) NOT NULL UNIQUE, 
    user_password LONGTEXT NOT NULL, 
    user_phone VARCHAR(14) NOT NULL UNIQUE, 
    user_name VARCHAR(255) NOT NULL, 
    user_position INT NOT NULL, 
    user_created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    user_last_edit TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, 
    PRIMARY KEY (user_id), 
    FOREIGN KEY (user_position) REFERENCES `position`(pos_id)
);

CREATE TABLE password_reset_token(
	token_id INT AUTO_INCREMENT NOT NULL,
	token LONG NOT NULL,
    user_email VARCHAR(255) UNIQUE NOT NULL, 
    expiredAt TIMESTAMP DEFAULT (CURRENT_TIMESTAMP + INTERVAL 3 MINUTE),
	PRIMARY KEY (token_id),
);