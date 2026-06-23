<script setup lang="ts">
import { PRODUCTION_STEPS, type ProductionStatus } from '~/types'

definePageMeta({ layout: 'studio' })

const supabase = useSupabaseClient()

interface OrderRow {
  id: string
  order_number: string
  status: ProductionStatus
  requested_at: string
  customer: { full_name: string } | null
}

// Datos del panel: pedidos recientes + totales. Se cargan en SSR.
const { data, pending, error } = await useAsyncData('panel-overview', async () => {
  const [recent, productsCount, ordersCount, inquiriesCount] = await Promise.all([
    supabase
      .from('orders')
      .select('id, order_number, status, requested_at, customer:customers(full_name)')
      .order('requested_at', { ascending: false })
      .limit(8),
    supabase.from('products').select('id', { count: 'exact', head: true }),
    supabase.from('orders').select('id', { count: 'exact', head: true }),
    supabase.from('inquiries').select('id', { count: 'exact', head: true }),
  ])

  return {
    recentOrders: (recent.data ?? []) as unknown as OrderRow[],
    productsCount: productsCount.count ?? 0,
    ordersCount: ordersCount.count ?? 0,
    inquiriesCount: inquiriesCount.count ?? 0,
  }
}, { getCachedData: () => undefined })

// Pedidos en curso = todos los que no están entregados.
const activeOrders = computed(
  () => data.value?.recentOrders.filter((o) => o.status !== 'entregado').length ?? 0,
)

const stats = computed(() => [
  { label: 'Pedidos totales', value: data.value?.ordersCount ?? 0 },
  { label: 'En curso (recientes)', value: activeOrders.value },
  { label: 'Piezas en catálogo', value: data.value?.productsCount ?? 0 },
  { label: 'Consultas', value: data.value?.inquiriesCount ?? 0 },
])

const statusLabel = (s: ProductionStatus) =>
  PRODUCTION_STEPS.find((step) => step.value === s)?.label ?? s

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })
</script>

<template>
  <div>
    <header class="mb-8">
      <p class="eyebrow">Resumen</p>
      <h1 class="mt-1 font-serif text-3xl tracking-tight text-ink">Estudio</h1>
    </header>

    <p v-if="error" class="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
      No se pudieron cargar los datos. Revisa la conexión con Supabase.
    </p>

    <template v-else>
      <!-- Tarjetas de métricas -->
      <section class="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div
          v-for="stat in stats"
          :key="stat.label"
          class="rounded-lg border border-ink/10 bg-white px-5 py-6"
        >
          <p class="text-3xl font-serif text-ink">
            <span v-if="pending" class="text-engobe/40">—</span>
            <span v-else>{{ stat.value }}</span>
          </p>
          <p class="mt-1 text-xs uppercase tracking-widest2 text-engobe">{{ stat.label }}</p>
        </div>
      </section>

      <!-- Pedidos recientes -->
      <section class="mt-12">
        <div class="mb-4 flex items-center justify-between">
          <h2 class="font-serif text-xl text-ink">Pedidos recientes</h2>
          <NuxtLink to="/panel/pedidos" class="text-sm text-engobe hover:text-ink">
            Ver todos →
          </NuxtLink>
        </div>

        <!-- Móvil: tarjetas -->
        <div class="space-y-3 sm:hidden">
          <p v-if="pending" class="rounded-lg border border-ink/10 bg-white px-5 py-8 text-center text-engobe">
            Cargando…
          </p>
          <p
            v-else-if="!data?.recentOrders.length"
            class="rounded-lg border border-ink/10 bg-white px-5 py-8 text-center text-engobe"
          >
            Aún no hay pedidos.
          </p>
          <NuxtLink
            v-for="order in data?.recentOrders"
            v-else
            :key="order.id"
            :to="`/panel/pedidos/${order.id}`"
            class="block rounded-lg border border-ink/10 bg-white p-4 transition-colors hover:bg-stone/20"
          >
            <div class="flex items-center justify-between gap-3">
              <span class="font-medium text-ink">{{ order.order_number }}</span>
              <span class="inline-block rounded-full bg-stone/50 px-2.5 py-0.5 text-xs text-ink">
                {{ statusLabel(order.status) }}
              </span>
            </div>
            <div class="mt-2 flex items-center justify-between gap-3 text-sm text-engobe">
              <span>{{ order.customer?.full_name ?? '—' }}</span>
              <span>{{ formatDate(order.requested_at) }}</span>
            </div>
          </NuxtLink>
        </div>

        <!-- Escritorio: tabla -->
        <div class="hidden rounded-lg border border-ink/10 bg-white sm:block">
          <table class="w-full text-left text-sm">
            <thead class="border-b border-ink/10 text-xs uppercase tracking-widest2 text-engobe">
              <tr>
                <th class="px-5 py-3 font-medium">Pedido</th>
                <th class="px-5 py-3 font-medium">Cliente</th>
                <th class="px-5 py-3 font-medium">Estado</th>
                <th class="px-5 py-3 font-medium">Fecha</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="pending">
                <td colspan="4" class="px-5 py-8 text-center text-engobe">Cargando…</td>
              </tr>
              <tr v-else-if="!data?.recentOrders.length">
                <td colspan="4" class="px-5 py-8 text-center text-engobe">
                  Aún no hay pedidos.
                </td>
              </tr>
              <tr
                v-for="order in data?.recentOrders"
                v-else
                :key="order.id"
                class="cursor-pointer border-b border-ink/5 last:border-0 transition-colors hover:bg-stone/20"
                @click="navigateTo(`/panel/pedidos/${order.id}`)"
              >
                <td class="px-5 py-3 font-medium text-ink">{{ order.order_number }}</td>
                <td class="px-5 py-3 text-engobe">{{ order.customer?.full_name ?? '—' }}</td>
                <td class="px-5 py-3">
                  <span
                    class="inline-block rounded-full bg-stone/50 px-2.5 py-0.5 text-xs text-ink"
                  >
                    {{ statusLabel(order.status) }}
                  </span>
                </td>
                <td class="px-5 py-3 text-engobe">{{ formatDate(order.requested_at) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </template>
  </div>
</template>
