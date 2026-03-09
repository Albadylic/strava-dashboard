import { computed } from 'vue'
import type { ComputedRef } from 'vue'
import { format, startOfISOWeek, eachWeekOfInterval } from 'date-fns'
import type { StravaActivity } from '@/types/strava'

export interface InsightWidget {
  id: 'pace' | 'volume' | 'consistency' | 'effort'
  title: string
  icon: string
  headlineStat: string
  sparkline: { labels: string[]; data: number[] }
  insights: { text: string; sentiment: 'positive' | 'neutral' | 'negative' }[]
  comparison?: string
}

function fmtPace(minPerKm: number): string {
  if (!isFinite(minPerKm) || minPerKm <= 0) return '—'
  const mins = Math.floor(minPerKm)
  const secs = Math.round((minPerKm - mins) * 60)
  return `${mins}:${String(secs).padStart(2, '0')}/km`
}

function weightedAvgPace(runs: StravaActivity[]): number {
  const totalTime = runs.reduce((s, r) => s + r.moving_time, 0)
  const totalDist = runs.reduce((s, r) => s + r.distance, 0)
  if (totalDist === 0) return 0
  return (totalTime / 60) / (totalDist / 1000)
}

function weeklyGroups(runs: StravaActivity[]): Map<string, StravaActivity[]> {
  const groups = new Map<string, StravaActivity[]>()
  for (const run of runs) {
    const weekStart = startOfISOWeek(new Date(run.start_date_local))
    const key = format(weekStart, 'yyyy-MM-dd')
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key)!.push(run)
  }
  return groups
}

function allWeekLabels(runs: StravaActivity[]): string[] {
  if (runs.length === 0) return []
  const dates = runs.map(r => new Date(r.start_date_local))
  const minDate = new Date(Math.min(...dates.map(d => d.getTime())))
  const maxDate = new Date(Math.max(...dates.map(d => d.getTime())))
  const weeks = eachWeekOfInterval({ start: startOfISOWeek(minDate), end: maxDate }, { weekStartsOn: 1 })
  return weeks.map(w => format(w, 'MMM d'))
}

function paceDeltaLabel(current: number, prior: number): string {
  if (prior === 0) return ''
  const deltaSecs = Math.round((current - prior) * 60)
  const absSecs = Math.abs(deltaSecs)
  const sign = deltaSecs < 0 ? '▼' : '▲'
  return `${sign} ${absSecs}s/km vs prior period`
}

function pctDelta(current: number, prior: number): string {
  if (prior === 0) return ''
  const pct = Math.round(((current - prior) / prior) * 100)
  const sign = pct >= 0 ? '+' : ''
  return `${sign}${pct}% vs prior period`
}

function computePaceWidget(runs: StravaActivity[], priorRuns: StravaActivity[]): InsightWidget {
  const avgPace = weightedAvgPace(runs)
  const priorAvgPace = weightedAvgPace(priorRuns)

  // Sparkline: weekly avg pace
  const groups = weeklyGroups(runs)
  const labels = allWeekLabels(runs)
  const data = labels.map(label => {
    // Match label to group
    const key = Array.from(groups.keys()).find(k => format(new Date(k), 'MMM d') === label)
    if (!key || !groups.has(key)) return 0
    return Math.round(weightedAvgPace(groups.get(key)!) * 100) / 100
  })

  // Insights
  const insights: InsightWidget['insights'] = []

  if (runs.length === 0) {
    insights.push({ text: 'No runs in this period.', sentiment: 'neutral' })
  } else {
    // Pace trend
    if (priorAvgPace > 0) {
      const deltaSecs = (avgPace - priorAvgPace) * 60
      if (deltaSecs < -5) {
        insights.push({ text: `Your average pace improved by ${Math.abs(Math.round(deltaSecs))}s/km compared to the prior period.`, sentiment: 'positive' })
      } else if (deltaSecs > 5) {
        insights.push({ text: `Your average pace slowed by ${Math.round(deltaSecs)}s/km compared to the prior period.`, sentiment: 'negative' })
      } else {
        insights.push({ text: `Your average pace is consistent with the prior period.`, sentiment: 'neutral' })
      }
    }

    // Fastest run
    const fastestRun = runs.reduce((best, r) => {
      const pace = (r.moving_time / 60) / (r.distance / 1000)
      return pace < (best.moving_time / 60) / (best.distance / 1000) ? r : best
    })
    const fastestPace = (fastestRun.moving_time / 60) / (fastestRun.distance / 1000)
    insights.push({ text: `Fastest run: ${fmtPace(fastestPace)} on ${format(new Date(fastestRun.start_date_local), 'MMM d')} (${Math.round(fastestRun.distance / 100) / 10}km).`, sentiment: 'positive' })

    // Long runs dragging pace
    const longRuns = runs.filter(r => r.distance >= 15000)
    if (longRuns.length > 0) {
      const longAvgPace = weightedAvgPace(longRuns)
      const shortRuns = runs.filter(r => r.distance < 15000)
      if (shortRuns.length > 0) {
        const shortAvgPace = weightedAvgPace(shortRuns)
        const diff = longAvgPace - shortAvgPace
        if (diff > 0.5) {
          insights.push({ text: `Long runs (≥15km) average ${fmtPace(longAvgPace)}, pulling overall pace down — expected for easy long efforts.`, sentiment: 'neutral' })
        }
      }
    }
  }

  const comparison = priorAvgPace > 0 ? paceDeltaLabel(avgPace, priorAvgPace) : undefined

  return {
    id: 'pace',
    title: 'Pace',
    icon: 'mdi-speedometer',
    headlineStat: runs.length > 0 ? `Avg pace: ${fmtPace(avgPace)}` : 'No data',
    sparkline: { labels, data },
    insights,
    comparison,
  }
}

