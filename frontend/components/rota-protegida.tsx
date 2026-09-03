"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { meUsuario, UsuarioLogado } from "@/lib/api";

export function RotaProtegida({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const [usuario, setUsuario] = useState<UsuarioLogado | null>(null);
    const [verificando, setVerificando] = useState(true);

    useEffect(() => {
    meUsuario()
        .then((dados) => setUsuario(dados))
        .catch(() => router.replace("/login"))
        .finally(() => setVerificando(false));
    }, [router]);

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

    return <>{children}</>;
}