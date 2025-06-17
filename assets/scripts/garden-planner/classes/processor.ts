import { getCropFromType } from '../cropList'
import type { Crop } from '../imports'
import { CropType } from '../imports'
import { ItemType } from '../utils/garden-helpers'
import type { CropItem, ICropHarvestCycle, ICropNameWithGrowthDiff, IInventoryItem, ISeedTracker, ITotalHarvest } from '../utils/garden-helpers'
import type { ICropConversions } from './crop'
import { parseCropId } from '../utils/garden-helpers'

// Interface for the final output of the processor
export interface ProcessorOutput {
  crops: Map<ICropNameWithGrowthDiff, Pick<ProcessOutputInfo, 'count' | 'cropType' | 'itemType'>>
  seeds: Map<ICropNameWithGrowthDiff, ProcessOutputInfo>
  preserves: Map<ICropNameWithGrowthDiff, ProcessOutputInfo>
  replantSeeds: Map<ICropNameWithGrowthDiff, ISeedTracker>
  detailedProcessingInfo: Map<ICropNameWithGrowthDiff, IDetailedProcessingInfo> // Stores detailed cycle data for analysis
}

export interface IDetailedProcessingInfo {
  cycleData: IProcessCycleData[],
  averageProcessMinutes: number,
  averageGoldGenerated: number,
  averageProduce: number,
  totalProcessMinutes: number
  effectiveProcessMinutes: number
}

// Interface for processing output information
export interface ProcessOutputInfo {
  count: number
  minutesProcessedTotal: number // Total minutes required to process all items
  minutesProcessedEffective: number // Effective processing time considering parallel processing
  crafterCount: number // Number of crafters used
  cropType: CropType
  itemType: ItemType
  // availableProcesses: number
  // processesRequired: number
  // averageExcessTimeMinutes: number

  // The processTime of a crafter in an ideal scenario (without excess time from previous cycles affecting it)
  // longestTimeMinutesInIdealScenario: number
}

// Type definition for crop processing settings
type CropProcessSetting = CropItem

// Interface for individual crop processing settings
export interface ProcessorSetting {
  cropType: CropType
  isStar: boolean
  processAs: CropProcessSetting
  crafters: number // Number of crafters assigned
  targetTime: number // Target processing time
  isActive: boolean // Whether this crop is active in processing
  hasPreserve: boolean // Whether preserve option is available
  count: number // Quantity to process
}

// Interface for all processor settings
export interface ProcessorSettings {
  cropSettings: Map<ICropNameWithGrowthDiff, ProcessorSetting>
  goldAverageSetting: 'crafterTime' | 'growthTick'
  crafterSetting: number // Currently not used
}

// Type definition for crop processing data
type TCropProcessData = Map<ICropNameWithGrowthDiff, {
  totalProcessMinutes: number
  processType: ItemType.Crop | ItemType.Seed | ItemType.Preserve
  craftersToUse: number
  conversionsToMake: number
}>

// Main Processor class handles crop processing calculations
export default class Processor {
  // Private output property initialized with empty Maps
  private _output: ProcessorOutput = {
    crops: new Map(),
    seeds: new Map(),
    preserves: new Map(),
    replantSeeds: new Map(),
    detailedProcessingInfo: new Map(), // Initialize new map for detailed processing info
  }

  // Inventory and equipment tracking
  private _inventory = new Map<string, IInventoryItem>()
  private _seedCollectors = new Map<string, IInventoryItem>()
  private _preserveJars = new Map<string, IInventoryItem>()
  private _highestCraftingTime = 0 // Tracks the longest processing time across all crops

  // Settings for processing
  private _settings: ProcessorSettings = {
    cropSettings: new Map() as Map<ICropNameWithGrowthDiff, ProcessorSetting>,
    crafterSetting: 0,
    goldAverageSetting: 'crafterTime'
  }

  // Equipment counts
  private _seedCollectorsCount = 0
  private _preserveJarsCount = 0

  // Getters for private properties
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

