<script setup lang="ts">
defineProps<{
  loading: boolean
  message?: string
}>()
</script>

<template>
  <v-overlay :model-value="loading" class="align-center justify-center" persistent>
    <div class="text-center">
      <v-progress-circular indeterminate color="primary" size="64" />
      <p v-if="message" class="text-body-1 mt-4">{{ message }}</p>
    </div>
  </v-overlay>
</template>
