import CropSize from "../enums/crop-size"
import type { CoordinateObject, Coordinates  } from "../utils/garden-helpers"
import type { Bonus } from "../imports";
import type { Crop} from '@/assets/scripts/garden-planner/imports';
import uniqid from 'uniqid'
import { fromCoordinateObject, toCoordinateObject, translateCoordinates, getDimensions  } from "../utils/garden-helpers";
import type { IGridCrop, IGridTile } from "../utils/gardenGridTypes";

export class GridCrop implements IGridCrop {
    private _id = uniqid()
    private _location: {
        start: Coordinates; end: Coordinates; // if 1x1, same as start
    }

    private _tiles: Map<Coordinates, IGridTile> = new Map();
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

    get tiles(): Map<string, IGridTile> {
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

    set tiles(tiles: Map<string, IGridTile>) {
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

        for (const [_, tile] of this._tiles) {
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

    translateCropCoordinates(translateBy: CoordinateObject) {
        // Move only the start & end location data
        this._location.start = translateCoordinates(this._location.start, translateBy)
        this._location.end = translateCoordinates(this._location.end, translateBy)

        const newTilesMap = new Map<Coordinates, IGridTile>()
        // Change only the index of the crops
        for (const [oldCoords, tile] of this._tiles) {
            const newCoords = translateCoordinates(oldCoords, translateBy)

            newTilesMap.set(newCoords, tile)
        }

        this._tiles = newTilesMap
    }

    verifyCropTiles() {
        let foundStartTile = false

        for (const [coords, tile] of this._tiles) {
            if (coords === this._location.start) {
                foundStartTile = true
                break
            }
        }

        if (!foundStartTile) console.warn(`could not find start tile for crop ${this._id}`)
    }
}
