<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('messages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('conversation_id')->constrained()->onDelete('cascade');
            $table->string('provider_message_id')->unique(); // for idempotency
            $table->enum('direction', ['in', 'out']);
            $table->text('body')->nullable();
            $table->json('media')->nullable();
            $table->string('type')->default('text'); // text, image, video, audio, file
            $table->timestamp('delivered_at')->nullable();
            $table->timestamp('read_at')->nullable();
            $table->json('meta')->nullable(); // raw platform metadata
            $table->timestamps();
            
            $table->index('conversation_id');
            $table->index('provider_message_id');
            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('messages');
    }
};

