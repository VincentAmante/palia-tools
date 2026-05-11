 
import type CropSize from "../enums/crop-size"
import type Crop from "./crop"

type Coordinate = {
    x: number,
    y: number
}

// A placed crop
interface PlacedCrop {
    location: {
        start: Coordinate,
        end: Coordinate // if 1x1, same as start
    }
    tiles: Set<Coordinate>
    id: string
    crop: Crop
}

interface GridPlot {
    tiles: Set<Coordinate>
}

interface GridTile {
    attachedCrop: PlacedCrop | null
}