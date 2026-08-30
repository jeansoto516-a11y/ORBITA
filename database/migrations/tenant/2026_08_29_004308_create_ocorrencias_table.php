<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ocorrencias', function (Blueprint $table) {
            $table->id();
            $table->foreignId('ordem_servico_id')->nullable()->constrained('ordens_servico')->nullOnDelete();
            $table->foreignId('contrato_id')->constrained('contratos')->cascadeOnDelete();
            $table->foreignId('registrado_por')->constrained('users')->cascadeOnDelete();
            $table->string('titulo');
            $table->text('descricao');
            $table->enum('gravidade', ['baixa', 'media', 'alta', 'critica'])->default('media');
            $table->enum('status', ['aberta', 'em_analise', 'resolvida', 'fechada'])->default('aberta');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ocorrencias');
    }
};