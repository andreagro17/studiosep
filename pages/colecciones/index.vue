<script setup lang="ts">
import { collections } from '~/lib/data'

useHead({ title: 'Colecciones — StudioSeptiembre' })

// Solo colecciones publicadas y con stock (se ocultan al agotarse)
const visible = computed(() =>
  collections.filter((c) => c.isPublished && c.productCount > 0),
)
</script>

<template>
  <div class="container-editorial py-16 md:py-24">
    <header class="max-w-2xl">
      <p class="eyebrow">Colecciones</p>
      <h1 class="mt-4 font-serif text-4xl font-light leading-tight text-ink md:text-5xl">
        Una colección cada mes
      </h1>
      <p class="mt-4 text-engobe">
        Series limitadas listas para envío inmediato. Cuando se agotan, desaparecen.
      </p>
    </header>

    <div class="mt-12 grid grid-cols-1 gap-x-8 gap-y-14 md:grid-cols-2">
      <NuxtLink
        v-for="collection in visible"
        :key="collection.id"
        :to="`/colecciones/${collection.slug}`"
        class="group block"
      >
        <div class="aspect-[16/10] overflow-hidden bg-stone">
          <img
            :src="collection.coverImage"
            :alt="collection.title"
            class="h-full w-full object-cover transition-transform duration-700 ease-editorial group-hover:scale-105"
          />
        </div>
        <div class="mt-5 flex items-baseline justify-between gap-4">
          <h2 class="font-serif text-2xl font-light text-ink">{{ collection.title }}</h2>
          <span class="shrink-0 text-xs uppercase tracking-widest2 text-engobe">
            {{ collection.productCount }} piezas
          </span>
        </div>
        <p class="mt-2 max-w-prose text-sm leading-relaxed text-engobe">
          {{ collection.description }}
        </p>
      </NuxtLink>
    </div>

    <p v-if="!visible.length" class="mt-12 text-engobe">
      No hay colecciones disponibles ahora mismo. Vuelve pronto.
    </p>
  </div>
</template>
