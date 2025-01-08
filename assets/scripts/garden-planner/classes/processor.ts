import { getCropFromType } from '../cropList'
import type { Crop } from '../imports'
import { CropType } from '../imports'
import { ItemType } from '../utils/garden-helpers'
import type { CropItem, ICropHarvestCycle, ICropName, ICropNameWithGrowthDiff, IInventoryItem, ISeedTracker, ITotalHarvest } from '../utils/garden-helpers'
import type { ICropConversions } from './crop'

export interface ProcessorOutput {
  crops: Map<ICropNameWithGrowthDiff, Pick<ProcessOutputInfo, 'count' | 'cropType' | 'itemType'>>
  seeds: Map<ICropNameWithGrowthDiff, ProcessOutputInfo>
  preserves: Map<ICropNameWithGrowthDiff, ProcessOutputInfo>
  replantSeeds: Map<ICropNameWithGrowthDiff, ISeedTracker>
}

export interface ProcessOutputInfo {
  count: number

  // how long this crop takes to process in total
  minutesProcessedTotal: number

  // how long this crop took to process with the assigned crafters
  minutesProcessedEffective: number

  // how many crafters were used to process this crop
  crafterCount: number

  cropType: CropType

  itemType: ItemType
}

type CropProcessSetting = CropItem

export interface ProcessorSetting {
  cropType: CropType
  isStar: boolean
  processAs: CropProcessSetting
  crafters: number
  targetTime: number
  isActive: boolean
}

export interface ProcessorSettings {
  cropSettings: Map<ICropNameWithGrowthDiff, ProcessorSetting>

  // Not currently used
  crafterSetting: number
}

// enum ECrafterSetting {
//   // Manual setting will use the crafter count set in the crop settings
//   Manual = -1,
//   // Auto setting will try to lower the time to process all crops but will not go over max crafters
//   Auto = 0,

//   // ? Not anymore, trying to automate it especially by setting the target time will be a pain
//   /// [OLD] Any number greater than 0 is the targeted days to process all crops
// }

