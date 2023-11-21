import type { CropLogItem, IItem, ItemType, LogItem } from '../Items/Item'

export interface InsertItemArgs {
  day: number
  item: IItem
}

type LoggableItem = LogItem | CropLogItem

export interface ICrafter {
  readonly name: string
  hopperSlots: IItem[]
  maxHopperSlots: number
  outputSlots: IItem[]
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

  // Track the items that are inserted into the crafter on a given day
  logs: {
    insertions: Record<number, LoggableItem[]>
    collections: Record<number, LoggableItem[]>
  }

  process(): void

  // returns true if the item was successfully inserted
  insertItem(itemData: InsertItemArgs): boolean

  setSettings(settings: Partial<ICrafter['settings']>): void

  collect(day: number): IItem[]
}
