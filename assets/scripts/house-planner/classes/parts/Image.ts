import Konva from 'konva'
import uniqid from 'uniqid'
import type { GridSizing } from '../../types/ConfigOptions'
import type Coordinates from '@/assets/scripts/utils/types/coordinates'
import type Dimensions from '@/assets/scripts/utils/types/dimensions'
import { toScale, unscale } from '@/assets/scripts/house-planner/classes/utils/helpers'

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
  private _opacity: number = 0.5

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
    this._offsetDimensions = { width: toScale(offsetWidth, gridSizing), height: toScale(offsetHeight, gridSizing) }

    this._opacity = 1

    const image = new Image()
    image.src = imageSrc
    this._imageSrc = imageSrc
    this._rect = new Konva.Image({
      x: this._baseCoords.x,
      y: this._baseCoords.y,
      width: this._baseDimensions.width + this._offsetDimensions.width,
      height: this._baseDimensions.height + this._offsetDimensions.height,
      id: this._id,
      offsetX: (this._baseDimensions.width + this._offsetDimensions.width + this._offsetCoords.x) / 2,
      offsetY: (this._baseDimensions.height + this._offsetDimensions.height + this._offsetCoords.y) / 2,
      rotation: this._rotation,
      opacity: this.opacity,
      image,
    }) as ImageType
  }

  get rect(): ImageType {
    return this._rect as ImageType
  }

  get opacity(): number {
    return this._opacity
  }

  set opacity(opacity: number) {
    this._rect.opacity = opacity
    this._opacity = opacity
  }

  updateCoords({ x, y }: Coordinates) {
    this._baseCoords = { x, y }

    this._rect.x = x
    this._rect.y = y
  }

  updateRotation(rotation: number) {
    this._rotation = rotation
    // this._rect.rotation(rotation)
    this._rect.rotation = rotation
  }

  get copy(): BuildingImage {
    const width = unscale(this._baseDimensions.width, this._gridSizing)
    const height = unscale(this._baseDimensions.height, this._gridSizing)
    const offsetWidth = unscale(this._offsetDimensions.width, this._gridSizing)
    const offsetHeight = unscale(this._offsetDimensions.height, this._gridSizing)

    const copyImage = new BuildingImage({
      x: this._baseCoords.x,
      y: this._baseCoords.y,
      width,
      height,
      imageSrc: this._imageSrc,
      offsetX: unscale(this._offsetCoords.x, this._gridSizing),
      offsetY: unscale(this._offsetCoords.y, this._gridSizing),
      offsetWidth,
      offsetHeight,
    }, this._id, this._gridSizing)

    copyImage.updateRotation(this._rotation)

    return copyImage
  }
}
