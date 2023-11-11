import SnapBox from '../parts/SnapBox'

import CollisionBox from '../parts/CollisionBox'
import BuildingImage from '../parts/Image'
import type Dimensions from '../../../utils/types/dimensions'
import { BuildingType } from '../../enums/buildingType'
import { Building } from '../building'
import type { GridSizing } from '../../types/ConfigOptions'
import { ZLevel } from '../../enums/zLevel'
import type Coordinates from '@/assets/scripts/utils/types/coordinates'

export default class KilimaPorch extends Building {
  protected _type: BuildingType = BuildingType.KilimaPorch
  protected _needsParent: boolean = true
  protected _baseCoords: Coordinates = { x: 0, y: 0 }
  protected _baseRotation: number = 0
  protected _baseDimensions: Dimensions = { width: 10, height: 2 }
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
    base: 4000,
    perExtraBuilding: 500,
  }

  materials = {
    sapwoodPlanks: 80,
    stoneBricks: 30,
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
        zLevel: ZLevel.Ground,
      },
      this._id,
      this._gridSizing,
      // true,
    ),
    // new CollisionBox(
    //   {
    //     ...this._baseCoords,
    //     ...this._baseDimensions,
    //     offsetWidth: 0,
    //     offsetHeight: 0,
    //     offsetY: 2,
    //     zLevel: ZLevel.Ground,
    //   },
    //   this._id,
    //   this._gridSizing,
    //   // true,
    // ),
  ]

  protected _image: BuildingImage = new BuildingImage(
    {
      ...this._baseCoords,
      ...this._baseDimensions,
      imageSrc: '/buildings/porch.svg',
      offsetWidth: 0,
      offsetHeight: 2,
    },
    this._id,
    this._gridSizing,
  )
}
