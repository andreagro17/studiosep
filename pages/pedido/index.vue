<script setup lang="ts">
useHead({ title: 'Solicitar un pedido — StudioSeptiembre' })

const route = useRoute()
const router = useRouter()

const { data: products } = useProducts()

const preselectedSlug = route.query.pieza ? String(route.query.pieza) : ''

const form = reactive({
  productSlug: preselectedSlug,
  variant: '',
  name: '',
  email: '',
  notes: '',
})

const selectedProduct = computed(() =>
  (products.value ?? []).find((p) => p.slug === form.productSlug),
)

function submit() {
  // TODO: enviar a /api/pedidos (Supabase) más adelante.
  router.push('/pedido/gracias')
}
</script>

<template>
  <div class="container-editorial py-16 md:py-24">
    <div class="mx-auto max-w-2xl">
      <p class="eyebrow">Solicitud de pedido</p>
      <h1 class="mt-4 font-serif text-4xl font-light leading-tight text-ink md:text-5xl">
        Cuéntanos qué pieza imaginas
      </h1>
      <p class="mt-6 leading-relaxed text-engobe">
        Esto no es una compra inmediata: es el inicio de una conversación. Revisaremos tu
        solicitud y te confirmaremos disponibilidad, precio y tiempos antes de empezar.
      </p>

      <form class="mt-12 space-y-8" @submit.prevent="submit">
        <!-- Pieza -->
        <div>
          <label for="pieza" class="text-xs uppercase tracking-widest2 text-engobe">Pieza</label>
          <select
            id="pieza"
            v-model="form.productSlug"
            required
            class="mt-2 w-full border-b border-ink/20 bg-transparent py-2 text-ink outline-none transition-colors focus:border-ink"
          >
            <option value="" disabled>Elige una pieza</option>
            <option v-for="p in (products ?? [])" :key="p.id" :value="p.slug">{{ p.name }}</option>
          </select>
        </div>

        <!-- Variante (si la pieza tiene) -->
        <div v-if="selectedProduct?.variants?.length">
          <label for="variante" class="text-xs uppercase tracking-widest2 text-engobe">
            {{ selectedProduct.variants[0].type }}
          </label>
          <select
            id="variante"
            v-model="form.variant"
            class="mt-2 w-full border-b border-ink/20 bg-transparent py-2 text-ink outline-none transition-colors focus:border-ink"
          >
            <option value="">Sin preferencia</option>
            <option v-for="v in selectedProduct.variants" :key="v.id" :value="v.label">
              {{ v.label }}
            </option>
          </select>
        </div>

        <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label for="name" class="text-xs uppercase tracking-widest2 text-engobe">Nombre</label>
            <input
              id="name"
              v-model="form.name"
              type="text"
              required
              class="mt-2 w-full border-b border-ink/20 bg-transparent py-2 text-ink outline-none transition-colors focus:border-ink"
            />
          </div>
          <div>
            <label for="email" class="text-xs uppercase tracking-widest2 text-engobe">Email</label>
            <input
              id="email"
              v-model="form.email"
              type="email"
              required
              class="mt-2 w-full border-b border-ink/20 bg-transparent py-2 text-ink outline-none transition-colors focus:border-ink"
            />
          </div>
        </div>

        <div>
          <label for="notes" class="text-xs uppercase tracking-widest2 text-engobe">
            Detalles (medidas, colores, fechas…)
          </label>
          <textarea
            id="notes"
            v-model="form.notes"
            rows="4"
            class="mt-2 w-full resize-none border-b border-ink/20 bg-transparent py-2 text-ink outline-none transition-colors focus:border-ink"
          />
        </div>

        <button
          type="submit"
          class="inline-block bg-ink px-8 py-4 text-sm uppercase tracking-widest2 text-bone transition-colors duration-300 ease-editorial hover:bg-accent"
        >
          Enviar solicitud
        </button>
      </form>
    </div>
  </div>
</template>
