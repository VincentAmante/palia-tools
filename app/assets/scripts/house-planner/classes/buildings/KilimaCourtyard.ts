import SnapBox from '../parts/SnapBox'

import CollisionBox from '../parts/CollisionBox'
import BuildingImage from '../parts/Image'
import type Dimensions from '../../../utils/types/dimensions'
import { BuildingType } from '../../enums/buildingType'
import { Building } from '../building'
import type { GridSizing } from '../../types/ConfigOptions'
import { ZLevel } from '../../enums/zLevel'
import type Coordinates from '@/assets/scripts/utils/types/coordinates'

export default class KilimaCourtyard extends Building {
  protected readonly name = 'Kilima Courtyard'
  protected _type: BuildingType = BuildingType.KilimaCourtyard
  protected _needsParent: boolean = true
  protected _baseCoords: Coordinates = { x: 0, y: 0 }
  protected _baseRotation: number = 0
  protected _baseDimensions: Dimensions = { width: 20, height: 23 }
  protected _opacity: number = 1
  price = {
    base: 20000,
    perExtraBuilding: 10000,
    increaseIncrement: 0,
    increaseInterval: 1,
  }

  materials = {
    sapwoodPlanks: 100,
    stoneBricks: 35,
  }

  constructor(gridSizing: GridSizing) {
    super(gridSizing)
  }

  protected _snapBox: SnapBox = new SnapBox(
    {
      ...this._baseCoords,
      ...this._baseDimensions,
      offsetX: 0,
      offsetY: 3,
    },
    this._id,
    this._gridSizing,
  )

  protected _collisionBoxes: CollisionBox[] = [
    new CollisionBox(
      {
        ...this._baseCoords,
        height: 20,
        width: 20,
        offsetWidth: 0,
        offsetHeight: 0.5,
        offsetY: -3,
        zLevel: ZLevel.Large,
      },
      this._id,
      this._gridSizing,
    ),
    new CollisionBox(
      {
        ...this._baseCoords,
        ...this._baseDimensions,
        width: 3,
        height: 3,
        offsetY: 20,
      },
      `${this._id}-hallway`,
      this._gridSizing,
    ),
  ]

  protected _image: BuildingImage = new BuildingImage(
    {
      ...this._baseCoords,
      ...this._baseDimensions,
      offsetY: 0,
      imageSrc: '/buildings/kilima-courtyard.svg',
    },
    this._id,
    this._gridSizing,
  )

  protected _openSlots: {
    North: boolean
    East: boolean
    South: boolean
    West: boolean
  } = {
      North: true,
      East: true,
      South: false,
      West: true,
    }
}
