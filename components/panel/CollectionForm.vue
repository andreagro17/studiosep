<script setup lang="ts">
import type { AdminCollectionForm } from '~/composables/useCollectionAdmin'

const props = defineProps<{ collectionId: string | null }>()

const {
  fetchCollection,
  saveCollection,
  deleteCollection,
  uploadCover,
  removeCoverFile,
  publicUrl,
} = useCollectionAdmin()

const supabase = useSupabaseClient()

const isEditing = computed(() => props.collectionId !== null)

const form = reactive<AdminCollectionForm>(emptyCollectionForm())

const loading = ref(true)
const saving = ref(false)
const uploading = ref(false)
const errorMsg = ref('')
const okMsg = ref('')

// Number of published products assigned to this collection. A collection only
// shows on the public site if it is published AND has at least one of these.
const publishedProductCount = ref(0)

// Requirements the collection must meet to be visible to customers.
const requirements = computed(() => [
  {
    met: form.is_published,
    label: 'Marcar la colección como «Publicada».',
  },
  {
    met: publishedProductCount.value > 0,
    label: 'Asignar al menos un producto publicado a esta colección.',
  },
])

const isPublicVisible = computed(() => requirements.value.every((r) => r.met))

async function refreshProductCount() {
  if (!props.collectionId) return
  const { count } = await supabase
    .from('products')
    .select('id', { count: 'exact', head: true })
    .eq('collection_id', props.collectionId)
    .eq('is_published', true)
  publishedProductCount.value = count ?? 0
}

const coverUrl = computed(() => publicUrl(form.cover_image))

// Mes en formato 'YYYY-MM' para <input type="month">
const monthInput = computed({
  get: () => (form.month ? form.month.slice(0, 7) : ''),
  set: (v: string) => {
    form.month = v ? `${v}-01` : null
  },
})

// Slug sincronizado con el título mientras no se edite a mano (solo al crear)
const slugTouched = ref(false)
watch(
  () => form.title,
  (title) => {
    if (!slugTouched.value && !isEditing.value) form.slug = slugify(title)
  },
)

