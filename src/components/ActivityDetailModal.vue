<script setup lang="ts">
import { computed } from 'vue'
import { format } from 'date-fns'
import type { StravaActivity } from '@/types/strava'
import { formatDistance, formatDuration, formatPace } from '@/composables/useFormatters'

const props = defineProps<{
  modelValue: boolean
  activity: StravaActivity | null
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const open = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v),
})

const formattedDate = computed(() => {
  if (!props.activity) return ''
  return format(new Date(props.activity.start_date_local), 'EEEE d MMMM yyyy, h:mm a')
})

const avgSpeedKmh = computed(() => {
  if (!props.activity) return ''
  return (props.activity.average_speed * 3.6).toFixed(1)
})

const sportIcon = computed(() => {
  const type = props.activity?.sport_type ?? ''
  switch (type) {
    case 'Run': return 'mdi-run'
    case 'TrailRun': return 'mdi-terrain'
    case 'Ride': return 'mdi-bike'
    case 'Walk': return 'mdi-walk'
    case 'Hike': return 'mdi-hiking'
    case 'Swim': return 'mdi-swim'
    default: return 'mdi-run'
  }
})

const stravaUrl = computed(() =>
  props.activity ? `https://www.strava.com/activities/${props.activity.id}` : '#',
)
</script>

<template>
  <v-dialog v-model="open" max-width="560" scrollable>
    <v-card v-if="activity">
      <v-card-title class="d-flex align-center justify-space-between pt-4">
        <div class="d-flex align-center ga-2">
          <v-icon :icon="sportIcon" size="24" />
          <span>{{ activity.name }}</span>
        </div>
        <v-btn icon="mdi-close" variant="text" size="small" @click="open = false" />
      </v-card-title>

      <v-card-subtitle class="pb-4">{{ formattedDate }}</v-card-subtitle>

      <v-card-text>
        <v-row dense>
          <v-col cols="6" sm="4">
            <div class="text-caption text-medium-emphasis">Distance</div>
            <div class="text-body-1 font-weight-medium">{{ formatDistance(activity.distance) }}</div>
          </v-col>
          <v-col cols="6" sm="4">
            <div class="text-caption text-medium-emphasis">Duration</div>
            <div class="text-body-1 font-weight-medium">{{ formatDuration(activity.moving_time) }}</div>
          </v-col>
          <v-col cols="6" sm="4">
            <div class="text-caption text-medium-emphasis">Pace</div>
            <div class="text-body-1 font-weight-medium">{{ formatPace(activity.moving_time, activity.distance) }}</div>
          </v-col>
          <v-col cols="6" sm="4">
            <div class="text-caption text-medium-emphasis">Elevation</div>
            <div class="text-body-1 font-weight-medium">{{ activity.total_elevation_gain }} m</div>
          </v-col>
          <v-col cols="6" sm="4">
            <div class="text-caption text-medium-emphasis">Elapsed Time</div>
            <div class="text-body-1 font-weight-medium">{{ formatDuration(activity.elapsed_time) }}</div>
          </v-col>
          <v-col cols="6" sm="4">
            <div class="text-caption text-medium-emphasis">Avg Speed</div>
            <div class="text-body-1 font-weight-medium">{{ avgSpeedKmh }} km/h</div>
          </v-col>
        </v-row>

        <template v-if="activity.has_heartrate">
          <v-divider class="my-4" />
          <v-row dense>
            <v-col cols="6" sm="4">
              <div class="text-caption text-medium-emphasis">Avg Heart Rate</div>
              <div class="text-body-1 font-weight-medium">{{ activity.average_heartrate }} bpm</div>
            </v-col>
            <v-col cols="6" sm="4">
              <div class="text-caption text-medium-emphasis">Max Heart Rate</div>
              <div class="text-body-1 font-weight-medium">{{ activity.max_heartrate }} bpm</div>
            </v-col>
            <v-col v-if="activity.suffer_score" cols="6" sm="4">
              <div class="text-caption text-medium-emphasis">Suffer Score</div>
              <div class="text-body-1 font-weight-medium">{{ activity.suffer_score }}</div>
            </v-col>
          </v-row>
        </template>
      </v-card-text>

      <v-card-actions>
        <v-spacer />
        <v-btn
          color="primary"
          variant="tonal"
          :href="stravaUrl"
          target="_blank"
          prepend-icon="mdi-open-in-new"
        >
          View on Strava
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
