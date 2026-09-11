"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Building2,
  FileText,
  UsersRound,
  ClipboardList,
  Activity,
  AlertTriangle,
  Clock,
  Wallet,
  UserCircle,
  LogOut,
  Radio,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { meUsuario, logout, UsuarioLogado } from "@/lib/api";

const LINKS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/clientes", label: "Clientes", icon: Building2 },
  { href: "/contratos", label: "Contratos", icon: FileText },
  { href: "/equipes", label: "Equipes", icon: UsersRound },
  { href: "/ordens-servico", label: "Ordens de Serviço", icon: ClipboardList },
  { href: "/minhas-atividades", label: "Minhas Atividades", icon: Activity },
  { href: "/ocorrencias", label: "Ocorrências", icon: AlertTriangle },
  { href: "/sla", label: "SLA", icon: Clock },
  { href: "/custos", label: "Custos", icon: Wallet },
  { href: "/portal", label: "Portal do Cliente", icon: UserCircle },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [usuario, setUsuario] = useState<UsuarioLogado | null>(null);
  const [verificando, setVerificando] = useState(true);
  const [agora, setAgora] = useState<Date | null>(null);

  useEffect(() => {
    meUsuario()
      .then((dados) => setUsuario(dados))
      .catch(() => router.replace("/login"))
      .finally(() => setVerificando(false));
  }, [router]);

  useEffect(() => {
    setAgora(new Date());
    const id = setInterval(() => setAgora(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);

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

  const paginaAtual = LINKS.find((link) => link.href === pathname)?.label ?? "";

  return (
    <div className="flex min-h-screen">
      <aside className="flex w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar px-3 py-6 text-sidebar-foreground">
        <div className="mb-8 flex items-center gap-2 px-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Radio className="h-4 w-4" />
          </div>
          <p className="text-lg font-semibold tracking-tight">ORBITA</p>
        </div>

        <nav className="flex-1 space-y-1">
          {LINKS.map((link) => {
            const Icon = link.icon;
            const ativo = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors ${
                  ativo
                    ? "bg-primary text-primary-foreground"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-4 rounded-lg border border-sidebar-border bg-sidebar-accent/40 p-3">
          <div className="mb-2 flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            <p className="text-xs font-medium text-sidebar-foreground">Sistema ORBITA</p>
          </div>
          <p className="text-[11px] text-sidebar-foreground/60">Vértice Facilities & Operations</p>
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-sidebar-border pt-3">
          <div>
            <p className="text-xs font-medium">{usuario.name}</p>
            <p className="text-[11px] text-sidebar-foreground/50">{usuario.roles[0]}</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleLogout}
            className="h-7 w-7 text-sidebar-foreground/60 hover:text-sidebar-foreground"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="flex h-14 shrink-0 items-center justify-between border-b border-border bg-card px-6">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Vértice</span>
            <span className="text-muted-foreground/40">/</span>
            <span className="font-medium">{paginaAtual}</span>
          </div>
          {agora && (
            <p className="font-mono text-xs text-muted-foreground">
              {agora.toLocaleDateString("pt-BR", { weekday: "short", day: "2-digit", month: "short" })}
              {"  "}
              {agora.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
            </p>
          )}
        </header>
        <main className="flex-1 overflow-auto bg-background">{children}</main>
      </div>
    </div>
  );
}