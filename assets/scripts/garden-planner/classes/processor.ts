import { getCropFromType } from '../cropList'
import { CropType } from '../imports'
import { ItemType } from '../utils/garden-helpers'
import type { CropItem, ICropName, ISeedTracker, ITotalHarvest } from '../utils/garden-helpers'

interface ProcessorOutput {
  crops: Map<ICropName, Pick<ProcessOutputInfo, 'count'>>
  seeds: Map<ICropName, ProcessOutputInfo>
  preserves: Map<ICropName, ProcessOutputInfo>
  replantSeeds: Map<ICropName, ISeedTracker>
}

interface ProcessOutputInfo {
  count: number
  // how long to process this crop overall
  minutesProcessedTotal: number
  // how long to process this crop after crafters divide the work
  minutesProcessedFinal: number
  // how many crafters were used to process this crop
  crafterCount: number
}

type CropProcessSetting = CropItem

interface ProcessorSetting {
  cropType: CropType
  isStar: boolean
  processAs: CropProcessSetting
  crafters: number
  targetTime: number
}

interface ProcessorSettings {
  cropSettings: Map<ICropName, ProcessorSetting>
  crafterSetting: number
}

enum ECrafterSetting {
  // Manual setting will use the crafter count set in the crop settings
  Manual = -1,
  // Auto setting will try to lower the time to process all crops but will not go over max crafters
  Auto = 0,

  // Any number greater than 0 is the targeted days to process all crops
}

type TCropProcessData = Map<ICropName, {
  totalProcessTime: number
  // the function to process the crop
  processType: ItemType.Crop | ItemType.Seed | ItemType.Preserve
  // How many crafters are set to process this crop
  craftersToUse: number
}>

const TEST_TOTAL_HARVEST = {
  lastHarvestDay: 180,
  seedsRemainder: new Map(),
  crops: new Map([
    [
      'rice-Base',
      {
        base: 0,
        extra: 0,
        totalRaw: 0,
        totalWithDeductions: 0,
        cropType: 'rice',
        isStar: true,
      },
    ],
    [
      'rice-Star',
      {
        base: 3360,
        extra: 240,
        totalRaw: 3600,
        totalWithDeductions: 3540,
        cropType: 'rice',
        isStar: true,
      },
    ],
    [
      'carrot-Base',
      {
        base: 0,
        extra: 0,
        totalRaw: 0,
        cropType: 'carrot',
        isStar: true,
      },
    ],
    [
      'carrot-Star',
      {
        base: 1920,
        extra: 240,
        totalRaw: 2160,
        totalWithDeductions: 1980,
        cropType: 'carrot',
        isStar: true,
      },
    ],
    [
      'potato-Base',
      {
        base: 0,
        extra: 0,
        totalRaw: 0,
        totalWithDeductions: 0,
        cropType: 'potato',
        isStar: true,
      },
    ],
    [
      'potato-Star',
      {
        base: 1512,
        extra: 324,
        totalRaw: 1836,
        totalWithDeductions: 1728,
        cropType: 'potato',
        isStar: true,
      },
    ],
    [
      'blueberry-Base',
      {
        base: 0,
        extra: 0,
        totalRaw: 0,
        cropType: 'blueberry',
        isStar: true,
      },
    ],
    [
      'blueberry-Star',
      {
        base: 960,
        extra: 240,
        totalRaw: 1200,
        totalWithDeductions: 1160,
        cropType: 'blueberry',
        isStar: true,
      },
    ],
  ]),
  seeds: {},
  preserves: {},
  replantSeeds: {},
} as ITotalHarvest

const TEST_SETTINGS = {
  crafterSetting: 0,
  cropSettings: new Map([
    [
      'rice-Star' satisfies ICropName,
      {
        cropType: 'rice',
        isStar: true,
        processAs: ItemType.Seed,
        crafters: 1,
        targetTime: 0,
      },
    ],
    [
      'rice-Base' satisfies ICropName,
      {
        cropType: 'rice',
        isStar: true,
        processAs: ItemType.Crop,
        crafters: 0,
        targetTime: 0,
      },
    ],
    [
      'carrot-Star' satisfies ICropName,
      {
        cropType: 'carrot',
        isStar: true,
        processAs: ItemType.Seed,
        crafters: 1,
        targetTime: 0,
      },
    ],
    [
      'carrot-Base' satisfies ICropName,
      {
        cropType: 'carrot',
        isStar: true,
        processAs: ItemType.Crop,
        crafters: 0,
        targetTime: 0,
      },
    ],
    [
      'potato-Base' satisfies ICropName,
      {
        cropType: 'potato',
        isStar: true,
        processAs: ItemType.Crop,
        crafters: 0,
        targetTime: 0,
      },
    ],
    [
      'potato-Star' satisfies ICropName,
      {
        cropType: 'potato',
        isStar: true,
        processAs: ItemType.Preserve,
        crafters: 1,
        targetTime: 0,
      },
    ],
    [
      'blueberry-Base' satisfies ICropName,
      {
        cropType: 'blueberry',
        isStar: true,
        processAs: ItemType.Crop,
        crafters: 0,
        targetTime: 0,
      },
    ],
    [
      'blueberry-Star' satisfies ICropName,
      {
        cropType: 'blueberry',
        isStar: true,
        processAs: ItemType.Crop,
        crafters: 0,
        targetTime: 0,
      },
    ],
  ]),
} as ProcessorSettings

export default class Processor {
  private _output: ProcessorOutput = {
    crops: new Map(),
    seeds: new Map(),
    preserves: new Map(),
    replantSeeds: new Map(),
  }

