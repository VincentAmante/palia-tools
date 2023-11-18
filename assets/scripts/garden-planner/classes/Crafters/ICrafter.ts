import type { Item, ItemType } from '../items/Item'

export interface InsertItemArgs {
  day: number
  item: Item
}

export interface ICrafter {
  readonly name: string
  hopperSlots: Item[]
  maxHopperSlots: number
  outputSlots: Item[]
  maxOutputSlots: number
  acceptedItems: ItemType[]
  // how much time the crafter has been processing items, including time spent unused
  lifeTimeMinutes: number
  // how much time the crafter has been processing items, excluding time spent unused
  // useful for seeing how long the crafter has been idle
  elapsedTimeMinutes: number
  settings: {
    useStackLimit: boolean
    useHopperLimit: boolean
  }
  goldGenerated: number

  process(): void

  // returns true if the item was successfully inserted
  insertItem(itemData: InsertItemArgs): boolean

  setSettings(settings: Partial<ICrafter['settings']>): void
}
