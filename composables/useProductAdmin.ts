import type { AvailabilityType } from '~/types'

// ----------------------------------------------------------------------------
// Capa de ESCRITURA para el panel privado (operaciones de administración).
// Requiere usuario autenticado: las políticas RLS permiten insert/update/delete
// a `authenticated`. Las imágenes se suben al bucket público 'products'.
// ----------------------------------------------------------------------------

export interface AdminImage {
  id: string
  storage_path: string
  url: string
  alt: string | null
  position: number
  is_primary: boolean
}

export interface AdminDimension {
  id?: string
  label: string
  value_cm: number
}

export interface AdminVariant {
  id?: string
  type: 'color' | 'tamano' | 'acabado'
  label: string
  price_delta_cents: number
  stock_quantity: number | null
  position: number
}

export interface AdminProductForm {
  id: string | null
  slug: string
  name: string
  description: string
  availability_type: AvailabilityType
  price_cents: number
  currency: string
  production_time_days: number | null
  stock_quantity: number | null
  collection_id: string | null
  is_featured: boolean
  is_published: boolean
}

export interface AdminCollectionOption {
  id: string
  title: string
}

/** Convierte un nombre en un slug seguro para URL. */
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // quita acentos
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
}

/** Valores por defecto para una pieza nueva. */
export function emptyProductForm(): AdminProductForm {
  return {
    id: null,
    slug: '',
    name: '',
    description: '',
    availability_type: 'made_to_order',
    price_cents: 0,
    currency: 'EUR',
    production_time_days: null,
    stock_quantity: null,
    collection_id: null,
    is_featured: false,
    is_published: false,
  }
}

