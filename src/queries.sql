CREATE TABLE clients(
client_id INT PRIMARY KEY NOT NULL auto_increment,
client_name VARCHAR(30) NOT NULL,
client_address VARCHAR(500),
client_email VARCHAR(30) NOT NULL,
client_pass_hash VARCHAR(30) NOT NULL
);

CREATE TABLE admins(
admin_id INT PRIMARY KEY NOT NULL auto_increment,
admin_name VARCHAR(30),
admin_email VARCHAR(30),
admin_pass_hash VARCHAR(30)
);

CREATE TABLE insurance(
insurance_id INT PRIMARY KEY NOT NULL auto_increment,
insurance_name VARCHAR(80) NOT NULL,
insurance_description VARCHAR(300) NOT NULL,
insurance_admin_id INT NOT NULL,
FOREIGN KEY (insurance_admin_id) REFERENCES admins(admin_id) ON DELETE CASCADE
);

CREATE TABLE car(
car_id INT PRIMARY KEY NOT NULL auto_increment,
car_plate_number INT NOT NULL,
car_model_name VARCHAR(50) NOT NULL,
car_owner_id INT NOT NULL,
car_insurance_id INT,
FOREIGN KEY (car_owner_id) REFERENCES clients(client_id) ON DELETE CASCADE,
FOREIGN KEY (car_insurance_id) REFERENCES insurance(insurance_id) ON DELETE CASCADE
);

CREATE TABLE accident(
accident_id INT PRIMARY KEY NOT NULL auto_increment,
accident_location VARCHAR(400) NOT NULL,
accident_description VARCHAR(400),
accident_car_id INT,
FOREIGN KEY (accident_car_id) REFERENCES car(car_id) ON DELETE CASCADE
);

CREATE TABLE payment( -- insurance purchased
transc_id INT PRIMARY KEY NOT NULL auto_increment,
transc_date DATE,
transc_client_id INT NOT NULL,
transc_insurance_id INT NOT NULL,
FOREIGN KEY (transc_client_id) REFERENCES clients(client_id) ON DELETE CASCADE, 
FOREIGN KEY (transc_insurance_id) REFERENCES insurance(insurance_id) ON DELETE 
SET 
    NULL 
);

CREATE TABLE claims(
claim_id INT PRIMARY KEY NOT NULL auto_increment,
claim_client_id INT NOT NULL,
claim_insurance_id INT NOT NULL,
claim_admin_id INT NOT NULL,
claim_date DATE,
claim_status BIT NOT NULL DEFAULT 0,
FOREIGN KEY (claim_client_id) REFERENCES clients(client_id) ON DELETE CASCADE,
FOREIGN KEY (claim_insurance_id) REFERENCES insurance(insurance_id) ON DELETE 
SET 
    NULL,
FOREIGN KEY (claim_admin_id) REFERENCES admins(admin_id) ON DELETE 
SET 
    NULL,
);
