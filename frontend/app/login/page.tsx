"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { login } from "@/lib/api";

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [erro, setErro] = useState<string | null>(null);
    const [entrando, setEntrando] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setEntrando(true);
    try {
        await login(email, password);
        router.push("/clientes");
    } catch (e) {
        setErro(e instanceof Error ? e.message : "Não foi possível entrar.");
    } finally {
        setEntrando(false);
        }
    }

    return (
    <div className="flex min-h-screen items-center justify-center px-6">
        <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">ORBITA</h1>
            <p className="mt-1 text-sm text-muted-foreground">
            Entre com sua conta da Vértice.
            </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
            />
            </div>
            <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
            />
            </div>

            {erro && (
            <div className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                {erro}
            </div>
            )}

            <Button type="submit" disabled={entrando} className="w-full">
            {entrando ? "Entrando..." : "Entrar"}
            </Button>
        </form>
        </div>
    </div>
    );
}