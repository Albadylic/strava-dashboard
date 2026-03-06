<script setup lang="ts">
import { ref, computed } from 'vue'
import { format, startOfMonth, isSameDay } from 'date-fns'
import { useMonthActivities } from '@/composables/useMonthActivities'
import { formatDistance, formatDuration, formatPaceFromSecondsPerMeter } from '@/composables/useFormatters'
import ActivitySummaryCard from '@/components/ActivitySummaryCard.vue'
import ActivityTable from '@/components/ActivityTable.vue'
import MonthlyDistanceChart from '@/components/MonthlyDistanceChart.vue'
import PaceTrendChart from '@/components/PaceTrendChart.vue'
import LoadingOverlay from '@/components/LoadingOverlay.vue'
import DateNavigation from '@/components/DateNavigation.vue'

const selectedDate = ref(new Date())
const { monthStart, monthEnd, monthRuns, summary, loading } = useMonthActivities(selectedDate)

const isCurrentMonth = computed(() =>
  isSameDay(monthStart.value, startOfMonth(new Date())),
)

const dateRange = computed(() => format(monthStart.value, 'MMMM yyyy'))

const heading = computed(() => isCurrentMonth.value ? 'This Month' : dateRange.value)
</script>

<template>
  <div>
    <div class="d-flex align-center mb-6">
      <div>
        <h1 class="text-h4 font-weight-bold">{{ heading }}</h1>
        <DateNavigation
          v-model="selectedDate"
          :label="dateRange"
          :is-current-period="isCurrentMonth"
          mode="month"
        />
      </div>
    </div>

    <LoadingOverlay :loading="loading" />

    <v-row class="mb-6">
      <v-col cols="12" sm="6" md="3">
        <ActivitySummaryCard
          title="Total Distance"
          :value="formatDistance(summary.totalDistance)"
          icon="mdi-map-marker-distance"
        />
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <ActivitySummaryCard
          title="Total Time"
          :value="formatDuration(summary.totalTime)"
          icon="mdi-clock-outline"
          color="secondary"
        />
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <ActivitySummaryCard
          title="Runs"
          :value="String(summary.runCount)"
          icon="mdi-run"
          color="success"
        />
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <ActivitySummaryCard
          title="Avg Pace"
          :value="formatPaceFromSecondsPerMeter(summary.averagePace)"
          icon="mdi-speedometer"
          color="warning"
        />
      </v-col>
    </v-row>

    <v-row class="mb-6">
      <v-col cols="12" md="6">
        <v-card class="pa-4">
          <v-card-title class="text-h6 pb-4">Distance by Day</v-card-title>
          <MonthlyDistanceChart :activities="monthRuns" :month-start="monthStart" :month-end="monthEnd" />
        </v-card>
      </v-col>
      <v-col cols="12" md="6">
        <v-card class="pa-4">
          <v-card-title class="text-h6 pb-4">Pace Trend</v-card-title>
          <PaceTrendChart :activities="monthRuns" />
        </v-card>
      </v-col>
    </v-row>

    <v-card>
      <v-card-title class="text-h6">Activities</v-card-title>
      <ActivityTable :activities="monthRuns" />
    </v-card>
  </div>
</template>
