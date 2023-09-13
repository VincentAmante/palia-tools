import uniqid from 'uniqid'
import { BuildingType } from '../enums/building-type'
import { Direction } from '../imports'
import type { GridSizing } from '../types/ConfigOptions'
import SnapBox from './parts/SnapBox'
import type { SnapBoxRect } from './parts/SnapBox'
import CollisionBox from './parts/CollisionBox'
import BuildingImage from './parts/Image'
import type { ImageType } from './parts/Image'
import { shiftDirectionByRotation } from './utils/helpers'
import type Coordinates from '@/assets/scripts/utils/types/coordinates'

interface Dimensions {
  width: number
  height: number
}

interface IOpenSlots {
  North: boolean
  East: boolean
  South: boolean
  West: boolean
}
interface IOpenSlotsConstructor {
  North?: boolean
  East?: boolean
  South?: boolean
  West?: boolean
}

export abstract class Building {
  protected _id: string = uniqid()
  protected _type: BuildingType = BuildingType.None
  protected _needsParent: boolean = false
  protected _baseCoords: Coordinates = { x: 0, y: 0 }
  protected _baseRotation: number = 0
  protected _baseDimensions: Dimensions = { width: 0, height: 0 }
  protected _opacity: number = 1
  protected _snapBox: SnapBox
  protected _collisionBoxes: CollisionBox[] = []
  protected _image: BuildingImage
  protected _gridSizing: GridSizing

  protected _openSlots: {
    North: boolean
    East: boolean
    South: boolean
    West: boolean
  }

  protected _children: {
    North: Building | null
    East: Building | null
    South: Building | null
    West: Building | null
  } = {
      North: null,
      East: null,
      South: null,
      West: null,
    }

  protected _parent: Building | null = null

  constructor(gridSizing: GridSizing) {
    const { x, y } = this._baseCoords
    const { width, height } = this._baseDimensions
    this._gridSizing = gridSizing

    this._snapBox = new SnapBox({
      x,
      y,
      width,
      height,
    }, this._id, gridSizing)

    this._image = new BuildingImage({
      x,
      y,
      width,
      height,
      imageSrc: '',
    }, this._id, gridSizing)

    this._collisionBoxes = [
      new CollisionBox({
        x,
        y,
        width,
        height,
      }, this._id, gridSizing),
    ]

    this._openSlots = {
      North: true,
      East: true,
      South: true,
      West: true,
    }
  }

  checkCollision(building: Building, excludeIds: string[]): boolean {
    const collisionBoxes = this._collisionBoxes
    const buildingCollisionBoxes = building._collisionBoxes

    for (let i = 0; i < collisionBoxes.length; i++) {
      for (let j = 0; j < buildingCollisionBoxes.length; j++) {
        if (collisionBoxes[i].isIntersectingWith(buildingCollisionBoxes[j], excludeIds))
          return true
      }
    }

    return false
  }

  get id(): string {
    return this._id
  }

  get type(): BuildingType {
    return this._type
  }

  get needsParent(): boolean {
    return this._needsParent
  }

  get baseCoords(): Coordinates {
    return this._baseCoords
  }

  get baseRotation(): number {
    return this._baseRotation
  }

  get image(): ImageType {
    return this._image.rect
  }

  get snapBox(): SnapBoxRect {
    return this._snapBox.rect
  }

  addChild(building: Building, direction: Direction) {
    this._children[direction] = building
  }

  removeChild(direction: Direction) {
    this._children[direction] = null
  }

  updateCoords({ x, y }: Coordinates) {
    this._baseCoords = { x, y }
    this._image.updateCoords({ x, y })
    this._snapBox.updateCoords({ x, y })
    this._collisionBoxes.forEach(collisionBox => collisionBox.updateCoords({ x, y }))
  }

  isSlotOpen(direction: Direction): boolean {
    return this._openSlots[direction]
  }

  snapToBuilding(building: Building, direction: Direction) {
    const { x, y } = building.getSnapCoords(direction)
    const { width, height } = this._image.rect

    const newDirection = shiftDirectionByRotation(direction, building.baseRotation)

    switch (newDirection) {
      case Direction.North:
        this._baseCoords.x = x
        break
      case Direction.East:
        this._baseCoords.x = x + (width() / 2)
        this._baseCoords.y = y
        break
      case Direction.South:
        this._baseCoords.x = x
        this._baseCoords.y = y + (height() / 2)
        break
      case Direction.West:
        this._baseCoords.x = x - (width() / 2)
        this._baseCoords.y = y
        break
    }

    this.updateCoords(this._baseCoords)
  }

  getSnapCoords(direction: Direction): Coordinates {
    switch (direction) {
      case Direction.North:
        return this._snapBox.getCoords(Direction.North)
      case Direction.East:
        return this._snapBox.getCoords(Direction.East)
      case Direction.South:
        return this._snapBox.getCoords(Direction.South)
      case Direction.West:
        return this._snapBox.getCoords(Direction.West)
    }
  }

  // rotates the building to face the given side of another building
  rotateToFace(direction: Direction) {
    switch (direction) {
      case Direction.North:
        this._baseRotation = 0
        break
      case Direction.East:
        this._baseRotation = 90
        break
      case Direction.South:
        this._baseRotation = 180
        break
      case Direction.West:
        this._baseRotation = 270
        break
    }

    this._image.updateRotation(this._baseRotation)
    this._snapBox.updateRotation(this._baseRotation)
    this._collisionBoxes.forEach(collisionBox => collisionBox.updateRotation(this._baseRotation))
  }

  rotateBuilding(rotation: number) {
    console.log(rotation)

    this._baseRotation = rotation
    this._image.updateRotation(rotation)
    this._snapBox.updateRotation(rotation)
    this._collisionBoxes.forEach(collisionBox => collisionBox.updateRotation(rotation))
  }
}
