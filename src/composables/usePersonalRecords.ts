import { computed } from 'vue'
import { format } from 'date-fns'
import { useActivitiesStore } from '@/stores/activities.store'
import type { PersonalRecord, DistanceBucket } from '@/types/activity'

const DISTANCE_BUCKETS: DistanceBucket[] = [
  { label: '5K', key: '5k', minMeters: 4900, maxMeters: 5500 },
  { label: '10K', key: '10k', minMeters: 9800, maxMeters: 10500 },
  { label: 'Half Marathon', key: 'hm', minMeters: 20900, maxMeters: 21500 },
  { label: 'Marathon', key: 'marathon', minMeters: 41900, maxMeters: 43000 },
]

export function usePersonalRecords() {
  const store = useActivitiesStore()

  const records = computed<PersonalRecord[]>(() => {
    return DISTANCE_BUCKETS.map((bucket) => {
      const matching = store.runActivities.filter(
        (a) => a.distance >= bucket.minMeters && a.distance <= bucket.maxMeters,
      )

      if (matching.length === 0) {
        return {
          label: bucket.label,
          distance: bucket.key,
          activity: null,
        }
      }

      const best = matching.reduce((fastest, current) =>
        current.moving_time < fastest.moving_time ? current : fastest,
      )

      return {
        label: bucket.label,
        distance: bucket.key,
        activity: {
          id: best.id,
          name: best.name,
          date: format(new Date(best.start_date_local), 'MMM d, yyyy'),
          movingTime: best.moving_time,
          pace: best.moving_time / best.distance,
        },
      }
    })
  })

  return {
    records,
    loading: computed(() => store.loadingAll),
    progress: computed(() => store.loadProgress),
    error: computed(() => store.error),
    fetchAll: () => store.fetchAll(),
    allFetched: computed(() => store.allFetched),
  }
}