  // Resets all processing data to initial state
  reset() {
    this._inventory = new Map<string, IInventoryItem>()
    this._highestCraftingTime = 0
    this._inventory = new Map<string, IInventoryItem>()
    this._settings = {
      cropSettings: new Map() as Map<ICropNameWithGrowthDiff, ProcessorSetting>,
      crafterSetting: 0,
      goldAverageSetting: 'crafterTime'
    }
    this._seedCollectors = new Map<string, IInventoryItem>()
    this._preserveJars = new Map<string, IInventoryItem>()
    this._seedCollectorsCount = 0
    this._preserveJarsCount = 0
    this._output.detailedProcessingInfo = new Map() // Reset detailed info
  }

  // Main processing method that delegates to process_v2
  process(harvestData: Readonly<ITotalHarvest>, processorSettings: Readonly<ProcessorSettings>): void {
    this.process_v2(harvestData, processorSettings)
    return
  }

  /**
   * Calculates processing settings for each crop based on harvest data and user settings
   * @param totalHarvest - Harvest data to process
   * @param settings - User-defined processing settings
   * @returns TCropProcessData - Calculated processing data for each crop
   */
  private calculateSettings(totalHarvest: Readonly<ITotalHarvest>, settings: Readonly<ProcessorSettings>): TCropProcessData {
    const cropData = new Map<ICropNameWithGrowthDiff, {
      totalProcessMinutes: number
      processType: ItemType.Crop | ItemType.Seed | ItemType.Preserve
      craftersToUse: number
      conversionsToMake: number
    }>()

    // Iterate through each crop in the harvest data
    for (const [cropName, cropYield] of totalHarvest.crops) {
      const crop = getCropFromType(cropYield.cropType)
      if (!crop)
        throw new Error(`Missing crop data for crop: ${cropName}`)

      // Get user-defined settings for this crop or use defaults
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

      // If processing as crop, no conversion needed
      if (processSetting === ItemType.Crop) {
        cropData.set(cropName, {
          totalProcessMinutes: 0,
          processType: ItemType.Crop,
          craftersToUse: 0,
          conversionsToMake: 0,
        })
        continue
      }

      // Get conversion information for this crop
      const conversionInfo = crop.conversionInfo
      if (!conversionInfo)
        throw new Error(`Missing conversion info for crop: ${cropName}`)

      // Determine conversion ratios based on processing type (seed or preserve)
      const cropsPerConversion = (processSetting === ItemType.Seed) ? conversionInfo.cropsPerSeed : conversionInfo.cropsPerPreserve

      // Means there's nothing to work with for this crop
      if (cropYield.totalRaw === 0 && cropYield.totalWithDeductions === 0) {
        continue
      }

      // Track seed collectors and preserve jars
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

      // Calculate conversion time and number of conversions needed
      const conversionTime = (processSetting === ItemType.Seed) ? conversionInfo.seedProcessMinutes : conversionInfo.preserveProcessMinutes
      const conversionsToMake = Math.floor(cropYield.totalWithDeductions / cropsPerConversion)
      const totalProcessMinutes = conversionsToMake * conversionTime

      // Store calculated data
      cropData.set(cropName, {
        totalProcessMinutes,
        processType: processSetting,
        craftersToUse: setting.crafters,
        conversionsToMake,
      })
    }

    return cropData
  }

