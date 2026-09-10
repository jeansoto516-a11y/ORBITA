"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { meUsuario, logout, UsuarioLogado } from "@/lib/api";

const LINKS = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/clientes", label: "Clientes" },
    { href: "/contratos", label: "Contratos" },
    { href: "/equipes", label: "Equipes" },
    { href: "/ordens-servico", label: "Ordens de Serviço" },
    { href: "/minhas-atividades", label: "Minhas Atividades" },
    { href: "/ocorrencias", label: "Ocorrências" },
    { href: "/sla", label: "SLA" },
    { href: "/custos", label: "Custos" },
];

export function AppShell({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const [usuario, setUsuario] = useState<UsuarioLogado | null>(null);
    const [verificando, setVerificando] = useState(true);

    useEffect(() => {
    meUsuario()
        .then((dados) => setUsuario(dados))
        .catch(() => router.replace("/login"))
        .finally(() => setVerificando(false));
    }, [router]);

    async function handleLogout() {
    await logout();
    router.replace("/login");
    }

    if (verificando) {
    return (
        <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">
        Carregando...
        </div>
    );
    }

    if (!usuario) {
    return null;
    }

    return (
    <div className="flex min-h-screen">
        <aside className="flex w-56 shrink-0 flex-col border-r bg-muted/30 px-3 py-6">
        <div className="mb-6 px-2">
            <p className="text-lg font-semibold tracking-tight">ORBITA</p>
        </div>
        <nav className="flex-1 space-y-1">
            {LINKS.map((link) => (
            <Link
                key={link.href}
                href={link.href}
                className={`block rounded-md px-2 py-1.5 text-sm ${
                pathname === link.href
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
            >
                {link.label}
            </Link>
            ))}
        </nav>
        <div className="border-t pt-3">
            <p className="mb-2 px-2 text-xs text-muted-foreground">{usuario.name}</p>
            <Button variant="ghost" size="sm" className="w-full justify-start" onClick={handleLogout}>
            Sair
            </Button>
        </div>
        </aside>
        <main className="flex-1 overflow-auto">{children}</main>
    </div>
    );
}