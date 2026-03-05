<script setup lang="ts">
defineProps<{
  title: string
  value: string
  subtitle?: string
  icon: string
  color?: string
}>()
</script>

<template>
  <v-card class="pa-4">
    <div class="d-flex align-center">
      <v-avatar :color="color ?? 'primary'" size="48" class="mr-4">
        <v-icon :icon="icon" color="white" />
      </v-avatar>
      <div>
        <p class="text-body-2 text-medium-emphasis">{{ title }}</p>
        <p class="text-h5 font-weight-bold">{{ value }}</p>
        <p v-if="subtitle" class="text-body-2 text-medium-emphasis">{{ subtitle }}</p>
      </div>
    </div>
  </v-card>
</template>
