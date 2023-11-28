// This file will handle all the logic for the crafters
import { CropType } from '../../imports'
import type { HarvestInventory, HarvestSimulatorLog } from '../../utils/gardenHelpers'
import type { CropItem } from '../Items/Item'
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

interface ICropOptions {
  star: Record<CropType, CropOption>
  base: Record<CropType, CropOption>
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

  private _logs: HarvestSimulatorLog[] = []
  private _inventory: HarvestInventory = {} as HarvestInventory

  private _cropOptions: ICropOptions = {
    star: (Object.keys(CropType) as CropType[]).reduce((acc, cropType) => {
      acc[cropType] = CropOption.Crop
      return acc
    }, {} as Record<CropType, CropOption>),
    base: (Object.keys(CropType) as CropType[]).reduce((acc, cropType) => {
      acc[cropType] = CropOption.Crop
      return acc
    }, {} as Record<CropType, CropOption>),
  }

  private _distributionMethod: DistributionMethod = DistributionMethod.Dedicated

  _managerSettings = {
    // Whether or not crafters should insert crops based  on the day of harvest
    useDaySeparation: true,
  }

  constructor() {
    console.log(this._cropOptions)
  }

  get seeders(): Seeder[] {
    return this._seeders
  }

  get cropOptions(): ICropOptions {
    return this._cropOptions
  }

  set cropOptions(options: ICropOptions) {
    this._cropOptions = options
  }

  setSeeders(seeders: number) {
    if (seeders < 0)
      return
    if (seeders > this._seeders.length) {
      for (let i = 0; i < seeders - this._seeders.length; i++)
        this._seeders.push(new Seeder())
    }
    else if (seeders < this._seeders.length) {
      for (let i = 0; i < this._seeders.length - seeders; i++)
        this._seeders.pop()
    }
  }

  get jars(): Jar[] {
    return this._jars
  }

  setJars(jars: number) {
    if (jars < 0)
      return
    if (jars > this._jars.length) {
      for (let i = 0; i < jars - this._jars.length; i++)
        this._jars.push(new Jar())
    }
    else if (jars < this._jars.length) {
      for (let i = 0; i < this._jars.length - jars; i++)
        this._jars.pop()
    }
  }

  decreaseSeeders(): void {
    if (this._seeders.length > 0)
      this._seeders.pop()
  }

  private distributeVip(cropItems: CropItem[]): void {

  }
}
