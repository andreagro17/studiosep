<script setup lang="ts">
definePageMeta({ layout: 'studio' })
useHead({ title: 'Ajustes — Panel' })

const user = useSupabaseUser()
const supabase = useSupabaseClient()
const router = useRouter()

const config = useRuntimeConfig()
const projectUrl = config.public?.supabase?.url ?? ''

async function logout() {
  await supabase.auth.signOut()
  router.replace('/panel/login')
}
</script>

<template>
  <div>
    <header class="mb-8">
      <p class="eyebrow">Cuenta</p>
      <h1 class="mt-1 font-serif text-3xl tracking-tight text-ink">Ajustes</h1>
    </header>

    <div class="max-w-xl space-y-6">
      <section class="rounded-lg border border-ink/10 bg-white p-6">
        <h2 class="font-serif text-lg text-ink">Sesión</h2>
        <dl class="mt-4 space-y-3 text-sm">
          <div class="flex justify-between">
            <dt class="text-engobe">Usuario</dt>
            <dd class="text-ink">{{ user?.email ?? '—' }}</dd>
          </div>
          <div class="flex justify-between">
            <dt class="text-engobe">Último acceso</dt>
            <dd class="text-ink">
              {{ user?.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString('es-ES') : '—' }}
            </dd>
          </div>
        </dl>
        <button
          type="button"
          class="mt-6 rounded-md border border-ink/20 px-4 py-2 text-sm text-ink transition-colors hover:bg-stone/40"
          @click="logout"
        >
          Cerrar sesión
        </button>
      </section>

      <section class="rounded-lg border border-ink/10 bg-white p-6">
        <h2 class="font-serif text-lg text-ink">Proyecto</h2>
        <dl class="mt-4 space-y-3 text-sm">
          <div class="flex justify-between gap-4">
            <dt class="text-engobe">Supabase</dt>
            <dd class="truncate text-ink">{{ projectUrl || '—' }}</dd>
          </div>
        </dl>
        <p class="mt-4 text-xs leading-relaxed text-engobe">
          La gestión de piezas, colecciones y pedidos se realiza desde sus secciones
          correspondientes. La edición y alta de contenido se añadirá en próximas versiones.
        </p>
      </section>
    </div>
  </div>
</template>
