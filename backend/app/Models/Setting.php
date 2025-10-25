<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Setting extends Model
{
    use HasFactory;

    protected $fillable = [
        'key',
        'value',
        'scope',
        'tenant_id',
    ];

    protected $casts = [
        'value' => 'array',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }

    public function isSystem(): bool
    {
        return $this->scope === 'system';
    }

    public function isTenant(): bool
    {
        return $this->scope === 'tenant';
    }

    public static function getSystem(string $key, mixed $default = null): mixed
    {
        $setting = static::where('key', $key)
            ->where('scope', 'system')
            ->first();

        return $setting ? $setting->value : $default;
    }

    public static function setSystem(string $key, mixed $value): void
    {
        static::updateOrCreate(
            ['key' => $key, 'scope' => 'system', 'tenant_id' => null],
            ['value' => $value]
        );
    }

    public static function getTenant(int $tenantId, string $key, mixed $default = null): mixed
    {
        $setting = static::where('key', $key)
            ->where('scope', 'tenant')
            ->where('tenant_id', $tenantId)
            ->first();

        return $setting ? $setting->value : $default;
    }

    public static function setTenant(int $tenantId, string $key, mixed $value): void
    {
        static::updateOrCreate(
            ['key' => $key, 'scope' => 'tenant', 'tenant_id' => $tenantId],
            ['value' => $value]
        );
    }
}

