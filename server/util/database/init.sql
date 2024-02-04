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
    PRIMARY KEY (user_id), 
    FOREIGN KEY (user_position) REFERENCES `position`(pos_id)
);