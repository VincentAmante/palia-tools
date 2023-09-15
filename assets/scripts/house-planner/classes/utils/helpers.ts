import type { GridSizing } from '../../types/ConfigOptions'
import { Direction } from '@/assets/scripts/utils/imports'

// Helper functions for rotating buildings
// Directions is North, East, South, West
// if rotation is 90, North becomes East, East becomes South, etc.
export function shiftDirectionByRotation(direction: Direction, rotation: number) {
  const directions = [Direction.North, Direction.East, Direction.South, Direction.West]
  const index = directions.indexOf(direction as Direction)
  const newIndex = (index + (rotation / 90)) % 4

  return directions[newIndex]
}

export function toScale(value: number, gridSizing: GridSizing) {
  return value * gridSizing.cellSize * gridSizing.sizeMultiplier
}

export function unscale(value: number, gridSizing: GridSizing) {
  return value / gridSizing.cellSize / gridSizing.sizeMultiplier
}
