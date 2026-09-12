"use client";

import { useEffect, useState } from "react";
import { Activity } from "lucide-react";
import { AppShell } from "@/components/app-shell";
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

const PRIORIDADE_LABEL: Record<OrdemServico["prioridade"], string> = {
  baixa: "Baixa",
  media: "Média",
  alta: "Alta",
  urgente: "Urgente",
};

const PRIORIDADE_COR: Record<OrdemServico["prioridade"], string> = {
  baixa: "bg-muted text-muted-foreground",
  media: "bg-secondary text-secondary-foreground",
  alta: "bg-primary/10 text-primary",
  urgente: "bg-destructive/10 text-destructive",
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
    <AppShell>
      <div className="mx-auto max-w-3xl px-8 py-10">
        <div className="mb-10">
          <div className="mb-1 flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            <h1 className="text-3xl font-semibold tracking-tight">Minhas Atividades</h1>
          </div>
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
            <div key={os.id} className="rounded-xl border border-border bg-card p-5">
              <div className="mb-2 flex items-center justify-between">
                <h2 className="font-medium">{os.titulo}</h2>
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${PRIORIDADE_COR[os.prioridade]}`}>
                  {PRIORIDADE_LABEL[os.prioridade]}
                </span>
              </div>
              <p className="mb-3 font-mono text-sm text-muted-foreground">
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
    </AppShell>
  );
}