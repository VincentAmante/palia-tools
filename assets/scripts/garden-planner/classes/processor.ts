import { getCropFromType } from '../cropList'
import type FertiliserCode from '../enums/fertilisercode'
import type { Crop, CropType, FertiliserType  } from '../imports'

import { ItemType, parseCropId  } from '../utils/garden-helpers'
import type { CropItem, ICropHarvestCycle, ICropNameWithGrowthDiff, IDayHarvest, IHarvestCyclePhase, IInventoryItem, ISeedTracker, ITotalHarvest } from '../utils/garden-helpers'
import type { ICropConversions } from './crop'

/**
 * Unified time trackers for my sanity, cause what did I write LMAO
 * 
 * Minutes tracked
 * - ProcessMinutes = time spent processing
 * - IdleMinutes = hours to next phase
 * - DelayMinutes = time spent waiting for current harvest
 * 
 * Time Modifiers
 * - Busiest = Time taken from the crafter with the longest process time
 * - Fastest = Opposite
 * - Average = Mean time between all crafters
 * - Total = Time has not been divided by crafters
 * - Effective = Time considers crafter division
 * - WithDelay = Process time includes delay waiting for first harvest
 * - NoIdle = Time will not include hours to the next cycle if finished
 * - Arbitrary = Time chosen based on inter-cycle relations (First cycle, mid cycle, last cycle)
 * 
 * Note: Arbitrary is to be used for estimating fastest time to process
 */
interface IProcessTimeStats {
  idleMinutesAverage: number;
  delayMinutes: number

  processMinutesTotal: number

  processMinutesEffectiveAverage: number
  processMinutesEffectiveAverageWithIdle: number
  processMinutesEffectiveAverageWithDelay: number
  processMinutesEffectiveAverageWithIdleWithDelay: number

  processMinutesEffectiveBusiest: number
  processMinutesEffectiveBusiestWithIdle: number
  processMinutesEffectiveBusiestWithDelay: number

  processMinutesArbitrary: number
}

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
  totalGoldGenerated: number,
  averageProduce: number,
  totalProcessMinutes: number
  effectiveProcessMinutes: number
  timeStats?: IProcessTimeStats
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

export enum FertiliserCostSource {
  SELL_VALUE = 's', // Cost of selling
  ZEKI_STORE = 'z', // Cost from buying it from Zeki's store
  GUILD_STORE = 'g' // Cost from buying it from the garden guild (medals)
}

// Interface for all processor settings
export interface ProcessorSettings {
  cropSettings: Map<ICropNameWithGrowthDiff, ProcessorSetting>
  goldAverageSetting: 'crafterTime' | 'growthTick'
  fertiliseCostSetting?: Map<FertiliserType, FertiliserCostSource>
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

