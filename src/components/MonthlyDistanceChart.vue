<script setup lang="ts">
import { computed, toRef } from 'vue'
import { Bar } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import type { StravaActivity } from '@/types/strava'
import { useDailyDistanceData } from '@/composables/useActivityCharts'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

const props = defineProps<{
  activities: StravaActivity[]
  monthStart: Date
  monthEnd: Date
}>()

const activitiesRef = toRef(props, 'activities')
const chartDataComputed = useDailyDistanceData(activitiesRef, props.monthStart, props.monthEnd)

const chartData = computed(() => ({
  labels: chartDataComputed.value.labels,
  datasets: [
    {
      label: 'Distance (km)',
      data: chartDataComputed.value.data,
      backgroundColor: '#FC4C02',
      borderRadius: 4,
    },
  ],
}))

const options = {
  responsive: true,
  maintainAspectRatio: true,
  plugins: {
    legend: { display: false },
  },
  scales: {
    y: {
      beginAtZero: true,
      grid: { color: 'rgba(255,255,255,0.08)' },
      ticks: { color: '#aaa' },
    },
    x: {
      grid: { display: false },
      ticks: { color: '#aaa', maxRotation: 45 },
    },
  },
}
</script>

<template>
  <Bar :data="chartData" :options="options" />
</template>
