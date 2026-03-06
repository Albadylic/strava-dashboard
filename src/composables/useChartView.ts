import { ref, computed } from 'vue'
import { format, startOfISOWeek, subMonths, subYears } from 'date-fns'
import { useActivitiesStore } from '@/stores/activities.store'
import type { TimePeriod, AggregationMode } from '@/types/activity'
import type { StravaActivity } from '@/types/strava'

export function useChartView() {
  const store = useActivitiesStore()

  const timePeriod = ref<TimePeriod>('last-6-months')
  const aggregationMode = ref<AggregationMode>('per-activity')

  const cutoffDate = computed(() => {
    const now = new Date()
    switch (timePeriod.value) {
      case 'last-month':
        return subMonths(now, 1)
      case 'last-6-months':
        return subMonths(now, 6)
      case 'last-year':
        return subYears(now, 1)
      case 'all-time':
        return null
    }
  })

  const filteredRuns = computed(() => {
    const runs = store.runActivities.filter((a) => a.distance > 0)
    if (!cutoffDate.value) return runs
    const cutoff = cutoffDate.value.getTime()
    return runs.filter((a) => new Date(a.start_date).getTime() >= cutoff)
  })

  const sortedRuns = computed(() =>
    [...filteredRuns.value].sort(
      (a, b) => new Date(a.start_date_local).getTime() - new Date(b.start_date_local).getTime(),
    ),
  )

  const perActivityPaceData = computed(() => {
    const labels = sortedRuns.value.map((a) =>
      format(new Date(a.start_date_local), 'MMM d'),
    )
    const data = sortedRuns.value.map((a) =>
      Math.round(((a.moving_time / 60) / (a.distance / 1000)) * 100) / 100,
    )
    return { labels, data, activities: sortedRuns.value }
  })

  const perActivityDistanceData = computed(() => {
    const labels = sortedRuns.value.map((a) =>
      format(new Date(a.start_date_local), 'MMM d'),
    )
    const data = sortedRuns.value.map((a) =>
      Math.round((a.distance / 1000) * 100) / 100,
    )
    return { labels, data, activities: sortedRuns.value }
  })

  const weekGroups = computed(() => {
    const groups = new Map<string, typeof filteredRuns.value>()
    for (const run of filteredRuns.value) {
      const weekStart = startOfISOWeek(new Date(run.start_date_local))
      const key = weekStart.toISOString()
      if (!groups.has(key)) groups.set(key, [])
      groups.get(key)!.push(run)
    }
    return Array.from(groups.entries())
      .sort(([a], [b]) => a.localeCompare(b))
  })

  const weeklyPaceData = computed(() => {
    const labels: string[] = []
    const data: number[] = []
    const activityGroups: StravaActivity[][] = []
    for (const [key, runs] of weekGroups.value) {
      const totalTime = runs.reduce((s, r) => s + r.moving_time, 0)
      const totalDist = runs.reduce((s, r) => s + r.distance, 0)
      labels.push(format(new Date(key), 'MMM d'))
      data.push(
        Math.round(((totalTime / 60) / (totalDist / 1000)) * 100) / 100,
      )
      activityGroups.push(runs)
    }
    return { labels, data, activityGroups }
  })

  const weeklyDistanceData = computed(() => {
    const labels: string[] = []
    const data: number[] = []
    const activityGroups: StravaActivity[][] = []
    for (const [key, runs] of weekGroups.value) {
      const totalDist = runs.reduce((s, r) => s + r.distance, 0)
      labels.push(format(new Date(key), 'MMM d'))
      data.push(Math.round((totalDist / 1000) * 100) / 100)
      activityGroups.push(runs)
    }
    return { labels, data, activityGroups }
  })

  async function fetchAll() {
    await store.fetchAll()
  }

  return {
    timePeriod,
    aggregationMode,
    perActivityPaceData,
    perActivityDistanceData,
    weeklyPaceData,
    weeklyDistanceData,
    loading: computed(() => store.loadingAll),
    progress: computed(() => store.loadProgress),
    allFetched: computed(() => store.allFetched),
    error: computed(() => store.error),
    fetchAll,
  }
}
