<script setup lang="ts">
import type { PersonalRecord } from '@/types/activity'
import { formatDuration, formatPaceFromSecondsPerMeter } from '@/composables/useFormatters'

defineProps<{
  record: PersonalRecord
}>()

const medalColors = ['#FFD700', '#C0C0C0', '#CD7F32']
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

    <template v-if="record.topEfforts.length > 0">
      <p class="text-h4 font-weight-bold primary--text mb-2">
        {{ formatDuration(record.topEfforts[0].movingTime) }}
      </p>
      <div class="d-flex flex-column ga-1 mb-4">
        <div class="d-flex align-center text-body-2 text-medium-emphasis">
          <v-icon icon="mdi-speedometer" size="16" class="mr-1" />
          {{ formatPaceFromSecondsPerMeter(record.topEfforts[0].pace) }}
        </div>
        <div class="d-flex align-center text-body-2 text-medium-emphasis">
          <v-icon icon="mdi-calendar" size="16" class="mr-1" />
          {{ record.topEfforts[0].date }}
        </div>
        <div class="d-flex align-center text-body-2 text-medium-emphasis">
          <v-icon icon="mdi-label" size="16" class="mr-1" />
          {{ record.topEfforts[0].name }}
        </div>
      </div>

      <div v-if="record.topEfforts.length > 1" class="d-flex flex-column ga-2">
        <v-divider class="mb-1" />
        <div
          v-for="(effort, idx) in record.topEfforts.slice(1)"
          :key="effort.id"
          class="d-flex align-center text-body-2"
        >
          <v-icon icon="mdi-medal" :color="medalColors[idx + 1]" size="18" class="mr-2" />
          <span class="font-weight-medium mr-2">{{ formatDuration(effort.movingTime) }}</span>
          <span class="text-medium-emphasis">{{ effort.date }}</span>
        </div>
      </div>
    </template>

    <template v-else>
      <p class="text-body-1 text-medium-emphasis">No matching activities yet</p>
    </template>
  </v-card>
</template>
