<script setup lang="ts">
import { ref, computed } from 'vue'
import { format, startOfWeek, isSameDay } from 'date-fns'
import { useWeekActivities } from '@/composables/useWeekActivities'
import { formatDistance, formatDuration, formatPaceFromSecondsPerMeter } from '@/composables/useFormatters'
import type { StravaActivity } from '@/types/strava'
import ActivitySummaryCard from '@/components/ActivitySummaryCard.vue'
import ActivityTable from '@/components/ActivityTable.vue'
import WeeklyDistanceChart from '@/components/WeeklyDistanceChart.vue'
import PaceTrendChart from '@/components/PaceTrendChart.vue'
import LoadingOverlay from '@/components/LoadingOverlay.vue'
import DateNavigation from '@/components/DateNavigation.vue'
import ActivityDetailModal from '@/components/ActivityDetailModal.vue'

const selectedDate = ref(new Date())
const selectedActivity = ref<StravaActivity | null>(null)
const showModal = ref(false)

function openDetail(activity: StravaActivity) {
  selectedActivity.value = activity
  showModal.value = true
}
const { weekStart, weekEnd, weekRuns, summary, loading } = useWeekActivities(selectedDate)

const isCurrentWeek = computed(() =>
  isSameDay(weekStart.value, startOfWeek(new Date(), { weekStartsOn: 1 })),
)

const dateRange = computed(() =>
  `${format(weekStart.value, 'MMM d')} – ${format(weekEnd.value, 'MMM d, yyyy')}`,
)

const heading = computed(() => isCurrentWeek.value ? 'This Week' : dateRange.value)
</script>

<template>
  <div>
    <div class="d-flex align-center mb-6">
      <div>
        <h1 class="text-h4 font-weight-bold">{{ heading }}</h1>
        <DateNavigation
          v-model="selectedDate"
          :label="dateRange"
          :is-current-period="isCurrentWeek"
          mode="week"
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
          <WeeklyDistanceChart :activities="weekRuns" :week-start="weekStart" @data-point-click="openDetail" />
        </v-card>
      </v-col>
      <v-col cols="12" md="6">
        <v-card class="pa-4">
          <v-card-title class="text-h6 pb-4">Pace Trend</v-card-title>
          <PaceTrendChart :activities="weekRuns" @data-point-click="openDetail" />
        </v-card>
      </v-col>
    </v-row>

    <v-card>
      <v-card-title class="text-h6">Activities</v-card-title>
      <ActivityTable :activities="weekRuns" />
    </v-card>
    <ActivityDetailModal v-model="showModal" :activity="selectedActivity" />
  </div>
</template>
