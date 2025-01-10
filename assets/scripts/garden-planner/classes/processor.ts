import { getCropFromType } from '../cropList'
import { CropType } from '../imports'
import { ItemType } from '../utils/garden-helpers'
import type { CropItem, ICropHarvestCycle, ICropNameWithGrowthDiff, IInventoryItem, ISeedTracker, ITotalHarvest } from '../utils/garden-helpers'
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
  hasPreserve: boolean
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

export default class Processor {
  private _output: ProcessorOutput = {
    crops: new Map(),
    seeds: new Map(),
    preserves: new Map(),
    replantSeeds: new Map(),
  }

  private _inventory = new Map<string, IInventoryItem>()

  private _seedCollectors = new Map<string, IInventoryItem>()
  private _preserveJars = new Map<string, IInventoryItem>()
  private _highestCraftingTime = 0

  private _settings: ProcessorSettings = {
    cropSettings: new Map() as Map<ICropNameWithGrowthDiff, ProcessorSetting>,
    crafterSetting: 0,
  }

  private _seedCollectorsCount = 0
  private _preserveJarsCount = 0

  get output(): ProcessorOutput {
    return this._output
  }

  get highestCraftingTime(): number {
    return this._highestCraftingTime
  }

  get inventory(): Map<string, IInventoryItem> {
    return this._inventory
  }

  get seedCollectors(): Map<string, IInventoryItem> {
    return this._seedCollectors
  }

  get preserveJars(): Map<string, IInventoryItem> {
    return this._preserveJars
  }

  get seedCollectorsCount(): number {
    return this._seedCollectorsCount
  }

  get preserveJarsCount(): number {
    return this._preserveJarsCount
  }

  reset() {
    this._inventory = new Map<string, IInventoryItem>()
    this._highestCraftingTime = 0
    this._inventory = new Map<string, IInventoryItem>()
    this._settings = {
      cropSettings: new Map() as Map<ICropNameWithGrowthDiff, ProcessorSetting>,
      crafterSetting: 0,
    }
    this._seedCollectors = new Map<string, IInventoryItem>()
    this._preserveJars = new Map<string, IInventoryItem>()
    this._seedCollectorsCount = 0
    this._preserveJarsCount = 0
  }

  process(harvestData: Readonly<ITotalHarvest>, processorSettings: Readonly<ProcessorSettings>): void {
    this.reset()

    const output: ProcessorOutput = {
      crops: new Map(),
      seeds: new Map(),
      preserves: new Map(),
      replantSeeds: Object.assign({}, harvestData.seedsRemainder),
    }

    const inventory = new Map<string, IInventoryItem>()

    this._settings = Object.assign({}, processorSettings)
    const settings = this._settings

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

      if (processSetting === ItemType.Seed) {
        this._seedCollectors.set(cropName, {
          count: setting.crafters,
          img: {
            src: crop.cropImage,
            alt: crop.type,
          },
          isStar: cropYield.isStar,
          baseGoldValue: 0,
          itemType: ItemType.Crop,
          cropType: crop.type,
        })
        this._seedCollectorsCount += setting.crafters
      }
      else {
        this._preserveJars.set(cropName, {
          count: setting.crafters,
          img: {
            src: crop.cropImage,
            alt: crop.type,
          },
          isStar: cropYield.isStar,
          baseGoldValue: 0,
          itemType: ItemType.Crop,
          cropType: crop.type,
        })
        this._preserveJarsCount += setting.crafters
      }

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
    idleTimeMins: number
    excessTimeMins: number
  }[]
  canFinishBeforeNextHarvest: boolean
  totalProcessMinutes: number
  lowestCrafterTimeMinutes: number
  highestCrafterTimeMinutes: number
}

interface IProcessHarvestArgs {
  isStar: boolean
  cycleData: ICropHarvestCycle
  currentPhaseIndex: number
  crafterCount: number
  cropConversionInfo: ICropConversions
  processInto: ItemType.Seed | ItemType.Preserve
  minutesPerConversion: number
  cropsPerConversion: number
  producePerConversion: number
}

/**
 * Processes a single harvest
 * @param processHarvestArgs - Necessary details to process a harvest
 * @returns
 */
