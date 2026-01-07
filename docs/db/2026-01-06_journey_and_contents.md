# Versão: DB-2026-01-06 – Jornada e Conteúdos
 
 ## 📦 Visão Geral
 - Objetivo: Suportar as funcionalidades de Jornada do Usuário (Níveis e Tarefas) e Biblioteca de Conteúdos (Catálogo, Favoritos e Progresso).
 - Stack alvo: PostgreSQL (Neon/Supabase). Compatível com RLS.
 - Migração aplicada: `003_journey_and_contents.sql`.
 
 ---
 
 ## 🧩 Modelagem de Dados (ER)
 
 ```mermaid
 erDiagram
     profiles ||--o{ user_bookmarks : has
     profiles ||--o{ content_progress : tracks
     profiles ||--o{ user_level_progress : tracks
     profiles ||--o{ user_task_progress : tracks
     
     contents ||--o{ user_bookmarks : bookmarked_in
     contents ||--o{ content_progress : tracked_in
     contents ||--o| tasks : linked_to
     
     levels ||--|{ tasks : contains
     levels ||--o{ user_level_progress : tracked_in
     
     tasks ||--o{ user_task_progress : tracked_in
 
     profiles {
         uuid id PK
         uuid user_id UK
     }
     
     contents {
         uuid id PK
         text title
         text type
         text category
     }
     
     user_bookmarks {
         uuid user_id FK
         uuid content_id FK
     }
     
     content_progress {
         uuid user_id FK
         uuid content_id FK
         int watched_seconds
         bool is_completed
     }
     
     levels {
         uuid id PK
         int sequence_number
         text name
     }
     
     tasks {
         uuid id PK
         uuid level_id FK
         uuid content_id FK
         text task_type
     }
 ```
 
 ### Entidades Principais:
 
 #### 📚 Conteúdos (Content System)
 - **public.contents**
   - `id` (UUID, PK)
   - `title`, `description`
   - `type` (ENUM: 'video', 'course', 'event', 'extra')
   - `category` (ex: 'Frontend', 'Backend')
   - `thumbnail_url`, `video_url`
   - `duration_seconds`
 
 - **public.user_bookmarks**
   - Relação N:N entre Profiles e Contents.
   - Usado para a aba "Salvos" na tela `MyContents`.
 
 - **public.content_progress**
   - Rastreia o progresso de consumo de conteúdo (segundos assistidos, conclusão).
   - Usado para a aba "Em andamento" na tela `MyContents`.
 
 #### 🗺️ Jornada (Journey System)
 - **public.levels**
   - Define a estrutura macro da jornada (ex: "Nível 1 - Introdução").
   - Ordenados por `sequence_number`.
 
 - **public.tasks**
   - Atividades dentro de um nível.
   - Podem estar ligadas a um conteúdo (`content_id`).
   - Tipos: `setup`, `deadline`, `content`, `quiz`, `milestone`.
 
 - **public.user_level_progress**
   - Estado do usuário em um nível: `locked`, `active`, `completed`.
 
 - **public.user_task_progress**
   - Estado da tarefa: `pending`, `completed`.
 
 ---
 
 ## 🔒 Segurança (RLS)
 
 - **Leitura Pública**:
   - `contents`, `levels`, `tasks` podem ser lidos por todos os usuários autenticados.
 
 - **Dados do Usuário**:
   - `user_bookmarks`, `content_progress`, `user_level_progress`, `user_task_progress`:
   - Política: Usuários só podem ver e modificar seus próprios registros (baseado no `profile_id` vinculado ao `auth.uid()`).
 
 ---
 
 ## 🔄 Fluxo de Dados (Front ↔ Back)
 
 ### 1. Tela Journey (`src/pages/Journey.tsx`)
 - **Leitura**:
   - Busca todos os `levels` ordenados por sequência.
   - Busca `user_level_progress` para determinar quais níveis estão desbloqueados.
   - Ao selecionar um nível, busca `tasks` desse nível e o `user_task_progress` correspondente.
 - **Escrita**:
   - Ao iniciar/concluir uma tarefa: `upsert` em `user_task_progress`.
   - Lógica de bloqueio sequencial é gerenciada no frontend com base nos status retornados.
 
 ### 2. Tela MyContents (`src/pages/MyContents.tsx`)
 - **Aba "Em andamento"**:
   - Busca `content_progress` onde `is_completed = false`, fazendo join com `contents`.
   - Ordena por `last_watched_at` decrescente.
 - **Aba "Salvos"**:
   - Busca `user_bookmarks` fazendo join com `contents`.
 
 ### 3. Tela Profile (`src/pages/Profile.tsx`)
 - Já documentado em `2026-01-06_profile_and_skills.md`.
 - Integração com Journey: O progresso na jornada pode ser exibido no perfil futuramente.
 
 ---
 
 ## 🔎 Exemplos de Consultas
 
 ### Buscar conteúdos em progresso do usuário
 ```sql
 SELECT 
   cp.watched_seconds,
   cp.last_watched_at,
   c.title,
   c.thumbnail_url
 FROM public.content_progress cp
 JOIN public.contents c ON c.id = cp.content_id
 JOIN public.profiles p ON p.id = cp.user_id
 WHERE p.user_id = auth.uid()
   AND cp.is_completed = false
 ORDER BY cp.last_watched_at DESC;
 ```
 
 ### Marcar tarefa como concluída
 ```sql
 INSERT INTO public.user_task_progress (user_id, task_id, status, completed_at)
 VALUES ('<PROFILE_ID>', '<TASK_ID>', 'completed', now())
 ON CONFLICT (user_id, task_id) 
 DO UPDATE SET status = 'completed', completed_at = now();
 ```
 
 ---
 
 ## ✅ Validação
 - Tipos TypeScript gerados em `src/integrations/supabase/types.ts` garantem segurança de tipo no frontend.
 - Constraints de unicidade (`UNIQUE(user_id, content_id)`, etc.) previnem duplicidade de dados.
 - `ON DELETE CASCADE` garante que se um usuário ou conteúdo for deletado, o progresso/favorito associado também será limpo.
