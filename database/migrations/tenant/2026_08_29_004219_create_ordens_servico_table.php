<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ordens_servico', function (Blueprint $table) {
            $table->id();
            $table->foreignId('contrato_id')->constrained('contratos')->cascadeOnDelete();
            $table->foreignId('equipe_id')->nullable()->constrained('equipes')->nullOnDelete();
            $table->foreignId('criado_por')->constrained('users')->cascadeOnDelete();
            $table->string('titulo');
            $table->text('descricao')->nullable();
            $table->enum('prioridade', ['baixa', 'media', 'alta', 'urgente'])->default('media');
            $table->enum('status', ['aberta', 'em_andamento', 'concluida', 'cancelada'])->default('aberta');
            $table->timestamp('data_prazo')->nullable();
            $table->timestamp('data_conclusao')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ordens_servico');
    }
};