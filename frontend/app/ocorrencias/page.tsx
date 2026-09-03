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

const GRAVIDADE_LABEL: Record<Ocorrencia["gravidade"], string> = {
    baixa: "Baixa",
    media: "Média",
    alta: "Alta",
    critica: "Crítica",
};

const GRAVIDADE_VARIANTE: Record<Ocorrencia["gravidade"], "default" | "secondary" | "destructive"> = {
    baixa: "secondary",
    media: "default",
    alta: "default",
    critica: "destructive",
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
    <RotaProtegida>
        <div className="mx-auto max-w-5xl px-6 py-10">
        <div className="mb-8 flex items-center justify-between">
            <div>
            <h1 className="text-2xl font-semibold tracking-tight">Ocorrências</h1>
            <p className="text-sm text-muted-foreground">
                Problemas encontrados durante a execução dos serviços.
            </p>
            </div>

            <Dialog open={modalAberto} onOpenChange={setModalAberto}>
            <DialogTrigger render={<Button>Nova ocorrência</Button>} />
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

        <div className="rounded-lg border">
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
                    <TableCell>{ocorrencia.contrato?.numero_contrato ?? "—"}</TableCell>
                    <TableCell>
                    <Badge variant={GRAVIDADE_VARIANTE[ocorrencia.gravidade]}>
                        {GRAVIDADE_LABEL[ocorrencia.gravidade]}
                    </Badge>
                    </TableCell>
                    <TableCell>{STATUS_LABEL[ocorrencia.status]}</TableCell>
                </TableRow>
                ))}
            </TableBody>
            </Table>
        </div>
        </div>
    </RotaProtegida>
    );
}