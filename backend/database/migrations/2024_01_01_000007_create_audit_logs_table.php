<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('audit_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->nullable()->constrained()->onDelete('cascade');
            $table->foreignId('channel_id')->nullable()->constrained()->onDelete('set null');
            $table->foreignId('actor_user_id')->nullable()->constrained('users')->onDelete('set null');
            $table->string('action'); // e.g., 'send_message', 'api_call', etc.
            $table->json('request')->nullable(); // scrubbed request data
            $table->json('response')->nullable(); // scrubbed response data
            $table->string('status'); // success, error
            $table->integer('latency_ms')->nullable();
            $table->timestamps();
            
            $table->index('tenant_id');
            $table->index('channel_id');
            $table->index('action');
            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('audit_logs');
    }
};