function computeVolumeWidget(runs: StravaActivity[], priorRuns: StravaActivity[]): InsightWidget {
  const totalKm = runs.reduce((s, r) => s + r.distance / 1000, 0)
  const priorTotalKm = priorRuns.reduce((s, r) => s + r.distance / 1000, 0)

  // Weekly volumes
  const groups = weeklyGroups(runs)
  const labels = allWeekLabels(runs)
  const data = labels.map(label => {
    const key = Array.from(groups.keys()).find(k => format(new Date(k), 'MMM d') === label)
    if (!key || !groups.has(key)) return 0
    return Math.round(groups.get(key)!.reduce((s, r) => s + r.distance / 1000, 0) * 10) / 10
  })

  const totalWeeks = labels.length || 1
  const avgWeeklyKm = totalKm / totalWeeks

  const longestRun = runs.length > 0
    ? Math.max(...runs.map(r => r.distance / 1000))
    : 0

  const insights: InsightWidget['insights'] = []

  if (runs.length === 0) {
    insights.push({ text: 'No runs in this period.', sentiment: 'neutral' })
  } else {
    if (priorTotalKm > 0) {
      const pct = ((totalKm - priorTotalKm) / priorTotalKm) * 100
      if (pct >= 10) {
        insights.push({ text: `Volume is up ${Math.round(pct)}% vs prior period — good load progression.`, sentiment: 'positive' })
      } else if (pct <= -10) {
        insights.push({ text: `Volume is down ${Math.round(Math.abs(pct))}% vs prior period.`, sentiment: 'negative' })
      } else {
        insights.push({ text: `Volume is consistent with the prior period (${pct >= 0 ? '+' : ''}${Math.round(pct)}%).`, sentiment: 'neutral' })
      }
    }

    insights.push({ text: `${Math.round(avgWeeklyKm * 10) / 10}km/week average across ${totalWeeks} week${totalWeeks !== 1 ? 's' : ''}.`, sentiment: 'neutral' })

    if (longestRun >= 30) {
      insights.push({ text: `Longest run: ${Math.round(longestRun * 10) / 10}km — a solid ultra-distance effort.`, sentiment: 'positive' })
    } else if (longestRun >= 21) {
      insights.push({ text: `Longest run: ${Math.round(longestRun * 10) / 10}km — half marathon distance or beyond.`, sentiment: 'positive' })
    } else {
      insights.push({ text: `Longest run: ${Math.round(longestRun * 10) / 10}km.`, sentiment: 'neutral' })
    }
  }

  const comparison = priorTotalKm > 0 ? pctDelta(totalKm, priorTotalKm) : undefined

  return {
    id: 'volume',
    title: 'Volume',
    icon: 'mdi-map-marker-distance',
    headlineStat: runs.length > 0 ? `Total: ${Math.round(totalKm)}km` : 'No data',
    sparkline: { labels, data },
    insights,
    comparison,
  }
}

