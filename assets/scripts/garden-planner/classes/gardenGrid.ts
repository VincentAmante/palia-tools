import CropSize from "../enums/crop-size"
import type { ITile } from "./tile"
import type { TUniqueTiles as UniqueCropTiles } from "../utils/garden-helpers"
import type { Bonus } from "../imports";
import { Crop, CropCode, CropType, Fertiliser, getCodeFromCrop, getCodeFromFertiliser, getCropFromCode, getFertiliserFromCode } from '@/assets/scripts/garden-planner/imports'
import uniqid from 'uniqid'
import { parseSave, parseSaveTEST } from "../save-handler";
import { PLOT_DIMENSION_REGEX, CROP_FERTILISER_REGEX, expandPlotCode } from "../saveHandlerGardenBasic";
import FertiliserCode from "../enums/fertilisercode";

export type CoordinateObject = {
    x: number,
    y: number
}

export type Coordinates = string;

export const fromCoordinateObject = (coordinates: CoordinateObject): Coordinates => `${coordinates.x},${coordinates.y}`;
export const toCoordinateObject = (key: Coordinates): CoordinateObject => {
    const [x, y] = key.split(',').map(Number);
    if (typeof x !== 'number' || typeof y !== 'number') {
        throw new Error('Attempted to parse a non-Coordinate string')
    }
    return { x, y };
};

interface IGridPlot {
    startCoordinates: Coordinates // which tile this plot starts in
    tiles: Map<Coordinates, GridTile> // Which tiles are assigned to this grid
    getStartingCrops: () => Set<IGridCrop> // get crops but only if its starting tile is within the plot
}

export class GridPlot implements IGridPlot {
    private _startCoordinates: Coordinates;
    private _tiles: Map<Coordinates, GridTile> = new Map()
    private _id = uniqid()

    constructor(startCoords: Coordinates) {
        this._startCoordinates = startCoords
    }

    get startCoordinates() {
        return this._startCoordinates
    }

    get tiles() {
        return this._tiles
    }

    get id() {
        return this._id
    }

    set tiles(tiles: Map<Coordinates, GridTile>) {
        this._tiles = tiles
    }

    /**
     * 
     * @returns Any crop where it's starting tile is within the bounds of this plot
     */
    getStartingCrops() {
        const crops: Set<IGridCrop> = new Set()

        for (const tile of this._tiles.values()) {
            if (!tile.attachedCrop) continue
            if (crops.has(tile.attachedCrop)) continue

            for (const cropTile of tile.attachedCrop.tiles) {
                // ? Could prob add a logic check to see if the crop's starting tile is within the plot's bounds
                if (cropTile.attachedCrop && cropTile.attachedCrop.location.start === this._startCoordinates)
                    crops.add(cropTile.attachedCrop)
            }
        }

        return crops
    }
}

// Unique crop data for this version
interface IGridCrop {
    location: {
        start: Coordinates,
        end: Coordinates // if 1x1, same as start
    }
    tiles: Set<GridTile>
    id: string
    crop: Crop
    bonuses: Set<Bonus> // unique set of bonuses
    updateCropBonuses: () => void
    getCropRelativeCoords: (coordinates: Coordinates) => Coordinates
}

function compressPlotString(tiles: string[]) {
    // const tiles = uncompressedCodeString.match(/[A-Z][a-z]*(?:\.[A-Z][a-z]*)

    if (tiles.length === 0) return '';

    const compressed = [];
    let current = tiles[0];
    let count = 0;

    for (const tile of tiles) {
        if (tile === current) {
            count++
        } else {
            compressed.push(`${current}${(count > 1 ? count : '')}`)
            current = tile
            count = 1
        }
    }

    compressed.push(`${current}${(count > 1 ? count : '')}`)

    return compressed.join('');
}

export class GridCrop implements IGridCrop {
    private _id = uniqid()
    private _location: {
        start: Coordinates; end: Coordinates; // if 1x1, same as start
    }

    private _tiles: Set<GridTile> = new Set();
    private _crop: Crop;
    private _bonuses: Set<Bonus> = new Set();

    constructor(startCoords: Coordinates, crop: Crop) {
        const dimensions = getDimensions(crop.size)

        const parsedCoords = toCoordinateObject(startCoords)
        this._location = {
            start: startCoords,
            end: fromCoordinateObject({
                x: parsedCoords.x + (dimensions.width - 1),
                y: parsedCoords.y + (dimensions.height - 1)
            })
        }

        this._crop = crop
    }

    get location() {
        return this._location
    }

