import SnapBox from '../parts/SnapBox'

import CollisionBox from '../parts/CollisionBox'
import BuildingImage from '../parts/Image'
import type Dimensions from '../../../utils/types/dimensions'
import { BuildingType } from '../../enums/buildingType'
import { Building } from '../building'
import type { GridSizing } from '../../types/ConfigOptions'
import { ZLevel } from '../../enums/zLevel'
import type Coordinates from '@/assets/scripts/utils/types/coordinates'

export default class BayWindow extends Building {
  protected readonly name = 'Bay Window'
  protected _type: BuildingType = BuildingType.BayWindow
  protected _needsParent: boolean = true
  protected _baseCoords: Coordinates = { x: 0, y: 0 }
  protected _baseRotation: number = 0
  protected _baseDimensions: Dimensions = { width: 2, height: 1 }
  protected _opacity: number = 1
  protected _openSlots: {
    North: boolean
    East: boolean
    South: boolean
    West: boolean
  } = {
      North: false,
      East: false,
      South: false,
      West: false,
    }

  countsTowardsLimit: boolean = false

  price = {
    base: 2500,
    perExtraBuilding: 0,
    increaseIncrement: 0,
    increaseInterval: 0,
  }

  materials = {
    sapwoodPlanks: 30,
    stoneBricks: 0,
    glassPanes: 6,
  }

  constructor(gridSizing: GridSizing) {
    super(gridSizing)
  }

  protected _snapBox: SnapBox = new SnapBox(
    {
      ...this._baseCoords,
      ...this._baseDimensions,
      offsetX: 0,
      offsetY: 0,
      offsetWidth: 0,
      offsetHeight: 0,
    },
    this._id,
    this._gridSizing,
  )

  protected _collisionBoxes: CollisionBox[] = [
    new CollisionBox(
      {
        ...this._baseCoords,
        ...this._baseDimensions,
        offsetWidth: 0,
        offsetHeight: 0,
        zLevel: ZLevel.Large,
      },
      this._id,
      this._gridSizing,
      true,
    ),
  ]

  protected _image: BuildingImage = new BuildingImage(
    {
      ...this._baseCoords,
      ...this._baseDimensions,
      imageSrc: '/buildings/bay-window.svg',
    },
    this._id,
    this._gridSizing,
  )
}