  get output(): ProcessorOutput {
    return this._output
  }

  process(harvestData: Readonly<ITotalHarvest> = TEST_TOTAL_HARVEST, processorSettings: Readonly<ProcessorSettings> = TEST_SETTINGS): void {
    const output: ProcessorOutput = {
      crops: new Map(),
      seeds: new Map(),
      preserves: new Map(),
      replantSeeds: Object.assign({}, harvestData.seedsRemainder),
    }

    const settings = Object.assign({}, processorSettings)

    const cropData = this.calculateSettings(harvestData, settings)

    for (const [cropName, processData] of cropData) {
      // If not set to process, just add to crops
      if (processData.processType === ItemType.Crop) {
        const count = harvestData.crops.get(cropName)?.totalWithDeductions || 0

        if (count > 0) {
          output.crops.set(cropName, {
            count,
          })
        }
      }

      // Final processor behaviour goes here
      else if (processData.processType === ItemType.Seed || processData.processType === ItemType.Preserve) {
        const crop = getCropFromType(harvestData.crops.get(cropName)?.cropType || CropType.None)
        if (!crop)
          throw new Error(`Missing crop data for crop: ${cropName}`)

        const processType = processData.processType === ItemType.Seed ? 'seeds' : 'preserves'
        const { count, remainder } = (processData.processType === ItemType.Seed) ? crop.convertCropToSeed(harvestData.crops.get(cropName)?.totalWithDeductions || 0) : crop.convertCropToPreserve(harvestData.crops.get(cropName)?.totalWithDeductions || 0)
        const minutesProcessedFinal = Math.round(processData.totalProcessTime / processData.craftersToUse)
        output[processType].set(cropName, {
          count,
          minutesProcessedTotal: processData.totalProcessTime,
          minutesProcessedFinal,
          crafterCount: processData.craftersToUse,
        })

        if (remainder > 0) {
          output.crops.set(cropName, {
            count: remainder,
          })
        }
      }
    }

    // console.log('output', output)

    this._output = output
  }

  /**
   *  Function is responsible for figuring out how many crafters to assign to each crop group.
   *  This should be manual but can be set to auto.
   *
   * @param totalHarvest - Harvest data
   * @param settings - Processor settings
   * @returns
   */
  private calculateSettings(totalHarvest: Readonly<ITotalHarvest>, settings: Readonly<ProcessorSettings>): TCropProcessData {
    const cropData = new Map<ICropName, {
      totalProcessTime: number
      processType: ItemType.Crop | ItemType.Seed | ItemType.Preserve
      craftersToUse: number
    }>()
    const cropsToProcess = new Map<ICropName, {
      totalProcessTime: number
      craftersToUse: number
    }>()

    for (const [cropName, cropYield] of totalHarvest.crops) {
      const crop = getCropFromType(cropYield.cropType)
      if (!crop)
        throw new Error(`Missing crop data for crop: ${cropName}`)
      const setting = settings.cropSettings.get(cropName)
      if (!setting)
        throw new Error(`Missing setting for crop: ${cropName}`)

      const processSetting = setting.processAs

      // Gets crops outta the way since it won't be processed
      if (processSetting === ItemType.Crop) {
        cropData.set(cropName, {
          totalProcessTime: 0,
          processType: ItemType.Crop,
          craftersToUse: 0,
        })

        continue
      }

      const conversionInfo = crop.conversionInfo

      if (!conversionInfo)
        throw new Error(`Missing conversion info for crop: ${cropName}`)

      const cropsPerConversion = (processSetting === ItemType.Seed) ? conversionInfo.cropsPerSeed : conversionInfo.cropsPerPreserve
      const conversionTime = (processSetting === ItemType.Seed) ? conversionInfo.seedProcessMinutes : conversionInfo.preserveProcessMinutes

      const conversionsMade = Math.floor(cropYield.totalWithDeductions / cropsPerConversion)
      const totalProcessTime = conversionsMade * conversionTime

      cropData.set(cropName, {
        totalProcessTime,
        processType: processSetting,
        craftersToUse: setting.crafters,
      })
      cropsToProcess.set(cropName, {
        totalProcessTime,
        craftersToUse: setting.crafters,
      })
    }

    const crafterSetting = settings.crafterSetting

    if (crafterSetting === ECrafterSetting.Auto) {
      const totalTime = Array.from(cropsToProcess.values()).reduce((acc, crop) => acc + crop.totalProcessTime, 0)
      // console.log(cropsToProcess)
      const MAX_CRAFTERS = 30

      let availableCrafters = MAX_CRAFTERS - cropsToProcess.size
      const craftersToDivide = MAX_CRAFTERS - cropsToProcess.size

      for (const [cropName, crop] of cropsToProcess) {
        if (availableCrafters <= 0)
          break

        const totalTimePercentage = Math.floor((crop.totalProcessTime / totalTime) * 100)
        let craftersToAssign = Math.floor((totalTimePercentage / 100) * craftersToDivide)

        let newCrafterCount = crop.craftersToUse
        if (craftersToAssign > availableCrafters)
          craftersToAssign = availableCrafters

        if (craftersToAssign > 0) {
          newCrafterCount = crop.craftersToUse + craftersToAssign
          availableCrafters -= craftersToAssign
        }

        cropData.set(cropName, {
          totalProcessTime: crop.totalProcessTime,
          processType: cropData.get(cropName)?.processType || ItemType.Crop,
          craftersToUse: newCrafterCount,
        })
      }
    }

    return cropData
  }
}
