import uniqid from 'uniqid'
import type FertiliserType from '../enums/fertiliser'
import type Bonus from '../enums/bonus'


interface IFertiliserCostSources {
  zekiBatchPrice: number // how much gold per batch (Zeki's)
  zekiBatchCount: number // amount per gold batch purchase

  guildBatchPrice: number // how many medals to buy a batch (Guild Store)
  guildBatchCount: number // amount per medal batch purchase

  goldSellValue: number // sell value
}

interface IFertiliserConstructorParams {
  type: FertiliserType,
  effect: Bonus,
  image: string,
  id?: string,
  costs: IFertiliserCostSources
}
class Fertiliser {
  private _type: FertiliserType
  private _effect: Bonus
  private _image: string
  private _id: string = uniqid()
  private _costs: IFertiliserCostSources

  constructor(params: IFertiliserConstructorParams
  ) {
    const { type, effect, image, id, costs } = params

    this._type = type
    this._effect = effect
    this._image = image
    if (id) {
      this._id = id
    }
    this._costs = costs
  }

  get type(): FertiliserType {
    return this._type
  }

  get effect(): Bonus {
    return this._effect
  }

  get image(): string {
    return this._image
  }

  get id(): string {
    return this._id
  }

  get costs(): IFertiliserCostSources {
    return this._costs
  }

  // id can be set so that fertilisers used on large crops can be identified
  set id(id: string) {
    this._id = id
  }
}

export default Fertiliser
