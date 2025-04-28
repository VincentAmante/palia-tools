import { getCropFromType } from '../cropList'
import type { Crop } from '../imports'
import { CropType } from '../imports'
import { ItemType } from '../utils/garden-helpers'
import type { CropItem, ICropHarvestCycle, ICropNameWithGrowthDiff, IInventoryItem, ISeedTracker, ITotalHarvest } from '../utils/garden-helpers'
import type { ICropConversions } from './crop'

export interface ProcessorOutput {
  crops: Map<ICropNameWithGrowthDiff, Pick<ProcessOutputInfo, 'count' | 'cropType' | 'itemType'>>
  seeds: Map<ICropNameWithGrowthDiff, ProcessOutputInfo>
  preserves: Map<ICropNameWithGrowthDiff, ProcessOutputInfo>
  replantSeeds: Map<ICropNameWithGrowthDiff, ISeedTracker>
  detailedProcessingInfo: Map<ICropNameWithGrowthDiff, IProcessCycleData[]> // Added to store detailed cycle data
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
  count: number
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
    detailedProcessingInfo: new Map(), // Initialize new map
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
    this._output.detailedProcessingInfo = new Map() // Reset detailed info
  }

  process(harvestData: Readonly<ITotalHarvest>, processorSettings: Readonly<ProcessorSettings>): void {
    this.process_v2(harvestData, processorSettings)
    return

    this.reset()

    const output: ProcessorOutput = {
      crops: new Map(),
      seeds: new Map(),
      preserves: new Map(),
      replantSeeds: Object.assign({}, harvestData.seedsRemainder),
      detailedProcessingInfo: new Map(), // Initialize in output object
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

        if (!cycleData)
          return

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

  process_v2(harvestData: Readonly<ITotalHarvest>, processorSettings: Readonly<ProcessorSettings>) {
    this.reset()

    const output: ProcessorOutput = {
      crops: new Map(),
      seeds: new Map(),
      preserves: new Map(),
      replantSeeds: Object.assign({}, harvestData.seedsRemainder),
      detailedProcessingInfo: new Map(),

    }

    const inventory = new Map<string, IInventoryItem>()

    this._settings = Object.assign({}, processorSettings)
    const settings = this._settings

    const cropData = this.calculateSettings(harvestData, settings)

    if (cropData.size === 0) {
      this._output = output
      // Ensure inventory is also set if returning early
      this._inventory = inventory
      return // Added return to prevent further processing
    }

    for (const [cropName, processData] of cropData) {
      const cropHarvestData = harvestData.crops.get(cropName)

      const crop = getCropFromType(cropHarvestData?.cropType || CropType.None)

      // If not set to process, just add to crops
      if (processData.processType === ItemType.Crop) {
        const count = cropHarvestData?.totalWithDeductions || 0

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
            const baseGoldValue = cropHarvestData?.isStar ? crop?.goldValues.cropStar : crop?.goldValues.crop
            inventory.set(cropName, {
              count,
              img: {
                src: crop?.image || '',
                alt: crop?.type || 'Crop',
              },
              isStar: cropHarvestData?.isStar || false,
              baseGoldValue: baseGoldValue || 0,
              cropType: crop?.type || CropType.None,
              itemType: ItemType.Crop,
            })
          }
        }
      }
      else if (processData.processType === ItemType.Seed || processData.processType === ItemType.Preserve) {
        const cropCount = cropHarvestData?.totalWithDeductions || 0

        if (cropCount === 0)
          continue

        if (!crop)
          throw new Error(`Missing crop data for crop: ${cropName}`)

        const processType = processData.processType === ItemType.Seed ? 'seeds' : 'preserves'
        const outputId = `${cropName}-${processType}`
        const isStar = cropName.includes('-Star')

        const cycleData = harvestData.cycleData.get(cropName)
        if (!cycleData)
          continue

        const cycles = Math.floor(cycleData.totalHarvestsCount / cycleData.phases.length)
        const cyclesRemainder = cycleData.totalHarvestsCount % cycleData.phases.length

        // ? Should we make an incomplete cycle data to simulate remainders,
        // ? or do we use the calculations of one processCycle and modify the values to match

        // // TODO: Figure out how to multiply the data appropriately
        // // TODO: Add first harvest wait time, and subtract idle time from last harvest
        // TODO: Figure out where crafter cycle data should go

        // TODO: Try to figure out how idle time and excess time should interact with each other

        let totalProduceCount = 0
        let totalProcessMinutes = 0
        let longestProcessMinutes = 0 // This variable's accumulation logic needs review for cycle processing
        let goldGenerated = 0
        let firstHarvestDelayMinutes = 0

        let lastCycleData: IProcessCycleData | null = null
        const allCycleData: IProcessCycleData[] = [] // Array to store data for all cycles

        if (cycles > 0) {
          // Process full cycles
          for (let i = 0; i < cycles; i++) {
            const cycleOutput = processCycle({
              cycleData,
              isStar,
              crafterCount: processData.craftersToUse,
              cropConversionInfo: crop.conversionInfo,
              processInto: processData.processType,
              goldValues: crop.goldValues,
            })

            console.log(cycleOutput)

            totalProduceCount += cycleOutput.totalProduceCount
            totalProcessMinutes += cycleOutput.totalProcessMinutes
            // Accumulate longest process time carefully - handled later by _highestCraftingTime
            // longestProcessMinutes += cycleOutput.longestProcessMinutes // Simple sum is likely incorrect
            goldGenerated += cycleOutput.goldGenerated

            if (i === 0) // Only add first harvest delay once
              firstHarvestDelayMinutes += cycleOutput.firstHarvestDelayMinutes

            lastCycleData = cycleOutput
            allCycleData.push(cycleOutput) // Store data for this cycle
          }
        }

        if (cyclesRemainder > 0) {
          const cycleRemainderOutput = processCycle({
            cycleData,
            isStar,
            crafterCount: processData.craftersToUse,
            cropConversionInfo: crop.conversionInfo,
            processInto: processData.processType,
            goldValues: crop.goldValues,
          })

          totalProduceCount += cycleRemainderOutput.totalProduceCount * cycles
          totalProcessMinutes += cycleRemainderOutput.totalProcessMinutes * cycles
          longestProcessMinutes += cycleRemainderOutput.longestProcessMinutes * cycles
          goldGenerated += cycleRemainderOutput.goldGenerated * cycles

          firstHarvestDelayMinutes += cycleRemainderOutput.firstHarvestDelayMinutes

          lastCycleData = cycleRemainderOutput
        }

        if (cyclesRemainder > 0) {
          const cycleRemainderOutput = processCycle({
            cycleData,
            isStar,
            crafterCount: processData.craftersToUse,
            cropConversionInfo: crop.conversionInfo,
            processInto: processData.processType,
            goldValues: crop.goldValues,
          }, cyclesRemainder)

          totalProduceCount += cycleRemainderOutput.totalProduceCount
          totalProcessMinutes += cycleRemainderOutput.totalProcessMinutes
          longestProcessMinutes += cycleRemainderOutput.longestProcessMinutes
          goldGenerated += cycleRemainderOutput.goldGenerated

          // In case there was no completed cycle
          if (firstHarvestDelayMinutes <= 0)
            firstHarvestDelayMinutes += cycleRemainderOutput.firstHarvestDelayMinutes

          lastCycleData = cycleRemainderOutput
          allCycleData.push(cycleRemainderOutput) // Store data for the remainder cycle
        }

        // --- Recalculate effective processing time based on all cycles ---
        // This part needs careful thought. The *longest* path determines the total time.
        // Simply summing might overestimate if crafters finish early in some cycles.
        // The existing _highestCraftingTime calculation might be sufficient if it correctly
        // identifies the bottleneck across all processed crops. Let's assume it does for now.

        // Example: Update highestCraftingTime based on the *last* cycle's effective time + delays
        if (lastCycleData) {
          // Rough calculation - needs refinement based on how cycles interact
          const effectiveTime = firstHarvestDelayMinutes + allCycleData.reduce((sum, cycle) => {
            // Summing the longest phase of each cycle might be closer?
            // Or find the absolute longest phase across all cycles? Needs careful design.
            // Let's use the existing logic for now and refine if needed.
            const cycleLongestPhase = Math.max(...cycle.cycleCrafterData.map(p => p.longestProcessMinutesNoIdle))
            return sum + cycleLongestPhase
          }, 0)

          // Subtract idle time from the very last phase of the last cycle
          const lastPhaseData = lastCycleData.cycleCrafterData.at(-1)
          const lastPhaseIdleTime = lastPhaseData ? (lastPhaseData.longestProcessMinutes - lastPhaseData.longestProcessMinutesNoIdle) : 0
          const finalEffectiveTime = Math.max(0, effectiveTime - lastPhaseIdleTime)

          if (finalEffectiveTime > this._highestCraftingTime)
            this._highestCraftingTime = finalEffectiveTime
        }
        // --- End Recalculation ---

        // Store the detailed cycle data in the output
        output.detailedProcessingInfo.set(cropName, allCycleData)

        // console.log(`longestProcessMinutes: ${longestProcessMinutes}`) // This variable is no longer directly used for final time

        // Adds a delay caused by the first harvest
        // longestProcessMinutes += firstHarvestDelayMinutes // Handled in the new effectiveTime calculation

        // console.log(`longestProcessMinutes with first Harvest Delay: ${longestProcessMinutes}`)

        // if (!lastCycleData) // Check moved into the recalculation block
        //   throw new Error('No last cycle data')
        // Subtracts last cycle's idle time
        // longestProcessMinutes -= ( // Handled in the new effectiveTime calculation
        //   lastCycleData.cycleCrafterData.at(-1)!.longestProcessMinutes
        //   -= lastCycleData.cycleCrafterData.at(-1)!.longestProcessMinutesNoIdle
        // )

        // console.log(`longestProcessMinutes with idle time subtracted: ${longestProcessMinutes}`) // This calculation needs review

        // console.log(`gold generated: ${goldGenerated}`)
        // console.log(`average: ${goldGenerated / (this._highestCraftingTime / 60)}`) // Use updated highestCraftingTime
      }
    }

    this._inventory = inventory
    this._output = output
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

interface IProcessHarvestData {
  totalProduceCount: number
  remainder: number
  crafterData: {
    cropsInsertedCount: number
    canFinishBeforeNextHarvest: boolean
    processTimeMinutes: number
    processesDone: number
    idleTimeMinutes: number
    excessTimeMinutes: number
  }[]
  canFinishBeforeNextHarvest: boolean
  totalProcessMinutes: number
  lowestCrafterTimeMinutes: number
  highestCrafterTimeMinutes: number
  longestProcessMinutes: number
  longestProcessMinutesNoIdle: number
  goldGenerated: number
}

interface IProcessHarvestArgs {
  qualityId: 'base' | 'star'
  cycleData: ICropHarvestCycle
  currentPhaseIndex: number
  crafterCount: number
  cropConversionInfo: ICropConversions
  processInto: ItemType.Seed | ItemType.Preserve
  minutesPerConversion: number
  cropsPerConversion: number
  producePerConversion: number
  produceGoldValue: number
}

/**
 * Processes a single harvest
 * @param processHarvestArgs
 * @param processHarvestArgs.qualityId - Whether crop is base or star
 * @param processHarvestArgs.cycleData - Information regarding a crop's harvest timings
 * @param processHarvestArgs.currentPhaseIndex - Which phase is currently being harvested
 * @param processHarvestArgs.crafterCount - How many crafters are allocated to this crop
 * @param processHarvestArgs.minutesPerConversion - How many minutes is required per process
 * @param processHarvestArgs.cropsPerConversion - Crops consumed per process
 * @param processHarvestArgs.producePerConversion - Amount created from each process
 * @param processHarvestArgs.produceGoldValue - Value of each produce
 *
 *
 * @returns totalProduceCount
 */
function processHarvest(processHarvestArgs: IProcessHarvestArgs): IProcessHarvestData {
  const {
    qualityId,
    cycleData,
    currentPhaseIndex,
    crafterCount,
    minutesPerConversion,
    cropsPerConversion,
    producePerConversion,
    produceGoldValue,
  } = processHarvestArgs
  const crafterData = [] as IProcessHarvestData['crafterData']

  // const phases = cycleData.phases
  const phaseData = cycleData.phases[currentPhaseIndex]

  const cropCount = phaseData.yield[qualityId].totalWithDeductions
  const conversionsToMake = Math.floor(cropCount / cropsPerConversion)
  const conversionsRemainder = (cropCount / cropsPerConversion) - conversionsToMake
  const conversionsRemainderInCrops = cropCount % cropsPerConversion

  const conversionsDivided = Math.floor(conversionsToMake / crafterCount)
  const conversionsDividedRemainder = (conversionsToMake % crafterCount + conversionsRemainder)

  const totalProduceCount = (conversionsToMake + conversionsRemainder) * producePerConversion
  const goldGenerated = totalProduceCount * produceGoldValue

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
    const processTimeMinutes = conversionsDivided * minutesPerConversion
    const processesDone = conversionsDivided
    const canFinishBeforeNextHarvest = (processTimeMinutes / 60) > hoursToNextPhase

    crafterData.push({
      cropsInsertedCount,
      processTimeMinutes,
      canFinishBeforeNextHarvest,
      processesDone,
      idleTimeMinutes: 0,
      excessTimeMinutes: 0,
    })
  }

  // Account for remainders
  if (conversionsDividedRemainder > 0) {
    let crafterIndex = 0

    for (let remainingProcesses = conversionsDividedRemainder; remainingProcesses > 0; remainingProcesses--) {
      if (remainingProcesses < 1 && remainingProcesses > 0) {
        // Partial remainder
        crafterData[crafterIndex].processTimeMinutes += minutesPerConversion * conversionsRemainder
        crafterData[crafterIndex].cropsInsertedCount += conversionsRemainderInCrops
        crafterData[crafterIndex].processesDone += conversionsRemainder
      }
      else {
        crafterData[crafterIndex].processTimeMinutes += minutesPerConversion
        crafterData[crafterIndex].cropsInsertedCount += cropsPerConversion
        crafterData[crafterIndex].processesDone++
      }

      crafterData[crafterIndex].canFinishBeforeNextHarvest = ((crafterData[crafterIndex].processTimeMinutes / 60) > hoursToNextPhase)

      crafterIndex++
      if (crafterIndex > (crafterData.length - 1))
        crafterIndex = 0
    }
  }

  let canFinishBeforeNextHarvest = true
  let totalProcessMinutes = 0
  let lowestCrafterTimeMinutes = Number.POSITIVE_INFINITY
  let highestCrafterTimeMinutes = Number.NEGATIVE_INFINITY

  let longestProcessMinutes = Number.NEGATIVE_INFINITY
  let longestProcessMinutesNoIdle = Number.NEGATIVE_INFINITY

  for (const crafter of crafterData) {
    if (!crafter.canFinishBeforeNextHarvest)
      canFinishBeforeNextHarvest = false

    crafter.idleTimeMinutes = Math.max(0, (hoursToNextPhase * 60) - crafter.processTimeMinutes)
    crafter.excessTimeMinutes = Math.max(0, crafter.processTimeMinutes - (hoursToNextPhase * 60))
    totalProcessMinutes += crafter.processTimeMinutes

    if (crafter.processTimeMinutes < lowestCrafterTimeMinutes)
      lowestCrafterTimeMinutes = crafter.processTimeMinutes
    if (crafter.processTimeMinutes > highestCrafterTimeMinutes)
      highestCrafterTimeMinutes = crafter.processTimeMinutes

    const crafterLongestProcessMinutes = Math.max((hoursToNextPhase * 60), crafter.processTimeMinutes)

    if (crafterLongestProcessMinutes > longestProcessMinutes)
      longestProcessMinutes = crafterLongestProcessMinutes

    if (crafter.processTimeMinutes > longestProcessMinutesNoIdle)
      longestProcessMinutesNoIdle = crafter.processTimeMinutes
  }

  return {
    totalProduceCount,
    remainder: conversionsRemainderInCrops,
    crafterData,
    canFinishBeforeNextHarvest,
    totalProcessMinutes,
    lowestCrafterTimeMinutes,
    highestCrafterTimeMinutes,
    goldGenerated,
    longestProcessMinutes,
    longestProcessMinutesNoIdle,
  }
}

