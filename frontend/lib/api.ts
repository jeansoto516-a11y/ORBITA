const API_URL = process.env.NEXT_PUBLIC_API_URL;

export type Cliente = {
    id: number;
    razao_social: string;
    nome_fantasia: string | null;
    cnpj: string;
    email: string | null;
    telefone: string | null;
    endereco: string | null;
    ativo: boolean;
};

export type Contrato = {
    id: number;
    cliente_id: number;
    cliente?: Cliente;
    numero_contrato: string;
    titulo: string;
    descricao: string | null;
    data_inicio: string;
    data_fim: string | null;
    valor_mensal: string | null;
    sla_horas: number | null;
    responsavel_id: number | null;
    status: "ativo" | "suspenso" | "encerrado";
};

export type UsuarioResumo = {
    id: number;
    name: string;
    email: string;
};

export type Equipe = {
    id: number;
    nome: string;
    descricao: string | null;
    supervisor_id: number | null;
    supervisor?: UsuarioResumo | null;
    colaboradores?: UsuarioResumo[];
    ativa: boolean;
};

export type OrdemServico = {
    id: number;
    contrato_id: number;
    contrato?: Contrato;
    equipe_id: number | null;
    equipe?: Equipe | null;
    criado_por: number;
    criadoPor?: UsuarioResumo;
    titulo: string;
    descricao: string | null;
    prioridade: "baixa" | "media" | "alta" | "urgente";
    status: "aberta" | "em_andamento" | "concluida" | "cancelada";
    data_prazo: string | null;
    data_conclusao: string | null;
};

type ClientesResponse = {
    data: Cliente[];
};

type ContratosResponse = {
    data: Contrato[];
};

type EquipesResponse = {
    data: Equipe[];
};

type OrdensServicoResponse = {
    data: OrdemServico[];
};

function getToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("orbita_token");
}

async function apiFetch(path: string, options: RequestInit = {}) {
    const token = getToken();

    const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
    },
    });

    if (!response.ok) {
    const error = await response.json().catch(() => null);
    throw new Error(error?.message ?? `Erro na requisição: ${response.status}`);
    }

    if (response.status === 204) return null;

    return response.json();
}

export async function listarClientes(): Promise<Cliente[]> {
    const result: ClientesResponse = await apiFetch("/clientes");
    return result.data;
}

export async function criarCliente(dados: Partial<Cliente>): Promise<Cliente> {
    return apiFetch("/clientes", {
    method: "POST",
    body: JSON.stringify(dados),
    });
}

export async function atualizarCliente(id: number, dados: Partial<Cliente>): Promise<Cliente> {
    return apiFetch(`/clientes/${id}`, {
    method: "PUT",
    body: JSON.stringify(dados),
    });
}

export async function apagarCliente(id: number): Promise<void> {
    await apiFetch(`/clientes/${id}`, { method: "DELETE" });
}

export async function listarContratos(): Promise<Contrato[]> {
    const result: ContratosResponse = await apiFetch("/contratos");
    return result.data;
}

export async function criarContrato(dados: Partial<Contrato>): Promise<Contrato> {
    return apiFetch("/contratos", {
    method: "POST",
    body: JSON.stringify(dados),
    });
}

export async function atualizarContrato(id: number, dados: Partial<Contrato>): Promise<Contrato> {
    return apiFetch(`/contratos/${id}`, {
    method: "PUT",
    body: JSON.stringify(dados),
    });
}

export async function apagarContrato(id: number): Promise<void> {
    await apiFetch(`/contratos/${id}`, { method: "DELETE" });
}

export async function listarEquipes(): Promise<Equipe[]> {
    const result: EquipesResponse = await apiFetch("/equipes");
    return result.data;
}

export async function criarEquipe(dados: {
    nome: string;
    descricao?: string | null;
    supervisor_id?: number | null;
    colaboradores?: number[];
}): Promise<Equipe> {
    return apiFetch("/equipes", {
    method: "POST",
    body: JSON.stringify(dados),
    });
}

export async function atualizarEquipe(
    id: number,
    dados: Partial<{
    nome: string;
    descricao: string | null;
    supervisor_id: number | null;
    ativa: boolean;
    colaboradores: number[];
    }>
): Promise<Equipe> {
    return apiFetch(`/equipes/${id}`, {
    method: "PUT",
    body: JSON.stringify(dados),
    });
}

export async function apagarEquipe(id: number): Promise<void> {
    await apiFetch(`/equipes/${id}`, { method: "DELETE" });
}

export async function listarUsuarios(): Promise<UsuarioResumo[]> {
    return apiFetch("/usuarios");
}

export async function listarOrdensServico(): Promise<OrdemServico[]> {
    const result: OrdensServicoResponse = await apiFetch("/ordens-servico");
    return result.data;
}

export async function criarOrdemServico(dados: {
    contrato_id: number;
    equipe_id?: number | null;
    titulo: string;
    descricao?: string | null;
    prioridade?: OrdemServico["prioridade"];
    data_prazo?: string | null;
}): Promise<OrdemServico> {
    return apiFetch("/ordens-servico", {
    method: "POST",
    body: JSON.stringify(dados),
    });
}

export async function atualizarOrdemServico(
    id: number,
    dados: Partial<{
    equipe_id: number | null;
    titulo: string;
    descricao: string | null;
    prioridade: OrdemServico["prioridade"];
    status: OrdemServico["status"];
    data_prazo: string | null;
    }>
): Promise<OrdemServico> {
    return apiFetch(`/ordens-servico/${id}`, {
    method: "PUT",
    body: JSON.stringify(dados),
    });
}

export async function apagarOrdemServico(id: number): Promise<void> {
    await apiFetch(`/ordens-servico/${id}`, { method: "DELETE" });
}