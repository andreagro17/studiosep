<script setup lang="ts">
withDefaults(
  defineProps<{
    eyebrow?: string
    title: string
    body?: string
    image?: string
    reverse?: boolean
    ctaLabel?: string
    ctaTo?: string
  }>(),
  {
    eyebrow: '',
    body: '',
    image: '',
    reverse: false,
    ctaLabel: '',
    ctaTo: '',
  },
)
</script>

<template>
  <section class="container-editorial py-20 md:py-28">
    <div class="grid items-center gap-10 md:grid-cols-2 md:gap-16">
      <!-- Imagen -->
      <div
        class="aspect-[4/5] overflow-hidden bg-stone"
        :class="reverse ? 'md:order-2' : 'md:order-1'"
      >
        <img
          v-if="image"
          :src="image"
          :alt="title"
          class="h-full w-full object-cover transition-transform duration-700 ease-editorial hover:scale-105"
        />
      </div>

      <!-- Texto -->
      <div :class="reverse ? 'md:order-1' : 'md:order-2'">
        <p v-if="eyebrow" class="eyebrow">{{ eyebrow }}</p>
        <h2 class="mt-4 font-serif text-3xl font-light leading-tight text-ink md:text-4xl">
          {{ title }}
        </h2>
        <p v-if="body" class="mt-6 max-w-md text-base leading-relaxed text-engobe">
          {{ body }}
        </p>
        <NuxtLink
          v-if="ctaLabel && ctaTo"
          :to="ctaTo"
          class="mt-8 inline-block border-b border-ink pb-1 text-sm uppercase tracking-widest2 text-ink transition-colors duration-300 ease-editorial hover:border-accent hover:text-accent"
        >
          {{ ctaLabel }}
        </NuxtLink>
      </div>
    </div>
  </section>
</template>
