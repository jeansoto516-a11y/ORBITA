"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
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

const STATUS_COR: Record<OrdemServico["status"], string> = {
  aberta: "bg-muted text-muted-foreground",
  em_andamento: "bg-primary/10 text-primary",
  concluida: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  cancelada: "bg-destructive/10 text-destructive",
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
      <div className="mx-auto max-w-3xl px-8 py-10">
        <Link
          href="/ordens-servico"
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Voltar para ordens de serviço
        </Link>

        {carregando && <p className="text-sm text-muted-foreground">Carregando...</p>}

        {erro && (
          <div className="mb-4 rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {erro}
          </div>
        )}

        {os && (
          <>
            <div className="mb-8 rounded-xl border border-border bg-card p-7">
              <div className="mb-2 flex items-center gap-3">
                <h1 className="text-2xl font-semibold tracking-tight">{os.titulo}</h1>
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_COR[os.status]}`}>
                  {STATUS_LABEL[os.status]}
                </span>
              </div>
              <p className="font-mono text-sm text-muted-foreground">
                {os.contrato?.numero_contrato} — {os.contrato?.cliente?.razao_social}
              </p>
              {os.descricao && <p className="mt-3 text-sm">{os.descricao}</p>}

              <div className="mt-6 grid grid-cols-2 gap-4 border-t border-border pt-5 text-sm">
                <div>
                  <p className="text-muted-foreground">Equipe</p>
                  <p className="mt-0.5 font-medium">{os.equipe?.nome ?? "—"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Criado por</p>
                  <p className="mt-0.5 font-medium">{os.criadoPor?.name ?? "—"}</p>
                </div>
              </div>
            </div>

            <div>
              <h2 className="mb-3 text-sm font-medium">Histórico de alterações</h2>
              {historico.length === 0 && (
                <p className="text-sm text-muted-foreground">Nenhum evento registrado.</p>
              )}
              <div className="space-y-3">
                {historico.map((evento) => (
                  <div key={evento.id} className="rounded-xl border border-border bg-card p-4 text-sm">
                    <div className="mb-1 flex items-center justify-between">
                      <span className="font-medium">
                        {EVENTO_LABEL[evento.evento] ?? evento.evento}
                      </span>
                      <span className="font-mono text-xs text-muted-foreground">
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