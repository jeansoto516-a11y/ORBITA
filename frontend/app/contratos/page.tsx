"use client";

import { useEffect, useState } from "react";
import { FileText, Plus } from "lucide-react";
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
  Cliente,
  Contrato,
  listarClientes,
  listarContratos,
  criarContrato,
} from "@/lib/api";

const STATUS_LABEL: Record<Contrato["status"], string> = {
  ativo: "Ativo",
  suspenso: "Suspenso",
  encerrado: "Encerrado",
};

const STATUS_COR: Record<Contrato["status"], string> = {
  ativo: "bg-primary/10 text-primary",
  suspenso: "bg-muted text-muted-foreground",
  encerrado: "bg-destructive/10 text-destructive",
};

export default function ContratosPage() {
  const [contratos, setContratos] = useState<Contrato[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [modalAberto, setModalAberto] = useState(false);
  const [salvando, setSalvando] = useState(false);

  const [clienteId, setClienteId] = useState("");
  const [numeroContrato, setNumeroContrato] = useState("");
  const [titulo, setTitulo] = useState("");
  const [dataInicio, setDataInicio] = useState("");
  const [valorMensal, setValorMensal] = useState("");

  async function carregarDados() {
    setCarregando(true);
    setErro(null);
    try {
      const [dadosContratos, dadosClientes] = await Promise.all([
        listarContratos(),
        listarClientes(),
      ]);
      setContratos(dadosContratos);
      setClientes(dadosClientes);
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
      await criarContrato({
        cliente_id: Number(clienteId),
        numero_contrato: numeroContrato,
        titulo,
        data_inicio: dataInicio,
        valor_mensal: valorMensal || null,
      });
      setClienteId("");
      setNumeroContrato("");
      setTitulo("");
      setDataInicio("");
      setValorMensal("");
      setModalAberto(false);
      await carregarDados();
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Não foi possível salvar o contrato.");
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
              <FileText className="h-5 w-5 text-primary" />
              <h1 className="text-3xl font-semibold tracking-tight">Contratos</h1>
            </div>
            <p className="text-sm text-muted-foreground">
              Contratos firmados com os clientes da Vértice — {contratos.length} no total.
            </p>
          </div>

          <Dialog open={modalAberto} onOpenChange={setModalAberto}>
            <DialogTrigger render={<Button><Plus className="h-4 w-4" />Novo contrato</Button>} />
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Novo contrato</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSalvar} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="cliente_id">Cliente</Label>
                  <Select value={clienteId} onValueChange={setClienteId}>
                    <SelectTrigger id="cliente_id" className="w-full">
                      <SelectValue placeholder="Selecione um cliente" />
                    </SelectTrigger>
                    <SelectContent>
                      {clientes.map((cliente) => (
                        <SelectItem key={cliente.id} value={String(cliente.id)}>
                          {cliente.razao_social}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="numero_contrato">Número do contrato</Label>
                  <Input
                    id="numero_contrato"
                    value={numeroContrato}
                    onChange={(e) => setNumeroContrato(e.target.value)}
                    required
                  />
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
                  <Label htmlFor="data_inicio">Data de início</Label>
                  <Input
                    id="data_inicio"
                    type="date"
                    value={dataInicio}
                    onChange={(e) => setDataInicio(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="valor_mensal">Valor mensal (R$)</Label>
                  <Input
                    id="valor_mensal"
                    type="number"
                    step="0.01"
                    value={valorMensal}
                    onChange={(e) => setValorMensal(e.target.value)}
                  />
                </div>
                <Button
                  type="submit"
                  disabled={salvando || !clienteId}
                  className="w-full"
                >
                  {salvando ? "Salvando..." : "Salvar contrato"}
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
                <TableHead>Número</TableHead>
                <TableHead>Título</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Início</TableHead>
                <TableHead>Status</TableHead>
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

              {!carregando && contratos.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    Nenhum contrato cadastrado ainda.
                  </TableCell>
                </TableRow>
              )}

              {contratos.map((contrato) => (
                <TableRow key={contrato.id}>
                  <TableCell className="font-mono text-sm font-medium">{contrato.numero_contrato}</TableCell>
                  <TableCell>{contrato.titulo}</TableCell>
                  <TableCell>{contrato.cliente?.razao_social ?? "—"}</TableCell>
                  <TableCell>
                    {new Date(contrato.data_inicio).toLocaleDateString("pt-BR")}
                  </TableCell>
                  <TableCell>
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_COR[contrato.status]}`}>
                      {STATUS_LABEL[contrato.status]}
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