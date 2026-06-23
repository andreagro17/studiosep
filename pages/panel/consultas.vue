<script setup lang="ts">
definePageMeta({ layout: 'studio' })
useHead({ title: 'Consultas — Panel' })

const supabase = useSupabaseClient()

interface InquiryRow {
  id: string
  name: string
  email: string
  message: string
  handled: boolean
  created_at: string
}

const { data: inquiries, pending, error, refresh } = await useAsyncData(
  'panel-inquiries',
  async () => {
    const { data, error: err } = await supabase
      .from('inquiries')
      .select('id, name, email, message, handled, created_at')
      .order('created_at', { ascending: false })
    if (err) throw err
    return (data ?? []) as InquiryRow[]
  },
  { getCachedData: () => undefined },
)

const formatDate = (iso: string) =>
  new Date(iso).toLocaleString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

const updatingId = ref<string | null>(null)

async function toggleHandled(item: InquiryRow) {
  updatingId.value = item.id
  const { error: err } = await supabase
    .from('inquiries')
    .update({ handled: !item.handled })
    .eq('id', item.id)
  updatingId.value = null
  if (!err) await refresh()
}
</script>

<template>
  <div>
    <header class="mb-8">
      <p class="eyebrow">Gestión</p>
      <h1 class="mt-1 font-serif text-3xl tracking-tight text-ink">Consultas</h1>
      <p class="mt-1 text-sm text-engobe">Mensajes recibidos desde el formulario de contacto.</p>
    </header>

    <p v-if="error" class="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
      No se pudieron cargar las consultas.
    </p>

    <p v-else-if="pending" class="text-engobe">Cargando…</p>

    <p v-else-if="!inquiries?.length" class="rounded-lg border border-ink/10 bg-white px-5 py-8 text-center text-engobe">
      Aún no hay consultas.
    </p>

    <ul v-else class="space-y-4">
      <li
        v-for="item in inquiries"
        :key="item.id"
        class="rounded-lg border border-ink/10 bg-white p-5"
        :class="{ 'opacity-60': item.handled }"
      >
        <div class="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p class="font-medium text-ink">{{ item.name }}</p>
            <a :href="`mailto:${item.email}`" class="text-sm text-accent hover:underline">
              {{ item.email }}
            </a>
          </div>
          <div class="flex items-center gap-3 sm:flex-col sm:items-end">
            <span class="text-xs text-engobe">{{ formatDate(item.created_at) }}</span>
            <button
              type="button"
              class="rounded-full px-3 py-1 text-xs transition-colors"
              :class="item.handled
                ? 'bg-stone/50 text-engobe hover:bg-stone/70'
                : 'bg-ink text-bone hover:bg-accent'"
              :disabled="updatingId === item.id"
              @click="toggleHandled(item)"
            >
              {{ updatingId === item.id ? '…' : item.handled ? 'Gestionada ✓' : 'Marcar gestionada' }}
            </button>
          </div>
        </div>
        <p class="mt-3 whitespace-pre-line text-sm text-ink">{{ item.message }}</p>
      </li>
    </ul>
  </div>
</template>
