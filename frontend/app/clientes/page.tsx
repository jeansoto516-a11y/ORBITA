"use client";

import { useEffect, useState } from "react";
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
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Cliente, listarClientes, criarCliente } from "@/lib/api";

export default function ClientesPage() {
    const [clientes, setClientes] = useState<Cliente[]>([]);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState<string | null>(null);
    const [modalAberto, setModalAberto] = useState(false);
    const [salvando, setSalvando] = useState(false);

    const [razaoSocial, setRazaoSocial] = useState("");
    const [cnpj, setCnpj] = useState("");
    const [email, setEmail] = useState("");
    const [telefone, setTelefone] = useState("");

    async function carregarClientes() {
    setCarregando(true);
    setErro(null);
    try {
        const dados = await listarClientes();
        setClientes(dados);
    } catch (e) {
        setErro(e instanceof Error ? e.message : "Não foi possível carregar os clientes.");
    } finally {
        setCarregando(false);
    }
    }

    useEffect(() => {
    carregarClientes();
    }, []);

    async function handleSalvar(e: React.FormEvent) {
    e.preventDefault();
    setSalvando(true);
    setErro(null);
    try {
        await criarCliente({
        razao_social: razaoSocial,
        cnpj,
        email: email || null,
        telefone: telefone || null,
        });
        setRazaoSocial("");
        setCnpj("");
        setEmail("");
        setTelefone("");
        setModalAberto(false);
        await carregarClientes();
    } catch (e) {
        setErro(e instanceof Error ? e.message : "Não foi possível salvar o cliente.");
    } finally {
        setSalvando(false);
    }
    }

        return (
        <AppShell>
    <div className="mx-auto max-w-5xl px-6 py-10">
        <div className="mb-8 flex items-center justify-between">
        <div>
            <h1 className="text-2xl font-semibold tracking-tight">Clientes</h1>
            <p className="text-sm text-muted-foreground">
            Empresas atendidas pela Vértice.
            </p>
        </div>

        <Dialog open={modalAberto} onOpenChange={setModalAberto}>
            <DialogTrigger render={<Button>Novo cliente</Button>} />
            <DialogContent>
            <DialogHeader>
                <DialogTitle>Novo cliente</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSalvar} className="space-y-4">
                <div className="space-y-2">
                <Label htmlFor="razao_social">Razão social</Label>
                <Input
                    id="razao_social"
                    value={razaoSocial}
                    onChange={(e) => setRazaoSocial(e.target.value)}
                    required
                />
                </div>
                <div className="space-y-2">
                <Label htmlFor="cnpj">CNPJ</Label>
                <Input
                    id="cnpj"
                    value={cnpj}
                    onChange={(e) => setCnpj(e.target.value)}
                    required
                />
                </div>
                <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                </div>
                <div className="space-y-2">
                <Label htmlFor="telefone">Telefone</Label>
                <Input
                    id="telefone"
                    value={telefone}
                    onChange={(e) => setTelefone(e.target.value)}
                />
                </div>
                <Button type="submit" disabled={salvando} className="w-full">
                {salvando ? "Salvando..." : "Salvar cliente"}
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
                <TableHead>Razão social</TableHead>
                <TableHead>CNPJ</TableHead>
                <TableHead>E-mail</TableHead>
                <TableHead>Telefone</TableHead>
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

            {!carregando && clientes.length === 0 && (
                <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground">
                    Nenhum cliente cadastrado ainda.
                </TableCell>
                </TableRow>
            )}

            {clientes.map((cliente) => (
                <TableRow key={cliente.id}>
                <TableCell className="font-medium">{cliente.razao_social}</TableCell>
                <TableCell>{cliente.cnpj}</TableCell>
                <TableCell>{cliente.email ?? "—"}</TableCell>
                <TableCell>{cliente.telefone ?? "—"}</TableCell>
                </TableRow>
            ))}
            </TableBody>
        </Table>
            </div>
        </div>
    </AppShell>
    );
}