interface IProcessCycleArgs {
  goldValues: Crop['goldValues']
  cycleData: ICropHarvestCycle
  isStar: boolean
  crafterCount: number
  cropConversionInfo: ICropConversions
  processInto: ItemType.Seed | ItemType.Preserve
}

// interface IProcessHarvestData {
//   totalProduceCount: number
//   remainder: number
//   crafterData: {
//     cropsInsertedCount: number
//     canFinishBeforeNextHarvest: boolean
//     processTimeMinutes: number
//     processesDone: number
//     idleTimeMinutes: number
//     excessTimeMinutes: number
//   }[]
//   canFinishBeforeNextHarvest: boolean
//   totalProcessMinutes: number
//   lowestCrafterTimeMinutes: number
//   longestProcessMinutes: number
// }

interface IProcessCycleData {
  totalProduceCount: number
  // crafterData: {
  //   cropsInsertedCount: number
  //   canFinishBeforeNextHarvest: boolean
  //   processTimeMinutes: number
  //   processesDone: number
  //   idleTimeMinutes: number
  //   excessTimeMinutes: number
  // }[][]
  cycleCrafterData: {
    canFinishBeforeNextHarvest: boolean
    longestProcessMinutes: number
    crafterData: IProcessHarvestData['crafterData']
    longestProcessMinutesNoIdle: number
  }[]
  totalProcessMinutes: number
  longestProcessMinutes: number
  firstHarvestDelayMinutes: number
  goldGenerated: number
}