onMounted(async () => {
  try {
    if (props.collectionId) {
      Object.assign(form, await fetchCollection(props.collectionId))
      slugTouched.value = true
      await refreshProductCount()
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

async function onSave() {
  errorMsg.value = ''
  okMsg.value = ''
  if (!form.title.trim()) {
    errorMsg.value = 'El título es obligatorio.'
    return
  }
  saving.value = true
  try {
    const id = await saveCollection(form)
    if (!isEditing.value) {
      await navigateTo(`/panel/colecciones/${id}`)
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
  if (!props.collectionId) return
  if (!confirm('¿Eliminar esta colección? Sus piezas quedarán sin colección (no se borran).')) return
  saving.value = true
  try {
    await removeCoverFile(form.cover_image)
    await deleteCollection(props.collectionId)
    await navigateTo('/panel/colecciones')
  } catch (e) {
    errorMsg.value = errMessage(e)
    saving.value = false
  }
}

async function onCoverSelected(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  uploading.value = true
  errorMsg.value = ''
  try {
    const previous = form.cover_image
    const path = await uploadCover(form.slug || slugify(form.title), file)
    form.cover_image = path
    await removeCoverFile(previous)
    // Si ya existe la colección, persiste la portada de inmediato
    if (isEditing.value) await saveCollection(form)
  } catch (e) {
    errorMsg.value = errMessage(e)
  } finally {
    uploading.value = false
    input.value = ''
  }
}

async function onRemoveCover() {
  if (!form.cover_image) return
  if (!confirm('¿Quitar la imagen de portada?')) return
  const previous = form.cover_image
  form.cover_image = null
  try {
    await removeCoverFile(previous)
    if (isEditing.value) await saveCollection(form)
  } catch (e) {
    errorMsg.value = errMessage(e)
  }
}
</script>

<template>
  <div>
    <header class="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <NuxtLink to="/panel/colecciones" class="text-xs text-engobe hover:text-ink">← Colecciones</NuxtLink>
        <h1 class="mt-1 font-serif text-3xl tracking-tight text-ink">
          {{ isEditing ? form.title || 'Editar colección' : 'Nueva colección' }}
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
          {{ saving ? 'Guardando…' : isEditing ? 'Guardar' : 'Crear colección' }}
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
          <h2 class="font-serif text-lg text-ink">Datos de la colección</h2>

          <label class="block">
            <span class="mb-1 block text-xs uppercase tracking-widest2 text-engobe">Título</span>
            <input
              v-model="form.title"
              type="text"
              class="w-full rounded-md border border-ink/15 px-3 py-2 text-sm focus:border-ink focus:outline-none"
              placeholder="Colección Junio"
            />
          </label>

          <label class="block">
            <span class="mb-1 block text-xs uppercase tracking-widest2 text-engobe">Slug (URL)</span>
            <input
              v-model="form.slug"
              type="text"
              class="w-full rounded-md border border-ink/15 px-3 py-2 font-mono text-sm focus:border-ink focus:outline-none"
              placeholder="junio"
              @input="slugTouched = true"
            />
          </label>

          <label class="block">
            <span class="mb-1 block text-xs uppercase tracking-widest2 text-engobe">Descripción</span>
            <textarea
              v-model="form.description"
              rows="4"
              class="w-full rounded-md border border-ink/15 px-3 py-2 text-sm focus:border-ink focus:outline-none"
              placeholder="Una selección de piezas de mesa en tonos tierra…"
            />
          </label>
        </section>

        <!-- Portada -->
        <section class="space-y-4 rounded-lg border border-ink/10 bg-white p-6">
          <h2 class="font-serif text-lg text-ink">Imagen de portada</h2>

          <figure v-if="coverUrl" class="overflow-hidden rounded-md border border-ink/10">
            <img :src="coverUrl" alt="Portada de la colección" class="aspect-[16/9] w-full object-cover" />
          </figure>
          <p v-else class="text-sm text-engobe">Sin portada.</p>

          <div class="flex items-center gap-3">
            <label class="inline-block">
              <span
                class="inline-block cursor-pointer rounded-md border border-ink/20 px-4 py-2 text-sm text-ink transition-colors hover:bg-stone/40"
                :class="{ 'pointer-events-none opacity-50': uploading }"
              >
                {{ uploading ? 'Subiendo…' : coverUrl ? 'Cambiar portada' : '+ Subir portada' }}
              </span>
              <input type="file" accept="image/*" class="hidden" @change="onCoverSelected" />
            </label>
            <button
              v-if="coverUrl"
              type="button"
              class="text-sm text-red-600 hover:underline"
              @click="onRemoveCover"
            >
              Quitar
            </button>
          </div>
        </section>
      </div>

      <!-- Columna lateral: publicación y mes -->
      <aside class="space-y-6">
        <section class="space-y-4 rounded-lg border border-ink/10 bg-white p-6">
          <h2 class="font-serif text-lg text-ink">Publicación</h2>
          <label class="flex items-center justify-between">
            <span class="text-sm text-ink">Publicada</span>
            <input v-model="form.is_published" type="checkbox" class="h-4 w-4 accent-ink" />
          </label>

          <!-- Estado de visibilidad en la web pública -->
          <div
            class="rounded-md px-3 py-3 text-xs"
            :class="isPublicVisible ? 'bg-green-50 text-green-800' : 'bg-amber-50 text-amber-800'"
          >
            <p class="font-medium">
              {{ isPublicVisible ? 'Visible en la web pública.' : 'Aún no es visible para los clientes.' }}
            </p>
            <p v-if="!isEditing" class="mt-1 leading-relaxed">
              Guarda la colección para comprobar los requisitos.
            </p>
            <ul v-else class="mt-2 space-y-1">
              <li v-for="(req, i) in requirements" :key="i" class="flex items-start gap-2">
                <span :class="req.met ? 'text-green-600' : 'text-amber-600'">{{ req.met ? '✓' : '○' }}</span>
                <span>{{ req.label }}</span>
              </li>
            </ul>
            <p v-if="isEditing && publishedProductCount === 0" class="mt-2 leading-relaxed">
              Asigna productos a esta colección desde
              <NuxtLink to="/panel/productos" class="underline">Productos</NuxtLink>
              (campo «Colección» en cada pieza).
            </p>
          </div>
        </section>

        <section class="space-y-4 rounded-lg border border-ink/10 bg-white p-6">
          <h2 class="font-serif text-lg text-ink">Mes</h2>
          <label class="block">
            <span class="mb-1 block text-xs uppercase tracking-widest2 text-engobe">Mes de la colección</span>
            <input
              v-model="monthInput"
              type="month"
              class="w-full rounded-md border border-ink/15 px-3 py-2 text-sm focus:border-ink focus:outline-none"
            />
          </label>
        </section>
      </aside>
    </div>
  </div>
</template>
