"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
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
    Equipe,
    UsuarioResumo,
    listarEquipes,
    listarUsuarios,
    criarEquipe,
} from "@/lib/api";

export default function EquipesPage() {
    const [equipes, setEquipes] = useState<Equipe[]>([]);
    const [usuarios, setUsuarios] = useState<UsuarioResumo[]>([]);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState<string | null>(null);
    const [modalAberto, setModalAberto] = useState(false);
    const [salvando, setSalvando] = useState(false);

    const [nome, setNome] = useState("");
    const [descricao, setDescricao] = useState("");
    const [supervisorId, setSupervisorId] = useState("");
    const [colaboradoresSelecionados, setColaboradoresSelecionados] = useState<number[]>([]);

    async function carregarDados() {
    setCarregando(true);
    setErro(null);
    try {
        const [dadosEquipes, dadosUsuarios] = await Promise.all([
        listarEquipes(),
        listarUsuarios(),
        ]);
        setEquipes(dadosEquipes);
        setUsuarios(dadosUsuarios);
    } catch (e) {
        setErro(e instanceof Error ? e.message : "Não foi possível carregar os dados.");
    } finally {
        setCarregando(false);
    }
    }

    useEffect(() => {
    carregarDados();
    }, []);

    function toggleColaborador(id: number, marcado: boolean) {
    setColaboradoresSelecionados((atual) =>
        marcado ? [...atual, id] : atual.filter((c) => c !== id)
    );
    }

    async function handleSalvar(e: React.FormEvent) {
    e.preventDefault();
    setSalvando(true);
    setErro(null);
    try {
        await criarEquipe({
        nome,
        descricao: descricao || null,
        supervisor_id: supervisorId ? Number(supervisorId) : null,
        colaboradores: colaboradoresSelecionados,
        });
        setNome("");
        setDescricao("");
        setSupervisorId("");
        setColaboradoresSelecionados([]);
        setModalAberto(false);
        await carregarDados();
    } catch (e) {
        setErro(e instanceof Error ? e.message : "Não foi possível salvar a equipe.");
    } finally {
        setSalvando(false);
    }
    }

    return (
        <AppShell>
    <div className="mx-auto max-w-5xl px-6 py-10">
        <div className="mb-8 flex items-center justify-between">
        <div>
            <h1 className="text-2xl font-semibold tracking-tight">Equipes</h1>
            <p className="text-sm text-muted-foreground">
            Equipes de campo e seus colaboradores.
            </p>
        </div>

        <Dialog open={modalAberto} onOpenChange={setModalAberto}>
            <DialogTrigger render={<Button>Nova equipe</Button>} />
            <DialogContent>
            <DialogHeader>
                <DialogTitle>Nova equipe</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSalvar} className="space-y-4">
                <div className="space-y-2">
                <Label htmlFor="nome">Nome</Label>
                <Input
                    id="nome"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    required
                />
                </div>
                <div className="space-y-2">
                <Label htmlFor="descricao">Descrição</Label>
                <Input
                    id="descricao"
                    value={descricao}
                    onChange={(e) => setDescricao(e.target.value)}
                />
                </div>
                <div className="space-y-2">
                <Label htmlFor="supervisor_id">Supervisor</Label>
                <Select value={supervisorId} onValueChange={setSupervisorId}>
                    <SelectTrigger id="supervisor_id" className="w-full">
                    <SelectValue placeholder="Selecione um supervisor" />
                    </SelectTrigger>
                    <SelectContent>
                    {usuarios.map((usuario) => (
                        <SelectItem key={usuario.id} value={String(usuario.id)}>
                        {usuario.name}
                        </SelectItem>
                    ))}
                    </SelectContent>
                </Select>
                </div>
                <div className="space-y-2">
                <Label>Colaboradores</Label>
                <div className="max-h-40 space-y-2 overflow-y-auto rounded-md border p-3">
                    {usuarios.map((usuario) => (
                    <div key={usuario.id} className="flex items-center gap-2">
                        <Checkbox
                        id={`colaborador-${usuario.id}`}
                        checked={colaboradoresSelecionados.includes(usuario.id)}
                        onCheckedChange={(checked) =>
                            toggleColaborador(usuario.id, checked === true)
                        }
                        />
                        <Label htmlFor={`colaborador-${usuario.id}`} className="font-normal">
                        {usuario.name}
                        </Label>
                    </div>
                    ))}
                </div>
                </div>
                <Button type="submit" disabled={salvando || !nome} className="w-full">
                {salvando ? "Salvando..." : "Salvar equipe"}
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
                <TableHead>Nome</TableHead>
                <TableHead>Supervisor</TableHead>
                <TableHead>Colaboradores</TableHead>
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

            {!carregando && equipes.length === 0 && (
                <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground">
                    Nenhuma equipe cadastrada ainda.
                </TableCell>
                </TableRow>
            )}

            {equipes.map((equipe) => (
                <TableRow key={equipe.id}>
                <TableCell className="font-medium">{equipe.nome}</TableCell>
                <TableCell>{equipe.supervisor?.name ?? "—"}</TableCell>
                <TableCell>{equipe.colaboradores?.length ?? 0}</TableCell>
                <TableCell>{equipe.ativa ? "Ativa" : "Inativa"}</TableCell>
                </TableRow>
            ))}
            </TableBody>
        </Table>
            </div>
        </div>
    </AppShell>
    );
}