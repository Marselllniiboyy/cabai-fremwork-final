<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Lahan extends Model
{
    use HasFactory;

    protected $fillable = ['user_id', 'nama_lahan', 'lokasi', 'luas_m2'];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function detections(): HasMany
    {
        return $this->hasMany(Detection::class);
    }
}