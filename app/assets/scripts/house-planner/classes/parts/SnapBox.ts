import Konva from 'konva'
import uniqid from 'uniqid'
import type { GridSizing } from '../../types/ConfigOptions'
import { Direction } from '../../imports'
import type Coordinates from '@/assets/scripts/utils/types/coordinates'
import type Dimensions from '@/assets/scripts/utils/types/dimensions'
import { toScale, unscale } from '@/assets/scripts/house-planner/classes/utils/helpers'

export type SnapBoxRect = Konva.Rect & {
  id: string
}

interface Corners {
  [key: string]: Coordinates
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
  private _zIndex: number = 0

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
      stroke: 'rgba(0, 0, 0, 10)',
      dash: [10, 10],
      strokeWidth: 1,
      id: this._id,

      shadowEnabled: false,
      offsetX: toScale((width + offsetWidth) / 2, gridSizing),
      offsetY: toScale((height + offsetHeight) / 2, gridSizing),
      perfectDrawEnabled: false,
      rotation,
      hitStrokeWidth: 0,
      listening: false,
    }) as SnapBoxRect

    this._rect.cache()
  }

  get rect(): SnapBoxRect {
    return this._rect
  }

  updateCoords({ x, y }: Coordinates) {
    this._baseCoords = { x, y }
    this._rect.x = x
    this._rect.y = y
  }

  updateRotation(rotation: number) {
    this._rotation = rotation
    this._rect.rotation = rotation
  }

  getCoords(direction: Direction): Coordinates {
    const { x, y } = this._baseCoords
    let { width, height } = this._baseDimensions
    let offsetX = this._offsetCoords.x / 2
    let offsetY = this._offsetCoords.y / 2

    if (width !== height) {
      switch (this._rotation) {
        case 90:
          width = this._baseDimensions.height
          height = this._baseDimensions.width
          offsetX = this._offsetCoords.y / 2 * -1
          offsetY = this._offsetCoords.x / 2 * -1
          break
        case 180:
          offsetX = this._offsetCoords.x / 2 * -1
          offsetY = this._offsetCoords.y / 2 * -1
          break
        case 270:
          width = this._baseDimensions.height
          height = this._baseDimensions.width
          offsetX = this._offsetCoords.y / 2
          offsetY = this._offsetCoords.x / 2
          break
      }

      // track where the north is based on the rotation
      let northRotation = Direction.North

      switch (this._rotation) {
        case 90:
          northRotation = Direction.East
          break
        case 180:
          northRotation = Direction.South
          break
        case 270:
          northRotation = Direction.West
          break
      }

      switch (direction) {
        case Direction.North:
          return {
            x: (x - (offsetX - (northRotation === Direction.North ? offsetX : 0))),
            y: ((y - (offsetY - (northRotation === Direction.North ? offsetY : 0))) - (height / 2)),
          }
        case Direction.East:
          return {
            x: (x - (offsetX - (northRotation === Direction.East ? offsetX : 0))) + (width / 2),
            y: (y - (offsetY - (northRotation === Direction.East ? offsetY : 0))),
          }
        case Direction.South:
          return {
            x: (x - (offsetX - (northRotation === Direction.South ? offsetX : 0))),
            y: (y - (offsetY - (northRotation === Direction.South ? offsetY : 0))) + (height / 2),
          }
        case Direction.West:
          // return {
          //   x: (x - offsetX) - (width / 2),
          //   y: (y - offsetY),
          // }
          return {
            x: (x - (offsetX - (northRotation === Direction.West ? offsetX : 0))) - (width / 2),
            y: (y - (offsetY - (northRotation === Direction.West ? offsetY : 0))),
          }
      }
    }
    else {
      switch (direction) {
        case Direction.North:
          return {
            x: (x - offsetX),
            y: (y - (height / 2)),
          }
        case Direction.East:
          return {
            x: (x - offsetX) + (width / 2),
            y: (y - offsetY),
          }
        case Direction.South:
          return {
            x: (x - offsetX),
            y: (y - offsetY) + (height / 2),
          }
        case Direction.West:
          return {
            x: (x - offsetX) - (width / 2),
            y: (y - offsetY),
          }
      }
    }
  }

  get x(): number {
    return this._rect.x()
  }

  get y(): number {
    return this._rect.y()
  }

  get copy(): SnapBox {
    const width = unscale(this._baseDimensions.width, this._gridSizing)
    const height = unscale(this._baseDimensions.height, this._gridSizing)
    const offsetWidth = unscale(this._offsetDimensions.width, this._gridSizing)
    const offsetHeight = unscale(this._offsetDimensions.height, this._gridSizing)
    const offsetX = unscale(this._offsetCoords.x, this._gridSizing)
    const offsetY = unscale(this._offsetCoords.y, this._gridSizing)

    return new SnapBox(
      {
        x: this._baseCoords.x,
        y: this._baseCoords.y,
        width,
        height,
        offsetX,
        offsetY,
        offsetWidth,
        offsetHeight,
        rotation: this._rotation,
      },
      this._id,
      this._gridSizing,
    )
  }

  isIntersectingWith(box: SnapBox, excludeIds: string[]): boolean {
    if (excludeIds.includes(box.rect.id))
      return false

    const rect = getRectInfo(this._rect)
    const boxRect = getRectInfo(box.rect)
    const rectCorners = getCorners(this._rotation, rect)
    const otherRectCorners = getCorners(typeof box.rect.rotation === 'function' ? box.rect.rotation() : box.rect.rotation, boxRect)

    if (rectCorners.topLeft.x >= otherRectCorners.bottomRight.x || otherRectCorners.topLeft.x >= rectCorners.bottomRight.x)
      return false
    else if (rectCorners.topLeft.y >= otherRectCorners.bottomRight.y || otherRectCorners.topLeft.y >= rectCorners.bottomRight.y)
      return false

    return true
  }
}

interface SnapBoxRectInfo {
  x: number
  y: number
  width: number
  height: number
  id: string
}

function getCorners(rotation: number, { x, y, width, height }: SnapBoxRectInfo): Corners {
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

function getRectInfo(rect: SnapBoxRect, offsetCoords: {
  x: number
  y: number
} = { x: 0, y: 0 }): SnapBoxRectInfo {
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
