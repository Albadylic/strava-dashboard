import { computed, watch, type Ref } from 'vue'
import { startOfMonth, endOfMonth } from 'date-fns'
import { useActivitiesStore } from '@/stores/activities.store'
import type { ActivitySummary } from '@/types/activity'

export function useMonthActivities(anchorDate: Ref<Date>) {
  const store = useActivitiesStore()

  const monthStart = computed(() => startOfMonth(anchorDate.value))
  const monthEnd = computed(() => endOfMonth(anchorDate.value))

  watch(monthStart, () => {
    store.fetchRange(monthStart.value, monthEnd.value)
  }, { immediate: true })

  const monthRuns = computed(() =>
    store.runActivities.filter((a) => {
      const date = new Date(a.start_date_local)
      return date >= monthStart.value && date <= monthEnd.value
    }),
  )

  const summary = computed<ActivitySummary>(() => {
    const runs = monthRuns.value
    const totalDistance = runs.reduce((sum, a) => sum + a.distance, 0)
    const totalTime = runs.reduce((sum, a) => sum + a.moving_time, 0)
    const runCount = runs.length
    const averagePace = totalDistance > 0 ? totalTime / totalDistance : 0

    return { totalDistance, totalTime, runCount, averagePace }
  })

  return {
    monthStart,
    monthEnd,
    monthRuns,
    summary,
    loading: computed(() => store.loading),
    error: computed(() => store.error),
  }
}
