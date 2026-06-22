<script setup lang="ts">
definePageMeta({ layout: 'studio' })
useHead({ title: 'Colecciones — Panel' })

const supabase = useSupabaseClient()

interface CollectionRow {
  id: string
  slug: string
  title: string
  month: string | null
  is_published: boolean
}

const { data, pending, error } = await useAsyncData('panel-collections', async () => {
  const [cols, prods] = await Promise.all([
    supabase.from('collections').select('id, slug, title, month, is_published').order('month', { ascending: false }),
    supabase.from('products').select('collection_id'),
  ])
  if (cols.error) throw cols.error
  if (prods.error) throw prods.error

  const counts = new Map<string, number>()
  for (const p of (prods.data ?? []) as { collection_id: string | null }[]) {
    if (p.collection_id) counts.set(p.collection_id, (counts.get(p.collection_id) ?? 0) + 1)
  }

  return (cols.data as CollectionRow[]).map((c) => ({ ...c, productCount: counts.get(c.id) ?? 0 }))
})

const formatMonth = (iso: string | null) =>
  iso
    ? new Date(iso).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })
    : '—'
</script>

<template>
  <div>
    <header class="mb-8">
      <p class="eyebrow">Catálogo</p>
      <h1 class="mt-1 font-serif text-3xl tracking-tight text-ink">Colecciones</h1>
    </header>

    <p v-if="error" class="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
      No se pudieron cargar las colecciones.
    </p>

    <div v-else class="overflow-hidden rounded-lg border border-ink/10 bg-white">
      <table class="w-full text-left text-sm">
        <thead class="border-b border-ink/10 text-xs uppercase tracking-widest2 text-engobe">
          <tr>
            <th class="px-5 py-3 font-medium">Colección</th>
            <th class="px-5 py-3 font-medium">Mes</th>
            <th class="px-5 py-3 font-medium">Piezas</th>
            <th class="px-5 py-3 font-medium">Estado</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="pending">
            <td colspan="4" class="px-5 py-8 text-center text-engobe">Cargando…</td>
          </tr>
          <tr v-else-if="!data?.length">
            <td colspan="4" class="px-5 py-8 text-center text-engobe">Aún no hay colecciones.</td>
          </tr>
          <tr
            v-for="c in data"
            v-else
            :key="c.id"
            class="border-b border-ink/5 last:border-0 transition-colors hover:bg-stone/20"
          >
            <td class="px-5 py-3 font-medium text-ink capitalize">{{ c.title }}</td>
            <td class="px-5 py-3 text-engobe capitalize">{{ formatMonth(c.month) }}</td>
            <td class="px-5 py-3 text-engobe">{{ c.productCount }}</td>
            <td class="px-5 py-3">
              <span
                class="inline-block rounded-full px-2.5 py-0.5 text-xs"
                :class="c.is_published ? 'bg-green-100 text-green-800' : 'bg-stone/50 text-engobe'"
              >
                {{ c.is_published ? 'Publicada' : 'Borrador' }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
