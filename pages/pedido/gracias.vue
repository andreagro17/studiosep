<script setup lang="ts">
useHead({ title: 'Solicitud recibida — StudioSeptiembre' })
</script>

<template>
  <div class="container-editorial flex min-h-[60vh] flex-col items-center justify-center py-24 text-center">
    <p class="eyebrow">Solicitud recibida</p>
    <h1 class="mt-4 max-w-2xl font-serif text-4xl font-light leading-tight text-ink md:text-5xl">
      Gracias. Hemos recibido tu solicitud.
    </h1>
    <p class="mt-6 max-w-md leading-relaxed text-engobe">
      Revisaremos los detalles y te escribiremos para confirmar disponibilidad, precio y
      tiempos de producción. Cada pieza empieza con una conversación.
    </p>
    <NuxtLink
      to="/catalogo"
      class="mt-10 inline-block bg-ink px-8 py-4 text-sm uppercase tracking-widest2 text-bone transition-colors duration-300 ease-editorial hover:bg-accent"
    >
      Volver al catálogo
    </NuxtLink>
  </div>
</template>
