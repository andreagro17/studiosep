<script setup lang="ts">
useHead({
  title: 'Sobre nosotras — StudioSeptiembre',
  meta: [
    {
      name: 'description',
      content:
        'Un taller de cerámica en Madrid. Trabajamos a mano, en series cortas, atendiendo a la materia y al tiempo.',
    },
  ],
})
</script>

<template>
  <div>
    <!-- Apertura -->
    <section class="container-editorial py-16 md:py-24">
      <p class="eyebrow">Sobre nosotras</p>
      <h1 class="mt-4 max-w-3xl font-serif text-4xl font-light leading-tight text-ink md:text-6xl">
        Un oficio lento, en el corazón de Madrid
      </h1>
      <p class="mt-6 max-w-2xl leading-relaxed text-engobe">
        StudioSeptiembre nace del deseo de hacer pocas cosas, bien. Modelamos cada pieza a
        mano en nuestro taller, sin prisa y sin moldes industriales. Lo que sale del horno
        lleva el gesto de quien lo hizo.
      </p>
    </section>

    <!-- Imagen a sangre -->
    <section class="aspect-[16/9] w-full overflow-hidden bg-stone md:aspect-[21/9]">
      <img
        src="https://picsum.photos/seed/taller-studioseptiembre/2100/900"
        alt="Interior del taller de cerámica"
        class="h-full w-full object-cover"
      />
    </section>

    <!-- Manifiesto -->
    <section class="container-editorial py-16 md:py-24">
      <div class="grid grid-cols-1 gap-12 md:grid-cols-2 md:gap-16">
        <div>
          <h2 class="font-serif text-2xl font-light leading-snug text-ink md:text-3xl">
            La materia manda
          </h2>
          <p class="mt-4 leading-relaxed text-engobe">
            Trabajamos con gres y porcelana, esmaltes minerales y engobes terrosos.
            Escuchamos al barro: cada arcilla pide su temperatura, su tiempo de secado y
            su cocción. Nada se fuerza.
          </p>
        </div>
        <div>
          <h2 class="font-serif text-2xl font-light leading-snug text-ink md:text-3xl">
            Series cortas
          </h2>
          <p class="mt-4 leading-relaxed text-engobe">
            Publicamos una colección al mes, en cantidades limitadas. Cuando se agota,
            desaparece. Y si buscas algo único, lo modelamos para ti bajo pedido.
          </p>
        </div>
      </div>
    </section>

    <!-- Cierre / CTA -->
    <section class="border-t border-ink/10">
      <div class="container-editorial flex flex-col items-start gap-6 py-16 md:flex-row md:items-center md:justify-between">
        <p class="max-w-xl font-serif text-2xl font-light leading-snug text-ink md:text-3xl">
          ¿Tienes una pieza en mente? Cuéntanosla.
        </p>
        <NuxtLink
          to="/contacto"
          class="inline-block bg-ink px-8 py-4 text-sm uppercase tracking-widest2 text-bone transition-colors duration-300 ease-editorial hover:bg-accent"
        >
          Contacto
        </NuxtLink>
      </div>
    </section>
  </div>
</template>
