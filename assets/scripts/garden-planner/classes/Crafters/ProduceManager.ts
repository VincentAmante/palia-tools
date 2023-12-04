// This file will handle all the logic for the crafters
import { CropType } from '../../imports'
import { createItemFromCropType } from '../../utils/gardenHelpers'
import { type HarvestSimulatorLog, getCropMap } from '../../utils/gardenHelpers'
import type { IShippingBin } from '../ShippingBin'
import { Seeder } from './Seeder'
import { Jar } from './Jar'
import type { IDedicatedCrop, LoggableItem } from './ICrafter'

export enum DistributionMethod {
  Dedicated = 'Dedicated',
  Vip = 'VIP',
}

export enum CropOption {
  Crop = 'Crop',
  Seed = 'Seed',
  Preserve = 'Preserve',
}

export interface ICropOption {
  cropType: CropType
  isStar: boolean
  option: CropOption

  // For 'Dedicated' distribution method
  seeders: number
  jars: number
}
export type ICropOptions = ICropOption[]

export interface IManagerSettings {
  useDaySeparation: boolean
  autoSetCrafters: boolean
  useCrafterLimit: boolean
}

export interface ICrafterSettings {
  useStackLimit: boolean
  useHopperLimit: boolean
  includeNormalSeeds: boolean
  useDayLimit: boolean
}

export interface ICrafterData {
  type: 'Seeder' | 'Jar'
  dedicatedCrop: IDedicatedCrop | null
  logs: Record<number, {
    insertions: LoggableItem[]
    collections: LoggableItem[]
  }>
  lifetimeMinutes: number
  elapsedTimeMinutes: number
}

const MAX_CRAFTERS = 30

// This is to prevent infinite loops
const MAX_DAYS = 1000

type HarvestInventory = Record<CropType, {
  base: number
  star: number
}>

interface ICrafterCounts {
  seeders: number
  jars: number
}

/**
 * Represents a manager for handling produce-related operations.
 */
export class ProduceManager {
  private _seeders: Seeder[] = []

  private _jars: Jar[] = []

  private _crafterSettings: ICrafterSettings = {
    useStackLimit: true,
    useHopperLimit: true,
    includeNormalSeeds: true,
    useDayLimit: true,
  }

  private _managerSettings: IManagerSettings = {
    // Whether or not crafters should insert crops based on the day of harvest
    useDaySeparation: true,
    // Whether or not crafters are set based on the number of crops set to a produce option
    autoSetCrafters: true,
    // Whether to respect the limit of 30 crafters
    useCrafterLimit: true,
  }

  private _craftersNeedUpdate = true

  private _logs: HarvestSimulatorLog[] = []

  private _toProcess: HarvestInventory = getCropMap()

  // TODO: Set to a better default
  private _manualCrafterCounts: ICrafterCounts = {
    seeders: 0,
    jars: 30,
  }

  private _currentDay: HarvestSimulatorLog | null = null

  private _distributionMethod: DistributionMethod = DistributionMethod.Dedicated
  private _cropOptions: ICropOptions = Object.values(CropType).map((cropType) => {
    if (cropType === CropType.None)
      return []

    const baseOption: ICropOption = {
      cropType,
      isStar: false,
      option: CropOption.Crop,
      seeders: 1,
      jars: 1,
    }
    const starOption: ICropOption = {
      cropType,
      isStar: true,
      option: CropOption.Crop,
      seeders: 1,
      jars: 1,
    }
    return [starOption, baseOption]
  }).flat()

