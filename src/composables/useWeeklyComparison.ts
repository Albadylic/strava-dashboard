import { ref, computed } from 'vue'
import { startOfISOWeek, endOfISOWeek, format, subMonths, subYears } from 'date-fns'
import { useActivitiesStore } from '@/stores/activities.store'
import type { WeekSummary, TimePeriod } from '@/types/activity'

const PR_EFFORT_NAMES = ['5K', '10K', 'Half-Marathon', 'Marathon']

export function useWeeklyComparison() {
  const store = useActivitiesStore()
  const timePeriod = ref<TimePeriod>('last-6-months')

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
    if (!cutoffDate.value) return store.runActivities
    const cutoff = cutoffDate.value.getTime()
    return store.runActivities.filter(
      (a) => new Date(a.start_date).getTime() >= cutoff,
    )
  })

  const prsByActivityId = computed(() => {
    const map = new Map<number, { distanceName: string; movingTime: number }[]>()
    for (const [activityId, efforts] of store.bestEfforts) {
      for (const effort of efforts) {
        if (effort.pr_rank === 1 && PR_EFFORT_NAMES.includes(effort.name)) {
          if (!map.has(activityId)) map.set(activityId, [])
          map.get(activityId)!.push({
            distanceName: effort.name,
            movingTime: effort.moving_time,
          })
        }
      }
    }
    return map
  })

  const weeks = computed<WeekSummary[]>(() => {
    const weekMap = new Map<string, typeof filteredRuns.value>()

    for (const run of filteredRuns.value) {
      const date = new Date(run.start_date_local)
      const weekStart = startOfISOWeek(date)
      const key = weekStart.toISOString()
      if (!weekMap.has(key)) weekMap.set(key, [])
      weekMap.get(key)!.push(run)
    }

    const summaries: WeekSummary[] = []

    for (const [key, runs] of weekMap) {
      const weekStart = new Date(key)
      const weekEnd = endOfISOWeek(weekStart)

      const totalDistance = runs.reduce((sum, r) => sum + r.distance, 0)
      const longestRun = Math.max(...runs.map((r) => r.distance))
      const totalTime = runs.reduce((sum, r) => sum + r.moving_time, 0)
      const runCount = runs.length
      const averagePace = totalDistance > 0 ? totalTime / totalDistance : 0

      const prs: { distanceName: string; movingTime: number }[] = []
      for (const run of runs) {
        const activityPrs = prsByActivityId.value.get(run.id)
        if (activityPrs) prs.push(...activityPrs)
      }

      summaries.push({
        weekStart: format(weekStart, 'yyyy-MM-dd'),
        weekEnd: format(weekEnd, 'yyyy-MM-dd'),
        weekLabel: `${format(weekStart, 'MMM d')} – ${format(weekEnd, 'MMM d, yyyy')}`,
        totalDistance,
        longestRun,
        totalTime,
        runCount,
        averagePace,
        prs,
      })
    }

    summaries.sort((a, b) => b.weekStart.localeCompare(a.weekStart))
    return summaries
  })

  async function fetchAll() {
    await store.fetchAll()
    await store.fetchBestEffortsForRuns()
  }

  return {
    timePeriod,
    weeks,
    loading: computed(() => store.loadingAll),
    progress: computed(() => store.loadProgress),
    loadingDetails: computed(() => store.loadingDetails),
    detailProgress: computed(() => store.detailProgress),
    detailTotal: computed(() => store.detailTotal),
    error: computed(() => store.error),
    allFetched: computed(() => store.allFetched),
    fetchAll,
  }
}