function computeConsistencyWidget(runs: StravaActivity[], priorRuns: StravaActivity[]): InsightWidget {
  const groups = weeklyGroups(runs)
  const labels = allWeekLabels(runs)
  const data = labels.map(label => {
    const key = Array.from(groups.keys()).find(k => format(new Date(k), 'MMM d') === label)
    if (!key || !groups.has(key)) return 0
    return groups.get(key)!.length
  })

  const totalWeeks = labels.length || 1
  const activeWeeks = data.filter(c => c > 0).length
  const consistencyPct = Math.round((activeWeeks / totalWeeks) * 100)
  const avgRunsPerWeek = Math.round((runs.length / totalWeeks) * 10) / 10

  // Compute current streak (consecutive days with a run up to the most recent run)
  const runDays = new Set(runs.map(r => format(new Date(r.start_date_local), 'yyyy-MM-dd')))
  let currentStreak = 0
  const today = new Date()
  for (let i = 0; i < 365; i++) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    if (runDays.has(format(d, 'yyyy-MM-dd'))) {
      currentStreak++
    } else if (i > 0) {
      break
    }
  }

  const priorGroups = weeklyGroups(priorRuns)
  const priorLabels = allWeekLabels(priorRuns)
  const priorActiveWeeks = priorLabels.filter(label => {
    const key = Array.from(priorGroups.keys()).find(k => format(new Date(k), 'MMM d') === label)
    return key && priorGroups.has(key) && priorGroups.get(key)!.length > 0
  }).length
  const priorTotalWeeks = priorLabels.length || 1
  const priorConsistencyPct = Math.round((priorActiveWeeks / priorTotalWeeks) * 100)

  const insights: InsightWidget['insights'] = []

  if (runs.length === 0) {
    insights.push({ text: 'No runs in this period.', sentiment: 'neutral' })
  } else {
    if (priorRuns.length > 0) {
      const delta = consistencyPct - priorConsistencyPct
      if (delta >= 10) {
        insights.push({ text: `Running consistency improved by ${delta}pp vs prior period (${priorConsistencyPct}% → ${consistencyPct}% active weeks).`, sentiment: 'positive' })
      } else if (delta <= -10) {
        insights.push({ text: `Running consistency dropped by ${Math.abs(delta)}pp vs prior period (${priorConsistencyPct}% → ${consistencyPct}% active weeks).`, sentiment: 'negative' })
      } else {
        insights.push({ text: `Consistency is steady: ${consistencyPct}% of weeks had at least one run.`, sentiment: 'neutral' })
      }
    } else {
      insights.push({ text: `Active ${activeWeeks} of ${totalWeeks} weeks (${consistencyPct}%).`, sentiment: consistencyPct >= 75 ? 'positive' : consistencyPct >= 50 ? 'neutral' : 'negative' })
    }

    insights.push({ text: `Averaging ${avgRunsPerWeek} run${avgRunsPerWeek !== 1 ? 's' : ''}/week.`, sentiment: avgRunsPerWeek >= 3 ? 'positive' : avgRunsPerWeek >= 2 ? 'neutral' : 'negative' })

    if (currentStreak > 0) {
      insights.push({ text: `Current streak: ${currentStreak} consecutive day${currentStreak !== 1 ? 's' : ''} with a run.`, sentiment: currentStreak >= 7 ? 'positive' : 'neutral' })
    }
  }

  const comparison = priorRuns.length > 0 ? `${consistencyPct >= priorConsistencyPct ? '▲' : '▼'} ${Math.abs(consistencyPct - priorConsistencyPct)}pp vs prior period` : undefined

  return {
    id: 'consistency',
    title: 'Consistency',
    icon: 'mdi-calendar-check',
    headlineStat: runs.length > 0 ? `${consistencyPct}% active weeks` : 'No data',
    sparkline: { labels, data },
    insights,
    comparison,
  }
}

