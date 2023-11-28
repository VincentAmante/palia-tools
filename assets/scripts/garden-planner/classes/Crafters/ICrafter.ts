import type { CropLogItem, IItem, LogItem } from '../Items/Item'
import type ItemType from '../../enums/itemType'

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
  readonly lifeTimeMinutes: number
  // how much time the crafter has been processing items, excluding time spent unused
  // useful for seeing how long the crafter has been idle
  readonly elapsedTimeMinutes: number
  settings: {
    useStackLimit: boolean
    useHopperLimit: boolean
  }
  readonly goldGenerated: number
  // Track the items that are inserted into the crafter on a given day
  readonly logs: {
    insertions: Record<number, LoggableItem[]>
    collections: Record<number, LoggableItem[]>
  }

  // Converts the items in the hopper into output items as per the crafter's rules
  process(tillDay: number): void

  // returns true if the item was successfully inserted
  insertItem(itemData: InsertItemArgs): boolean

  setSettings(settings: Partial<ICrafter['settings']>): void

  // empties the output slots and returns the items that were in them
  collect(day: number): IItem[]
}
