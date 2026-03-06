export interface StravaAthlete {
  id: number
  firstname: string
  lastname: string
  profile: string
  profile_medium: string
  city: string
  state: string
  country: string
}

export interface StravaTokenResponse {
  token_type: string
  expires_at: number
  expires_in: number
  refresh_token: string
  access_token: string
  athlete: StravaAthlete
}

export interface StravaRefreshResponse {
  token_type: string
  expires_at: number
  expires_in: number
  refresh_token: string
  access_token: string
}

export interface StravaActivity {
  id: number
  name: string
  type: string
  sport_type: string
  distance: number
  moving_time: number
  elapsed_time: number
  total_elevation_gain: number
  start_date: string
  start_date_local: string
  timezone: string
  average_speed: number
  max_speed: number
  average_heartrate?: number
  max_heartrate?: number
  has_heartrate: boolean
  suffer_score?: number
  map: {
    id: string
    summary_polyline: string | null
  }
}

export interface StravaBestEffort {
  id: number
  name: string
  distance: number
  moving_time: number
  elapsed_time: number
  start_date_local: string
  pr_rank: number | null
  achievements: { type_id: number; type: string; rank: number }[]
}

export interface StravaDetailedActivity extends StravaActivity {
  best_efforts: StravaBestEffort[]
}
