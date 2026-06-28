<?php

namespace App\Http\Controllers;

use App\Models\Detection;
use App\Models\Lahan;
use App\Services\MlPredictionService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Exception;

class DetectionController extends Controller
{
    public function __construct(protected MlPredictionService $mlService)
    {
    }

    public function index(Request $request)
    {
        $query = Detection::with(['lahan', 'user']);

        if (Auth::user()->role !== 'admin') {
            $query->where('user_id', Auth::id());
        }

        if ($request->filled('lahan_id')) {
            $query->where('lahan_id', $request->lahan_id);
        }
        if ($request->filled('tingkat_keparahan')) {
            $query->where('tingkat_keparahan', $request->tingkat_keparahan);
        }

        return response()->json(
            $query->latest()->paginate(10)
        );
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'lahan_id' => 'required|exists:lahans,id',
            'image' => 'required|image|mimes:jpg,jpeg,png|max:5120', // max 5MB
        ]);

        $lahan = Lahan::findOrFail($validated['lahan_id']);
        if (Auth::user()->role !== 'admin' && $lahan->user_id !== Auth::id()) {
            abort(403, 'Anda tidak punya akses ke lahan ini');
        }

        try {
            $prediction = $this->mlService->predict($request->file('image'));
        } catch (Exception $e) {
            return response()->json([
                'message' => 'Gagal memproses gambar. Pastikan ML service sedang berjalan.',
                'error' => $e->getMessage(),
            ], 502);
        }

        // simpan gambar ke storage/app/public/detections
        $path = $request->file('image')->store('detections', 'public');

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

    public function show(Detection $detection)
    {
        $this->authorizeAccess($detection);
        return response()->json($detection->load(['lahan', 'user']));
    }

    public function destroy(Detection $detection)
    {
        $this->authorizeAccess($detection);
        Storage::disk('public')->delete($detection->image_path);
        $detection->delete();

        return response()->json(['message' => 'Riwayat deteksi berhasil dihapus']);
    }

    /** Ringkasan untuk dashboard */
    public function summary()
    {
        $query = Detection::query();
        if (Auth::user()->role !== 'admin') {
            $query->where('user_id', Auth::id());
        }

        return response()->json([
            'total_deteksi' => $query->count(),
            'per_keparahan' => $query->clone()
                ->selectRaw('tingkat_keparahan, count(*) as total')
                ->groupBy('tingkat_keparahan')->get(),
            'per_penyakit' => $query->clone()
                ->selectRaw('jenis_penyakit, count(*) as total')
                ->groupBy('jenis_penyakit')->get(),
        ]);
    }

    private function authorizeAccess(Detection $detection): void
    {
        if (Auth::user()->role !== 'admin' && $detection->user_id !== Auth::id()) {
            abort(403, 'Anda tidak punya akses ke data ini');
        }
    }
}