import type { StravaTokenResponse, StravaRefreshResponse } from '@/types/strava'

const STRAVA_AUTH_URL = 'https://www.strava.com/oauth/authorize'
const TOKEN_URL = '/api/strava-token'

export function buildAuthUrl(): string {
  const clientId = import.meta.env.VITE_STRAVA_CLIENT_ID
  const redirectUri = import.meta.env.VITE_STRAVA_REDIRECT_URI

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    approval_prompt: 'auto',
    scope: 'read,activity:read_all',
  })

  return `${STRAVA_AUTH_URL}?${params.toString()}`
}

export async function exchangeCodeForToken(code: string): Promise<StravaTokenResponse> {
  const response = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: import.meta.env.VITE_STRAVA_CLIENT_ID,
      client_secret: import.meta.env.VITE_STRAVA_CLIENT_SECRET,
      code,
      grant_type: 'authorization_code',
    }),
  })

  if (!response.ok) {
    throw new Error(`Token exchange failed: ${response.status}`)
  }

  return response.json()
}

export async function refreshAccessToken(refreshToken: string): Promise<StravaRefreshResponse> {
  const response = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: import.meta.env.VITE_STRAVA_CLIENT_ID,
      client_secret: import.meta.env.VITE_STRAVA_CLIENT_SECRET,
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    }),
  })

  if (!response.ok) {
    throw new Error(`Token refresh failed: ${response.status}`)
  }

  return response.json()
}

export function isTokenExpired(expiresAt: number): boolean {
  return Date.now() / 1000 >= expiresAt - 60
}
