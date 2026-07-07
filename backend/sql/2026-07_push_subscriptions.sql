-- Migración: tabla de suscripciones push (Web Push API).
-- Correr en Supabase → SQL Editor.
-- Sigue el mismo patrón de RLS real que ejercicios_personalizados
-- (a diferencia de usuarios/rutinas/sesiones, que hoy no tienen RLS activo).

create table if not exists push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null references auth.users(id) on delete cascade,
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  ultima_notificacion_en timestamptz,
  creado_en timestamptz not null default now()
);

create index if not exists push_subscriptions_usuario_id_idx on push_subscriptions(usuario_id);

alter table push_subscriptions enable row level security;

-- El backend usa la service role key (bypassea RLS) para el cron de
-- inactividad, así que estas policies son para si alguna vez se accede
-- con la anon key directamente desde el cliente.
create policy "usuario ve sus propias suscripciones"
  on push_subscriptions for select
  using (auth.uid() = usuario_id);

create policy "usuario crea sus propias suscripciones"
  on push_subscriptions for insert
  with check (auth.uid() = usuario_id);

create policy "usuario borra sus propias suscripciones"
  on push_subscriptions for delete
  using (auth.uid() = usuario_id);
