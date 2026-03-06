export interface ActivitySummary {
  totalDistance: number
  totalTime: number
  runCount: number
  averagePace: number
}

export interface PersonalRecord {
  label: string
  distance: string
  canonicalDistance: number
  topEfforts: {
    id: number
    name: string
    date: string
    movingTime: number
    pace: number
  }[]
}

export interface WeekSummary {
  weekStart: string
  weekEnd: string
  weekLabel: string
  totalDistance: number
  longestRun: number
  totalTime: number
  runCount: number
  averagePace: number
  prs: { distanceName: string; movingTime: number }[]
}

export type TimePeriod = 'last-month' | 'last-6-months' | 'last-year' | 'all-time'

export type AggregationMode = 'per-activity' | 'weekly'
