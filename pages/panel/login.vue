<script setup lang="ts">
// El login usa su propio layout mínimo (sin barra lateral del panel).
definePageMeta({ layout: false })

const supabase = useSupabaseClient()
const user = useSupabaseUser()
const router = useRouter()

const email = ref('')
const password = ref('')
const loading = ref(false)
const errorMsg = ref('')

// Si ya hay sesión, entra directo al panel.
watchEffect(() => {
  if (user.value) router.replace('/panel')
})

async function onSubmit() {
  errorMsg.value = ''
  loading.value = true
  const { error } = await supabase.auth.signInWithPassword({
    email: email.value,
    password: password.value,
  })
  loading.value = false
  if (error) {
    errorMsg.value =
      error.message === 'Invalid login credentials'
        ? 'Correo o contraseña incorrectos.'
        : error.message
    return
  }
  router.replace('/panel')
}
</script>

<template>
  <div class="flex min-h-screen items-center justify-center bg-bone px-6">
    <div class="w-full max-w-sm">
      <NuxtLink to="/" class="block text-center font-serif text-2xl tracking-tight text-ink">
        StudioSeptiembre
      </NuxtLink>
      <p class="eyebrow mt-2 text-center">Panel privado</p>

      <form class="mt-10 flex flex-col gap-4" @submit.prevent="onSubmit">
        <label class="flex flex-col gap-1">
          <span class="text-xs uppercase tracking-widest2 text-engobe">Correo</span>
          <input
            v-model="email"
            type="email"
            autocomplete="email"
            required
            class="rounded-md border border-ink/15 bg-white px-3 py-2 text-sm text-ink outline-none transition-colors focus:border-ink/40"
          />
        </label>

        <label class="flex flex-col gap-1">
          <span class="text-xs uppercase tracking-widest2 text-engobe">Contraseña</span>
          <input
            v-model="password"
            type="password"
            autocomplete="current-password"
            required
            class="rounded-md border border-ink/15 bg-white px-3 py-2 text-sm text-ink outline-none transition-colors focus:border-ink/40"
          />
        </label>

        <p v-if="errorMsg" class="text-sm text-red-700">{{ errorMsg }}</p>

        <button
          type="submit"
          :disabled="loading"
          class="mt-2 rounded-md bg-ink px-4 py-2.5 text-sm text-bone transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {{ loading ? 'Entrando…' : 'Entrar' }}
        </button>
      </form>

      <NuxtLink to="/" class="mt-8 block text-center text-sm text-engobe hover:text-ink">
        ← Volver a la web
      </NuxtLink>
    </div>
  </div>
</template>
