<script setup lang="ts">
import { computed, toRef } from 'vue'
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
import type { StravaActivity } from '@/types/strava'
import { usePaceTrendData } from '@/composables/useActivityCharts'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler)

const props = defineProps<{
  activities: StravaActivity[]
}>()

const activitiesRef = toRef(props, 'activities')
const paceData = usePaceTrendData(activitiesRef)

const chartData = computed(() => ({
  labels: paceData.value.labels,
  datasets: [
    {
      label: 'Pace (min/km)',
      data: paceData.value.data,
      borderColor: '#FC4C02',
      backgroundColor: 'rgba(252, 76, 2, 0.1)',
      fill: true,
      tension: 0.3,
      pointRadius: 4,
      pointBackgroundColor: '#FC4C02',
    },
  ],
}))

const options = {
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
      ticks: { color: '#aaa' },
    },
  },
}
</script>

<template>
  <Line v-if="paceData.labels.length > 0" :data="chartData" :options="options" />
  <div v-else class="text-center pa-8 text-medium-emphasis">
    No pace data available
  </div>
</template>
