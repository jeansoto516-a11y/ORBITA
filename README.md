# ORBITA

Plataforma SaaS B2B multiempresa para centralização da gestão operacional, financeira e contratual de serviços terceirizados.

Desenvolvido para a **Vértice Facilities & Operations**, empresa brasileira especializada em gestão terceirizada de operações prediais (manutenção, limpeza, segurança, facilities e infraestrutura) para empresas de médio e grande porte.

## Sobre o projeto

A Vértice administra contratos de manutenção, limpeza, segurança, facilities e infraestrutura para dezenas de clientes corporativos. Grande parte dessa operação ainda depende de planilhas, grupos de mensagens, e-mails e sistemas independentes — o que gera perda de ordens de serviço, falta de visão consolidada das equipes, dificuldade de medir SLA e de controlar custos por contrato.

O ORBITA centraliza toda essa operação em uma única plataforma, conectando:

```
Cliente → Contrato → Operação → Equipe → Ordem de Serviço → Execução → Custos → Indicadores
```

A visão do cliente é transformar o ORBITA em seu principal produto tecnológico e, futuramente, comercializá-lo para outras empresas do setor — por isso o produto é desenvolvido desde o início como **multiempresa (multi-tenant)**, com isolamento total de dados entre organizações.

## Arquitetura

Este é um **monorepo**, com o backend e o frontend no mesmo repositório:

```
ORBITA/
├── backend/     # API em Laravel (PHP) + PostgreSQL
└── frontend/    # Aplicação em Next.js + TypeScript
```

### Multi-tenancy

Cada empresa que utiliza o ORBITA é isolada por **schema separado dentro do mesmo banco PostgreSQL**, usando o pacote [`stancl/tenancy`](https://tenancyforlaravel.com/). O tenant é identificado por domínio/subdomínio. Tabelas de negócio (clientes, contratos, equipes, ordens de serviço, ocorrências), usuários, perfis e logs de auditoria vivem isolados dentro do schema de cada empresa; apenas os registros de tenants/domínios ficam no schema central.

## Stack

**Backend**
- PHP + [Laravel](https://laravel.com/)
- PostgreSQL
- [`stancl/tenancy`](https://tenancyforlaravel.com/) — multi-tenancy por schema
- [Laravel Sanctum](https://laravel.com/docs/sanctum) — autenticação via API token
- [`spatie/laravel-permission`](https://spatie.be/docs/laravel-permission) — perfis e permissões
- [`spatie/laravel-activitylog`](https://spatie.be/docs/laravel-activitylog) — auditoria e histórico de alterações

**Frontend**
- [Next.js](https://nextjs.org/) (App Router) + TypeScript
- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)

## Perfis de usuário

- Administrador da Vértice
- Gestor Operacional
- Supervisor
- Técnico/Colaborador
- Financeiro
- Cliente da Vértice

## Módulos do produto

- Gestão de clientes
- Gestão de contratos (vigência, valores, SLA)
- Gestão de equipes
- Ordens de serviço (com histórico completo de alterações)
- Operações em campo
- Ocorrências
- Acompanhamento de SLA
- Custos
- Dashboard executivo
- Portal do cliente

## Como rodar localmente

### Pré-requisitos

- PHP 8.5+
- Composer
- PostgreSQL 18
- Node.js 18.18+
- npm

### Backend

```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
# configure as variáveis DB_* do .env apontando para o seu PostgreSQL local
php artisan migrate
php artisan tenants:migrate
php artisan serve
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## Status do projeto

- [x] Setup do backend (Laravel + PostgreSQL)
- [x] Multi-tenancy (schema separado por empresa)
- [x] Autenticação e perfis de usuário
- [x] Modelagem de dados core (clientes, contratos, equipes, ordens de serviço, ocorrências) + auditoria
- [ ] Gestão de clientes (API pronta, frontend em andamento)
- [ ] Gestão de contratos
- [ ] Gestão de equipes
- [ ] Ordens de serviço
- [ ] Operações em campo
- [ ] Ocorrências
- [ ] SLA
- [ ] Custos
- [ ] Dashboard executivo
- [ ] Portal do cliente

## Equipe

Desenvolvimento full stack, decisões técnicas e evolução do projeto: **Jean**.
