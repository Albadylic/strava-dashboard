<script setup lang="ts">
import { computed } from 'vue'
import { Bar } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
} from 'chart.js'
import type { InsightWidget } from '@/composables/useInsights'

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip)

const props = defineProps<{ widget: InsightWidget }>()

const sentimentColor = (s: 'positive' | 'neutral' | 'negative') => {
  if (s === 'positive') return 'success'
  if (s === 'negative') return 'warning'
  return 'medium-emphasis'
}

const sparklineData = computed(() => ({
  labels: props.widget.sparkline.labels,
  datasets: [
    {
      data: props.widget.sparkline.data,
      backgroundColor: 'rgba(252, 76, 2, 0.7)',
      borderRadius: 3,
    },
  ],
}))

const sparklineOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: { enabled: true },
  },
  scales: {
    x: {
      grid: { display: false },
      ticks: { color: '#888', font: { size: 10 }, maxRotation: 45, maxTicksLimit: 8 },
    },
    y: {
      grid: { color: 'rgba(255,255,255,0.06)' },
      ticks: { color: '#888', font: { size: 10 }, maxTicksLimit: 4 },
    },
  },
}
</script>

<template>
  <v-card class="pa-4" rounded="lg">
    <!-- Header row -->
    <div class="d-flex align-center justify-space-between mb-3">
      <div class="d-flex align-center ga-2">
        <v-icon :icon="widget.icon" color="primary" size="22" />
        <span class="text-subtitle-1 font-weight-bold">{{ widget.title }}</span>
      </div>
      <div class="d-flex align-center ga-2">
        <span class="text-body-2 font-weight-medium">{{ widget.headlineStat }}</span>
        <v-chip
          v-if="widget.comparison"
          size="x-small"
          variant="tonal"
          color="primary"
        >{{ widget.comparison }}</v-chip>
      </div>
    </div>

    <!-- Sparkline -->
    <div v-if="widget.sparkline.labels.length > 0" style="height: 120px" class="mb-3">
      <Bar :data="sparklineData" :options="sparklineOptions" />
    </div>
    <div v-else class="text-center text-caption text-medium-emphasis mb-3" style="height: 40px; line-height: 40px">
      No chart data
    </div>

    <!-- Insight sentences -->
    <div class="d-flex flex-column ga-1">
      <div
        v-for="(insight, i) in widget.insights"
        :key="i"
        class="d-flex align-start ga-2"
      >
        <v-icon
          :icon="insight.sentiment === 'positive' ? 'mdi-trending-up' : insight.sentiment === 'negative' ? 'mdi-trending-down' : 'mdi-minus'"
          :color="insight.sentiment === 'positive' ? 'success' : insight.sentiment === 'negative' ? 'warning' : 'medium-emphasis'"
          size="16"
          class="mt-0"
          style="flex-shrink:0; margin-top: 2px"
        />
        <span
          class="text-body-2"
          :class="`text-${sentimentColor(insight.sentiment)}`"
        >{{ insight.text }}</span>
      </div>
    </div>
  </v-card>
</template>
