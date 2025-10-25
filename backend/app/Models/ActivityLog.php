<?php

namespace App\Models;

use Illuminate\Contracts\Auth\Authenticatable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class ActivityLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'actor_type',
        'actor_id',
        'action',
        'target',
        'target_id',
        'meta',
    ];

    protected $casts = [
        'meta' => 'array',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function actor(): MorphTo
    {
        return $this->morphTo();
    }

    public static function log(Model|Authenticatable $actor, string $action, ?string $target = null, ?int $targetId = null, ?array $meta = null): void
    {
        static::create([
            'actor_type' => get_class($actor),
            'actor_id' => $actor->getAuthIdentifier(),
            'action' => $action,
            'target' => $target,
            'target_id' => $targetId,
            'meta' => $meta,
        ]);
    }
}