  /**
   * Main processing function that handles the actual calculation of processing results
   * @param harvestData - Harvest data to process
   * @param processorSettings - User-defined processing settings
   */
  process(harvestData: Readonly<ITotalHarvest>, processorSettings: Readonly<ProcessorSettings>): void {
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

        if (count !== 0) {
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
          crafterCount: processData.craftersToUse,
          processInto: processData.processType,
          cropId: cropName
        }))

        // Process all complete cycles
        if (cycles > 0) {
          for (let i = 0; i < cycles; i++) {
            let cycleOutputToUse = cycleOutput
            if (i === 0 || (i === cycles - 1 && cyclesRemainder === 0)) {


              cycleOutputToUse = Object.freeze(processCycle({
                cycleData,
                crafterCount: processData.craftersToUse,
                processInto: processData.processType,
                cropId: cropName,
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
            cropId: cropName,
            crafterCount: processData.craftersToUse,
            processInto: processData.processType,
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
            minutesProcessedTotal: totalProcessMinutes,
            minutesProcessedEffective: longestProcessMinutes,
            crafterCount: 0,
            cropType: cropType,
            itemType: processData.processType
          })

          const inventoryId = `${cropType}-${isStar ? 'Star' : 'Base'}-${processType === 'seeds' ? 'Seed' : 'Preserve'}`
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
          effectiveProcessMinutes: longestProcessMinutes,
          totalGoldGenerated: goldGenerated
        })
      }
    }

    // Update class properties with the final output
    this._inventory = inventory
    this._output = output

    return
  }

  processSingleDay(harvestData: Readonly<IDayHarvest>, processorSettings: Readonly<ProcessorSettings>, cycleData: Readonly<ITotalHarvest['cycleData']>) {
    const output: ProcessorOutput = {
      crops: new Map(),
      seeds: new Map(),
      preserves: new Map(),
      replantSeeds: new Map(),
      detailedProcessingInfo: new Map(),
    }

    const inventory = new Map<string, IInventoryItem>()

    const settings = processorSettings

    const cropData = this.calculateSettings(harvestData, settings, true)

    if (cropData.size === 0) return {
      output, inventory, stats: {
        craftersUsed: {
          seedCollectors: new Map<ICropNameWithGrowthDiff, number>(),
          seedCollectorsCount: 0,
          preserveJars: new Map<ICropNameWithGrowthDiff, number>(),
          preserveJarsCount: 0
        },
        longestProcessMinutes: 0,
        goldGenerated: 0,
        canFinishBeforeNextHarvest: true
      }
    }

    const harvestUsedStarSeeds = parseCropId(cycleData.keys().next().value as ICropNameWithGrowthDiff).isStar

    let overallLongestProcessMinutes = 0;
    let totalGoldGenerated = 0;
    const craftersUsed = {
      seedCollectors: new Map<ICropNameWithGrowthDiff, number>(),
      seedCollectorsCount: 0,
      preserveJars: new Map<ICropNameWithGrowthDiff, number>(),
      preserveJarsCount: 0
    }
    let harvestCanFinishBeforeNextHarvest = true;

    for (const [cropName, processData] of cropData) {
      const cropHarvestData = harvestData.crops.get(cropName)
      const { type: cropType, isStar, hasGrowthBoost } = parseCropId(cropName)
      const crop = getCropFromType(cropType)

      // If processing as crop, just add to output
      if (processData.processType === ItemType.Crop) {
        const count = cropHarvestData?.totalWithDeductions || 0

        if (count !== 0) {
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
      else if (processData.processType === ItemType.Seed || processData.processType === ItemType.Preserve) {
        const cropCount = cropHarvestData?.totalWithDeductions || 0

        if (cropCount === 0) continue
        if (!crop) throw new Error(`Missing crop data for crop: ${cropName}`)

        const cycleId = `${cropType}-${harvestUsedStarSeeds ? 'Star' : 'Base'}${hasGrowthBoost ? '-Growth' : ''}` satisfies ICropNameWithGrowthDiff
        const isStar = cropName.includes('-Star')

        const cycleDataForCrop = cycleData.get(cycleId)
        if (!cycleDataForCrop) continue

        const { minutesPerConversion, cropsPerConversion, producePerConversion, produceGoldValue } = calculateCycleConversionData(processData.processType, cropName)

        let phaseIndex = 0
        // Find the correct phase index for the day harvest
        if (cycleDataForCrop.phases.length > 1) {
          const dayInPhase = harvestData.day % cycleDataForCrop.phases.at(-1)!.dayOfHarvest
          if (dayInPhase !== 0) {
            for (const [index, phase] of cycleDataForCrop.phases.entries()) {
              if (dayInPhase === phase.phaseLength) {
                phaseIndex = index
                break
              }
            }
          } else {
            phaseIndex = cycleDataForCrop.phases.length - 1
          }
        }

        const {
          totalProduceCount,
          crafterData,
          canFinishBeforeNextHarvest,
          totalProcessMinutes,
          longestProcessMinutesNoIdle,
          goldGenerated,
          minutesBeforeNextHarvest,
        } = processHarvest({
          qualityId: isStar ? 'star' : 'base',
          cycleData: cycleDataForCrop,
          currentPhaseIndex: phaseIndex,
          crafterCount: processData.craftersToUse,
          cropConversionInfo: crop.conversionInfo,
          processInto: processData.processType,
          minutesPerConversion,
          cropsPerConversion,
          producePerConversion,
          produceGoldValue
        })


        // trackers
        overallLongestProcessMinutes = Math.max(overallLongestProcessMinutes, longestProcessMinutesNoIdle)
        totalGoldGenerated += goldGenerated
        if (processData.processType === ItemType.Seed) {
          craftersUsed.seedCollectors.set(cropName, processData.craftersToUse)
          craftersUsed.seedCollectorsCount += processData.craftersToUse
        } else {
          craftersUsed.preserveJars.set(cropName, processData.craftersToUse)
          craftersUsed.preserveJarsCount += processData.craftersToUse
        }

        if (!canFinishBeforeNextHarvest) {
          harvestCanFinishBeforeNextHarvest = false
        }

        output[processData.processType === ItemType.Seed ? 'seeds' : 'preserves']
          .set(cropName, {
            count: totalProduceCount,
            minutesProcessedTotal: totalProcessMinutes,
            minutesProcessedEffective: longestProcessMinutesNoIdle,
            crafterCount: processData.craftersToUse,
            cropType: cropType,
            itemType: processData.processType
          })


        const inventoryId = `${cropType}-${isStar ? 'Star' : 'Base'}-${processData.processType === ItemType.Seed ? 'Seed' : 'Preserve'}`
        const baseGoldValue = (processData.processType === ItemType.Seed ? crop.goldValues[`seed${isStar ? 'Star' : ''}`] : crop.goldValues[`preserve${isStar ? 'Star' : ''}`])

        if (inventory.has(inventoryId)) {
          inventory.get(inventoryId)!.count += totalProduceCount
        }
        else {
          inventory.set(inventoryId, {
            count: totalProduceCount,
            img: {
              src: (processData.processType === ItemType.Seed ? crop?.seedImage : crop?.preserveImage) || '',
              alt: `${crop?.type} ${processData.processType === ItemType.Seed ? 'Seed' : 'Preserve'}`,
            },
            isStar,
            baseGoldValue: baseGoldValue,
            cropType,
            itemType: processData.processType === ItemType.Seed ? ItemType.Seed : ItemType.Preserve
          })
        }

        const oneDayCycleData: IProcessCycleData = {
          totalProduceCount,
          cycleCrafterData: [{
            canFinishBeforeNextHarvest: canFinishBeforeNextHarvest,
            longestProcessMinutes: longestProcessMinutesNoIdle,
            crafterData: crafterData,
            produceCount: totalProduceCount,
            longestProcessMinutesNoIdle: longestProcessMinutesNoIdle,
            minutesBeforeNextHarvest: minutesBeforeNextHarvest
          }],
          totalProcessMinutes,
          longestProcessMinutes: longestProcessMinutesNoIdle, // no idle as we're going by day
          firstHarvestDelayMinutes: 0, // ! ATM considered irrelevant, reconsider later
          goldGenerated,
        }

        output.detailedProcessingInfo.set(cropName, {
          cycleData: [oneDayCycleData],
          averageProcessMinutes: longestProcessMinutesNoIdle,
          averageGoldGenerated: goldGenerated,
          averageProduce: totalProduceCount,
          totalProcessMinutes,
          effectiveProcessMinutes: longestProcessMinutesNoIdle,
          totalGoldGenerated: goldGenerated
        })
      }
    }

    return {
      output, inventory,
      stats: {
        craftersUsed,
        longestProcessMinutes: overallLongestProcessMinutes,
        goldGenerated: totalGoldGenerated,
        canFinishBeforeNextHarvest: harvestCanFinishBeforeNextHarvest
      }
    }
  }

  /**
   * Calculates processing settings for each crop based on harvest data and user settings
   * @param harvestInfo - Harvest data to process
   * @param settings - User-defined processing settings
   * @param skipCrafterTracking - Whether to skip tracking crafters (default: false)
   * 
   * Use skipCrafterTracking when processing single day harvests to avoid double counting equipment
   * 
   * @returns TCropProcessData - Calculated processing data for each crop
   */
  private calculateSettings(harvestInfo: Readonly<ITotalHarvest | IDayHarvest>, settings: Readonly<ProcessorSettings>, skipCrafterTracking: boolean = false): TCropProcessData {
    const cropData = new Map<ICropNameWithGrowthDiff, {
      totalProcessMinutes: number
      processType: ItemType.Crop | ItemType.Seed | ItemType.Preserve
      craftersToUse: number
      conversionsToMake: number
    }>()

    // Iterate through each crop in the harvest data
    for (const [cropName, cropYield] of harvestInfo.crops) {
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

      if (!skipCrafterTracking) {
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


function getHoursToNextPhase(cycleData: ICropHarvestCycle, currentPhaseIndex: number) {
  if (cycleData.phases.length <= 1) {
    return cycleData.phases[0]?.phaseLength || 0;
  }

  const nextPhaseIndex = currentPhaseIndex === cycleData.phases.length - 1
    ? 0
    : currentPhaseIndex + 1;

  return cycleData.phases[nextPhaseIndex]!.phaseLength;
}

function aggregateHarvestResults(params: {
  crafterData: IProcessHarvestData['crafterData'];
  totalProduceCount: number;
  remainderCrops: number;
  goldGenerated: number;
  minutesToNextHarvest: number;
  totalConversionsRequired: number;
  minutesPerConversion: number;
  crafterCount: number;
}): IProcessHarvestData {
  const {
    crafterData, totalProduceCount, remainderCrops, goldGenerated,
    minutesToNextHarvest, totalConversionsRequired, minutesPerConversion, crafterCount
  } = params;

  let canFinishBeforeNextHarvest = true;
  let totalProcessMinutes = 0;
  let lowestCrafterTime = Infinity;
  let highestCrafterTime = -Infinity;
  let longestProcessMinutes = -Infinity;
  let longestProcessMinutesNoIdle = -Infinity;
  let totalIdleMinutes = 0;

  crafterData.forEach(crafter => {
    crafter.idleTimeMinutes = Math.max(0, minutesToNextHarvest - crafter.processTimeMinutes);
    crafter.excessTimeMinutes = Math.max(0, crafter.processTimeMinutes - minutesToNextHarvest);
    crafter.canFinishBeforeNextHarvest = crafter.processTimeMinutes <= minutesToNextHarvest;

    if (!crafter.canFinishBeforeNextHarvest) {
      canFinishBeforeNextHarvest = false;
    }

    totalProcessMinutes += crafter.processTimeMinutes;
    totalIdleMinutes += crafter.idleTimeMinutes; // TODO: Utilise this somehow

    lowestCrafterTime = Math.min(lowestCrafterTime, crafter.processTimeMinutes);
    highestCrafterTime = Math.max(highestCrafterTime, crafter.processTimeMinutes);
    longestProcessMinutes = Math.max(longestProcessMinutes, crafter.processTimeMinutes, minutesToNextHarvest);
    longestProcessMinutesNoIdle = Math.max(longestProcessMinutesNoIdle, crafter.processTimeMinutes)
  });

  const conversionsPossible = (minutesToNextHarvest / minutesPerConversion) * crafterCount;
  const averageExcessTimeMinutes = totalConversionsRequired > conversionsPossible
    ? ((totalConversionsRequired - conversionsPossible) * minutesPerConversion) / crafterCount
    : 0;

  return {
    totalProduceCount,
    remainder: remainderCrops,
    crafterData,
    canFinishBeforeNextHarvest,
    totalProcessMinutes,
    lowestCrafterTimeMinutes: lowestCrafterTime,
    highestCrafterTimeMinutes: highestCrafterTime,
    goldGenerated,
    longestProcessMinutes,
    longestProcessMinutesNoIdle,
    averageExcessTimeMinutes,
    conversionsPossible,
    conversionsRequired: totalConversionsRequired,
    minutesBeforeNextHarvest: minutesToNextHarvest
  };
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

  // Get data about the current phase
  const phaseData = cycleData.phases[currentPhaseIndex]
  const cropCount = phaseData?.yield[qualityId].totalWithDeductions || 0

  if (cropCount === 0) {
    console.warn('Empty cropCount found, bug?')
  }

  // Calculate how many conversions can be made
  const totalConversionsRequired = cropCount / cropsPerConversion
  const wholeConversions = Math.floor(totalConversionsRequired)
  const remainderCrops = cropCount % cropsPerConversion
  const conversionsRemainder = remainderCrops / cropsPerConversion

  // Calculate total produce and gold
  const totalProduceCount = totalConversionsRequired * producePerConversion
  const goldGenerated = totalProduceCount * produceGoldValue

  // calculate time until next harvest phase
  const hoursToNextHarvest = getHoursToNextPhase(cycleData, currentPhaseIndex)
  const minutesToNextHarvest = hoursToNextHarvest * 60


  const crafterData = distributeCropsToCrafters({
    wholeConversions,
    conversionsRemainder,
    crafterCount,
    remainderCrops,
    minutesPerConversion,
    minutesToNextHarvest,
    cropsPerConversion
  }) as IProcessHarvestData['crafterData']

  return aggregateHarvestResults({
    crafterData,
    totalProduceCount,
    remainderCrops,
    goldGenerated,
    minutesToNextHarvest,
    totalConversionsRequired,
    minutesPerConversion,
    crafterCount
  })
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
    minutesBeforeNextHarvest: number
  }[]
  totalProcessMinutes: number
  longestProcessMinutes: number
  firstHarvestDelayMinutes: number
  goldGenerated: number
}


// Interface for cycle processing arguments
interface IProcessCycleArgsV2 {
  cropId: ICropNameWithGrowthDiff
  cycleData: ICropHarvestCycle
  crafterCount: number
  processInto: ItemType.Seed | ItemType.Preserve
  isFirstCycle?: boolean,
  isLastCycle?: boolean
}

function calculateCycleConversionData(processType: ItemType, cropId: ICropNameWithGrowthDiff) {
  if (processType !== ItemType.Seed && processType !== ItemType.Preserve)
    throw new Error('Neither Seed nor Preserve was chosen')


  const { type, isStar } = parseCropId(cropId)
  const crop = getCropFromType(type)

  if (!crop)
    throw new Error('No crop found from type')

  const cropConversionInfo = crop.conversionInfo
  const goldValues = crop.goldValues

  let minutesPerConversion = 0
  let cropsPerConversion = 0
  let producePerConversion = 0
  let produceGoldValue = 0
  const isSeed = processType === ItemType.Seed

  // Set parameters based on whether we're processing to seed or preserve
  if (isSeed) {
    minutesPerConversion = cropConversionInfo.seedProcessMinutes
    cropsPerConversion = cropConversionInfo.cropsPerSeed
    producePerConversion = cropConversionInfo.seedsPerConversion
    produceGoldValue = (isStar) ? goldValues.seedStar : goldValues.seed
  }
  else {
    minutesPerConversion = cropConversionInfo.preserveProcessMinutes
    cropsPerConversion = cropConversionInfo.cropsPerPreserve
    producePerConversion = 1
    produceGoldValue = (isStar) ? goldValues.preserveStar : goldValues.preserve
  }

  return {
    minutesPerConversion,
    cropsPerConversion,
    producePerConversion,
    produceGoldValue,
    isStar,
    crop
  }
}


function distributeCropsToCrafters(params: {
  wholeConversions: number;
  conversionsRemainder: number;
  remainderCrops: number;
  crafterCount: number;
  minutesPerConversion: number;
  cropsPerConversion: number;
  minutesToNextHarvest: number;
}): IProcessHarvestData['crafterData'] {
  const {
    wholeConversions, conversionsRemainder,
    crafterCount, minutesPerConversion, cropsPerConversion, minutesToNextHarvest
  } = params;

  const minimumConversionsPerCrafter = Math.floor(wholeConversions / crafterCount)
  const extraWholeConversions = wholeConversions % crafterCount
  let remainderCropsInserted = false;

  const crafterData: IProcessHarvestData['crafterData'] = Array.from({ length: crafterCount }, (_, index) => {
    let conversions = minimumConversionsPerCrafter;

    if (index < extraWholeConversions) {
      conversions += 1
    }

    const isSlotForRemainderCrops = (index === extraWholeConversions && conversionsRemainder > 0)
    if (!remainderCropsInserted && (isSlotForRemainderCrops || (index === 0 && extraWholeConversions >= crafterCount))) {
      conversions += conversionsRemainder
      remainderCropsInserted = true
    }

    const processTimeMinutes = conversions * minutesPerConversion
    const cropsInsertedCount = conversions * cropsPerConversion

    return {
      cropsInsertedCount,
      processTimeMinutes,
      processesDone: conversions,
      canFinishBeforeNextHarvest: processTimeMinutes <= minutesToNextHarvest,
      idleTimeMinutes: 0,
      excessTimeMinutes: 0
    }
  })

  return crafterData
}

/**
 * Processes a complete cycle of harvesting and conversion
 * @param processCycleArgs - Arguments for processing a cycle
 * @param phasesOverride - Optional override for number of phases to process
 * @returns IProcessCycleData - Results of processing the cycle
 */
function processCycle(processCycleArgs: IProcessCycleArgsV2, phasesOverride = 0): IProcessCycleData {
  const { cropId, processInto, cycleData, crafterCount, isFirstCycle, isLastCycle } = processCycleArgs

  // Calculated here to save processing time
  const { minutesPerConversion, isStar, crop, cropsPerConversion, producePerConversion, produceGoldValue } = calculateCycleConversionData(processInto, cropId)

  const firstHarvestDelayMinutes = ((cycleData.phases[0]?.phaseLength || 0) * 60)

  // Determine how many phases to process
  const phasesToCalculate = (phasesOverride > 0)
    ? phasesOverride
    : cycleData.phases.length

  // Initialize results
  let totalProduceCount = 0
  let canFinishBeforeNextHarvest = true
  let totalProcessMinutes = 0
  let longestProcessMinutes = 0
  const cycleCrafterData = [] as IProcessCycleData['cycleCrafterData']
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
      averageExcessTimeMinutes,
      minutesBeforeNextHarvest
    } = processHarvest({
      qualityId: isStar ? 'star' : 'base',
      cycleData,
      currentPhaseIndex: i,
      crafterCount,
      cropConversionInfo: crop.conversionInfo,
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
      longestProcessMinutesNoIdle: harvestLongestProcessMinutesNoIdle,
      produceCount: harvestProduceCount,
      minutesBeforeNextHarvest
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