export function useProductAdmin() {
  const supabase = useSupabaseClient()

  function publicUrl(path: string): string {
    if (/^https?:\/\//i.test(path)) return path
    return supabase.storage.from('products').getPublicUrl(path).data.publicUrl
  }

  /** Lista de colecciones para el selector (incluye no publicadas). */
  async function fetchCollectionOptions(): Promise<AdminCollectionOption[]> {
    const { data, error } = await supabase
      .from('collections')
      .select('id, title')
      .order('title', { ascending: true })
    if (error) throw error
    return (data ?? []) as AdminCollectionOption[]
  }

  /** Carga una pieza por id, incluidas las no publicadas, en forma editable. */
  async function fetchProduct(id: string): Promise<{
    form: AdminProductForm
    images: AdminImage[]
    dimensions: AdminDimension[]
    variants: AdminVariant[]
  }> {
    const { data, error } = await supabase
      .from('products')
      .select('*, product_images(*), product_variants(*), product_dimensions(*)')
      .eq('id', id)
      .single()
    if (error) throw error

    const row = data as Record<string, unknown> & {
      product_images?: AdminImage[]
      product_variants?: AdminVariant[]
      product_dimensions?: AdminDimension[]
    }

    const images = (row.product_images ?? [])
      .map((img) => ({ ...img, url: publicUrl(img.storage_path) }))
      .sort(
        (a, b) => Number(b.is_primary) - Number(a.is_primary) || a.position - b.position,
      )

    const dimensions = (row.product_dimensions ?? []).map((d) => ({
      id: d.id,
      label: d.label,
      value_cm: Number(d.value_cm),
    }))

    const variants = (row.product_variants ?? [])
      .map((v) => ({
        id: v.id,
        type: v.type,
        label: v.label,
        price_delta_cents: v.price_delta_cents ?? 0,
        stock_quantity: v.stock_quantity ?? null,
        position: v.position ?? 0,
      }))
      .sort((a, b) => a.position - b.position)

    const form: AdminProductForm = {
      id: row.id as string,
      slug: row.slug as string,
      name: row.name as string,
      description: (row.description as string) ?? '',
      availability_type: row.availability_type as AvailabilityType,
      price_cents: row.price_cents as number,
      currency: (row.currency as string) ?? 'EUR',
      production_time_days: (row.production_time_days as number) ?? null,
      stock_quantity: (row.stock_quantity as number) ?? null,
      collection_id: (row.collection_id as string) ?? null,
      is_featured: Boolean(row.is_featured),
      is_published: Boolean(row.is_published),
    }

    return { form, images, dimensions, variants }
  }

  /**
   * Crea o actualiza una pieza junto con sus dimensiones y variantes.
   * Devuelve el id del producto guardado.
   */
  async function saveProduct(
    form: AdminProductForm,
    dimensions: AdminDimension[],
    variants: AdminVariant[],
  ): Promise<string> {
    const slug = form.slug.trim() || slugify(form.name)

    // Normaliza campos según la disponibilidad
    const isStock = form.availability_type === 'in_stock'
    const payload = {
      slug,
      name: form.name.trim(),
      description: form.description.trim() || null,
      availability_type: form.availability_type,
      price_cents: Math.max(0, Math.round(form.price_cents)),
      currency: form.currency || 'EUR',
      production_time_days: isStock ? null : form.production_time_days,
      stock_quantity: isStock ? form.stock_quantity : null,
      collection_id: form.collection_id || null,
      is_featured: form.is_featured,
      is_published: form.is_published,
    }

    let productId = form.id

    if (productId) {
      const { error } = await supabase.from('products').update(payload).eq('id', productId)
      if (error) throw error
    } else {
      const { data, error } = await supabase
        .from('products')
        .insert(payload)
        .select('id')
        .single()
      if (error) throw error
      productId = (data as { id: string }).id
    }

    // Reemplaza dimensiones y variantes (estrategia simple: borrar e insertar)
    await supabase.from('product_dimensions').delete().eq('product_id', productId)
    const cleanDimensions = dimensions
      .filter((d) => d.label.trim() && Number.isFinite(d.value_cm))
      .map((d) => ({ product_id: productId, label: d.label.trim(), value_cm: d.value_cm }))
    if (cleanDimensions.length) {
      const { error } = await supabase.from('product_dimensions').insert(cleanDimensions)
      if (error) throw error
    }

    await supabase.from('product_variants').delete().eq('product_id', productId)
    const cleanVariants = variants
      .filter((v) => v.label.trim())
      .map((v, i) => ({
        product_id: productId,
        type: v.type,
        label: v.label.trim(),
        price_delta_cents: Math.round(v.price_delta_cents) || 0,
        stock_quantity: v.stock_quantity,
        position: i,
      }))
    if (cleanVariants.length) {
      const { error } = await supabase.from('product_variants').insert(cleanVariants)
      if (error) throw error
    }

    return productId as string
  }

  /** Elimina una pieza (las filas hijas caen por ON DELETE CASCADE). */
  async function deleteProduct(id: string): Promise<void> {
    const { error } = await supabase.from('products').delete().eq('id', id)
    if (error) throw error
  }

  /** Sube un archivo al bucket y registra la fila en product_images. */
  async function uploadImage(
    productId: string,
    slug: string,
    file: File,
    opts: { isPrimary?: boolean; position?: number } = {},
  ): Promise<AdminImage> {
    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
    const path = `${slug || productId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`

    const { error: upErr } = await supabase.storage
      .from('products')
      .upload(path, file, { cacheControl: '3600', upsert: false })
    if (upErr) throw upErr

    const { data, error } = await supabase
      .from('product_images')
      .insert({
        product_id: productId,
        storage_path: path,
        alt: null,
        position: opts.position ?? 0,
        is_primary: opts.isPrimary ?? false,
      })
      .select('*')
      .single()
    if (error) throw error

    const img = data as AdminImage
    return { ...img, url: publicUrl(img.storage_path) }
  }

  /** Borra una imagen del bucket y su fila. */
  async function deleteImage(image: AdminImage): Promise<void> {
    if (!/^https?:\/\//i.test(image.storage_path)) {
      await supabase.storage.from('products').remove([image.storage_path])
    }
    const { error } = await supabase.from('product_images').delete().eq('id', image.id)
    if (error) throw error
  }

  /** Marca una imagen como principal y desmarca el resto del producto. */
  async function setPrimaryImage(productId: string, imageId: string): Promise<void> {
    await supabase.from('product_images').update({ is_primary: false }).eq('product_id', productId)
    const { error } = await supabase
      .from('product_images')
      .update({ is_primary: true })
      .eq('id', imageId)
    if (error) throw error
  }

  return {
    publicUrl,
    fetchCollectionOptions,
    fetchProduct,
    saveProduct,
    deleteProduct,
    uploadImage,
    deleteImage,
    setPrimaryImage,
  }
}
