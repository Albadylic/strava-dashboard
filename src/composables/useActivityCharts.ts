import { computed, type Ref } from 'vue'
import { format, eachDayOfInterval, isSameDay } from 'date-fns'
import type { StravaActivity } from '@/types/strava'

export function useDailyDistanceData(
  activities: Ref<StravaActivity[]>,
  start: Ref<Date>,
  end: Ref<Date>,
) {
  return computed(() => {
    const days = eachDayOfInterval({ start: start.value, end: end.value })

    const labels: string[] = []
    const data: number[] = []
    const activityGroups: StravaActivity[][] = []

    for (const day of days) {
      labels.push(format(day, 'EEE d'))
      const dayActivities = activities.value.filter((a) =>
        isSameDay(new Date(a.start_date_local), day),
      )
      const dayTotal = dayActivities.reduce((sum, a) => sum + a.distance / 1000, 0)
      data.push(Math.round(dayTotal * 100) / 100)
      activityGroups.push(dayActivities)
    }

    return { labels, data, activityGroups }
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

    return { labels, data, activities: sorted }
  })
}
