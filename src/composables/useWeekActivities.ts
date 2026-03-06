import { computed, watch, type Ref } from 'vue'
import { startOfWeek, endOfWeek } from 'date-fns'
import { useActivitiesStore } from '@/stores/activities.store'
import type { ActivitySummary } from '@/types/activity'

export function useWeekActivities(anchorDate: Ref<Date>) {
  const store = useActivitiesStore()

  const weekStart = computed(() => startOfWeek(anchorDate.value, { weekStartsOn: 1 }))
  const weekEnd = computed(() => endOfWeek(anchorDate.value, { weekStartsOn: 1 }))

  watch(weekStart, () => {
    store.fetchRange(weekStart.value, weekEnd.value)
  }, { immediate: true })

  const weekRuns = computed(() =>
    store.runActivities.filter((a) => {
      const date = new Date(a.start_date_local)
      return date >= weekStart.value && date <= weekEnd.value
    }),
  )

  const summary = computed<ActivitySummary>(() => {
    const runs = weekRuns.value
    const totalDistance = runs.reduce((sum, a) => sum + a.distance, 0)
    const totalTime = runs.reduce((sum, a) => sum + a.moving_time, 0)
    const runCount = runs.length
    const averagePace = totalDistance > 0 ? totalTime / totalDistance : 0

    return { totalDistance, totalTime, runCount, averagePace }
  })

  return {
    weekStart,
    weekEnd,
    weekRuns,
    summary,
    loading: computed(() => store.loading),
    error: computed(() => store.error),
  }
}
