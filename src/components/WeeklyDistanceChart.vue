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
import { endOfWeek } from 'date-fns'
import { useDailyDistanceData } from '@/composables/useActivityCharts'
import { useChartClick } from '@/composables/useChartClick'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

const props = defineProps<{
  activities: StravaActivity[]
  weekStart: Date
}>()

const emit = defineEmits<{
  dataPointClick: [activity: StravaActivity]
}>()

const activitiesRef = toRef(props, 'activities')
const weekStartRef = toRef(props, 'weekStart')
const weekEndRef = computed(() => endOfWeek(props.weekStart, { weekStartsOn: 1 }))
const chartDataComputed = useDailyDistanceData(activitiesRef, weekStartRef, weekEndRef)

const { onClick, onHover } = useChartClick((index) => {
  const group = chartDataComputed.value.activityGroups[index]
  if (!group || group.length === 0) return
  const longest = group.reduce((a, b) => (a.distance >= b.distance ? a : b))
  emit('dataPointClick', longest)
})

const chartData = computed(() => ({
  labels: chartDataComputed.value.labels,
  datasets: [
    {
      label: 'Distance (km)',
      data: chartDataComputed.value.data,
      backgroundColor: '#FC4C02',
      borderRadius: 6,
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
  },
  scales: {
    y: {
      beginAtZero: true,
      grid: { color: 'rgba(255,255,255,0.08)' },
      ticks: { color: '#aaa' },
    },
    x: {
      grid: { display: false },
      ticks: { color: '#aaa' },
    },
  },
}))
</script>

<template>
  <Bar :data="chartData" :options="options" />
</template>
