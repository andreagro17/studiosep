<script setup lang="ts">
const error = useError()
</script>

<template>
  <div class="flex min-h-screen flex-col items-center justify-center bg-bone px-6 text-center">
    <p class="eyebrow mb-4">Error {{ error?.statusCode }}</p>
    <h1 class="font-serif text-4xl text-ink md:text-5xl">
      Esta pieza no existe
    </h1>
    <p class="mt-4 max-w-md text-engobe">
      La página que buscas no está en el estudio. Quizá ya encontró su hogar.
    </p>
    <NuxtLink
      to="/"
      class="mt-8 border-b border-ink pb-1 text-sm uppercase tracking-widest2 transition-colors hover:text-accent"
    >
      Volver al inicio
    </NuxtLink>
  </div>
</template>
