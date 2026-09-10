<?php

namespace App\Http\Controllers;

use App\Models\Contrato;
use App\Models\Custo;
use App\Models\Ocorrencia;
use App\Models\OrdemServico;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function resumo()
    {
        $contratosAtivos = Contrato::where('status', 'ativo')->count();

        $ordensPorStatus = OrdemServico::selectRaw('status, count(*) as total')
            ->groupBy('status')
            ->pluck('total', 'status');

        $ocorrenciasAbertas = Ocorrencia::whereIn('status', ['aberta', 'em_analise'])->count();

        $agora = now();
        $limiteProximo = $agora->copy()->addHours(24);

        $osComPrazo = OrdemServico::whereNotNull('data_prazo')
            ->whereNotIn('status', ['concluida', 'cancelada'])
            ->get();

        $osAtrasadas = $osComPrazo->filter(fn (OrdemServico $os) => $os->data_prazo->lt($agora))->count();
        $osProximasVencimento = $osComPrazo
            ->filter(fn (OrdemServico $os) => $os->data_prazo->gte($agora) && $os->data_prazo->lte($limiteProximo))
            ->count();

        $custoTotalMes = Custo::whereMonth('data', $agora->month)
            ->whereYear('data', $agora->year)
            ->sum('valor');

        $topClientesPorOcorrencias = Ocorrencia::selectRaw('contratos.cliente_id, clientes.razao_social, count(ocorrencias.id) as total')
            ->join('contratos', 'contratos.id', '=', 'ocorrencias.contrato_id')
            ->join('clientes', 'clientes.id', '=', 'contratos.cliente_id')
            ->groupBy('contratos.cliente_id', 'clientes.razao_social')
            ->orderByDesc('total')
            ->limit(5)
            ->get();

        return response()->json([
            'contratos_ativos' => $contratosAtivos,
            'ordens_por_status' => $ordensPorStatus,
            'ocorrencias_abertas' => $ocorrenciasAbertas,
            'os_atrasadas' => $osAtrasadas,
            'os_proximas_vencimento' => $osProximasVencimento,
            'custo_total_mes' => $custoTotalMes,
            'top_clientes_ocorrencias' => $topClientesPorOcorrencias,
        ]);
    }
}