type TCropProcessData = Map<ICropNameWithGrowthDiff, {
  totalProcessMinutes: number
  // the function to process the crop
  processType: ItemType.Crop | ItemType.Seed | ItemType.Preserve
  // How many crafters are set to process this crop
  craftersToUse: number
  conversionsToMake: number
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
        isActive: true,
      } as ProcessorSetting,
    ],
    [
      'rice-Base' satisfies ICropName,
      {
        cropType: 'rice',
        isStar: true,
        processAs: ItemType.Crop,
        crafters: 0,
        targetTime: 0,
        isActive: true,
      } as ProcessorSetting,
    ],
    [
      'carrot-Star' satisfies ICropName,
      {
        cropType: 'carrot',
        isStar: true,
        processAs: ItemType.Seed,
        crafters: 1,
        targetTime: 0,
        isActive: true,
      } as ProcessorSetting,
    ],
    [
      'carrot-Base' satisfies ICropName,
      {
        cropType: 'carrot',
        isStar: true,
        processAs: ItemType.Crop,
        crafters: 0,
        targetTime: 0,
        isActive: true,
      } as ProcessorSetting,
    ],
    [
      'potato-Base' satisfies ICropName,
      {
        cropType: 'potato',
        isStar: true,
        processAs: ItemType.Crop,
        crafters: 0,
        targetTime: 0,
        isActive: true,
      } as ProcessorSetting,
    ],
    [
      'potato-Star' satisfies ICropName,
      {
        cropType: 'potato',
        isStar: true,
        processAs: ItemType.Preserve,
        crafters: 1,
        targetTime: 0,
        isActive: true,
      } as ProcessorSetting,
    ],
    [
      'blueberry-Base' satisfies ICropName,
      {
        cropType: 'blueberry',
        isStar: true,
        processAs: ItemType.Crop,
        crafters: 0,
        targetTime: 0,
        isActive: true,
      } as ProcessorSetting,
    ],
    [
      'blueberry-Star' satisfies ICropName,
      {
        cropType: 'blueberry',
        isStar: true,
        processAs: ItemType.Crop,
        crafters: 0,
        targetTime: 0,
        isActive: true,
      } as ProcessorSetting,
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

  private _inventory = new Map<string, IInventoryItem>()

  private _highestCraftingTime = 0

  get output(): ProcessorOutput {
    return this._output
  }

  get highestCraftingTime(): number {
    return this._highestCraftingTime
  }

  get inventory(): Map<string, IInventoryItem> {
    return this._inventory
  }

  reset() {
    this._inventory = new Map<string, IInventoryItem>()
    this._highestCraftingTime = 0
    this._inventory = new Map<string, IInventoryItem>()
  }

  process(harvestData: Readonly<ITotalHarvest> = TEST_TOTAL_HARVEST, processorSettings: Readonly<ProcessorSettings> = TEST_SETTINGS): void {
    this.reset()

    const output: ProcessorOutput = {
      crops: new Map(),
      seeds: new Map(),
      preserves: new Map(),
      replantSeeds: Object.assign({}, harvestData.seedsRemainder),
    }

    const inventory = new Map<string, IInventoryItem>()

    const settings = Object.assign({}, processorSettings)

    const cropData = this.calculateSettings(harvestData, settings)

    if (cropData.size === 0) {
      this._output = output
      return
    }

    for (const [cropName, processData] of cropData) {
      const cropData = harvestData.crops.get(cropName)

      const crop = getCropFromType(cropData?.cropType || CropType.None)

      // If not set to process, just add to crops
      if (processData.processType === ItemType.Crop) {
        const count = cropData?.totalWithDeductions || 0

        if (count > 0) {
          output.crops.set(cropName, {
            count,
            itemType: ItemType.Crop,
            cropType: crop?.type || CropType.None,
          })

          if (inventory.has(cropName)) {
            inventory.get(cropName)!.count += count
          }
          else {
            const baseGoldValue = cropData?.isStar ? crop?.goldValues.cropStar : crop?.goldValues.crop

            inventory.set(cropName, {
              count,
              img: {
                src: crop?.image || '',
                alt: crop?.type || 'Crop',
              },
              isStar: cropData?.isStar || false,
              baseGoldValue: baseGoldValue || 0,
              cropType: crop?.type || CropType.None,
              itemType: ItemType.Crop,
            })
          }
        }
      }

      // Final processor behaviour goes here
      else if (processData.processType === ItemType.Seed || processData.processType === ItemType.Preserve) {
        const cropCount = cropData?.totalWithDeductions || 0

        if (cropCount === 0)
          continue

        if (!crop)
          throw new Error(`Missing crop data for crop: ${cropName}`)

        const processType = processData.processType === ItemType.Seed ? 'seeds' : 'preserves'
        const outputId = `${cropName}-${processType}`
        const cycleData = harvestData.cycleData.get(cropName)
        const isStar = cropName.includes('-Star')

        console.log(cycleData)

        const {
          count,
          remainder,
          minutesSpentProcessingTotal,
          minutesSpentProcessingDivided: minutesProcessedEffective,
        } = processBatch({
          cropCount,
          crafterCount: processData.craftersToUse,
          cropConversionInfo: crop.conversionInfo,
          processInto: processData.processType,
        })
        // TODO: Now move this to per cycle and multiply

        // console.log(`Crop ${crop.type}`, count, remainder, processData.processType, minutesProcessedEffective)

        if (minutesProcessedEffective > this._highestCraftingTime)
          this._highestCraftingTime = minutesProcessedEffective

        output[processType].set(cropName, {
          count,
          minutesProcessedTotal: minutesSpentProcessingTotal,
          minutesProcessedEffective,
          crafterCount: processData.craftersToUse,
          itemType: processData.processType,
          cropType: crop.type,
        })

        if (inventory.has(outputId)) {
          const item = inventory.get(outputId) as IInventoryItem
          item.count += count
          inventory.set(outputId, item)
        }
        else {
          const imageSrc = processData.processType === ItemType.Seed ? crop.seedImage : crop.preserveImage
          const imageAlt = processData.processType === ItemType.Seed ? `${crop.type} Seed` : `${crop.type} Preserve`
          const baseGoldValue = processData.processType === ItemType.Seed
            ? (cropData?.isStar ? crop.goldValues.seedStar : crop.goldValues.seed)
            : (cropData?.isStar ? crop.goldValues.preserveStar : crop.goldValues.preserve)

          inventory.set(outputId, {
            count,
            img: {
              src: imageSrc,
              alt: imageAlt,
            },
            isStar: cropData?.isStar || false,
            baseGoldValue,
            cropType: crop.type,
            itemType: processData.processType,
          })
        }

        if (remainder > 0) {
          output.crops.set(cropName, {
            count: remainder,
            itemType: ItemType.Crop,
            cropType: crop.type,
          })

          if (inventory.has(cropName)) {
            const item = inventory.get(cropName) as IInventoryItem
            item.count += remainder
            inventory.set(cropName, item)
          }
          else {
            inventory.set(cropName, {
              count: remainder,
              img: {
                src: crop.image,
                alt: crop.type,
              },
              isStar: cropData?.isStar || false,
              baseGoldValue: (cropData?.isStar ? crop.goldValues.cropStar : crop.goldValues.crop),
              cropType: crop.type,
              itemType: ItemType.Crop,
            })
          }
        }
      }
    }

    this._inventory = inventory
    this._output = output
  }

  /**
   *  Function is responsible for figuring out how many crafters to assign to each crop group.
   *  This should be manual but can be set to auto (in the future).
   *
   * @param totalHarvest - Harvest data
   * @param settings - Processor settings
   * @returns
   */
  private calculateSettings(totalHarvest: Readonly<ITotalHarvest>, settings: Readonly<ProcessorSettings>): TCropProcessData {
    const cropData = new Map<ICropNameWithGrowthDiff, {
      totalProcessMinutes: number
      processType: ItemType.Crop | ItemType.Seed | ItemType.Preserve
      craftersToUse: number
      conversionsToMake: number
    }>()

    for (const [cropName, cropYield] of totalHarvest.crops) {
      const crop = getCropFromType(cropYield.cropType)
      if (!crop)
        throw new Error(`Missing crop data for crop: ${cropName}`)

      const setting = settings.cropSettings.get(cropName) || {
        cropType: cropYield.cropType,
        isStar: cropYield.isStar,
        processAs: ItemType.Crop,
        crafters: 0,
        targetTime: 0,
        isActive: false,
      }

      if (!setting)
        throw new Error(`Missing setting for crop: ${cropName}`)

      const processSetting = setting.processAs

      // Gets crops out of the way since it won't be processed
      if (processSetting === ItemType.Crop) {
        cropData.set(cropName, {
          totalProcessMinutes: 0,
          processType: ItemType.Crop,
          craftersToUse: 0,
          conversionsToMake: 0,
        })

        continue
      }

      const conversionInfo = crop.conversionInfo

      if (!conversionInfo)
        throw new Error(`Missing conversion info for crop: ${cropName}`)

      const cropsPerConversion = (processSetting === ItemType.Seed) ? conversionInfo.cropsPerSeed : conversionInfo.cropsPerPreserve

      // ? Consider removing given we're currently not using these
      const conversionTime = (processSetting === ItemType.Seed) ? conversionInfo.seedProcessMinutes : conversionInfo.preserveProcessMinutes
      const conversionsToMake = Math.floor(cropYield.totalWithDeductions / cropsPerConversion)

      const totalProcessMinutes = conversionsToMake * conversionTime

      cropData.set(cropName, {
        totalProcessMinutes,
        processType: processSetting,
        craftersToUse: setting.crafters,
        conversionsToMake,
      })
    }

    return cropData
  }
}

