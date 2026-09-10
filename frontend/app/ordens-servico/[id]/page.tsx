"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { AppShell } from "@/components/app-shell";
import {
    OrdemServico,
    HistoricoEvento,
    buscarOrdemServico,
    historicoOrdemServico,
} from "@/lib/api";

const STATUS_LABEL: Record<OrdemServico["status"], string> = {
    aberta: "Aberta",
    em_andamento: "Em andamento",
    concluida: "Concluída",
    cancelada: "Cancelada",
};

const EVENTO_LABEL: Record<string, string> = {
    created: "Ordem de serviço criada",
    updated: "Ordem de serviço atualizada",
    deleted: "Ordem de serviço removida",
};

const CAMPO_LABEL: Record<string, string> = {
    titulo: "Título",
    status: "Status",
    prioridade: "Prioridade",
    equipe_id: "Equipe",
    data_prazo: "Prazo",
    data_conclusao: "Data de conclusão",
};

export default function DetalhesOrdemServicoPage() {
    const params = useParams();
    const id = Number(params.id);

    const [os, setOs] = useState<OrdemServico | null>(null);
    const [historico, setHistorico] = useState<HistoricoEvento[]>([]);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState<string | null>(null);

    useEffect(() => {
    async function carregar() {
        setCarregando(true);
        setErro(null);
        try {
        const [dadosOs, dadosHistorico] = await Promise.all([
            buscarOrdemServico(id),
            historicoOrdemServico(id),
        ]);
        setOs(dadosOs);
        setHistorico(dadosHistorico);
        } catch (e) {
        setErro(e instanceof Error ? e.message : "Não foi possível carregar a ordem de serviço.");
        } finally {
        setCarregando(false);
        }
    }

    if (id) carregar();
    }, [id]);

    return (
        <AppShell>
        <div className="mx-auto max-w-3xl px-6 py-10">
        <Link
            href="/ordens-servico"
            className="mb-6 inline-block text-sm text-muted-foreground hover:text-foreground"
        >
            ← Voltar para ordens de serviço
        </Link>

        {carregando && <p className="text-sm text-muted-foreground">Carregando...</p>}

        {erro && (
            <div className="mb-4 rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {erro}
            </div>
        )}

        {os && (
            <>
            <div className="mb-8">
                <div className="mb-2 flex items-center gap-3">
                <h1 className="text-2xl font-semibold tracking-tight">{os.titulo}</h1>
                <Badge>{STATUS_LABEL[os.status]}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                Contrato {os.contrato?.numero_contrato} — {os.contrato?.cliente?.razao_social}
                </p>
                {os.descricao && <p className="mt-3 text-sm">{os.descricao}</p>}
            </div>

            <div className="mb-8 rounded-lg border p-4">
                <h2 className="mb-3 text-sm font-medium">Detalhes</h2>
                <dl className="grid grid-cols-2 gap-3 text-sm">
                <div>
                    <dt className="text-muted-foreground">Equipe</dt>
                    <dd>{os.equipe?.nome ?? "—"}</dd>
                </div>
                <div>
                    <dt className="text-muted-foreground">Criado por</dt>
                    <dd>{os.criadoPor?.name ?? "—"}</dd>
                </div>
                </dl>
            </div>

            <div>
                <h2 className="mb-3 text-sm font-medium">Histórico de alterações</h2>
                {historico.length === 0 && (
                <p className="text-sm text-muted-foreground">Nenhum evento registrado.</p>
                )}
                <div className="space-y-3">
                {historico.map((evento) => (
                    <div key={evento.id} className="rounded-lg border p-3 text-sm">
                    <div className="mb-1 flex items-center justify-between">
                        <span className="font-medium">
                        {EVENTO_LABEL[evento.evento] ?? evento.evento}
                        </span>
                        <span className="text-xs text-muted-foreground">
                        {new Date(evento.data).toLocaleString("pt-BR")}
                        </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                        Por: {evento.usuario ?? "Sistema"}
                    </p>
                    {evento.alteracoes?.attributes && (
                        <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
                        {Object.entries(evento.alteracoes.attributes).map(([campo, valor]) => (
                            <li key={campo}>
                            {CAMPO_LABEL[campo] ?? campo}:{" "}
                            <span className="font-medium text-foreground">{String(valor)}</span>
                            </li>
                        ))}
                        </ul>
                    )}
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