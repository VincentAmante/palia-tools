import Konva from 'konva'
import uniqid from 'uniqid'
import type { GridSizing } from '../../types/ConfigOptions'
import type Coordinates from '@/assets/scripts/utils/types/coordinates'
import type Dimensions from '@/assets/scripts/utils/types/dimensions'
import { toScale, unscale } from '@/assets/scripts/house-planner/classes/utils/helpers'
import { ZLevel } from '@/assets/scripts/house-planner/enums/zLevel'

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
  readonly hide: boolean = false
  readonly zLevel: ZLevel = ZLevel.Ground

  constructor(
    {
      x, y, width, height,
      offsetX = 0, offsetY = 0,
      offsetWidth = 0, offsetHeight = 0,
      rotation = 0, zLevel = ZLevel.Ground,
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
      zLevel?: ZLevel
    },
    id: string = uniqid(),
    gridSizing: GridSizing,
    hide: boolean = false,
  ) {
    this._id = id
    this._gridSizing = gridSizing
    this.hide = hide
    this.zLevel = zLevel || ZLevel.Ground

    this._baseCoords = { x, y }
    this._baseDimensions = { width: toScale(width, gridSizing), height: toScale(height, gridSizing) }
    this._offsetCoords = { x: toScale(offsetX, gridSizing), y: toScale(offsetY, gridSizing) }
    this._offsetDimensions = { width: toScale(offsetWidth, gridSizing), height: toScale(offsetHeight, gridSizing) }

    this._rect = new Konva.Rect({
      x: this._baseCoords.x,
      y: this._baseCoords.y,
      width: this._baseDimensions.width + this._offsetDimensions.width,
      height: this._baseDimensions.height + this._offsetDimensions.height,
      fill: '#3A4A6B50',
      stroke: '#3A4A6B',
      strokeWidth: 1,
      // opacity: 0.25,
      shadowEnabled: false,
      id: this._id,
      offsetX: ((this._baseDimensions.width + this._offsetDimensions.width) / 2) - (this._offsetCoords.x / 2),
      offsetY: ((this._baseDimensions.height + this._offsetDimensions.height) / 2) - (this._offsetCoords.y / 2),
      perfectDrawEnabled: false,
      hitStrokeWidth: 0,
      rotation,
    }) as CollisionBoxRect

    this._rect.cache()
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

    const rect = getRectInfo(this._rect, this._offsetCoords)
    const boxRect = getRectInfo(box.rect, box._offsetCoords)
    const rectCorners = getCorners(this._rotation, rect)
    const otherRectCorners = getCorners(typeof box.rect.rotation === 'function' ? box.rect.rotation() : box.rect.rotation, boxRect)

    if (rectCorners.topLeft.x > otherRectCorners.bottomRight.x || otherRectCorners.topLeft.x > rectCorners.bottomRight.x)
      return false
    else if (rectCorners.topLeft.y > otherRectCorners.bottomRight.y || otherRectCorners.topLeft.y > rectCorners.bottomRight.y)
      return false

    return true
  }

  isCoordInside({ x, y }: Coordinates): boolean {
    const rect = getRectInfo(this._rect, this._offsetCoords)

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
    const offsetX = unscale(this._offsetCoords.x, gridSizing)
    const offsetY = unscale(this._offsetCoords.y, gridSizing)
    const offsetWidth = unscale(this._offsetDimensions.width, gridSizing)
    const offsetHeight = unscale(this._offsetDimensions.height, gridSizing)

    return new CollisionBox({
      x,
      y,
      width,
      height,
      offsetX,
      offsetY,
      offsetWidth,
      offsetHeight,
      rotation,
    }, this._id, gridSizing, this.hide)
  }
}

interface CollisionBoxRectInfo {
  x: number
  y: number
  width: number
  height: number
  id: string
}

function getCorners(rotation: number, { x, y, width, height }: CollisionBoxRectInfo): Corners {
  const topLeft = { x: 0, y: 0 }
  const bottomRight = { x: 0, y: 0 }

  const xDiff = width / 2
  const yDiff = height / 2

  switch (rotation) {
    case 0:
    case 180:
      topLeft.x = x - xDiff
      topLeft.y = y - yDiff
      bottomRight.x = x + xDiff
      bottomRight.y = y + yDiff
      break
    case 90:
    case 270:
      topLeft.x = x - yDiff
      topLeft.y = y - xDiff
      bottomRight.x = x + yDiff
      bottomRight.y = y + xDiff
      break
  }

  return { topLeft, bottomRight }
}

function getRectInfo(rect: CollisionBoxRect, offsetCoords: {
  x: number
  y: number
} = { x: 0, y: 0 }): CollisionBoxRectInfo {
  const x = (typeof rect.x === 'function') ? rect.x() : rect.x
  const offsetX = offsetCoords.x
  const y = (typeof rect.y === 'function') ? rect.y() : rect.y
  const offsetY = offsetCoords.y
  const rotation = (typeof rect.rotation === 'function') ? rect.rotation() : rect.rotation
  const info = {
    x: x + offsetX / 2,
    y: y + offsetY / 2,
    width: (typeof rect.width === 'function') ? rect.width() : rect.width,
    height: (typeof rect.height === 'function') ? rect.height() : rect.height,
    id: rect.id,
  }
  switch (rotation) {
    case 0:
      info.x = x + offsetX / 2
      info.y = y + offsetY / 2
      break
    case 90:
      info.x = x - offsetY / 2
      info.y = y - offsetX / 2
      break
    case 180:
      info.x = x - offsetX / 2
      info.y = y - offsetY / 2
      break
    case 270:
      info.x = x + offsetY / 2
      info.y = y + offsetX / 2
      break
  }

  return info
}