interface IProcessedBatch {
  count: number
  remainder: number
  minutesSpentProcessingDivided: number
  minutesSpentProcessingTotal: number
}

interface IProcessBatchInput {
  cropCount: number
  crafterCount: number
  cropConversionInfo: ICropConversions
  processInto: ItemType.Seed | ItemType.Preserve
}

/**
 * Processes a single batch
 * @param processBatchArgs
 * @returns
 */
function processBatch(processBatchArgs: IProcessBatchInput): IProcessedBatch {
  const { cropCount, crafterCount, cropConversionInfo, processInto } = processBatchArgs

  let minutesPerConversion = 0
  let cropsPerConversion = 0
  let producePerConversion = 0

  if (processInto === ItemType.Seed) {
    minutesPerConversion = cropConversionInfo.seedProcessMinutes
    cropsPerConversion = cropConversionInfo.cropsPerSeed
    producePerConversion = cropConversionInfo.seedsPerConversion
  }
  else if (processInto === ItemType.Preserve) {
    minutesPerConversion = cropConversionInfo.preserveProcessMinutes
    cropsPerConversion = cropConversionInfo.cropsPerPreserve
    producePerConversion = 1
  }
  else {
    throw new Error('Neither SEED nor PRESERVE was chosen as the processInto option')
  }

  const conversionsToMake = Math.floor(cropCount / cropsPerConversion)
  const remainder = cropCount % cropsPerConversion
  const count = conversionsToMake * producePerConversion

  const minutesSpentProcessingTotal = conversionsToMake * minutesPerConversion

  const minProcessesPerCrafter = Math.floor(conversionsToMake / crafterCount)
  const minProcessesPerCrafterRemainder = conversionsToMake % crafterCount
  const crafterProcesses: number[] = []

  for (let i = 0; i < crafterCount; i++) {
    const bonus = (i < minProcessesPerCrafterRemainder) ? 1 : 0

    crafterProcesses.push(minProcessesPerCrafter + bonus)
  }

  const minutesSpentProcessingDivided = crafterProcesses[0] * minutesPerConversion || -1

  // ? account for going over the required slots (max is 30)

  return {
    count,
    remainder,
    minutesSpentProcessingTotal,
    minutesSpentProcessingDivided,
  }
}

