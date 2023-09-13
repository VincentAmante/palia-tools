import Konva from 'konva'
import uniqid from 'uniqid'
import type { GridSizing } from '../../types/ConfigOptions'
import { Direction } from '../../imports'
import type Coordinates from '@/assets/scripts/utils/types/coordinates'
import type Dimensions from '@/assets/scripts/utils/types/dimensions'

export type SnapBoxRect = Konva.Rect & {
  id: string
}

function toScale(value: number, gridSizing: GridSizing) {
  return value * gridSizing.cellSize * gridSizing.sizeMultiplier
}

export default class SnapBox {
  private _id: string
  private _baseCoords: Coordinates
  private _baseDimensions: Dimensions
  private _offsetCoords: Coordinates
  private _offsetDimensions: Dimensions
  private _rect: SnapBoxRect
  private _rotation: number = 0
  private _gridSizing: GridSizing

  constructor(
    {
      x, y, width, height,
      offsetX = 0, offsetY = 0,
      offsetWidth = 0, offsetHeight = 0,
    }: {
      x: number
      y: number
      width: number
      height: number
      offsetX?: number
      offsetY?: number
      offsetWidth?: number
      offsetHeight?: number
    },
    id: string = uniqid(),
    gridSizing: GridSizing,
  ) {
    this._id = id
    this._gridSizing = gridSizing

    this._baseCoords = { x, y }
    this._baseDimensions = { width: toScale(width, gridSizing), height: toScale(height, gridSizing) }
    this._offsetCoords = { x: toScale(offsetX, gridSizing), y: toScale(offsetY, gridSizing) }
    this._offsetDimensions = { width: toScale(offsetHeight, gridSizing), height: toScale(offsetHeight, gridSizing) }

    this._rect = new Konva.Rect({
      x: this._baseCoords.x,
      y: this._baseCoords.y,
      width: this._baseDimensions.width + this._offsetDimensions.width,
      height: this._baseDimensions.height + this._offsetDimensions.height,
      fill: 'rgba(0, 0, 0, 10)',
      id: this._id,
      offsetX: toScale((width + offsetWidth) / 2, gridSizing),
      offsetY: toScale((height + offsetHeight) / 2, gridSizing),
    }) as SnapBoxRect
  }

  get rect(): SnapBoxRect {
    return this._rect
  }

  updateCoords({ x, y }: Coordinates) {
    this._baseCoords = { x, y }
    // this._rect.x(x)
    // this._rect.y(y)
  }

  updateRotation(rotation: number) {
    this._rotation = rotation
    this._rect.rotation(rotation)
  }

  getCoords(direction: Direction): Coordinates {
    const { x, y, width, height } = this._rect
    const offsetX = this._offsetCoords.x
    const offsetY = this._offsetCoords.y

    switch (direction) {
      case Direction.North:
        return {
          x: (x() - offsetX) + (width() / 2),
          y: (y() - offsetY),
        }
      case Direction.East:
        return {
          x: (x() - offsetX) + width(),
          y: (y() - offsetY) + (height() / 2),
        }
      case Direction.South:
        return {
          x: (x() - offsetX) + (width() / 2),
          y: (y() - offsetY) + height(),
        }
      case Direction.West:
        return {
          x: (x() - offsetX),
          y: (y() - offsetY) + (height() / 2),
        }
    }
  }

  get x(): number {
    return this._rect.x()
  }

  get y(): number {
    return this._rect.y()
  }
}
