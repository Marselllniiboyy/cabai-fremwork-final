# Dokumentasi Sistem Deteksi Penyakit Cabai (`ml-service` - FastAPI)

Dokumentasi ini menjelaskan secara mendalam tentang arsitektur, alur kerja data, ekstraksi fitur machine learning, komponen, serta integrasi frontend/backend pada modul **`ml-service`** yang berbasis **FastAPI**.

---

## 📌 Daftar Isi
1. [Overview](#-overview)
2. [Arsitektur & Alur Kerja Data](#%EF%B8%8F-arsitektur--alur-kerja-data)
   - [Diagram Alur (Data Flow)](#diagram-alur-data-flow)
   - [Langkah-demi-Langkah Proses Deteksi](#langkah-demi-langkah-proses-deteksi)
3. [Format Input dan Output API](#-format-input-dan-output-api)
   - [Endpoint `/predict` (POST)](#endpoint-predict-post)
   - [Endpoint `/health` (GET)](#endpoint-health-get)
4. [Komponen Internal & Analisis Kode `ml-service`](#-komponen-internal--analisis-kode-ml-service)
   - [Struktur Direktori](#struktur-direktori)
   - [1. Pemuatan Model (Model Loading)](#1-pemuatan-model-model-loading)
   - [2. Algoritma Ekstraksi Fitur Gambar (`extract_features`)](#2-algoritma-ekstraksi-fitur-gambar-extract_features)
   - [3. Endpoint Prediksi (`/predict`)](#3-endpoint-prediksi-predict)
5. [Integrasi dengan Laravel (Backend)](#-integrasi-dengan-laravel-backend)
6. [Integrasi dengan React (Frontend)](#-integrasi-dengan-react-frontend)
7. [Panduan Instalasi & Pengoperasian](#-panduan-instalasi--pengoperasian)

---

## 📖 Overview
`ml-service` adalah microservice mandiri berbasis Python yang dibuat menggunakan framework **FastAPI**. Layanan ini bertindak sebagai mesin inferensi Machine Learning (ML) untuk menganalisis daun cabai yang diunggah oleh pengguna. 

Layanan ini memiliki dua tugas utama:
1. **Klasifikasi Penyakit**: Mengidentifikasi jenis penyakit pada daun cabai menggunakan model **Multi-Layer Perceptron (MLP)**.
2. **Estimasi Tingkat Keparahan**: Mengelompokkan tingkat keberadaan/keparahan penyakit menggunakan model clustering **K-Means**.

---

## ⚡ Arsitektur & Alur Kerja Data

Sistem ini menggunakan arsitektur **Three-Tier/Microservices** di mana FastAPI bertindak sebagai subsistem pemrosesan gambar dan kecerdasan buatan, sedangkan Laravel bertindak sebagai gerbang API utama (API Gateway) dan pengelola database.

### Diagram Alur (Data Flow)

```mermaid
sequenceDiagram
    autonumber
    actor User as Pengguna
    participant FE as Frontend (React)
    participant BE as Backend (Laravel)
    participant ML as ML Service (FastAPI)
    database DB as Database (MySQL)

    User->>FE: Pilih Lahan & Unggah Foto Daun Cabai
    FE->>BE: HTTP POST /api/detections (multipart/form-data)
    Note over BE: Validasi input & ambil file gambar
    BE->>ML: HTTP POST /predict (multipart/form-data)
    
    Note over ML: Decode Gambar (OpenCV)<br/>Ekstraksi Fitur (Moments, Hist, GLCM)<br/>Prediksi MLP & Clustering K-Means
    
    ML-->>BE: Mengembalikan Hasil Prediksi (JSON)
    Note over BE: Simpan gambar ke Storage<br/>Simpan data deteksi ke Database
    BE->>DB: INSERT INTO detections (...)
    DB-->>BE: Status OK
    BE-->>FE: HTTP 201 (Detail Deteksi + URL Gambar)
    FE->>User: Menampilkan Hasil Diagnosis di Dashboard & Deteksi Detail
```

### Penjelasan Langkah-demi-Langkah

1. **Inisiasi dari Frontend (React)**: Pengguna mengakses halaman deteksi baru di aplikasi web, memilih lahan pertanian yang akan dikaitkan, mengunggah foto daun cabai, dan menekan tombol **"Deteksi"**.
2. **Permintaan ke Laravel (Backend)**: React mengirimkan file gambar dan ID lahan menggunakan HTTP POST request dengan format `multipart/form-data` ke Laravel API.
3. **Penerusan ke FastAPI**: Laravel bertindak sebagai perantara (proxy/bridge). Melalui `MlPredictionService.php`, Laravel mengirimkan kembali file gambar tersebut ke FastAPI di endpoint `http://localhost:8000/predict` menggunakan HTTP POST.
4. **Analisis di FastAPI**: 
   - Gambar didekodekan menjadi array NumPy.
   - Fitur warna dan tekstur diekstrak menjadi vektor data berdimensi 41.
   - Vektor data dinormalisasi dengan StandardScaler.
   - Model MLP mengklasifikasikan jenis penyakit tanaman cabai.
   - Model K-Means memprediksi cluster tingkat keparahan.
5. **Output dari FastAPI**: FastAPI merespons dengan JSON data hasil prediksi.
6. **Persistensi Data**: Laravel menerima JSON tersebut, menyimpan file gambar ke direktori penyimpanan lokal/cloud (`storage/app/public/detections`), lalu mencatat data penyakit, confidence score, dan tingkat keparahan ke database MySQL.
7. **Penyajian ke Website**: Laravel mengirimkan respons sukses beserta data deteksi ke React. React menampilkan hasil diagnosis dan grafik perkembangan penyakit secara real-time pada dashboard interaktif.

---

## 🔌 Format Input dan Output API

### Endpoint `/predict` (POST)

Digunakan untuk memproses gambar daun cabai dan mengembalikan hasil analisis kecerdasan buatan.

* **URL**: `/predict`
* **Method**: `POST`
* **Content-Type**: `multipart/form-data`
* **Request Payload**:
  
  | Field | Type | Required | Description |
  | :--- | :--- | :--- | :--- |
  | `image` | File (Binary) | Ya | Gambar daun cabai yang akan dideteksi (JPG/JPEG/PNG) |

* **Response Payload (HTTP 200 OK - JSON)**:
  ```json
  {
    "jenis_penyakit": "Leaf Curl",
    "confidence": 0.9542,
    "cluster": 2,
    "tingkat_keparahan": "Sedang"
  }
  ```

---

### Endpoint `/health` (GET)

Digunakan untuk memeriksa apakah microservice berjalan dengan baik dan memastikan model ter-load dengan benar.

* **URL**: `/health`
* **Method**: `GET`
* **Response Payload (HTTP 200 OK - JSON)**:
  ```json
  {
    "status": "ok",
    "model_features": 41
  }
  ```

---

## 🛠️ Komponen Internal & Analisis Kode `ml-service`

### Struktur Direktori
```text
ml-service/
│
├── models/                       # Folder penyimpan model ML yang telah dilatih (.pkl)
│   ├── kmeans_model.pkl          # Model K-Means untuk clustering keparahan
│   ├── label_encoder.pkl         # Encoder label kategori penyakit cabai
│   ├── mlp_model.pkl             # Neural Network (MLP) Classifier untuk jenis penyakit
│   ├── scaler.pkl                # StandardScaler untuk normalisasi fitur
│   └── severity_mapping.pkl      # Kamus pemetaan Cluster ID ke Label Keparahan
│
├── main.py                       # Logika utama FastAPI (Routing, Feature Extraction, Prediksi)
├── requirements.txt              # Daftar dependensi Python yang dibutuhkan
└── readme.md                     # Panduan singkat menjalankan aplikasi
```

Berikut adalah kutipan kode program penting dari [main.py](file:///c:/Semester%204/Pemrograman%20Web%20Berbasis%20Framework/cabai-fremwork-final/ml-service/main.py) beserta penjelasan fungsinya:

### 1. Pemuatan Model (Model Loading)

```python
MODEL_DIR = os.path.join(os.path.dirname(__file__), "models")

# --- Load semua model SEKALI saat service start (bukan tiap request) ---
scaler = joblib.load(os.path.join(MODEL_DIR, "scaler.pkl"))
mlp_model = joblib.load(os.path.join(MODEL_DIR, "mlp_model.pkl"))
label_encoder = joblib.load(os.path.join(MODEL_DIR, "label_encoder.pkl"))
kmeans_model = joblib.load(os.path.join(MODEL_DIR, "kmeans_model.pkl"))
severity_mapping = joblib.load(os.path.join(MODEL_DIR, "severity_mapping.pkl"))
```

* **Kegunaan**:
  Kode di atas berjalan saat server FastAPI pertama kali dijalankan (*startup*). `joblib.load` digunakan untuk memuat file model biner terserialisasi (`.pkl`) ke dalam memori server.
* **Mengapa penting?**
  Proses pemuatan model Machine Learning membutuhkan waktu dan sumber daya komputasi yang cukup besar. Dengan memuat model satu kali di tingkat global (bukan di dalam fungsi endpoint `/predict`), setiap permintaan prediksi baru dapat ditangani secara instan tanpa latensi tambahan.

---

### 2. Algoritma Ekstraksi Fitur Gambar (`extract_features`)

Fungsi ini bertanggung jawab untuk mengekstrak karakteristik gambar mentah menjadi representasi numerik (vektor fitur) berdimensi 41 yang dipahami oleh model Machine Learning.

```python
def extract_features(img: np.ndarray) -> np.ndarray:
    # 1. Normalisasi Dimensi & Ruang Warna
    img = cv2.resize(img, (224, 224))
    img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)

    # 2. Color Moments (6 Fitur)
    mean_r, mean_g, mean_b = [np.mean(img_rgb[:, :, i]) for i in range(3)]
    std_r, std_g, std_b = [np.std(img_rgb[:, :, i]) for i in range(3)]
    
    # 3. Color Histograms (30 Fitur)
    hist_r = np.histogram(img_rgb[:, :, 0], bins=10, range=(0, 255))[0]
    hist_g = np.histogram(img_rgb[:, :, 1], bins=10, range=(0, 255))[0]
    hist_b = np.histogram(img_rgb[:, :, 2], bins=10, range=(0, 255))[0]

    # 4. GLCM Texture Features (5 Fitur)
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    gray_resized = cv2.resize(gray, (128, 128))
    glcm = graycomatrix(gray_resized, distances=[1],
                         angles=[0, np.pi / 4, np.pi / 2, 3 * np.pi / 4],
                         symmetric=True, normed=True)
    contrast = np.mean(graycoprops(glcm, 'contrast'))
    dissimilarity = np.mean(graycoprops(glcm, 'dissimilarity'))
    homogeneity = np.mean(graycoprops(glcm, 'homogeneity'))
    energy = np.mean(graycoprops(glcm, 'energy'))
    correlation = np.mean(graycoprops(glcm, 'correlation'))

    # 5. Menggabungkan Semua Fitur (Total: 41 Fitur)
    features = np.concatenate([
        [mean_r, mean_g, mean_b, std_r, std_g, std_b],
        hist_r, hist_g, hist_b,
        [contrast, dissimilarity, homogeneity, energy, correlation]
    ])
    return features.astype(np.float64).reshape(1, -1)  # shape (1, 41)
```

* **Kegunaan**:
  * **Normalisasi Gambar**: Mengubah ukuran gambar menjadi $224 \times 224$ piksel dan ruang warna dari BGR ke RGB agar konsisten dengan proses training model.
  * **Color Moments**: Menghitung rata-rata (`mean`) dan standar deviasi (`std`) warna dari saluran Red, Green, dan Blue. Ini berguna untuk mendeteksi perubahan warna daun cabai (misalnya menguning).
  * **Color Histograms**: Membagi spektrum warna menjadi 10 keranjang (bins) untuk tiap saluran warna RGB guna mendeteksi distribusi frekuensi warna daun cabai secara granular.
  * **GLCM (Gray-Level Co-occurrence Matrix)**: Mengubah gambar ke Grayscale, lalu menghitung matriks ko-okurensi tingkat keabuan dengan jarak 1 piksel di 4 arah sudut. Dari matriks ini diekstrak properti tekstur (`contrast`, `dissimilarity`, `homogeneity`, `energy`, `correlation`) yang mengukur kerataan guratan daun, bercak-bercak penyakit, dan kekasaran permukaan daun.
  * **Concatenation**: Menggabungkan seluruh data tersebut menjadi vektor tunggal berdimensi 41 ($6 + 30 + 5$) dan di-reshape agar siap dimasukkan ke model scaler.

---

### 3. Endpoint Prediksi (`/predict`)

Endpoint utama yang dipanggil oleh backend Laravel untuk memproses gambar dan menghasilkan prediksi diagnosis penyakit serta tingkat keparahannya.

```python
@app.post("/predict")
async def predict(image: UploadFile = File(...)):
    # 1. Validasi Input Gambar
    if not image.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File yang diupload bukan gambar")

    # 2. Membaca Byte Gambar & Konversi ke OpenCV Format
    contents = await image.read()
    np_arr = np.frombuffer(contents, np.uint8)
    img = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
    if img is None:
        raise HTTPException(status_code=400, detail="Gagal membaca gambar, file mungkin korup")

    try:
        # 3. Ekstraksi Fitur & Scaling
        features = extract_features(img)
        features_scaled = scaler.transform(features)

        # 4. Klasifikasi Penyakit dengan MLP
        pred_encoded = mlp_model.predict(features_scaled)[0]
        pred_proba = mlp_model.predict_proba(features_scaled)[0]
        pred_class = label_encoder.inverse_transform([pred_encoded])[0]
        confidence = float(np.max(pred_proba))

        # 5. Clustering Tingkat Keparahan dengan K-Means
        cluster = int(kmeans_model.predict(features_scaled)[0])
        severity = severity_mapping.get(cluster, "Tidak diketahui")

        # 6. Mengirimkan Respons JSON
        return JSONResponse({
            "jenis_penyakit": pred_class,
            "confidence": round(confidence, 4),
            "cluster": cluster,
            "tingkat_keparahan": severity,
        })
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Gagal memproses prediksi: {str(e)}")
```

* **Kegunaan**:
  * **`UploadFile`**: Menangani upload file asinkron dari pustaka `python-multipart`.
  * **`cv2.imdecode`**: Mengubah byte biner mentah dari berkas yang diunggah ke dalam array NumPy berformat gambar BGR (format asli OpenCV) secara langsung di memori tanpa perlu menyimpan file sementara di disk.
  * **`scaler.transform`**: Menormalisasi vektor 41 dimensi berdasarkan parameter statistik pelatihan agar sesuai dengan skala input model.
  * **`mlp_model.predict` & `predict_proba`**: Memprediksi kelas penyakit (label numerik) dan menghitung nilai probabilitas kemiripan (*confidence score*).
  * **`label_encoder.inverse_transform`**: Memetakan kelas numerik kembali ke bentuk string nama penyakit cabai asli (misal: "Bercak Daun").
  * **`kmeans_model.predict`**: Memprediksi cluster kelompok tingkat keparahan tanaman.
  * **`severity_mapping.get`**: Mengambil string label tingkat keparahan berdasarkan indeks klaster K-Means dari kamus pemetaan.

---

## 🔌 Integrasi dengan Laravel (Backend)

Laravel bertindak sebagai mediator komunikasi. Berikut adalah cuplikan bagaimana Laravel mengonsumsi FastAPI (`ml-service`):

### 1. Service Client: [MlPredictionService.php](file:///c:/Semester%204/Pemrograman%20Web%20Berbasis%20Framework/cabai-fremwork-final/backend/app/services/Mlpredictionservice.php)
```php
public function predict(UploadedFile $image): array
{
    // Mengirim HTTP POST ke FastAPI dengan timeout 30 detik
    $response = Http::timeout(30)
        ->attach('image', file_get_contents($image->getRealPath()), $image->getClientOriginalName())
        ->post("{$this->baseUrl}/predict");

    if ($response->failed()) {
        throw new Exception(
            'Gagal memproses gambar di ML service: ' . $response->body(),
            $response->status()
        );
    }

    return $response->json(); // Mengembalikan array ['jenis_penyakit' => ..., 'confidence' => ..., etc]
}
```

### 2. Controller Handler: [DetectionController.php](file:///c:/Semester%204/Pemrograman%20Web%20Berbasis%20Framework/cabai-fremwork-final/backend/app/Http/Controllers/DetectionController.php)
Metode `store` menerima unggahan gambar dari frontend, mengirimkannya ke `MlPredictionService`, merekam ke database, dan merespons kembali ke klien:
```php
public function store(Request $request)
{
    $validated = $request->validate([
        'lahan_id' => 'required|exists:lahans,id',
        'image' => 'required|image|mimes:jpg,jpeg,png|max:5120',
    ]);

    // Memanggil ML service
    $prediction = $this->mlService->predict($request->file('image'));

    // Menyimpan gambar secara lokal
    $path = $request->file('image')->store('detections', 'public');

    // Merekam ke Database MySQL
    $detection = Detection::create([
        'lahan_id' => $validated['lahan_id'],
        'user_id' => Auth::id(),
        'image_path' => $path,
        'jenis_penyakit' => $prediction['jenis_penyakit'],
        'confidence' => $prediction['confidence'],
        'cluster' => $prediction['cluster'],
        'tingkat_keparahan' => $prediction['tingkat_keparahan'],
    ]);

    return response()->json([
        'message' => 'Deteksi berhasil',
        'data' => $detection,
        'image_url' => Storage::url($path),
    ], 201);
}
```

---

## 💻 Integrasi dengan React (Frontend)

Hasil olahan data FastAPI yang telah disimpan Laravel disajikan ke website dengan cara berikut:

### 1. Halaman Deteksi Baru ([DeteksiBaruPage.jsx](file:///c:/Semester%204/Pemrograman%20Web%20Berbasis%20Framework/cabai-fremwork-final/frontend/src/pages/DeteksiBaruPage.jsx))
Formulir mengunggah gambar menggunakan `FormData` untuk mengirim request ke Laravel:
```javascript
const formData = new FormData()
formData.append('lahan_id', selectedLahan)
formData.append('image', imageFile)

const { data } = await api.post('/detections', formData, {
  headers: { 'Content-Type': 'multipart/form-data' },
})
setResult(data) // data berisi jenis_penyakit, confidence, tingkat_keparahan
```

Setelah mendapat respons dari backend, UI React akan langsung memperbarui status komponen untuk menampilkan:
- **Nama Penyakit** (misal: "Bercak Daun" atau "Leaf Curl").
- **Tingkat Akurasi** (`confidence * 100`%).
- **Tingkat Keparahan** menggunakan badge dinamis (`SevBadge`):
  - Kategori `rendah` $\rightarrow$ Hijau
  - Kategori `sedang` $\rightarrow$ Kuning/Amber
  - Kategori `tinggi` $\rightarrow$ Oranye
  - Kategori `kritis` $\rightarrow$ Merah
- **Saran Penanganan Dinamis** (`SevAdvice`) berdasarkan tingkat keparahan tanaman untuk memandu petani mengambil keputusan cepat.

### 2. Grafik Dashboard Visual ([DashboardPage.jsx](file:///c:/Semester%204/Pemrograman%20Web%20Berbasis%20Framework/cabai-fremwork-final/frontend/src/pages/DashboardPage.jsx))
Data statistik agregat yang bersumber dari respons model FastAPI dikonsumsi melalui endpoint Laravel `/api/detections/summary` dan digambarkan secara menarik menggunakan pustaka **Recharts** berupa diagram lingkaran (Pie Chart) dan diagram batang (Bar Chart) untuk menganalisis penyebaran jenis penyakit dan keparahan tanaman di lahan petani.

---

## 🚀 Panduan Instalasi & Pengoperasian

### Prasyarat
- Python versi 3.9 ke atas terinstall di komputer Anda.
- Lib-paket C++ (dibutuhkan oleh OpenCV di beberapa sistem).

### Langkah Menjalankan Service ML

1. Masuk ke direktori `ml-service`:
   ```bash
   cd ml-service
   ```

2. Instal dependensi Python:
   ```bash
   pip install -r requirements.txt
   ```

3. Jalankan server FastAPI dengan Uvicorn:
   ```bash
   python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
   ```

4. Verifikasi dan Pengujian Mandiri:
   - **Cek Status Kesehatan**: Buka `http://localhost:8000/health` pada browser.
   - **Dokumentasi API Interaktif (Swagger UI)**: Buka `http://localhost:8000/docs` untuk melakukan ujicoba API secara langsung dengan mengunggah gambar daun cabai melalui antarmuka web yang disediakan otomatis oleh FastAPI.
