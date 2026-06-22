<script setup lang="ts">
withDefaults(
  defineProps<{
    eyebrow?: string
    title: string
    subtitle?: string
    image?: string
    ctaLabel?: string
    ctaTo?: string
  }>(),
  {
    eyebrow: '',
    subtitle: '',
    image: '',
    ctaLabel: '',
    ctaTo: '',
  },
)
</script>

<template>
  <section class="relative flex min-h-[88vh] items-end overflow-hidden">
    <!-- Imagen de fondo a sangre -->
    <div class="absolute inset-0 -z-10 bg-stone">
      <img
        v-if="image"
        :src="image"
        :alt="title"
        class="h-full w-full object-cover"
      />
      <div class="absolute inset-0 bg-gradient-to-t from-ink/40 via-ink/5 to-transparent" />
    </div>

    <div class="container-editorial pb-16 pt-32 md:pb-24">
      <p v-if="eyebrow" class="eyebrow text-bone/80">{{ eyebrow }}</p>
      <h1
        class="mt-4 max-w-4xl font-serif text-4xl font-light leading-[1.05] text-bone sm:text-5xl md:text-6xl lg:text-7xl"
      >
        {{ title }}
      </h1>
      <p
        v-if="subtitle"
        class="mt-6 max-w-xl text-base leading-relaxed text-bone/85 md:text-lg"
      >
        {{ subtitle }}
      </p>

      <NuxtLink
        v-if="ctaLabel && ctaTo"
        :to="ctaTo"
        class="mt-10 inline-block border-b border-bone pb-1 text-sm uppercase tracking-widest2 text-bone transition-colors duration-300 ease-editorial hover:border-clay hover:text-clay"
      >
        {{ ctaLabel }}
      </NuxtLink>
    </div>
  </section>
</template>
