-- Migración: agrega calorías estimadas a la tabla sesiones.
-- Correr en Supabase → SQL Editor.

alter table sesiones
  add column if not exists calorias_estimadas integer not null default 0;

comment on column sesiones.calorias_estimadas is
  'Estimación de calorías quemadas en la sesión (fórmula MET, calculada en el frontend a partir de RPE y peso corporal). No es un dato médico exacto.';
