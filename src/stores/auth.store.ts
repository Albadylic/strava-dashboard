import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { StravaAthlete } from '@/types/strava'
import {
  exchangeCodeForToken,
  refreshAccessToken,
  isTokenExpired,
} from '@/services/strava-auth'
import { router } from '@/plugins/router'

const STORAGE_KEY = 'strava-auth'

interface PersistedAuth {
  accessToken: string
  refreshToken: string
  expiresAt: number
  athlete: StravaAthlete
}

function loadFromStorage(): PersistedAuth | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as PersistedAuth
  } catch {
    return null
  }
}

function saveToStorage(data: PersistedAuth) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

function clearStorage() {
  localStorage.removeItem(STORAGE_KEY)
}

export const useAuthStore = defineStore('auth', () => {
  const persisted = loadFromStorage()

  const accessToken = ref(persisted?.accessToken ?? '')
  const refreshToken = ref(persisted?.refreshToken ?? '')
  const expiresAt = ref(persisted?.expiresAt ?? 0)
  const athlete = ref<StravaAthlete | null>(persisted?.athlete ?? null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const isAuthenticated = computed(() => !!accessToken.value)

  function persist() {
    if (!athlete.value) return
    saveToStorage({
      accessToken: accessToken.value,
      refreshToken: refreshToken.value,
      expiresAt: expiresAt.value,
      athlete: athlete.value,
    })
  }

  async function handleOAuthCallback(code: string) {
    loading.value = true
    error.value = null
    try {
      const data = await exchangeCodeForToken(code)
      accessToken.value = data.access_token
      refreshToken.value = data.refresh_token
      expiresAt.value = data.expires_at
      athlete.value = data.athlete
      persist()
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Authentication failed'
      throw e
    } finally {
      loading.value = false
    }
  }

  async function ensureValidToken(): Promise<string> {
    if (!isTokenExpired(expiresAt.value)) {
      return accessToken.value
    }

    try {
      const data = await refreshAccessToken(refreshToken.value)
      accessToken.value = data.access_token
      refreshToken.value = data.refresh_token
      expiresAt.value = data.expires_at
      persist()
      return accessToken.value
    } catch {
      logout()
      throw new Error('Session expired. Please log in again.')
    }
  }

  function logout() {
    accessToken.value = ''
    refreshToken.value = ''
    expiresAt.value = 0
    athlete.value = null
    clearStorage()
    router.push({ name: 'login' })
  }

  return {
    accessToken,
    refreshToken,
    expiresAt,
    athlete,
    loading,
    error,
    isAuthenticated,
    handleOAuthCallback,
    ensureValidToken,
    logout,
  }
})
