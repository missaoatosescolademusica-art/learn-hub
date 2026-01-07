# Versão: DB-2026-01-06 – Extensões de Perfil e Habilidades

## 📦 Visão Geral
- Objetivo: suportar novas telas e formulários de Perfil e Habilidades.
- Stack alvo: PostgreSQL (Neon/Supabase). Compatível com RLS.
- Migração aplicada: `002_profile_extensions.sql` (Neon) e equivalente em `supabase/migrations/20260106120000_profile_extensions.sql`.

---

## 🧩 Modelagem de Dados (ER)

```
auth.users (ou public.users_mock) ──┐
                                   │ 1 ── 1
                                   └── public.profiles
                                          ├── 1 ── N public.profile_links
                                          └── 1 ── N public.profile_skills
```

Entidades:
- public.profiles
  - id (UUID, PK)
  - user_id (UUID, UK, FK → users)
  - full_name, avatar_url
  - bio, role, location, cover_image_url
  - created_at, updated_at

- public.profile_links
  - id (UUID, PK)
  - profile_id (UUID, FK → profiles.id)
  - kind (ENUM textual: website|linkedin|instagram|twitter, UK por perfil)
  - url (TEXT, NOT NULL)
  - created_at (TIMESTAMPTZ)
  - UNIQUE (profile_id, kind)

- public.profile_skills
  - id (UUID, PK)
  - profile_id (UUID, FK → profiles.id)
  - name (TEXT, NOT NULL, único por perfil)
  - icon_name (TEXT, NOT NULL)
  - favorite (BOOLEAN, default false)
  - created_at (TIMESTAMPTZ)
  - UNIQUE (profile_id, name)

RLS (Row Level Security):
- Todas as tabelas utilizam políticas que checam o dono via `profiles.user_id`.
- Neon: `public.current_session_id()`; Supabase: `auth.uid()`.

---

## 🛠️ Alterações Realizadas
- Tabela `public.profiles`: adicionados `bio`, `role`, `location`, `cover_image_url`.
- Tabela `public.profile_links`: criada; links normalizados por tipo.
- Tabela `public.profile_skills`: criada; habilidades com `name` e `icon_name`.
- Políticas RLS de `SELECT/INSERT/UPDATE/DELETE` para `profile_links` e `profile_skills`.
- Verificador atualizado ([verify.ts](file:///e:/Projetos/Agencia%20Digital/Clientes/Ativos/Miss%C3%A3o%20Atos%20-%20Escola%20de%20Musica/learn-hub/scripts/db/verify.ts)).
- Types do Supabase atualizados ([types.ts](file:///e:/Projetos/Agencia%20Digital/Clientes/Ativos/Miss%C3%A3o%20Atos%20-%20Escola%20de%20Musica/learn-hub/src/integrations/supabase/types.ts)).

---

## 🔎 Exemplos de Consultas

### 1) Inserir link do perfil
```sql
INSERT INTO public.profile_links (profile_id, kind, url)
VALUES ('<PROFILE_ID>', 'website', 'https://meusite.com');
```

### 2) Inserir habilidade com ícone
```sql
INSERT INTO public.profile_skills (profile_id, name, icon_name)
VALUES ('<PROFILE_ID>', 'Violão', 'Guitar');
```

### 3) Listar habilidades do usuário logado (Supabase)
```sql
SELECT ps.*
FROM public.profile_skills ps
JOIN public.profiles p ON p.id = ps.profile_id
WHERE p.user_id = auth.uid();
```

### 4) Atualizar dados do perfil
```sql
UPDATE public.profiles
SET bio = 'Nova bio...', role = 'Instrumentista', location = 'São Paulo'
WHERE user_id = auth.uid();
```

---

## ⚠️ Impactos em Funcionalidades Existentes
- Campos adicionais em `profiles` devem ser carregados e persistidos no frontend.
- RLS depende de `current_session_id()` (Neon) ou `auth.uid()` (Supabase). É necessário garantir que o contexto de sessão esteja propagado.
- Unicidade de `profile_links.kind` e `profile_skills.name` por perfil impede duplicatas acidentais.

---

## ✅ Validação e Desempenho
- CRUD testado via migração e verificador:
  - Comandos: `npm run db:migrate` e `npm run db:verify`.
- Índices implícitos:
  - PKs e UNIQUE garantem bom desempenho para consultas por perfil e deduplicação.
- Para alto volume, considere índices adicionais em `profile_links(profile_id)` e `profile_skills(profile_id, name)`.

---

## 🧭 Legenda com Emojis
- 🧩 Entidade
- 🔗 Relacionamento
- 🛡️ RLS/Segurança
- 🛠️ Alteração
- 🔎 Consulta
- ⚠️ Impacto
- ✅ Validação

---

## 📌 Versionamento
- Versão: DB-2026-01-06
- Migração Up: `002_profile_extensions.sql`
- Migração Down: `002_profile_extensions_down.sql`
- Compatibilidade Supabase: `20260106120000_profile_extensions.sql`

