<script setup lang="ts">
import { formatPrice, productionTimeLabel } from '~/lib/format'

const route = useRoute()
const slug = computed(() => String(route.params.slug))
const { data: product } = await useProduct(slug)

if (!product.value) {
  throw createError({ statusCode: 404, statusMessage: 'Pieza no encontrada', fatal: true })
}

useHead(() => ({ title: `${product.value?.name} — StudioSeptiembre` }))

const isMadeToOrder = computed(() => product.value?.availabilityType === 'made_to_order')
const activeImage = ref(0)
const selectedVariant = ref<string | null>(null)
</script>

<template>
  <article v-if="product" class="container-editorial py-12 md:py-20">
    <NuxtLink
      to="/catalogo"
      class="text-xs uppercase tracking-widest2 text-engobe transition-colors hover:text-ink"
    >
      ← Catálogo
    </NuxtLink>

    <div class="mt-8 grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16">
      <!-- Galería -->
      <div class="lg:sticky lg:top-28 lg:self-start">
        <div class="aspect-[4/5] overflow-hidden bg-stone">
          <img
            v-if="product.images[activeImage]"
            :src="product.images[activeImage].src"
            :alt="product.images[activeImage].alt"
            class="h-full w-full object-cover"
          />
        </div>
        <div v-if="product.images.length > 1" class="mt-4 flex gap-3">
          <button
            v-for="(image, i) in product.images"
            :key="i"
            type="button"
            class="aspect-square w-20 overflow-hidden bg-stone ring-1 transition-all"
            :class="activeImage === i ? 'ring-ink' : 'ring-transparent opacity-70 hover:opacity-100'"
            @click="activeImage = i"
          >
            <img :src="image.src" :alt="image.alt" class="h-full w-full object-cover" />
          </button>
        </div>
      </div>

      <!-- Información -->
      <div>
        <p class="eyebrow">
          {{ isMadeToOrder ? 'Hecho bajo pedido' : 'Envío inmediato' }}
        </p>
        <h1 class="mt-4 font-serif text-4xl font-light leading-tight text-ink md:text-5xl">
          {{ product.name }}
        </h1>
        <p class="mt-4 text-2xl font-light text-ink">
          {{ formatPrice(product.priceCents, product.currency) }}
        </p>

        <p class="mt-8 max-w-prose leading-relaxed text-engobe">
          {{ product.description }}
        </p>

        <!-- Variantes -->
        <div v-if="product.variants?.length" class="mt-10">
          <p class="text-xs uppercase tracking-widest2 text-ink">
            {{ product.variants[0].type }}
          </p>
          <div class="mt-3 flex flex-wrap gap-3">
            <button
              v-for="variant in product.variants"
              :key="variant.id"
              type="button"
              class="border px-4 py-2 text-sm transition-colors duration-300 ease-editorial"
              :class="
                selectedVariant === variant.id
                  ? 'border-ink bg-ink text-bone'
                  : 'border-ink/20 text-ink hover:border-ink'
              "
              @click="selectedVariant = variant.id"
            >
              {{ variant.label }}
            </button>
          </div>
        </div>

        <!-- Ficha técnica -->
        <dl class="mt-10 divide-y divide-ink/10 border-t border-ink/10">
          <div class="flex justify-between py-3 text-sm">
            <dt class="text-engobe">Materiales</dt>
            <dd class="text-ink">{{ product.materials.join(' · ') }}</dd>
          </div>
          <div class="flex justify-between py-3 text-sm">
            <dt class="text-engobe">Dimensiones</dt>
            <dd class="text-ink">
              {{ product.dimensions.map((d) => `${d.label} ${d.valueCm} cm`).join(' · ') }}
            </dd>
          </div>
          <div v-if="isMadeToOrder" class="flex justify-between py-3 text-sm">
            <dt class="text-engobe">Tiempo de producción</dt>
            <dd class="text-ink">{{ productionTimeLabel(product.productionTimeDays) }}</dd>
          </div>
          <div v-else class="flex justify-between py-3 text-sm">
            <dt class="text-engobe">Disponibilidad</dt>
            <dd class="text-ink">{{ product.stockQuantity }} en stock · entrega inmediata</dd>
          </div>
        </dl>

        <!-- CTA -->
        <NuxtLink
          :to="isMadeToOrder ? `/pedido?pieza=${product.slug}` : `/pedido?pieza=${product.slug}`"
          class="mt-10 inline-block bg-ink px-8 py-4 text-sm uppercase tracking-widest2 text-bone transition-colors duration-300 ease-editorial hover:bg-accent"
        >
          {{ isMadeToOrder ? 'Solicitar pedido' : 'Reservar pieza' }}
        </NuxtLink>
      </div>
    </div>
  </article>
</template>
