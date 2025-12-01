<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\Storage;

class MediaAsset extends Model
{
    use HasFactory;

    protected $fillable = [
        'tenant_id',
        'created_by',
        'file_name',
        'original_name',
        'mime_type',
        'size',
        'storage_path',
        'thumbnail_path',
        'width',
        'height',
        'duration',
        'provider_uploaded',
        'provider_url',
        'provider_id',
        'meta',
    ];

    protected $casts = [
        'size' => 'integer',
        'width' => 'integer',
        'height' => 'integer',
        'duration' => 'integer',
        'provider_uploaded' => 'boolean',
        'meta' => 'array',
    ];

    protected $appends = ['url', 'thumbnail_url', 'type'];

    protected static function booted(): void
    {
        static::addGlobalScope('tenant', function (Builder $query) {
            if (auth('api')->check()) {
                $query->where('tenant_id', auth('api')->user()->tenant_id);
            }
        });

        static::deleting(function (MediaAsset $media) {
            // Delete files when media asset is deleted
            Storage::delete($media->storage_path);
            if ($media->thumbnail_path) {
                Storage::delete($media->thumbnail_path);
            }
        });
    }

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function getUrlAttribute(): string
    {
        return Storage::url($this->storage_path);
    }

    public function getThumbnailUrlAttribute(): ?string
    {
        return $this->thumbnail_path ? Storage::url($this->thumbnail_path) : null;
    }

    public function getTypeAttribute(): string
    {
        if (str_starts_with($this->mime_type, 'image/')) {
            return 'image';
        }
        if (str_starts_with($this->mime_type, 'video/')) {
            return 'video';
        }
        return 'file';
    }

    public function getSizeInMbAttribute(): float
    {
        return round($this->size / 1024 / 1024, 2);
    }

    public function isImage(): bool
    {
        return $this->type === 'image';
    }

    public function isVideo(): bool
    {
        return $this->type === 'video';
    }
}



