import Direction from '../enums/direction'
import type Bonus from '../enums/bonus'
import CropType from '../enums/crops'
import CropCode from '../enums/cropCode'
import CropSize from '../enums/crop-size'
import type { PlotStat } from '../types/plotStat'
import crops, { getCodeFromCrop, getCropFromCode } from '../cropList'
import { parseSave, encodeSettings, decodeSettings } from '../save-handler'
import FertiliserType from '../enums/fertiliser'
import FertiliserCode from '../enums/fertilisercode'
import { getCodeFromFertiliser, getFertiliserFromCode } from '../fertiliserList'
import type { CalculateValueOptions, ICalculateValueResult, ICropValue, IDayResult, ISimulateYieldResult, TUniqueTiles } from '../utils/garden-helpers'
import { getCropMap, getCropValueMap } from '../utils/garden-helpers'
import CropTiles from './cropTiles'
import type { IHarvesterOptions } from './harvester'
import type { ProcessorSettings } from './processor'
import { LATEST_VERSION } from '../types/version'

import Plot from './plot'
import Tile from './tile'
import type Crop from './crop'



class Garden {
  private _layout: Plot[][] = []
  private _version: string = LATEST_VERSION
  private _cropTiles = new CropTiles()
  private _settingsCode: string = ''
  private _settingsHaveBeenLoaded = false


  constructor() {
    const defaultRows = 3
    const defaultColumns = 3

    for (let i = 0; i < defaultRows; i++) {
      this._layout[i] = []
      for (let j = 0; j < defaultColumns; j++)
        this._layout[i]![j] = new Plot(true)
    }

    this.loadLayout(
      `v${this._version}_D-111-111-111_Cr-NNNNNNNNN-NNNNNNNNN-NNNNNNNNN-NNNNNNNNN-NNNNNNNNN-NNNNNNNNN-NNNNNNNNN-NNNNNNNNN-NNNNNNNNN`,
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
    const { dimensionInfo, cropInfo: cropsInfo, settingsInfo } = parseSave(layout)

    if (settingsInfo) {
      this._settingsCode = settingsInfo || ''
      this._settingsHaveBeenLoaded = true
    }

    this._layout = []


    const dimensions = dimensionInfo.split('-').splice(1)

    const rows = dimensions.length
    const columns = dimensions[0]!.length

    for (let i = 0; i < rows; i++) {
      this._layout[i] = []
      for (let j = 0; j < columns; j++)
        this._layout[i]![j] = new Plot()
    }

    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < columns; j++) {
        const currentPlot = this._layout[i]?.[j];
        const currentPlotDimensions = dimensions[i]?.[j];

        if (!currentPlot || !currentPlotDimensions){
          console.error('PLOT/DIMENSIONS ERROR FOUND')
          continue
        }

        currentPlot.isActive = currentPlotDimensions === '1'
        // set adjacent plots
        if (i > 0)
          currentPlot.setPlotAdjacent(Direction.North, this._layout[i - 1]?.[j])

        if (i < rows - 1)
          currentPlot.setPlotAdjacent(Direction.South, this._layout[i + 1]?.[j])

        if (j > 0)
          currentPlot.setPlotAdjacent(Direction.West, this._layout[i]?.[j - 1])

        if (j < columns - 1)
          currentPlot.setPlotAdjacent(Direction.East, this._layout[i]?.[j + 1])
      }
    }

    const crops = cropsInfo.split('-').splice(1)

    let cropIndex = 0
    for (const plot of this._layout.flat()) {
      if (plot.isActive) {
        const regex = /[A-Z](?:\.[A-Z]|[^A-Z])*/g
        const cropCodes = crops[cropIndex]?.match(regex)
        if (cropCodes == null)
          throw new Error('Invalid crop code')

        for (let i = 0; i < plot.tiles.length; i++) {
          for (let j = 0; j < plot.tiles[i]!.length; j++) {
            // eslint-disable-next-line prefer-const
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

    return true
  }


  /**
   * @returns a string containing the layout info of the garden
   */
  saveLayout(settingsCode?: string): string {
    let layoutCode = `v${this._version}_D-`
    const rows = this._layout.length
    const columns = this._layout[0].length

    for (let rowIndex = 0; rowIndex < rows; rowIndex++) {
      let row = ''
      for (let colIndex = 0; colIndex < columns; colIndex++)
        row += this._layout[rowIndex][colIndex].isActive ? '1' : '0'
      layoutCode += `${row}-`
    }

    layoutCode = `${layoutCode.substring(0, layoutCode.length - 1)}_CR-`

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


    if (settingsCode)
      layoutCode += `_${settingsCode}`


    return layoutCode
  }

  /**
   * One time update to the settings code, used when loading a saved garden
   */
  get loadSettingsCode(): string {
    if (this._settingsHaveBeenLoaded) {
      this._settingsHaveBeenLoaded = false
      return this._settingsCode ?? ''
    }
    return ''
  }


  updateTiles(): void {
    this._cropTiles.updateTiles(this._layout)
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

        switch (tile.crop?.size) {
          case CropSize.Tree:
            (treeTiles[tile.id] = treeTiles[tile.id] || []).push(tile)
            if (treeTiles[tile.id]?.length === 9) {
              const bonusesReceived = treeTiles[tile.id]!.flatMap(tile => tile.bonusesReceived)
              const bonusCounts = bonusesReceived.reduce((acc, bonus) => {
                if (bonus in acc)
                  acc[bonus]!++
                else
                  acc[bonus] = 1

                return acc
              }, {} as Record<string, number>)

              for (const bonus in bonusCounts) {
                if (bonusCounts[bonus]! >= 3) {
                  for (const appleTile of treeTiles[tile.id]!)
                    appleTile.bonuses.push(bonus as Bonus)
                }
              }
            }
            break
          case CropSize.Bush:
            if (tile.id in bushTiles)
              bushTiles[tile.id]?.push(tile)
            else
              bushTiles[tile.id] = [tile]

            if (bushTiles[tile.id]?.length === 4) {
              const bonusesReceived = bushTiles[tile.id]?.flatMap(tile => tile.bonusesReceived)
              const bonusCounts = bonusesReceived!.reduce((acc, bonus) => {
                if (bonus in acc)
                  acc[bonus]!++
                else
                  acc[bonus] = 1

                return acc
              }, {} as Record<string, number>)

              for (const bonus in bonusCounts) {
                if (bonusCounts[bonus]! >= 2) {
                  for (const blueberryTile of bushTiles[tile.id]!)
                    blueberryTile.bonuses.push(bonus as Bonus)
                }
              }
            }
            break
          default:
            tile.bonuses = tile.bonusesReceived
        }
      }
    }

    this.updateTiles()
  }

  saveSettings(harvesterOptions: IHarvesterOptions, processorSettings: ProcessorSettings): string {
    return encodeSettings(harvesterOptions, processorSettings)
  }

  loadSettings(settingsInfo: string): { harvesterOptions: IHarvesterOptions, processorSettings: ProcessorSettings } {
    return decodeSettings(settingsInfo)
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
    return {
      cropCount: this._cropTiles.cropCount,
      cropTypeCount: this._cropTiles.cropTypeCount,
      cropBonusCoverage: this._cropTiles.bonusCoverage,
      fertiliserCount: this._cropTiles.fertiliserCount,
    } as PlotStat
  }

  get uniqueTiles() {
    return this._cropTiles.uniqueTiles satisfies TUniqueTiles
  }

  get cropGroupBonusStats() {
    return this._cropTiles.cropGroupBonusStats
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
