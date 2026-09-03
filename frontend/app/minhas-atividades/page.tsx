"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RotaProtegida } from "@/components/rota-protegida";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    OrdemServico,
    listarMinhasOrdensServico,
    atualizarStatusOrdemServico,
} from "@/lib/api";

const STATUS_LABEL: Record<OrdemServico["status"], string> = {
    aberta: "Aberta",
    em_andamento: "Em andamento",
    concluida: "Concluída",
    cancelada: "Cancelada",
};

const PRIORIDADE_LABEL: Record<OrdemServico["prioridade"], string> = {
    baixa: "Baixa",
    media: "Média",
    alta: "Alta",
    urgente: "Urgente",
};

const PRIORIDADE_VARIANTE: Record<OrdemServico["prioridade"], "default" | "secondary" | "destructive"> = {
    baixa: "secondary",
    media: "default",
    alta: "default",
    urgente: "destructive",
};

export default function MinhasAtividadesPage() {
    const [ordens, setOrdens] = useState<OrdemServico[]>([]);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState<string | null>(null);
    const [atualizandoId, setAtualizandoId] = useState<number | null>(null);

    async function carregar() {
    setCarregando(true);
    setErro(null);
    try {
        const dados = await listarMinhasOrdensServico();
        setOrdens(dados);
    } catch (e) {
        setErro(e instanceof Error ? e.message : "Não foi possível carregar suas atividades.");
    } finally {
        setCarregando(false);
    }
    }

    useEffect(() => {
    carregar();
    }, []);

    async function handleMudarStatus(id: number, novoStatus: OrdemServico["status"]) {
    setAtualizandoId(id);
    setErro(null);
    try {
        await atualizarStatusOrdemServico(id, novoStatus);
        await carregar();
    } catch (e) {
        setErro(e instanceof Error ? e.message : "Não foi possível atualizar o status.");
    } finally {
        setAtualizandoId(null);
    }
    }

    return (
    <RotaProtegida>
        <div className="mx-auto max-w-3xl px-6 py-10">
        <div className="mb-8">
            <h1 className="text-2xl font-semibold tracking-tight">Minhas Atividades</h1>
            <p className="text-sm text-muted-foreground">
            Ordens de serviço das equipes das quais você faz parte.
            </p>
        </div>

        {erro && (
            <div className="mb-4 rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {erro}
            </div>
        )}

        {carregando && <p className="text-sm text-muted-foreground">Carregando...</p>}

        {!carregando && ordens.length === 0 && (
            <p className="text-sm text-muted-foreground">
            Nenhuma atividade atribuída no momento.
            </p>
        )}

        <div className="space-y-3">
            {ordens.map((os) => (
            <div key={os.id} className="rounded-lg border p-4">
                <div className="mb-2 flex items-center justify-between">
                <h2 className="font-medium">{os.titulo}</h2>
                <Badge variant={PRIORIDADE_VARIANTE[os.prioridade]}>
                    {PRIORIDADE_LABEL[os.prioridade]}
                </Badge>
                </div>
                <p className="mb-3 text-sm text-muted-foreground">
                {os.contrato?.numero_contrato} — {os.contrato?.cliente?.razao_social}
                </p>
                {os.descricao && <p className="mb-3 text-sm">{os.descricao}</p>}

                <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground">Status:</span>
                <Select
                    value={os.status}
                    onValueChange={(v) =>
                    handleMudarStatus(os.id, v as OrdemServico["status"])
                    }
                    disabled={atualizandoId === os.id}
                >
                    <SelectTrigger className="w-48">
                    <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                    <SelectItem value="aberta">Aberta</SelectItem>
                    <SelectItem value="em_andamento">Em andamento</SelectItem>
                    <SelectItem value="concluida">Concluída</SelectItem>
                    <SelectItem value="cancelada">Cancelada</SelectItem>
                    </SelectContent>
                </Select>
                </div>
            </div>
            ))}
        </div>
        </div>
    </RotaProtegida>
    );
}