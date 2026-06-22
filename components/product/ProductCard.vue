<script setup lang="ts">
import type { Product } from '~/types'
import { formatPrice, productionTimeLabel } from '~/lib/format'

const props = defineProps<{
  product: Product
}>()

const isMadeToOrder = computed(() => props.product.availabilityType === 'made_to_order')
const primaryImage = computed(() => props.product.images?.[0])
const secondaryImage = computed(() => props.product.images?.[1])

/** Texto contextual bajo el nombre según el tipo de pieza */
const availabilityLabel = computed(() =>
  isMadeToOrder.value
    ? productionTimeLabel(props.product.productionTimeDays)
    : 'Entrega inmediata',
)
</script>

<template>
  <NuxtLink
    :to="`/catalogo/${product.slug}`"
    class="group block"
  >
    <!-- Imagen con revelado de segunda foto al hover -->
    <div class="relative aspect-[4/5] overflow-hidden bg-stone">
      <span
        class="absolute left-3 top-3 z-10 bg-bone/90 px-3 py-1 text-[0.65rem] uppercase tracking-widest2 text-ink"
      >
        {{ isMadeToOrder ? 'Bajo pedido' : 'Colección' }}
      </span>

      <img
        v-if="primaryImage"
        :src="primaryImage.src"
        :alt="primaryImage.alt"
        loading="lazy"
        class="h-full w-full object-cover transition-all duration-700 ease-editorial group-hover:scale-105"
        :class="secondaryImage ? 'group-hover:opacity-0' : ''"
      />
      <img
        v-if="secondaryImage"
        :src="secondaryImage.src"
        :alt="secondaryImage.alt"
        loading="lazy"
        class="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-700 ease-editorial group-hover:opacity-100"
      />
    </div>

    <!-- Metadatos -->
    <div class="mt-4 flex items-baseline justify-between gap-4">
      <h3 class="font-serif text-lg font-light leading-snug text-ink">
        {{ product.name }}
      </h3>
      <span class="shrink-0 text-sm text-ink">
        {{ formatPrice(product.priceCents, product.currency) }}
      </span>
    </div>

    <p class="mt-1 text-xs uppercase tracking-widest2 text-engobe">
      {{ availabilityLabel }}
    </p>
  </NuxtLink>
</template>