  simulate(shippingBin: IShippingBin): void {
    if (this._craftersNeedUpdate)
      this.setCrafters()

    // reset each crafter's time
    for (const seeder of this._seeders) {
      seeder.resetTime()
      seeder.resetLogs()
    }
    for (const jar of this._jars) {
      jar.resetTime()
      jar.resetLogs()
    }

    if (this._logs.length === 0)
      return

    const firstDay = this._logs[0].day
    const lastDay = this._logs[this._logs.length - 1].day
    this._toProcess = getCropMap()

    // TODO: Remove soon
    // Check if each crafter has an item in their hopper still, throw an error if so
    for (const seeder of this._seeders) {
      if (seeder.hopperSlots.length > 0)
        throw new Error('Seeder still has items in hopper')
    }
    for (const jar of this._jars) {
      if (jar.hopperSlots.length > 0)
        throw new Error('Jar still has items in hopper')
    }

    if (this._jars.length === 0 && this._seeders.length === 0)
      return

    let day = firstDay
    while ((this.itemsLeftToProcess() || day <= lastDay) && day <= MAX_DAYS) {
      this.processCraftersTillDay(day)
      this.collectFromCrafters(shippingBin, day)
      this._currentDay = this._logs.find(log => log.day === day) ?? null
      // Simulate the crops being harvested and added to the inventory to be processed
      if (this._currentDay) {
        Object.entries(this._currentDay.crops).forEach(([cropType, cropYield]) => {
          const baseOption = this._cropOptions.find(cropOption => cropOption.cropType === cropType && !cropOption.isStar)
          const starOption = this._cropOptions.find(cropOption => cropOption.cropType === cropType && cropOption.isStar)

          // BEGIN PROCESSING BASE CROPS
          let toProcessBase = this._toProcess[cropType as CropType].base

          // Negative values means a crop was used from elsewhere, as such it counts as a cost
          if (toProcessBase < 0) {
            shippingBin.addCost(day, createItemFromCropType(cropType as CropType, false, Math.abs(toProcessBase)))
            toProcessBase = 0
          }
          // Adds the crops to be set for processing
          if (baseOption?.option !== CropOption.Crop) {
            this._toProcess[cropType as CropType].base += cropYield.base
          }
          else { // just straight up shove it in the shipping bin
            if (cropYield.base > 0)
              shippingBin.add(day, createItemFromCropType(cropType as CropType, false, cropYield.base))
          }

          // BEGIN PROCESSING STAR CROPS
          let toProcessStar = this._toProcess[cropType as CropType].star

          if (toProcessStar < 0) {
            shippingBin.addCost(day, createItemFromCropType(cropType as CropType, true, Math.abs(toProcessStar)))
            toProcessStar = 0
          }

          if (starOption?.option !== CropOption.Crop) {
            this._toProcess[cropType as CropType].star += cropYield.star
          }

          else {
            if (cropYield.star > 0)
              shippingBin.add(day, createItemFromCropType(cropType as CropType, true, cropYield.star))
          }
        })
      }
      this.distributeCrops(day)

      day++
    }

    if (day >= MAX_DAYS)
      throw new Error('Infinite loop detected. Aborting simulation.')
  }

  private processCraftersTillDay(day: number): void {
    for (const seeder of this._seeders)
      seeder.process(day)
    for (const jar of this._jars)
      jar.process(day)
  }

  triggerCraftersUpdate(): void {
    this._craftersNeedUpdate = true
  }

  private collectFromCrafters(shippingBin: IShippingBin, day: number): void {
    for (const seeder of this._seeders) {
      const result = seeder.collect(day)
      if (result.length > 0)
        shippingBin.add(day, ...result)
    }
    for (const jar of this._jars) {
      const result = jar.collect(day)
      if (result.length > 0)
        shippingBin.add(day, ...result)
    }
  }

  private setCrafters(): void {
    // Set the number of crafters based on the number of crops set to a produce option
    switch (this.distributionMethod) {
      case DistributionMethod.Dedicated:
        this.setCraftersDedicated()
        break
      case DistributionMethod.Vip:
        this.setCraftersVip()
        break
    }

    // Set each crafters settings
    if (this._seeders.length > 0) {
      this._seeders.forEach((seeder) => {
        seeder.setSettings(this._crafterSettings)
      })
    }
    if (this._jars.length > 0) {
      this._jars.forEach((jar) => {
        jar.setSettings(this._crafterSettings)
      })
    }

    // Trim the crafters if we're over the limit
    this.trimCrafters()

    // * Switch off the update flag
    // prevents the crafters from being updated again until a change occurs to either the crafters or the crop options
    this._craftersNeedUpdate = false
  }

