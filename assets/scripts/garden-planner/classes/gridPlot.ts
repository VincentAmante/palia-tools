import type { CoordinateObject, Coordinates  } from "../utils/garden-helpers"
import uniqid from 'uniqid'
import { translateCoordinates } from "../utils/garden-helpers";
import type { IGridPlot, IGridTile, IGridCrop } from "../utils/gardenGridTypes";

export class GridPlot implements IGridPlot {
    private _startCoordinates: Coordinates;
    private _tiles: Map<Coordinates, IGridTile> = new Map()
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

    set tiles(tiles: Map<Coordinates, IGridTile>) {
        this._tiles = tiles
    }

    /**
     * 
     * @returns Any crop where it's starting tile is within the bounds of this plot
     */
    getStartingCrops() {
        const crops: Map<string, IGridCrop> = new Map()

        for (const tile of this._tiles.values()) {
            if (!tile.attachedCrop) continue
            if (crops.has(tile.attachedCrop.id)) continue

            for (const [coordinates, cropTile] of tile.attachedCrop.tiles) {
                // ? Could prob add a logic check to see if the crop's starting tile is within the plot's bounds
                if (cropTile.attachedCrop && cropTile.attachedCrop.location.start === this._startCoordinates)
                    crops.set(cropTile.attachedCrop.id, cropTile.attachedCrop)
            }
        }

        return crops
    }

    translatePlotCoordinates(translateBy: CoordinateObject) {
        this._startCoordinates = translateCoordinates(this._startCoordinates, translateBy)

        const newTilesMap = new Map<Coordinates, IGridTile>()
        for (const [oldCoords, tile] of this._tiles) {
            const newCoords = translateCoordinates(oldCoords, translateBy)

            newTilesMap.set(newCoords, tile)
        }

        this._tiles = newTilesMap
    }
}
