<script setup lang="ts">
import { formatPrice } from '~/lib/format'
import type { AvailabilityType } from '~/types'

definePageMeta({ layout: 'studio' })
useHead({ title: 'Productos — Panel' })

const supabase = useSupabaseClient()

interface ProductRow {
  id: string
  slug: string
  name: string
  availability_type: AvailabilityType
  price_cents: number
  stock_quantity: number | null
  is_published: boolean
  is_featured: boolean
}

const { data: products, pending, error } = await useAsyncData('panel-products', async () => {
  const { data, error: err } = await supabase
    .from('products')
    .select('id, slug, name, availability_type, price_cents, stock_quantity, is_published, is_featured')
    .order('created_at', { ascending: false })
  if (err) throw err
  return (data ?? []) as ProductRow[]
})

const availabilityLabel = (a: AvailabilityType) =>
  a === 'made_to_order' ? 'Bajo pedido' : 'En stock'
</script>

<template>
  <div>
    <header class="mb-8 flex items-end justify-between gap-4">
      <div>
        <p class="eyebrow">Catálogo</p>
        <h1 class="mt-1 font-serif text-3xl tracking-tight text-ink">Productos</h1>
      </div>
      <NuxtLink
        to="/panel/productos/nuevo"
        class="rounded-md bg-ink px-4 py-2 text-sm text-bone transition-colors hover:bg-accent"
      >
        Nueva pieza
      </NuxtLink>
    </header>

    <p v-if="error" class="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
      No se pudieron cargar los productos.
    </p>

    <div v-else class="overflow-hidden rounded-lg border border-ink/10 bg-white">
      <table class="w-full text-left text-sm">
        <thead class="border-b border-ink/10 text-xs uppercase tracking-widest2 text-engobe">
          <tr>
            <th class="px-5 py-3 font-medium">Pieza</th>
            <th class="px-5 py-3 font-medium">Disponibilidad</th>
            <th class="px-5 py-3 font-medium">Precio</th>
            <th class="px-5 py-3 font-medium">Stock</th>
            <th class="px-5 py-3 font-medium">Estado</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="pending">
            <td colspan="5" class="px-5 py-8 text-center text-engobe">Cargando…</td>
          </tr>
          <tr v-else-if="!products?.length">
            <td colspan="5" class="px-5 py-8 text-center text-engobe">
              Aún no hay productos.
              <NuxtLink to="/panel/productos/nuevo" class="text-accent underline">Crea el primero</NuxtLink>.
            </td>
          </tr>
          <tr
            v-for="p in products"
            v-else
            :key="p.id"
            class="cursor-pointer border-b border-ink/5 last:border-0 transition-colors hover:bg-stone/20"
            @click="navigateTo(`/panel/productos/${p.id}`)"
          >
            <td class="px-5 py-3 font-medium text-ink">
              {{ p.name }}
              <span v-if="p.is_featured" class="ml-2 text-xs text-accent">★</span>
            </td>
            <td class="px-5 py-3 text-engobe">{{ availabilityLabel(p.availability_type) }}</td>
            <td class="px-5 py-3 text-ink">{{ formatPrice(p.price_cents, 'EUR') }}</td>
            <td class="px-5 py-3 text-engobe">{{ p.stock_quantity ?? '—' }}</td>
            <td class="px-5 py-3">
              <span
                class="inline-block rounded-full px-2.5 py-0.5 text-xs"
                :class="p.is_published ? 'bg-green-100 text-green-800' : 'bg-stone/50 text-engobe'"
              >
                {{ p.is_published ? 'Publicado' : 'Borrador' }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
