import Konva from 'konva'
import uniqid from 'uniqid'
import { BuildingType } from '../enums/buildingType'
import { Direction } from '../imports'
import type { GridSizing } from '../types/ConfigOptions'
import SnapBox from './parts/SnapBox'
import type { SnapBoxRect } from './parts/SnapBox'
import CollisionBox from './parts/CollisionBox'
import BuildingImage from './parts/Image'
import type { ImageType } from './parts/Image'
import { shiftDirectionByRotation } from './utils/helpers'
import type Coordinates from '@/assets/scripts/utils/types/coordinates'
import { toScale } from '@/assets/scripts/house-planner/classes/utils/helpers'

interface Dimensions {
  width: number
  height: number
}

export abstract class Building {
  protected _id: string = uniqid()
  protected _type: BuildingType = BuildingType.None
  protected readonly name: string = 'Building'
  protected _needsParent: boolean = false
  protected _baseCoords: Coordinates = { x: 0, y: 0 }
  protected _baseRotation: number = 0
  protected _baseDimensions: Dimensions = { width: 0, height: 0 }
  protected _opacity: number = 1
  protected _snapBox: SnapBox
  protected _collisionBoxes: CollisionBox[] = []
  protected _image: BuildingImage
  protected _gridSizing: GridSizing
  protected _isPlaced: boolean = false
  readonly countsTowardsLimit: boolean = true
  readonly price = {
    base: 0,
    perExtraBuilding: 0,
  }

  readonly materials = {
    sapwoodPlanks: 0,
    stoneBricks: 0,
  }

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
    // const isAdjacent = this.adjacentBuildingIds.includes(building.id)

