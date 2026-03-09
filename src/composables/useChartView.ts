import { ref, computed, watch } from 'vue'
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
      case 'last-3-months':
        return subMonths(now, 3)
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

  const distanceRange = ref<[number, number]>([0, 100])
  const elevationRange = ref<[number, number]>([0, 500])
  const paceRange = ref<[number, number]>([3, 15])
  const hrRange = ref<[number, number]>([100, 200])

  const filterBounds = computed(() => {
    const runs = filteredRuns.value
    if (!runs.length) return { minDist: 0, maxDist: 0, minElev: 0, maxElev: 0, minPace: 0, maxPace: 0, minHr: 100, maxHr: 200, hasHrData: false }

    const distances = runs.map(r => r.distance / 1000)
    const elevations = runs.map(r => r.total_elevation_gain)
    const paces = runs.map(r => (r.moving_time / 60) / (r.distance / 1000))
    const hrRuns = runs.filter(r => r.has_heartrate && r.average_heartrate)
    const hasHrData = hrRuns.length > 0

    return {
      minDist: Math.floor(Math.min(...distances) * 10) / 10,
      maxDist: Math.ceil(Math.max(...distances) * 10) / 10,
      minElev: 0,
      maxElev: Math.ceil(Math.max(...elevations)),
      minPace: Math.floor(Math.min(...paces) * 10) / 10,
      maxPace: Math.ceil(Math.max(...paces) * 10) / 10,
      minHr: hasHrData ? Math.floor(Math.min(...hrRuns.map(r => r.average_heartrate!))) : 100,
      maxHr: hasHrData ? Math.ceil(Math.max(...hrRuns.map(r => r.average_heartrate!))) : 200,
      hasHrData,
    }
  })

  watch(filterBounds, (b) => {
    distanceRange.value = [b.minDist, b.maxDist]
    elevationRange.value = [b.minElev, b.maxElev]
    paceRange.value = [b.minPace, b.maxPace]
    hrRange.value = [b.minHr, b.maxHr]
  }, { immediate: true })

  const activelyFilteredRuns = computed(() =>
    filteredRuns.value.filter(r => {
      const distKm = r.distance / 1000
      const pace = (r.moving_time / 60) / distKm
      const [minD, maxD] = distanceRange.value
      const [minE, maxE] = elevationRange.value
      const [minP, maxP] = paceRange.value
      if (distKm < minD || distKm > maxD) return false
      if (r.total_elevation_gain < minE || r.total_elevation_gain > maxE) return false
      if (pace < minP || pace > maxP) return false
      if (filterBounds.value.hasHrData && r.has_heartrate && r.average_heartrate != null) {
        const [minHr, maxHr] = hrRange.value
        if (r.average_heartrate < minHr || r.average_heartrate > maxHr) return false
      }
      return true
    })
  )

  const sortedRuns = computed(() =>
    [...activelyFilteredRuns.value].sort(
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
    const groups = new Map<string, typeof activelyFilteredRuns.value>()
    for (const run of activelyFilteredRuns.value) {
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
    distanceRange,
    elevationRange,
    paceRange,
    hrRange,
    filterBounds,
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
