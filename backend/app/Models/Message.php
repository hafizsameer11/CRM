<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Message extends Model
{
    use HasFactory;

    protected $fillable = [
        'conversation_id',
        'provider_message_id',
        'direction',
        'body',
        'media',
        'type',
        'delivered_at',
        'read_at',
        'meta',
    ];

    protected $casts = [
        'media' => 'array',
        'meta' => 'array',
        'delivered_at' => 'datetime',
        'read_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function conversation(): BelongsTo
    {
        return $this->belongsTo(Conversation::class);
    }

    public function isInbound(): bool
    {
        return $this->direction === 'in';
    }

    public function isOutbound(): bool
    {
        return $this->direction === 'out';
    }

    public function isDelivered(): bool
    {
        return $this->delivered_at !== null;
    }

    public function isRead(): bool
    {
        return $this->read_at !== null;
    }
}

