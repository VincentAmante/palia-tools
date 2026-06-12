import type { ITile } from '@/assets/scripts/garden-planner/classes/tile'
import type { CoordinateObject, Coordinates } from "../utils/garden-helpers"
import type { Bonus  } from "../imports";
import type { Crop } from '@/assets/scripts/garden-planner/imports'

export interface IGridTile extends ITile {
    attachedCrop: IGridCrop | null
    coordinates: Coordinates
    plotId: string
    hoverState: 'NONE' | 'DEFAULT' | 'DELETE' | 'INVALID'
    resetBonusesReceived: () => void
    addBonusReceived: (sourceId: string, bonus: Bonus) => void
    updateBonuses: () => void
}

// Unique crop data for this version
export interface IGridCrop {
    location: {
        start: Coordinates,
        end: Coordinates // if 1x1, same as start
    }
    tiles: Map<Coordinates, IGridTile>
    id: string
    crop: Crop
    bonuses: Set<Bonus> // unique set of bonuses
    updateCropBonuses: () => void
    getCropRelativeCoords: (coordinates: Coordinates) => Coordinates
    translateCropCoordinates: (translateBy: CoordinateObject) => void
    verifyCropTiles: () => void

}


export interface IGridPlot {
    startCoordinates: Coordinates // which tile this plot starts in
    tiles: Map<Coordinates, IGridTile> // Which tiles are assigned to this grid
    getStartingCrops: () => Map<string, IGridCrop> // get crops but only if its starting tile is within the plot
}