    for (const collisionBox of collisionBoxes) {
      for (const buildingCollisionBox of buildingCollisionBoxes) {
        if (collisionBox.isIntersectingWith(buildingCollisionBox, excludeIds))
          return true
      }
    }
    return false
  }

  checkSnapBoxCollision(building: Building, excludeIds: string[]): boolean {
    return this._snapBox.isIntersectingWith(building._snapBox, excludeIds)
  }

  // gets all children buildings that count towards the limit
  get countableBuildings(): number {
    return this.childrenBuildings.filter(
      building => building.countsTowardsLimit && building.isPlaced,
    ).length + (this.isPlaced ? 1 : 0)
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

  get collisionBoxes(): CollisionBox[] {
    return this._collisionBoxes
  }

  get x(): number {
    return this._baseCoords.x
  }

  get y(): number {
    return this._baseCoords.y
  }

  get nameText(): Konva.Label {
    const text = this.name
    const FONT_SIZE = 8

    const padding = 5

    const width = typeof this._snapBox.rect.width === 'function' ? this._snapBox.rect.width() : this._snapBox.rect.width
    const height = typeof this._snapBox.rect.height === 'function' ? this._snapBox.rect.height() : this._snapBox.rect.height

    const label = new Konva.Label({
      x: this._baseCoords.x - width / 2 - (text.length / 2) * FONT_SIZE / 2,
      y: this._baseCoords.y - (height / 2) - FONT_SIZE,
      listening: false,
    })

    label.add(new Konva.Tag({
      fill: '#3A4A6B',
      shadowEnabled: false,
      cornerRadius: 2,
      listening: false,
    }))

    label.add(new Konva.Text({
      text,
      fontSize: FONT_SIZE,
      fontFamily: 'Merriweather',
      fontStyle: 'italic',
      fill: '#FFF',
      padding,
      verticalAlign: 'middle',
      listening: false,
    }))

    return label
  }

  addChild(building: Building, direction: Direction) {
    if (building.id === this._id)
      return
    if (building.id === this._parent?.id)
      return

    this._children[direction] = building
    building.parent = this
  }

  removeChild(direction: Direction) {
    // console.log('removing child', direction)
    this._children[direction]!.parent = null
    this._children[direction] = null
  }

  get childrenIds(): string[] {
    // get all children ids, including children of children
    const childrenIds: string[] = []

    for (const child of Object.values(this._children)) {
      if (child !== null) {
        childrenIds.push(child.id)
        childrenIds.push(...child.childrenIds)
      }
    }

    return childrenIds
  }

  get directChildrenIds() {
    const childrenIds: string[] = []

    for (const child of Object.values(this._children)) {
      if (child !== null)
        childrenIds.push(child.id)
    }

    return childrenIds
  }

  get adjacentBuildingIds(): string[] {
    const adjacentBuildingIds: string[] = []

    for (const child of Object.values(this._children)) {
      if (child !== null)
        adjacentBuildingIds.push(child.id)
    }

    // * Figure out whether this should count
    if (this._parent !== null)
      adjacentBuildingIds.push(this._parent.id)

    return adjacentBuildingIds
  }

  get childrenBuildings(): Building[] {
    // get all children buildings, including children of children
    const children: Building[] = []

    for (const child of Object.values(this._children)) {
      if (child !== null) {
        children.push(child)
        children.push(...child.childrenBuildings)
      }
    }

    return children
  }

  get children(): {
    North: Building | null
    East: Building | null
    South: Building | null
    West: Building | null
  } {
    return this._children
  }

  get parent(): Building | null {
    return this._parent
  }

  isOutsideGrid(rightmostX: number, bottommostY: number): boolean {
    // check if any of the collision boxes are outside the grid
    for (const collisionBox of this._collisionBoxes) {
      const { topLeft, bottomRight } = getCorners(collisionBox)

      if (topLeft.x < 0 || topLeft.y < 0)
        return true
      else if (bottomRight.x > rightmostX || bottomRight.y > bottommostY)
        return true
    }

    return false
  }

  get topLevelBuilding(): Building {
    if (this._parent === null
      || this._parent === undefined
      || !this._needsParent)
      return this as Building

    return this._parent.topLevelBuilding || this as Building
  }

  set parent(building: Building | null) {
    this._parent = building
  }

  removeParent() {
    if (this._parent === null || this._parent === undefined)
      return

    const parent = this._parent
    for (const slotSide in this._parent.children) {
      if (parent.children[slotSide as Direction] !== null) {
        if (parent.children[slotSide as Direction]!.id === this._id)
          parent.removeChild(slotSide as Direction)
      }
    }
    this._parent = null
  }

  updateCoords({ x, y }: Coordinates) {
    this._baseCoords = { x, y }
    this._image.updateCoords({ x, y })
    this._snapBox.updateCoords({ x, y })
    this._collisionBoxes.forEach(collisionBox => collisionBox.updateCoords({ x, y }))

    // update children
    for (const slotSide in this._children) {
      if (this._children[slotSide as Direction] !== null) {
        if (this._children[slotSide as Direction]!.id === this._parent?.id)
          return
        this._children[slotSide as Direction]!.snapToBuilding(this, slotSide as Direction)
      }
    }
  }

  isSlotOpen(direction: Direction): boolean {
    return this._openSlots[direction]
  }

  isPointInBuilding({ x, y }: Coordinates): boolean {
    const collisionBoxes = this._collisionBoxes

    for (let i = 0; i < collisionBoxes.length; i++) {
      if (collisionBoxes[i].isCoordInside({ x, y }))
        return true
    }

    return false
  }

  snapToBuilding(building: Building, direction: Direction) {
    for (const slotSide in this._children) {
      if (this._children[slotSide as Direction] !== null) {
        if (this._children[slotSide as Direction]!.id === building.id)
          return
      }
    }

    const { x, y } = building.getSnapCoords(direction)
    const width = toScale(this._baseDimensions.width, this._gridSizing)
    const height = toScale(this._baseDimensions.height, this._gridSizing)

    const newDirection = shiftDirectionByRotation(direction, building.baseRotation)

    switch (newDirection) {
      case Direction.North:
        this._baseCoords.x = x
        this._baseCoords.y = y - (height / 2)
        this.rotateToFace(Direction.North)
        break
      case Direction.East:
        this._baseCoords.x = x + (width / 2) + (height - width) / 2
        this._baseCoords.y = y
        this.rotateToFace(Direction.East)
        break
      case Direction.South:
        this._baseCoords.x = x
        this._baseCoords.y = y + (height / 2)
        this.rotateToFace(Direction.South)
        break
      case Direction.West:
        this._baseCoords.x = x - (width / 2) - (height - width) / 2
        this._baseCoords.y = y
        this.rotateToFace(Direction.West)
        break
    }

    this.updateCoords(this._baseCoords)
  }

  trySnapToBuilding({ x, y }: Coordinates, building: Building, place: boolean = false): {
    snapped: boolean
    side: Direction | null
  } {
    let closestCoords = Number.POSITIVE_INFINITY
    let closestSide: Direction | null = null

    const order = getBuildingOrder(building.type)
    const thisOrder = getBuildingOrder(this.type)

    for (const [side, isOpen] of Object.entries(building.openSlots)) {
      if (building.children[side as Direction] !== null)
        continue

      if ((side === 'East' || side === 'West') && order > thisOrder)
        continue

      if (isOpen) {
        const coords = building.getSnapCoords(side as Direction)
        const distance = Math.sqrt((x - coords.x) ** 2 + (y - coords.y) ** 2)

        if (distance < closestCoords) {
          closestCoords = distance
          closestSide = side as Direction
        }
      }
    }

    if (closestSide !== null) {
      this.snapToBuilding(building, closestSide)
      return {
        snapped: true,
        side: closestSide,
      }
    }

    if (place && closestSide !== null) {
      building.addChild(this, closestSide as Direction)
      return {
        snapped: true,
        side: closestSide,
      }
    }

    return {
      snapped: false,
      side: null,
    }
  }

  getSnapCoords(direction: Direction): Coordinates {
    const newDirection = shiftDirectionByRotation(direction, this._baseRotation)
    switch (newDirection) {
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
    rotation = ((this._baseRotation += rotation) % 360)

    if (rotation < 0)
      rotation += 360

    this._baseRotation = rotation
    this._image.updateRotation(rotation)
    this._snapBox.updateRotation(rotation)
    this._collisionBoxes.forEach(collisionBox => collisionBox.updateRotation(rotation))

    // update children
    for (const slotSide in this._children) {
      if (this._children[slotSide as Direction] !== null)
        this._children[slotSide as Direction]!.snapToBuilding(this, slotSide as Direction)
    }
  }

  get openSlots(): {
    North: boolean
    East: boolean
    South: boolean
    West: boolean
  } {
    return this._openSlots
  }

  get isPlaced(): boolean {
    return this._isPlaced
  }

  set isPlaced(value: boolean) {
    this._isPlaced = value
  }

  get opacity(): number {
    return this._opacity
  }

  set opacity(value: number) {
    this._opacity = value
    this._image.opacity = value
  }

  getPrice(count: number): number {
    return this.price.base * count + (this.price.perExtraBuilding * (count - 1))
  }

  get copy(): Building {
    const building = new (this.constructor as any)(this._gridSizing)
    building._baseCoords = { ...this._baseCoords }
    building._baseRotation = Number.parseInt(this._baseRotation.toString())
    building._baseDimensions = { ...this._baseDimensions }
    building._opacity = Number.parseInt(this._opacity.toString())
    building._snapBox = this._snapBox.copy
    building._collisionBoxes = this._collisionBoxes.map(collisionBox => collisionBox.copy)
    building._image = this._image.copy
    building._openSlots = { ...this._openSlots }
    building._children = { ...this._children }
    building._parent = this._parent
    building._id = uniqid()

    return building as Building
  }
}

function getCorners(collisionBox: CollisionBox) {
  const x = typeof collisionBox.rect.x === 'function' ? collisionBox.rect.x() : collisionBox.rect.x
  const y = typeof collisionBox.rect.y === 'function' ? collisionBox.rect.y() : collisionBox.rect.y
  const width = typeof collisionBox.rect.width === 'function' ? collisionBox.rect.width() : collisionBox.rect.width
  const height = typeof collisionBox.rect.height === 'function' ? collisionBox.rect.height() : collisionBox.rect.height

  const topLeft = { x: x - width / 2, y: y - height / 2 }
  const bottomRight = { x: x + width / 2, y: y + height / 2 }

  return { topLeft, bottomRight }
}

function getBuildingOrder(type: BuildingType) {
  let order = 0

  switch (type) {
    case BuildingType.LargeHouse:
    case BuildingType.HarvestHouse:
      order = 1
      break
    case BuildingType.MediumHouse:
      order = 2
      break
    case BuildingType.SmallHouse:
      order = 3
      break
    case BuildingType.Hallway:
      order = 4
      break
    default:
      order = 100
  }

  return order
}
