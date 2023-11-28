import uniqid from 'uniqid'
import type FertiliserType from '../enums/Fertiliser'
import type Bonus from '../enums/bonus'

class Fertiliser {
  private _type: FertiliserType
  private _effect: Bonus
  private _image: string
  private _id: string = uniqid()

  constructor(
    type: FertiliserType,
    effect: Bonus,
    image: string,
    id: string = uniqid(),
    // cost: number,
  ) {
    this._type = type
    this._effect = effect
    this._image = image
    this._id = id
    // this._cost = cost
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

  // id can be set so that fertilisers used on large crops can be identified
  set id(id: string) {
    this._id = id
  }
}

export default Fertiliser
