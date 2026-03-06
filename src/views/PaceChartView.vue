<script setup lang="ts">
import { computed, onMounted } from 'vue'
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
import { useChartView } from '@/composables/useChartView'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler)

const {
  timePeriod,
  aggregationMode,
  perActivityPaceData,
  weeklyPaceData,
  loading,
  progress,
  allFetched,
  fetchAll,
} = useChartView()

const periodOptions = [
  { title: 'Last Month', value: 'last-month' },
  { title: 'Last 6 Months', value: 'last-6-months' },
  { title: 'Last Year', value: 'last-year' },
  { title: 'All Time', value: 'all-time' },
]

const activeData = computed(() =>
  aggregationMode.value === 'weekly' ? weeklyPaceData.value : perActivityPaceData.value,
)

const chartData = computed(() => ({
  labels: activeData.value.labels,
  datasets: [
    {
      label: 'Pace (min/km)',
      data: activeData.value.data,
      borderColor: '#FC4C02',
      backgroundColor: 'rgba(252, 76, 2, 0.1)',
      fill: true,
      tension: 0.3,
      pointRadius: 4,
      pointBackgroundColor: '#FC4C02',
    },
  ],
}))

const chartOptions = {
  responsive: true,
  maintainAspectRatio: true,
  plugins: {
    legend: { display: false },
    tooltip: {
      callbacks: {
        label: (ctx: { parsed: { y: number } }) => {
          const mins = Math.floor(ctx.parsed.y)
          const secs = Math.round((ctx.parsed.y - mins) * 60)
          return `${mins}:${String(secs).padStart(2, '0')} /km`
        },
      },
    },
  },
  scales: {
    y: {
      reverse: true,
      grid: { color: 'rgba(255,255,255,0.08)' },
      ticks: {
        color: '#aaa',
        callback: (value: number | string) => {
          const v = Number(value)
          const mins = Math.floor(v)
          const secs = Math.round((v - mins) * 60)
          return `${mins}:${String(secs).padStart(2, '0')}`
        },
      },
    },
    x: {
      grid: { display: false },
      ticks: { color: '#aaa', maxRotation: 45 },
    },
  },
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
        <h1 class="text-h4 font-weight-bold">Pace Chart</h1>
        <p class="text-body-1 text-medium-emphasis">Track your pace over time</p>
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
      </div>
    </div>

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
        No pace data available for the selected period
      </div>
    </v-card>
  </div>
</template>
