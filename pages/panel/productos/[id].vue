<script setup lang="ts">
definePageMeta({ layout: 'studio' })
useHead({ title: 'Editar pieza — Panel' })

const route = useRoute()
const productId = computed(() => String(route.params.id))
</script>

<template>
  <ProductForm :product-id="productId" />
</template>
