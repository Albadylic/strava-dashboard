<script setup lang="ts">
import { computed } from 'vue'
import { format } from 'date-fns'
import type { StravaActivity } from '@/types/strava'
import { formatDistance, formatDuration, formatPace } from '@/composables/useFormatters'

const props = defineProps<{
  activities: StravaActivity[]
}>()

const headers = [
  { title: 'Date', key: 'date', sortable: true },
  { title: 'Name', key: 'name', sortable: false },
  { title: 'Distance', key: 'distance', sortable: true },
  { title: 'Time', key: 'time', sortable: true },
  { title: 'Pace', key: 'pace', sortable: true },
  { title: 'Elevation', key: 'elevation', sortable: true },
]

const rows = computed(() =>
  props.activities.map((a) => ({
    id: a.id,
    date: format(new Date(a.start_date_local), 'EEE d MMM'),
    name: a.name,
    distance: formatDistance(a.distance),
    time: formatDuration(a.moving_time),
    pace: formatPace(a.moving_time, a.distance),
    elevation: `${Math.round(a.total_elevation_gain)}m`,
    rawDate: a.start_date_local,
    rawDistance: a.distance,
    rawTime: a.moving_time,
    rawPace: a.distance > 0 ? a.moving_time / a.distance : 0,
    rawElevation: a.total_elevation_gain,
  })),
)
</script>

<template>
  <v-data-table
    :headers="headers"
    :items="rows"
    :items-per-page="10"
    item-value="id"
    density="comfortable"
    class="elevation-1 rounded-lg"
  >
    <template #item.name="{ item }">
      <span class="font-weight-medium">{{ item.name }}</span>
    </template>
  </v-data-table>
</template>
