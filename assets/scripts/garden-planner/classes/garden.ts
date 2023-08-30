import Direction from '../enums/direction'
import Bonus from '../enums/bonus'
import CropType from '../enums/crops'
import CropCode from '../enums/cropcode'
import type { PlotStat } from '../types/plotStat'
import crops, { getCodeFromCrop, getCropFromCode } from '../crop-list'
import { parseSave } from '../save-handler'
import FertiliserType from '../enums/fertiliser'
import FertiliserCode from '../enums/fertilisercode'
import { getCodeFromFertiliser, getFertiliserFromCode } from '../fertiliser-list'

import Plot from './plot'
import Tile from './tile'

interface CalculateYieldOptions {
  days?: number
  includeReplant?: boolean
  postLevel25: boolean
  allStarSeeds?: boolean
  starChanceOverride?: number
  baseChanceOverride?: number
  includeReplantCost?: boolean
}

type CalculateValueOptions = {
  [key in CropType]: {
    baseType: 'crop' | 'seed' | 'preserve'
    starType: 'crop' | 'seed' | 'preserve'
  }
}

interface HarvestInfo {
  day: number
  crops: {
    [key in CropType]: {
      base: number
      star: number
    }
  }
  seedsRemainder: {
    [key in CropType]: {
      base: number
      star: number
    }
  }
}

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
      `v${this._version}_DIM-111-111-111_CROPS-NaNaNaNaNaNaNaNaNa-NaNaNaNaNaNaNaNaNa-NaNaNaNaNaNaNaNaNa-NaNaNaNaNaNaNaNaNa-NaNaNaNaNaNaNaNaNa-NaNaNaNaNaNaNaNaNa-NaNaNaNaNaNaNaNaNa-NaNaNaNaNaNaNaNaNa-NaNaNaNaNaNaNaNaNa`,
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

  loadLayout(layout: string) {
    const { version, dimensionInfo, cropInfo: cropsInfo } = parseSave(layout)

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
    const appleTiles: {
      [key: string]: Tile[]
    } = {}
    const blueberryTiles: {
      [key: string]: Tile[]
    } = {}

    // Calculate bonuses received
    for (const plot of this._layout.flat()) {
      if (!plot.isActive)
        continue

      plot.calculateBonusesReceived()
    }

    // Calculate bonuses
    for (const plot of this._layout.flat()) {
      if (!plot.isActive)
        continue

      for (const tile of plot.tiles.flat()) {
        tile.bonuses = []
        if (!tile.crop || tile.crop.type === CropType.None)
          continue

        if (tile.crop?.type === CropType.Apple) {
          if (tile.id in appleTiles)
            appleTiles[tile.id].push(tile)
          else
            appleTiles[tile.id] = [tile]

          if (appleTiles[tile.id].length === 9) {
            const bonusesReceived = appleTiles[tile.id].map(tile => tile.bonusesReceived).flat()
            const bonusCounts: {
              [key: string]: number
            } = {}

            for (const bonus of bonusesReceived) {
              if (bonus in bonusCounts)
                bonusCounts[bonus]++
              else
                bonusCounts[bonus] = 1
            }

            for (const bonus in bonusCounts) {
              if (bonusCounts[bonus] >= 3) {
                for (const appleTile of appleTiles[tile.id])
                  appleTile.bonuses.push(bonus as Bonus)
              }
            }
          }
        }
        else if (tile.crop?.type === CropType.Blueberry) {
          if (tile.id in blueberryTiles)
            blueberryTiles[tile.id].push(tile)
          else
            blueberryTiles[tile.id] = [tile]

          if (blueberryTiles[tile.id].length === 4) {
            const bonusesReceived = blueberryTiles[tile.id]
              .map(tile => tile.bonusesReceived)
              .flat()

            const bonusCounts: {
              [key: string]: number
            } = {}

            for (const bonus of bonusesReceived) {
              if (bonus in bonusCounts)
                bonusCounts[bonus]++
              else
                bonusCounts[bonus] = 1
            }

            for (const bonus in bonusCounts) {
              if (bonusCounts[bonus] >= 2) {
                for (const blueberryTile of blueberryTiles[tile.id])
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

  calculateYield(options: CalculateYieldOptions) {
    // Gets a list of all tiles, and excludes tiles that contain duplicates (i.e. 9 apples tiles should only return 1 tile)
    const individualCrops = new Map<string, Tile>()

    const seedsRemainder: {
      [key in CropType]: {
        base: number
        star: number
      }
    } = getCropMap()

    for (const plot of this._layout.flat()) {
      if (!plot.isActive)
        continue

      for (const tile of plot.tiles.flat()) {
        if (tile.crop && tile.crop.type !== CropType.None)
          individualCrops.set(tile.id, tile)
      }
    }

    let minGrowthTime = 0
    if (individualCrops.size > 0) {
      minGrowthTime = Math.min(
        ...Array.from(individualCrops.values()).map(
          tile => tile.crop?.produceInfo.growthTime ?? 0,
        ),
      )
    }
    else {
      return {
        harvests: [] as HarvestInfo[],
        harvestTotal: {
          day: 0,
          crops: {
            [CropType.Tomato]: {
              base: 0,
              star: 0,
            },
            [CropType.Potato]: {
              base: 0,
              star: 0,
            },
            [CropType.Rice]: {
              base: 0,
              star: 0,
            },
            [CropType.Wheat]: {
              base: 0,
              star: 0,
            },
            [CropType.Carrot]: {
              base: 0,
              star: 0,
            },
            [CropType.Onion]: {
              base: 0,
              star: 0,
            },
            [CropType.Cotton]: {
              base: 0,
              star: 0,
            },
            [CropType.Apple]: {
              base: 0,
              star: 0,
            },
            [CropType.Blueberry]: {
              base: 0,
              star: 0,
            },
            [CropType.None]: {
              base: 0,
              star: 0,
            },
          },
          seedsRemainder: getCropMap(),
        } as HarvestInfo,
      }
    }

    // max growth time is the maximum growth time of all crops, and then reharvest cooldown multiplied by rehavest limit
    let maxGrowthTime = Math.max(
      ...Array.from(individualCrops.values()).map((tile) => {
        if (tile.crop?.produceInfo == null)
          return 0

        return tile.crop.totalGrowTime
      }),
    )
    if (options.days && options.days > 0)
      maxGrowthTime = options.days

    const harvests: {
      day: number
      crops: {
        [key in CropType]: {
          base: number
          star: number
        }
      }
      seedsRemainder?: {
        [key in CropType]: {
          base: number
          star: number
        }
      }
    }[] = []

    const harvestTotal: {
      day: number
      crops: {
        [key in CropType]: {
          base: number
          star: number
        }
      }
      seedsRemainder: {
        [key in CropType]: {
          base: number
          star: number
        }
      }
      totalGold: number
    } = {
      day: 0,
      crops: getCropMap(),
      seedsRemainder: getCropMap(),
      totalGold: 0,
    }

    // Reduce growth time by 1 to account for speed boost
    for (let day = minGrowthTime - 1; day <= maxGrowthTime; day++) {
      const harvest: HarvestInfo = {
        day,
        crops: getCropMap(),
        seedsRemainder: getCropMap(),
      }

      const seedsRequired: {
        [key in CropType]: {
          base: number
          star: number
        }
      } = {
        [CropType.None]: {
          base: 0,
          star: 0,
        },
        [CropType.Tomato]: {
          base: 0,
          star: 0,
        },
        [CropType.Potato]: {
          base: 0,
          star: 0,
        },
        [CropType.Rice]: {
          base: 0,
          star: 0,
        },
        [CropType.Wheat]: {
          base: 0,
          star: 0,
        },
        [CropType.Carrot]: {
          base: 0,
          star: 0,
        },
        [CropType.Onion]: {
          base: 0,
          star: 0,
        },
        [CropType.Cotton]: {
          base: 0,
          star: 0,
        },
        [CropType.Blueberry]: {
          base: 0,
          star: 0,
        },
        [CropType.Apple]: {
          base: 0,
          star: 0,
        },
      }

      for (const [, tile] of individualCrops) {
        const crop = tile.crop
        if (
          crop?.produceInfo == null
          || crop?.type === CropType.None
          || crop?.produceInfo.growthTime === null
        )
          continue

        if (day > crop.totalGrowTime && !options.includeReplant)
          continue

        const baseStarChance
          = (tile.hasStarSeed || options.allStarSeeds) && options.postLevel25
            ? 1
            : tile.hasStarSeed || options.allStarSeeds
              ? options.starChanceOverride ?? 0.66
              : options.baseChanceOverride ?? 0

        const { base, withBonus } = crop.produceInfo
        const { isHarvestable, doReplant } = crop.isHarvestableOnDay(day)

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
            const seedsRequired = (seeds.star -= seedsRemainder[cropType].star)
            const remainderSeedsUsed = seeds.star - seedsRequired

            if (seedsRequired > 0) {
              const cropsConsumed
                = Math.ceil(((cropsPerSeed / seedsPerConversion) * seedsRequired)
                + (((cropsPerSeed / seedsPerConversion) * seedsRequired) % cropsPerSeed),
                )
              harvest.crops[cropType].star -= cropsConsumed
              seedsRemainder[cropType].star
                += Math.floor((cropsConsumed / cropsPerSeed) * seedsPerConversion - seedsRequired)
            }

            seedsRemainder[cropType].star -= remainderSeedsUsed
            harvest.seedsRemainder[cropType].star = seedsRemainder[cropType].star
          }

          if (seeds.base > 0) {
            const seedsRequired = (seeds.base -= seedsRemainder[cropType].base)
            const remainderSeedsUsed = seeds.base - seedsRequired

            if (seedsRequired > 0) {
              const cropsConsumed
                = Math.ceil((cropsPerSeed / seedsPerConversion) * seedsRequired)
                + (Math.ceil((cropsPerSeed / seedsPerConversion) * seedsRequired) % cropsPerSeed)

              harvest.crops[cropType].base -= cropsConsumed

              seedsRemainder[cropType].base
                += Math.floor((cropsConsumed / cropsPerSeed) * seedsPerConversion - seedsRequired)
            }

            seedsRemainder[cropType].base -= remainderSeedsUsed
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
      harvests: HarvestInfo[]
      harvestTotal: HarvestInfo
    }
  }

  calculateValue(
    options: CalculateValueOptions,
    harvestInfo: {
      harvests: HarvestInfo[]
      harvestTotal: HarvestInfo
    },
  ) {
    const result: {
      day: number
      crops: {
        [key in CropType]: {
          base: {
            produce: number
            type: 'crop' | 'seed' | 'preserve'
            gold: number
            cropRemainder: number
          }
          star: {
            produce: number
            type: 'crop' | 'seed' | 'preserve'
            gold: number
            cropRemainder: number
          }
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
      const dayResult = {
        day,
        crops: {
          [CropType.Tomato]: {
            base: {
              produce: 0,
              type: options[CropType.Tomato].baseType,
              gold: 0,
              cropRemainder: 0,
            },
            star: {
              produce: 0,
              type: options[CropType.Tomato].starType,
              gold: 0,
              cropRemainder: 0,
            },
          },
          [CropType.Potato]: {
            base: {
              produce: 0,
              type: options[CropType.Potato].baseType,
              gold: 0,
              cropRemainder: 0,
            },
            star: {
              produce: 0,
              type: options[CropType.Potato].starType,
              gold: 0,
              cropRemainder: 0,
            },
          },
          [CropType.Rice]: {
            base: {
              produce: 0,
              type: options[CropType.Rice].baseType,
              gold: 0,
              cropRemainder: 0,
            },
            star: {
              produce: 0,
              type: options[CropType.Rice].starType,
              gold: 0,
              cropRemainder: 0,
            },
          },
          [CropType.Wheat]: {
            base: {
              produce: 0,
              type: options[CropType.Wheat].baseType,
              gold: 0,
              cropRemainder: 0,
            },
            star: {
              produce: 0,
              type: options[CropType.Wheat].starType,
              gold: 0,
              cropRemainder: 0,
            },
          },
          [CropType.Carrot]: {
            base: {
              produce: 0,
              type: options[CropType.Carrot].baseType,
              gold: 0,
              cropRemainder: 0,
            },
            star: {
              produce: 0,
              type: options[CropType.Carrot].starType,
              gold: 0,
              cropRemainder: 0,
            },
          },
          [CropType.Onion]: {
            base: {
              produce: 0,
              type: options[CropType.Onion].baseType,
              gold: 0,
              cropRemainder: 0,
            },
            star: {
              produce: 0,
              type: options[CropType.Onion].starType,
              gold: 0,
              cropRemainder: 0,
            },
          },
          [CropType.Cotton]: {
            base: {
              produce: 0,
              type: options[CropType.Cotton].baseType,
              gold: 0,
              cropRemainder: 0,
            },
            star: {
              produce: 0,
              type: options[CropType.Cotton].starType,
              gold: 0,
              cropRemainder: 0,
            },
          },
          [CropType.Blueberry]: {
            base: {
              produce: 0,
              type: options[CropType.Blueberry].baseType,
              gold: 0,
              cropRemainder: 0,
            },
            star: {
              produce: 0,
              type: options[CropType.Blueberry].starType,
              gold: 0,
              cropRemainder: 0,
            },
          },
          [CropType.Apple]: {
            base: {
              produce: 0,
              type: options[CropType.Apple].baseType,
              gold: 0,
              cropRemainder: 0,
            },
            star: {
              produce: 0,
              type: options[CropType.Apple].starType,
              gold: 0,
              cropRemainder: 0,
            },
          },
          [CropType.None]: {
            base: {
              produce: 0,
              type: options[CropType.None].baseType,
              gold: 0,
              cropRemainder: 0,
            },
            star: {
              produce: 0,
              type: options[CropType.None].starType,
              gold: 0,
              cropRemainder: 0,
            },
          },
        },
        totalGold: 0,
      }

      for (const cropType in cropTypes) {
        const baseOption = options[cropType as CropType].baseType
        const starOption = options[cropType as CropType].starType

        const baseProduce = cropTypes[cropType as CropType].base
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
        let baseGoldValue = 0
        let convertedBaseUnits = 0
        let starGoldValue = 0
        let convertedStarUnits = 0

        switch (baseOption) {
          case 'crop':
            remainders[cropType as CropType].base += 0
            baseGoldValue = crop.calculateGoldValue(baseProduce, baseOption, false).goldValue
            convertedBaseUnits = baseProduce
            break
          case 'seed':
            remainders[cropType as CropType].base = 0
            remainders[cropType as CropType].base += crop.convertCropToSeed(
              baseProduce + baseRemainder,
            )?.remainder
            convertedBaseUnits = crop?.convertCropToSeed(baseProduce + baseRemainder)?.count
            baseGoldValue = crop.calculateGoldValue(
              baseProduce + baseRemainder,
              baseOption,
              false,
            ).goldValue
            break
          case 'preserve':
            remainders[cropType as CropType].base = 0
            remainders[cropType as CropType].base
              += crop.convertCropToPreserve(baseProduce + baseRemainder).remainder ?? 0
            convertedBaseUnits = crop.convertCropToPreserve(baseProduce + baseRemainder).count ?? 0
            baseGoldValue
              = crop.calculateGoldValue(baseProduce + baseRemainder, baseOption, false).goldValue ?? 0
            break
        }
        dayResult.crops[cropType as CropType].base.gold += baseGoldValue
        dayResult.crops[cropType as CropType].base.produce += convertedBaseUnits
        dayResult.crops[cropType as CropType].base.cropRemainder
          = remainders[cropType as CropType].base

        switch (starOption) {
          case 'crop':
            remainders[cropType as CropType].star += 0
            starGoldValue = crop?.calculateGoldValue(starProduce, starOption, true).goldValue
            convertedStarUnits = starProduce
            break
          case 'seed':
            remainders[cropType as CropType].star = 0
            remainders[cropType as CropType].star
              += crop?.convertCropToSeed(starProduce + starRemainder)?.remainder ?? 0
            convertedStarUnits = crop?.convertCropToSeed(starProduce + starRemainder)?.count
            starGoldValue = crop?.calculateGoldValue(starProduce + starRemainder, starOption, true)
              .goldValue
            break
          case 'preserve':
            remainders[cropType as CropType].star = 0
            remainders[cropType as CropType].star
              += crop?.convertCropToPreserve(starProduce + starRemainder).remainder ?? 0
            convertedStarUnits = crop?.convertCropToPreserve(starProduce + starRemainder).count
            starGoldValue = crop?.calculateGoldValue(starProduce + starRemainder, starOption, true)
              .goldValue
            break
        }

        dayResult.crops[cropType as CropType].star.gold += starGoldValue
        dayResult.crops[cropType as CropType].star.produce += convertedStarUnits
        dayResult.crops[cropType as CropType].star.cropRemainder
          = remainders[cropType as CropType].star
        dayResult.totalGold += baseGoldValue + starGoldValue
      }

      result.push(dayResult)
    }

    const totalResult = {
      day: harvestInfo.harvestTotal.day,
      crops: {
        [CropType.Tomato]: {
          base: {
            produce: 0,
            type: options[CropType.Tomato].baseType,
            gold: 0,
            cropRemainder: 0,
          },
          star: {
            produce: 0,
            type: options[CropType.Tomato].starType,
            gold: 0,
            cropRemainder: 0,
          },
        },
        [CropType.Potato]: {
          base: {
            produce: 0,
            type: options[CropType.Potato].baseType,
            gold: 0,
            cropRemainder: 0,
          },
          star: {
            produce: 0,
            type: options[CropType.Potato].starType,
            gold: 0,
            cropRemainder: 0,
          },
        },
        [CropType.Rice]: {
          base: {
            produce: 0,
            type: options[CropType.Rice].baseType,
            gold: 0,
            cropRemainder: 0,
          },
          star: {
            produce: 0,
            type: options[CropType.Rice].starType,
            gold: 0,
            cropRemainder: 0,
          },
        },
        [CropType.Wheat]: {
          base: {
            produce: 0,
            type: options[CropType.Wheat].baseType,
            gold: 0,
            cropRemainder: 0,
          },
          star: {
            produce: 0,
            type: options[CropType.Wheat].starType,
            gold: 0,
            cropRemainder: 0,
          },
        },
        [CropType.Carrot]: {
          base: {
            produce: 0,
            type: options[CropType.Carrot].baseType,
            gold: 0,
            cropRemainder: 0,
          },
          star: {
            produce: 0,
            type: options[CropType.Carrot].starType,
            gold: 0,
            cropRemainder: 0,
          },
        },
        [CropType.Onion]: {
          base: {
            produce: 0,
            type: options[CropType.Onion].baseType,
            gold: 0,
            cropRemainder: 0,
          },
          star: {
            produce: 0,
            type: options[CropType.Onion].starType,
            gold: 0,
            cropRemainder: 0,
          },
        },
        [CropType.Cotton]: {
          base: {
            produce: 0,
            type: options[CropType.Cotton].baseType,
            gold: 0,
            cropRemainder: 0,
          },
          star: {
            produce: 0,
            type: options[CropType.Cotton].starType,
            gold: 0,
            cropRemainder: 0,
          },
        },
        [CropType.Blueberry]: {
          base: {
            produce: 0,
            type: options[CropType.Blueberry].baseType,
            gold: 0,
            cropRemainder: 0,
          },
          star: {
            produce: 0,
            type: options[CropType.Blueberry].starType,
            gold: 0,
            cropRemainder: 0,
          },
        },
        [CropType.Apple]: {
          base: {
            produce: 0,
            type: options[CropType.Apple].baseType,
            gold: 0,
            cropRemainder: 0,
          },
          star: {
            produce: 0,
            type: options[CropType.Apple].starType,
            gold: 0,
            cropRemainder: 0,
          },
        },
        [CropType.None]: {
          base: {
            produce: 0,
            type: options[CropType.None].baseType,
            gold: 0,
            cropRemainder: 0,
          },
          star: {
            produce: 0,
            type: options[CropType.None].starType,
            gold: 0,
            cropRemainder: 0,
          },
        },
      },
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

      const baseRemainder = totalResult.crops[cropType as CropType].base.cropRemainder
      const starRemainder = totalResult.crops[cropType as CropType].star.cropRemainder

      let baseGoldValue = 0
      let convertedBaseUnits = 0

      switch (baseOption) {
        case 'crop':
          totalResult.crops[cropType as CropType].base.cropRemainder += 0
          baseGoldValue = crop?.calculateGoldValue(baseProduce, baseOption, false).goldValue ?? 0
          convertedBaseUnits = baseProduce
          break
        case 'seed':
          totalResult.crops[cropType as CropType].base.cropRemainder = 0
          totalResult.crops[cropType as CropType].base.cropRemainder += crop.convertCropToSeed(
            baseProduce + baseRemainder,
          )?.remainder
          convertedBaseUnits = crop?.convertCropToSeed(baseProduce + baseRemainder)?.count
          baseGoldValue = crop.calculateGoldValue(
            baseProduce + baseRemainder,
            baseOption,
            false,
          ).goldValue
          break
        case 'preserve':
          totalResult.crops[cropType as CropType].base.cropRemainder = 0
          totalResult.crops[cropType as CropType].base.cropRemainder += crop.convertCropToPreserve(
            baseProduce + baseRemainder,
          ).remainder
          convertedBaseUnits = crop.convertCropToPreserve(baseProduce + baseRemainder).count
          baseGoldValue = crop.calculateGoldValue(
            baseProduce + baseRemainder,
            baseOption,
            false,
          ).goldValue
          break
      }
      totalResult.crops[cropType as CropType].base.gold += baseGoldValue
      totalResult.crops[cropType as CropType].base.produce += convertedBaseUnits
      totalResult.crops[cropType as CropType].base.cropRemainder += baseRemainder

      let starGoldValue = 0
      let convertedStarUnits = 0

      switch (starOption) {
        case 'crop':
          totalResult.crops[cropType as CropType].star.cropRemainder += 0
          starGoldValue = crop?.calculateGoldValue(starProduce, starOption, true).goldValue ?? 0
          convertedStarUnits = starProduce
          break
        case 'seed':
          totalResult.crops[cropType as CropType].star.cropRemainder = 0
          totalResult.crops[cropType as CropType].star.cropRemainder += crop.convertCropToSeed(
            starProduce + starRemainder,
          ).remainder
          convertedStarUnits = crop?.convertCropToSeed(starProduce + starRemainder).count
          starGoldValue = crop.calculateGoldValue(
            starProduce + starRemainder,
            starOption,
            true,
          ).goldValue
          break
        case 'preserve':
          totalResult.crops[cropType as CropType].star.cropRemainder = 0
          totalResult.crops[cropType as CropType].star.cropRemainder
            += crop?.convertCropToPreserve(starProduce + starRemainder).remainder ?? 0
          convertedStarUnits = crop?.convertCropToPreserve(starProduce + starRemainder).count ?? 0
          starGoldValue
            = crop?.calculateGoldValue(starProduce + starRemainder, starOption, true).goldValue ?? 0
          break
      }

      totalResult.crops[cropType as CropType].star.gold += starGoldValue
      totalResult.crops[cropType as CropType].star.produce += convertedStarUnits
      totalResult.crops[cropType as CropType].star.cropRemainder += starRemainder

      totalResult.totalGold += baseGoldValue + starGoldValue
    }
    return {
      result,
      totalResult,
    }
  }

  calculateStats() {
    const individualCrops = new Map<string, Tile>()

    const fertiliserCount: {
      [key in FertiliserType]: number
    } = {
      [FertiliserType.None]: 0,
      [FertiliserType.QualityUp]: 0,
      [FertiliserType.HarvestBoost]: 0,
      [FertiliserType.WeedBlock]: 0,
      [FertiliserType.SpeedyGro]: 0,
      [FertiliserType.HydratePro]: 0,
    }

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

    const bonusCoverage: {
      [key in Bonus]: number
    } = {
      [Bonus.None]: 0,
      [Bonus.HarvestIncrease]: 0,
      [Bonus.WeedPrevention]: 0,
      [Bonus.WaterRetain]: 0,
      [Bonus.QualityIncrease]: 0,
      [Bonus.SpeedIncrease]: 0,
    }

    for (const crop of individualCrops.values()) {
      for (const bonus of crop.bonuses) {
        if (bonus !== Bonus.None)
          bonusCoverage[bonus]++
      }
    }

    const cropTypeCount: {
      [key in CropType]: number
    } = {
      [CropType.None]: 0,
      [CropType.Tomato]: 0,
      [CropType.Potato]: 0,
      [CropType.Rice]: 0,
      [CropType.Wheat]: 0,
      [CropType.Carrot]: 0,
      [CropType.Onion]: 0,
      [CropType.Cotton]: 0,
      [CropType.Blueberry]: 0,
      [CropType.Apple]: 0,
    }

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
export default Garden
export type { CalculateValueOptions }

// TODO: Move this to a better place
function getCropMap() {
  const cropValue: {
    [key in CropType]: {
      base: number
      star: number
    }
  } = {
    [CropType.None]: {
      base: 0,
      star: 0,
    },
    [CropType.Tomato]: {
      base: 0,
      star: 0,
    },
    [CropType.Potato]: {
      base: 0,
      star: 0,
    },
    [CropType.Rice]: {
      base: 0,
      star: 0,
    },
    [CropType.Wheat]: {
      base: 0,
      star: 0,
    },
    [CropType.Carrot]: {
      base: 0,
      star: 0,
    },
    [CropType.Onion]: {
      base: 0,
      star: 0,
    },
    [CropType.Cotton]: {
      base: 0,
      star: 0,
    },
    [CropType.Blueberry]: {
      base: 0,
      star: 0,
    },
    [CropType.Apple]: {
      base: 0,
      star: 0,
    },
  }

  return cropValue
}
