<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('usage_records', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained()->onDelete('cascade');
            $table->string('metric'); // messages, api_calls, storage_mb
            $table->integer('quantity')->default(0);
            $table->date('period_date');
            $table->timestamps();
            
            $table->unique(['tenant_id', 'metric', 'period_date']);
            $table->index('period_date');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('usage_records');
    }
};

