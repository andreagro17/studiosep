<script setup lang="ts">
const nav = [
  { label: 'Resumen', to: '/panel' },
  { label: 'Pedidos', to: '/panel/pedidos' },
  { label: 'Consultas', to: '/panel/consultas' },
  { label: 'Clientes', to: '/panel/clientes' },
  { label: 'Productos', to: '/panel/productos' },
  { label: 'Colecciones', to: '/panel/colecciones' },
  { label: 'Ajustes', to: '/panel/ajustes' },
]

const supabase = useSupabaseClient()
const user = useSupabaseUser()
const router = useRouter()
const route = useRoute()

const mobileOpen = ref(false)

// Cerrar el menú móvil al cambiar de página
watch(() => route.fullPath, () => (mobileOpen.value = false))

async function logout() {
  await supabase.auth.signOut()
  router.replace('/panel/login')
}
</script>

<template>
  <div class="flex min-h-screen bg-bone">
    <aside class="hidden w-60 shrink-0 border-r border-ink/10 px-6 py-8 md:block">
      <NuxtLink to="/" class="font-serif text-xl tracking-tight text-ink">
       StudioSeptiembre
      </NuxtLink>
      <p class="eyebrow mt-1">Panel privado</p>

      <nav class="mt-10 flex flex-col gap-1">
        <NuxtLink
          v-for="item in nav"
          :key="item.to"
          :to="item.to"
          class="rounded-md px-3 py-2 text-sm text-engobe transition-colors hover:bg-stone/40 hover:text-ink"
          active-class="bg-stone/50 text-ink"
        >
          {{ item.label }}
        </NuxtLink>
      </nav>
    </aside>

    <div class="flex flex-1 flex-col">
      <header class="flex items-center justify-between gap-3 border-b border-ink/10 px-4 py-4 sm:px-6">
        <div class="flex items-center gap-3">
          <button
            type="button"
            class="-ml-1 rounded-md p-1.5 text-ink transition-colors hover:bg-stone/40 md:hidden"
            :aria-expanded="mobileOpen"
            aria-label="Abrir menú"
            @click="mobileOpen = !mobileOpen"
          >
            <svg v-if="!mobileOpen" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round">
              <path d="M4 7h16M4 12h16M4 17h16" />
            </svg>
            <svg v-else width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
          <span class="text-sm text-engobe">Estudio · Madrid</span>
        </div>
        <div class="flex items-center gap-3 sm:gap-5">
          <span v-if="user?.email" class="hidden text-sm text-engobe lg:inline">
            {{ user.email }}
          </span>
          <NuxtLink to="/" class="hidden text-sm text-engobe transition-colors hover:text-ink sm:inline">
            Ver web pública →
          </NuxtLink>
          <button
            type="button"
            class="text-sm text-engobe transition-colors hover:text-ink"
            @click="logout"
          >
            Cerrar sesión
          </button>
        </div>
      </header>

      <!-- Navegación móvil -->
      <nav
        v-show="mobileOpen"
        class="border-b border-ink/10 bg-bone px-4 py-3 md:hidden"
      >
        <NuxtLink
          v-for="item in nav"
          :key="item.to"
          :to="item.to"
          class="block rounded-md px-3 py-2 text-sm text-engobe transition-colors hover:bg-stone/40 hover:text-ink"
          active-class="bg-stone/50 text-ink"
        >
          {{ item.label }}
        </NuxtLink>
        <NuxtLink to="/" class="mt-1 block rounded-md px-3 py-2 text-sm text-engobe hover:text-ink sm:hidden">
          Ver web pública →
        </NuxtLink>
      </nav>

      <main class="flex-1 px-4 py-6 sm:px-6 sm:py-8">
        <slot />
      </main>
    </div>
  </div>
</template>
