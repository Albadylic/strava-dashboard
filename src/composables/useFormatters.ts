export function formatDistance(meters: number): string {
  const km = meters / 1000
  return `${km.toFixed(2)} km`
}

export function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60

  if (h > 0) {
    return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  }
  return `${m}:${String(s).padStart(2, '0')}`
}

export function formatPace(seconds: number, meters: number): string {
  if (meters === 0) return '-'
  const paceSecondsPerKm = seconds / (meters / 1000)
  const mins = Math.floor(paceSecondsPerKm / 60)
  const secs = Math.round(paceSecondsPerKm % 60)
  return `${mins}:${String(secs).padStart(2, '0')} /km`
}

export function formatPaceFromSecondsPerMeter(pace: number): string {
  if (pace === 0) return '-'
  const paceSecondsPerKm = pace * 1000
  const mins = Math.floor(paceSecondsPerKm / 60)
  const secs = Math.round(paceSecondsPerKm % 60)
  return `${mins}:${String(secs).padStart(2, '0')} /km`
}
