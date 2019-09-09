DROP DATABASE IF EXISTS bamazon;

CREATE DATABASE bamazon;

USE bamazon;

CREATE TABLE products (
	item_id INT NOT NULL AUTO_INCREMENT,
    product_name VARCHAR(80) NULL,
    department VARCHAR(40) NULL,
    price DECIMAL(15,2) NULL,
    stock_quantity INT NULL,
    PRIMARY KEY(item_id)
    );

SELECT * FROM products;

INSERT INTO products (product_name, department, price, stock_quantity)
	VALUES ('Macbook Pro', 'Computers', 1000.99, 200),
		('How to Code for Complete Idiots', 'Books', 30.50, 100),
        ('Bowl Mixer', 'Kitchen Appliances', 350.66, 50),
        ('Microwave Oven', 'Kitchen Appliances', 100.30,80),
        ('Well That Didn''t Work - An Autobiography', 'Books', 12.99, 10),
        ('What the Hell am I doing With My Life - A Horror Story', 'Books', 10.99, 10),
        ('The Lord of the Rings - Complete Set', 'Movies', 55.67, 20),
        ('Bob''s Burgers - Season 1', 'TV Series', 33.99, 15),
        ('Firefly - Season 1', 'TV Series', 31.27, 2),
        ('Powermac G4 Dual 1.42GHz', 'Computers', 100.99, 2),
        ('Spaceballs - The SQL Database Entry', 'Movies', 123.45, 2);