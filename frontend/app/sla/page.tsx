"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { AppShell } from "@/components/app-shell";
import { OrdemServicoComSla, listarAlertasSla } from "@/lib/api";

const SITUACAO_LABEL: Record<OrdemServicoComSla["situacao_sla"], string> = {
    atrasada: "Atrasada",
    proximo_vencimento: "Próxima do vencimento",
};

const SITUACAO_VARIANTE: Record<OrdemServicoComSla["situacao_sla"], "destructive" | "default"> = {
    atrasada: "destructive",
    proximo_vencimento: "default",
};

export default function SlaPage() {
    const [alertas, setAlertas] = useState<OrdemServicoComSla[]>([]);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState<string | null>(null);

    useEffect(() => {
    async function carregar() {
        setCarregando(true);
        setErro(null);
        try {
        const dados = await listarAlertasSla();
        setAlertas(dados);
        } catch (e) {
        setErro(e instanceof Error ? e.message : "Não foi possível carregar os alertas.");
        } finally {
        setCarregando(false);
        }
    }
    carregar();
    }, []);

    return (
        <AppShell>
      <div className="mx-auto max-w-3xl px-6 py-10">
        <div className="mb-8">
            <h1 className="text-2xl font-semibold tracking-tight">Alertas de SLA</h1>
            <p className="text-sm text-muted-foreground">
            Ordens de serviço atrasadas ou próximas do vencimento do prazo.
            </p>
        </div>

        {erro && (
            <div className="mb-4 rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {erro}
            </div>
        )}

        {carregando && <p className="text-sm text-muted-foreground">Carregando...</p>}

        {!carregando && alertas.length === 0 && (
            <p className="text-sm text-muted-foreground">
            Nenhum alerta no momento — tudo dentro do prazo.
            </p>
        )}

        <div className="space-y-3">
            {alertas.map((os) => (
            <Link
                key={os.id}
                href={`/ordens-servico/${os.id}`}
                className="block rounded-lg border p-4 hover:bg-muted/50"
            >
                <div className="mb-2 flex items-center justify-between">
                <h2 className="font-medium">{os.titulo}</h2>
                <Badge variant={SITUACAO_VARIANTE[os.situacao_sla]}>
                    {SITUACAO_LABEL[os.situacao_sla]}
                </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                {os.contrato?.numero_contrato} — {os.contrato?.cliente?.razao_social}
                </p>
                {os.data_prazo && (
                <p className="mt-1 text-xs text-muted-foreground">
                    Prazo: {new Date(os.data_prazo).toLocaleString("pt-BR")}
                </p>
                )}
            </Link>
            ))}
        </div>
        </div>
    </AppShell>
    );
}