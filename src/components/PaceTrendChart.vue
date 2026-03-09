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
import type { TooltipItem } from 'chart.js'
import type { StravaActivity } from '@/types/strava'
import { usePaceTrendData } from '@/composables/useActivityCharts'
import { useChartClick } from '@/composables/useChartClick'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler)

const props = defineProps<{
  activities: StravaActivity[]
}>()

const emit = defineEmits<{
  dataPointClick: [activity: StravaActivity]
}>()

const activitiesRef = toRef(props, 'activities')
const paceData = usePaceTrendData(activitiesRef)

const { onClick, onHover } = useChartClick((index) => {
  const activity = paceData.value.activities[index]
  if (activity) emit('dataPointClick', activity)
})

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
      pointHitRadius: 8,
      pointBackgroundColor: '#FC4C02',
    },
  ],
}))

const options = computed(() => ({
  responsive: true,
  maintainAspectRatio: true,
  onClick,
  onHover,
  plugins: {
    legend: { display: false },
    tooltip: {
      callbacks: {
        label: (ctx: TooltipItem<'line'>) => {
          const y = ctx.parsed.y ?? 0
          const mins = Math.floor(y)
          const secs = Math.round((y - mins) * 60)
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
}))
</script>

<template>
  <Line v-if="paceData.labels.length > 0" :data="chartData" :options="options" />
  <div v-else class="text-center pa-8 text-medium-emphasis">
    No pace data available
  </div>
</template>
