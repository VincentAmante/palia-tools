import Direction from '../enums/direction'
import Bonus from '../enums/bonus'
import CropType from '../enums/cropType'
import CropCode from '../enums/cropCode'
import CropSize from '../enums/cropSize'
import type { PlotStat } from '../types/plotStat'
import crops, { getCodeFromCrop, getCropFromCode } from '../cropList'
import { parseSave } from '../saveHandler'
import FertiliserType from '../enums/Fertiliser'
import FertiliserCode from '../enums/FertiliserCode'
import { getCodeFromFertiliser, getFertiliserFromCode } from '../fertiliserList'
import type { CalculateValueOptions, ICalculateValueResult, ICalculateYieldOptions, ICropValue, IDayResult, IHarvestInfo, ISimulateYieldResult } from '../utils/gardenHelpers'
import { getCropMap, getCropValueMap } from '../utils/gardenHelpers'
import HarvestSimulator, { type IHarvestSimulator } from './HarvestSimulator'

import Plot from './Plot'
import Tile from './Tile'
import type Crop from './Crop'

class Garden {
  private _layout: Plot[][] = []
  private _version: string = '0.2'
  private harvestSimulator: IHarvestSimulator = new HarvestSimulator()

  constructor() {
    const defaultRows = 3
    const defaultColumns = 3

    for (let i = 0; i < defaultRows; i++) {
      this._layout[i] = []
      for (let j = 0; j < defaultColumns; j++)
        this._layout[i][j] = new Plot(true)
    }

    this.loadLayout(
      `v${this._version}_DIM-111-111-111_CROPS-NNNNNNNNN-NNNNNNNNN-NNNNNNNNN-NNNNNNNNN-NNNNNNNNN-NNNNNNNNN-NNNNNNNNN-NNNNNNNNN-NNNNNNNNN`,
    )
  }

  get plots(): Plot[][] {
    return this._layout
  }

  set plots(layout: Plot[][]) {
    this._layout = layout
  }

  clearAllPlots(): void {
    for (const plot of this._layout.flat()) {
      plot.tiles = [
        [new Tile(null), new Tile(null), new Tile(null)],
        [new Tile(null), new Tile(null), new Tile(null)],
        [new Tile(null), new Tile(null), new Tile(null)],
      ]
    }
  }

  get activePlotCount(): number {
    return this._layout.flat().filter(plot => plot.isActive).length
  }

