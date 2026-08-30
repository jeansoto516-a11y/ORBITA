<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Spatie\Activitylog\Support\LogOptions;
use Spatie\Activitylog\Models\Concerns\LogsActivity;

class Contrato extends Model
{
    use HasFactory, LogsActivity;

    protected $fillable = [
        'cliente_id',
        'numero_contrato',
        'titulo',
        'descricao',
        'data_inicio',
        'data_fim',
        'valor_mensal',
        'sla_horas',
        'responsavel_id',
        'status',
    ];

    protected $casts = [
        'data_inicio' => 'date',
        'data_fim' => 'date',
        'valor_mensal' => 'decimal:2',
    ];

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['titulo', 'status', 'valor_mensal', 'sla_horas', 'data_fim', 'responsavel_id'])
            ->logOnlyDirty()
            ->useLogName('contrato');
    }

    public function cliente(): BelongsTo
    {
        return $this->belongsTo(Cliente::class);
    }

    public function responsavel(): BelongsTo
    {
        return $this->belongsTo(User::class, 'responsavel_id');
    }

    public function ordensServico(): HasMany
    {
        return $this->hasMany(OrdemServico::class);
    }

    public function ocorrencias(): HasMany
    {
        return $this->hasMany(Ocorrencia::class);
    }
}