<script setup lang="ts">
const nav = [
  { label: 'Catálogo', to: '/catalogo' },
  { label: 'Colecciones', to: '/colecciones' },
  { label: 'Sobre nosotras', to: '/sobre-nosotras' },
  { label: 'Contacto', to: '/contacto' },
]

const open = ref(false)
const route = useRoute()

// Cierra el menú móvil al navegar
watch(
  () => route.fullPath,
  () => {
    open.value = false
  },
)
</script>

<template>
  <header class="sticky top-0 z-40 border-b border-ink/10 bg-bone/80 backdrop-blur">
    <div class="container-editorial flex h-16 items-center justify-between md:h-20">
      <NuxtLink to="/" class="font-serif text-xl tracking-tight text-ink md:text-2xl">
       StudioSeptiembre
      </NuxtLink>

      <!-- Navegación escritorio -->
      <nav class="hidden items-center gap-10 md:flex">
        <NuxtLink
          v-for="item in nav"
          :key="item.to"
          :to="item.to"
          class="text-sm text-engobe transition-colors duration-300 ease-editorial hover:text-ink"
          active-class="text-ink"
        >
          {{ item.label }}
        </NuxtLink>
        <NuxtLink
          to="/pedido"
          class="border-b border-ink pb-0.5 text-sm uppercase tracking-widest2 text-ink transition-colors hover:text-accent"
        >
          Encargar
        </NuxtLink>
      </nav>

      <!-- Botón menú móvil -->
      <button
        type="button"
        class="flex h-10 w-10 items-center justify-center md:hidden"
        :aria-expanded="open"
        aria-label="Abrir menú"
        @click="open = !open"
      >
        <span class="relative block h-3 w-6">
          <span
            class="absolute left-0 top-0 h-px w-6 bg-ink transition-transform duration-300"
            :class="open ? 'translate-y-1.5 rotate-45' : ''"
          />
          <span
            class="absolute bottom-0 left-0 h-px w-6 bg-ink transition-transform duration-300"
            :class="open ? '-translate-y-1.5 -rotate-45' : ''"
          />
        </span>
      </button>
    </div>

    <!-- Menú móvil -->
    <Transition
      enter-active-class="transition-all duration-300 ease-editorial"
      enter-from-class="opacity-0 -translate-y-2"
      leave-active-class="transition-all duration-200 ease-editorial"
      leave-to-class="opacity-0 -translate-y-2"
    >
      <nav v-if="open" class="border-t border-ink/10 md:hidden">
        <div class="container-editorial flex flex-col py-4">
          <NuxtLink
            v-for="item in nav"
            :key="item.to"
            :to="item.to"
            class="py-3 text-engobe transition-colors hover:text-ink"
            active-class="text-ink"
          >
            {{ item.label }}
          </NuxtLink>
          <NuxtLink
            to="/pedido"
            class="mt-2 py-3 text-sm uppercase tracking-widest2 text-ink"
          >
            Encargar →
          </NuxtLink>
        </div>
      </nav>
    </Transition>
  </header>
</template>
