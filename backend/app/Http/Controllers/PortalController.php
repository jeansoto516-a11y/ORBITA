<?php

namespace App\Http\Controllers;

use App\Models\Contrato;
use App\Models\Ocorrencia;
use App\Models\OrdemServico;
use Illuminate\Http\Request;

class PortalController extends Controller
{
    public function contratos(Request $request)
    {
        $clienteId = $request->user()->cliente_id;

        abort_if(!$clienteId, 403, 'Usuário não vinculado a nenhum cliente.');

        return Contrato::where('cliente_id', $clienteId)
            ->orderBy('created_at', 'desc')
            ->get();
    }

    public function ordensServico(Request $request)
    {
        $clienteId = $request->user()->cliente_id;

        abort_if(!$clienteId, 403, 'Usuário não vinculado a nenhum cliente.');

        return OrdemServico::with(['contrato', 'equipe'])
            ->whereHas('contrato', fn ($q) => $q->where('cliente_id', $clienteId))
            ->orderBy('created_at', 'desc')
            ->get();
    }

    public function ocorrencias(Request $request)
    {
        $clienteId = $request->user()->cliente_id;

        abort_if(!$clienteId, 403, 'Usuário não vinculado a nenhum cliente.');

        return Ocorrencia::with(['contrato', 'ordemServico'])
            ->whereHas('contrato', fn ($q) => $q->where('cliente_id', $clienteId))
            ->orderBy('created_at', 'desc')
            ->get();
    }
}