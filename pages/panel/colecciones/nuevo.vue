<script setup lang="ts">
definePageMeta({ layout: 'studio' })
useHead({ title: 'Nueva colección — Panel' })
</script>

<template>
  <CollectionForm :collection-id="null" />
</template>
