import Konva from 'konva'
import uniqid from 'uniqid'
import type { BuildingType } from '../enums/buildings'
import { Direction } from '@/assets/scripts/utils/imports'

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
    const { x, y, width, height } = this._konvaData

    switch (direction) {
      case Direction.North:
        return { x: x + width / 2, y }
      case Direction.East:
        return { x: x + width, y: y + height / 2 }
      case Direction.South:
        return { x: x + width / 2, y: y + height }
      case Direction.West:
        return { x, y: y + height / 2 }
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

  setOpacity(opacity: number) {
    this._konvaData.opacity = opacity
  }

  addChild(building: Building, direction: Direction) {
    if (this.slotIsOpen(direction)) {
      this._buildingData.children[direction] = building
      building._buildingData.parent = this
      this._buildingData.openSlots[direction] = false
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
}

// Helper functions for rotating buildings
// TODO: Move to utils
function degToRad(angle: number) {
  return angle / 180 * Math.PI
}

export default Building