function computeEffortWidget(runs: StravaActivity[], priorRuns: StravaActivity[]): InsightWidget {
  function categoriseRun(r: StravaActivity): 'easy' | 'moderate' | 'tempo' {
    const pace = (r.moving_time / 60) / (r.distance / 1000)
    if (pace > 6) return 'easy'
    if (pace >= 5) return 'moderate'
    return 'tempo'
  }

  function zoneKm(runList: StravaActivity[]) {
    let easy = 0, moderate = 0, tempo = 0
    for (const r of runList) {
      const km = r.distance / 1000
      const zone = categoriseRun(r)
      if (zone === 'easy') easy += km
      else if (zone === 'moderate') moderate += km
      else tempo += km
    }
    return { easy, moderate, tempo }
  }

  const zones = zoneKm(runs)
  const totalKm = zones.easy + zones.moderate + zones.tempo

  const easyPct = totalKm > 0 ? Math.round((zones.easy / totalKm) * 100) : 0
  const moderatePct = totalKm > 0 ? Math.round((zones.moderate / totalKm) * 100) : 0
  const tempoPct = totalKm > 0 ? Math.round((zones.tempo / totalKm) * 100) : 0

  // Sparkline: weekly easy%
  const groups = weeklyGroups(runs)
  const labels = allWeekLabels(runs)
  const data = labels.map(label => {
    const key = Array.from(groups.keys()).find(k => format(new Date(k), 'MMM d') === label)
    if (!key || !groups.has(key)) return 0
    const weekRuns = groups.get(key)!
    const wz = zoneKm(weekRuns)
    const wTotal = wz.easy + wz.moderate + wz.tempo
    return wTotal > 0 ? Math.round((wz.easy / wTotal) * 100) : 0
  })

  const priorZones = zoneKm(priorRuns)
  const priorTotalKm = priorZones.easy + priorZones.moderate + priorZones.tempo
  const priorEasyPct = priorTotalKm > 0 ? Math.round((priorZones.easy / priorTotalKm) * 100) : 0

  const insights: InsightWidget['insights'] = []

  if (runs.length === 0) {
    insights.push({ text: 'No runs in this period.', sentiment: 'neutral' })
  } else {
    // Polarisation check: good training often has >70% easy + some tempo, little moderate
    const isPolarised = easyPct >= 70 && tempoPct >= 10 && moderatePct < 25
    const isBalanced = moderatePct >= 30 && moderatePct <= 60
    if (isPolarised) {
      insights.push({ text: `Training is well-polarised: ${easyPct}% easy, ${tempoPct}% tempo — an effective distribution.`, sentiment: 'positive' })
    } else if (isBalanced) {
      insights.push({ text: `${moderatePct}% of km is in the moderate zone — consider shifting effort to easy or tempo for better polarisation.`, sentiment: 'neutral' })
    } else {
      insights.push({ text: `Effort mix: ${easyPct}% easy / ${moderatePct}% moderate / ${tempoPct}% tempo.`, sentiment: 'neutral' })
    }

    if (priorTotalKm > 0) {
      const easyDelta = easyPct - priorEasyPct
      if (easyDelta >= 10) {
        insights.push({ text: `Easy running increased by ${easyDelta}pp vs prior period — good aerobic base building.`, sentiment: 'positive' })
      } else if (easyDelta <= -10) {
        insights.push({ text: `Easy running decreased by ${Math.abs(easyDelta)}pp vs prior period — watch for accumulating fatigue.`, sentiment: 'negative' })
      }
    }

    if (tempoPct >= 20) {
      insights.push({ text: `${tempoPct}% of km at tempo pace (<5:00/km) — high intensity load this period.`, sentiment: 'neutral' })
    }
  }

  const comparison = priorTotalKm > 0
    ? `Easy: ${easyPct}% (was ${priorEasyPct}%)`
    : undefined

  return {
    id: 'effort',
    title: 'Effort Mix',
    icon: 'mdi-pulse',
    headlineStat: runs.length > 0 ? `Easy ${easyPct}% / Mod ${moderatePct}% / Tempo ${tempoPct}%` : 'No data',
    sparkline: { labels, data },
    insights,
    comparison,
  }
}

export function useInsights(
  runs: ComputedRef<StravaActivity[]>,
  priorRuns: ComputedRef<StravaActivity[]>,
) {
  return computed<InsightWidget[]>(() => {
    const r = runs.value
    const p = priorRuns.value
    return [
      computePaceWidget(r, p),
      computeVolumeWidget(r, p),
      computeConsistencyWidget(r, p),
      computeEffortWidget(r, p),
    ]
  })
}