  private setCraftersDedicated(): void {
    const seeders: Seeder[] = []
    const jars: Jar[] = []

    console.log('setCraftersDedicated', this._cropOptions)

    this._cropOptions.forEach((cropOption) => {
      for (let i = 0; i < cropOption.seeders; i++) {
        if (cropOption.option === CropOption.Seed
          && (this.crafterCount <= MAX_CRAFTERS || !this._managerSettings.useCrafterLimit)) {
          const seeder = new Seeder()
          seeder.dedicatedCrop = {
            type: cropOption.cropType,
            isStarred: cropOption.isStar,
          }
          seeders.push(seeder)
        }
      }

      for (let i = 0; i < cropOption.jars; i++) {
        if (cropOption.option === CropOption.Preserve
          && (this.crafterCount <= MAX_CRAFTERS || !this._managerSettings.useCrafterLimit)) {
          const jar = new Jar()
          jar.dedicatedCrop = {
            type: cropOption.cropType,
            isStarred: cropOption.isStar,
          }
          jars.push(jar)
        }
      }
    })

    this._seeders = seeders
    this._jars = jars
  }

  private setCraftersVip(): void {
    const seeders: Seeder[] = []
    const jars: Jar[] = []

    for (let i = 0; i < this._manualCrafterCounts.seeders; i++) {
      if (this.crafterCount >= MAX_CRAFTERS && this._managerSettings.useCrafterLimit)
        break

      seeders.push(new Seeder())
    }
    for (let i = 0; i < this._manualCrafterCounts.jars; i++) {
      if (this.crafterCount >= MAX_CRAFTERS && this._managerSettings.useCrafterLimit)
        break

      jars.push(new Jar())
    }

    // Error checking
    const seedOption = this._cropOptions.find(cropOption => cropOption.option === CropOption.Seed)
    if (seedOption && seeders.length === 0) {
      seeders.push(new Seeder())
      console.warn('No seeders were set, but the seed option was selected. Defaulting to 1 seeder.')
    }
    const preserveOption = this._cropOptions.find(cropOption => cropOption.option === CropOption.Preserve)
    if (preserveOption && jars.length === 0) {
      jars.push(new Jar())
      console.warn('No jars were set, but the preserve option was selected. Defaulting to 1 jar.')
    }

    this._seeders = seeders
    this._jars = jars
  }

  // TODO: Store the distribution method as a function variable instead of this switch statement
  private distributeCrops(day: number): void {
    switch (this._distributionMethod) {
      case DistributionMethod.Dedicated:
        this.distributeCropsDedicated(day)
        break
      case DistributionMethod.Vip:
        this.distributeCropsVip(day)
        break
    }
  }

  private itemsLeftToProcess(): boolean {
    const seeders = this._seeders
    const jars = this._jars

    for (const seeder of seeders) {
      if (seeder.hopperSlots.length > 0 || seeder.outputSlots.length > 0)
        return true
    }
    for (const jar of jars) {
      if (jar.hopperSlots.length > 0 || jar.outputSlots.length > 0)
        return true
    }

    for (const cropType of Object.values(CropType)) {
      if (cropType === CropType.None)
        continue

      const { base, star } = this._toProcess[cropType]
      if (base > 0 || star > 0)
        return true
    }

    return false
  }

  get distributionMethod(): DistributionMethod {
    return this._distributionMethod
  }

  set distributionMethod(method: DistributionMethod) {
    this._distributionMethod = method
  }

  private distributeCropsDedicated(day: number): void {
    for (const cropOption of this._cropOptions) {
      const { cropType, isStar, option } = cropOption
      const crops = this._toProcess[cropType][isStar ? 'star' : 'base']
      if (crops === 0)
        continue
      const cropItems = createItemFromCropType(cropType, isStar, crops)
      let crafters: (Seeder | Jar)[] = []

      if (option === CropOption.Seed) {
        crafters = this._seeders.filter(seeder => isDedicatedCropEqual(seeder.dedicatedCrop, {
          type: cropType,
          isStarred: isStar,
        }))
      }
      else if (option === CropOption.Preserve) {
        crafters = this._jars.filter(jar => isDedicatedCropEqual(jar.dedicatedCrop, {
          type: cropType,
          isStarred: isStar,
        }))
      }

      for (const crafter of crafters) {
        const isFullyInserted = crafter.insertItem({
          item: cropItems,
          day,
        })
        if (isFullyInserted)
          break
      }

      const itemsInserted = crops - cropItems.count
      this._toProcess[cropType][isStar ? 'star' : 'base'] -= itemsInserted
    }
  }

