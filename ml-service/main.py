"""
Microservice ML - Deteksi Penyakit & Tingkat Keparahan Daun Cabai
==================================================================
Dipanggil oleh Laravel via HTTP POST (multipart/form-data, field "image").
Jalankan: uvicorn main:app --host 0.0.0.0 --port 8000 --reload
"""

import os
import joblib
import numpy as np
import cv2
from skimage.feature import graycomatrix, graycoprops
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse

MODEL_DIR = os.path.join(os.path.dirname(__file__), "models")

app = FastAPI(title="Chili Disease Detection Service")

# --- Load semua model SEKALI saat service start (bukan tiap request) ---
scaler = joblib.load(os.path.join(MODEL_DIR, "scaler.pkl"))
mlp_model = joblib.load(os.path.join(MODEL_DIR, "mlp_model.pkl"))
label_encoder = joblib.load(os.path.join(MODEL_DIR, "label_encoder.pkl"))
kmeans_model = joblib.load(os.path.join(MODEL_DIR, "kmeans_model.pkl"))

severity_mapping = joblib.load(os.path.join(MODEL_DIR, "severity_mapping.pkl"))


def extract_features(img: np.ndarray) -> np.ndarray:
    """Harus identik 1:1 dengan fungsi extract_features() di notebook training."""
    img = cv2.resize(img, (224, 224))
    img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)

    mean_r, mean_g, mean_b = [np.mean(img_rgb[:, :, i]) for i in range(3)]
    std_r, std_g, std_b = [np.std(img_rgb[:, :, i]) for i in range(3)]
    hist_r = np.histogram(img_rgb[:, :, 0], bins=10, range=(0, 255))[0]
    hist_g = np.histogram(img_rgb[:, :, 1], bins=10, range=(0, 255))[0]
    hist_b = np.histogram(img_rgb[:, :, 2], bins=10, range=(0, 255))[0]

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

    features = np.concatenate([
        [mean_r, mean_g, mean_b, std_r, std_g, std_b],
        hist_r, hist_g, hist_b,
        [contrast, dissimilarity, homogeneity, energy, correlation]
    ])
    return features.astype(np.float64).reshape(1, -1)  # shape (1, 41)


@app.get("/health")
def health_check():
    return {"status": "ok", "model_features": int(scaler.n_features_in_)}


@app.post("/predict")
async def predict(image: UploadFile = File(...)):
    if not image.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File yang diupload bukan gambar")

    contents = await image.read()
    np_arr = np.frombuffer(contents, np.uint8)
    img = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
    if img is None:
        raise HTTPException(status_code=400, detail="Gagal membaca gambar, file mungkin korup")

    try:
        features = extract_features(img)
        features_scaled = scaler.transform(features)

        pred_encoded = mlp_model.predict(features_scaled)[0]
        pred_proba = mlp_model.predict_proba(features_scaled)[0]
        pred_class = label_encoder.inverse_transform([pred_encoded])[0]
        confidence = float(np.max(pred_proba))

        cluster = int(kmeans_model.predict(features_scaled)[0])
        severity = severity_mapping.get(cluster, "Tidak diketahui")

        return JSONResponse({
            "jenis_penyakit": pred_class,
            "confidence": round(confidence, 4),
            "cluster": cluster,
            "tingkat_keparahan": severity,
        })
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Gagal memproses prediksi: {str(e)}")
