<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Cliente extends Model
{
    use HasFactory;

    protected $fillable = [
        'razao_social',
        'nome_fantasia',
        'cnpj',
        'email',
        'telefone',
        'endereco',
        'ativo',
    ];

    protected $casts = [
        'ativo' => 'boolean',
    ];

    public function contratos(): HasMany
    {
        return $this->hasMany(Contrato::class);
    }
}