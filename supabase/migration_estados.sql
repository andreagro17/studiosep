-- Migración: simplificar los estados de pedido (10 fases → 6)
-- Nuevos estados: pendiente, aceptado, en_produccion, enviado, entregado, cancelado
-- Seguro de ejecutar aunque ya existan pedidos: mapea los estados antiguos.
-- Ejecutar TODO de una vez en el SQL Editor de Supabase.

begin;

-- 1. Crear el nuevo tipo
create type production_status_new as enum (
  'pendiente', 'aceptado', 'en_produccion', 'enviado', 'entregado', 'cancelado'
);

-- 2. Quitar el valor por defecto actual de la columna
alter table orders alter column status drop default;

-- 3. Convertir la columna al nuevo tipo, mapeando los valores antiguos
alter table orders
  alter column status type production_status_new
  using (
    case status::text
      when 'modelando'        then 'en_produccion'
      when 'secando'          then 'en_produccion'
      when 'primera_coccion'  then 'en_produccion'
      when 'esmaltado'        then 'en_produccion'
      when 'segunda_coccion'  then 'en_produccion'
      when 'preparando_envio' then 'en_produccion'
      else status::text
    end::production_status_new
  );

-- 4. Restaurar el valor por defecto
alter table orders alter column status set default 'pendiente';

-- 5. Borrar el tipo viejo y renombrar el nuevo
drop type production_status;
alter type production_status_new rename to production_status;

commit;
