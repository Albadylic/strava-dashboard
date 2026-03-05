<script setup lang="ts">
import type { StravaAthlete } from '@/types/strava'

defineProps<{
  athlete: StravaAthlete | null
  size?: number
}>()
</script>

<template>
  <v-avatar :size="size ?? 40" color="primary">
    <v-img v-if="athlete?.profile_medium" :src="athlete.profile_medium" :alt="athlete.firstname" />
    <v-icon v-else icon="mdi-account" />
  </v-avatar>
</template>