/**
 *
 * @param processCycleArgs
 * @param phasesOverride
 * @returns
 */
function processCycle(processCycleArgs: IProcessCycleArgs, phasesOverride = 0): IProcessCycleData {
  const { goldValues, isStar, cropConversionInfo, processInto, cycleData, crafterCount } = processCycleArgs
  const qualityId = (isStar ? 'star' : 'base')

  let minutesPerConversion = 0
  let cropsPerConversion = 0
  let producePerConversion = 0
  let produceGoldValue = 0
  const firstHarvestDelayMinutes = (cycleData.phases[0].phaseLength * 60)

  if (processInto === ItemType.Seed) {
    minutesPerConversion = cropConversionInfo.seedProcessMinutes
    cropsPerConversion = cropConversionInfo.cropsPerSeed
    producePerConversion = cropConversionInfo.seedsPerConversion
    produceGoldValue = (isStar) ? goldValues.seedStar : goldValues.seed
  }
  else if (processInto === ItemType.Preserve) {
    minutesPerConversion = cropConversionInfo.preserveProcessMinutes
    cropsPerConversion = cropConversionInfo.cropsPerPreserve
    producePerConversion = 1
    produceGoldValue = (isStar) ? goldValues.preserveStar : goldValues.preserve
  }
  else {
    throw new Error('Neither SEED nor PRESERVE was chosen as the processInto option')
  }

  // For if a multi-harvest crop has a difference in the last harvest due to replanting deductions
  // const hasReplantDeductionDiff = (cycleData.phases.length > 1)
  //   // So far, there's no situation where anything but the last harvest has a different yield
  //   && cycleData.phases.at(0)!.yield[qualityId].totalWithDeductions
  //   !== cycleData.phases.at(-1)!.yield[qualityId].totalWithDeductions

  const phasesToCalculate = (phasesOverride > 0)
    ? phasesOverride
    : cycleData.phases.length

  let totalProduceCount = 0
  let canFinishBeforeNextHarvest = true
  let totalProcessMinutes = 0
  let longestProcessMinutes = 0
  const cycleCrafterData = [] as {
    canFinishBeforeNextHarvest: boolean
    longestProcessMinutes: number
    crafterData: IProcessHarvestData['crafterData']
    longestProcessMinutesNoIdle: number
  }[]
  let goldGenerated = 0

  for (let i = 0; i < phasesToCalculate; i++) {
    // TODO: Figure out how to accurately subtract excess time from idle time
    const {
      totalProduceCount: harvestTotalProduceCount,
      crafterData,
      canFinishBeforeNextHarvest: harvestCanFinishBeforeHarvest,
      totalProcessMinutes: harvestTotalProcessMinutes,
      longestProcessMinutes: harvestLongestProcessMinutes,
      goldGenerated: harvestGoldGenerated,
      longestProcessMinutesNoIdle,
    } = processHarvest({
      qualityId,
      cycleData,
      currentPhaseIndex: i,
      crafterCount,
      cropConversionInfo,
      processInto,
      minutesPerConversion,
      cropsPerConversion,
      producePerConversion,
      produceGoldValue,
    })

    totalProduceCount += harvestTotalProduceCount
    if (!harvestCanFinishBeforeHarvest)
      canFinishBeforeNextHarvest = false

    totalProcessMinutes += harvestTotalProcessMinutes
    longestProcessMinutes += harvestLongestProcessMinutes

    cycleCrafterData.push({
      canFinishBeforeNextHarvest,
      longestProcessMinutes: harvestLongestProcessMinutes,
      crafterData,
      longestProcessMinutesNoIdle,
    })

    goldGenerated += harvestGoldGenerated
  }

  return {
    totalProduceCount,
    cycleCrafterData,
    totalProcessMinutes,
    longestProcessMinutes,
    goldGenerated,
    firstHarvestDelayMinutes,
  }
}
