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
    user_contact VARCHAR(14) NOT NULL UNIQUE, 
    user_name VARCHAR(255) NOT NULL, 
    user_authority INT NOT NULL, 
    user_created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    user_last_edit TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, 
    PRIMARY KEY (user_id), 
    FOREIGN KEY (user_authority) REFERENCES `position`(pos_id)
);

CREATE TABLE password_reset_token(
	token_id INT AUTO_INCREMENT NOT NULL,
	token LONGTEXT NOT NULL,
    user_email VARCHAR(255) UNIQUE NOT NULL, 
    expiredAt TIMESTAMP DEFAULT (CURRENT_TIMESTAMP + INTERVAL 3 MINUTE),
	PRIMARY KEY (token_id),
);

CREATE TABLE category (
	cat_id INT AUTO_INCREMENT NOT NULL,
    cat_name VARCHAR(255) NOT NULL, 
    PRIMARY KEY (cat_id)
);

CREATE TABLE supplier (
	supplier_id INT AUTO_INCREMENT NOT NULL,
    supplier_cmp_name VARCHAR(255) NOT NULL,
    supplier_pic VARCHAR(255) NOT NULL,
    supplier_contact VARCHAR(14) NOT NULL,
    supplier_category VARCHAR(255) NOT NULL,
    supplier_address VARCHAR(255),
    createdAt TIMESTAMP DEFAULT current_timestamp,
    PRIMARY KEY (supplier_id)
);

CREATE TABLE product(
	product_id INT AUTO_INCREMENT NOT NULL, 
    product_name VARCHAR(255) NOT NULL, 
    product_category VARCHAR(255),
    product_unit_cost DECIMAL(10,2) NOT NULL, 
    product_unit_price DECIMAL(10,2) NOT NULL, 
    product_description LONGTEXT NOT NULL, 
    supplier_id INT DEFAULT NULL, 
    PRIMARY KEY (product_id), 
    FOREIGN KEY (supplier_id) REFERENCES supplier(supplier_id)
);

CREATE TABLE quotation (  
    quote_id VARCHAR(255) NOT NULL,      
    quote_name VARCHAR(255) NOT NULL,      
    create_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,     
    quote_client_name VARCHAR(255) NOT NULL,      
    quote_client_contact  VARCHAR(14) NOT NULL,   
    quote_address VARCHAR(255) NOT NULL,      
    pic_id VARCHAR(10), 
    quote_product_lists LONGTEXT DEFAULT NULL,          
    quote_sub_total DECIMAL(15,2) NOT NULL, 
    quote_prop_type VARCHAR(10) NOT NULL, 
    quote_discount DECIMAL(15, 2) NOT NULL, 
    last_edit_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, 
    PRIMARY KEY (quote_id),
    FOREIGN KEY (pic_id)
    REFERENCES `user`(user_id)  
);

CREATE TABLE project (
    project_id VARCHAR(20) NOT NULL, 
    project_name VARCHAR(255) DEFAULT NULL, 
    manager_in_charge_id VARCHAR(10), 
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, 
    project_client_name VARCHAR(255) NOT NULL,
    project_client_contact VARCHAR(14) NOT NULL, 
    project_address VARCHAR(255) NOT NULL,      
    project_grand_total DECIMAL(20, 2) NOT NULL,
    project_sub_total DECIMAL(20, 2) NOT NULL,
    project_discount DECIMAL(20, 2) NOT NULL,
    project_prop_type VARCHAR(10) NOT NULL, 
    last_edit_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_edit_pic VARCHAR(255),
    admin_in_charge_id VARCHAR(10),
    project_product_lists LONGTEXT NOT NULL,
    PRIMARY KEY (project_id),
    FOREIGN KEY (manager_in_charge_id) REFERENCES `user`(user_id),
    FOREIGN KEY (admin_in_charge_id) REFERENCES `user`(user_id),
    FOREIGN KEY (last_edit_pic) REFERENCES `user`(user_id),
    CONSTRAINT CHECK (manager_in_charge_id LIKE 'MNG%' OR manager_in_charge_id LIKE 'SPU%'),
    CONSTRAINT CHECK (admin_in_charge_id LIKE 'ADM%' OR manager_in_charge_id LIKE 'SPU%')
);

CREATE TABLE project_order (
    project_order_id INT AUTO_INCREMENT NOT NULL, 
    supplier_id INT NOT NULL, 
    project_id VARCHAR(20) NOT NULL, 
    project_order_subtotal DECIMAL(15,2) NOT NULL, 
    project_order_total_paid DECIMAL(15,2) NOT NULL DEFAULT 0,
    project_order_product_lists LONGTEXT NOT NULL, 
    project_order_status VARCHAR(255) DEFAULT 'under process',
    project_order_doc_refer VARCHAR(255) DEFAULT NULL, 
    pic_id VARCHAR(255) NOT NULL,
    PRIMARY KEY(project_order_id), 
    FOREIGN KEY (supplier_id) REFERENCES supplier(supplier_id),
    FOREIGN KEY (project_id) REFERENCES project(project_id),
    FOREIGN KEY (pic_id) REFERENCES `user`(user_id), 
    CONSTRAINT pic_id_check CHECK (pic_id LIKE 'SPU%' OR pic_id LIKE 'AMD%')
);
