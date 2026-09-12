"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AppShell } from "@/components/app-shell";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Contrato,
  Ocorrencia,
  listarContratos,
  listarOcorrencias,
  criarOcorrencia,
} from "@/lib/api";

const STATUS_LABEL: Record<Ocorrencia["status"], string> = {
  aberta: "Aberta",
  em_analise: "Em análise",
  resolvida: "Resolvida",
  fechada: "Fechada",
};

const STATUS_COR: Record<Ocorrencia["status"], string> = {
  aberta: "bg-destructive/10 text-destructive",
  em_analise: "bg-primary/10 text-primary",
  resolvida: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  fechada: "bg-muted text-muted-foreground",
};

const GRAVIDADE_LABEL: Record<Ocorrencia["gravidade"], string> = {
  baixa: "Baixa",
  media: "Média",
  alta: "Alta",
  critica: "Crítica",
};

const GRAVIDADE_COR: Record<Ocorrencia["gravidade"], string> = {
  baixa: "bg-muted text-muted-foreground",
  media: "bg-secondary text-secondary-foreground",
  alta: "bg-primary/10 text-primary",
  critica: "bg-destructive/10 text-destructive",
};

export default function OcorrenciasPage() {
  const [ocorrencias, setOcorrencias] = useState<Ocorrencia[]>([]);
  const [contratos, setContratos] = useState<Contrato[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [modalAberto, setModalAberto] = useState(false);
  const [salvando, setSalvando] = useState(false);

  const [contratoId, setContratoId] = useState("");
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [gravidade, setGravidade] = useState<Ocorrencia["gravidade"]>("media");

  async function carregarDados() {
    setCarregando(true);
    setErro(null);
    try {
      const [dadosOcorrencias, dadosContratos] = await Promise.all([
        listarOcorrencias(),
        listarContratos(),
      ]);
      setOcorrencias(dadosOcorrencias);
      setContratos(dadosContratos);
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Não foi possível carregar os dados.");
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregarDados();
  }, []);

  async function handleSalvar(e: React.FormEvent) {
    e.preventDefault();
    setSalvando(true);
    setErro(null);
    try {
      await criarOcorrencia({
        contrato_id: Number(contratoId),
        titulo,
        descricao,
        gravidade,
      });
      setContratoId("");
      setTitulo("");
      setDescricao("");
      setGravidade("media");
      setModalAberto(false);
      await carregarDados();
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Não foi possível salvar a ocorrência.");
    } finally {
      setSalvando(false);
    }
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-6xl px-8 py-10">
        <div className="mb-10 flex items-start justify-between">
          <div>
            <div className="mb-1 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-primary" />
              <h1 className="text-3xl font-semibold tracking-tight">Ocorrências</h1>
            </div>
            <p className="text-sm text-muted-foreground">
              Problemas encontrados durante a execução dos serviços — {ocorrencias.length} registradas.
            </p>
          </div>

          <Dialog open={modalAberto} onOpenChange={setModalAberto}>
            <DialogTrigger render={<Button><Plus className="h-4 w-4" />Nova ocorrência</Button>} />
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Nova ocorrência</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSalvar} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="contrato_id">Contrato</Label>
                  <Select value={contratoId} onValueChange={setContratoId}>
                    <SelectTrigger id="contrato_id" className="w-full">
                      <SelectValue placeholder="Selecione um contrato" />
                    </SelectTrigger>
                    <SelectContent>
                      {contratos.map((contrato) => (
                        <SelectItem key={contrato.id} value={String(contrato.id)}>
                          {contrato.numero_contrato} — {contrato.titulo}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="titulo">Título</Label>
                  <Input
                    id="titulo"
                    value={titulo}
                    onChange={(e) => setTitulo(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="descricao">Descrição</Label>
                  <Textarea
                    id="descricao"
                    value={descricao}
                    onChange={(e) => setDescricao(e.target.value)}
                    rows={3}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gravidade">Gravidade</Label>
                  <Select
                    value={gravidade}
                    onValueChange={(v) => setGravidade(v as Ocorrencia["gravidade"])}
                  >
                    <SelectTrigger id="gravidade" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="baixa">Baixa</SelectItem>
                      <SelectItem value="media">Média</SelectItem>
                      <SelectItem value="alta">Alta</SelectItem>
                      <SelectItem value="critica">Crítica</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button type="submit" disabled={salvando || !contratoId} className="w-full">
                  {salvando ? "Salvando..." : "Salvar ocorrência"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {erro && (
          <div className="mb-4 rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {erro}
          </div>
        )}

        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Título</TableHead>
                <TableHead>Contrato</TableHead>
                <TableHead>Gravidade</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {carregando && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground">
                    Carregando...
                  </TableCell>
                </TableRow>
              )}

              {!carregando && ocorrencias.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground">
                    Nenhuma ocorrência registrada ainda.
                  </TableCell>
                </TableRow>
              )}

              {ocorrencias.map((ocorrencia) => (
                <TableRow key={ocorrencia.id}>
                  <TableCell className="font-medium">{ocorrencia.titulo}</TableCell>
                  <TableCell className="font-mono text-sm">{ocorrencia.contrato?.numero_contrato ?? "—"}</TableCell>
                  <TableCell>
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${GRAVIDADE_COR[ocorrencia.gravidade]}`}>
                      {GRAVIDADE_LABEL[ocorrencia.gravidade]}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_COR[ocorrencia.status]}`}>
                      {STATUS_LABEL[ocorrencia.status]}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </AppShell>
  );
}