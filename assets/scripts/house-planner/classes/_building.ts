import Konva from 'konva'
import uniqid from 'uniqid'
import type { BuildingType } from '../enums/building-type'
import { Direction } from '@/assets/scripts/utils/imports'
import { shiftDirectionByRotation } from '@/assets/scripts/house-planner/classes/utils/helpers'

// Information about the building itself that is not related to it's display
export interface BuildingData {
  type: BuildingType

  // This lets us track building groups for transformations
  // Directions are relative to the building's rotation
  children: {
    North: Building | null
    East: Building | null
    South: Building | null
    West: Building | null
  }

  // Open slots determine whether a building can be placed in a given direction
  // Useful for buildings like the harvest house, which has the front-door and as such it's South slot is closed
  openSlots: {
    North: boolean
    East: boolean
    South: boolean
    West: boolean
  }
  parent: Building | null
  needsParent: boolean
}

interface BuildingDataConstructor {
  type: BuildingType
  needsParent?: boolean
  openSlots?: {
    North: boolean
    East: boolean
    South: boolean
    West: boolean
  }
}

// Information about the building's display on the canvas, plus id for referencing
export interface KonvaData {
  x: number
  y: number
  width: number
  height: number
  rotation: number
  id: string
  imageUrl: string
  opacity: number
  offsetX: number
  offsetY: number
}

interface KonvaDataConstructor {
  x: number
  y: number
  width: number
  height: number
  imageUrl: string
  rotation?: number
}

class Building {
  private _id: string
  private _buildingData: BuildingData
  private _konvaData: KonvaData

  constructor(
    {
      type, needsParent = true,
      openSlots = {
        North: true,
        East: true,
        South: true,
        West: true,
      },
    }: BuildingDataConstructor,
    { x, y, width, height, imageUrl, rotation = 0 }: KonvaDataConstructor,
    id: string = uniqid(),
  ) {
    this._id = id

    this._buildingData = {
      type,
      children: {
        North: null,
        East: null,
        South: null,
        West: null,
      },
      openSlots,
      parent: null,
      needsParent,
    }

    const offsetX = width / 2
    const offsetY = height / 2

    this._konvaData = {
      x,
      y,
      width,
      height,
      rotation: rotation % 360,
      id,
      imageUrl,
      opacity: 1,
      offsetX,
      offsetY,
    }
  }

  get id(): string {
    return this._id
  }

  resetId() {
    this._id = uniqid()
    this._konvaData.id = this._id
  }

  get childrenId(): string[] {
    return Object.values(this._buildingData.children)
      .filter(child => child !== null)
      .map(child => child!.id)
  }

  get parent(): string | null {
    return this._buildingData.parent ? this._buildingData.parent.id : null
  }

  // Get center coordinates of a building's side
  getSnapCoords(direction: Direction) {
    const { x, y, width, height, offsetX, offsetY } = this._konvaData

    const newDirection = shiftDirectionByRotation(direction, this._konvaData.rotation)

    switch (newDirection) {
      case Direction.North:
        return {
          x: (x - offsetX) + (width / 2),
          y: (y - offsetY) + 0,
        }
      case Direction.East:
        return {
          x: (x - offsetX) + width,
          y: (y - offsetY) + (height / 2),
        }
      case Direction.South:
        return {
          x: (x - offsetX) + (width / 2),
          y: (y - offsetY) + height,
        }
      case Direction.West:
        return {
          x: (x - offsetX),
          y: (y - offsetY) + (height / 2),
        }
    }
  }

  get konvaData(): KonvaData {
    return this._konvaData
  }

  get coordinates(): { x: number; y: number } {
    return { x: this._konvaData.x, y: this._konvaData.y }
  }

  set coordinates({ x, y }: { x: number; y: number }) {
    this._konvaData.x = x
    this._konvaData.y = y
  }

  get buildingData(): BuildingData {
    return this._buildingData
  }

  get konvaImage() {
    this._konvaData.offsetX = this._konvaData.width / 2
    this._konvaData.offsetY = this._konvaData.height / 2

    const image = new Image()
    image.src = this._konvaData.imageUrl
    image.width = this._konvaData.width
    image.height = this._konvaData.height

    return {
      x: this._konvaData.x,
      y: this._konvaData.y,
      width: this._konvaData.width,
      height: this._konvaData.height,
      rotation: this._konvaData.rotation,
      id: this._konvaData.id,
      opacity: this._konvaData.opacity,
      offsetX: this._konvaData.offsetX,
      offsetY: this._konvaData.offsetY,
      draggable: true,
      image,
    }
  }

  get boundingBox(): Konva.Rect {
    const { x, y, width, height } = this._konvaData
    return new Konva.Rect({
      x,
      y,
      width,
      height,
      rotation: this._konvaData.rotation,
      stroke: 'black',
      strokeWidth: 1,
      offsetX: width / 2,
      offsetY: height / 2,
    })
  }

  get allChildBuildings(): Building[] {
    const children = Object.values(this._buildingData.children)
    const childBuildings = children.filter(child => child !== null) as Building[]

    return childBuildings.reduce((acc, child) => {
      return [...acc, ...child.allChildBuildings]
    }, childBuildings)
  }

  setOpacity(opacity: number) {
    this._konvaData.opacity = opacity
  }

  addChild(building: Building, direction: Direction) {
    if (this.slotIsOpen(direction)) {
      this._buildingData.children[direction] = building
      building._buildingData.parent = this
      this._buildingData.openSlots[direction] = false

      // close child's opposite slot
      const oppositeDirection = shiftDirectionByRotation(direction, 180)
      building._buildingData.openSlots[oppositeDirection] = false
    }
    else {
      throw new Error(`Slot is not open: ${direction}`)
    }
  }

  get rotation(): number {
    return this._konvaData.rotation
  }

  rotateBuilding(deltaDeg: number) {
    this._konvaData.rotation += deltaDeg

    this._konvaData.rotation %= 360
    if (this._konvaData.rotation < 0)
      this._konvaData.rotation += 360
  }

  removeChild(direction: Direction) {
    if (this._buildingData.children[direction] !== null) {
      this._buildingData.children[direction]!._buildingData.parent = null
      this._buildingData.children[direction] = null
      this._buildingData.openSlots[direction] = true
    }
    else {
      throw new Error(`No child to remove: ${direction}`)
    }
  }

  slotIsOpen(direction: Direction) {
    return this._buildingData.openSlots[direction]
  }

  snapToBuilding(building: Building, direction: Direction) {
    const { x, y } = building.getSnapCoords(direction)
    const { width, height } = this._konvaData

    const newDirection = shiftDirectionByRotation(direction, building.rotation)

    switch (newDirection) {
      case Direction.North:
        this._konvaData.x = x
        this._konvaData.y = y - (height / 2)
        break
      case Direction.East:
        this._konvaData.x = x + (width / 2)
        this._konvaData.y = y
        break
      case Direction.South:
        this._konvaData.x = x
        this._konvaData.y = y + (height / 2)
        break
      case Direction.West:
        this._konvaData.x = x - (width / 2)
        this._konvaData.y = y
        break
    }
  }

  rotateToSnapDirection(direction: Direction, building: Building) {
    const newDirection = shiftDirectionByRotation(direction, building.rotation)

    switch (newDirection) {
      case Direction.North:
        this._konvaData.rotation = 0
        break
      case Direction.East:
        this._konvaData.rotation = 90
        break
      case Direction.South:
        this._konvaData.rotation = 180
        break
      case Direction.West:
        this._konvaData.rotation = 270
        break
    }
  }
}

export default Building
