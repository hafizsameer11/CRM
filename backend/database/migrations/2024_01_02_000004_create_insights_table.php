<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('insights', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained()->cascadeOnDelete();
            $table->foreignId('channel_id')->constrained()->cascadeOnDelete();
            
            $table->string('metric'); // followers, reach, impressions, engagement_rate, etc.
            $table->decimal('value', 15, 2);
            $table->date('date'); // Date of the metric
            
            $table->string('period')->default('day'); // day, week, month
            $table->json('meta')->nullable(); // Additional breakdown data
            
            $table->timestamps();
            
            $table->index(['channel_id', 'metric', 'date']);
            $table->index(['tenant_id', 'date']);
            $table->unique(['channel_id', 'metric', 'date', 'period']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('insights');
    }
};



