# 🌶️ CabaiDetect — Smart Farming Living Lab

CabaiDetect adalah aplikasi *Smart Farming* (Living Lab) berbasis web untuk mengelola lahan pertanian dan mendeteksi penyakit pada daun cabai menggunakan kecerdasan buatan (Machine Learning).

Aplikasi ini dibangun menggunakan arsitektur *microservices-lite* yang terbagi menjadi tiga bagian utama:
1. **Frontend (React & Vite)** — Antarmuka pengguna (UI/UX) yang mobile-responsive.
2. **Backend (Laravel)** — REST API untuk manajemen user, autentikasi (Sanctum), dan penyimpanan riwayat deteksi.
3. **ML-Service (FastAPI/Python)** — Service khusus untuk memproses gambar dan menjalankan model deteksi penyakit (AI).

---

## 📋 Persyaratan Sistem (Prerequisites)

Sebelum menginstal, pastikan sistem Anda sudah terinstal:
- **Node.js** (v16+ disarankan v20) & **npm**
- **PHP** (v8.2+) & **Composer**
- **Python** (v3.9+) & **pip**
- Extension PHP: `sqlite3`, `pdo_sqlite`, `fileinfo` (pastikan aktif di `php.ini`)

---

## 🚀 Panduan Instalasi dan Menjalankan Aplikasi

Anda perlu menjalankan ketiga service di bawah ini secara bersamaan di terminal/command prompt yang berbeda.

### 1. Backend (Laravel API)
Backend mengelola database (SQLite secara default) dan autentikasi.

Buka terminal baru dan jalankan:
```bash
# Masuk ke folder backend
cd backend

# Install dependencies PHP
composer install

# Buat file konfigurasi (jika belum ada)
copy .env.example .env

# Generate application key
php artisan key:generate

# Migrasi database (akan otomatis membuat database.sqlite jika , mysql ganti pakai mysql ton)
php artisan migrate

# Tautkan folder storage agar foto profil dan foto deteksi dapat diakses publik
php artisan storage:link

# Jalankan server backend (Gunakan port 8001)
php artisan serve --port=8001
```
*Backend sekarang berjalan di `http://localhost:8001`*

### 2. ML-Service (Machine Learning API)
Service ini menangani pemrosesan AI untuk mendeteksi gambar daun.

Buka terminal baru dan jalankan:
```bash
# Masuk ke folder ml-service
cd ml-service

# Install dependencies Python (seperti FastAPI, Uvicorn, dsb)
pip install -r requirements.txt

# Jalankan mesin service AI
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```
*ML Service sekarang berjalan di `http://localhost:8000`*
*(Anda bisa mengecek statusnya di `http://localhost:8000/health` atau melihat dokumentasi API di `http://localhost:8000/docs`)*

### 3. Frontend (React / Vite)
Frontend adalah antarmuka utama yang akan digunakan oleh user (petani / admin).

Buka terminal baru dan jalankan:
```bash
# Masuk ke folder frontend
cd frontend

# Install dependencies Node
npm install

# Jalankan Vite dev server
npm run dev
```
*Frontend sekarang berjalan di `http://localhost:5173` (cek terminal Vite untuk URL pastinya)*

---

## 👥 Akun Default / Penggunaan Pertama

1. Buka URL Frontend di browser Anda (misalnya `http://localhost:5173`).
2. Anda dapat mendaftarkan akun baru melalui halaman **Register**.
3. Secara default, akun baru yang mendaftar akan memiliki role sebagai **Petani**.
4. (Opsional) Jika Anda ingin menjadikan akun tersebut sebagai **Admin**, Anda bisa mengubah role-nya langsung di database (melalui SQLite viewer di `backend/database/database.sqlite`) dengan mengubah kolom `role` menjadi `admin`. Admin memiliki akses ke menu "Manajemen User".

---

## 🛠️ Catatan Penting
- **Port Bentrok**: Pastikan Anda tidak menjalankan aplikasi lain di port `8000`, `8001`, atau `5173`.
- **Integrasi**: Frontend sudah dikonfigurasi melalui `vite.config.js` untuk secara otomatis meneruskan permintaan API ke backend (`http://localhost:8001`). Backend juga sudah otomatis meneruskan permintaan deteksi ke ML-Service (`http://localhost:8000`).
- **Storage/Uploads**: Semua gambar yang diupload (foto daun & avatar) akan disimpan di folder `backend/storage/app/public/`. Itulah kenapa `php artisan storage:link` sangat penting dijalankan.

Dibuat dengan ❤️ untuk Project Akhir Mata Kuliah Pemrograman Web Framework.