    get tiles(): Set<GridTile> {
        return this._tiles
    }
    get bonuses(): Set<Bonus> {
        return this._bonuses
    }

    get id() {
        return this._id
    }

    get crop() {
        return this._crop
    }

    set tiles(tiles: Set<GridTile>) {
        this._tiles = tiles
    }

    getCropRelativeCoords(coordinates: Coordinates) {
        const coordsToCompareObj = toCoordinateObject(coordinates)
        const cropStartingCoordsObj = toCoordinateObject(this._location.start)
        const result = {
            x: coordsToCompareObj.x - cropStartingCoordsObj.x,
            y: coordsToCompareObj.y - cropStartingCoordsObj.y
        }

        if (result.x < 0 || result.y < 0) {
            throw new Error('tile is out of bounds!')
        }

        return fromCoordinateObject(result)
    }

    updateCropBonuses() {
        const requiredSize: number = (() => {
            switch (this._crop.size) {
                case CropSize.Tree:
                    return 3
                case CropSize.Bush:
                    return 2
                default:
                case CropSize.Single:
                    return 1
            }
        })()

        const bonusCounts: Map<Bonus, number> = new Map()

        for (const tile of this._tiles) {
            for (const bonus of tile.bonusesReceived) {
                bonusCounts.set(bonus, (bonusCounts.get(bonus) || 0) + 1)
            }
        }

        const validBonuses: Set<Bonus> = new Set()
        for (const [bonus, count] of bonusCounts) {
            if (count >= requiredSize) validBonuses.add(bonus)
        }

        this._bonuses = validBonuses
    }
}

interface GridTileConstructorParams {
    coordinates: Coordinates,
    plotLocalCoordinates: Coordinates,
    plotId: string
}

export class GridTile implements ITile {
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
    private _isMarkedForDeletion: boolean = false

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
        this._bonuses = new Set(Array.from(this._bonusesReceived.values()).sort())
        if (this._attachedCrop) this._attachedCrop.updateCropBonuses()
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
}


function coordsByDirection(coordinatesKey: Coordinates, direction: 'North' | 'East' | 'South' | 'West') {
    const coordinates = toCoordinateObject(coordinatesKey)

    return fromCoordinateObject((() => {
        switch (direction) {
            case 'North':
                return {
                    x: coordinates.x,
                    y: coordinates.y - 1
                }
            case 'East':
                return {
                    x: coordinates.x + 1,
                    y: coordinates.y
                }
            case 'South':
                return {
                    x: coordinates.x,
                    y: coordinates.y + 1
                }
            case 'West':
                return {
                    x: coordinates.x - 1,
                    y: coordinates.y
                }
        }
    })())
}

function getDimensions(size: CropSize) {
    switch (size) {
        case CropSize.Bush:
            return {
                width: 2,
                height: 2
            }

        case CropSize.Tree:
            return {
                width: 3,
                height: 3
            }

        case CropSize.Single:
        default:
            return {
                width: 1,
                height: 1
            }
    }
};


interface GardenGridConstructorParams {
    widthInTiles: number,
    heightInTiles: number,
    startCoords: CoordinateObject,
    plotCoordinates: Set<Coordinates>,
    settingsCode?: string
}


export interface GardenGridPlaceCropOptions {
    /**
     * Setting: Whether the garden should check if a crop already exists in the tile
     * - Used to handle 0.3 codes, which doesn't track the starting tile of a crop
     */
    blockPlacingOnTileOfSameCropType?: boolean


    /**
     * Setting: If placing 'null' or 'CropType.None' on a tile with a crop, ignore it.
     * - Used to handle loading 0.4 codes. 
     */
    avoidRemovingOnEmptyTiles?: boolean

    /**
     * Setting: When attempting to place a crop, check if any of the tiles to use contains a crop of the same type.
     * Used for drag-placing operations
     * If one is found:
     * - Avoid placing if the starting tile is either in the same row or the same column.
     * - Avoid placing if the starting tile has lower x or y than the crop's starting positon
     */
    blockPlacingUnlessCropHasLesserPlacementPriority?: boolean
}

export class GardenGrid {
    private _tiles: Map<Coordinates, GridTile> = new Map()
    private _heightInTiles: number;
    private _widthInTiles: number;
    private _plots: Map<Coordinates, GridPlot> = new Map()
    private _hoveredTiles: Set<Coordinates> = new Set()
    private _hoveredTilesMarkedForDeletion: Set<Coordinates> = new Set()

    private _settingsCode = ''
    private _hasSettingsToLoad = true

