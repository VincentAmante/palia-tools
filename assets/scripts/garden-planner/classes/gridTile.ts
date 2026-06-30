import type { TUniqueTiles, CoordinateObject, Coordinates } from "../utils/garden-helpers"
import type { Bonus } from "../imports";
import type { Crop, Fertiliser } from '@/assets/scripts/garden-planner/imports'
import uniqid from 'uniqid'
import { translateCoordinates } from "../utils/garden-helpers";
import type { IGridCrop, IGridTile } from "../utils/gardenGridTypes";

interface GridTileConstructorParams {
    coordinates: Coordinates,
    plotLocalCoordinates: Coordinates,
    plotId: string
}

export class GridTile implements IGridTile {
    private _attachedCrop: IGridCrop | null = null
    private _id = uniqid()
    private _fertiliser: Fertiliser | null = null
    private _bonusesReceived: Map<string, Bonus> = new Map()
    private _bonuses = new Set<Bonus>()
    private _coordinates: Coordinates
    private _plotLocalCoordinates: Coordinates
    private _plotId: string
    // private _hoverCrop: Crop | null = null
    // private _hoverFertiliser: Fertiliser | null = null
    private _isHovered: boolean = false
    private _hoverState: 'NONE' | 'DEFAULT' | 'DELETE' | 'INVALID' = 'NONE'

    constructor(args: GridTileConstructorParams) {
        this._coordinates = args.coordinates
        this._plotLocalCoordinates = args.plotLocalCoordinates
        this._plotId = args.plotId
    }

    set attachedCrop(crop: IGridCrop | null) {
        this._attachedCrop = crop
    }

    set fertiliser(fertiliser: Fertiliser | null) {
        this._fertiliser = fertiliser
    }

    resetBonusesReceived() {
        this._bonusesReceived = new Map()
        this.updateBonuses()
    }

    addBonusReceived(sourceId: string, bonus: Bonus) {
        this._bonusesReceived.set(sourceId, bonus)
        this.updateBonuses()
    }

    updateBonuses() {
        // this._bonuses = new Set(Array.from(this._bonusesReceived.values()).sort())
        if (this._attachedCrop) this._attachedCrop.updateCropBonuses()
        this._bonuses = new Set(this._attachedCrop?.bonuses)
    }

    get id(): string {
        return this._id
    }

    get plotId(): string {
        return this._plotId
    }

    get isHovered(): boolean {
        return this._isHovered
    }

    get crop(): Crop | null {
        return this._attachedCrop?.crop || null
    }

    get cropTile(): IGridCrop | null {
        return this._attachedCrop
    }

    get fertiliser(): Fertiliser | null {
        return this._fertiliser
    }

    get bonuses(): Bonus[] {
        return Array.from(this._bonuses)
    }

    get bonusesReceived(): Bonus[] {
        return Array.from(this._bonusesReceived.values())
    }

    get coordinates() {
        return this._coordinates
    }

    get plotLocalCoordinates() {
        return this._plotLocalCoordinates
    }

    get attachedCrop() {
        return this._attachedCrop
    }

    get hoverState() {
        return this._hoverState
    }

    set isHovered(isHovered: boolean) {
        this._isHovered = isHovered
        if (!isHovered) this._hoverState = 'NONE'
        else this._hoverState = 'DEFAULT'
    }

    set hoverState(hoverState: 'NONE' | 'DEFAULT' | 'DELETE' | 'INVALID') {
        this._hoverState = hoverState
    }

    hasBonus(bonus: Bonus): boolean {
        return this._bonuses.has(bonus)
    }

    translateTileCoordinates(translateBy: CoordinateObject) {
        const newCoords = translateCoordinates(this._coordinates, translateBy)

        // Only change if the tile iss the crop's starting point, prevents repeated translation
        if (this._attachedCrop && this._attachedCrop.location.start === this._coordinates) {
            this._attachedCrop.translateCropCoordinates(translateBy)
        }

        this._coordinates = newCoords
    }

    uniqueTiles(): TUniqueTiles {
        const uniqueTiles: TUniqueTiles = new Map()

        return uniqueTiles
    }
}