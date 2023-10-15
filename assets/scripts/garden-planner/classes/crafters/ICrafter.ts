import type { Item, ItemType } from '../items/item'

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

  process(): void

  // returns true if the item was successfully inserted
  insertItem(item: Item): boolean
}
