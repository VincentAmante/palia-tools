// This file will handle all the logic for the crafters
import type { CropType } from '../../imports'
import { getCropMap } from '../../utils/garden-helpers'
import { Seeder } from './Seeder'

export class CrafterManager {
  _seeders: Seeder[] = []
  _queue: Record<number, Record<CropType, { base: number; star: number }>> = {}
  _crafterSettings = {
    useStackLimit: true,
    useHopperLimit: true,
    includeNormalSeeds: true,
  }

  _managerSettings = {
    // Whether or not crafters should insert crops based  on the day of harvest
    useDaySeparation: true,
  }

  // All crops without day separation
  _allCrops = getCropMap()

  constructor() {
    this._seeders = [new Seeder()]
    this._seeders.forEach((seeder) => {
      seeder.setSettings(this._crafterSettings as Seeder['settings'])
    })
  }

  get seeders(): Seeder[] {
    return this._seeders
  }

  increaseSeeders(): void {
    const newSeeder = new Seeder()
    newSeeder.setSettings(this._crafterSettings as Seeder['settings'])
    this._seeders.push(newSeeder)
  }

  decreaseSeeders(): void {
    if (this._seeders.length > 0)
      this._seeders.pop()
  }

  process(): void {
    this._seeders.forEach((seeder) => {
      seeder.process()
    })
  }

  addToQueue(day: number, cropType: CropType, base: number, star: number): void {
    if (!this._queue[day])
      this._queue[day] = {} as Record<CropType, { base: number; star: number }>
    this._queue[day][cropType] = { base, star }

    this._allCrops[cropType].base += base
    this._allCrops[cropType].star += star
  }

  distributeQueue(): void {
    const { useDaySeparation } = this._managerSettings
    if (useDaySeparation) {

    }
  }
}
