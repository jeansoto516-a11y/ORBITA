"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { ResumoDashboard, buscarResumoDashboard } from "@/lib/api";

const STATUS_LABEL: Record<string, string> = {
    aberta: "Abertas",
    em_andamento: "Em andamento",
    concluida: "Concluídas",
    cancelada: "Canceladas",
};

function formatarMoeda(valor: number) {
    return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function Cartao({ titulo, valor, destaque }: { titulo: string; valor: string | number; destaque?: boolean }) {
    return (
    <div className="rounded-lg border p-4">
        <p className="text-sm text-muted-foreground">{titulo}</p>
        <p className={`mt-1 text-2xl font-semibold ${destaque ? "text-destructive" : ""}`}>{valor}</p>
    </div>
    );
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

    return (
    <AppShell>
        <div className="mx-auto max-w-5xl px-6 py-10">
        <div className="mb-8">
            <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
            <p className="text-sm text-muted-foreground">Visão consolidada da operação.</p>
        </div>

        {erro && (
            <div className="mb-4 rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {erro}
            </div>
        )}

        {carregando && <p className="text-sm text-muted-foreground">Carregando...</p>}

        {resumo && (
            <>
            <div className="mb-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <Cartao titulo="Contratos ativos" valor={resumo.contratos_ativos} />
                <Cartao
                titulo="OS atrasadas"
                valor={resumo.os_atrasadas}
                destaque={resumo.os_atrasadas > 0}
                />
                <Cartao titulo="OS próximas do vencimento" valor={resumo.os_proximas_vencimento} />
                <Cartao titulo="Ocorrências abertas" valor={resumo.ocorrencias_abertas} />
            </div>

            <div className="mb-8 grid gap-6 lg:grid-cols-2">
                <div className="rounded-lg border p-4">
                <h2 className="mb-3 text-sm font-medium">Ordens de serviço por status</h2>
                <div className="space-y-2">
                    {Object.entries(resumo.ordens_por_status).map(([status, total]) => (
                    <div key={status} className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">{STATUS_LABEL[status] ?? status}</span>
                        <span className="font-medium">{total}</span>
                    </div>
                    ))}
                    {Object.keys(resumo.ordens_por_status).length === 0 && (
                    <p className="text-sm text-muted-foreground">Nenhuma OS cadastrada.</p>
                    )}
                </div>
                </div>

                <div className="rounded-lg border p-4">
                <h2 className="mb-3 text-sm font-medium">Custo total do mês</h2>
                <p className="text-2xl font-semibold">{formatarMoeda(resumo.custo_total_mes)}</p>
                </div>
            </div>

            <div className="rounded-lg border p-4">
                <h2 className="mb-3 text-sm font-medium">Clientes com mais ocorrências</h2>
                {resumo.top_clientes_ocorrencias.length === 0 && (
                <p className="text-sm text-muted-foreground">Nenhuma ocorrência registrada ainda.</p>
                )}
                <div className="space-y-2">
                {resumo.top_clientes_ocorrencias.map((item) => (
                    <div key={item.cliente_id} className="flex items-center justify-between text-sm">
                    <span>{item.razao_social}</span>
                    <span className="font-medium">{item.total}</span>
                    </div>
                ))}
                </div>
            </div>
            </>
        )}
        </div>
    </AppShell>
    );
}