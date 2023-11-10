import Konva from 'konva'
import SnapBox from '../parts/SnapBox'

import CollisionBox from '../parts/CollisionBox'
import BuildingImage from '../parts/Image'
import type Dimensions from '../../../utils/types/dimensions'
import { BuildingType } from '../../enums/building-type'
import { Building } from '../building'
import type { GridSizing } from '../../types/ConfigOptions'
import type Coordinates from '@/assets/scripts/utils/types/coordinates'

const FONT_SIZE = 12

export class HarvestHouse extends Building {
  protected _type: BuildingType = BuildingType.HarvestHouse
  protected _needsParent: boolean = false
  protected _baseCoords: Coordinates = { x: 0, y: 0 }
  protected _baseRotation: number = 0
  protected _baseDimensions: Dimensions = { width: 11, height: 11 }
  protected _opacity: number = 1
  price = {
    base: 15000,
    perExtraBuilding: 5000,
  }

  materials = {
    sapwoodPlanks: 100,
    stoneBricks: 35,
  }

  countsTowardsLimit: boolean = true

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

  get buildingCountText(): Konva.Text {
    // TODO: Make the 15 a global constant
    const text = `${this.countableBuildings} / 15`

    return new Konva.Text({
      x: this._baseCoords.x - (text.length / 2) * FONT_SIZE / 2,
      y: this._baseCoords.y - (FONT_SIZE),
      text,
      fontSize: FONT_SIZE,
      fontVariant: 'bold',
      fontFamily: 'Merriweather',
      fill: '#2B3750',
      padding: 5,
      align: 'center',
      verticalAlign: 'middle',
      // shadowColor: '#000',
      // shadowOpacity: 0.2,
      // shadowBlur: 5,
      // shadowOffset: { x: 1, y: 1 },
    })
  }

  protected _collisionBoxes: CollisionBox[] = [
    new CollisionBox(
      {
        ...this._baseCoords,
        ...this._baseDimensions,
        offsetWidth: 2,
        offsetHeight: 0.5,
      },
      this._id,
      this._gridSizing,
    ),
  ]

  protected _image: BuildingImage = new BuildingImage(
    {
      ...this._baseCoords,
      ...this._baseDimensions,
      imageSrc: '/buildings/harvest-house.svg',
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
