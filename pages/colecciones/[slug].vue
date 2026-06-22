<script setup lang="ts">
import { getCollectionBySlug, products } from '~/lib/data'

const route = useRoute()
const slug = computed(() => String(route.params.slug))
const collection = computed(() => getCollectionBySlug(slug.value))

if (!collection.value) {
  throw createError({ statusCode: 404, statusMessage: 'Colección no encontrada', fatal: true })
}

useHead(() => ({ title: `${collection.value?.title} — StudioSeptiembre` }))

const pieces = computed(() =>
  products.filter((p) => p.isPublished && p.collectionId === collection.value?.id),
)
</script>

<template>
  <div v-if="collection" class="pb-20">
    <!-- Portada -->
    <div class="relative aspect-[21/9] w-full overflow-hidden bg-stone">
      <img
        :src="collection.coverImage"
        :alt="collection.title"
        class="h-full w-full object-cover"
      />
    </div>

    <div class="container-editorial">
      <header class="max-w-2xl py-12 md:py-16">
        <NuxtLink
          to="/colecciones"
          class="text-xs uppercase tracking-widest2 text-engobe transition-colors hover:text-ink"
        >
          ← Colecciones
        </NuxtLink>
        <h1 class="mt-6 font-serif text-4xl font-light leading-tight text-ink md:text-5xl">
          {{ collection.title }}
        </h1>
        <p class="mt-4 text-engobe">{{ collection.description }}</p>
      </header>

      <div class="grid grid-cols-1 gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
        <ProductCard v-for="product in pieces" :key="product.id" :product="product" />
      </div>

      <p v-if="!pieces.length" class="text-engobe">
        Esta colección ya no tiene piezas disponibles.
      </p>
    </div>
  </div>
</template>
