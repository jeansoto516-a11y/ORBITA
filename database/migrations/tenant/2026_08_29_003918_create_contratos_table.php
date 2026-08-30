<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('contratos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('cliente_id')->constrained('clientes')->cascadeOnDelete();
            $table->string('numero_contrato')->unique();
            $table->string('titulo');
            $table->text('descricao')->nullable();
            $table->date('data_inicio');
            $table->date('data_fim')->nullable();
            $table->decimal('valor_mensal', 12, 2)->nullable();
            $table->unsignedInteger('sla_horas')->nullable();
            $table->foreignId('responsavel_id')->nullable()->constrained('users')->nullOnDelete();
            $table->enum('status', ['ativo', 'suspenso', 'encerrado'])->default('ativo');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('contratos');
    }
};