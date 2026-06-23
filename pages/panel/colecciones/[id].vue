<script setup lang="ts">
definePageMeta({ layout: 'studio' })
useHead({ title: 'Editar colección — Panel' })

const route = useRoute()
const collectionId = computed(() => String(route.params.id))
</script>

<template>
  <CollectionForm :collection-id="collectionId" />
</template>
