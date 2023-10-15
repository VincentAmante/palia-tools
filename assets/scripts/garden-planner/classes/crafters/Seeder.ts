import type { CropItem } from '../items/item'
import { ItemType } from '../items/item'
import type { ICrafter } from './ICrafter'

export class Seeder implements ICrafter {
  name: string = 'Seeder'
  type: ItemType.Seed = ItemType.Seed
  hopperSlots: CropItem[] = []
  maxHopperSlots: number = 1
  outputSlots: CropItem[] = []
  maxOutputSlots: number = 3
  acceptedItems: ItemType[] = [ItemType.Crop]
  lifeTimeMinutes: number = 0
  elapsedTimeMinutes: number = 0

  process(): void {
    throw new Error('Method not implemented.')
    const cropToProcess = this.hopperSlots[0]
    const cropType = cropToProcess.cropType
  }

  // Returns true if the item was fully inserted
  insertItem(item: CropItem): boolean {
    // Accepts only crops for seeding
    if (!this.acceptedItems.includes(item.type))
      return false

    if (this.hopperSlots.length >= this.maxHopperSlots) {
      const matchingItems = this.hopperSlots
        .filter(hopperItem => hopperItem.equals(item))

      if (matchingItems.length > 0) {
        matchingItems.forEach((hopperItem) => {
          const addableCount = hopperItem.maxStack - hopperItem.count
          if (addableCount > 0) {
            const itemCount = item.count
            hopperItem.add(Math.min(addableCount, itemCount))
            item.count -= Math.min(addableCount, itemCount)
          }
        })
      }

      return item.count === 0
    }
    else if (this.hopperSlots.length < this.maxHopperSlots) {
      if (this.hopperSlots.length > 0) {
        const matchingItems = this.hopperSlots
          .filter(hopperItem => hopperItem.equals(item))

        if (matchingItems.length > 0) {
          matchingItems.forEach((hopperItem) => {
            const addableCount = hopperItem.maxStack - hopperItem.count
            if (addableCount > 0) {
              const itemCount = item.count
              hopperItem.add(Math.min(addableCount, itemCount))
              item.count -= Math.min(addableCount, itemCount)
            }
          })

          return item.count === 0
        }
        else {
          this.hopperSlots.push(item)
          return true
        }
      }
    }

    return false
  }
}
