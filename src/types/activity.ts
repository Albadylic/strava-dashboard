export interface ActivitySummary {
  totalDistance: number
  totalTime: number
  runCount: number
  averagePace: number
}

export interface PersonalRecord {
  label: string
  distance: string
  activity: {
    id: number
    name: string
    date: string
    movingTime: number
    pace: number
  } | null
}

export interface DistanceBucket {
  label: string
  key: string
  minMeters: number
  maxMeters: number
}
