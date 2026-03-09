<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { subMonths, subYears } from 'date-fns'
import { useActivitiesStore } from '@/stores/activities.store'
import { useInsights } from '@/composables/useInsights'
import InsightCard from '@/components/InsightCard.vue'
import type { TimePeriod } from '@/types/activity'

const store = useActivitiesStore()

const timePeriod = ref<TimePeriod>('last-3-months')

const periodOptions = [
  { title: 'Last Month', value: 'last-month' },
  { title: 'Last 3 Months', value: 'last-3-months' },
  { title: 'Last 6 Months', value: 'last-6-months' },
  { title: 'Last Year', value: 'last-year' },
  { title: 'All Time', value: 'all-time' },
]

const cutoffDate = computed(() => {
  const now = new Date()
  switch (timePeriod.value) {
    case 'last-month': return subMonths(now, 1)
    case 'last-3-months': return subMonths(now, 3)
    case 'last-6-months': return subMonths(now, 6)
    case 'last-year': return subYears(now, 1)
    case 'all-time': return null
  }
})

const priorCutoffDate = computed(() => {
  if (!cutoffDate.value) return null
  const now = new Date()
  const durationMs = now.getTime() - cutoffDate.value.getTime()
  return new Date(cutoffDate.value.getTime() - durationMs)
})

const currentRuns = computed(() => {
  const runs = store.runActivities.filter(a => a.distance > 0)
  if (!cutoffDate.value) return runs
  const cutoff = cutoffDate.value.getTime()
  return runs.filter(a => new Date(a.start_date).getTime() >= cutoff)
})

const priorRuns = computed(() => {
  if (!cutoffDate.value || !priorCutoffDate.value) return []
  const start = priorCutoffDate.value.getTime()
  const end = cutoffDate.value.getTime()
  return store.runActivities.filter(a => {
    const t = new Date(a.start_date).getTime()
    return t >= start && t < end && a.distance > 0
  })
})

const widgets = useInsights(currentRuns, priorRuns)

onMounted(() => {
  if (!store.allFetched) {
    store.fetchAll()
  }
})
</script>

<template>
  <div>
    <div class="d-flex align-center justify-space-between mb-6">
      <div>
        <h1 class="text-h4 font-weight-bold">Insights</h1>
        <p class="text-body-1 text-medium-emphasis">Patterns from your training history</p>
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

    <div v-if="store.loadingAll" class="text-center py-12">
      <v-progress-circular indeterminate color="primary" size="48" class="mb-2" />
      <p class="text-body-1 text-medium-emphasis">
        Loading activities... {{ store.loadProgress }} fetched
      </p>
    </div>

    <v-row v-else>
      <v-col
        v-for="widget in widgets"
        :key="widget.id"
        cols="12"
        md="6"
      >
        <InsightCard :widget="widget" />
      </v-col>
    </v-row>
  </div>
</template>
