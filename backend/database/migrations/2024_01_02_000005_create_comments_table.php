<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('comments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained()->cascadeOnDelete();
            $table->foreignId('channel_id')->constrained()->cascadeOnDelete();
            $table->foreignId('post_id')->nullable()->constrained()->cascadeOnDelete();
            
            $table->string('provider_comment_id')->unique();
            $table->string('provider_post_id');
            $table->string('provider_user_id');
            $table->string('provider_username');
            
            $table->text('message');
            $table->foreignId('parent_id')->nullable()->constrained('comments')->cascadeOnDelete();
            
            $table->enum('status', ['visible', 'hidden', 'spam', 'deleted'])->default('visible');
            $table->boolean('is_reply')->default(false);
            
            $table->timestamp('commented_at');
            $table->foreignId('replied_by')->nullable()->constrained('users');
            $table->timestamp('replied_at')->nullable();
            
            $table->json('meta')->nullable(); // User profile pic, likes count, etc.
            
            $table->timestamps();
            
            $table->index(['tenant_id', 'status']);
            $table->index(['channel_id', 'status']);
            $table->index(['post_id', 'status']);
            $table->index('provider_comment_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('comments');
    }
};



