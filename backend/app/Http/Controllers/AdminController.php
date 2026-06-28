<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;

class AdminController extends Controller
{
    /** Daftar semua user — hanya admin */
    public function index(Request $request)
    {
        $query = User::query()->select('id', 'name', 'email', 'role', 'created_at');

        if ($request->filled('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', '%' . $request->search . '%')
                  ->orWhere('email', 'like', '%' . $request->search . '%');
            });
        }

        if ($request->filled('role')) {
            $query->where('role', $request->role);
        }

        return response()->json($query->latest()->paginate(15));
    }

    /** Hapus user — hanya admin */
    public function destroy(User $user)
    {
        if ($user->role === 'admin') {
            return response()->json(['message' => 'Tidak dapat menghapus akun admin'], 403);
        }
        $user->delete();
        return response()->json(['message' => 'User berhasil dihapus']);
    }

    /** Update role user */
    public function updateRole(Request $request, User $user)
    {
        $validated = $request->validate([
            'role' => 'required|in:admin,petani',
        ]);

        $user->update(['role' => $validated['role']]);
        return response()->json(['message' => 'Role berhasil diperbarui', 'data' => $user]);
    }
}