    constructor(args: GardenGridConstructorParams) {
        this._heightInTiles = args.heightInTiles
        this._widthInTiles = args.widthInTiles

        for (const plotCoords of args.plotCoordinates) {
            this.placePlot(plotCoords)
        }

        if (args.settingsCode) {
            this._settingsCode = args.settingsCode
            this._hasSettingsToLoad = true
        }
    }

    get height() {
        return this._heightInTiles
    }

    get width() {
        return this._widthInTiles
    }


    get tiles() {
        return this._tiles
    }

    /**
     * 
     * @param coordinates coordinates of the tile to update
     */
    updateTileBonuses(coordinates: Coordinates) {
        const modifiedTiles = new Set<Coordinates>()

        const tileToUpdate = this.getTile(coordinates)
        if (!tileToUpdate) return modifiedTiles

        tileToUpdate.resetBonusesReceived()

        const tileNeighbours: Array<GridTile | null> = [
            this.getTile(coordsByDirection(coordinates, 'North')),
            this.getTile(coordsByDirection(coordinates, 'East')),
            this.getTile(coordsByDirection(coordinates, 'West')),
            this.getTile(coordsByDirection(coordinates, 'South'))
        ]

        for (const neighbouringTile of tileNeighbours) {
            // ensures there is a tile and crop to get bonuses from
            if (!neighbouringTile || !neighbouringTile.attachedCrop) continue
            // must not come from the same crop
            if (neighbouringTile.attachedCrop.id === tileToUpdate.attachedCrop?.id) continue
            // if the tile to update has a crop, it musn't be of the same kind as its neighbour to receive a bonus
            if (tileToUpdate?.attachedCrop?.crop.type === neighbouringTile.attachedCrop.crop.type) continue

            tileToUpdate.addBonusReceived(neighbouringTile.id, neighbouringTile.attachedCrop.crop.cropBonus)
        }

        if (tileToUpdate.fertiliser) {
            tileToUpdate.addBonusReceived(tileToUpdate.id, tileToUpdate.fertiliser.effect)
        }

        // if this tile is attached to a larger crop, ensure to add every tile to the modified list
        tileToUpdate.attachedCrop?.tiles.forEach((tile) => {
            modifiedTiles.add(tile.coordinates)
        })


        this._tiles.set(tileToUpdate.coordinates, tileToUpdate)
        return modifiedTiles
    }

    getUniqueCropTiles(): UniqueCropTiles {
        const uniqueCropTiles = new Map<string, {
            tile: ITile,
            count: number
        }>()

        /**
         * TODO: Check every GridTile
         */

        return uniqueCropTiles
    }

    getTile(coordinates: Coordinates): GridTile | null { return this._tiles.get(coordinates) || null }

    unhoverTiles() {
        const modifiedTiles: Set<Coordinates> = new Set()

        this._hoveredTiles.forEach((tileCoordinates) => {
            const tileToUpdate = this.getTile(tileCoordinates)
            if (!tileToUpdate) return

            tileToUpdate.isHovered = false
            this._tiles.set(tileCoordinates, tileToUpdate)
            modifiedTiles.add(tileCoordinates)
            this._hoveredTiles.delete(tileCoordinates)
        })

        this._hoveredTilesMarkedForDeletion.forEach((tileCoordinates) => {
            const tileToUpdate = this.getTile(tileCoordinates)
            if (!tileToUpdate) return

            tileToUpdate.isHovered = false
            this._tiles.set(tileCoordinates, tileToUpdate)
            modifiedTiles.add(tileCoordinates)
            this._hoveredTilesMarkedForDeletion.delete(tileCoordinates)
        })

        return modifiedTiles
    }

