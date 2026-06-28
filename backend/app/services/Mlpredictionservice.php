<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Http;
use Exception;

class Mlpredictionservice
{
    protected string $baseUrl;

    public function __construct()
    {
        $this->baseUrl = config('services.ml_service_url', env('ML_SERVICE_URL', 'http://localhost:8000'));
    }

    /**
     * Kirim gambar ke microservice Python untuk diprediksi.
     *
     * @throws Exception kalau service mati atau gagal proses
     */
    public function predict(UploadedFile $image): array
    {
        $response = Http::timeout(30)
            ->attach('image', file_get_contents($image->getRealPath()), $image->getClientOriginalName())
            ->post("{$this->baseUrl}/predict");

        if ($response->failed()) {
            throw new Exception(
                'Gagal memproses gambar di ML service: ' . $response->body(),
                $response->status()
            );
        }

        return $response->json();
        // contoh isi: ['jenis_penyakit' => '...', 'confidence' => 0.97, 'cluster' => 2, 'tingkat_keparahan' => '...']
    }
}