<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('plans', function (Blueprint $table) {
            $table->integer('posts_per_month')->default(30)->after('limits');
            $table->integer('media_storage_mb')->default(1000)->after('posts_per_month');
            $table->boolean('ai_content_enabled')->default(false)->after('media_storage_mb');
        });
    }

    public function down(): void
    {
        Schema::table('plans', function (Blueprint $table) {
            $table->dropColumn(['posts_per_month', 'media_storage_mb', 'ai_content_enabled']);
        });
    }
};



