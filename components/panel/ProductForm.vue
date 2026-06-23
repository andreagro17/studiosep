<script setup lang="ts">
import { formatPrice } from '~/lib/format'
import type {
  AdminImage,
  AdminDimension,
  AdminVariant,
} from '~/composables/useProductAdmin'

const props = defineProps<{ productId: string | null }>()

const {
  fetchCollectionOptions,
  fetchProduct,
  saveProduct,
  deleteProduct,
  uploadImage,
  deleteImage,
  setPrimaryImage,
  publicUrl,
} = useProductAdmin()

const isEditing = computed(() => props.productId !== null)

const form = reactive(emptyProductForm())
const dimensions = ref<AdminDimension[]>([])
const variants = ref<AdminVariant[]>([])
const images = ref<AdminImage[]>([])
const collections = ref<{ id: string; title: string }[]>([])

const loading = ref(true)
const saving = ref(false)
const uploading = ref(false)
const errorMsg = ref('')
const okMsg = ref('')

const priceEuros = computed({
  get: () => (form.price_cents / 100).toFixed(2),
  set: (v: string) => {
    const n = Number.parseFloat(v.replace(',', '.'))
    form.price_cents = Number.isFinite(n) ? Math.round(n * 100) : 0
  },
})

// Mantiene el slug sincronizado con el nombre mientras no se edite a mano
const slugTouched = ref(false)
watch(
  () => form.name,
  (name) => {
    if (!slugTouched.value && !isEditing.value) form.slug = slugify(name)
  },
)

onMounted(async () => {
  try {
    collections.value = await fetchCollectionOptions()
    if (props.productId) {
      const data = await fetchProduct(props.productId)
      Object.assign(form, data.form)
      dimensions.value = data.dimensions
      variants.value = data.variants
      images.value = data.images
      slugTouched.value = true
    }
  } catch (e) {
    errorMsg.value = errMessage(e)
  } finally {
    loading.value = false
  }
})

function errMessage(e: unknown): string {
  if (e && typeof e === 'object' && 'message' in e) return String((e as { message: unknown }).message)
  return 'Ha ocurrido un error.'
}

function addDimension() {
  dimensions.value.push({ label: '', value_cm: 0 })
}
function removeDimension(i: number) {
  dimensions.value.splice(i, 1)
}
function addVariant() {
  variants.value.push({
    type: 'color',
    label: '',
    price_delta_cents: 0,
    stock_quantity: null,
    position: variants.value.length,
  })
}
function removeVariant(i: number) {
  variants.value.splice(i, 1)
}

async function onSave() {
  errorMsg.value = ''
  okMsg.value = ''
  if (!form.name.trim()) {
    errorMsg.value = 'El nombre es obligatorio.'
    return
  }
  saving.value = true
  try {
    const id = await saveProduct(form, dimensions.value, variants.value)
    if (!isEditing.value) {
      // Recién creado: ir a la pantalla de edición para poder subir fotos
      await navigateTo(`/panel/productos/${id}`)
      return
    }
    okMsg.value = 'Cambios guardados.'
  } catch (e) {
    errorMsg.value = errMessage(e)
  } finally {
    saving.value = false
  }
}

async function onDelete() {
  if (!props.productId) return
  if (!confirm('¿Eliminar esta pieza y todas sus fotos? Esta acción no se puede deshacer.')) return
  saving.value = true
  try {
    await deleteProduct(props.productId)
    await navigateTo('/panel/productos')
  } catch (e) {
    errorMsg.value = errMessage(e)
    saving.value = false
  }
}

async function onFilesSelected(event: Event) {
  const input = event.target as HTMLInputElement
  if (!input.files?.length || !props.productId) return
  uploading.value = true
  errorMsg.value = ''
  try {
    for (const file of Array.from(input.files)) {
      const isPrimary = images.value.length === 0
      const img = await uploadImage(props.productId, form.slug, file, {
        isPrimary,
        position: images.value.length,
      })
      images.value.push(img)
    }
  } catch (e) {
    errorMsg.value = errMessage(e)
  } finally {
    uploading.value = false
    input.value = ''
  }
}

async function onRemoveImage(img: AdminImage) {
  if (!confirm('¿Eliminar esta foto?')) return
  try {
    await deleteImage(img)
    images.value = images.value.filter((i) => i.id !== img.id)
  } catch (e) {
    errorMsg.value = errMessage(e)
  }
}

async function onSetPrimary(img: AdminImage) {
  if (!props.productId) return
  try {
    await setPrimaryImage(props.productId, img.id)
    images.value = images.value.map((i) => ({ ...i, is_primary: i.id === img.id }))
  } catch (e) {
    errorMsg.value = errMessage(e)
  }
}
</script>

