import type Konva from 'konva'
import type { BuildingType } from '../enums/building-type'
import type Coordinates from '@/assets/scripts/utils/types/coordinates'
import { Direction } from '@/assets/scripts/utils/imports'

// Information about the building relative to base coordinates and rotation
interface RectData {
  // location of origin relative to base coordinates
  offsetX: number
  offsetY: number

  // size relative to base width and height
  offsetWidth: number
  offsetHeight: number

  // rotation relative to base rotation
  rotation: number
}

type BoxInfo = Record<string, RectData>

export type BuildingImage = Konva.Image & {
  id: string
}
export type BuildingRect = Konva.Rect & {
  id: string
}
export type BuildingSnapBox = Konva.Rect & {
  id: string
}

interface Dimensions {
  width: number
  height: number
}

export default interface Building {
  _id: string
  _type: BuildingType
  _needsParent: boolean
  _baseCoords: Coordinates
  _baseRotation: number
  _baseDimensions: Dimensions
  _opacity: number
  _snapBox: {
    rect: BuildingSnapBox
    boxInfo: BoxInfo
  }

  _collisionBoxes: {
    rect: BuildingRect
    boxInfo: BoxInfo
  }[]

  _image: {
    image: BuildingImage
    boxInfo: BoxInfo
  }

  _openSlots: {
    North: boolean
    East: boolean
    South: boolean
    West: boolean
  }

  _children: {
    North: Building | null
    East: Building | null
    South: Building | null
    West: Building | null
  }

  _parent: Building | null

  checkCollision(building: Building, excludeIds: string[]): boolean

  get id(): string

  get baseCoords(): Coordinates
  get baseRotation(): number

  get image(): BuildingImage
}

function shiftDirectionByRotation(direction: Direction, rotation: number) {
  const directions = [Direction.North, Direction.East, Direction.South, Direction.West]
  const index = directions.indexOf(direction)
  const newIndex = (index + (rotation / 90)) % 4
  return directions[newIndex]
}
