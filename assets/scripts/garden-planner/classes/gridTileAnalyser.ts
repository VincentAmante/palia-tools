import type { TUniqueTiles, Coordinates } from "../utils/garden-helpers"
import { Bonus, FertiliserType } from "../imports";
import { CropType } from '@/assets/scripts/garden-planner/imports'
import type { IGridTile } from "../utils/gardenGridTypes";
export interface GridPlotStat {
    cropCount: Readonly<number>;
    cropCountByType: Readonly<Record<CropType, number>>
    bonusCountsByType: Readonly<Record<Bonus, number>>
    fertiliserCountByType: Readonly<Record<FertiliserType, number>>
    cropGroupBonusCounts: Map<CropType, Record<Bonus, number>>
}

function initialiseCounts<T extends string>(enumType: Record<string, T>): Record<T, number> {
    return Object.fromEntries(
        Object.values(enumType).map(value => [value, 0])
    ) as Record<T, number>
}


export class GridTilesAnalyser implements GridPlotStat {
    private _tilesCount: number = 0
    private _uniqueTiles: TUniqueTiles = new Map()
    private _cropCount = 0
    private _cropCountByType = initialiseCounts(CropType)
    private _fertiliserCountByType = initialiseCounts(FertiliserType)
    private _bonusCountsByType = initialiseCounts(Bonus)
    private _cropGroupBonusStats: Map<CropType, Record<Bonus, number>> = new Map()

    get cropCount() {
        return this._cropCount
    }
    get cropCountByType() {
        return this._cropCountByType
    }
    get bonusCountsByType() {
        return this._bonusCountsByType
    }
    get fertiliserCountByType() {
        return this._fertiliserCountByType
    }

    get uniqueTiles() {
        return this._uniqueTiles
    }

    get tilesCount() {
        return this._tilesCount
    }

    get cropGroupBonusCounts() {
        return this._cropGroupBonusStats
    }

    update(tiles: Map<Coordinates, IGridTile>) {
        this._tilesCount = tiles.size

        const bonusCountsByType = initialiseCounts(Bonus)
        const fertiliserCountByType = initialiseCounts(FertiliserType)
        const cropCountByType = initialiseCounts(CropType)
        const uniqueTiles: TUniqueTiles = new Map()
        const cropGroupBonusCounts = new Map<CropType, Record<Bonus, number>>()
        let cropCount = 0

        tiles.forEach((tile) => {
            if (tile.fertiliser)
                fertiliserCountByType[tile.fertiliser.type]++

            if (tile.attachedCrop) {
                // Only consider if this is where the crop begins
                if (tile.attachedCrop.location.start !== tile.coordinates) return


                cropCountByType[tile.attachedCrop.crop.type]++
                cropCount++

                const cropGroupBonusCount = cropGroupBonusCounts.get(tile.attachedCrop.crop.type) || initialiseCounts(Bonus)

                for (const bonus of tile.attachedCrop.bonuses) {
                    bonusCountsByType[bonus]++
                    cropGroupBonusCount[bonus]++
                }

                cropGroupBonusCounts.set(tile.attachedCrop.crop.type, cropGroupBonusCount)


                const bonusesFiltered = Array.from(tile.attachedCrop.bonuses)
                    // filter bonuses unrelated to output or growth speed
                    .filter(bonus => ((bonus !== Bonus.WaterRetain) && (bonus !== Bonus.WeedPrevention)))

                const bonusesString = bonusesFiltered.sort().join('-')
                const cropGroupKey = `${tile.attachedCrop.crop.type}-${bonusesString}`

                const cropGroup = uniqueTiles.get(cropGroupKey) || {
                    tile: tile,
                    count: 0
                }
                uniqueTiles.set(cropGroupKey, {
                    tile: cropGroup.tile,
                    count: cropGroup.count + 1
                })
            }
        })

        this._cropCount = cropCount
        this._bonusCountsByType = bonusCountsByType
        this._cropCountByType = cropCountByType
        this._fertiliserCountByType = fertiliserCountByType
        this._cropGroupBonusStats = cropGroupBonusCounts
        this._uniqueTiles = uniqueTiles
    }
}