interface ICyclePhaseProcessData {
  totalProduceCount: number
  remainder: number
  crafterData: {
    cropsInsertedCount: number
    canFinishBeforeNextHarvest: boolean
    processingTimeMinutes: number
    processesDone: number
  }[]
  canFinishBeforeNextHarvest: boolean
  idleTimeMins: number
  excessTimeMins: number
  totalTimeMins: number
  lowestCrafterTimeMinutes: number
  highestCrafterTimeMinutes: number
}

interface IProcessBatchInput_v2 {
  crop: Crop
  isStar: boolean
  cycleData: ICropHarvestCycle
  crafterCount: number
  cropConversionInfo: ICropConversions
  processInto: ItemType.Seed | ItemType.Preserve
}

function processBatch_v2(processBatchArgs: IProcessBatchInput_v2) {
  const { crop, isStar, cycleData, crafterCount, cropConversionInfo, processInto } = processBatchArgs
  const crafterData = [] as ICyclePhaseProcessData['crafterData']

  let minutesPerConversion = 0
  let cropsPerConversion = 0
  let producePerConversion = 0

  if (processInto === ItemType.Seed) {
    minutesPerConversion = cropConversionInfo.seedProcessMinutes
    cropsPerConversion = cropConversionInfo.cropsPerSeed
    producePerConversion = cropConversionInfo.seedsPerConversion
  }
  else if (processInto === ItemType.Preserve) {
    minutesPerConversion = cropConversionInfo.preserveProcessMinutes
    cropsPerConversion = cropConversionInfo.cropsPerPreserve
    producePerConversion = 1
  }
  else {
    throw new Error('Neither SEED nor PRESERVE was chosen as the processInto option')
  }

  const baseOrStar = (isStar ? 'star' : 'base')
  const phases = cycleData.phases

  const hasGrowthDiffToCalculate = ((cycleData.phases.length > 1)
  && phases[0].yield[baseOrStar].totalWithDeductions !== phases.at(-1)?.yield[baseOrStar].totalWithDeductions)

  // * Normal in this case = a harvest that hasn't factored in re-harvests
  const normalCropCount = phases[0].yield[baseOrStar].totalWithDeductions
  const normalConversionsToMake = Math.floor(normalCropCount / cropsPerConversion)
  const normalConversionsRemainder = normalCropCount % cropsPerConversion

  const normalPhasesToCalculate = hasGrowthDiffToCalculate ? (phases.length - 1) : phases.length

  for (let i = 0; i < normalPhasesToCalculate; i++) {

  }

  // * Deducted crop count is the average amount of crops when re-harvests are considered
  const deductedCropCount = phases.at(-1)?.yield[baseOrStar].totalWithDeductions || 0
  const deductedConversionsToMake = Math.floor(deductedCropCount / cropsPerConversion)
  const deductedConversionsRemainder = deductedCropCount % cropsPerConversion

  return {

  }
}
