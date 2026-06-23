// ----------------------------------------------------------------------------
// Capa de ESCRITURA para colecciones (panel privado).
// Requiere usuario autenticado (RLS: insert/update/delete para `authenticated`).
// La imagen de portada se sube al bucket público 'products' bajo 'collections/'.
// ----------------------------------------------------------------------------

export interface AdminCollectionForm {
  id: string | null
  slug: string
  title: string
  month: string | null // 'YYYY-MM-DD' o null
  description: string
  cover_image: string | null // URL completa o ruta dentro del bucket
  is_published: boolean
}

/** Valores por defecto para una colección nueva. */
export function emptyCollectionForm(): AdminCollectionForm {
  return {
    id: null,
    slug: '',
    title: '',
    month: null,
    description: '',
    cover_image: null,
    is_published: false,
  }
}

export function useCollectionAdmin() {
  const supabase = useSupabaseClient()

  function publicUrl(path: string | null): string | null {
    if (!path) return null
    if (/^https?:\/\//i.test(path)) return path
    return supabase.storage.from('products').getPublicUrl(path).data.publicUrl
  }

  /** Carga una colección por id (incluidas no publicadas) en forma editable. */
  async function fetchCollection(id: string): Promise<AdminCollectionForm> {
    const { data, error } = await supabase
      .from('collections')
      .select('id, slug, title, month, description, cover_image, is_published')
      .eq('id', id)
      .single()
    if (error) throw error

    const row = data as Record<string, unknown>
    return {
      id: row.id as string,
      slug: row.slug as string,
      title: row.title as string,
      month: (row.month as string) ?? null,
      description: (row.description as string) ?? '',
      cover_image: (row.cover_image as string) ?? null,
      is_published: Boolean(row.is_published),
    }
  }

  /** Crea o actualiza una colección. Devuelve el id guardado. */
  async function saveCollection(form: AdminCollectionForm): Promise<string> {
    const slug = form.slug.trim() || slugify(form.title)
    const payload = {
      slug,
      title: form.title.trim(),
      month: form.month || null,
      description: form.description.trim() || null,
      cover_image: form.cover_image || null,
      is_published: form.is_published,
    }

    if (form.id) {
      const { error } = await supabase.from('collections').update(payload).eq('id', form.id)
      if (error) throw error
      return form.id
    }

    const { data, error } = await supabase
      .from('collections')
      .insert(payload)
      .select('id')
      .single()
    if (error) throw error
    return (data as { id: string }).id
  }

  /**
   * Elimina una colección. Los productos asociados quedan sin colección
   * (collection_id ON DELETE SET NULL en el esquema), no se borran.
   */
  async function deleteCollection(id: string): Promise<void> {
    const { error } = await supabase.from('collections').delete().eq('id', id)
    if (error) throw error
  }

  /** Sube una imagen de portada al bucket y devuelve su ruta almacenada. */
  async function uploadCover(slug: string, file: File): Promise<string> {
    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
    const base = slug || Date.now().toString()
    const path = `collections/${base}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`

    const { error } = await supabase.storage
      .from('products')
      .upload(path, file, { cacheControl: '3600', upsert: false })
    if (error) throw error
    return path
  }

  /** Borra del bucket una portada previa (solo si es una ruta del bucket). */
  async function removeCoverFile(path: string | null): Promise<void> {
    if (!path || /^https?:\/\//i.test(path)) return
    await supabase.storage.from('products').remove([path])
  }

  return {
    publicUrl,
    fetchCollection,
    saveCollection,
    deleteCollection,
    uploadCover,
    removeCoverFile,
  }
}