  private distributeCropsVip(day: number): void {
    for (const cropOption of this._cropOptions) {
      const { cropType, isStar, option } = cropOption

      const crops = this._toProcess[cropType][isStar ? 'star' : 'base']

      if (crops === 0)
        continue

      const cropItems = createItemFromCropType(cropType, isStar, crops)

      let crafters: (Seeder | Jar)[] = []

      if (option === CropOption.Seed)
        crafters = this._seeders
      else if (option === CropOption.Preserve)
        crafters = this._jars

      for (const crafter of crafters) {
        const isFullyInserted = crafter.insertItem({
          item: cropItems,
          day,
        })

        if (isFullyInserted)
          break
      }

      const itemsInserted = crops - cropItems.count
      this._toProcess[cropType][isStar ? 'star' : 'base'] -= itemsInserted
    }
  }

  get logs(): HarvestSimulatorLog[] {
    return this._logs
  }

  get inventory(): HarvestInventory {
    return this._toProcess
  }

  get managerSettings(): IManagerSettings {
    return this._managerSettings
  }

  set managerSettings(settings: IManagerSettings) {
    this._managerSettings = settings
  }

  get crafterSettings(): ICrafterSettings {
    return this._crafterSettings
  }

  set crafterSettings(settings: ICrafterSettings) {
    this._crafterSettings = settings
  }

  set logs(logs: HarvestSimulatorLog[]) {
    this._logs = []

    logs.filter(log => log.day !== 0)
    // for (const log of logs) {
    //   // Remove negative values
    //   // TODO: Figure out how we want to handle negative values
    //   Object.entries(log.crops).forEach(([cropType, cropYield]) => {
    //     if (cropYield.base < 0)
    //       log.crops[cropType as CropType].base = 0
    //     if (cropYield.star < 0)
    //       log.crops[cropType as CropType].star = 0
    //   })
    // }
    this._logs = logs.sort((logA, logB) => logA.day - logB.day)
  }

  set inventory(inventory: HarvestInventory) {
    this._toProcess = inventory
  }

  get seeders(): Seeder[] {
    return this._seeders
  }

  get cropOptions(): ICropOptions {
    return this._cropOptions
  }

  set cropOptions(options: ICropOptions) {
    // Enforce the limit of 30 crafters if the option is enabled
    // As well as preventing crafters from going below 0

    this._cropOptions = options
    this._craftersNeedUpdate = true
  }

  private trimCrafters(): void {
    if (!this._managerSettings.useCrafterLimit)
      return
    if (this.crafterCount <= MAX_CRAFTERS)
      return

    console.log('Trimming crafters')

    // If we're over the limit, remove crafters based on the distribution method
    switch (this._distributionMethod) {
      case DistributionMethod.Dedicated:
        this.trimCraftersDedicated()
        break
      case DistributionMethod.Vip:
        this.trimCraftersVip()
        break
    }
  }

