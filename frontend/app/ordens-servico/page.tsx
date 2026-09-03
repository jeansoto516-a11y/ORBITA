"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { RotaProtegida } from "@/components/rota-protegida";
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
    Equipe,
    OrdemServico,
    listarContratos,
    listarEquipes,
    listarOrdensServico,
    criarOrdemServico,
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

export default function OrdensServicoPage() {
    const [ordens, setOrdens] = useState<OrdemServico[]>([]);
    const [contratos, setContratos] = useState<Contrato[]>([]);
    const [equipes, setEquipes] = useState<Equipe[]>([]);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState<string | null>(null);
    const [modalAberto, setModalAberto] = useState(false);
    const [salvando, setSalvando] = useState(false);

    const [contratoId, setContratoId] = useState("");
    const [equipeId, setEquipeId] = useState("");
    const [titulo, setTitulo] = useState("");
    const [descricao, setDescricao] = useState("");
    const [prioridade, setPrioridade] = useState<OrdemServico["prioridade"]>("media");

    async function carregarDados() {
    setCarregando(true);
    setErro(null);
    try {
        const [dadosOrdens, dadosContratos, dadosEquipes] = await Promise.all([
        listarOrdensServico(),
        listarContratos(),
        listarEquipes(),
        ]);
        setOrdens(dadosOrdens);
        setContratos(dadosContratos);
        setEquipes(dadosEquipes);
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
        await criarOrdemServico({
        contrato_id: Number(contratoId),
        equipe_id: equipeId ? Number(equipeId) : null,
        titulo,
        descricao: descricao || null,
        prioridade,
        });
        setContratoId("");
        setEquipeId("");
        setTitulo("");
        setDescricao("");
        setPrioridade("media");
        setModalAberto(false);
        await carregarDados();
    } catch (e) {
        setErro(e instanceof Error ? e.message : "Não foi possível salvar a ordem de serviço.");
    } finally {
        setSalvando(false);
    }
    }

    return (
    <RotaProtegida>
    <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="mb-8 flex items-center justify-between">
        <div>
            <h1 className="text-2xl font-semibold tracking-tight">Ordens de Serviço</h1>
            <p className="text-sm text-muted-foreground">
            Acompanhamento das ordens de serviço em execução.
            </p>
        </div>

        <Dialog open={modalAberto} onOpenChange={setModalAberto}>
            <DialogTrigger render={<Button>Nova OS</Button>} />
            <DialogContent>
            <DialogHeader>
                <DialogTitle>Nova ordem de serviço</DialogTitle>
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
                <Label htmlFor="equipe_id">Equipe (opcional)</Label>
                <Select value={equipeId} onValueChange={setEquipeId}>
                    <SelectTrigger id="equipe_id" className="w-full">
                    <SelectValue placeholder="Selecione uma equipe" />
                    </SelectTrigger>
                    <SelectContent>
                    {equipes.map((equipe) => (
                        <SelectItem key={equipe.id} value={String(equipe.id)}>
                        {equipe.nome}
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
                />
                </div>
                <div className="space-y-2">
                <Label htmlFor="prioridade">Prioridade</Label>
                <Select
                    value={prioridade}
                    onValueChange={(v) => setPrioridade(v as OrdemServico["prioridade"])}
                >
                    <SelectTrigger id="prioridade" className="w-full">
                    <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                    <SelectItem value="baixa">Baixa</SelectItem>
                    <SelectItem value="media">Média</SelectItem>
                    <SelectItem value="alta">Alta</SelectItem>
                    <SelectItem value="urgente">Urgente</SelectItem>
                    </SelectContent>
                </Select>
                </div>
                <Button type="submit" disabled={salvando || !contratoId} className="w-full">
                {salvando ? "Salvando..." : "Salvar OS"}
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

        <div className="rounded-lg border">
        <Table>
            <TableHeader>
            <TableRow>
                <TableHead>Título</TableHead>
                <TableHead>Contrato</TableHead>
                <TableHead>Equipe</TableHead>
                <TableHead>Prioridade</TableHead>
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

            {!carregando && ordens.length === 0 && (
                <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                    Nenhuma ordem de serviço cadastrada ainda.
                </TableCell>
                </TableRow>
            )}

            {ordens.map((os) => (
                <TableRow key={os.id}>
                <TableCell className="font-medium">{os.titulo}</TableCell>
                <TableCell>{os.contrato?.numero_contrato ?? "—"}</TableCell>
                <TableCell>{os.equipe?.nome ?? "—"}</TableCell>
                <TableCell>
                    <Badge variant={PRIORIDADE_VARIANTE[os.prioridade]}>
                    {PRIORIDADE_LABEL[os.prioridade]}
                    </Badge>
                </TableCell>
                <TableCell>{STATUS_LABEL[os.status]}</TableCell>
                </TableRow>
            ))}
            </TableBody>
        </Table>
            </div>
    </div>
    </RotaProtegida>
    );
}