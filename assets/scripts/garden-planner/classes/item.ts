export class Item {
  readonly name: string
  readonly image: string
  readonly price: number
  private readonly isStar: boolean
  private readonly maxStack: number
  private _count = 0

  constructor(name: string, image: string, price: number, isStar: boolean, maxStack: number) {
    this.name = name
    this.image = image
    this.price = price
    this.isStar = isStar
    this.maxStack = maxStack
  }

  equals(item: Item): boolean {
    return (item.name === this.name && item.isStar === this.isStar)
  }

  get count(): number {
    return this._count
  }

  set count(count: number) {
    this._count = count
  }

  add(count: number): void {
    this._count += count
  }

  /**
   * Returns an array of duplicate items that represent how many stacks of this item are in the inventory.
   */
  get inventoryStacks(): Item[] {
    const stack: Item[] = []
    const stackAmount = Math.ceil(this._count / this.maxStack)
    const lastStackAmount = this._count % this.maxStack

    for (let i = 0; i < stackAmount; i++) {
      if (i === stackAmount - 1)
        stack.push(new Item(this.name, this.image, this.price, this.isStar, lastStackAmount))
      else
        stack.push(new Item(this.name, this.image, this.price, this.isStar, this.maxStack))
    }
    return stack
  }

  // takes any number of items and combines them into stacks of this item
  combineIntoStacks(...items: Item[]): Item[] {
    items.forEach((item) => {
      this._count += item.count
    })

    return this.inventoryStacks
  }
}
