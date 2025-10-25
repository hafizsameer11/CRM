<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('activity_logs', function (Blueprint $table) {
            $table->id();
            $table->string('actor_type'); // User, Admin
            $table->unsignedBigInteger('actor_id');
            $table->string('action'); // login, logout, create, update, delete, etc.
            $table->string('target')->nullable(); // e.g., 'Conversation', 'Message', 'Channel'
            $table->unsignedBigInteger('target_id')->nullable();
            $table->json('meta')->nullable();
            $table->timestamps();
            
            $table->index(['actor_type', 'actor_id']);
            $table->index('action');
            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('activity_logs');
    }
};

