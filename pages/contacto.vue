<script setup lang="ts">
useHead({
  title: 'Contacto — StudioSeptiembre',
  meta: [
    {
      name: 'description',
      content:
        'Escríbenos para encargos, colaboraciones o cualquier consulta sobre nuestras piezas de cerámica.',
    },
  ],
})

const form = reactive({
  name: '',
  email: '',
  message: '',
})

const sent = ref(false)
const submitting = ref(false)
const errorMsg = ref('')

async function submit() {
  errorMsg.value = ''
  submitting.value = true
  try {
    await $fetch('/api/inquiry', {
      method: 'POST',
      body: { name: form.name, email: form.email, message: form.message },
    })
    sent.value = true
  } catch (e: unknown) {
    const err = e as { statusMessage?: string; data?: { statusMessage?: string } }
    errorMsg.value =
      err?.data?.statusMessage ||
      err?.statusMessage ||
      'No se pudo enviar el mensaje. Inténtalo de nuevo.'
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="container-editorial py-16 md:py-24">
    <div class="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-20">
      <!-- Texto -->
      <div>
        <p class="eyebrow">Contacto</p>
        <h1 class="mt-4 font-serif text-4xl font-light leading-tight text-ink md:text-5xl">
          Hablemos
        </h1>
        <p class="mt-6 max-w-md leading-relaxed text-engobe">
          Para encargos a medida, colaboraciones o dudas sobre una pieza, escríbenos.
          Respondemos en un par de días laborables.
        </p>

        <dl class="mt-10 space-y-4 text-sm">
          <div>
            <dt class="text-xs uppercase tracking-widest2 text-engobe">Taller</dt>
            <dd class="mt-1 text-ink">Lavapiés, Madrid · solo con cita</dd>
          </div>
          <div>
            <dt class="text-xs uppercase tracking-widest2 text-engobe">Email</dt>
            <dd class="mt-1 text-ink">hola@studioseptiembre.es</dd>
          </div>
        </dl>
      </div>

      <!-- Formulario -->
      <div>
        <form v-if="!sent" class="space-y-6" @submit.prevent="submit">
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
          <div>
            <label for="message" class="text-xs uppercase tracking-widest2 text-engobe">Mensaje</label>
            <textarea
              id="message"
              v-model="form.message"
              rows="5"
              required
              class="mt-2 w-full resize-none border-b border-ink/20 bg-transparent py-2 text-ink outline-none transition-colors focus:border-ink"
            />
          </div>
          <button
            type="submit"
            :disabled="submitting"
            class="inline-block bg-ink px-8 py-4 text-sm uppercase tracking-widest2 text-bone transition-colors duration-300 ease-editorial hover:bg-accent disabled:opacity-50"
          >
            {{ submitting ? 'Enviando…' : 'Enviar mensaje' }}
          </button>

          <p v-if="errorMsg" class="text-sm text-red-700">{{ errorMsg }}</p>
        </form>

        <div v-else class="border border-ink/10 p-8">
          <p class="font-serif text-2xl font-light text-ink">Gracias, {{ form.name }}.</p>
          <p class="mt-3 leading-relaxed text-engobe">
            Hemos recibido tu mensaje. Te responderemos pronto a {{ form.email }}.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
