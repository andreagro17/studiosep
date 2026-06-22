<script setup lang="ts">
import { products } from '~/lib/data'
import type { AvailabilityType } from '~/types'

useHead({ title: 'Catálogo — StudioSeptiembre' })

type Filter = 'all' | AvailabilityType
const filter = ref<Filter>('all')

const tabs: { value: Filter; label: string }[] = [
  { value: 'all', label: 'Todo' },
  { value: 'made_to_order', label: 'Bajo pedido' },
  { value: 'in_stock', label: 'Envío inmediato' },
]

const visible = computed(() =>
  products.filter(
    (p) => p.isPublished && (filter.value === 'all' || p.availabilityType === filter.value),
  ),
)
</script>

<template>
  <div class="container-editorial py-16 md:py-24">
    <header class="max-w-2xl">
      <p class="eyebrow">Catálogo</p>
      <h1 class="mt-4 font-serif text-4xl font-light leading-tight text-ink md:text-5xl">
        Piezas hechas a mano
      </h1>
      <p class="mt-4 text-engobe">
        Encargos exclusivos y colecciones de envío inmediato. Cada pieza es única.
      </p>
    </header>

    <!-- Filtros -->
    <div class="mt-10 flex flex-wrap gap-6 border-b border-ink/10 pb-4">
      <button
        v-for="tab in tabs"
        :key="tab.value"
        type="button"
        class="text-sm uppercase tracking-widest2 transition-colors duration-300 ease-editorial"
        :class="filter === tab.value ? 'text-ink' : 'text-engobe hover:text-ink'"
        @click="filter = tab.value"
      >
        {{ tab.label }}
      </button>
    </div>

    <!-- Rejilla -->
    <div class="mt-12 grid grid-cols-1 gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
      <ProductCard v-for="product in visible" :key="product.id" :product="product" />
    </div>

    <p v-if="!visible.length" class="mt-12 text-engobe">
      No hay piezas en esta categoría por ahora.
    </p>
  </div>
</template>
