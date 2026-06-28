<?php

namespace App\Http\Controllers;

use App\Models\Lahan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class LahanController extends Controller
{
    public function index(Request $request)
    {
        $query = Lahan::with('user');

        // petani hanya lihat lahan miliknya, admin lihat semua
        if (Auth::user()->role !== 'admin') {
            $query->where('user_id', Auth::id());
        }

        if ($request->filled('search')) {
            $query->where('nama_lahan', 'like', '%' . $request->search . '%');
        }

        return response()->json($query->latest()->paginate(10));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nama_lahan' => 'required|string|max:255',
            'lokasi' => 'nullable|string|max:255',
            'luas_m2' => 'nullable|numeric|min:0',
        ]);

        $lahan = Lahan::create([...$validated, 'user_id' => Auth::id()]);

        return response()->json(['message' => 'Lahan berhasil ditambahkan', 'data' => $lahan], 201);
    }

    public function show(Lahan $lahan)
    {
        $this->authorizeAccess($lahan);
        return response()->json($lahan->load('detections'));
    }

    public function update(Request $request, Lahan $lahan)
    {
        $this->authorizeAccess($lahan);

        $validated = $request->validate([
            'nama_lahan' => 'sometimes|required|string|max:255',
            'lokasi' => 'nullable|string|max:255',
            'luas_m2' => 'nullable|numeric|min:0',
        ]);

        $lahan->update($validated);

        return response()->json(['message' => 'Lahan berhasil diupdate', 'data' => $lahan]);
    }

    public function destroy(Lahan $lahan)
    {
        $this->authorizeAccess($lahan);
        $lahan->delete();

        return response()->json(['message' => 'Lahan berhasil dihapus']);
    }

    private function authorizeAccess(Lahan $lahan): void
    {
        if (Auth::user()->role !== 'admin' && $lahan->user_id !== Auth::id()) {
            abort(403, 'Anda tidak punya akses ke lahan ini');
        }
    }
}