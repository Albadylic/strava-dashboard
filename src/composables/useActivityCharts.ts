import { computed, type Ref } from 'vue'
import { format, eachDayOfInterval, isSameDay } from 'date-fns'
import type { StravaActivity } from '@/types/strava'

export function useDailyDistanceData(
  activities: Ref<StravaActivity[]>,
  start: Date,
  end: Date,
) {
  return computed(() => {
    const days = eachDayOfInterval({ start, end })

    const labels = days.map((d) => format(d, 'EEE d'))
    const data = days.map((day) => {
      const dayTotal = activities.value
        .filter((a) => isSameDay(new Date(a.start_date_local), day))
        .reduce((sum, a) => sum + a.distance / 1000, 0)
      return Math.round(dayTotal * 100) / 100
    })

    return { labels, data }
  })
}

export function usePaceTrendData(activities: Ref<StravaActivity[]>) {
  return computed(() => {
    const sorted = [...activities.value]
      .filter((a) => a.distance > 0)
      .sort((a, b) => new Date(a.start_date_local).getTime() - new Date(b.start_date_local).getTime())

    const labels = sorted.map((a) => format(new Date(a.start_date_local), 'MMM d'))
    const data = sorted.map((a) => {
      const paceMinPerKm = (a.moving_time / 60) / (a.distance / 1000)
      return Math.round(paceMinPerKm * 100) / 100
    })

    return { labels, data }
  })
}