<template>
  <div>
    <header class="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <NuxtLink to="/panel/productos" class="text-xs text-engobe hover:text-ink">← Productos</NuxtLink>
        <h1 class="mt-1 font-serif text-3xl tracking-tight text-ink">
          {{ isEditing ? form.name || 'Editar pieza' : 'Nueva pieza' }}
        </h1>
      </div>
      <div class="flex items-center gap-3">
        <button
          v-if="isEditing"
          type="button"
          class="rounded-md border border-red-200 px-4 py-2 text-sm text-red-700 transition-colors hover:bg-red-50"
          :disabled="saving"
          @click="onDelete"
        >
          Eliminar
        </button>
        <button
          type="button"
          class="rounded-md bg-ink px-5 py-2 text-sm text-bone transition-colors hover:bg-accent disabled:opacity-50"
          :disabled="saving || loading"
          @click="onSave"
        >
          {{ saving ? 'Guardando…' : isEditing ? 'Guardar' : 'Crear pieza' }}
        </button>
      </div>
    </header>

    <p v-if="errorMsg" class="mb-4 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">{{ errorMsg }}</p>
    <p v-if="okMsg" class="mb-4 rounded-md bg-green-50 px-4 py-3 text-sm text-green-800">{{ okMsg }}</p>

    <p v-if="loading" class="text-engobe">Cargando…</p>

    <div v-else class="grid gap-8 lg:grid-cols-3">
      <!-- Columna principal: datos -->
      <div class="space-y-6 lg:col-span-2">
        <section class="space-y-4 rounded-lg border border-ink/10 bg-white p-6">
          <h2 class="font-serif text-lg text-ink">Datos de la pieza</h2>

          <label class="block">
            <span class="mb-1 block text-xs uppercase tracking-widest2 text-engobe">Nombre</span>
            <input
              v-model="form.name"
              type="text"
              class="w-full rounded-md border border-ink/15 px-3 py-2 text-sm focus:border-ink focus:outline-none"
              placeholder="Jarrón Alba"
            />
          </label>

          <label class="block">
            <span class="mb-1 block text-xs uppercase tracking-widest2 text-engobe">Slug (URL)</span>
            <input
              v-model="form.slug"
              type="text"
              class="w-full rounded-md border border-ink/15 px-3 py-2 font-mono text-sm focus:border-ink focus:outline-none"
              placeholder="jarron-alba"
              @input="slugTouched = true"
            />
          </label>

          <label class="block">
            <span class="mb-1 block text-xs uppercase tracking-widest2 text-engobe">Descripción</span>
            <textarea
              v-model="form.description"
              rows="4"
              class="w-full rounded-md border border-ink/15 px-3 py-2 text-sm focus:border-ink focus:outline-none"
              placeholder="Modelada a torno, esmalte mate…"
            />
          </label>
        </section>

        <!-- Dimensiones -->
        <section class="space-y-4 rounded-lg border border-ink/10 bg-white p-6">
          <div class="flex items-center justify-between">
            <h2 class="font-serif text-lg text-ink">Dimensiones</h2>
            <button type="button" class="text-sm text-accent hover:underline" @click="addDimension">+ Añadir</button>
          </div>
          <p v-if="!dimensions.length" class="text-sm text-engobe">Sin dimensiones.</p>
          <div v-for="(d, i) in dimensions" :key="i" class="flex items-center gap-3">
            <input
              v-model="d.label"
              type="text"
              placeholder="Altura"
              class="flex-1 rounded-md border border-ink/15 px-3 py-2 text-sm focus:border-ink focus:outline-none"
            />
            <input
              v-model.number="d.value_cm"
              type="number"
              min="0"
              step="0.1"
              placeholder="cm"
              class="w-24 rounded-md border border-ink/15 px-3 py-2 text-sm focus:border-ink focus:outline-none"
            />
            <span class="text-xs text-engobe">cm</span>
            <button type="button" class="text-red-600 hover:text-red-800" @click="removeDimension(i)">×</button>
          </div>
        </section>

        <!-- Variantes -->
        <section class="space-y-4 rounded-lg border border-ink/10 bg-white p-6">
          <div class="flex items-center justify-between">
            <h2 class="font-serif text-lg text-ink">Variantes</h2>
            <button type="button" class="text-sm text-accent hover:underline" @click="addVariant">+ Añadir</button>
          </div>
          <p v-if="!variants.length" class="text-sm text-engobe">Sin variantes.</p>
          <div v-for="(v, i) in variants" :key="i" class="flex flex-wrap items-center gap-2">
            <select
              v-model="v.type"
              class="rounded-md border border-ink/15 px-2 py-2 text-sm focus:border-ink focus:outline-none"
            >
              <option value="color">Color</option>
              <option value="tamano">Tamaño</option>
              <option value="acabado">Acabado</option>
            </select>
            <input
              v-model="v.label"
              type="text"
              placeholder="Arena"
              class="flex-1 rounded-md border border-ink/15 px-3 py-2 text-sm focus:border-ink focus:outline-none"
            />
            <div class="flex items-center gap-1">
              <span class="text-xs text-engobe">+</span>
              <input
                v-model.number="v.price_delta_cents"
                type="number"
                step="100"
                placeholder="0"
                class="w-24 rounded-md border border-ink/15 px-2 py-2 text-sm focus:border-ink focus:outline-none"
                title="Suplemento en céntimos"
              />
              <span class="text-xs text-engobe">cént.</span>
            </div>
            <button type="button" class="text-red-600 hover:text-red-800" @click="removeVariant(i)">×</button>
          </div>
        </section>

        <!-- Fotos -->
        <section class="space-y-4 rounded-lg border border-ink/10 bg-white p-6">
          <h2 class="font-serif text-lg text-ink">Fotos</h2>
          <p v-if="!isEditing" class="text-sm text-engobe">
            Guarda la pieza primero para poder subir fotos.
          </p>
          <template v-else>
            <div v-if="images.length" class="grid grid-cols-2 gap-4 sm:grid-cols-3">
              <figure
                v-for="img in images"
                :key="img.id"
                class="group relative overflow-hidden rounded-md border border-ink/10"
              >
                <img :src="img.url" :alt="img.alt ?? ''" class="aspect-[4/5] w-full object-cover" />
                <span
                  v-if="img.is_primary"
                  class="absolute left-2 top-2 rounded-full bg-ink px-2 py-0.5 text-[10px] uppercase tracking-widest2 text-bone"
                >
                  Principal
                </span>
                <div
                  class="absolute inset-x-0 bottom-0 flex justify-between gap-1 bg-ink/70 p-2 text-xs opacity-0 transition-opacity group-hover:opacity-100"
                >
                  <button
                    v-if="!img.is_primary"
                    type="button"
                    class="text-bone hover:underline"
                    @click="onSetPrimary(img)"
                  >
                    Principal
                  </button>
                  <span v-else></span>
                  <button type="button" class="text-bone hover:underline" @click="onRemoveImage(img)">
                    Eliminar
                  </button>
                </div>
              </figure>
            </div>
            <p v-else class="text-sm text-engobe">Aún no hay fotos.</p>

            <label class="inline-block">
              <span
                class="inline-block cursor-pointer rounded-md border border-ink/20 px-4 py-2 text-sm text-ink transition-colors hover:bg-stone/40"
                :class="{ 'pointer-events-none opacity-50': uploading }"
              >
                {{ uploading ? 'Subiendo…' : '+ Subir fotos' }}
              </span>
              <input type="file" accept="image/*" multiple class="hidden" @change="onFilesSelected" />
            </label>
          </template>
        </section>
      </div>

      <!-- Columna lateral: publicación y precio -->
      <aside class="space-y-6">
        <section class="space-y-4 rounded-lg border border-ink/10 bg-white p-6">
          <h2 class="font-serif text-lg text-ink">Publicación</h2>
          <label class="flex items-center justify-between">
            <span class="text-sm text-ink">Publicada</span>
            <input v-model="form.is_published" type="checkbox" class="h-4 w-4 accent-ink" />
          </label>
          <label class="flex items-center justify-between">
            <span class="text-sm text-ink">Destacada</span>
            <input v-model="form.is_featured" type="checkbox" class="h-4 w-4 accent-ink" />
          </label>
        </section>

        <section class="space-y-4 rounded-lg border border-ink/10 bg-white p-6">
          <h2 class="font-serif text-lg text-ink">Disponibilidad y precio</h2>
          <label class="block">
            <span class="mb-1 block text-xs uppercase tracking-widest2 text-engobe">Tipo</span>
            <select
              v-model="form.availability_type"
              class="w-full rounded-md border border-ink/15 px-3 py-2 text-sm focus:border-ink focus:outline-none"
            >
              <option value="made_to_order">Bajo pedido</option>
              <option value="in_stock">En stock</option>
            </select>
          </label>

          <label class="block">
            <span class="mb-1 block text-xs uppercase tracking-widest2 text-engobe">Precio (€)</span>
            <input
              v-model="priceEuros"
              type="number"
              min="0"
              step="0.01"
              class="w-full rounded-md border border-ink/15 px-3 py-2 text-sm focus:border-ink focus:outline-none"
            />
            <span class="mt-1 block text-xs text-engobe">{{ formatPrice(form.price_cents, form.currency) }}</span>
          </label>

          <label v-if="form.availability_type === 'made_to_order'" class="block">
            <span class="mb-1 block text-xs uppercase tracking-widest2 text-engobe">Tiempo de producción (días)</span>
            <input
              v-model.number="form.production_time_days"
              type="number"
              min="0"
              class="w-full rounded-md border border-ink/15 px-3 py-2 text-sm focus:border-ink focus:outline-none"
            />
          </label>

          <label v-else class="block">
            <span class="mb-1 block text-xs uppercase tracking-widest2 text-engobe">Stock disponible</span>
            <input
              v-model.number="form.stock_quantity"
              type="number"
              min="0"
              class="w-full rounded-md border border-ink/15 px-3 py-2 text-sm focus:border-ink focus:outline-none"
            />
          </label>
        </section>

        <section class="space-y-4 rounded-lg border border-ink/10 bg-white p-6">
          <h2 class="font-serif text-lg text-ink">Colección</h2>
          <select
            v-model="form.collection_id"
            class="w-full rounded-md border border-ink/15 px-3 py-2 text-sm focus:border-ink focus:outline-none"
          >
            <option :value="null">— Sin colección —</option>
            <option v-for="c in collections" :key="c.id" :value="c.id">{{ c.title }}</option>
          </select>
        </section>
      </aside>
    </div>
  </div>
</template>