  /**
   * Main processing function that handles the actual calculation of processing results
   * @param harvestData - Harvest data to process
   * @param processorSettings - User-defined processing settings
   */
  process_v2(harvestData: Readonly<ITotalHarvest>, processorSettings: Readonly<ProcessorSettings>) {
    this.reset() // Reset all state before starting new processing

    // Initialize output and inventory
    const output: ProcessorOutput = {
      crops: new Map(),
      seeds: new Map(),
      preserves: new Map(),
      replantSeeds: Object.assign({}, harvestData.seedsRemainder),
      detailedProcessingInfo: new Map(),
    }

    const inventory = new Map<string, IInventoryItem>()

    // Set current settings
    this._settings = Object.assign({}, processorSettings)
    const settings = this._settings

    // Calculate processing data for each crop based on settings and harvest data
    const cropData = this.calculateSettings(harvestData, settings)

    // If no crops need processing, return early
    if (cropData.size === 0) {
      this._output = output
      this._inventory = inventory
      return
    }

    const harvestUsedStarSeeds = parseCropId(harvestData.cycleData.keys().next().value as ICropNameWithGrowthDiff).isStar

    // Process each crop
    for (const [cropName, processData] of cropData) {
      const cropHarvestData = harvestData.crops.get(cropName)

      const { type: cropType, isStar, hasGrowthBoost } = parseCropId(cropName)

      const crop = getCropFromType(cropType)

      // If processing as crop, just add to output
      if (processData.processType === ItemType.Crop) {
        const count = cropHarvestData?.totalWithDeductions || 0

        if (count > 0) {
          output.crops.set(cropName, {
            count,
            itemType: ItemType.Crop,
            cropType: cropType,
          })

          // Update inventory
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
              isStar,
              baseGoldValue: baseGoldValue || 0,
              cropType,
              itemType: ItemType.Crop,
            })
          }
        }
      }
      // If processing as seed or preserve, handle conversion
      else if (processData.processType === ItemType.Seed || processData.processType === ItemType.Preserve) {
        const cropCount = cropHarvestData?.totalWithDeductions || 0

        if (cropCount === 0)
          continue

        if (!crop)
          throw new Error(`Missing crop data for crop: ${cropName}`)

        // Determine output type for inventory
        const processType = processData.processType === ItemType.Seed ? 'seeds' : 'preserves'

        const cycleId = `${cropType}-${harvestUsedStarSeeds ? 'Star' : 'Base'}${hasGrowthBoost ? '-Growth' : ''}` satisfies ICropNameWithGrowthDiff
        const isStar = cropName.includes('-Star')

        // Get cycle data for this crop
        const cycleData = harvestData.cycleData.get(cycleId)
        if (!cycleData)
          continue

        // Calculate number of complete cycles and remainders
        const cycles = Math.floor(cycleData.totalHarvestsCount / cycleData.phases.length)
        const cyclesRemainder = cycleData.totalHarvestsCount % cycleData.phases.length

        let totalProduceCount = 0
        let totalProcessMinutes = 0
        let longestProcessMinutes = 0
        let goldGenerated = 0
        let firstHarvestDelayMinutes = 0

        let averageProcessMinutes = 0
        let averageGoldGenerated = 0
        let averageProduce = 0

        let lastCycleData: IProcessCycleData | null = null
        const allCycleData: IProcessCycleData[] = [] // Store data for all cycles

        // Process a complete cycle
        const cycleOutput = Object.freeze(processCycle({
          cycleData,
          isStar,
          crafterCount: processData.craftersToUse,
          cropConversionInfo: crop.conversionInfo,
          processInto: processData.processType,
          goldValues: crop.goldValues,
        }))

        // Process all complete cycles
        if (cycles > 0) {
          for (let i = 0; i < cycles; i++) {
            let cycleOutputToUse = cycleOutput
            if (i === 0 || (i === cycles - 1 && cyclesRemainder === 0)) {


              cycleOutputToUse = Object.freeze(processCycle({
                cycleData,
                isStar,
                crafterCount: processData.craftersToUse,
                cropConversionInfo: crop.conversionInfo,
                processInto: processData.processType,
                goldValues: crop.goldValues,
                isFirstCycle: i === 0,
                isLastCycle: (i === cycles - 1 && cyclesRemainder === 0)
              }))
            }

            totalProduceCount += cycleOutputToUse.totalProduceCount
            totalProcessMinutes += cycleOutputToUse.totalProcessMinutes
            longestProcessMinutes += cycleOutputToUse.longestProcessMinutes
            goldGenerated += cycleOutputToUse.goldGenerated

            if (i === 0) {
              firstHarvestDelayMinutes += cycleOutputToUse.firstHarvestDelayMinutes
            }

            lastCycleData = cycleOutputToUse
            allCycleData.push(cycleOutputToUse)
          }
        }

        // Handle remainder cycles (incomplete cycles)
        if (cyclesRemainder > 0) {
          const cycleRemainderOutput = processCycle({
            cycleData,
            isStar,
            crafterCount: processData.craftersToUse,
            cropConversionInfo: crop.conversionInfo,
            processInto: processData.processType,
            goldValues: crop.goldValues,
            isFirstCycle: cycles === 0,
            isLastCycle: true
          }, cyclesRemainder)

          totalProduceCount += cycleRemainderOutput.totalProduceCount
          totalProcessMinutes += cycleRemainderOutput.totalProcessMinutes
          longestProcessMinutes += cycleRemainderOutput.longestProcessMinutes
          goldGenerated += cycleRemainderOutput.goldGenerated

          if (firstHarvestDelayMinutes <= 0)
            firstHarvestDelayMinutes += cycleRemainderOutput.firstHarvestDelayMinutes

          lastCycleData = cycleRemainderOutput
          allCycleData.push(cycleRemainderOutput)
        }

        // Calculate effective processing time considering parallel processing
        if (lastCycleData) {
          longestProcessMinutes += firstHarvestDelayMinutes

          output[processType].set(cropName, {
            count: totalProduceCount,
            minutesProcessedTotal: 0,
            minutesProcessedEffective: longestProcessMinutes,
            crafterCount: 0,
            cropType: cropType,
            itemType: processData.processType
          })

          const inventoryId = `${cropType}-${isStar ? 'Star' : 'Base'}-${processType === 'seeds' ? 'Seed' : 'Preserve'}`
          // console.log('inventoryId', inventoryId)
          const baseGoldValue = (processType === 'seeds' ? crop.goldValues[`seed${isStar ? 'Star' : ''}`] : crop.goldValues[`preserve${isStar ? 'Star' : ''}`])

          if (inventory.has(inventoryId)) {
            inventory.get(inventoryId)!.count += totalProduceCount
          }
          else {
            inventory.set(inventoryId, {
              count: totalProduceCount,
              img: {
                src: (processType === 'seeds' ? crop?.seedImage : crop?.preserveImage) || '',
                alt: `${crop?.type} ${processType}`,
              },
              isStar,
              baseGoldValue: baseGoldValue,
              cropType,
              itemType: processType === 'seeds' ? ItemType.Seed : ItemType.Preserve
            })
          }

          if (longestProcessMinutes > this._highestCraftingTime)
            this._highestCraftingTime = longestProcessMinutes

          const cyclesTotal = cycles + cyclesRemainder
          averageProcessMinutes = longestProcessMinutes / cyclesTotal
          averageProduce = totalProduceCount / cyclesTotal
          averageGoldGenerated = goldGenerated / cyclesTotal
        }


        // Store detailed processing info
        output.detailedProcessingInfo.set(cropName, {
          cycleData: allCycleData,
          averageProcessMinutes,
          averageGoldGenerated,
          averageProduce,
          totalProcessMinutes,
          effectiveProcessMinutes: longestProcessMinutes
        })
      }
    }

    // console.log('output', output)

    // console.log('inventory', inventory)
    // Update class properties with the final output
    this._inventory = inventory
    this._output = output
  }
}