    hoverTile(coordinates: Coordinates, selectedItem: Crop | Fertiliser | null = null) {
        const modifiedTiles: Set<Coordinates> = new Set()

        const baseTile = this.getTile(coordinates)
        if (!baseTile) return modifiedTiles

        if (!baseTile.attachedCrop && selectedItem === null) {
            baseTile.isHovered = true
            this._tiles.set(coordinates, baseTile)
            this._hoveredTiles.add(coordinates)
            return modifiedTiles.add(coordinates)
        }

        if (selectedItem instanceof Crop) {
            const tilesForPlacing = this.getTiles(coordinates, selectedItem.size)
            tilesForPlacing.tiles.forEach((tile) => {
                modifiedTiles.add(tile.coordinates)
                tile.isHovered = true
                if (tilesForPlacing.hasInvalidTiles) tile.hoverState = 'INVALID'
                this._hoveredTiles.add(tile.coordinates)
                this._tiles.set(tile.coordinates, tile)

                if (tile.attachedCrop) {
                    tile.attachedCrop.tiles.forEach((attachedTile) => {
                        if (tilesForPlacing.coordinates.has(attachedTile.coordinates)) return

                        this._hoveredTilesMarkedForDeletion.add(attachedTile.coordinates)
                        attachedTile.isHovered = true
                        attachedTile.hoverState = 'DELETE'
                        modifiedTiles.add(attachedTile.coordinates)
                        this._tiles.set(attachedTile.coordinates, attachedTile)
                    })
                }
            })

        } else if (selectedItem instanceof Fertiliser) {
            let tilesForPlacing: Set<GridTile> = new Set()

            if (baseTile.attachedCrop) {
                tilesForPlacing = tilesForPlacing.union(baseTile.attachedCrop.tiles)
            } else {
                tilesForPlacing.add(baseTile)
            }

            tilesForPlacing.forEach((tileToUpdate) => {
                tileToUpdate.isHovered = true
                this._hoveredTiles.add(tileToUpdate.coordinates)
                modifiedTiles.add(tileToUpdate.coordinates)
                this._tiles.set(tileToUpdate.coordinates, tileToUpdate)
            })
        } else if (!selectedItem) {
            let tilesForDeletion: Set<GridTile> = new Set()

            if (baseTile.attachedCrop) {
                tilesForDeletion = tilesForDeletion.union(baseTile.attachedCrop.tiles)
            } else {
                tilesForDeletion.add(baseTile)
            }

            tilesForDeletion.forEach((tileToUpdate) => {
                tileToUpdate.isHovered = true
                tileToUpdate.hoverState = 'DELETE'
                this._hoveredTiles.add(tileToUpdate.coordinates)
                modifiedTiles.add(tileToUpdate.coordinates)
                this._tiles.set(tileToUpdate.coordinates, tileToUpdate)
            })
        }

        return modifiedTiles
    }

    /**
     * 
     * @param coordinates x,y of the startint tile to check
     * @param size cropSize
     * @returns all tiles requested, with flag if a tile was not found
     */
    getTiles(coordinates: Coordinates, size: CropSize): {
        tiles: Map<Coordinates, GridTile>,
        coordinates: Set<Coordinates>,
        hasInvalidTiles: boolean
    } {
        // const fetchedTiles = new Set<GridTile>()
        const fetchedTiles: Map<Coordinates, GridTile> = new Map()
        const fetchedTilesCoordinates = new Set<Coordinates>()

        // checks if it tries to get a tile that doesn't exist
        let hasInvalidTiles = false

        const { width, height } = getDimensions(size)

        for (let w = 0; w < width; w++) {
            for (let h = 0; h < height; h++) {
                const coordinatesParsed = toCoordinateObject(coordinates)

                const newTileCoordinates = fromCoordinateObject({
                    x: coordinatesParsed.x + w,
                    y: coordinatesParsed.y + h
                })

                const checkedTile = this._tiles.get(newTileCoordinates)

                if (checkedTile) {
                    fetchedTiles.set(newTileCoordinates, checkedTile)
                    fetchedTilesCoordinates.add(newTileCoordinates)
                }
                else hasInvalidTiles = true
            }
        }

        return {
            tiles: fetchedTiles,
            coordinates: fetchedTilesCoordinates,
            hasInvalidTiles
        }
    }

    fetchWhichNeighboursAreOfTheSameTypeBoolean(coordinates: Coordinates, ignorePlotId: boolean = true): {
        north: boolean,
        east: boolean,
        west: boolean,
        south: boolean,
    } {
        const baseTile = this.getTile(coordinates)

        const output = {
            north: false,
            east: false,
            west: false,
            south: false
        }
        if (!baseTile) return output

        const northTile = coordsByDirection(coordinates, 'North')
        const eastTile = coordsByDirection(coordinates, 'East')
        const westTile = coordsByDirection(coordinates, 'West')
        const southTile = coordsByDirection(coordinates, 'South')

        const isSameType = (tileACoords: Coordinates, tileBCoords: Coordinates): boolean => {
            const tileA = this.getTile(tileACoords)
            const tileB = this.getTile(tileBCoords)

            if (!tileA || !tileB) return false

            const isTileAEmpty = (!tileA?.attachedCrop)
            const isTileBEmpty = (!tileB?.attachedCrop)

            if (isTileAEmpty && isTileBEmpty) {
                // If both empty && ignorePlotId is disabled, their plotId will be used to determine their borders
                return (ignorePlotId || (tileA?.plotId === tileB?.plotId))
            } else if ((isTileAEmpty && !isTileBEmpty) || (!isTileAEmpty && isTileBEmpty)) {
                // if one is empty and the other isn't, they're automatically different
                return false
            }

            if (tileA.attachedCrop?.crop.type === tileB.attachedCrop?.crop.type) {
                return (tileA.attachedCrop?.id === tileB.attachedCrop?.id)
            }

            return false
        }

        return {
            north: isSameType(coordinates, northTile),
            east: isSameType(coordinates, eastTile),
            west: isSameType(coordinates, westTile),
            south: isSameType(coordinates, southTile)
        }
    }

