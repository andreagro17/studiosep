<script setup lang="ts">
import { PRODUCTION_STEPS, type ProductionStatus } from '~/types'
import { formatPrice } from '~/lib/format'

definePageMeta({ layout: 'studio' })
useHead({ title: 'Pedidos — Panel' })

const supabase = useSupabaseClient()

interface OrderRow {
  id: string
  order_number: string
  status: ProductionStatus
  type: 'stock' | 'commission'
  total_cents: number
  requested_at: string
  due_date: string | null
  customer: { full_name: string; email: string } | null
}

const { data: orders, pending, error } = await useAsyncData('panel-orders', async () => {
  const { data, error: err } = await supabase
    .from('orders')
    .select(
      'id, order_number, status, type, total_cents, requested_at, due_date, customer:customers(full_name, email)',
    )
    .order('requested_at', { ascending: false })
  if (err) throw err
  return (data ?? []) as unknown as OrderRow[]
}, { getCachedData: () => undefined })

const statusLabel = (s: ProductionStatus) =>
  PRODUCTION_STEPS.find((x) => x.value === s)?.label ?? s

const typeLabel = (t: 'stock' | 'commission') =>
  t === 'commission' ? 'Encargo' : 'Stock'

const formatDate = (iso: string | null) =>
  iso ? new Date(iso).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'
</script>

<template>
  <div>
    <header class="mb-8">
      <p class="eyebrow">Gestión</p>
      <h1 class="mt-1 font-serif text-3xl tracking-tight text-ink">Pedidos</h1>
    </header>

    <p v-if="error" class="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
      No se pudieron cargar los pedidos.
    </p>

    <div v-else class="overflow-x-auto rounded-lg border border-ink/10 bg-white">
      <table class="w-full min-w-[640px] text-left text-sm">
        <thead class="border-b border-ink/10 text-xs uppercase tracking-widest2 text-engobe">
          <tr>
            <th class="px-5 py-3 font-medium">Pedido</th>
            <th class="px-5 py-3 font-medium">Cliente</th>
            <th class="px-5 py-3 font-medium">Tipo</th>
            <th class="px-5 py-3 font-medium">Estado</th>
            <th class="px-5 py-3 font-medium">Total</th>
            <th class="px-5 py-3 font-medium">Solicitado</th>
            <th class="px-5 py-3 font-medium">Entrega</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="pending">
            <td colspan="7" class="px-5 py-8 text-center text-engobe">Cargando…</td>
          </tr>
          <tr v-else-if="!orders?.length">
            <td colspan="7" class="px-5 py-8 text-center text-engobe">Aún no hay pedidos.</td>
          </tr>
          <tr
            v-for="order in orders"
            v-else
            :key="order.id"
            class="cursor-pointer border-b border-ink/5 last:border-0 transition-colors hover:bg-stone/20"
            @click="navigateTo(`/panel/pedidos/${order.id}`)"
          >
            <td class="px-5 py-3 font-medium text-ink">{{ order.order_number }}</td>
            <td class="px-5 py-3 text-engobe">{{ order.customer?.full_name ?? '—' }}</td>
            <td class="px-5 py-3 text-engobe">{{ typeLabel(order.type) }}</td>
            <td class="px-5 py-3">
              <span class="inline-block rounded-full bg-stone/50 px-2.5 py-0.5 text-xs text-ink">
                {{ statusLabel(order.status) }}
              </span>
            </td>
            <td class="px-5 py-3 text-ink">{{ formatPrice(order.total_cents, 'EUR') }}</td>
            <td class="px-5 py-3 text-engobe">{{ formatDate(order.requested_at) }}</td>
            <td class="px-5 py-3 text-engobe">{{ formatDate(order.due_date) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
