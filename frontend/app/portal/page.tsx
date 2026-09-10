"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { AppShell } from "@/components/app-shell";
import {
    Contrato,
    OrdemServico,
    Ocorrencia,
    listarPortalContratos,
    listarPortalOrdensServico,
    listarPortalOcorrencias,
} from "@/lib/api";

const STATUS_OS_LABEL: Record<OrdemServico["status"], string> = {
    aberta: "Aberta",
    em_andamento: "Em andamento",
    concluida: "Concluída",
    cancelada: "Cancelada",
};

const STATUS_OCORRENCIA_LABEL: Record<Ocorrencia["status"], string> = {
    aberta: "Aberta",
    em_analise: "Em análise",
    resolvida: "Resolvida",
    fechada: "Fechada",
};

export default function PortalPage() {
    const [contratos, setContratos] = useState<Contrato[]>([]);
    const [ordens, setOrdens] = useState<OrdemServico[]>([]);
    const [ocorrencias, setOcorrencias] = useState<Ocorrencia[]>([]);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState<string | null>(null);

    useEffect(() => {
    async function carregar() {
        setCarregando(true);
        setErro(null);
        try {
        const [dadosContratos, dadosOrdens, dadosOcorrencias] = await Promise.all([
            listarPortalContratos(),
            listarPortalOrdensServico(),
            listarPortalOcorrencias(),
        ]);
        setContratos(dadosContratos);
        setOrdens(dadosOrdens);
        setOcorrencias(dadosOcorrencias);
        } catch (e) {
        setErro(e instanceof Error ? e.message : "Não foi possível carregar seus dados.");
        } finally {
        setCarregando(false);
        }
    }
    carregar();
    }, []);

    return (
    <AppShell>
        <div className="mx-auto max-w-4xl px-6 py-10">
        <div className="mb-8">
            <h1 className="text-2xl font-semibold tracking-tight">Portal do Cliente</h1>
            <p className="text-sm text-muted-foreground">
            Acompanhe os serviços contratados com a Vértice.
            </p>
        </div>

        {erro && (
            <div className="mb-4 rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {erro}
            </div>
        )}

        {carregando && <p className="text-sm text-muted-foreground">Carregando...</p>}

        {!carregando && (
            <div className="space-y-10">
            <section>
                <h2 className="mb-3 text-sm font-medium">Seus contratos</h2>
                {contratos.length === 0 && (
                <p className="text-sm text-muted-foreground">Nenhum contrato encontrado.</p>
                )}
                <div className="space-y-2">
                {contratos.map((contrato) => (
                    <div key={contrato.id} className="rounded-lg border p-4">
                    <div className="flex items-center justify-between">
                        <p className="font-medium">
                        {contrato.numero_contrato} — {contrato.titulo}
                        </p>
                        <Badge>{contrato.status}</Badge>
                    </div>
                    </div>
                ))}
                </div>
            </section>

            <section>
                <h2 className="mb-3 text-sm font-medium">Ordens de serviço</h2>
                {ordens.length === 0 && (
                <p className="text-sm text-muted-foreground">Nenhuma ordem de serviço encontrada.</p>
                )}
                <div className="space-y-2">
                {ordens.map((os) => (
                    <div key={os.id} className="rounded-lg border p-4">
                    <div className="flex items-center justify-between">
                        <p className="font-medium">{os.titulo}</p>
                        <Badge>{STATUS_OS_LABEL[os.status]}</Badge>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Contrato {os.contrato?.numero_contrato}
                    </p>
                    </div>
                ))}
                </div>
            </section>

            <section>
                <h2 className="mb-3 text-sm font-medium">Ocorrências</h2>
                {ocorrencias.length === 0 && (
                <p className="text-sm text-muted-foreground">Nenhuma ocorrência registrada.</p>
                )}
                <div className="space-y-2">
                {ocorrencias.map((ocorrencia) => (
                    <div key={ocorrencia.id} className="rounded-lg border p-4">
                    <div className="flex items-center justify-between">
                        <p className="font-medium">{ocorrencia.titulo}</p>
                        <Badge>{STATUS_OCORRENCIA_LABEL[ocorrencia.status]}</Badge>
                    </div>
                    </div>
                ))}
                </div>
            </section>
            </div>
        )}
        </div>
    </AppShell>
    );
}