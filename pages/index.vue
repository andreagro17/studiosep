<script setup lang="ts">
useHead({
  title: 'StudioSet — Cerámica artesanal de Madrid',
  meta: [
    {
      name: 'description',
      content:
        'Piezas de cerámica hechas a mano en Madrid. Diseño contemporáneo, lujo silencioso y producción artesanal.',
    },
  ],
})
</script>

<template>
  <div>
    <!-- Apertura editorial a pantalla completa -->
    <HeroSection
      eyebrow="Cerámica artesanal · Madrid"
      title="Objetos hechos a mano, pensados para durar."
      subtitle="Piezas únicas modeladas en nuestro taller. Diseño contemporáneo y lujo silencioso, una colección cada mes."
      cta-label="Ver el catálogo"
      cta-to="/catalogo"
    />

    <!-- Manifiesto de marca -->
    <EditorialBlock
      eyebrow="Nuestro oficio"
      title="La belleza de lo imperfecto"
      body="Cada pieza nace del barro y del tiempo. Trabajamos en series cortas, atendiendo a la materia y al gesto. Nada se produce en masa: lo que ves está hecho a mano, una vez."
      cta-label="Sobre nosotras"
      cta-to="/sobre-nosotras"
    />

    <!-- Dos formas de adquirir -->
    <EditorialBlock
      eyebrow="Hecho bajo pedido"
      title="Piezas creadas para ti"
      body="Encargos exclusivos modelados a mano según tus medidas y acabados. Tiempo estimado de producción de 3 a 4 semanas."
      cta-label="Solicitar un pedido"
      cta-to="/pedido"
      reverse
    />

    <EditorialBlock
      eyebrow="Colección del mes"
      title="Listas para envío inmediato"
      body="Una selección limitada disponible cada mes. Cuando se agota, desaparece. Entrega inmediata mientras haya stock."
      cta-label="Ver colecciones"
      cta-to="/colecciones"
    />
  </div>
</template>
