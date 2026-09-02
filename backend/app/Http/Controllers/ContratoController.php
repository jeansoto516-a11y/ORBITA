<?php

namespace App\Http\Controllers;

use App\Models\Contrato;
use Illuminate\Http\Request;

class ContratoController extends Controller
{
    public function index()
    {
        return Contrato::with('cliente')->orderBy('created_at', 'desc')->paginate(15);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'cliente_id' => 'required|exists:clientes,id',
            'numero_contrato' => 'required|string|unique:contratos,numero_contrato',
            'titulo' => 'required|string|max:255',
            'descricao' => 'nullable|string',
            'data_inicio' => 'required|date',
            'data_fim' => 'nullable|date|after_or_equal:data_inicio',
            'valor_mensal' => 'nullable|numeric|min:0',
            'sla_horas' => 'nullable|integer|min:0',
            'responsavel_id' => 'nullable|exists:users,id',
            'status' => 'nullable|in:ativo,suspenso,encerrado',
        ]);

        $contrato = Contrato::create($validated);

        return response()->json($contrato->load('cliente'), 201);
    }

    public function show(string $id)
    {
        return Contrato::with(['cliente', 'responsavel', 'ordensServico'])->findOrFail($id);
    }

    public function update(Request $request, string $id)
    {
        $contrato = Contrato::findOrFail($id);

        $validated = $request->validate([
            'cliente_id' => 'sometimes|required|exists:clientes,id',
            'numero_contrato' => 'sometimes|required|string|unique:contratos,numero_contrato,' . $contrato->id,
            'titulo' => 'sometimes|required|string|max:255',
            'descricao' => 'nullable|string',
            'data_inicio' => 'sometimes|required|date',
            'data_fim' => 'nullable|date|after_or_equal:data_inicio',
            'valor_mensal' => 'nullable|numeric|min:0',
            'sla_horas' => 'nullable|integer|min:0',
            'responsavel_id' => 'nullable|exists:users,id',
            'status' => 'sometimes|in:ativo,suspenso,encerrado',
        ]);

        $contrato->update($validated);

        return response()->json($contrato->load('cliente'));
    }

    public function destroy(string $id)
    {
        $contrato = Contrato::findOrFail($id);
        $contrato->delete();

        return response()->json(null, 204);
    }
}