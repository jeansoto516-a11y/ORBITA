<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Spatie\Activitylog\Support\LogOptions;
use Spatie\Activitylog\Models\Concerns\LogsActivity;

class OrdemServico extends Model
{
    use HasFactory, LogsActivity;

    protected $table = 'ordens_servico';

    protected $fillable = [
        'contrato_id',
        'equipe_id',
        'criado_por',
        'titulo',
        'descricao',
        'prioridade',
        'status',
        'data_prazo',
        'data_conclusao',
    ];

    protected $casts = [
        'data_prazo' => 'datetime',
        'data_conclusao' => 'datetime',
    ];

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['titulo', 'status', 'prioridade', 'equipe_id', 'data_prazo', 'data_conclusao'])
            ->logOnlyDirty()
            ->useLogName('ordem_servico');
    }

    public function contrato(): BelongsTo
    {
        return $this->belongsTo(Contrato::class);
    }

    public function equipe(): BelongsTo
    {
        return $this->belongsTo(Equipe::class);
    }

    public function criadoPor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'criado_por');
    }

    public function ocorrencias(): HasMany
    {
        return $this->hasMany(Ocorrencia::class);
    }
}