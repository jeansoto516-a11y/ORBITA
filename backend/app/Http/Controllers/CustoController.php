<?php

namespace App\Http\Controllers;

use App\Models\Contrato;
use App\Models\Custo;
use Illuminate\Http\Request;

class CustoController extends Controller
{
    public function index(Request $request)
    {
        $query = Custo::with(['contrato.cliente', 'ordemServico', 'registradoPor'])
            ->orderBy('data', 'desc');

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
            'descricao' => 'required|string|max:255',
            'valor' => 'required|numeric|min:0',
            'tipo' => 'nullable|in:mao_de_obra,material,terceiros,outros',
            'data' => 'required|date',
        ]);

        $custo = Custo::create([
            ...$validated,
            'registrado_por' => $request->user()->id,
        ]);

        return response()->json($custo->load(['contrato.cliente', 'ordemServico']), 201);
    }

    public function show(string $id)
    {
        return Custo::with(['contrato.cliente', 'ordemServico', 'registradoPor'])->findOrFail($id);
    }

    public function update(Request $request, string $id)
    {
        $custo = Custo::findOrFail($id);

        $validated = $request->validate([
            'descricao' => 'sometimes|required|string|max:255',
            'valor' => 'sometimes|required|numeric|min:0',
            'tipo' => 'sometimes|in:mao_de_obra,material,terceiros,outros',
            'data' => 'sometimes|required|date',
        ]);

        $custo->update($validated);

        return response()->json($custo->load(['contrato.cliente', 'ordemServico']));
    }

    public function destroy(string $id)
    {
        $custo = Custo::findOrFail($id);
        $custo->delete();

        return response()->json(null, 204);
    }

    public function resumoPorContrato()
    {
        $resumo = Contrato::withSum('custos', 'valor')
            ->with('cliente')
            ->having('custos_sum_valor', '>', 0)
            ->get()
            ->map(function (Contrato $contrato) {
                return [
                    'contrato_id' => $contrato->id,
                    'numero_contrato' => $contrato->numero_contrato,
                    'titulo' => $contrato->titulo,
                    'cliente' => $contrato->cliente?->razao_social,
                    'total_custos' => $contrato->custos_sum_valor,
                ];
            });

        return response()->json($resumo);
    }
}