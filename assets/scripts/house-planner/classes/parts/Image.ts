import Konva from 'konva'
import uniqid from 'uniqid'
import type { GridSizing } from '../../types/ConfigOptions'
import type Coordinates from '@/assets/scripts/utils/types/coordinates'
import type Dimensions from '@/assets/scripts/utils/types/dimensions'
import { toScale } from '@/assets/scripts/house-planner/classes/utils/helpers'

export type ImageType = Konva.Image & {
  id: string
}

export default class BuildingImage {
  private _id: string
  private _baseCoords: Coordinates
  private _baseDimensions: Dimensions
  private _offsetCoords: Coordinates
  private _offsetDimensions: Dimensions
  private _rect: ImageType
  private _rotation: number = 0
  private _gridSizing: GridSizing
  private _imageSrc: string

  constructor(
    {
      x, y, width, height, imageSrc,
      offsetX = 0, offsetY = 0,
      offsetWidth = 0, offsetHeight = 0,
    }: {
      x: number
      y: number
      width: number
      height: number
      imageSrc: string
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

    const image = new Image()
    image.src = imageSrc
    this._imageSrc = imageSrc
    this._rect = new Konva.Image({
      x: this._baseCoords.x,
      y: this._baseCoords.y,
      width: this._baseDimensions.width + this._offsetDimensions.width,
      height: this._baseDimensions.height + this._offsetDimensions.height,
      id: this._id,
      offsetX: toScale((width + offsetWidth) / 2, gridSizing),
      offsetY: toScale((height + offsetHeight) / 2, gridSizing),
      rotation: this._rotation,
      image,
    }) as ImageType
  }

  get rect(): ImageType {
    const image = new Image()
    image.src = this._imageSrc

    const { x, y } = this._baseCoords
    const { width, height } = this._baseDimensions
    console.log('x, y, width, height', x, y, width, height)

    return new Konva.Image({
      x,
      y,
      width,
      height,
      offsetX: this._rect.offsetX(),
      offsetY: this._rect.offsetY(),
      id: this._id,
      rotation: this._rotation,
      image,
    }) as ImageType
  }

  updateCoords({ x, y }: Coordinates) {
    this._baseCoords = { x, y }
    this._rect.x(x + this._offsetCoords.x)
    this._rect.y(y + this._offsetCoords.y)
  }

  updateRotation(rotation: number) {
    this._rotation = rotation
    this._rect.rotation(rotation)
  }
}
