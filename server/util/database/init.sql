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
    client_name VARCHAR(255) NOT NULL,      
    client_contact  VARCHAR(14) NOT NULL,   
    budget DECIMAL(20, 2) NOT NULL DEFAULT 0,   
    location VARCHAR(255) NOT NULL,      
    pic_id VARCHAR(10), 
    quote_list LONGTEXT DEFAULT NULL,      
    PRIMARY KEY (quote_id),      
    FOREIGN KEY (pic_id) 
    REFERENCES `user`(user_id)  
);

CREATE TABLE project (
    proj_id VARCHAR(20) NOT NULL, 
    proj_name VARCHAR(255) DEFAULT NULL, 
    manager_in_charge_id VARCHAR(10), 
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, 
    client_name VARCHAR(255) NOT NULL,
    client_contact VARCHAR(14) NOT NULL, 
    budget DECIMAL(20, 2) NOT NULL DEFAULT 0,   
    location VARCHAR(255) NOT NULL,      
    `due-date` DATE DEFAULT NULL,
    total_charges DECIMAL(20, 2) NOT NULL,
    last_edit_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_edit_pic VARCHAR(255),
    admin_in_charge_id VARCHAR(10),
    material_list LONGTEXT NOT NULL,
    FOREIGN KEY (manager_in_charge_id) REFERENCES `user`(user_id),
    FOREIGN KEY (admin_in_charge_id) REFERENCES `user`(user_id),
    FOREIGN KEY (last_edit_pic) REFERENCES `user`(user_id),
    CONSTRAINT CHECK (manager_in_charge_id LIKE 'MNG%' OR manager_in_charge_id LIKE 'SPU%'),
    CONSTRAINT CHECK (admin_in_charge_id LIKE 'ADM%' OR manager_in_charge_id LIKE 'SPU%')
);

CREATE TABLE `order` (
	order_id INT AUTO_INCREMENT NOT NULL, 
    order_status INT DEFAULT 1, 
    order_total_price DECIMAL(20, 2) NOT NULL DEFAULT 0,
    order_send_datetime TIMESTAMP DEFAULT NULL, 
    proj_id VARCHAR(20) NOT NULL, 
    PRIMARY KEY (order_id),
    CONSTRAINT order_status CHECK (order_status >= 0 AND order_status <= 4)
);

CREATE TABLE order_list (
	olist_id INT AUTO_INCREMENT NOT NULL, 
    olist_unit_price DECIMAL(10, 2) NOT NULL, 
    olist_quantity INT NOT NULL, 
    olist_product_id INT DEFAULT NULL, 
    doc_refer LONGTEXT DEFAULT NULL,
    received_date DATE DEFAULT NULL,
    order_id INT NOT NULL, 
    PRIMARY KEY (olist_id),
    FOREIGN KEY (order_id) REFERENCES `order`(order_id),
    FOREIGN KEY (olist_product_id) REFERENCES product(product_id), 
    CONSTRAINT product_id_and_doc_refer_check 
        CHECK (
            (olist_product_id IS NULL AND doc_refer IS NOT NULL) OR 
            (olist_product_id IS NOT NULL AND doc_refer IS NULL)
        )
);