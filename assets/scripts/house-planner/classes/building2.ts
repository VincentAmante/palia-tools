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

class Building {
  private _id: string
  private _type: BuildingType
  private _needsParent: boolean
  private _baseCoords: Coordinates
  private _baseRotation: number
  private _baseDimensions: Dimensions
  private _opacity: number

  private _snapBox: {
    rect: BuildingSnapBox
    boxInfo: BoxInfo
  }

  private _collisionBoxes: {
    rect: BuildingRect
    boxInfo: BoxInfo
  }[]

  private _image: {
    image: BuildingImage
    boxInfo: BoxInfo
  }

  private _openSlots: {
    North: boolean
    East: boolean
    South: boolean
    West: boolean
  }

  private _children: {
    North: Building | null
    East: Building | null
    South: Building | null
    West: Building | null
  } = {
      North: null,
      East: null,
      South: null,
      West: null,
    }

  private _parent: Building | null = null

  checkCollision(building: Building, excludeIds: string[]): boolean {
    const collisionBoxes = this._collisionBoxes
    const buildingCollisionBoxes = building._collisionBoxes

    for (let i = 0; i < collisionBoxes.length; i++) {
      for (let j = 0; j < buildingCollisionBoxes.length; j++) {
        if (
          collisionBoxes[i].rect.intersects(buildingCollisionBoxes[j])
          && !excludeIds.includes(building.id)
        )
          return true
      }
    }

    return false
  }

  get id(): string {
    return this._id
  }

  get baseCoords(): Coordinates {
    return this._baseCoords
  }

  get baseRotation(): number {
    return this._baseRotation
  }

  get image(): BuildingImage {
    return this._image.image
  }
}

interface Builder {
  withBaseCoords(baseCoords: Coordinates): Builder
  withBaseDimensions(width: number, height: number): Builder
  withSnapBox(snapBox: BuildingSnapBox): Builder
  withCollisionBoxes(collisionBoxes: BuildingRect[]): Builder
  withImage(image: BuildingImage): Builder
}

function shiftDirectionByRotation(direction: Direction, rotation: number) {
  const directions = [Direction.North, Direction.East, Direction.South, Direction.West]
  const index = directions.indexOf(direction)
  const newIndex = (index + (rotation / 90)) % 4
  return directions[newIndex]
}
