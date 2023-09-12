import type Coordinates from 'assets/scripts/utils/types/coordinates'
import type { BuildingType } from '../../imports'
import type { BuildingImage, BuildingRect, BuildingSnapBox } from '../IBuilding'
import type IBuilding from '../IBuilding'

export default class HarvestHouse implements IBuilding {
  _id: string
  _type: BuildingType
  _needsParent: boolean
  _baseCoords: Coordinates
  _baseRotation: number
  _baseDimensions: Dimensions
  _opacity: number
  _snapBox: { rect: BuildingSnapBox; boxInfo: { [x: string]: RectData } }
  _collisionBoxes: { rect: BuildingRect; boxInfo: { [x: string]: RectData } }[]
  _image: { image: BuildingImage; boxInfo: { [x: string]: RectData } }
  _openSlots: { North: boolean; East: boolean; South: boolean; West: boolean }
  _children: { North: IBuilding | null; East: IBuilding | null; South: IBuilding | null; West: IBuilding | null }
  _parent: IBuilding | null

  checkCollision(building: IBuilding, excludeIds: string[]): boolean {
    throw new Error('Method not implemented.')
  }

  get id(): string {
    throw new Error('Method not implemented.')
  }

  get baseCoords(): Coordinates {  
    throw new Error('Method not implemented.')
  }

  get baseRotation(): number {
    throw new Error('Method not implemented.')
  }

  get image(): BuildingImage {
    throw new Error('Method not implemented.')
  }

  constructor() {

  }
}