  loadLayout(layout: string) {
    const { dimensionInfo, cropInfo: cropsInfo } = parseSave(layout)

    this._layout = []
    const dimensions = dimensionInfo.split('-').splice(1)
    const rows = dimensions.length
    const columns = dimensions[0].length

    for (let i = 0; i < rows; i++) {
      this._layout[i] = []
      for (let j = 0; j < columns; j++)
        this._layout[i][j] = new Plot()
    }

    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < columns; j++) {
        this._layout[i][j].isActive = dimensions[i][j] === '1'
        // set adjacent plots
        if (i > 0)
          this._layout[i][j].setPlotAdjacent(Direction.North, this._layout[i - 1][j])

        if (i < rows - 1)
          this._layout[i][j].setPlotAdjacent(Direction.South, this._layout[i + 1][j])

        if (j > 0)
          this._layout[i][j].setPlotAdjacent(Direction.West, this._layout[i][j - 1])

        if (j < columns - 1)
          this._layout[i][j].setPlotAdjacent(Direction.East, this._layout[i][j + 1])
      }
    }

    const crops = cropsInfo.split('-').splice(1)

    let cropIndex = 0
    for (const plot of this._layout.flat()) {
      if (plot.isActive) {
        const regex = /[A-Z](?:\.[A-Z]|[^A-Z])*/g
        const cropCodes = crops[cropIndex].match(regex)
        if (cropCodes == null)
          throw new Error('Invalid crop code')

        for (let i = 0; i < plot.tiles.length; i++) {
          for (let j = 0; j < plot.tiles[i].length; j++) {
            let [cropCode, fertiliserCode] = cropCodes.shift()?.split('.') as [CropCode, FertiliserCode]
            fertiliserCode = fertiliserCode ?? null

            const crop = getCropFromCode(cropCode)
            const fertiliser = getFertiliserFromCode(fertiliserCode)
            if ((crop == null || crop.type === CropType.None) && (fertiliser == null || fertiliser.type === FertiliserType.None))
              continue

            // This is to prevent overwriting existing crops, such as placed apple trees or blueberry bushes
            if (plot.getTile(i, j).crop == null && plot.getTile(i, j).crop?.type !== CropType.None) {
              plot.setTile(i, j, crop)
              plot.addFertiliserToTile(i, j, fertiliser, {})
            }
          }
        }
        cropIndex++
      }
    }
  }

  /**
   * @returns a string containing the layout info of the garden
   */
  saveLayout(): string {
    let layoutCode = `v${this._version}_DIM-`
    const rows = this._layout.length
    const columns = this._layout[0].length

    for (let i = 0; i < rows; i++) {
      let row = ''
      for (let j = 0; j < columns; j++)
        row += this._layout[i][j].isActive ? '1' : '0'

      layoutCode += `${row}-`
    }

    layoutCode = `${layoutCode.substring(0, layoutCode.length - 1)}_CROPS-`

    for (const plot of this._layout.flat()) {
      if (plot.isActive) {
        for (const tile of plot.tiles.flat()) {
          if (tile.crop)
            layoutCode += (getCodeFromCrop(tile.crop) ?? CropCode.None) as CropCode
          else
            layoutCode += CropCode.None

          if (tile.fertiliser)
            layoutCode += `.${(getCodeFromFertiliser(tile.fertiliser) ?? FertiliserCode.None) as FertiliserCode}`
        }

        if (plot !== this._layout.flat().slice(-1)[0])
          layoutCode += '-'
      }
    }

    if (layoutCode.endsWith('-'))
      layoutCode = layoutCode.substring(0, layoutCode.length - 1)

    return layoutCode
  }

  // Assign bonuses to a crop based on type and bonuses received
  calculateBonuses(): void {
    const treeTiles: {
      [key: string]: Tile[]
    } = {}
    const bushTiles: {
      [key: string]: Tile[]
    } = {}

    const layoutFlat = this._layout.flat()

    // Calculate bonuses received
    for (const plot of layoutFlat) {
      if (!plot.isActive)
        continue

      plot.calculateBonusesReceived()
    }

    // Calculate bonuses
    for (const plot of layoutFlat) {
      if (!plot.isActive)
        continue

      for (const tile of plot.tiles.flat()) {
        tile.bonuses = []
        if (!tile.crop || tile.crop.type === CropType.None)
          continue

        if (tile.crop?.size === CropSize.Tree) {
          (treeTiles[tile.id] = treeTiles[tile.id] || []).push(tile)
          if (treeTiles[tile.id].length === 9) {
            const bonusesReceived = treeTiles[tile.id].flatMap(tile => tile.bonusesReceived)
            const bonusCounts = bonusesReceived.reduce((acc, bonus) => {
              if (bonus in acc)
                acc[bonus]++
              else
                acc[bonus] = 1

              return acc
            }, {} as Record<string, number>)

            for (const bonus in bonusCounts) {
              if (bonusCounts[bonus] >= 3) {
                for (const appleTile of treeTiles[tile.id])
                  appleTile.bonuses.push(bonus as Bonus)
              }
            }
          }
        }
        else if (tile.crop?.size === CropSize.Bush) {
          if (tile.id in bushTiles)
            bushTiles[tile.id].push(tile)
          else
            bushTiles[tile.id] = [tile]

          if (bushTiles[tile.id].length === 4) {
            const bonusesReceived = bushTiles[tile.id].flatMap(tile => tile.bonusesReceived)
            const bonusCounts = bonusesReceived.reduce((acc, bonus) => {
              if (bonus in acc)
                acc[bonus]++
              else
                acc[bonus] = 1

              return acc
            }, {} as Record<string, number>)

            for (const bonus in bonusCounts) {
              if (bonusCounts[bonus] >= 2) {
                for (const blueberryTile of bushTiles[tile.id])
                  blueberryTile.bonuses.push(bonus as Bonus)
              }
            }
          }
        }
        else {
          tile.bonuses = tile.bonusesReceived
        }
      }
    }
  }

  /**
   * Simulates the garden for a given number of days and returns the yield
   * @param options - Options for calculating yield
   * @returns
   */
  simulateYield(options: ICalculateYieldOptions) {
    this.harvestSimulator.options = {
      days: options.days || 0,
      includeReplant: options.includeReplant || false,
      useStarSeeds: options.useStarSeeds || false,
      level: (options.level),
      useGrowthBoost: options.useGrowthBoost || false,
      includeReplantCost: options.includeReplantCost || false,
    }
    const layoutFlat = this._layout.flat()
    const individualCrops = new Map<string, Tile>()

    layoutFlat.forEach((plot) => {
      if (!plot.isActive)
        return
      plot.tiles.flat().forEach((tile) => {
        if (tile.crop && tile.crop.type !== CropType.None)
          individualCrops.set(tile.id, tile)
      })
    })

    const { harvestLog, harvestInventory, lastDay } = this.harvestSimulator.simulate([...individualCrops.values()])

    // TODO: Change return type of either this function or HarvestSimulator.simulate
    return {
      harvests: harvestLog,
      harvestTotal: {
        day: lastDay,
        crops: harvestInventory.crops,
        seedsRemainder: harvestInventory.seedsLeft,
      },
    } as {
      harvests: IHarvestInfo[]
      harvestTotal: IHarvestInfo
    }
  }

  /**
   *  Calculates the gold value of the crops harvested
   *
   * @param options - What to sell each crop as
   * @param harvestInfo - The yield of the garden
   * @returns gold value data for each day and the total gold value
   */
  calculateValue(
    options: CalculateValueOptions,
    harvestInfo: ISimulateYieldResult,
  ) {
    const result: {
      day: number
      crops: {
        [key in CropType]: {
          base: ICropValue
          star: ICropValue
        }
      }
      totalGold: number
    }[] = []

    const remainders: {
      [key in CropType]: {
        base: number
        star: number
      }
    } = getCropMap()

    for (const harvest of harvestInfo.harvests) {
      const day = harvest.day
      const cropTypes = harvest.crops
      const dayResult: IDayResult = {
        day,
        crops: getCropValueMap(options),
        totalGold: 0,
      }

      for (const cropType in cropTypes) {
        const baseOption = options[cropType as CropType].baseType
        const baseProduce = cropTypes[cropType as CropType].base
        const starOption = options[cropType as CropType].starType
        const starProduce = cropTypes[cropType as CropType].star

        if (cropType === CropType.None)
          continue

        const crop = crops[cropType as CropType]
        if (crop === null)
          continue

        const baseRemainder = remainders[cropType as CropType].base
        const starRemainder = remainders[cropType as CropType].star

        if (baseProduce === 0 && starProduce === 0) {
          // There is nothing to calculate
          continue
        }

        const { goldValue: baseGoldValue, newRemainder: newBaseRemainder, convertedUnits: convertedBaseUnits } = calculateCropResult(
          crop,
          baseProduce,
          baseRemainder,
          baseOption,
          false,
        )
        dayResult.crops[cropType as CropType].base.gold += baseGoldValue
        dayResult.crops[cropType as CropType].base.produce += convertedBaseUnits
        dayResult.crops[cropType as CropType].base.cropRemainder = newBaseRemainder
        remainders[cropType as CropType].base = newBaseRemainder

        const { goldValue: starGoldValue, newRemainder: newStarRemainder, convertedUnits: convertedStarUnits } = calculateCropResult(
          crop,
          starProduce,
          starRemainder,
          starOption,
          true,
        )

        dayResult.crops[cropType as CropType].star.gold += starGoldValue
        dayResult.crops[cropType as CropType].star.produce += convertedStarUnits
        dayResult.crops[cropType as CropType].star.cropRemainder = newStarRemainder
        remainders[cropType as CropType].star = newStarRemainder
        dayResult.totalGold += baseGoldValue + starGoldValue
      }

      result.push(dayResult)
    }

    const totalResult: IDayResult = {
      day: harvestInfo.harvestTotal.day,
      crops: getCropValueMap(options),
      totalGold: 0,
    }

    const harvestTotal = harvestInfo.harvestTotal

    for (const cropType in harvestTotal.crops) {
      const baseOption = options[cropType as CropType].baseType
      const starOption = options[cropType as CropType].starType

      const baseProduce = harvestTotal.crops[cropType as CropType].base
      const starProduce = harvestTotal.crops[cropType as CropType].star

      const crop = crops[cropType as CropType]

      if (crop == null)
        continue

      if (baseProduce === 0 && starProduce === 0)
        continue

      const baseRemainder = totalResult.crops[cropType as CropType].base.cropRemainder
      const starRemainder = totalResult.crops[cropType as CropType].star.cropRemainder

      const { goldValue: baseGoldValue, newRemainder: newBaseRemainder, convertedUnits: convertedBaseUnits } = calculateCropResult(
        crop,
        baseProduce,
        baseRemainder,
        baseOption,
        false,
      )

      totalResult.crops[cropType as CropType].base.gold += baseGoldValue
      totalResult.crops[cropType as CropType].base.produce += convertedBaseUnits
      totalResult.crops[cropType as CropType].base.cropRemainder = newBaseRemainder

      const { goldValue: starGoldValue, newRemainder: newStarRemainder, convertedUnits: convertedStarUnits } = calculateCropResult(
        crop,
        starProduce,
        starRemainder,
        starOption,
        true,
      )

      totalResult.crops[cropType as CropType].star.gold += starGoldValue
      totalResult.crops[cropType as CropType].star.produce += convertedStarUnits

      totalResult.crops[cropType as CropType].star.cropRemainder = newStarRemainder

      totalResult.totalGold += baseGoldValue + starGoldValue
    }
    return {
      result,
      totalResult,
    } as ICalculateValueResult
  }

  /**
   *
   * @returns data about the garden, particularly crop count, fertiliser count, and bonus coverage
   */
  calculateStats() {
    // Individual crops accounts for crops that are planted on multiple tiles
    // e.g: 9 apple tiles will only count as 1 apple tree
    const individualCrops = new Map<string, Tile>()

    const fertiliserCount: Record<string, number> = Object.fromEntries(
      Object.values(FertiliserType).map(fertiliserType => [fertiliserType, 0]),
    )

    for (const plot of this._layout.flat()) {
      if (!plot.isActive)
        continue

      for (const tile of plot.tiles.flat()) {
        // Calculated early because fertilisers can be placed on empty crops
        // and also is not affected by crop type (e.g: trees consume 4 fertilisers)
        if (tile.fertiliser && tile.fertiliser.type !== FertiliserType.None)
          fertiliserCount[tile.fertiliser.type]++

        if (tile.crop && tile.crop.type !== CropType.None)
          individualCrops.set(tile.id, tile)
      }
    }

    const bonusCoverage: Record<string, number> = Object.fromEntries(
      Object.values(Bonus).map(bonus => [bonus, 0]),
    )

    for (const crop of individualCrops.values()) {
      for (const bonus of crop.bonuses) {
        if (bonus !== Bonus.None)
          bonusCoverage[bonus]++
      }
    }

    const cropTypeCount: Record<string, number> = Object.fromEntries(
      Object.values(CropType).map(cropType => [cropType, 0]),
    )
    for (const crop of individualCrops.values()) {
      if (crop.crop && crop.crop.type !== CropType.None)
        cropTypeCount[crop.crop.type as CropType]++
    }

    return {
      cropCount: individualCrops.size,
      cropTypeCount,
      cropBonusCoverage: bonusCoverage,
      fertiliserCount,
    } as PlotStat
  }
}

