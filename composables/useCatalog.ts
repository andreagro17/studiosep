import type {
  Product,
  Collection,
  ProductVariant,
  ProductImage,
  ProductDimension,
  AvailabilityType,
} from '~/types'

// ----------------------------------------------------------------------------
// Capa de consultas a Supabase para el sitio público.
// Sustituye a los datos mock de lib/data.ts.
// Cada función envuelve useAsyncData para render en servidor (SSR/SWR).
// ----------------------------------------------------------------------------

/** Forma cruda de las filas tal y como llegan de Supabase */
interface DbImage {
  storage_path: string
  alt: string | null
  position: number
  is_primary: boolean
}
interface DbVariant {
  id: string
  type: 'color' | 'tamano' | 'acabado'
  label: string
  price_delta_cents: number
  stock_quantity: number | null
  position: number
}
interface DbDimension {
  label: string
  value_cm: number
}
interface DbProduct {
  id: string
  slug: string
  name: string
  description: string | null
  availability_type: AvailabilityType
  price_cents: number
  currency: string
  production_time_days: number | null
  stock_quantity: number | null
  collection_id: string | null
  is_featured: boolean
  is_published: boolean
  product_images?: DbImage[]
  product_variants?: DbVariant[]
  product_dimensions?: DbDimension[]
}
interface DbCollection {
  id: string
  slug: string
  title: string
  month: string | null
  description: string | null
  cover_image: string | null
  is_published: boolean
}

const PRODUCT_SELECT =
  '*, product_images(*), product_variants(*), product_dimensions(*)'

/**
 * Resuelve la ruta de una imagen a URL pública.
 * Si ya es una URL absoluta (datos de ejemplo) se devuelve tal cual;
 * en otro caso se pide la URL pública del bucket 'products'.
 */
function resolveImageUrl(supabase: ReturnType<typeof useSupabaseClient>, path: string): string {
  if (/^https?:\/\//i.test(path)) return path
  return supabase.storage.from('products').getPublicUrl(path).data.publicUrl
}

function mapImages(
  supabase: ReturnType<typeof useSupabaseClient>,
  rows: DbImage[] = [],
): ProductImage[] {
  return [...rows]
    .sort((a, b) => Number(b.is_primary) - Number(a.is_primary) || a.position - b.position)
    .map((img) => ({
      src: resolveImageUrl(supabase, img.storage_path),
      alt: img.alt ?? 'Pieza de cerámica artesanal',
    }))
}

function mapVariants(rows: DbVariant[] = []): ProductVariant[] {
  return [...rows]
    .sort((a, b) => a.position - b.position)
    .map((v) => ({
      id: v.id,
      // El enum de la BD usa 'tamano' (sin ñ); el dominio usa 'tamaño'.
      type: v.type === 'tamano' ? 'tamaño' : v.type,
      label: v.label,
      priceDeltaCents: v.price_delta_cents || undefined,
      stockQuantity: v.stock_quantity ?? undefined,
    }))
}

function mapDimensions(rows: DbDimension[] = []): ProductDimension[] {
  return rows.map((d) => ({ label: d.label, valueCm: Number(d.value_cm) }))
}

function mapProduct(supabase: ReturnType<typeof useSupabaseClient>, row: DbProduct): Product {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description ?? '',
    availabilityType: row.availability_type,
    priceCents: row.price_cents,
    currency: row.currency,
    productionTimeDays: row.production_time_days ?? undefined,
    stockQuantity: row.stock_quantity ?? undefined,
    images: mapImages(supabase, row.product_images),
    dimensions: mapDimensions(row.product_dimensions),
    materials: [],
    variants: mapVariants(row.product_variants),
    collectionId: row.collection_id ?? undefined,
    isFeatured: row.is_featured,
    isPublished: row.is_published,
  }
}

function mapCollection(
  supabase: ReturnType<typeof useSupabaseClient>,
  row: DbCollection,
  productCount: number,
): Collection {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    month: row.month ?? '',
    description: row.description ?? '',
    coverImage: row.cover_image ? resolveImageUrl(supabase, row.cover_image) : '',
    productCount,
    isPublished: row.is_published,
  }
}

// ----------------------------------------------------------------------------
// Composables públicos
// ----------------------------------------------------------------------------

/** Todas las piezas publicadas */
export function useProducts() {
  const supabase = useSupabaseClient()
  return useAsyncData('products', async () => {
    const { data, error } = await supabase
      .from('products')
      .select(PRODUCT_SELECT)
      .eq('is_published', true)
      .order('created_at', { ascending: false })
    if (error) throw error
    return (data as unknown as DbProduct[]).map((row) => mapProduct(supabase, row))
  })
}

/** Una pieza por slug (null si no existe o no está publicada) */
export function useProduct(slug: MaybeRefOrGetter<string>) {
  const supabase = useSupabaseClient()
  const key = computed(() => `product-${toValue(slug)}`)
  return useAsyncData(
    key.value,
    async () => {
      const { data, error } = await supabase
        .from('products')
        .select(PRODUCT_SELECT)
        .eq('slug', toValue(slug))
        .eq('is_published', true)
        .maybeSingle()
      if (error) throw error
      return data ? mapProduct(supabase, data as unknown as DbProduct) : null
    },
    { watch: [key] },
  )
}

/** Colecciones publicadas con al menos una pieza publicada */
export function useCollections() {
  const supabase = useSupabaseClient()
  return useAsyncData('collections', async () => {
    const [cols, prods] = await Promise.all([
      supabase.from('collections').select('*').eq('is_published', true),
      supabase.from('products').select('collection_id').eq('is_published', true),
    ])
    if (cols.error) throw cols.error
    if (prods.error) throw prods.error

    const counts = new Map<string, number>()
    for (const p of (prods.data ?? []) as { collection_id: string | null }[]) {
      if (p.collection_id) counts.set(p.collection_id, (counts.get(p.collection_id) ?? 0) + 1)
    }

    return (cols.data as DbCollection[])
      .map((c) => mapCollection(supabase, c, counts.get(c.id) ?? 0))
      .filter((c) => c.productCount > 0)
  })
}

/** Una colección por slug junto con sus piezas publicadas */
export function useCollection(slug: MaybeRefOrGetter<string>) {
  const supabase = useSupabaseClient()
  const key = computed(() => `collection-${toValue(slug)}`)
  return useAsyncData(
    key.value,
    async () => {
      const { data: col, error } = await supabase
        .from('collections')
        .select('*')
        .eq('slug', toValue(slug))
        .eq('is_published', true)
        .maybeSingle()
      if (error) throw error
      if (!col) return null

      const { data: prods, error: prodErr } = await supabase
        .from('products')
        .select(PRODUCT_SELECT)
        .eq('is_published', true)
        .eq('collection_id', (col as DbCollection).id)
        .order('created_at', { ascending: false })
      if (prodErr) throw prodErr

      const pieces = (prods as unknown as DbProduct[]).map((row) => mapProduct(supabase, row))
      return {
        collection: mapCollection(supabase, col as DbCollection, pieces.length),
        pieces,
      }
    },
    { watch: [key] },
  )
}
