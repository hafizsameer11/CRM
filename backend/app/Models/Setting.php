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
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    // Accessor: Decode JSON value
    public function getValueAttribute($value)
    {
        if (is_string($value)) {
            $decoded = json_decode($value, true);
            return json_last_error() === JSON_ERROR_NONE ? $decoded : $value;
        }
        return $value;
    }

    // Mutator: Encode value to JSON
    public function setValueAttribute($value)
    {
        $this->attributes['value'] = json_encode($value);
    }

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

        if (!$setting) {
            return $default;
        }

        // Value is decoded from JSON via accessor
        return $setting->value;
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

