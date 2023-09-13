import Konva from 'konva'
import uniqid from 'uniqid'
import type { GridSizing } from '../../types/ConfigOptions'
import type Coordinates from '@/assets/scripts/utils/types/coordinates'
import type Dimensions from '@/assets/scripts/utils/types/dimensions'
import { toScale } from '@/assets/scripts/house-planner/classes/utils/helpers'

export type CollisionBoxRect = Konva.Rect & {
  id: string
}

export default class CollisionBox {
  private _id: string
  private _baseCoords: Coordinates
  private _baseDimensions: Dimensions
  private _offsetCoords: Coordinates
  private _offsetDimensions: Dimensions
  private _rect: CollisionBoxRect
  private _rotation: number = 0

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

    this._baseCoords = { x, y }
    this._baseDimensions = { width: toScale(width, gridSizing), height: toScale(height, gridSizing) }
    this._offsetCoords = { x: toScale(offsetX, gridSizing), y: toScale(offsetY, gridSizing) }
    this._offsetDimensions = { width: toScale(offsetHeight, gridSizing), height: toScale(offsetHeight, gridSizing) }

    this._rect = new Konva.Rect({
      x: this._baseCoords.x,
      y: this._baseCoords.y,
      width: this._baseDimensions.width + this._offsetDimensions.width,
      height: this._baseDimensions.height + this._offsetDimensions.height,
      fill: 'rgba(128, 0, 0, 10)',
      stroke: 'rgba(128, 0, 0, 10)',
      strokeWidth: 2,
      id: this._id,
      offsetX: toScale((width + offsetWidth) / 2, gridSizing),
      offsetY: toScale((height + offsetHeight) / 2, gridSizing),
    }) as CollisionBoxRect
  }

  get rect(): CollisionBoxRect {
    return this._rect
  }

  updateCoords({ x, y }: Coordinates) {
    this._baseCoords = { x, y }
    this._rect.x(x + this._offsetCoords.x)
    this._rect.y(y + this._offsetCoords.y)
  }

  isIntersectingWith(box: CollisionBox, excludeIds: string[]): boolean {
    const thisRect = this._rect
    const boxRect = box.rect

    if (excludeIds.includes(boxRect.id()))
      return false

    return thisRect.intersects(boxRect)
  }

  updateRotation(rotation: number) {
    this._rotation = rotation
    this._rect.rotation(rotation)
  }
}
