<?php

namespace App\Http\Controllers;

use App\Models\Cliente;
use Illuminate\Http\Request;

class ClienteController extends Controller
{
    public function index()
    {
        return Cliente::orderBy('razao_social')->paginate(15);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'razao_social' => 'required|string|max:255',
            'nome_fantasia' => 'nullable|string|max:255',
            'cnpj' => 'required|string|unique:clientes,cnpj',
            'email' => 'nullable|email|max:255',
            'telefone' => 'nullable|string|max:20',
            'endereco' => 'nullable|string',
        ]);

        $cliente = Cliente::create($validated);

        return response()->json($cliente, 201);
    }

    public function show(string $id)
    {
        return Cliente::with('contratos')->findOrFail($id);
    }

    public function update(Request $request, string $id)
    {
        $cliente = Cliente::findOrFail($id);

        $validated = $request->validate([
            'razao_social' => 'sometimes|required|string|max:255',
            'nome_fantasia' => 'nullable|string|max:255',
            'cnpj' => 'sometimes|required|string|unique:clientes,cnpj,' . $cliente->id,
            'email' => 'nullable|email|max:255',
            'telefone' => 'nullable|string|max:20',
            'endereco' => 'nullable|string',
            'ativo' => 'sometimes|boolean',
        ]);

        $cliente->update($validated);

        return response()->json($cliente);
    }

    public function destroy(string $id)
    {
        $cliente = Cliente::findOrFail($id);
        $cliente->delete();

        return response()->json(null, 204);
    }
}