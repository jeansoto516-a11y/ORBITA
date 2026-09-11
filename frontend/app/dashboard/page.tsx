"use client";

import { useEffect, useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { AlertTriangle, FileText, Clock, AlertCircle } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { ResumoDashboard, buscarResumoDashboard } from "@/lib/api";

const STATUS_LABEL: Record<string, string> = {
  aberta: "Abertas",
  em_andamento: "Em andamento",
  concluida: "Concluídas",
  cancelada: "Canceladas",
};

const STATUS_COR: Record<string, string> = {
  aberta: "var(--chart-1)",
  em_andamento: "var(--chart-3)",
  concluida: "var(--chart-5)",
  cancelada: "var(--chart-2)",
};

function formatarMoeda(valor: number) {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function DashboardPage() {
  const [resumo, setResumo] = useState<ResumoDashboard | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    buscarResumoDashboard()
      .then(setResumo)
      .catch((e) => setErro(e instanceof Error ? e.message : "Não foi possível carregar o dashboard."))
      .finally(() => setCarregando(false));
  }, []);

  if (carregando) {
    return (
      <AppShell>
        <div className="mx-auto max-w-6xl px-8 py-10 text-sm text-muted-foreground">Carregando...</div>
      </AppShell>
    );
  }

  if (erro || !resumo) {
    return (
      <AppShell>
        <div className="mx-auto max-w-6xl px-8 py-10">
          <div className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {erro ?? "Não foi possível carregar o dashboard."}
          </div>
        </div>
      </AppShell>
    );
  }

  const dadosDonut = Object.entries(resumo.ordens_por_status).map(([status, total]) => ({
    status,
    total,
  }));
  const totalOs = dadosDonut.reduce((soma, item) => soma + item.total, 0);

  const maiorOcorrencia = Math.max(1, ...resumo.top_clientes_ocorrencias.map((c) => c.total));

  return (
    <AppShell>
      <div className="mx-auto max-w-6xl px-8 py-10">
        <div className="mb-10">
          <h1 className="text-3xl font-semibold tracking-tight">Painel de operações</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Resumo consolidado de contratos, ordens de serviço e custos.
          </p>
        </div>

        <div className="mb-6 grid gap-4 lg:grid-cols-[1.3fr_1fr]">
          <div className="relative overflow-hidden rounded-xl border border-l-4 border-border border-l-primary bg-card p-7">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Ordens de serviço em atraso</p>
                <p className="mt-2 font-mono text-7xl font-semibold tabular-nums leading-none">
                  {resumo.os_atrasadas}
                </p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <AlertTriangle className="h-5 w-5" />
              </div>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              {resumo.os_atrasadas === 0
                ? "Nenhuma ordem de serviço fora do prazo no momento."
                : "Requerem atenção imediata da equipe responsável."}
            </p>
          </div>

          <div className="grid grid-rows-3 gap-3">
            <div className="flex items-center justify-between rounded-xl border border-border bg-card px-5 py-3.5">
              <div className="flex items-center gap-3">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Contratos ativos</span>
              </div>
              <span className="font-mono text-xl font-medium tabular-nums">{resumo.contratos_ativos}</span>
            </div>
            <div className="flex items-center justify-between rounded-xl border border-border bg-card px-5 py-3.5">
              <div className="flex items-center gap-3">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Próximas do vencimento</span>
              </div>
              <span className="font-mono text-xl font-medium tabular-nums">{resumo.os_proximas_vencimento}</span>
            </div>
            <div className="flex items-center justify-between rounded-xl border border-border bg-card px-5 py-3.5">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Ocorrências abertas</span>
              </div>
              <span className="font-mono text-xl font-medium tabular-nums">{resumo.ocorrencias_abertas}</span>
            </div>
          </div>
        </div>

        <div className="mb-6 grid gap-4 lg:grid-cols-[1fr_1.2fr]">
          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="mb-4 text-sm font-medium">Ordens de serviço por status</h2>
            {totalOs === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhuma OS cadastrada.</p>
            ) : (
              <div className="flex items-center gap-6">
                <div className="relative h-40 w-40 shrink-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={dadosDonut}
                        dataKey="total"
                        nameKey="status"
                        innerRadius={50}
                        outerRadius={72}
                        paddingAngle={2}
                        stroke="none"
                      >
                        {dadosDonut.map((item) => (
                          <Cell key={item.status} fill={STATUS_COR[item.status] ?? "var(--chart-5)"} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                    <p className="font-mono text-2xl font-semibold tabular-nums">{totalOs}</p>
                    <p className="text-[11px] text-muted-foreground">total</p>
                  </div>
                </div>
                <div className="flex-1 space-y-2">
                  {dadosDonut.map((item) => (
                    <div key={item.status} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <span
                          className="h-2 w-2 rounded-full"
                          style={{ backgroundColor: STATUS_COR[item.status] ?? "var(--chart-5)" }}
                        />
                        <span className="text-muted-foreground">
                          {STATUS_LABEL[item.status] ?? item.status}
                        </span>
                      </div>
                      <span className="font-mono font-medium tabular-nums">{item.total}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="mb-4 text-sm font-medium">Clientes com mais ocorrências</h2>
            {resumo.top_clientes_ocorrencias.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhuma ocorrência registrada ainda.</p>
            ) : (
              <div className="space-y-3">
                {resumo.top_clientes_ocorrencias.map((item) => (
                  <div key={item.cliente_id}>
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span>{item.razao_social}</span>
                      <span className="font-mono font-medium tabular-nums">{item.total}</span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{ width: `${(item.total / maiorOcorrencia) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between rounded-xl border border-border bg-card px-7 py-6">
            <div>
            <p className="text-sm text-muted-foreground">Custo total do mês corrente</p>
            <p className="mt-1 font-mono text-4xl font-semibold tabular-nums">
                {formatarMoeda(resumo.custo_total_mes)}
            </p>
            </div>
            <div className="h-12 w-12 rounded-lg bg-primary/10" />
        </div>
        </div>
    </AppShell>
    );
}