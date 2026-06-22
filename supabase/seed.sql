-- ============================================================================
-- StudioSeptiembre — Semilla de datos de ejemplo
-- ============================================================================
-- Ejecutar DESPUÉS de schema.sql, en: Supabase Dashboard → SQL Editor.
-- Reproduce el contenido demo de lib/data.ts para arrancar con datos reales.
-- Idempotente: limpia las tablas de catálogo antes de insertar.
--
-- Nota sobre imágenes: en esta semilla, product_images.storage_path guarda URLs
-- completas de picsum.photos (placeholder). Cuando subáis fotos reales al bucket
-- 'products', storage_path contendrá la ruta dentro del bucket (p. ej.
-- 'jarron-alba/01.jpg') y la capa de consulta construirá la URL pública.
-- ============================================================================

-- Limpieza del catálogo (respeta el orden de claves foráneas) -----------------
truncate table
  public.product_images,
  public.product_variants,
  public.product_dimensions
  restart identity cascade;
delete from public.products;
delete from public.collections;

-- COLECCIÓN -------------------------------------------------------------------
insert into public.collections (id, slug, title, month, description, cover_image, is_published)
values (
  '00000000-0000-0000-0000-0000000000c1',
  'junio',
  'Colección Junio',
  '2026-06-01',
  'Una selección de piezas de mesa en tonos tierra, disponibles para envío inmediato mientras haya stock.',
  'https://picsum.photos/seed/junio-cover/1600/900',
  true
);

-- PRODUCTOS -------------------------------------------------------------------
insert into public.products
  (id, slug, name, description, availability_type, price_cents, currency,
   production_time_days, stock_quantity, collection_id, is_featured, is_published)
values
  ('00000000-0000-0000-0000-000000000001', 'jarron-alba', 'Jarrón Alba',
   'Jarrón de líneas suaves modelado a torno. Su esmalte mate evoca la luz del amanecer sobre el barro.',
   'made_to_order', 9500, 'EUR', 24, null, null, true, true),

  ('00000000-0000-0000-0000-000000000002', 'cuenco-luna', 'Cuenco Luna',
   'Cuenco de porcelana de paredes finas, cocido a alta temperatura. Pieza única con vidriado satinado.',
   'in_stock', 4200, 'EUR', null, 6, '00000000-0000-0000-0000-0000000000c1', false, true),

  ('00000000-0000-0000-0000-000000000003', 'plato-terra', 'Plato Terra',
   'Plato llano de gres con borde irregular. El engobe terroso resalta el gesto de la mano.',
   'in_stock', 3200, 'EUR', null, 12, '00000000-0000-0000-0000-0000000000c1', false, true),

  ('00000000-0000-0000-0000-000000000004', 'tetera-niebla', 'Tetera Niebla',
   'Tetera de gres con asa de caña. Modelada por encargo, cada pieza ajusta su capacidad a tu ritual.',
   'made_to_order', 14500, 'EUR', 32, null, null, true, true);

-- VARIANTES -------------------------------------------------------------------
insert into public.product_variants (product_id, type, label, price_delta_cents, position)
values
  ('00000000-0000-0000-0000-000000000001', 'color', 'Arena', 0, 0),
  ('00000000-0000-0000-0000-000000000001', 'color', 'Carbón', 0, 1),
  ('00000000-0000-0000-0000-000000000004', 'tamano', 'Individual', 0, 0),
  ('00000000-0000-0000-0000-000000000004', 'tamano', 'Compartir', 3000, 1);

-- DIMENSIONES -----------------------------------------------------------------
insert into public.product_dimensions (product_id, label, value_cm)
values
  ('00000000-0000-0000-0000-000000000001', 'Altura', 28),
  ('00000000-0000-0000-0000-000000000001', 'Ø', 14),
  ('00000000-0000-0000-0000-000000000002', 'Altura', 8),
  ('00000000-0000-0000-0000-000000000002', 'Ø', 16),
  ('00000000-0000-0000-0000-000000000003', 'Ø', 22),
  ('00000000-0000-0000-0000-000000000004', 'Altura', 18),
  ('00000000-0000-0000-0000-000000000004', 'Capacidad', 90);

-- MATERIALES (se guardan como texto en una tabla auxiliar simple) --------------
-- Nota: el esquema base no incluye tabla de materiales N:M; se modela como
-- columna de texto agregada en la consulta. Si más adelante se quiere normalizar,
-- crear public.materials + public.product_materials.

-- IMÁGENES (placeholder picsum; sustituir por rutas del bucket 'products') -----
insert into public.product_images (product_id, storage_path, alt, position, is_primary)
values
  ('00000000-0000-0000-0000-000000000001', 'https://picsum.photos/seed/alba-1/900/1125', 'Jarrón Alba', 0, true),
  ('00000000-0000-0000-0000-000000000001', 'https://picsum.photos/seed/alba-2/900/1125', 'Jarrón Alba detalle', 1, false),
  ('00000000-0000-0000-0000-000000000002', 'https://picsum.photos/seed/luna-1/900/1125', 'Cuenco Luna', 0, true),
  ('00000000-0000-0000-0000-000000000002', 'https://picsum.photos/seed/luna-2/900/1125', 'Cuenco Luna detalle', 1, false),
  ('00000000-0000-0000-0000-000000000003', 'https://picsum.photos/seed/terra-1/900/1125', 'Plato Terra', 0, true),
  ('00000000-0000-0000-0000-000000000003', 'https://picsum.photos/seed/terra-2/900/1125', 'Plato Terra detalle', 1, false),
  ('00000000-0000-0000-0000-000000000004', 'https://picsum.photos/seed/niebla-1/900/1125', 'Tetera Niebla', 0, true),
  ('00000000-0000-0000-0000-000000000004', 'https://picsum.photos/seed/niebla-2/900/1125', 'Tetera Niebla detalle', 1, false);

-- ============================================================================
-- FIN DE LA SEMILLA
-- ============================================================================
