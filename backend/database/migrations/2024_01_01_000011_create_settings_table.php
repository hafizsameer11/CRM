<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('settings', function (Blueprint $table) {
            $table->id();
            $table->string('key');
            $table->json('value');
            $table->enum('scope', ['system', 'tenant'])->default('system');
            $table->foreignId('tenant_id')->nullable()->constrained()->onDelete('cascade');
            $table->timestamps();
            
            $table->unique(['key', 'scope', 'tenant_id']);
            $table->index('scope');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('settings');
    }
};