// Interface for harvest processing data
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
  minutesBeforeNextHarvest: number

  totalProcessMinutes: number
  lowestCrafterTimeMinutes: number
  highestCrafterTimeMinutes: number
  longestProcessMinutes: number
  longestProcessMinutesNoIdle: number
  goldGenerated: number

  // For average excess time
  conversionsPossible: number
  conversionsRequired: number
  averageExcessTimeMinutes: number
}

// Interface for harvest processing arguments
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
 * Processes a single harvest phase
 * @param processHarvestArgs - Arguments for processing a harvest
 * @returns IProcessHarvestData - Results of processing the harvest
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

  // Get data about the current phase
  const phaseData = cycleData.phases[currentPhaseIndex]
  const cropCount = phaseData.yield[qualityId].totalWithDeductions

  if (cropCount === 0) {
    console.warn('Empty cropCount found, bug?')
  }

  // Calculate how many conversions can be made

  const conversionsRequired = cropCount / cropsPerConversion
  const conversionsToMake = Math.floor(conversionsRequired)
  const conversionsRemainder = (cropCount / cropsPerConversion) - conversionsToMake
  const conversionsRemainderInCrops = cropCount % cropsPerConversion

  // Distribute conversions among crafters
  const conversionsDivided = Math.floor(conversionsToMake / crafterCount)
  const conversionsDividedRemainder = ((conversionsToMake % crafterCount) + conversionsRemainder)

  // Calculate total produce and gold
  const totalProduceCount = (conversionsToMake + conversionsRemainder) * producePerConversion
  const goldGenerated = totalProduceCount * produceGoldValue

  // Calculate time until next harvest phase
  let hoursToNextPhase = phaseData.phaseLength
  if (cycleData.phases.length > 1) {
    if (currentPhaseIndex === (cycleData.phases.length - 1))
      hoursToNextPhase = cycleData.phases[0].phaseLength
    else
      hoursToNextPhase = cycleData.phases[currentPhaseIndex + 1].phaseLength
  }

  // console.log('*---*')

  // console.log('time', hoursToNextPhase * 60, minutesPerConversion)

  const conversionsPossiblePerCrafter = (hoursToNextPhase * 60) / minutesPerConversion
  const conversionsPossible = conversionsPossiblePerCrafter * crafterCount

  let averageExcessTimeMinutes = 0

  if ((cropCount / cropsPerConversion) > conversionsPossible) {
    // averageExcessTimeMinutes = (((conversionsToMake + conversionsRemainder) - conversionsPossible) * minutesPerConversion)
    averageExcessTimeMinutes = (((conversionsToMake + conversionsRemainder) - conversionsPossible) * minutesPerConversion) / crafterCount
    // console.log('average excess time', averageExcessTimeMinutes / crafterCount)
  }


  // Initialize crafter data
  for (let i = 0; i < crafterCount; i++) {
    const cropsInsertedCount = conversionsDivided * cropsPerConversion
    const processTimeMinutes = conversionsDivided * minutesPerConversion

    // console.log('processTimeMinutes', processTimeMinutes)
    const processesDone = conversionsDivided
    const canFinishBeforeNextHarvest = (processTimeMinutes / 60) <= hoursToNextPhase

    crafterData.push({
      cropsInsertedCount,
      processTimeMinutes,
      canFinishBeforeNextHarvest,
      processesDone,
      idleTimeMinutes: Math.min(0, ((hoursToNextPhase * 60) - processTimeMinutes)),
      excessTimeMinutes: Math.min(0, (processTimeMinutes - (hoursToNextPhase * 60)))
    })
  }

  // Handle remaining conversions that don't divide evenly among crafters
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

      crafterData[crafterIndex].canFinishBeforeNextHarvest = ((crafterData[crafterIndex].processTimeMinutes / 60) <= hoursToNextPhase)

      crafterIndex++
      if (crafterIndex > (crafterData.length - 1))
        crafterIndex = 0
    }
  }

  // Aggregate results from all crafters
  let canFinishBeforeNextHarvest = true
  let totalProcessMinutes = 0
  let lowestCrafterTimeMinutes = Number.POSITIVE_INFINITY
  let highestCrafterTimeMinutes = Number.NEGATIVE_INFINITY
  let longestProcessMinutes = Number.NEGATIVE_INFINITY
  let longestProcessMinutesNoIdle = Number.NEGATIVE_INFINITY

  for (const crafter of crafterData) {
    if (!crafter.canFinishBeforeNextHarvest) {
      canFinishBeforeNextHarvest = false
    }

    // Calculate idle and excess time
    crafter.idleTimeMinutes = Math.max(0, (hoursToNextPhase * 60) - crafter.processTimeMinutes)
    crafter.excessTimeMinutes = Math.max(0, crafter.processTimeMinutes - (hoursToNextPhase * 60))

    totalProcessMinutes += crafter.processTimeMinutes

    // Track min/max times
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


  // Return the results of processing this harvest
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

    averageExcessTimeMinutes,
    conversionsPossible,
    conversionsRequired,
    minutesBeforeNextHarvest: hoursToNextPhase * 60
  }
}


