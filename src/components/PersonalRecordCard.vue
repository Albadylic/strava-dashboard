<script setup lang="ts">
import type { PersonalRecord } from '@/types/activity'
import { formatDuration, formatPaceFromSecondsPerMeter } from '@/composables/useFormatters'

defineProps<{
  record: PersonalRecord
}>()
</script>

<template>
  <v-card class="pa-6">
    <div class="d-flex align-center mb-4">
      <v-avatar color="primary" size="48" class="mr-4">
        <v-icon icon="mdi-trophy" color="white" />
      </v-avatar>
      <div>
        <p class="text-h6 font-weight-bold">{{ record.label }}</p>
      </div>
    </div>

    <template v-if="record.activity">
      <p class="text-h4 font-weight-bold primary--text mb-2">
        {{ formatDuration(record.activity.movingTime) }}
      </p>
      <div class="d-flex flex-column ga-1">
        <div class="d-flex align-center text-body-2 text-medium-emphasis">
          <v-icon icon="mdi-speedometer" size="16" class="mr-1" />
          {{ formatPaceFromSecondsPerMeter(record.activity.pace) }}
        </div>
        <div class="d-flex align-center text-body-2 text-medium-emphasis">
          <v-icon icon="mdi-calendar" size="16" class="mr-1" />
          {{ record.activity.date }}
        </div>
        <div class="d-flex align-center text-body-2 text-medium-emphasis">
          <v-icon icon="mdi-label" size="16" class="mr-1" />
          {{ record.activity.name }}
        </div>
      </div>
    </template>

    <template v-else>
      <p class="text-body-1 text-medium-emphasis">No matching activities yet</p>
    </template>
  </v-card>
</template>
