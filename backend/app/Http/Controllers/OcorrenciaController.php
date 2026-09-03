<?php

namespace App\Http\Controllers;

use App\Models\Ocorrencia;
use Illuminate\Http\Request;

class OcorrenciaController extends Controller
{
    public function index(Request $request)
    {
        $query = Ocorrencia::with(['contrato.cliente', 'ordemServico', 'registradoPor'])
            ->orderBy('created_at', 'desc');

        if ($request->has('status')) {
            $query->where('status', $request->query('status'));
        }

        if ($request->has('contrato_id')) {
            $query->where('contrato_id', $request->query('contrato_id'));
        }

        return $query->paginate(15);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'contrato_id' => 'required|exists:contratos,id',
            'ordem_servico_id' => 'nullable|exists:ordens_servico,id',
            'titulo' => 'required|string|max:255',
            'descricao' => 'required|string',
            'gravidade' => 'nullable|in:baixa,media,alta,critica',
        ]);

        $ocorrencia = Ocorrencia::create([
            ...$validated,
            'registrado_por' => $request->user()->id,
            'status' => 'aberta',
        ]);

        return response()->json(
            $ocorrencia->load(['contrato.cliente', 'ordemServico', 'registradoPor']),
            201
        );
    }

    public function show(string $id)
    {
        return Ocorrencia::with(['contrato.cliente', 'ordemServico', 'registradoPor'])
            ->findOrFail($id);
    }

    public function update(Request $request, string $id)
    {
        $ocorrencia = Ocorrencia::findOrFail($id);

        $validated = $request->validate([
            'titulo' => 'sometimes|required|string|max:255',
            'descricao' => 'sometimes|required|string',
            'gravidade' => 'sometimes|in:baixa,media,alta,critica',
            'status' => 'sometimes|in:aberta,em_analise,resolvida,fechada',
        ]);

        $ocorrencia->update($validated);

        return response()->json($ocorrencia->load(['contrato.cliente', 'ordemServico', 'registradoPor']));
    }

    public function destroy(string $id)
    {
        $ocorrencia = Ocorrencia::findOrFail($id);
        $ocorrencia->delete();

        return response()->json(null, 204);
    }
}