    getAdjacentTilesCoords(coordinates: Coordinates): Coordinates[] {
        const baseTile = this.getTile(coordinates)
        if (!baseTile) return [] satisfies Array<Coordinates>

        const adjacentTilesCoords: Array<Coordinates> = [
            coordsByDirection(coordinates, 'North'),
            coordsByDirection(coordinates, 'East'),
            coordsByDirection(coordinates, 'West'),
            coordsByDirection(coordinates, 'South')
        ]

        return adjacentTilesCoords
    }

    /**
     * Gets only tiles that do not share a crop
     * @param coordinates 
     */
    getAdjacentTilesWithDifferentCropCoords(coordinates: Coordinates, ignoreBaseTileCrop = false) {
        const baseTile = this.getTile(coordinates)
        if (!baseTile) return [] satisfies Array<Coordinates>

        const adjacentTilesCoords: Array<Coordinates> = [
            coordsByDirection(coordinates, 'North'),
            coordsByDirection(coordinates, 'East'),
            coordsByDirection(coordinates, 'West'),
            coordsByDirection(coordinates, 'South')
        ]

        const matchingTilesCoords: Array<Coordinates> = []

        for (const adjacentTileCoords of adjacentTilesCoords) {
            const adjacentTile = this.getTile(adjacentTileCoords)

            if (!adjacentTile) continue
            if ((!baseTile.attachedCrop && !ignoreBaseTileCrop) || !adjacentTile.attachedCrop) continue
            if (baseTile.attachedCrop?.id === adjacentTile.attachedCrop.id) continue

            matchingTilesCoords.push(adjacentTileCoords)
        }

        return matchingTilesCoords
    }

    /**
     * Places a new plot at the given position
     * @param coordinates - Coordinates to start plot in
     * @returns 
     */
    placePlot(coordinates: Coordinates) {
        const startingTile = this.getTile(coordinates)
        const modifiedTiles: Set<Coordinates> = new Set()

        /**
         * Until proof that existing gardens can have overlapping tiles, we'll avoid direct support of it
         */
        if (startingTile) return modifiedTiles
        const tilesThatWouldConflictWithNewPlot = this.getTiles(coordinates, CropSize.Tree)
        if (tilesThatWouldConflictWithNewPlot.coordinates.size > 0) return modifiedTiles // shouldn't be any existing tiles


        const newPlot = new GridPlot(coordinates)
        const newPlotTiles: Map<Coordinates, GridTile> = new Map()

        const { x: startX, y: startY } = toCoordinateObject(coordinates)

        for (let y = 0; y < 3; y++) {
            for (let x = 0; x < 3; x++) {
                const newTileCoordsObj = { x: startX + x, y: startY + y }
                const newTileCoords = fromCoordinateObject(newTileCoordsObj)

                if (((newTileCoordsObj.x + 1) > this._widthInTiles)
                    || ((newTileCoordsObj.y + 1) > this._heightInTiles)) {
                    throw new Error('Tile is out of bounds')
                }

                const newTile = new GridTile({
                    coordinates: newTileCoords,
                    plotLocalCoordinates: fromCoordinateObject({ x, y }),
                    plotId: newPlot.id
                })


                if (this._tiles.has(newTileCoords)) {
                    // TODO: Consider how to handle overlapping plots
                    console.warn('WARNING: Attempted to make tile that already exists')
                    continue
                }

                modifiedTiles.add(newTileCoords)
                this._tiles.set(newTileCoords, newTile)
                newPlotTiles.set(newTileCoords, newTile)
            }
        }

        newPlot.tiles = newPlotTiles
        this._plots.set(coordinates, newPlot)

        return modifiedTiles
    }

    /**
     * 
     * @param coordinates - coordinates of any tile within that plot
     */
    deletePlot(coordinates: Coordinates) {

    }

