<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Line } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js'
import type { TooltipItem } from 'chart.js'
import { useChartView } from '@/composables/useChartView'
import { useChartClick } from '@/composables/useChartClick'
import type { StravaActivity } from '@/types/strava'
import ActivityDetailModal from '@/components/ActivityDetailModal.vue'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler)

const {
  timePeriod,
  aggregationMode,
  perActivityDistanceData,
  weeklyDistanceData,
  loading,
  progress,
  allFetched,
  fetchAll,
  distanceRange,
  elevationRange,
  paceRange,
  hrRange,
  filterBounds,
} = useChartView()

const selectedActivity = ref<StravaActivity | null>(null)
const showModal = ref(false)
const showFilters = ref(false)

function fmtPace(v: number) {
  const mins = Math.floor(v)
  const secs = Math.round((v - mins) * 60)
  return `${mins}:${String(secs).padStart(2, '0')}`
}

const pacePresets = [
  { label: 'Easy',     min: 6,   max: 7   },
  { label: 'Moderate', min: 5,   max: 6   },
  { label: 'Tempo',    min: 4,   max: 5   },
]

function applyPreset(preset: { min: number; max: number }) {
  const active = paceRange.value[0] === preset.min && paceRange.value[1] === preset.max
  if (active) {
    paceRange.value = [filterBounds.value.minPace, filterBounds.value.maxPace]
  } else {
    paceRange.value = [preset.min, preset.max]
  }
}

function isPresetActive(preset: { min: number; max: number }) {
  return paceRange.value[0] === preset.min && paceRange.value[1] === preset.max
}

const periodOptions = [
  { title: 'Last Month', value: 'last-month' },
  { title: 'Last 3 Months', value: 'last-3-months' },
  { title: 'Last 6 Months', value: 'last-6-months' },
  { title: 'Last Year', value: 'last-year' },
  { title: 'All Time', value: 'all-time' },
]

const activeData = computed(() =>
  aggregationMode.value === 'weekly' ? weeklyDistanceData.value : perActivityDistanceData.value,
)

const { onClick, onHover } = useChartClick((index) => {
  if (aggregationMode.value !== 'per-activity') return
  const activity = perActivityDistanceData.value.activities[index]
  if (activity) {
    selectedActivity.value = activity
    showModal.value = true
  }
})

const chartData = computed(() => ({
  labels: activeData.value.labels,
  datasets: [
    {
      label: 'Distance (km)',
      data: activeData.value.data,
      borderColor: '#FC4C02',
      backgroundColor: 'rgba(252, 76, 2, 0.1)',
      fill: true,
      tension: 0.3,
      pointRadius: 4,
      pointHitRadius: 8,
      pointBackgroundColor: '#FC4C02',
    },
  ],
}))

const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: true,
  ...(aggregationMode.value === 'per-activity' ? { onClick, onHover } : {}),
  plugins: {
    legend: { display: false },
    tooltip: {
      callbacks: {
        label: (ctx: TooltipItem<'line'>) => { const y = ctx.parsed.y ?? 0; return `${y.toFixed(2)} km` },
      },
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      grid: { color: 'rgba(255,255,255,0.08)' },
      ticks: {
        color: '#aaa',
        callback: (value: number | string) => `${Number(value).toFixed(1)} km`,
      },
    },
    x: {
      grid: { display: false },
      ticks: { color: '#aaa', maxRotation: 45 },
    },
  },
}))

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
        <h1 class="text-h4 font-weight-bold">Distance Chart</h1>
        <p class="text-body-1 text-medium-emphasis">Track your running distance over time</p>
      </div>
      <div class="d-flex align-center ga-4">
        <v-btn-toggle v-model="aggregationMode" mandatory density="compact" variant="outlined">
          <v-btn value="per-activity">Per Activity</v-btn>
          <v-btn value="weekly">Weekly</v-btn>
        </v-btn-toggle>
        <v-select
          v-model="timePeriod"
          :items="periodOptions"
          variant="outlined"
          density="compact"
          hide-details
          style="max-width: 200px"
        />
        <v-btn
          :variant="showFilters ? 'tonal' : 'outlined'"
          density="compact"
          prepend-icon="mdi-tune"
          @click="showFilters = !showFilters"
        >Filters</v-btn>
      </div>
    </div>

    <v-expand-transition>
      <v-card v-if="showFilters" class="pa-3 mb-4">
        <div class="d-flex align-center ga-2 mb-3">
          <span class="text-caption text-medium-emphasis">Quick select:</span>
          <v-btn v-for="preset in pacePresets" :key="preset.label"
            :variant="isPresetActive(preset) ? 'tonal' : 'outlined'"
            :color="isPresetActive(preset) ? 'primary' : undefined"
            size="x-small" density="compact" class="px-3 py-3"
            @click="applyPreset(preset)"
          >{{ preset.label }}</v-btn>
        </div>
        <v-row dense align="center">
          <v-col>
            <div class="text-caption text-medium-emphasis mb-n1">Distance (km): {{ distanceRange[0] }}–{{ distanceRange[1] }}</div>
            <v-range-slider v-model="distanceRange"
              :min="filterBounds.minDist" :max="filterBounds.maxDist" :step="0.5"
              density="compact" hide-details color="primary" />
          </v-col>
          <v-col>
            <div class="text-caption text-medium-emphasis mb-n1">Elevation (m): {{ elevationRange[0] }}–{{ elevationRange[1] }}</div>
            <v-range-slider v-model="elevationRange"
              :min="filterBounds.minElev" :max="filterBounds.maxElev" :step="5"
              density="compact" hide-details color="primary" />
          </v-col>
          <v-col>
            <div class="text-caption text-medium-emphasis mb-n1">Pace: {{ fmtPace(paceRange[0]) }}–{{ fmtPace(paceRange[1]) }} /km</div>
            <v-range-slider v-model="paceRange"
              :min="filterBounds.minPace" :max="filterBounds.maxPace" :step="0.1"
              density="compact" hide-details color="primary" />
          </v-col>
          <v-col v-if="filterBounds.hasHrData">
            <div class="text-caption text-medium-emphasis mb-n1">HR (bpm): {{ hrRange[0] }}–{{ hrRange[1] }}</div>
            <v-range-slider v-model="hrRange"
              :min="filterBounds.minHr" :max="filterBounds.maxHr" :step="1"
              density="compact" hide-details color="primary" />
          </v-col>
        </v-row>
      </v-card>
    </v-expand-transition>

    <div v-if="loading" class="text-center mb-6">
      <v-progress-circular indeterminate color="primary" size="48" class="mb-2" />
      <p class="text-body-1 text-medium-emphasis">
        Loading activities... {{ progress }} fetched
      </p>
    </div>

    <v-card v-else class="pa-4">
      <Line
        v-if="activeData.labels.length > 0"
        :data="chartData"
        :options="chartOptions"
      />
      <div v-else class="text-center pa-8 text-medium-emphasis">
        No distance data available for the selected period
      </div>
    </v-card>

    <ActivityDetailModal v-model="showModal" :activity="selectedActivity" />
  </div>
</template>