// Interface for cycle processing arguments
interface IProcessCycleArgs {
  goldValues: Crop['goldValues']
  cycleData: ICropHarvestCycle
  isStar: boolean
  crafterCount: number
  cropConversionInfo: ICropConversions
  processInto: ItemType.Seed | ItemType.Preserve
  isFirstCycle?: boolean,
  isLastCycle?: boolean
}

// Interface for cycle processing data
interface IProcessCycleData {
  totalProduceCount: number
  cycleCrafterData: {
    canFinishBeforeNextHarvest: boolean
    longestProcessMinutes: number
    crafterData: IProcessHarvestData['crafterData']
    longestProcessMinutesNoIdle: number
    produceCount: number
  }[]
  totalProcessMinutes: number
  longestProcessMinutes: number
  firstHarvestDelayMinutes: number
  goldGenerated: number
}

/**
 * Processes a complete cycle of harvesting and conversion
 * @param processCycleArgs - Arguments for processing a cycle
 * @param phasesOverride - Optional override for number of phases to process
 * @returns IProcessCycleData - Results of processing the cycle
 */
function processCycle(processCycleArgs: IProcessCycleArgs, phasesOverride = 0): IProcessCycleData {
  const { goldValues, isStar, cropConversionInfo, processInto, cycleData, crafterCount, isFirstCycle, isLastCycle } = processCycleArgs
  const qualityId = (isStar ? 'star' : 'base')

  // Determine conversion parameters based on processing type
  let minutesPerConversion = 0
  let cropsPerConversion = 0
  let producePerConversion = 0
  let produceGoldValue = 0
  const firstHarvestDelayMinutes = (cycleData.phases[0].phaseLength * 60)

  // Set parameters based on whether we're processing to seed or preserve
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

  // Determine how many phases to process
  const phasesToCalculate = (phasesOverride > 0)
    ? phasesOverride
    : cycleData.phases.length

  // Initialize results
  let totalProduceCount = 0
  let canFinishBeforeNextHarvest = true
  let totalProcessMinutes = 0
  let longestProcessMinutes = 0
  const cycleCrafterData = [] as {
    canFinishBeforeNextHarvest: boolean
    longestProcessMinutes: number
    crafterData: IProcessHarvestData['crafterData']
    longestProcessMinutesNoIdle: number
    produceCount: number
  }[]
  let goldGenerated = 0

  // Process each phase in the cycle
  for (let i = 0; i < phasesToCalculate; i++) {
    const {
      totalProduceCount: harvestProduceCount,
      crafterData,
      canFinishBeforeNextHarvest: harvestCanFinishBeforeHarvest,
      totalProcessMinutes: harvestTotalProcessMinutes,
      longestProcessMinutes: harvestLongestProcessMinutes,
      longestProcessMinutesNoIdle: harvestLongestProcessMinutesNoIdle,
      goldGenerated: harvestGoldGenerated,
      longestProcessMinutesNoIdle,
      averageExcessTimeMinutes,
      minutesBeforeNextHarvest
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

    // Aggregate results
    totalProduceCount += harvestProduceCount
    if (!harvestCanFinishBeforeHarvest)
      canFinishBeforeNextHarvest = false

    totalProcessMinutes += harvestTotalProcessMinutes

    if (isLastCycle && i === (phasesToCalculate - 1)) {
      longestProcessMinutes += harvestLongestProcessMinutesNoIdle
    }
    else if (isFirstCycle && i === 0 && !canFinishBeforeNextHarvest) {
      longestProcessMinutes += harvestLongestProcessMinutes
    }
    else if (!canFinishBeforeNextHarvest) {
      longestProcessMinutes += (averageExcessTimeMinutes + minutesBeforeNextHarvest)
    }
    else {
      longestProcessMinutes += harvestLongestProcessMinutes
    }


    // Store detailed data about this phase
    cycleCrafterData.push({
      canFinishBeforeNextHarvest,
      longestProcessMinutes: harvestLongestProcessMinutes,
      crafterData,
      longestProcessMinutesNoIdle,
      produceCount: harvestProduceCount
    })

    goldGenerated += harvestGoldGenerated
  }

  // Return the results for this cycle
  return {
    totalProduceCount,
    cycleCrafterData,
    totalProcessMinutes,
    longestProcessMinutes,
    goldGenerated,
    firstHarvestDelayMinutes,
  }
}