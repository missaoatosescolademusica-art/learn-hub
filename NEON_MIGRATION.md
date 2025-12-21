# Integração e Migração Neon Database

Este documento descreve o processo de integração com o Neon Database e o sistema de migrações customizado implementado para replicar a estrutura do Supabase.

## Pré-requisitos

Certifique-se de que o arquivo `.env` na raiz do projeto contém a variável de conexão correta:

```env
DATABASE_URL=postgres://user:password@host:port/database?sslmode=require
```

## Estrutura do Sistema de Migração

O sistema foi desenvolvido utilizando Node.js e `pg` para manter a simplicidade e controle total sobre o SQL.

- **scripts/db/migrate.ts**: Executa as migrações pendentes.
- **scripts/db/rollback.ts**: Reverte a última migração aplicada.
- **scripts/db/verify.ts**: Valida se a estrutura do banco está correta.
- **scripts/db/migrations/**: Contém os arquivos SQL.

## Compatibilidade com Supabase

O script de migração `001_initial_schema.sql` foi adaptado para rodar em um PostgreSQL padrão (como o Neon), que nativamente não possui o schema `auth` do Supabase.

A migração cria automaticamente:
1. Um schema `auth` se não existir.
2. Uma tabela `auth.users` mínima para satisfazer as chaves estrangeiras.
3. Uma função mock `auth.uid()` para que as políticas de RLS (Row Level Security) funcionem sem erros de sintaxe.

## Comandos Disponíveis

Os seguintes comandos foram adicionados ao `package.json` para facilitar o uso:

### 1. Aplicar Migrações

Para criar as tabelas e aplicar o schema:

```bash
npm run db:migrate
```
*Saída esperada:* `Successfully applied 001_initial_schema.sql`

### 2. Verificar Status

Para validar se as tabelas e funções foram criadas corretamente:

```bash
npm run db:verify
```
*Saída esperada:* Checks ✅ para tabelas e funções.

### 3. Reverter Migração (Rollback)

Para desfazer a última migração (DROP nas tabelas):

```bash
npm run db:rollback
```
*Saída esperada:* `Successfully rolled back 001_initial_schema.sql`

## Testando o Fluxo Completo

Para garantir que tudo está funcionando, você pode executar o seguinte ciclo:

1. `npm run db:migrate` (Aplica o schema)
2. `npm run db:verify` (Confirma a criação)
3. `npm run db:rollback` (Remove tudo - opcional, se quiser testar a reversão)

## Observações Importantes

- **Dados de Usuário**: A tabela `auth.users` criada é apenas estrutural. Se você planeja integrar autenticação real, deverá popular esta tabela via aplicação ou integrar com um provedor de Auth externo (como Clerk, Auth0 ou o próprio Supabase Auth conectado ao Neon).
- **RLS**: As políticas de segurança (RLS) estão ativas, mas a função `auth.uid()` retorna `NULL` por padrão. Você precisará ajustar essa função ou a lógica de conexão para passar o ID do usuário real se quiser que as regras de segurança funcionem efetivamente na aplicação.
