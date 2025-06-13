-- Script untuk membuat tabel users di database tourism
-- Jalankan script ini di phpMyAdmin atau MySQL client

USE tourism;

-- Membuat tabel users untuk sistem autentikasi
CREATE TABLE IF NOT EXISTS `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL UNIQUE,
  `password` varchar(255) NOT NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Menambahkan index untuk performa yang lebih baik
CREATE INDEX idx_users_email ON users(email);

-- Contoh data dummy (opsional - hapus jika tidak diperlukan)
-- INSERT INTO users (name, email, password) VALUES 
-- ('Admin User', 'admin@jogjadventure.com', '$2a$10$example.hash.here'),
-- ('Test User', 'test@jogjadventure.com', '$2a$10$example.hash.here');

-- Menampilkan struktur tabel yang telah dibuat
DESCRIBE users;
