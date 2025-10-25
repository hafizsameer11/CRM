<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('channels', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained()->onDelete('cascade');
            $table->enum('type', ['facebook', 'instagram', 'whatsapp']);
            $table->json('identifiers'); // page_id, instagram_account_id, phone_number_id, etc.
            $table->text('access_token'); // encrypted
            $table->text('refresh_token')->nullable(); // encrypted
            $table->timestamp('expires_at')->nullable();
            $table->enum('status', ['active', 'expired', 'revoked', 'error'])->default('active');
            $table->timestamps();
            
            $table->index('tenant_id');
            $table->index(['tenant_id', 'type']);
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('channels');
    }
};

