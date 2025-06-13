# Setup Database MySQL untuk Jogjadventure

## Langkah-langkah Setup Database

### 1. Persiapan Database
1. Buka **phpMyAdmin** di browser (biasanya `http://localhost/phpmyadmin`)
2. Login dengan username dan password MySQL Anda
3. Pastikan database `tourism` sudah ada, jika belum buat database baru dengan nama `tourism`

### 2. Membuat Tabel Users
1. Pilih database `tourism`
2. Klik tab **SQL**
3. Copy dan paste isi file `backend/data/create_users_table.sql`
4. Klik **Go** untuk menjalankan script

### 3. Konfigurasi Koneksi Database
1. Buka file `backend/config/database.js`
2. Sesuaikan konfigurasi database:
   ```javascript
   const dbConfig = {
     host: 'localhost',
     user: 'root',           // Sesuaikan dengan username MySQL Anda
     password: '',           // Sesuaikan dengan password MySQL Anda
     database: 'tourism',
     waitForConnections: true,
     connectionLimit: 10,
     queueLimit: 0
   };
   ```

### 4. Install Dependencies
Jalankan perintah berikut di folder `backend`:
```bash
npm install
```

### 5. Menjalankan Server
```bash
npm start
```

Atau untuk development dengan auto-reload:
```bash
npx nodemon server.js
```

## Struktur Tabel Users

| Field      | Type         | Description                    |
|------------|--------------|--------------------------------|
| id         | INT(11)      | Primary key, auto increment    |
| name       | VARCHAR(100) | Nama lengkap pengguna         |
| email      | VARCHAR(100) | Email pengguna (unique)       |
| password   | VARCHAR(255) | Password yang sudah di-hash   |
| created_at | TIMESTAMP    | Waktu pembuatan akun          |
| updated_at | TIMESTAMP    | Waktu update terakhir         |

## API Endpoints

### Register
- **URL**: `POST /api/auth/register`
- **Body**:
  ```json
  {
    "name": "Nama Lengkap",
    "email": "email@example.com",
    "password": "password123"
  }
  ```

### Login
- **URL**: `POST /api/auth/login`
- **Body**:
  ```json
  {
    "email": "email@example.com",
    "password": "password123"
  }
  ```

## Testing API

Anda dapat menggunakan tools seperti **Postman** atau **Thunder Client** untuk testing API:

1. **Test Register**:
   - Method: POST
   - URL: `http://localhost:5000/api/auth/register`
   - Headers: `Content-Type: application/json`
   - Body: JSON dengan name, email, password

2. **Test Login**:
   - Method: POST
   - URL: `http://localhost:5000/api/auth/login`
   - Headers: `Content-Type: application/json`
   - Body: JSON dengan email, password

## Troubleshooting

### Error: "Access denied for user"
- Pastikan username dan password MySQL benar di `config/database.js`

### Error: "Database 'tourism' doesn't exist"
- Buat database `tourism` di phpMyAdmin terlebih dahulu

### Error: "Table 'users' doesn't exist"
- Jalankan script SQL dari file `create_users_table.sql`

### Error: "Port 5000 already in use"
- Ubah PORT di `server.js` atau hentikan aplikasi yang menggunakan port 5000
