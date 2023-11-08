import Direction from '../enums/direction'
import Bonus from '../enums/bonus'
import CropType from '../enums/crops'
import CropCode from '../enums/cropcode'
import CropSize from '../enums/crop-size'
import type { PlotStat } from '../types/plotStat'
import crops, { getCodeFromCrop, getCropFromCode } from '../crop-list'
import { parseSave } from '../save-handler'
import FertiliserType from '../enums/fertiliser'
import FertiliserCode from '../enums/fertilisercode'
import { getCodeFromFertiliser, getFertiliserFromCode } from '../fertiliser-list'
import type { CalculateValueOptions, ICalculateValueResult, ICalculateYieldOptions, ICropValue, IDayResult, IHarvestInfo, ISimulateYieldResult } from '../utils/garden-helpers'
import { getCropMap, getCropValueMap } from '../utils/garden-helpers'

import Plot from './plot'
import Tile from './tile'
import type Crop from './crop'

class Garden {
  private _layout: Plot[][] = []
  private _version: string = '0.2'

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
    console.time('Simulate yield')
    const layoutFlat = this._layout.flat()
    // Gets a list of all tiles, and excludes tiles that contain duplicates (i.e. 9 apples tiles should only return 1 tile)
    const individualCrops = new Map<string, Tile>()

    const seedsRemainder: {
      [key in CropType]: {
        base: number
        star: number
      }
    } = getCropMap()

    layoutFlat.forEach((plot) => {
      if (!plot.isActive)
        return

      plot.tiles.flat().forEach((tile) => {
        if (tile.crop && tile.crop.type !== CropType.None)
          individualCrops.set(tile.id, tile)
      })
    })

    if (individualCrops.size <= 0) {
      return {
        harvests: [] as IHarvestInfo[],
        harvestTotal: {
          day: 0,
          crops: getCropMap(),
          seedsRemainder: getCropMap(),
        } as IHarvestInfo,
      }
    }

    const useGrowthBoost = options.useGrowthBoost
    // max growth time is the maximum growth time of all crops, and then reharvest cooldown multiplied by rehavest limit
    let maxGrowthTime = Math.max(
      ...Array.from(individualCrops.values()).map((tile) => {
        if (tile.crop?.produceInfo == null)
          return 0

        return tile.crop.getTotalGrowTime(
          (useGrowthBoost ?? false)
          && tile.bonuses.includes(Bonus.SpeedIncrease),
        )
      }),
    )

    if (options.days && options.days > 0)
      maxGrowthTime = options.days

    const harvests: IHarvestInfo[] = []
    const harvestTotal: IHarvestInfo & {
      totalGold: number
    } = {
      day: 0,
      crops: getCropMap(),
      seedsRemainder: getCropMap(),
      totalGold: 0,
    }

    // Reduce growth time by 1 to account for speed boost
    for (let day = 1; day <= maxGrowthTime; day++) {
      const harvest: IHarvestInfo = {
        day,
        crops: getCropMap(),
        seedsRemainder: getCropMap(),
      }

      const seedsRequired: {
        [key in CropType]: {
          base: number
          star: number
        }
      } = getCropMap()

      for (const [, tile] of individualCrops) {
        const crop = tile.crop
        if (
          crop?.produceInfo == null
          || crop?.type === CropType.None
          || crop?.produceInfo.growthTime === null
        ) continue

        const hasGrowthBoost = (useGrowthBoost ?? false) && tile.bonuses.includes(Bonus.SpeedIncrease)

        if (day > crop.getTotalGrowTime(hasGrowthBoost) && !options.includeReplant)
          continue

        const baseStarChance
          = (tile.hasStarSeed || options.allStarSeeds) && options.postLevel25
            ? 1
            : tile.hasStarSeed || options.allStarSeeds
              ? options.starChanceOverride ?? 0.66
              : options.baseChanceOverride ?? 0

        const { base, withBonus } = crop.produceInfo
        const { isHarvestable, doReplant } = crop.isHarvestableOnDay(day, hasGrowthBoost)

        if (isHarvestable) {
          let finalStarChance = baseStarChance
          if (tile.bonuses.includes(Bonus.QualityIncrease)) {
            // TODO: Verify this is correct
            finalStarChance += 0.66
            finalStarChance = Math.min(finalStarChance, 1)
          }
          const hasBonus = tile.bonuses.includes(Bonus.HarvestIncrease)
          const starCrops = Math.round(finalStarChance * (hasBonus ? withBonus : base))
          const nonStarCrops = hasBonus ? withBonus - starCrops : base - starCrops

          harvest.crops[crop.type as CropType].base += nonStarCrops
          harvest.crops[crop.type as CropType].star += starCrops

          if (doReplant) {
            if (tile.hasStarSeed || options.allStarSeeds)
              seedsRequired[crop.type as CropType].star++
            else
              seedsRequired[crop.type as CropType].base++
          }
        }
      }

      const hasCrop = Object.values(harvest.crops).some(crop => crop.base > 0 || crop.star > 0)
      // Push harvests that have at least 1 crop
      if (hasCrop)
        harvests.push(harvest)

      if (options.includeReplantCost && hasCrop) {
        for (const type of Object.keys(seedsRequired)) {
          const cropType = type as CropType
          const crop = crops[cropType]

          if (crop == null)
            continue

          const seeds = seedsRequired[cropType]
          const { cropsPerSeed, seedsPerConversion } = crop.conversionInfo

          if (seeds.star > 0) {
            const seedsToProduce = Math.max(0, (seeds.star - seedsRemainder[cropType].star))
            if (seedsToProduce > 0) {
              const cropsConsumed = Math.max(Math.ceil((cropsPerSeed / seedsPerConversion) * seedsToProduce), cropsPerSeed)
              harvest.crops[cropType].star -= cropsConsumed
              const seedsProduced = Math.floor((cropsConsumed / cropsPerSeed) * seedsPerConversion)
              seedsRemainder[cropType].star
                += Math.floor(seedsProduced - seedsToProduce)
            }

            const remainderSeedsToBeUsed = seeds.star - seedsToProduce
            seedsRemainder[cropType].star -= remainderSeedsToBeUsed
            harvest.seedsRemainder[cropType].star = seedsRemainder[cropType].star
          }

          if (seeds.base > 0) {
            const seedsToProduce = Math.max(0, (seeds.base - seedsRemainder[cropType].base))

            if (seedsToProduce > 0) {
              const cropsConsumed = Math.max(Math.ceil((cropsPerSeed / seedsPerConversion) * seedsToProduce), cropsPerSeed)
              harvest.crops[cropType].base -= cropsConsumed
              const seedsProduced = Math.floor((cropsConsumed / cropsPerSeed) * seedsPerConversion)
              seedsRemainder[cropType].base
                += Math.floor(seedsProduced - seedsToProduce)
            }

            const remainderSeedsToBeUsed = seeds.base - seedsToProduce
            seedsRemainder[cropType].base -= remainderSeedsToBeUsed
            harvest.seedsRemainder[cropType].base = seedsRemainder[cropType].base
          }
        }
      }

      harvestTotal.day = harvest.day
      for (const cropType in harvest.crops) {
        harvestTotal.crops[cropType as CropType].base += harvest.crops[cropType as CropType].base
        harvestTotal.crops[cropType as CropType].star += harvest.crops[cropType as CropType].star

        harvestTotal.seedsRemainder[cropType as CropType].base
          = seedsRemainder[cropType as CropType].base
        harvestTotal.seedsRemainder[cropType as CropType].star
          = seedsRemainder[cropType as CropType].star
      }
    }

    return {
      harvests,
      harvestTotal,
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
