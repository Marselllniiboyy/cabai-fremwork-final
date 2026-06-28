<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Detection extends Model
{
    use HasFactory;

    protected $fillable = [
        'lahan_id', 'user_id', 'image_path',
        'jenis_penyakit', 'confidence', 'cluster', 'tingkat_keparahan',
    ];

    public function lahan(): BelongsTo
    {
        return $this->belongsTo(Lahan::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}