    trimPlots() {
        const rowHasTileMap: Map<number, boolean> = new Map()
        const colHasTileMap: Map<number, boolean> = new Map()
        const rows = [...Array(this._heightInTiles).keys()]
        const cols = [...Array(this._widthInTiles).keys()]

        for (const row of rows) {
            for (const col of cols) {
                const tile = this.getTile(`${col},${row}`)
                if (!tile) {
                    rowHasTileMap.set(row, rowHasTileMap.get(row) || false)
                    colHasTileMap.set(col, colHasTileMap.get(col) || false)
                } else {
                    rowHasTileMap.set(row, true)
                    colHasTileMap.set(col, true)
                }
            }
        }

        console.log('rowHasTileMap', rowHasTileMap)
        console.log('colHasTileMap', colHasTileMap)
    }

    displaceGarden(rowToDisplace: number, colToDisplace: number) {
        const newTiles: Map<Coordinates, GridTile> = new Map()
        const newPlots: Map<Coordinates, GridPlot> = new Map()
    }


    placeCrop(coordinates: Coordinates, crop: Crop | null, options: GardenGridPlaceCropOptions = {}) {
        let modifiedTiles: Set<Coordinates> = new Set()


        if (!crop || crop.type === CropType.None) {
            if (options.avoidRemovingOnEmptyTiles) return modifiedTiles

            modifiedTiles = modifiedTiles.union(this.removeCrop(coordinates))
            return modifiedTiles
        }

        if (options.blockPlacingOnTileOfSameCropType) {
            const tile = this.getTile(coordinates)
            if (tile?.attachedCrop && tile.attachedCrop.crop.type === crop.type) {
                return modifiedTiles
            }
        }

        // const startingTile = this.getTile(coordinates)
        const tilesForPlacing = this.getTiles(coordinates, crop.size)

        // Needs every tile it'll be placed in to 'exist' first
        if (tilesForPlacing.hasInvalidTiles) {
            // console.warn('invalid tiles found')
            return modifiedTiles
        }

        if (options.blockPlacingUnlessCropHasLesserPlacementPriority) {
            const coordinatesObj = toCoordinateObject(coordinates)
            let invalidPlacementFound = false

            tilesForPlacing.tiles.forEach((tileToCheck) => {
                if (!tileToCheck.attachedCrop || !(tileToCheck.attachedCrop.crop.type === crop.type)) return

                const tileStartCoordinatesObj = toCoordinateObject(tileToCheck.attachedCrop.location.start)

                if ((tileStartCoordinatesObj.x < coordinatesObj.x) && (tileStartCoordinatesObj.y === coordinatesObj.y)) {
                    invalidPlacementFound = true
                }
                if (tileStartCoordinatesObj.y < coordinatesObj.y && (tileStartCoordinatesObj.x === coordinatesObj.x)) {
                    invalidPlacementFound = true
                }

                if ((tileStartCoordinatesObj.x < coordinatesObj.x) && (tileStartCoordinatesObj.y < coordinatesObj.y))
                    invalidPlacementFound = true
            })

            if (invalidPlacementFound) return modifiedTiles
        }


        const attachedCrop = new GridCrop(coordinates, crop)
        modifiedTiles = modifiedTiles.union(tilesForPlacing.coordinates)
        for (const tile of tilesForPlacing.tiles.values()) {
            if (tile.attachedCrop) {
                console.log('attached crop found, removing')
                // remove any crop on it first
                modifiedTiles = modifiedTiles.union(this.removeCrop(tile.coordinates))
            }
            tile.attachedCrop = attachedCrop
        }

        attachedCrop.tiles = new Set(tilesForPlacing.tiles.values())

        // Update every tile only after the affected tiles have had the crop placed
        for (const tile of tilesForPlacing.tiles.values()) {

            modifiedTiles = modifiedTiles.union(new Set(this.getAdjacentTilesCoords(tile.coordinates)))
            const adjacentTiles = this.getAdjacentTilesWithDifferentCropCoords(tile.coordinates)
            for (const adjacentTile of adjacentTiles) {
                modifiedTiles = modifiedTiles.union(this.updateTileBonuses(adjacentTile))
            }

            modifiedTiles = modifiedTiles.union(this.updateTileBonuses(tile.coordinates))
            this._tiles.set(tile.coordinates, tile)
        }

        return modifiedTiles
    }

