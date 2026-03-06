import { computed } from 'vue'
import { format } from 'date-fns'
import { useActivitiesStore } from '@/stores/activities.store'
import type { PersonalRecord } from '@/types/activity'

const PR_DISTANCES = [
  { label: '5K', effortName: '5K', canonicalDistance: 5000 },
  { label: '10K', effortName: '10K', canonicalDistance: 10000 },
  { label: 'Half Marathon', effortName: 'Half-Marathon', canonicalDistance: 21097.5 },
  { label: 'Marathon', effortName: 'Marathon', canonicalDistance: 42195 },
]

export function usePersonalRecords() {
  const store = useActivitiesStore()

  const records = computed<PersonalRecord[]>(() => {
    return PR_DISTANCES.map((dist) => {
      const matching: { activityId: number; movingTime: number }[] = []

      for (const [activityId, efforts] of store.bestEfforts) {
        for (const effort of efforts) {
          if (effort.name === dist.effortName) {
            matching.push({ activityId, movingTime: effort.moving_time })
          }
        }
      }

      matching.sort((a, b) => a.movingTime - b.movingTime)

      const topEfforts = matching.slice(0, 3).map((m) => {
        const activity = store.activities.get(m.activityId)
        return {
          id: m.activityId,
          name: activity?.name ?? 'Unknown',
          date: activity
            ? format(new Date(activity.start_date_local), 'MMM d, yyyy')
            : '',
          movingTime: m.movingTime,
          pace: m.movingTime / dist.canonicalDistance,
        }
      })

      return {
        label: dist.label,
        distance: dist.effortName.toLowerCase(),
        canonicalDistance: dist.canonicalDistance,
        topEfforts,
      }
    })
  })

  async function fetchAll() {
    await store.fetchAll()
    await store.fetchBestEffortsForRuns()
  }

  return {
    records,
    loading: computed(() => store.loadingAll),
    progress: computed(() => store.loadProgress),
    loadingDetails: computed(() => store.loadingDetails),
    detailProgress: computed(() => store.detailProgress),
    detailTotal: computed(() => store.detailTotal),
    error: computed(() => store.error),
    fetchAll,
    allFetched: computed(() => store.allFetched),
  }
}
