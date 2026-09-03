<?php

namespace App\Http\Controllers;

use App\Models\OrdemServico;
use Illuminate\Http\Request;
use Spatie\Activitylog\Models\Activity;

class OrdemServicoController extends Controller
{
    public function index(Request $request)
    {
        $query = OrdemServico::with(['contrato.cliente', 'equipe', 'criadoPor'])
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
            'equipe_id' => 'nullable|exists:equipes,id',
            'titulo' => 'required|string|max:255',
            'descricao' => 'nullable|string',
            'prioridade' => 'nullable|in:baixa,media,alta,urgente',
            'data_prazo' => 'nullable|date',
        ]);

        $os = OrdemServico::create([
            ...$validated,
            'criado_por' => $request->user()->id,
            'status' => 'aberta',
        ]);

        return response()->json($os->load(['contrato.cliente', 'equipe', 'criadoPor']), 201);
    }

    public function show(string $id)
    {
        return OrdemServico::with(['contrato.cliente', 'equipe', 'criadoPor', 'ocorrencias'])
            ->findOrFail($id);
    }

    public function update(Request $request, string $id)
    {
        $os = OrdemServico::findOrFail($id);

        $validated = $request->validate([
            'equipe_id' => 'nullable|exists:equipes,id',
            'titulo' => 'sometimes|required|string|max:255',
            'descricao' => 'nullable|string',
            'prioridade' => 'sometimes|in:baixa,media,alta,urgente',
            'status' => 'sometimes|in:aberta,em_andamento,concluida,cancelada',
            'data_prazo' => 'nullable|date',
        ]);

        if (($validated['status'] ?? null) === 'concluida' && $os->status !== 'concluida') {
            $validated['data_conclusao'] = now();
        }

        $os->update($validated);

        return response()->json($os->load(['contrato.cliente', 'equipe', 'criadoPor']));
    }

    public function destroy(string $id)
    {
        $os = OrdemServico::findOrFail($id);
        $os->delete();

        return response()->json(null, 204);
    }

    public function historico(string $id)
    {
        $os = OrdemServico::findOrFail($id);

        $atividades = Activity::where('subject_type', OrdemServico::class)
            ->where('subject_id', $os->id)
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function (Activity $atividade) {
                return [
                    'id' => $atividade->id,
                    'evento' => $atividade->event,
                    'alteracoes' => $atividade->properties,
                    'usuario' => $atividade->causer?->name,
                    'data' => $atividade->created_at,
                ];
            });

        return response()->json($atividades);
    }
}