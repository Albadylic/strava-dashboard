<script setup lang="ts">
import { onMounted } from 'vue'
import { useWeeklyComparison } from '@/composables/useWeeklyComparison'
import { formatDistance, formatDuration, formatPaceFromSecondsPerMeter } from '@/composables/useFormatters'

const {
  timePeriod,
  weeks,
  loading,
  progress,
  loadingDetails,
  detailProgress,
  detailTotal,
  allFetched,
  fetchAll,
} = useWeeklyComparison()

const periodOptions = [
  { title: 'Last Month', value: 'last-month' },
  { title: 'Last 6 Months', value: 'last-6-months' },
  { title: 'Last Year', value: 'last-year' },
  { title: 'All Time', value: 'all-time' },
]

const headers = [
  { title: 'Week', key: 'weekLabel', sortable: false },
  { title: 'Distance', key: 'totalDistance' },
  { title: 'Longest Run', key: 'longestRun' },
  { title: 'Time', key: 'totalTime' },
  { title: 'Runs', key: 'runCount' },
  { title: 'Avg Pace', key: 'averagePace', sortable: false },
  { title: '', key: 'prs', sortable: false, width: '48px' },
]

function formatPrTooltip(prs: { distanceName: string; movingTime: number }[]): string {
  return prs.map((pr) => `${pr.distanceName} PR: ${formatDuration(pr.movingTime)}`).join('\n')
}

onMounted(() => {
  if (!allFetched.value) {
    fetchAll()
  }
})
</script>

<template>
  <div>
    <div class="d-flex align-center justify-space-between mb-6">
      <div>
        <h1 class="text-h4 font-weight-bold">Weekly Comparison</h1>
        <p class="text-body-1 text-medium-emphasis">Compare your training week by week</p>
      </div>
      <v-select
        v-model="timePeriod"
        :items="periodOptions"
        variant="outlined"
        density="compact"
        hide-details
        style="max-width: 200px"
      />
    </div>

    <div v-if="loading" class="text-center mb-6">
      <v-progress-circular indeterminate color="primary" size="48" class="mb-2" />
      <p class="text-body-1 text-medium-emphasis">
        Loading activities... {{ progress }} fetched
      </p>
    </div>

    <div v-else-if="loadingDetails" class="text-center mb-6">
      <v-progress-linear
        :model-value="detailTotal > 0 ? (detailProgress / detailTotal) * 100 : 0"
        color="primary"
        class="mb-2"
        rounded
      />
      <p class="text-body-1 text-medium-emphasis">
        Fetching run details... {{ detailProgress }} / {{ detailTotal }}
      </p>
    </div>

    <v-data-table
      v-else
      :headers="headers"
      :items="weeks"
      :items-per-page="20"
      class="elevation-1 rounded-lg"
    >
      <template #item.totalDistance="{ item }">
        {{ formatDistance(item.totalDistance) }}
      </template>
      <template #item.longestRun="{ item }">
        {{ formatDistance(item.longestRun) }}
      </template>
      <template #item.totalTime="{ item }">
        {{ formatDuration(item.totalTime) }}
      </template>
      <template #item.averagePace="{ item }">
        {{ formatPaceFromSecondsPerMeter(item.averagePace) }}
      </template>
      <template #item.prs="{ item }">
        <v-tooltip v-if="item.prs.length > 0" location="start">
          <template #activator="{ props }">
            <v-icon v-bind="props" icon="mdi-trophy" color="warning" />
          </template>
          <span style="white-space: pre-line">{{ formatPrTooltip(item.prs) }}</span>
        </v-tooltip>
      </template>
    </v-data-table>
  </div>
</template>
