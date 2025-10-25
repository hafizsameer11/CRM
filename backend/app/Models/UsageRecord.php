<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UsageRecord extends Model
{
    use HasFactory;

    protected $fillable = [
        'tenant_id',
        'metric',
        'quantity',
        'period_date',
    ];

    protected $casts = [
        'quantity' => 'integer',
        'period_date' => 'date',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }

    public static function incrementUsage(int $tenantId, string $metric, int $quantity = 1): void
    {
        $record = static::firstOrCreate(
            [
                'tenant_id' => $tenantId,
                'metric' => $metric,
                'period_date' => now()->toDateString(),
            ],
            ['quantity' => 0]
        );

        $record->increment('quantity', $quantity);
    }

    public static function getUsage(int $tenantId, string $metric, ?string $date = null): int
    {
        return static::where('tenant_id', $tenantId)
            ->where('metric', $metric)
            ->where('period_date', $date ?? now()->toDateString())
            ->value('quantity') ?? 0;
    }
}