/**
 *  Calculates gold value of crops based on the option selected
 *
 * @param crop - crop to calculate
 * @param produce - number of crops to sell
 * @param remainder - remainder from previous days
 * @param option - What to sell the crop as
 * @param isStar
 * @returns
 */
function calculateCropResult(
  crop: Crop | null,
  produce: number,
  remainder: number,
  option: 'crop' | 'seed' | 'preserve',
  isStar: boolean,
) {
  let convertedUnits = 0
  let goldValue = 0
  let newRemainder = 0

  const cropsCombined = produce + remainder
  if (produce === 0 && remainder === 0) {
    return {
      convertedUnits,
      goldValue,
      newRemainder,
    }
  }

  switch (option) {
    case 'crop':
      newRemainder = remainder
      convertedUnits = produce
      goldValue = crop?.calculateGoldValue(produce, option, isStar).goldValue ?? 0
      break
    case 'seed':
      convertedUnits = crop?.convertCropToSeed(cropsCombined)?.count ?? 0
      newRemainder = crop?.convertCropToSeed(cropsCombined)?.remainder ?? 0
      goldValue = crop?.calculateGoldValue(cropsCombined, option, isStar).goldValue ?? 0
      break
    case 'preserve':
      convertedUnits = crop?.convertCropToPreserve(cropsCombined)?.count ?? 0
      newRemainder = crop?.convertCropToPreserve(cropsCombined)?.remainder ?? 0
      goldValue = crop?.calculateGoldValue(cropsCombined, option, isStar).goldValue ?? 0
      break
  }

  return {
    convertedUnits,
    goldValue,
    newRemainder,
  }
}

export default Garden
export type { CalculateValueOptions }
