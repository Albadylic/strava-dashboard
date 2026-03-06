import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { StravaActivity, StravaBestEffort } from '@/types/strava'
import { fetchActivitiesInRange, fetchAllActivities, fetchActivityDetail } from '@/services/strava-api'

const BEST_EFFORTS_CACHE_KEY = 'strava-best-efforts'

function loadCachedBestEfforts(): Map<number, StravaBestEffort[]> {
  try {
    const raw = localStorage.getItem(BEST_EFFORTS_CACHE_KEY)
    if (!raw) return new Map()
    const entries: [number, StravaBestEffort[]][] = JSON.parse(raw)
    return new Map(entries)
  } catch {
    return new Map()
  }
}

function saveBestEffortsCache(map: Map<number, StravaBestEffort[]>) {
  try {
    const entries = Array.from(map.entries())
    localStorage.setItem(BEST_EFFORTS_CACHE_KEY, JSON.stringify(entries))
  } catch {
    // localStorage full or unavailable — silently ignore
  }
}

export const useActivitiesStore = defineStore('activities', () => {
  const activities = ref<Map<number, StravaActivity>>(new Map())
  const loading = ref(false)
  const loadingAll = ref(false)
  const loadProgress = ref(0)
  const error = ref<string | null>(null)
  const allFetched = ref(false)

  const bestEfforts = ref<Map<number, StravaBestEffort[]>>(loadCachedBestEfforts())
  const loadingDetails = ref(false)
  const detailProgress = ref(0)
  const detailTotal = ref(0)

  const allActivities = computed(() =>
    Array.from(activities.value.values()).sort(
      (a, b) => new Date(b.start_date).getTime() - new Date(a.start_date).getTime(),
    ),
  )

  const runActivities = computed(() =>
    allActivities.value.filter(
      (a) => a.type === 'Run' || a.sport_type === 'Run' || a.sport_type === 'TrailRun',
    ),
  )

  function mergeActivities(newActivities: StravaActivity[]) {
    const updated = new Map(activities.value)
    for (const activity of newActivities) {
      updated.set(activity.id, activity)
    }
    activities.value = updated
  }

  async function fetchRange(after: Date, before: Date) {
    loading.value = true
    error.value = null
    try {
      const afterEpoch = Math.floor(after.getTime() / 1000)
      const beforeEpoch = Math.floor(before.getTime() / 1000)
      const data = await fetchActivitiesInRange(afterEpoch, beforeEpoch)
      mergeActivities(data)
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to fetch activities'
      throw e
    } finally {
      loading.value = false
    }
  }

  async function fetchAll() {
    if (allFetched.value) return

    loadingAll.value = true
    loadProgress.value = 0
    error.value = null
    try {
      const data = await fetchAllActivities((count) => {
        loadProgress.value = count
      })
      mergeActivities(data)
      allFetched.value = true
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to fetch activities'
      throw e
    } finally {
      loadingAll.value = false
    }
  }

  async function fetchBestEffortsForRuns() {
    const runs = runActivities.value
    const unfetched = runs.filter((r) => !bestEfforts.value.has(r.id))

    if (unfetched.length === 0) return

    loadingDetails.value = true
    detailProgress.value = 0
    detailTotal.value = unfetched.length
    error.value = null

    try {
      for (const run of unfetched) {
        const detail = await fetchActivityDetail(run.id)
        const updated = new Map(bestEfforts.value)
        updated.set(run.id, detail.best_efforts ?? [])
        bestEfforts.value = updated
        detailProgress.value++
      }
      saveBestEffortsCache(bestEfforts.value)
    } catch (e) {
      // Save partial progress on any error (including rate limit)
      saveBestEffortsCache(bestEfforts.value)
      error.value = e instanceof Error ? e.message : 'Failed to fetch activity details'
      throw e
    } finally {
      loadingDetails.value = false
    }
  }

  return {
    activities,
    loading,
    loadingAll,
    loadProgress,
    error,
    allFetched,
    allActivities,
    runActivities,
    bestEfforts,
    loadingDetails,
    detailProgress,
    detailTotal,
    fetchRange,
    fetchAll,
    fetchBestEffortsForRuns,
  }
})