  /**
   * Trims the dedicated crafters based on the maximum number of crafters allowed.
   * Removes crafters that are not dedicated to a specific crop type.
   */
  private trimCraftersDedicated(): void {
    if (!this._managerSettings.useCrafterLimit) {
      console.warn('Attempted to trim crafters when the crafter limit is disabled')
      return
    }
    const cropOptionsReverse = this._cropOptions.reverse()

    for (const cropOption of cropOptionsReverse) {
      if (this.crafterCount <= MAX_CRAFTERS)
        break

      const { cropType, option } = cropOption

      if (option === CropOption.Crop)
        continue

      // const crafters = option === CropOption.Seed ? this._seeders : this._jars
      let crafters: (Seeder | Jar)[] = []

      switch (option) {
        case CropOption.Seed:
          crafters = this._seeders
          break
        case CropOption.Preserve:
          crafters = this._jars
          break
      }

      if (crafters.length === 0)
        continue

      const dedicatedCrafters = crafters.filter(crafter => isDedicatedCropEqual(crafter.dedicatedCrop, {
        type: cropType,
        isStarred: cropOption.isStar,
      }))

      for (const crafter of dedicatedCrafters) {
        if (this.crafterCount <= MAX_CRAFTERS)
          break

        // We cannot remove the last crafter, as the crop still needs to be processed
        if (dedicatedCrafters.length === 1)
          break

        switch (option) {
          case CropOption.Seed:
            this._seeders.splice(this._seeders.indexOf(crafter as Seeder), 1)
            break
          case CropOption.Preserve:
            this._jars.splice(this._jars.indexOf(crafter as Jar), 1)
            break
        }
      }
    }
    // Reverse the array back to normal
    this._cropOptions.reverse()
  }

  private trimCraftersVip(): void {
    if (!this._managerSettings.useCrafterLimit) {
      console.warn('Attempted to trim crafters when the crafter limit is disabled')
      return
    }

    if (this.crafterCount <= MAX_CRAFTERS)
      return

    console.log('Trimming crafters')

    while (this.crafterCount > MAX_CRAFTERS) {
      // Remove crafters in the following order: Jars, Seeders
      if (this._jars.length > 1)
        this._jars.pop()
      else if (this._seeders.length > 1)
        this._seeders.pop()
      else
        break
    }
  }

  // Manual override till we fully replace the old system
  setCropOption(type: CropType, isStar: boolean, option: CropOption): void {
    const cropOption = this._cropOptions.find(cropOption => cropOption.cropType === type && cropOption.isStar === isStar)

    console.log('setCropOption', this._cropOptions)
    if (!cropOption)
      return

    cropOption.option = option

    this._craftersNeedUpdate = true
  }

  get seederCount(): number {
    return this._seeders.length
  }

  get jarCount(): number {
    return this._jars.length
  }

  get crafterCount(): number {
    return this._seeders.length + this._jars.length
  }

  setSeeders(seeders: number) {
    if (seeders < 0)
      return
    if (seeders > this._seeders.length) {
      for (let i = 0; i < seeders - this._seeders.length; i++) {
        if ((this.crafterCount) >= MAX_CRAFTERS && this._managerSettings.useCrafterLimit)
          break

        this._seeders.push(new Seeder())
      }
    }
    else if (seeders < this._seeders.length) {
      for (let i = 0; i < this._seeders.length - seeders; i++)
        this._seeders.pop()
    }

    this._craftersNeedUpdate = true
  }

  get jars(): Jar[] {
    return this._jars
  }

  setJars(jars: number) {
    if (jars < 0)
      return
    if (jars > this._jars.length) {
      for (let i = 0; i < jars - this._jars.length; i++) {
        if ((this.seederCount && this.jarCount) >= MAX_CRAFTERS && this._managerSettings.useCrafterLimit)
          break

        this._jars.push(new Jar())
      }
    }
    else if (jars < this._jars.length) {
      for (let i = 0; i < this._jars.length - jars; i++)
        this._jars.pop()
    }

    this._craftersNeedUpdate = true
  }

  // Following 4 functions are for manually increasing/decreasing the number of crafters

  increaseSeeders(): void {
    // This is to prevent the auto-set crafters from being triggered now that the user has manually set the number of crafters
    this._managerSettings.autoSetCrafters = false

    if ((this.seederCount && this.jarCount) >= MAX_CRAFTERS && this._managerSettings.useCrafterLimit)
      return

    this._seeders.push(new Seeder())

    this._craftersNeedUpdate = true
  }

  decreaseSeeders(): void {
    this._managerSettings.autoSetCrafters = false

    if (this._seeders.length > 0)
      this._seeders.pop()

    this._craftersNeedUpdate = true
  }

