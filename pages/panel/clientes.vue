<script setup lang="ts">
definePageMeta({ layout: 'studio' })
useHead({ title: 'Clientes — Panel' })

const supabase = useSupabaseClient()

interface CustomerRow {
  id: string
  full_name: string
  email: string
  phone: string | null
  created_at: string
}

const { data: customers, pending, error } = await useAsyncData('panel-customers', async () => {
  const { data, error: err } = await supabase
    .from('customers')
    .select('id, full_name, email, phone, created_at')
    .order('created_at', { ascending: false })
  if (err) throw err
  return (data ?? []) as CustomerRow[]
})

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })
</script>

<template>
  <div>
    <header class="mb-8">
      <p class="eyebrow">Gestión</p>
      <h1 class="mt-1 font-serif text-3xl tracking-tight text-ink">Clientes</h1>
    </header>

    <p v-if="error" class="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
      No se pudieron cargar los clientes.
    </p>

    <div v-else class="overflow-hidden rounded-lg border border-ink/10 bg-white">
      <table class="w-full text-left text-sm">
        <thead class="border-b border-ink/10 text-xs uppercase tracking-widest2 text-engobe">
          <tr>
            <th class="px-5 py-3 font-medium">Nombre</th>
            <th class="px-5 py-3 font-medium">Email</th>
            <th class="px-5 py-3 font-medium">Teléfono</th>
            <th class="px-5 py-3 font-medium">Alta</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="pending">
            <td colspan="4" class="px-5 py-8 text-center text-engobe">Cargando…</td>
          </tr>
          <tr v-else-if="!customers?.length">
            <td colspan="4" class="px-5 py-8 text-center text-engobe">Aún no hay clientes.</td>
          </tr>
          <tr
            v-for="c in customers"
            v-else
            :key="c.id"
            class="border-b border-ink/5 last:border-0 transition-colors hover:bg-stone/20"
          >
            <td class="px-5 py-3 font-medium text-ink">{{ c.full_name }}</td>
            <td class="px-5 py-3 text-engobe">{{ c.email }}</td>
            <td class="px-5 py-3 text-engobe">{{ c.phone ?? '—' }}</td>
            <td class="px-5 py-3 text-engobe">{{ formatDate(c.created_at) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
