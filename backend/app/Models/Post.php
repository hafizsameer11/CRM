<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Builder;

class Post extends Model
{
    use HasFactory;

    protected $fillable = [
        'tenant_id',
        'channel_id',
        'created_by',
        'caption',
        'media',
        'hashtags',
        'status',
        'scheduled_for',
        'published_at',
        'provider_post_id',
        'error',
        'likes_count',
        'comments_count',
        'shares_count',
        'reach',
        'impressions',
    ];

    protected $casts = [
        'media' => 'array',
        'hashtags' => 'array',
        'scheduled_for' => 'datetime',
        'published_at' => 'datetime',
        'likes_count' => 'integer',
        'comments_count' => 'integer',
        'shares_count' => 'integer',
        'reach' => 'integer',
        'impressions' => 'integer',
    ];

    protected static function booted(): void
    {
        static::addGlobalScope('tenant', function (Builder $query) {
            if (auth('api')->check()) {
                $query->where('tenant_id', auth('api')->user()->tenant_id);
            }
        });
    }

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }

    public function channel(): BelongsTo
    {
        return $this->belongsTo(Channel::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function comments(): HasMany
    {
        return $this->hasMany(Comment::class);
    }

    public function scopeScheduled(Builder $query): Builder
    {
        return $query->where('status', 'scheduled');
    }

    public function scopePublished(Builder $query): Builder
    {
        return $query->where('status', 'published');
    }

    public function scopeDraft(Builder $query): Builder
    {
        return $query->where('status', 'draft');
    }

    public function scopeFailed(Builder $query): Builder
    {
        return $query->where('status', 'failed');
    }

    public function isPending(): bool
    {
        return $this->status === 'scheduled' 
            && $this->scheduled_for 
            && $this->scheduled_for->isPast();
    }

    public function canPublish(): bool
    {
        return in_array($this->status, ['draft', 'failed']);
    }

    public function canSchedule(): bool
    {
        return in_array($this->status, ['draft', 'failed']);
    }
}