    removeCrop(coordinates: Coordinates) {
        const tile = this.getTile(coordinates)
        let modifiedTiles = new Set<Coordinates>().add(coordinates)

        if (!tile) return modifiedTiles
        if (!tile.attachedCrop) return modifiedTiles

        const attachedCrop = tile.attachedCrop
        const attachedCropTiles = attachedCrop.tiles

        attachedCropTiles.forEach((attachedTile) => {
            // console.log('updating: ', attachedTile.coordinates)
            attachedTile.attachedCrop = null
            modifiedTiles.add(attachedTile.coordinates)
            this._tiles.set(attachedTile.coordinates, attachedTile)

            // Add all neighbours to modified tiles first
            modifiedTiles = modifiedTiles.union(new Set(this.getAdjacentTilesCoords(attachedTile.coordinates)))

            // Update the neighbour of each tile
            for (const neighbouringTileCoords of this.getAdjacentTilesWithDifferentCropCoords(attachedTile.coordinates, true)) {
                // console.log('neighbor:', neighbouringTileCoords)
                modifiedTiles = modifiedTiles.union(this.updateTileBonuses(neighbouringTileCoords))
            }
        })

        // console.log('removeCropModifiedTiles: ', modifiedTiles)
        return modifiedTiles
    }

    placeFertiliser(coordinates: Coordinates, fertiliser: Fertiliser | null) {
        let modifiedTiles: Set<Coordinates> = new Set()
        const baseTile = this._tiles.get(coordinates)

        if (!baseTile) return modifiedTiles

        // removes fertiliser from crops
        if (!fertiliser) {
            modifiedTiles = modifiedTiles.union(this.removeFertiliser(coordinates))
            return modifiedTiles
        }

        // fertiliser must always be applied to the entire crop
        if (baseTile.attachedCrop) {
            const tilesToUpdate = baseTile.attachedCrop.tiles
            tilesToUpdate.forEach((tileToUpdate) => {
                tileToUpdate.fertiliser = fertiliser
                this.updateTileBonuses(tileToUpdate.coordinates)
                modifiedTiles.add(tileToUpdate.coordinates)
                this._tiles.set(tileToUpdate.coordinates, tileToUpdate)
            })
        } else {
            baseTile.fertiliser = fertiliser
            modifiedTiles.add(coordinates)
            this.updateTileBonuses(baseTile.coordinates)
            this._tiles.set(coordinates, baseTile)
        }


        return modifiedTiles
    }

    removeFertiliser(coordinates: Coordinates) {
        const modifiedTiles: Set<Coordinates> = new Set()
        const baseTile = this.getTile(coordinates)

        if (!baseTile) return modifiedTiles
        if (!baseTile.fertiliser) return modifiedTiles

        // Removes the fertiliser from all tiles that host the same crop
        if (baseTile.attachedCrop) {
            const tilesToUpdate = baseTile.attachedCrop.tiles
            tilesToUpdate.forEach((tileToUpdate) => {
                tileToUpdate.fertiliser = null
                this.updateTileBonuses(tileToUpdate.coordinates)
                modifiedTiles.add(tileToUpdate.coordinates)
                this._tiles.set(tileToUpdate.coordinates, tileToUpdate)
            })
        } else {
            baseTile.fertiliser = null
            this.updateTileBonuses(baseTile.coordinates)
            modifiedTiles.add(coordinates)
            this._tiles.set(coordinates, baseTile)
        }

        return modifiedTiles
    }

    fetchGardenCode() {
        const base = 'D'
        const dimensionInfo = `${this._widthInTiles}x${this._heightInTiles}`

        const dimensionString: string = [base, dimensionInfo].join('-')
        const cropCodeStrings: string[] = []

        for (const [startCoords, plot] of this._plots) {
            const coordsString = `${toCoordinateObject(startCoords).x}x${toCoordinateObject(startCoords).y}`
            const plotString = []
            const regex = /[A-Z][a-z]*(?:\.[A-Z][a-z]*)?\d*/

            for (const [tileCoords, _] of plot.tiles) {
                // we fetch the tile from the garden itself for now due to uncertainty about tile updates
                const tile = this.getTile(tileCoords)
                if (!tile) throw new Error('Tile somehow missing')


                const tileString: string[] = []

                /**
                 * To handle plots with overlapping tiles,
                 * every tile has a 'plotId' to designate which plot the tile 'belongs to'.
                 * To respect this, every tile it doesn't 'own' gets replaced with a 'None'
                 */
                if (tile.plotId !== plot.id) {
                    tileString.push(CropCode.None)
                    plotString.push(tileString.join(''))
                    continue
                }

                if (!tile.attachedCrop) {
                    tileString.push(CropCode.None)
                    if (tile.fertiliser) {
                        tileString.push(`.${getCodeFromFertiliser(tile.fertiliser)}`)
                    }
                    plotString.push(tileString.join(''))
                    continue
                }

                /**
                 * A tile should only bother saving the start position of a crop.
                 * When loading, the code should only bother placing a crop at its beginning point anyways
                 */
                if (tile.attachedCrop.location.start !== tileCoords) {
                    tileString.push(CropCode.None)
                    plotString.push(tileString.join(''))
                    continue
                }

                tileString.push(getCodeFromCrop(tile.attachedCrop.crop))
                if (tile.fertiliser) {
                    tileString.push(`.${getCodeFromFertiliser(tile.fertiliser)}`)
                }
                plotString.push(tileString.join(''))
            }

            const compressedPlotString = compressPlotString(plotString)
            // Append to beginning of plotString
            cropCodeStrings.push(`${coordsString}${compressedPlotString}`)
        }

        return [dimensionString, cropCodeStrings.join('-')].join('_')
    }

