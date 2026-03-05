import type { StravaActivity } from '@/types/strava'
import { useAuthStore } from '@/stores/auth.store'

const BASE_URL = 'https://www.strava.com/api/v3'
const PER_PAGE = 100

async function apiFetch<T>(path: string, params?: Record<string, string>): Promise<T> {
  const authStore = useAuthStore()
  const token = await authStore.ensureValidToken()

  const url = new URL(`${BASE_URL}${path}`)
  if (params) {
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v))
  }

  const response = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${token}` },
  })

  if (response.status === 429) {
    throw new Error('Rate limited by Strava. Please wait a few minutes and try again.')
  }

  if (!response.ok) {
    throw new Error(`Strava API error: ${response.status}`)
  }

  return response.json()
}

export async function fetchActivities(
  after?: number,
  before?: number,
  page = 1,
  perPage = PER_PAGE,
): Promise<StravaActivity[]> {
  const params: Record<string, string> = {
    page: String(page),
    per_page: String(perPage),
  }
  if (after) params.after = String(after)
  if (before) params.before = String(before)

  return apiFetch<StravaActivity[]>('/athlete/activities', params)
}

export async function fetchActivitiesInRange(
  after: number,
  before: number,
): Promise<StravaActivity[]> {
  const all: StravaActivity[] = []
  let page = 1

  while (true) {
    const batch = await fetchActivities(after, before, page, PER_PAGE)
    all.push(...batch)
    if (batch.length < PER_PAGE) break
    page++
  }

  return all
}

export async function fetchAllActivities(
  onProgress?: (count: number) => void,
): Promise<StravaActivity[]> {
  const all: StravaActivity[] = []
  let page = 1

  while (true) {
    const batch = await fetchActivities(undefined, undefined, page, PER_PAGE)
    all.push(...batch)
    onProgress?.(all.length)
    if (batch.length < PER_PAGE) break
    page++
  }

  return all
}
