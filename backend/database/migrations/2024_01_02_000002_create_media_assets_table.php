<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('media_assets', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained()->cascadeOnDelete();
            $table->foreignId('created_by')->constrained('users')->cascadeOnDelete();
            
            $table->string('file_name');
            $table->string('original_name');
            $table->string('mime_type');
            $table->bigInteger('size'); // bytes
            $table->string('storage_path');
            $table->string('thumbnail_path')->nullable();
            
            $table->integer('width')->nullable();
            $table->integer('height')->nullable();
            $table->integer('duration')->nullable(); // for videos, in seconds
            
            $table->boolean('provider_uploaded')->default(false);
            $table->string('provider_url')->nullable(); // Meta CDN URL if uploaded to Facebook/Instagram
            $table->string('provider_id')->nullable();
            
            $table->json('meta')->nullable(); // Additional metadata
            
            $table->timestamps();
            
            $table->index(['tenant_id', 'created_at']);
            $table->index('mime_type');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('media_assets');
    }
};



