<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('detections', function (Blueprint $table) {
            $table->id();
            $table->foreignId('lahan_id')->constrained()->onDelete('cascade');
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('image_path');               // path foto yang diupload
            $table->string('jenis_penyakit');            // hasil dari model MLP
            $table->float('confidence');                 // confidence score MLP
            $table->unsignedTinyInteger('cluster');       // hasil dari KMeans (0-3)
            $table->string('tingkat_keparahan');          // hasil mapping severity
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('detections');
    }
};