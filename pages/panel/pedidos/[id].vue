<script setup lang="ts">
import { PRODUCTION_STEPS, type ProductionStatus } from '~/types'
import { formatPrice } from '~/lib/format'

definePageMeta({ layout: 'studio' })

const route = useRoute()
const supabase = useSupabaseClient()
const orderId = computed(() => String(route.params.id))

interface OrderItem {
  id: string
  quantity: number
  unit_price_cents: number
  custom_specs: Record<string, unknown> | null
  product: { name: string; slug: string } | null
  variant: { label: string; type: string } | null
}

interface OrderDetail {
  id: string
  order_number: string
  status: ProductionStatus
  type: 'stock' | 'commission'
  total_cents: number
  notes: string | null
  requested_at: string
  due_date: string | null
  customer: {
    full_name: string
    email: string
    phone: string | null
    address: string | null
  } | null
  items: OrderItem[]
}

const { data: order, pending, error, refresh } = await useAsyncData(
  `panel-order-${orderId.value}`,
  async () => {
    const { data, error: err } = await supabase
      .from('orders')
      .select(
        `id, order_number, status, type, total_cents, notes, requested_at, due_date,
         customer:customers(full_name, email, phone, address),
         items:order_items(id, quantity, unit_price_cents, custom_specs,
           product:products(name, slug),
           variant:product_variants(label, type))`,
      )
      .eq('id', orderId.value)
      .maybeSingle()
    if (err) throw err
    return (data as unknown as OrderDetail) ?? null
  },
  { getCachedData: () => undefined },
)

useHead(() => ({ title: order.value ? `${order.value.order_number} — Panel` : 'Pedido — Panel' }))

const typeLabel = (t: 'stock' | 'commission') => (t === 'commission' ? 'Encargo' : 'Stock')

const formatDate = (iso: string | null) =>
  iso
    ? new Date(iso).toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })
    : '—'

const saving = ref(false)
const saveError = ref('')
const justSaved = ref(false)

async function updateStatus(newStatus: ProductionStatus) {
  if (!order.value || newStatus === order.value.status) return
  saving.value = true
  saveError.value = ''
  justSaved.value = false
  const { error: err } = await supabase
    .from('orders')
    .update({ status: newStatus })
    .eq('id', orderId.value)
  saving.value = false
  if (err) {
    saveError.value = 'No se pudo guardar el estado.'
    return
  }
  await refresh()
  justSaved.value = true
  setTimeout(() => (justSaved.value = false), 2500)
}
</script>

<template>
  <div>
    <NuxtLink
      to="/panel/pedidos"
      class="mb-6 inline-flex items-center gap-1 text-sm text-engobe transition-colors hover:text-ink"
    >
      ← Volver a pedidos
    </NuxtLink>

    <p v-if="error" class="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
      No se pudo cargar el pedido.
    </p>
    <p v-else-if="pending" class="text-engobe">Cargando…</p>
    <p v-else-if="!order" class="text-engobe">Este pedido no existe.</p>

    <div v-else class="space-y-8">
      <header class="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p class="eyebrow">{{ typeLabel(order.type) }}</p>
          <h1 class="mt-1 font-serif text-3xl tracking-tight text-ink">{{ order.order_number }}</h1>
          <p class="mt-1 text-sm text-engobe">Solicitado el {{ formatDate(order.requested_at) }}</p>
        </div>
        <div class="text-right">
          <p class="text-xs uppercase tracking-widest2 text-engobe">Total</p>
          <p class="font-serif text-2xl text-ink">{{ formatPrice(order.total_cents, 'EUR') }}</p>
        </div>
      </header>

      <!-- Estado -->
      <section class="rounded-lg border border-ink/10 bg-white p-6">
        <h2 class="text-xs uppercase tracking-widest2 text-engobe">Estado del pedido</h2>
        <div class="mt-3 flex flex-wrap items-center gap-3">
          <select
            :value="order.status"
            :disabled="saving"
            class="rounded-md border border-ink/15 bg-bone px-3 py-2 text-sm text-ink focus:border-clay focus:outline-none disabled:opacity-60"
            @change="updateStatus(($event.target as HTMLSelectElement).value as ProductionStatus)"
          >
            <option v-for="step in PRODUCTION_STEPS" :key="step.value" :value="step.value">
              {{ step.label }}
            </option>
          </select>
          <span v-if="saving" class="text-sm text-engobe">Guardando…</span>
          <span v-else-if="justSaved" class="text-sm text-green-700">✓ Guardado</span>
          <span v-else-if="saveError" class="text-sm text-red-700">{{ saveError }}</span>
        </div>
        <p class="mt-2 text-xs text-engobe">
          Entrega prevista: {{ formatDate(order.due_date) }}
        </p>
      </section>

      <!-- Cliente -->
      <section class="rounded-lg border border-ink/10 bg-white p-6">
        <h2 class="text-xs uppercase tracking-widest2 text-engobe">Cliente</h2>
        <div v-if="order.customer" class="mt-3 space-y-1 text-sm">
          <p class="font-medium text-ink">{{ order.customer.full_name }}</p>
          <p class="text-engobe">{{ order.customer.email }}</p>
          <p v-if="order.customer.phone" class="text-engobe">{{ order.customer.phone }}</p>
          <p v-if="order.customer.address" class="text-engobe">{{ order.customer.address }}</p>
        </div>
        <p v-else class="mt-3 text-sm text-engobe">Sin datos de cliente.</p>
      </section>

      <!-- Piezas -->
      <section class="rounded-lg border border-ink/10 bg-white p-6">
        <h2 class="text-xs uppercase tracking-widest2 text-engobe">Piezas</h2>
        <ul class="mt-3 divide-y divide-ink/5">
          <li
            v-for="item in order.items"
            :key="item.id"
            class="flex items-start justify-between gap-4 py-3 text-sm"
          >
            <div>
              <p class="font-medium text-ink">{{ item.product?.name ?? 'Pieza' }}</p>
              <p v-if="item.variant" class="text-engobe">{{ item.variant.label }}</p>
              <p class="text-engobe">Cantidad: {{ item.quantity }}</p>
            </div>
            <p class="text-ink">{{ formatPrice(item.unit_price_cents, 'EUR') }}</p>
          </li>
          <li v-if="!order.items?.length" class="py-3 text-sm text-engobe">
            Sin piezas registradas.
          </li>
        </ul>
      </section>

      <!-- Notas -->
      <section v-if="order.notes" class="rounded-lg border border-ink/10 bg-white p-6">
        <h2 class="text-xs uppercase tracking-widest2 text-engobe">Notas</h2>
        <p class="mt-3 whitespace-pre-line text-sm text-ink">{{ order.notes }}</p>
      </section>
    </div>
  </div>
</template>
