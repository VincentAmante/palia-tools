import CropSize from "../enums/crop-size"
import type { ITile } from "./tile"
import type { TUniqueTiles as UniqueCropTiles, CoordinateObject, Coordinates } from "../utils/garden-helpers"
import { Crop, CropCode, CropType, Fertiliser, getCodeFromCrop, getCodeFromFertiliser, getCropFromCode, getFertiliserFromCode } from '@/assets/scripts/garden-planner/imports'
import { parseSaveTEST } from "../save-handler";
import { PLOT_DIMENSION_REGEX, CROP_FERTILISER_REGEX, expandPlotCode } from "../saveHandlerGardenBasic";
import FertiliserCode from "../enums/fertilisercode";
import { fromCoordinateObject, toCoordinateObject, translateCoordinates, getDimensions } from "../utils/garden-helpers";
import { GridPlot } from "./gridPlot";
import { GridTile } from "./gridTile";
import { GridCrop } from "./gridCrop";
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

export function coordsByDirection(coordinatesKey: Coordinates, direction: 'North' | 'East' | 'South' | 'West') {
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

    /**
     * UI aid
     */
    private _hoveredTiles: Set<Coordinates> = new Set()

    /**
     * UI aid - Informs which tiles' contents will be removed if a crop is placed on a hovered tile
     */
    private _hoveredTilesMarkedForDeletion: Set<Coordinates> = new Set()

    /**
     * UI aid - Tiles preview for plot placing, used only to aid UI
     */
    private _hoveredTilesForPlotPlacing: Map<Coordinates, Coordinates> = new Map()

    /**
     * UI aid - Flag to inform user if a plot can reasonably be placed there while hovering
     */
    private _plotCanBePlacedInCheckedTile = false

    private _settingsCode = ''
    
    /**
     * Flag for a one-time load of settings attached to a garden
     * TODO: Remember why we have this lol
     */
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
     * Re-calculate a tile's bonuses
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
                        this._tiles.set(attachedTile.coordinates, attachedTile as GridTile)
                    })
                }
            })

        } else if (selectedItem instanceof Fertiliser) {
            let tilesForPlacingCoordinates: Set<Coordinates> = new Set()

            if (baseTile.attachedCrop) {
                tilesForPlacingCoordinates = tilesForPlacingCoordinates.union(new Set(baseTile.attachedCrop.tiles.keys()))
            } else {
                tilesForPlacingCoordinates.add(baseTile.coordinates)
            }

            tilesForPlacingCoordinates.forEach((tileToUpdateCoords) => {
                const tileToUpdate = this.getTile(tileToUpdateCoords)
                if (!tileToUpdate) throw new Error('invalid tile somehow')

                tileToUpdate.isHovered = true
                this._hoveredTiles.add(tileToUpdate.coordinates)
                modifiedTiles.add(tileToUpdate.coordinates)
                this._tiles.set(tileToUpdate.coordinates, tileToUpdate)
            })
        } else if (!selectedItem) {
            let tilesForDeletion: Set<Coordinates> = new Set()

            if (baseTile.attachedCrop) {
                tilesForDeletion = tilesForDeletion.union(baseTile.attachedCrop.tiles)
            } else {
                tilesForDeletion.add(baseTile.coordinates)
            }

            tilesForDeletion.forEach((tileToUpdateCoords) => {
                const tileToUpdate = this.getTile(tileToUpdateCoords)
                if (!tileToUpdate) throw new Error('invalid tile somehow')

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

    get hoveredTilesForPlotPlacing(){
        return this._hoveredTilesForPlotPlacing
    }

    get plotCanBePlacedInCheckedTile(){
        return this._plotCanBePlacedInCheckedTile
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

    /**
     * @param coordinates to check
     * @returns coordinates of the tile's orthogonal neighbours
     */
    getAdjacentTilesCoords(coordinates: Coordinates, ignoreBaseTile = false): Coordinates[] {
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
     * 
     * @param coordinates 
     * @param ignoreBaseTileCrop - 
     * @returns 
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

            // TODO: Remember why we included the <!ignoreBaseTileCrop> check
            // TODO: Also wonder why the check is here and not outside the loop
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
        const tile = this.getTile(coordinates)
        let modifiedTiles = new Set<Coordinates>()

        if (!tile) return modifiedTiles

        const associatedPlot = this._plots.values().find((plot) => plot.id === tile.plotId)

        if (!associatedPlot) throw new Error(`Plot is somehow not found, [Tile Coords: ${coordinates}, Tile Id: ${tile.plotId}]`)

        modifiedTiles = modifiedTiles.union(new Set(Array.from(associatedPlot.tiles.keys())))

        associatedPlot.tiles.forEach((tile) => {
            modifiedTiles = modifiedTiles.union(this.removeCrop(tile.coordinates))
            modifiedTiles = modifiedTiles.union(this.removeFertiliser(tile.coordinates))
            this._tiles.delete(tile.coordinates)
        })

        this._plots.delete(associatedPlot.startCoordinates)

        return modifiedTiles
    }

    /**
     * Checks whether a tile can be a valid starting point for a plot
     * 
     * @param coordinates - tile that'll become the plot's potential starting point
     * @returns tiles effected by the hovering, for UI updating
     */
    hoverTileForPlotPlacing(coordinates: Coordinates) {
        const modifiedTiles: Set<Coordinates> = new Set()

        const baseTile = this.getTile(coordinates)
        if (baseTile) return modifiedTiles

        let hasInvalidTiles = false

        // coordinates 1: Actual coords, coordinates 2: Local 'Plot' Coordinates
        const fetchedTilesCoordinatesForPlotPlacement = new Map<Coordinates, Coordinates>()

        for (let x = 0; x < 3; x++) {
            for (let y = 0; y < 3; y++) {
                const coordinatesParsed = toCoordinateObject(coordinates)

                const newTileCoordinatesObj = {
                    x: coordinatesParsed.x + x,
                    y: coordinatesParsed.y + y
                }
                const newTileCoordinates = fromCoordinateObject(newTileCoordinatesObj)

                if ((newTileCoordinatesObj.x + 1) > this.width || (newTileCoordinatesObj.y + 1) > this.height)
                    hasInvalidTiles = true

                const checkedTile = this._tiles.get(newTileCoordinates)

                if (!checkedTile) {
                    fetchedTilesCoordinatesForPlotPlacement.set(newTileCoordinates, `${x},${y}`)
                    modifiedTiles.add(newTileCoordinates)
                }
                else hasInvalidTiles = true
            }
        }

        this._hoveredTilesForPlotPlacing = fetchedTilesCoordinatesForPlotPlacement
        this._plotCanBePlacedInCheckedTile = !hasInvalidTiles

        return modifiedTiles
    }

    unhoverTilesForPlotPlacing(){
        const unhoveredTiles = new Set(this._hoveredTilesForPlotPlacing.keys())
        this._hoveredTilesForPlotPlacing = new Map()
        this._plotCanBePlacedInCheckedTile = false

        return unhoveredTiles
    }

    /**
     * Checks garden for any rows or columns on the edges that are empty.
     * Trims those empty rows/columns and re-assigns every coordinate.
     * Does not affect empty rows/columns between plots
     * @returns modified tiles coordinates
     */
    trimGarden() {
        const rowHasTileMap: Map<number, boolean> = new Map()
        const colHasTileMap: Map<number, boolean> = new Map()
        const rows = [...Array(this._heightInTiles).keys()]
        const cols = [...Array(this._widthInTiles).keys()]

        let changedTiles = new Set<Coordinates>()

        const checkTiles = () => {
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
        }

        checkTiles()

        let gardenHasChanged = false


        let translateBackwardsByX = 0
        let translateBackwardsByY = 0

        for (const [index, hasTile] of rowHasTileMap) {
            if (!hasTile)
                translateBackwardsByY = index + 1
            else break
        }
        for (const [index, hasTile] of colHasTileMap) {
            if (!hasTile)
                translateBackwardsByX = index + 1
            else break
        }


        if (translateBackwardsByX || translateBackwardsByY) {
            changedTiles = changedTiles.union(this.translateGardenTiles({ x: -translateBackwardsByX, y: -translateBackwardsByY }))
            gardenHasChanged = true
        }

        // If the garden has already changed, run a new check
        if (gardenHasChanged) {
            rowHasTileMap.clear()
            colHasTileMap.clear()

            checkTiles()
        }
        // Trim down excess rows/columns, needs no tile displacement
        let rowsToCutDown = 0
        let columnsToCutDown = 0
        for (const [index, hasTile] of Array.from(rowHasTileMap).toReversed()) {
            console.log(index, hasTile)
            if (!hasTile) {
                rowsToCutDown++
                gardenHasChanged = true
            }
            else break
        }

        for (const [index, hasTile] of Array.from(colHasTileMap).toReversed()) {
            if (!hasTile) {
                columnsToCutDown++
                gardenHasChanged = true
            }
            else break
        }

        if (rowsToCutDown || columnsToCutDown) {
            if (rowsToCutDown)
                this._heightInTiles -= rowsToCutDown

            if (columnsToCutDown)
                this._widthInTiles -= columnsToCutDown

            gardenHasChanged = true
        }

        if (gardenHasChanged) changedTiles = changedTiles.union(this.trimGarden())

        return changedTiles
    }

    /**
     * Re-assigns every coordinate within the garden
     * @param translateBy how much to move by (x,y), positve values means to the right (x) and down (y)
     * @returns modified tiles
     */
    translateGardenTiles(translateBy: CoordinateObject) {
        const newTiles: Map<Coordinates, GridTile> = new Map()
        const modifiedTiles = new Set<Coordinates>
        const newPlots: Map<Coordinates, GridPlot> = new Map()

        for (const [oldCoords, tile] of this._tiles) {
            tile.translateTileCoordinates(translateBy)
            const newCoords = translateCoordinates(oldCoords, translateBy)
            newTiles.set(newCoords, tile)
            modifiedTiles.add(newCoords)
            // Also update old tile just in case
            modifiedTiles.add(oldCoords)
        }

        this._tiles = newTiles

        for (const [oldCoords, plot] of this._plots) {
            plot.translatePlotCoordinates(translateBy)
            const newCoords = translateCoordinates(oldCoords, translateBy)
            newPlots.set(newCoords, plot)
        }

        // run a second check to make sure every tile's crop is properly updated
        for (const [newCoords, tile] of this._tiles) {
            if (!tile.attachedCrop) continue

            tile.attachedCrop.verifyCropTiles()
        }

        return modifiedTiles
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
        const newTilesMap: Map<Coordinates, GridTile> = new Map()
        modifiedTiles = modifiedTiles.union(tilesForPlacing.coordinates)
        for (const tile of tilesForPlacing.tiles.values()) {
            if (tile.attachedCrop) {
                console.log('attached crop found, removing')
                // remove any crop on it first
                modifiedTiles = modifiedTiles.union(this.removeCrop(tile.coordinates))
            }
            tile.attachedCrop = attachedCrop
            newTilesMap.set(tile.coordinates, tile)
        }

        attachedCrop.tiles = newTilesMap

        // Update every tile ONLY after the affected tiles have had the crop placed
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
            this._tiles.set(attachedTile.coordinates, attachedTile as GridTile)

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
                this._tiles.set(tileToUpdate.coordinates, tileToUpdate as GridTile)
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
                this._tiles.set(tileToUpdate.coordinates, tileToUpdate as GridTile)
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
        const cropCodeStrings: string[] = ['CR']

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

    saveGarden(settingsCode?: string) {
        const saveString = []

        // TODO: Replace with `LATEST_VERSION`
        const versionCode = `v0.5`
        const layoutCode = this.fetchGardenCode()
        saveString.push(versionCode)
        saveString.push(layoutCode)
        if (settingsCode) saveString.push(settingsCode)

        return saveString.join('_')
    }

    clearTiles() {
        let modifiedTiles: Set<Coordinates> = new Set()

        for (const [coords, tile] of this._tiles) {
            if (tile.fertiliser) modifiedTiles = modifiedTiles.union(this.removeFertiliser(coords))
            if (tile.attachedCrop) modifiedTiles = modifiedTiles.union(this.removeCrop(coords))
        }

        this._hoveredTiles = new Set()
        return modifiedTiles
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