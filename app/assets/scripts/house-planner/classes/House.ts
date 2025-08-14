import type { Building } from './building'

export default class House {
  private _buildings: Building[] = []
  private _isHarvestHousePlaced: boolean = false

  get buildings(): Building[] {
    return this._buildings
  }

  get isHarvestHousePlaced(): boolean {
    return this._isHarvestHousePlaced
  }
}
