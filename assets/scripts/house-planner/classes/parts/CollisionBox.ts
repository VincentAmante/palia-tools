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
    console.log(excludeIds)

    if (excludeIds.includes(box.rect.id)) {
      console.log('excluded')
      return false
    }

    const rect = this._rect
    const boxRect = box.rect

    const rectCorners: Corners = {
      topLeft: { x: rect.x(), y: rect.y() },
      topRight: { x: rect.x() + rect.width(), y: rect.y() },
      bottomRight: { x: rect.x() + rect.width(), y: rect.y() + rect.height() },
      bottomLeft: { x: rect.x(), y: rect.y() + rect.height() },
    }

    const otherRectCorners: Corners = {
      topLeft: { x: boxRect.x(), y: boxRect.y() },
      topRight: { x: boxRect.x() + boxRect.width(), y: boxRect.y() },
      bottomRight: { x: boxRect.x() + boxRect.width(), y: boxRect.y() + boxRect.height() },
      bottomLeft: { x: boxRect.x(), y: boxRect.y() + boxRect.height() },
    }

    const isPointInsideRect = (point: Coordinates, boxCorners: Corners): boolean => {
      const { topLeft, topRight, bottomLeft } = boxCorners
      const { x, y } = point

      const isInsideX = (x >= topLeft.x && x <= topRight.x)
      const isInsideY = (y >= topLeft.y && y <= bottomLeft.y)

      return isInsideX && isInsideY
    }

    // see if any points are inside the other rect
    for (const corner in rectCorners) {
      if (excludeIds.includes(boxRect.id))
        continue
      if (isPointInsideRect(rectCorners[corner], otherRectCorners))
        return true
    }

    return false
  }

  isCoordInside({ x, y }: Coordinates): boolean {
    const rect = this._rect

    const rectCorners: Corners = {
      topLeft: { x: (rect.x() - rect.width() / 2), y: (rect.y() - rect.height() / 2) },
      topRight: { x: (rect.x() - rect.width() / 2) + rect.width(), y: ((rect.y() - rect.height() / 2) - rect.height() / 2) },
      bottomRight: { x: (rect.x() - rect.width() / 2) + rect.width(), y: (rect.y() - rect.height() / 2) + rect.height() },
      bottomLeft: { x: (rect.x() - rect.width() / 2), y: (rect.y() - rect.height() / 2) + rect.height() },
    }

    const isPointInsideRect = (point: Coordinates, boxCorners: Corners): boolean => {
      const { topLeft, topRight, bottomLeft } = boxCorners
      const { x, y } = point

      const isInsideX = (x >= topLeft.x && x <= topRight.x)
      const isInsideY = (y >= topLeft.y && y <= bottomLeft.y)

      return isInsideX && isInsideY
    }

    return isPointInsideRect({ x, y }, rectCorners)
  }

  updateRotation(rotation: number) {
    this._rotation = rotation
    this._rect.rotation(rotation)
  }

  get copy(): CollisionBox {
    const { x, y } = this._baseCoords
    const width = unscale(this._baseDimensions.width, this._gridSizing)
    const height = unscale(this._baseDimensions.height, this._gridSizing)

    return new CollisionBox({
      x,
      y,
      width,
      height,
    }, this._id, this._gridSizing)
  }
}
