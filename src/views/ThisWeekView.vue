<script setup lang="ts">
import { format } from 'date-fns'
import { useWeekActivities } from '@/composables/useWeekActivities'
import { formatDistance, formatDuration, formatPaceFromSecondsPerMeter } from '@/composables/useFormatters'
import ActivitySummaryCard from '@/components/ActivitySummaryCard.vue'
import ActivityTable from '@/components/ActivityTable.vue'
import WeeklyDistanceChart from '@/components/WeeklyDistanceChart.vue'
import PaceTrendChart from '@/components/PaceTrendChart.vue'
import LoadingOverlay from '@/components/LoadingOverlay.vue'

const { weekStart, weekEnd, weekRuns, summary, loading } = useWeekActivities()
const dateRange = `${format(weekStart, 'MMM d')} - ${format(weekEnd, 'MMM d, yyyy')}`
</script>

<template>
  <div>
    <div class="d-flex align-center mb-6">
      <div>
        <h1 class="text-h4 font-weight-bold">This Week</h1>
        <p class="text-body-1 text-medium-emphasis">{{ dateRange }}</p>
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
          <WeeklyDistanceChart :activities="weekRuns" :week-start="weekStart" />
        </v-card>
      </v-col>
      <v-col cols="12" md="6">
        <v-card class="pa-4">
          <v-card-title class="text-h6 pb-4">Pace Trend</v-card-title>
          <PaceTrendChart :activities="weekRuns" />
        </v-card>
      </v-col>
    </v-row>

    <v-card>
      <v-card-title class="text-h6">Activities</v-card-title>
      <ActivityTable :activities="weekRuns" />
    </v-card>
  </div>
</template>
