import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { StravaActivity } from '@/types/strava'
import { fetchActivitiesInRange, fetchAllActivities } from '@/services/strava-api'

export const useActivitiesStore = defineStore('activities', () => {
  const activities = ref<Map<number, StravaActivity>>(new Map())
  const loading = ref(false)
  const loadingAll = ref(false)
  const loadProgress = ref(0)
  const error = ref<string | null>(null)
  const allFetched = ref(false)

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

  return {
    activities,
    loading,
    loadingAll,
    loadProgress,
    error,
    allFetched,
    allActivities,
    runActivities,
    fetchRange,
    fetchAll,
  }
})
