<script setup lang="ts">
const nav = [
  { label: 'Resumen', to: '/panel' },
  { label: 'Pedidos', to: '/panel/pedidos' },
  { label: 'Clientes', to: '/panel/clientes' },
  { label: 'Productos', to: '/panel/productos' },
  { label: 'Colecciones', to: '/panel/colecciones' },
  { label: 'Ajustes', to: '/panel/ajustes' },
]

const supabase = useSupabaseClient()
const user = useSupabaseUser()
const router = useRouter()

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
      <header class="flex items-center justify-between border-b border-ink/10 px-6 py-4">
        <span class="text-sm text-engobe">Estudio · Madrid</span>
        <div class="flex items-center gap-5">
          <span v-if="user?.email" class="hidden text-sm text-engobe sm:inline">
            {{ user.email }}
          </span>
          <NuxtLink to="/" class="text-sm text-engobe transition-colors hover:text-ink">
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
      <main class="flex-1 px-6 py-8">
        <slot />
      </main>
    </div>
  </div>
</template>