function processHarvest(processHarvestArgs: IProcessHarvestArgs): ICyclePhaseProcessData {
  const {
    isStar,
    cycleData,
    currentPhaseIndex,
    crafterCount,
    cropConversionInfo,
    processInto,
    minutesPerConversion,
    cropsPerConversion,
    producePerConversion,
  } = processHarvestArgs
  const crafterData = [] as ICyclePhaseProcessData['crafterData']

  // let minutesPerConversion = 0
  // let cropsPerConversion = 0
  // let producePerConversion = 0

  // if (processInto === ItemType.Seed) {
  //   minutesPerConversion = cropConversionInfo.seedProcessMinutes
  //   cropsPerConversion = cropConversionInfo.cropsPerSeed
  //   producePerConversion = cropConversionInfo.seedsPerConversion
  // }
  // else if (processInto === ItemType.Preserve) {
  //   minutesPerConversion = cropConversionInfo.preserveProcessMinutes
  //   cropsPerConversion = cropConversionInfo.cropsPerPreserve
  //   producePerConversion = 1
  // }
  // else {
  //   throw new Error('Neither SEED nor PRESERVE was chosen as the processInto option')
  // }

  const baseOrStar = (isStar ? 'star' : 'base')
  // const phases = cycleData.phases
  const phaseData = cycleData.phases[currentPhaseIndex]

  const cropCount = phaseData.yield[baseOrStar].totalWithDeductions
  const conversionsToMake = Math.floor(cropCount / cropsPerConversion)
  const conversionsRemainder = (cropCount / cropsPerConversion) - conversionsToMake
  const conversionsRemainderInCrops = cropCount % cropsPerConversion

  const conversionsDivided = Math.floor(conversionsToMake / crafterCount)
  const conversionsDividedRemainder = (conversionsToMake % crafterCount + conversionsRemainder)

  const totalProduceCount = conversionsToMake * producePerConversion

  // Gets how much time there is till the next harvest
  let hoursToNextPhase = phaseData.phaseLength
  if (cycleData.phases.length > 1) {
    if (currentPhaseIndex === (cycleData.phases.length - 1))
      hoursToNextPhase = cycleData.phases[0].phaseLength
    else
      hoursToNextPhase = cycleData.phases[currentPhaseIndex + 1].phaseLength
  }

  for (let i = 0; i < crafterCount; i++) {
    const cropsInsertedCount = conversionsDivided * cropsPerConversion
    const processingTimeMinutes = conversionsDivided * minutesPerConversion
    const processesDone = conversionsDivided
    const canFinishBeforeNextHarvest = (processingTimeMinutes / 60) > hoursToNextPhase

    crafterData.push({
      cropsInsertedCount,
      processingTimeMinutes,
      canFinishBeforeNextHarvest,
      processesDone,
      idleTimeMins: 0,
      excessTimeMins: 0,
    })
  }

  // Account for remainders
  if (conversionsDividedRemainder > 0) {
    let crafterIndex = 0

    for (let remainingProcesses = conversionsDividedRemainder; remainingProcesses > 0; remainingProcesses--) {
      if (remainingProcesses < 1 && remainingProcesses > 0) {
        // Partial remainder
        crafterData[crafterIndex].processingTimeMinutes += minutesPerConversion * conversionsRemainder
        crafterData[crafterIndex].cropsInsertedCount += conversionsRemainderInCrops
        crafterData[crafterIndex].processesDone += conversionsRemainder
      }
      else {
        crafterData[crafterIndex].processingTimeMinutes += minutesPerConversion
        crafterData[crafterIndex].cropsInsertedCount += cropsPerConversion
        crafterData[crafterIndex].processesDone++
      }

      crafterData[crafterIndex].canFinishBeforeNextHarvest = ((crafterData[crafterIndex].processingTimeMinutes / 60) > hoursToNextPhase)

      crafterIndex++
      if (crafterIndex > (crafterData.length - 1))
        crafterIndex = 0
    }
  }

  let canFinishBeforeNextHarvest = true
  let totalProcessMinutes = 0
  let lowestCrafterTimeMinutes = Number.POSITIVE_INFINITY
  let highestCrafterTimeMinutes = Number.NEGATIVE_INFINITY
  for (const crafter of crafterData) {
    if (!crafter.canFinishBeforeNextHarvest)
      canFinishBeforeNextHarvest = false

    crafter.idleTimeMins = Math.min(0, (hoursToNextPhase * 60) / crafter.processingTimeMinutes)
    crafter.excessTimeMins = Math.min(0, crafter.processingTimeMinutes - (hoursToNextPhase * 60))
    totalProcessMinutes += crafter.processingTimeMinutes

    if (crafter.processingTimeMinutes < lowestCrafterTimeMinutes)
      lowestCrafterTimeMinutes = crafter.processingTimeMinutes
    else if (crafter.processingTimeMinutes > highestCrafterTimeMinutes)
      highestCrafterTimeMinutes = crafter.processingTimeMinutes
  }

  return {
    totalProduceCount,
    remainder: conversionsRemainderInCrops,
    crafterData,
    canFinishBeforeNextHarvest,
    totalProcessMinutes,
    lowestCrafterTimeMinutes,
    highestCrafterTimeMinutes,
  }
}

// Processes the entire cycle of a single crop group 
function processCycle() {

}
