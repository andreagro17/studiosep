<script setup lang="ts">
const year = new Date().getFullYear()

const nav = [
  { label: 'Catálogo', to: '/catalogo' },
  { label: 'Colecciones', to: '/colecciones' },
  { label: 'Sobre nosotras', to: '/sobre-nosotras' },
  { label: 'Contacto', to: '/contacto' },
  { label: 'Encargar', to: '/pedido' },
]
</script>

<template>
  <footer class="mt-24 border-t border-ink/10 bg-bone">
    <div class="container-editorial py-16 md:py-20">
      <div class="grid gap-12 md:grid-cols-12">
        <!-- Marca -->
        <div class="md:col-span-5">
          <NuxtLink to="/" class="font-serif text-2xl tracking-tight text-ink">
           StudioSeptiembre
          </NuxtLink>
          <p class="mt-4 max-w-sm text-sm leading-relaxed text-engobe">
            Cerámica artesanal hecha a mano en Madrid. Piezas únicas bajo
            pedido y colecciones de envío inmediato.
          </p>
        </div>

        <!-- Navegación -->
        <nav class="md:col-span-4">
          <p class="eyebrow">Navegar</p>
          <ul class="mt-4 flex flex-col gap-3">
            <li v-for="item in nav" :key="item.to">
              <NuxtLink
                :to="item.to"
                class="text-sm text-engobe transition-colors duration-300 ease-editorial hover:text-ink"
              >
                {{ item.label }}
              </NuxtLink>
            </li>
          </ul>
        </nav>

        <!-- Contacto -->
        <div class="md:col-span-3">
          <p class="eyebrow">Estudio</p>
          <address class="mt-4 flex flex-col gap-3 text-sm not-italic text-engobe">
            <span>Lavapiés, Madrid</span>
            <a
              href="mailto:hola@studioset.es"
              class="transition-colors hover:text-ink"
            >
              hola@studioset.es
            </a>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              class="transition-colors hover:text-ink"
            >
              Instagram
            </a>
          </address>
        </div>
      </div>

      <div class="rule mt-16" />

      <div
        class="mt-8 flex flex-col gap-2 text-xs text-engobe md:flex-row md:items-center md:justify-between"
      >
        <span>© {{ year }}StudioSeptiembre · Hecho a mano en Madrid</span>
        <span class="uppercase tracking-widest2">Cerámica · Slow craft</span>
      </div>
    </div>
  </footer>
</template>
