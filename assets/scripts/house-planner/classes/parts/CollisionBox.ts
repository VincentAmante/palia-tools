import Konva from 'konva'
import uniqid from 'uniqid'
import type { GridSizing } from '../../types/ConfigOptions'
import type Coordinates from '@/assets/scripts/utils/types/coordinates'
import type Dimensions from '@/assets/scripts/utils/types/dimensions'
import { toScale, unscale } from '@/assets/scripts/house-planner/classes/utils/helpers'

export type CollisionBoxRect = Konva.Rect & {
  id: string
}

interface Corners {
  [key: string]: Coordinates
}

export default class CollisionBox {
  private _id: string
  private _baseCoords: Coordinates
  private _baseDimensions: Dimensions
  private _offsetCoords: Coordinates
  private _offsetDimensions: Dimensions
  private _rect: CollisionBoxRect
  private _rotation: number = 0
  private _gridSizing: GridSizing

  constructor(
    {
      x, y, width, height,
      offsetX = 0, offsetY = 0,
      offsetWidth = 0, offsetHeight = 0,
      rotation = 0,
    }: {
      x: number
      y: number
      width: number
      height: number
      offsetX?: number
      offsetY?: number
      offsetWidth?: number
      offsetHeight?: number
      rotation?: number
    },
    id: string = uniqid(),
    gridSizing: GridSizing,
  ) {
    this._id = id
    this._gridSizing = gridSizing

    this._baseCoords = { x, y }
    this._baseDimensions = { width: toScale(width, gridSizing), height: toScale(height, gridSizing) }
    this._offsetCoords = { x: toScale(offsetX, gridSizing), y: toScale(offsetY, gridSizing) }
    this._offsetDimensions = { width: toScale(offsetWidth, gridSizing), height: toScale(offsetHeight, gridSizing) }

    this._rect = new Konva.Rect({
      x: this._baseCoords.x,
      y: this._baseCoords.y,
      width: this._baseDimensions.width + this._offsetDimensions.width,
      height: this._baseDimensions.height + this._offsetDimensions.height,
      fill: 'rgba(0, 64, 124, 100)',
      opacity: 0.5,
      id: this._id,
      offsetX: (this._baseDimensions.width + this._offsetDimensions.width) / 2,
      offsetY: (this._baseDimensions.height + this._offsetDimensions.height) / 2,
      rotation,
    }) as CollisionBoxRect

    // console.log(this._rect)
  }

  get rect(): CollisionBoxRect {
    return this._rect
  }

  updateCoords({ x, y }: Coordinates) {
    this._baseCoords = { x, y }
    this._rect.x = x
    this._rect.y = y
  }

  isIntersectingWith(box: CollisionBox, excludeIds: string[]): boolean {
    if (excludeIds.includes(box.rect.id))
      return false

    const rect = getRectInfo(this._rect)
    const boxRect = getRectInfo(box.rect)
    const rectCorners: Corners = {
      topLeft: { x: rect.x - rect.width / 2, y: rect.y - rect.height / 2 },
      bottomRight: { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 },
    }

    const otherRectCorners: Corners = {
      topLeft: { x: boxRect.x - boxRect.width / 2, y: boxRect.y - boxRect.height / 2 },
      bottomRight: { x: boxRect.x + boxRect.width / 2, y: boxRect.y + boxRect.height / 2 },
    }

    if (rectCorners.topLeft.x > otherRectCorners.bottomRight.x || otherRectCorners.topLeft.x > rectCorners.bottomRight.x)
      return false
    else if (rectCorners.topLeft.y > otherRectCorners.bottomRight.y || otherRectCorners.topLeft.y > rectCorners.bottomRight.y)
      return false

    return true
  }

  isCoordInside({ x, y }: Coordinates): boolean {
    const rect = getRectInfo(this._rect)

    const rectCorners: Corners = {
      topLeft: { x: (rect.x - rect.width / 2), y: (rect.y - rect.height / 2) },
      bottomRight: { x: (rect.x - rect.width / 2) + rect.width, y: (rect.y - rect.height / 2) + rect.height },
    }

    if (x < rectCorners.topLeft.x || x > rectCorners.bottomRight.x)
      return false
    else if (y < rectCorners.topLeft.y || y > rectCorners.bottomRight.y)
      return false

    return true
  }

  updateRotation(rotation: number) {
    this._rotation = rotation
    this._rect.rotation = rotation

    // this._rect.rotation = (typeof this._rect.rotation === 'function') ? this.rect.rotation(rotation) : rotation
  }

  get copy(): CollisionBox {
    const { x, y } = this._baseCoords
    const width = unscale(this._baseDimensions.width, this._gridSizing)
    const height = unscale(this._baseDimensions.height, this._gridSizing)
    const gridSizing = { ...this._gridSizing }
    const rotation = (typeof this._rect.rotation === 'function') ? this._rect.rotation() : this._rect.rotation

    return new CollisionBox({
      x,
      y,
      width,
      height,
      offsetX: unscale(this._offsetCoords.x, gridSizing),
      offsetY: unscale(this._offsetCoords.y, gridSizing),
      offsetWidth: unscale(this._offsetDimensions.width, gridSizing),
      offsetHeight: unscale(this._offsetDimensions.height, gridSizing),
      rotation,
    }, this._id, gridSizing)
  }
}

interface CollisionBoxRectInfo {
  x: number
  y: number
  width: number
  height: number
  id: string
}

function getRectInfo(rect: CollisionBoxRect): CollisionBoxRectInfo {
  return {
    x: (typeof rect.x === 'function') ? rect.x() : rect.x,
    y: (typeof rect.y === 'function') ? rect.y() : rect.y,
    width: (typeof rect.width === 'function') ? rect.width() : rect.width,
    height: (typeof rect.height === 'function') ? rect.height() : rect.height,
    id: rect.id,
  }
}
