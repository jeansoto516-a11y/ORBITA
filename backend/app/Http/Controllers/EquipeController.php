<?php

namespace App\Http\Controllers;

use App\Models\Equipe;
use Illuminate\Http\Request;

class EquipeController extends Controller
{
    public function index()
    {
        return Equipe::with(['supervisor', 'colaboradores'])->orderBy('nome')->paginate(15);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nome' => 'required|string|max:255',
            'descricao' => 'nullable|string',
            'supervisor_id' => 'nullable|exists:users,id',
            'ativa' => 'nullable|boolean',
            'colaboradores' => 'nullable|array',
            'colaboradores.*' => 'exists:users,id',
        ]);

        $equipe = Equipe::create([
            'nome' => $validated['nome'],
            'descricao' => $validated['descricao'] ?? null,
            'supervisor_id' => $validated['supervisor_id'] ?? null,
            'ativa' => $validated['ativa'] ?? true,
        ]);

        if (!empty($validated['colaboradores'])) {
            $equipe->colaboradores()->sync($validated['colaboradores']);
        }

        return response()->json($equipe->load(['supervisor', 'colaboradores']), 201);
    }

    public function show(string $id)
    {
        return Equipe::with(['supervisor', 'colaboradores', 'ordensServico'])->findOrFail($id);
    }

    public function update(Request $request, string $id)
    {
        $equipe = Equipe::findOrFail($id);

        $validated = $request->validate([
            'nome' => 'sometimes|required|string|max:255',
            'descricao' => 'nullable|string',
            'supervisor_id' => 'nullable|exists:users,id',
            'ativa' => 'sometimes|boolean',
            'colaboradores' => 'nullable|array',
            'colaboradores.*' => 'exists:users,id',
        ]);

        $equipe->update(collect($validated)->except('colaboradores')->toArray());

        if (isset($validated['colaboradores'])) {
            $equipe->colaboradores()->sync($validated['colaboradores']);
        }

        return response()->json($equipe->load(['supervisor', 'colaboradores']));
    }

    public function destroy(string $id)
    {
        $equipe = Equipe::findOrFail($id);
        $equipe->delete();

        return response()->json(null, 204);
    }
}