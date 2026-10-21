CREATE DATABASE IF NOT EXISTS library_campus;
USE library_campus;

-- Tabla de Países
CREATE TABLE IF NOT EXISTS countries (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL
) ENGINE=InnoDB;

-- Tabla de Autores
CREATE TABLE IF NOT EXISTS authors (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    id_country INT NOT NULL,
    FOREIGN KEY (id_country) REFERENCES countries(id)
) ENGINE=InnoDB;

-- Tabla de Editoriales
CREATE TABLE IF NOT EXISTS editorials (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL
) ENGINE=InnoDB;

-- Tabla de Categorías (Normalizada: ya no depende de autores ni editoriales)
CREATE TABLE IF NOT EXISTS categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL
) ENGINE=InnoDB;

-- Tabla de Clientes / Usuarios[cite: 1]
CREATE TABLE IF NOT EXISTS customers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    firstname VARCHAR(50) NOT NULL,
    lastname VARCHAR(50) NOT NULL,
    address VARCHAR(100),
    phone VARCHAR(20) NOT NULL, -- Cambiado a VARCHAR para mejor manejo de números telefónicos
    email VARCHAR(100) NOT NULL,
    estado ENUM('ACTIVO', 'INACTIVO') DEFAULT 'INACTIVO'
) ENGINE=InnoDB;

-- Tabla de Ciudades y Sedes (Premises)
CREATE TABLE IF NOT EXISTS cities (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS premises (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50),
    address VARCHAR(100) NOT NULL,
    id_city INT NOT NULL,
    FOREIGN KEY (id_city) REFERENCES cities(id)
) ENGINE=InnoDB;

-- Tabla de Libros (Contiene las relaciones correctas con Categoría, Autor y Editorial)
CREATE TABLE IF NOT EXISTS books (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    year_publish INT NOT NULL,
    id_category INT NOT NULL,
    id_author INT NOT NULL,
    id_editorial INT NOT NULL,
    stock INT CHECK(stock >= 0) NOT NULL DEFAULT 1,
    FOREIGN KEY (id_category) REFERENCES categories(id),
    FOREIGN KEY (id_author) REFERENCES authors(id),
    FOREIGN KEY (id_editorial) REFERENCES editorials(id)
) ENGINE=InnoDB;

-- Tabla de Préstamos de Libros[cite: 1]
CREATE TABLE IF NOT EXISTS loan_books (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_book INT NOT NULL,
    id_customer INT NOT NULL,
    loan_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    tentative_return_date DATETIME,
    return_date DATETIME,
    FOREIGN KEY (id_book) REFERENCES books(id),
    FOREIGN KEY (id_customer) REFERENCES customers(id)
) ENGINE=InnoDB;

-- Tabla Cabecera de Ventas de Libros[cite: 1]
CREATE TABLE IF NOT EXISTS book_sales (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_customer INT NOT NULL,
    date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    total_amount DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (id_customer) REFERENCES customers(id)
) ENGINE=InnoDB;

-- Tabla Detalle de Ventas (Permite registrar 1 o varios libros por venta, según la imagen)[cite: 1]
CREATE TABLE IF NOT EXISTS book_sale_details (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_sale INT NOT NULL,
    id_book INT NOT NULL,
    quantity INT CHECK(quantity > 0) NOT NULL DEFAULT 1,
    unit_price DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (id_sale) REFERENCES book_sales(id) ON DELETE CASCADE,
    FOREIGN KEY (id_book) REFERENCES books(id)
) ENGINE=InnoDB;