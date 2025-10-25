<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('conversations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained()->onDelete('cascade');
            $table->foreignId('channel_id')->constrained()->onDelete('cascade');
            $table->string('peer_id'); // external user ID from platform
            $table->string('subject')->nullable();
            $table->enum('status', ['open', 'closed', 'pending'])->default('open');
            $table->foreignId('assigned_to')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamp('last_message_at')->nullable();
            $table->timestamps();
            
            $table->index('tenant_id');
            $table->index('channel_id');
            $table->index(['tenant_id', 'status']);
            $table->index('last_message_at');
            $table->unique(['channel_id', 'peer_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('conversations');
    }
};

