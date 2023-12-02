// This file will handle all the logic for the crafters
import { CropType } from '../../imports'
import { createItemFromCropType } from '../../utils/gardenHelpers'
import { type HarvestSimulatorLog, getCropMap } from '../../utils/gardenHelpers'
import type { IShippingBin } from '../ShippingBin'
import { Seeder } from './Seeder'
import { Jar } from './Jar'

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

  // ? Do we need to track the number of seeders/jars for each crop here?
  seeders: number
  jars: number
}
export type ICropOptions = ICropOption[]

export interface IManagerSettings {
  useDaySeparation: boolean
  autoSetCrafters: boolean
  useCrafterLimit: boolean
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

  private _crafterSettings = {
    useStackLimit: true,
    useHopperLimit: true,
    includeNormalSeeds: true,
    useDayLimit: true,
  }

  private _craftersNeedUpdate = true

  private _logs: HarvestSimulatorLog[] = []

  private _toProcess: HarvestInventory = getCropMap()

  private _managerSettings: IManagerSettings = {
    // Whether or not crafters should insert crops based on the day of harvest
    useDaySeparation: true,
    // Whether or not crafters are set based on the number of crops set to a produce option
    autoSetCrafters: true,
    // Whether to respect the limit of 30 crafters
    useCrafterLimit: false,
  }

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

    if (this._logs.length === 0)
      return

    const firstDay = this._logs[0].day
    const lastDay = this._logs[this._logs.length - 1].day
    this._toProcess = getCropMap()

    // reset each crafter's time
    for (const seeder of this._seeders)
      seeder.resetTime()
    for (const jar of this._jars)
      jar.resetTime()

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

          // Adds the crops to be set for processing
          if (baseOption?.option !== CropOption.Crop) {
            this._toProcess[cropType as CropType].base += cropYield.base
          }
          else {
            if (cropYield.base > 0)
              shippingBin.add(day, createItemFromCropType(cropType as CropType, false, cropYield.base))
          }

          // Adds the star crops to be set for processing
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

      console.log(`Day ${day} complete`)
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
      const result = seeder.collect()
      if (result.length > 0)
        shippingBin.add(day, ...result)
    }
    for (const jar of this._jars) {
      const result = jar.collect()
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

    // * Switch off the update flag
    // prevents the crafters from being updated again until a change occurs to either the crafters or the crop options
    this._craftersNeedUpdate = false
  }

  private setCraftersDedicated(): void {
    const seeders: Seeder[] = []
    const jars: Jar[] = []

    this._cropOptions.forEach((cropOption) => {
      for (let i = 0; i < cropOption.seeders; i++) {
        if (cropOption.option === CropOption.Seed
          && (this.crafterCount >= MAX_CRAFTERS || !this._managerSettings.useCrafterLimit)) {
          const seeder = new Seeder()
          seeder.dedicatedCrop = cropOption.cropType
          seeders.push(seeder)
        }
      }

      for (let i = 0; i < cropOption.jars; i++) {
        if (cropOption.option === CropOption.Preserve
          && (this.crafterCount >= MAX_CRAFTERS || !this._managerSettings.useCrafterLimit)) {
          const jar = new Jar()
          jar.dedicatedCrop = cropOption.cropType
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

      if (option === CropOption.Seed)
        crafters = this._seeders.filter(seeder => seeder.dedicatedCrop === cropType)
      else if (option === CropOption.Preserve)
        crafters = this._jars.filter(jar => jar.dedicatedCrop === cropType)

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

  set logs(logs: HarvestSimulatorLog[]) {
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
    console.log(options)
    this._cropOptions = options
    this._craftersNeedUpdate = true
  }

  // Manual override till we fully replace the old system
  setCropOption(type: CropType, isStar: boolean, option: CropOption): void {
    const cropOption = this._cropOptions.find(cropOption => cropOption.cropType === type && cropOption.isStar === isStar)

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
