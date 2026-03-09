import type { ChartEvent, ActiveElement } from 'chart.js'

export function useChartClick(onDataPointClick: (index: number) => void) {
  return {
    onClick: (_event: ChartEvent, elements: ActiveElement[]) => {
      const first = elements[0]
      if (first) onDataPointClick(first.index)
    },
    onHover: (event: ChartEvent, elements: ActiveElement[]) => {
      const target = event.native?.target as HTMLElement | undefined
      if (target) target.style.cursor = elements.length > 0 ? 'pointer' : 'default'
    },
  }
}
