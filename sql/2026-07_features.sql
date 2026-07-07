-- Migración: notas por sesión + ejercicios personalizados persistentes
-- Correr esto en el SQL Editor de Supabase (proyecto de FitSync).

-- 1) Notas de sesión ---------------------------------------------------
alter table sesiones
  add column if not exists notas text;

-- 2) Ejercicios personalizados -------------------------------------------
create table if not exists ejercicios_personalizados (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null references auth.users(id) on delete cascade,
  nombre text not null,
  grupo text not null default 'Personalizado',
  descripcion text default '',
  puntos_clave jsonb not null default '[]'::jsonb,
  creado_en timestamptz not null default now()
);

create index if not exists idx_ejercicios_personalizados_usuario
  on ejercicios_personalizados (usuario_id);

-- RLS: cada usuario solo ve y toca sus propios ejercicios personalizados
alter table ejercicios_personalizados enable row level security;

drop policy if exists "select propios ejercicios personalizados" on ejercicios_personalizados;
create policy "select propios ejercicios personalizados"
  on ejercicios_personalizados for select
  using (auth.uid() = usuario_id);

drop policy if exists "insert propios ejercicios personalizados" on ejercicios_personalizados;
create policy "insert propios ejercicios personalizados"
  on ejercicios_personalizados for insert
  with check (auth.uid() = usuario_id);

drop policy if exists "update propios ejercicios personalizados" on ejercicios_personalizados;
create policy "update propios ejercicios personalizados"
  on ejercicios_personalizados for update
  using (auth.uid() = usuario_id);

drop policy if exists "delete propios ejercicios personalizados" on ejercicios_personalizados;
create policy "delete propios ejercicios personalizados"
  on ejercicios_personalizados for delete
  using (auth.uid() = usuario_id);

-- Nota: el backend ya valida el usuario_id contra el JWT (requireAuth) antes de
-- tocar esta tabla, así que RLS acá es una segunda capa de seguridad, no la única.