  increaseJars(): void {
    this._managerSettings.autoSetCrafters = false

    if ((this.seederCount && this.jarCount) >= MAX_CRAFTERS && this._managerSettings.useCrafterLimit)
      return

    this._jars.push(new Jar())

    this._craftersNeedUpdate = true
  }

  decreaseJars(): void {
    this._managerSettings.autoSetCrafters = false

    if (this._jars.length > 0)
      this._jars.pop()

    this._craftersNeedUpdate = true
  }

  get manualCrafterCounts(): ICrafterCounts {
    return this._manualCrafterCounts
  }

  set manualCrafterCounts(counts: ICrafterCounts) {
    this._manualCrafterCounts = counts
  }

  get crafterData(): ICrafterData[] {
    const seeders = this._seeders.map((seeder) => {
      return {
        type: 'Seeder',
        dedicatedCrop: seeder.dedicatedCrop,
        logs: seeder.combinedLogs,
        lifetimeMinutes: seeder.lifeTimeMinutes,
        elapsedTimeMinutes: seeder.elapsedTimeMinutes,
      } as ICrafterData
    })

    const jars = this._jars.map((jar) => {
      return {
        type: 'Jar',
        dedicatedCrop: jar.dedicatedCrop,
        logs: jar.combinedLogs,
        lifetimeMinutes: jar.lifeTimeMinutes,
        elapsedTimeMinutes: jar.elapsedTimeMinutes,
      } as ICrafterData
    })

    return [...seeders, ...jars]
  }

  get highestTime(): number {
    const seeders = this._seeders.map(seeder => seeder.lifeTimeMinutes)
    const jars = this._jars.map(jar => jar.lifeTimeMinutes)
    const maxMinutes = Math.max(...seeders, ...jars)
    const lastHarvestDay = (this._logs.length > 0) ? this._logs[this._logs.length - 1].day : 0
    const minutesInDays = Math.ceil(maxMinutes / 60)

    // Return the highest time in days, or the last harvest day, whichever is higher
    return Math.max(minutesInDays, lastHarvestDay)
  }
}

function isDedicatedCropEqual(cropA: IDedicatedCrop | null, cropB: IDedicatedCrop | null): boolean {
  if (!cropA && !cropB)
    return true
  if (!cropA || !cropB)
    return false

  return cropA.type === cropB.type && cropA.isStarred === cropB.isStarred
}

export enum CropSortOption {
  StarFirst = 'StarFirst',
  StarLast = 'StarLast',
  Default = 'Default',
}

/**
 * Sorts an array of crop options based on the specified sort option.
 * @param crops - The array of crop options to be sorted.
 * @param sortOption - The sort option to determine the sorting order.
 * @returns The sorted array of crop options.
 */
export function sortCropOptions(crops: ICropOption[], sortOption: CropSortOption): ICropOption[] {
  switch (sortOption) {
    case CropSortOption.StarFirst:
      return crops.sort((cropA, cropB) => {
        if (cropA.isStar && !cropB.isStar)
          return -1
        if (!cropA.isStar && cropB.isStar)
          return 1
        return 0
      })
    case CropSortOption.StarLast:
      return crops.sort((cropA, cropB) => {
        if (cropA.isStar && !cropB.isStar)
          return 1
        if (!cropA.isStar && cropB.isStar)
          return -1
        return 0
      })
    case CropSortOption.Default:
    default:
      return Object.values(CropType).map((cropType) => {
        if (cropType === CropType.None)
          return []

        const existingBaseOption = crops.find(crop => crop.cropType === cropType && !crop.isStar)
        const existingStarOption = crops.find(crop => crop.cropType === cropType && crop.isStar)

        const baseOption: ICropOption = {
          cropType,
          isStar: false,
          option: existingBaseOption?.option ?? CropOption.Crop,
          seeders: existingBaseOption?.seeders ?? 1,
          jars: existingBaseOption?.jars ?? 1,

        }
        const starOption: ICropOption = {
          cropType,
          isStar: true,
          option: existingStarOption?.option ?? CropOption.Crop,
          seeders: existingStarOption?.seeders ?? 1,
          jars: existingStarOption?.jars ?? 1,
        }
        return [starOption, baseOption]
      }).flat()
  }
}
