import { defineStore } from 'pinia'

export const useHousePlanConfig = defineStore('housePlanConfig', () => {
  const CELL_SIZE = 5
  const CELLS_IN_PLOT = 13

  const SIZE_MULTIPLIER = 1.5

  const plotWidth = computed(() => CELL_SIZE * CELLS_IN_PLOT)
  const plotHeight = computed(() => CELL_SIZE * CELLS_IN_PLOT)

  const PLOT_ROWS = 5
  const PLOT_COLUMNS = 9

  const plotRows = computed(() => PLOT_ROWS)
  const plotColumns = computed(() => PLOT_COLUMNS)

  const WIDTH = CELL_SIZE * CELLS_IN_PLOT * PLOT_COLUMNS * SIZE_MULTIPLIER
  const HEIGHT = CELL_SIZE * CELLS_IN_PLOT * PLOT_ROWS * SIZE_MULTIPLIER

  const width = computed(() => WIDTH)
  const height = computed(() => HEIGHT)

  const MAX_CLUSTER_BUILDINGS = 15
  const MAX_BUILDINGS = 30

  return {
    CELL_SIZE,
    CELLS_IN_PLOT,
    plotWidth,
    plotHeight,
    PLOT_ROWS,
    PLOT_COLUMNS,
    plotRows,
    plotColumns,
    WIDTH,
    HEIGHT,
    width,
    height,
    SIZE_MULTIPLIER,
    MAX_CLUSTER_BUILDINGS,
    MAX_BUILDINGS,
  }
})
