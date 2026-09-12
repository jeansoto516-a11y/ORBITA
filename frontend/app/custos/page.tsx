"use client";

import { useEffect, useState } from "react";
import { Wallet, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  Custo,
  ResumoCustoContrato,
  listarContratos,
  listarCustos,
  criarCusto,
  listarResumoCustos,
} from "@/lib/api";

const TIPO_LABEL: Record<Custo["tipo"], string> = {
  mao_de_obra: "Mão de obra",
  material: "Material",
  terceiros: "Terceiros",
  outros: "Outros",
};

function formatarMoeda(valor: string | number) {
  return Number(valor).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function CustosPage() {
  const [custos, setCustos] = useState<Custo[]>([]);
  const [resumo, setResumo] = useState<ResumoCustoContrato[]>([]);
  const [contratos, setContratos] = useState<Contrato[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [modalAberto, setModalAberto] = useState(false);
  const [salvando, setSalvando] = useState(false);

  const [contratoId, setContratoId] = useState("");
  const [descricao, setDescricao] = useState("");
  const [valor, setValor] = useState("");
  const [tipo, setTipo] = useState<Custo["tipo"]>("outros");
  const [data, setData] = useState("");

  async function carregarDados() {
    setCarregando(true);
    setErro(null);
    try {
      const [dadosCustos, dadosResumo, dadosContratos] = await Promise.all([
        listarCustos(),
        listarResumoCustos(),
        listarContratos(),
      ]);
      setCustos(dadosCustos);
      setResumo(dadosResumo);
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
      await criarCusto({
        contrato_id: Number(contratoId),
        descricao,
        valor: Number(valor),
        tipo,
        data,
      });
      setContratoId("");
      setDescricao("");
      setValor("");
      setTipo("outros");
      setData("");
      setModalAberto(false);
      await carregarDados();
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Não foi possível salvar o custo.");
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
              <Wallet className="h-5 w-5 text-primary" />
              <h1 className="text-3xl font-semibold tracking-tight">Custos</h1>
            </div>
            <p className="text-sm text-muted-foreground">
              Acompanhamento financeiro dos contratos.
            </p>
          </div>

          <Dialog open={modalAberto} onOpenChange={setModalAberto}>
            <DialogTrigger render={<Button><Plus className="h-4 w-4" />Novo custo</Button>} />
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Novo custo</DialogTitle>
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
                  <Label htmlFor="descricao">Descrição</Label>
                  <Input
                    id="descricao"
                    value={descricao}
                    onChange={(e) => setDescricao(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="valor">Valor (R$)</Label>
                  <Input
                    id="valor"
                    type="number"
                    step="0.01"
                    value={valor}
                    onChange={(e) => setValor(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tipo">Tipo</Label>
                  <Select value={tipo} onValueChange={(v) => setTipo(v as Custo["tipo"])}>
                    <SelectTrigger id="tipo" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mao_de_obra">Mão de obra</SelectItem>
                      <SelectItem value="material">Material</SelectItem>
                      <SelectItem value="terceiros">Terceiros</SelectItem>
                      <SelectItem value="outros">Outros</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="data">Data</Label>
                  <Input
                    id="data"
                    type="date"
                    value={data}
                    onChange={(e) => setData(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" disabled={salvando || !contratoId} className="w-full">
                  {salvando ? "Salvando..." : "Salvar custo"}
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

        {resumo.length > 0 && (
          <div className="mb-8">
            <h2 className="mb-3 text-sm font-medium">Total por contrato</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {resumo.map((item) => (
                <div key={item.contrato_id} className="rounded-xl border border-border bg-card p-5">
                  <p className="font-mono text-sm font-medium">{item.numero_contrato}</p>
                  <p className="text-xs text-muted-foreground">{item.titulo} — {item.cliente}</p>
                  <p className="mt-2 font-mono text-2xl font-semibold tabular-nums">
                    {formatarMoeda(item.total_custos)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Descrição</TableHead>
                <TableHead>Contrato</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Data</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {carregando && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    Carregando...
                  </TableCell>
                </TableRow>
              )}

              {!carregando && custos.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    Nenhum custo registrado ainda.
                  </TableCell>
                </TableRow>
              )}

              {custos.map((custo) => (
                <TableRow key={custo.id}>
                  <TableCell className="font-medium">{custo.descricao}</TableCell>
                  <TableCell className="font-mono text-sm">{custo.contrato?.numero_contrato ?? "—"}</TableCell>
                  <TableCell>{TIPO_LABEL[custo.tipo]}</TableCell>
                  <TableCell className="font-mono tabular-nums">{formatarMoeda(custo.valor)}</TableCell>
                  <TableCell>{new Date(custo.data).toLocaleDateString("pt-BR")}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </AppShell>
  );
}