    static loadGardenByCode(layoutCode: string): GardenGrid {
        // TODO: Swap to actual save parser
        const { version, dimensionInfo, cropInfo, settingsInfo } = parseSaveTEST(layoutCode)

        // TODO: Swap to LATEST_VERSION constant
        if (version !== '0.5') {
            throw new Error('NOT LATEST VERSION')
        }

        const dimensionExtractMatch = dimensionInfo.replace('D-', '').match(PLOT_DIMENSION_REGEX)
        if (!dimensionExtractMatch) throw new Error('Savecode does not match expected format')

        const [_, totalWidthInTiles, totalHeightInTiles] = dimensionExtractMatch
        if (!totalWidthInTiles || !totalHeightInTiles) throw new Error('Dimension Info does not match expected format')

        const plots = cropInfo.split('-')
        if (plots[0]?.includes('CR')) plots.shift()

        const plotCoordinatesList = new Set<Coordinates>()
        const cropStringsByPlot: Map<Coordinates, string> = new Map()

        plots.forEach((plotCode) => {
            const plotExtractMatch = plotCode.match(PLOT_DIMENSION_REGEX)

            if (!plotExtractMatch) {
                console.error(plotCode)
                throw new Error('Plot code does not match expected format')
            }

            const [_, plotStartX, plotStartY, cropInfo] = plotExtractMatch
            if (!plotStartX || !plotStartY) throw new Error('Plot dimension info somehow missing')
            if (!cropInfo) throw new Error('crop info is missing')

            const newPlotCoordinates = `${plotStartX},${plotStartY}`;
            plotCoordinatesList.add(newPlotCoordinates)
            cropStringsByPlot.set(newPlotCoordinates, cropInfo)
        })

        const widthInTiles = parseInt(totalWidthInTiles)
        const heightInTiles = parseInt(totalHeightInTiles)

        if (!widthInTiles || !heightInTiles) throw new Error(`Grid dimensions are invalid ${widthInTiles} * ${heightInTiles}`)

        const newGarden = new GardenGrid({
            widthInTiles,
            heightInTiles,
            startCoords: {
                x: 0,
                y: 0
            },
            plotCoordinates: plotCoordinatesList,
            settingsCode: settingsInfo
        })

        cropStringsByPlot.forEach((cropString, plotCoordinates) => {
            const expandedCropString = expandPlotCode(cropString)
            const tileCoords = toCoordinateObject(plotCoordinates)

            for (let y = 0; y < 3; y++) {
                for (let x = 0; x < 3; x++) {
                    const tileInfoSplit = expandedCropString.shift()?.match(CROP_FERTILISER_REGEX)
                    if (!tileInfoSplit || !tileInfoSplit[1]) throw new Error(`CropCode not found ${tileInfoSplit} ${tileInfoSplit?.[1]}`)
                    const newTileCoordinates = `${x + tileCoords.x},${y + tileCoords.y}`
                    const cropCode: CropCode = tileInfoSplit[1] as CropCode
                    if (!Object.values(CropCode).includes(cropCode)) throw new Error('String is not a CropCode')

                    const crop = getCropFromCode(cropCode)
                    newGarden.placeCrop(newTileCoordinates, crop, {
                        avoidRemovingOnEmptyTiles: true
                    })

                    const fertCode = tileInfoSplit[2] as FertiliserCode
                    if (fertCode && Object.values(FertiliserCode).includes(fertCode) && fertCode !== FertiliserCode.None) {
                        newGarden.placeFertiliser(newTileCoordinates, getFertiliserFromCode(fertCode))
                    }
                }
            }
        })

        return newGarden
    }

    /**
     * One time update to the settings code, used when loading a saved garden
     */
    get loadSettingsCode(): string {
        if (this._hasSettingsToLoad) {
            this._hasSettingsToLoad = false
            return this._settingsCode ?? ''
        }
        return ''
    }
}

