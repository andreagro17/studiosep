<script setup lang="ts">
// Página de retorno tras autenticación (magic link / OAuth si se usan más
// adelante). Para login por contraseña no se llega aquí, pero el módulo la
// requiere como `callback`. Una vez con sesión, redirige al panel.
definePageMeta({ layout: false })

const user = useSupabaseUser()
const router = useRouter()

watchEffect(() => {
  if (user.value) router.replace('/panel')
})
</script>

<template>
  <div class="flex min-h-screen items-center justify-center bg-bone px-6">
    <p class="text-sm text-engobe">Confirmando sesión…</p>
  </div>
</template>
