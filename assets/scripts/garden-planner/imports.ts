// File acts as a central import file for all classes and enums

import Crop from './classes/Crop'
import CropType from './enums/crops'
import Plot from './classes/_Plot'
import Tile from './classes/_Tile'
import Direction from './enums/direction'
import Bonus from './enums/bonus'
import CropCode from './enums/cropcode'
import crops, { getCodeFromCrop, getCropFromCode, getCropFromType } from './crop-list'
import Garden from './classes/Garden'
import Fertiliser from './classes/Fertiliser'
import FertiliserType from './enums/fertiliser'
import fertilisers, { getCodeFromFertiliser, getFertiliserFromCode, getFertiliserFromType } from './fertiliser-list'
import type { ICalculateValueResult, ISimulateYieldResult } from './utils/garden-helpers'

import type { PlotStat } from './types/plotStat'

export {
  Crop,
  Plot,
  Tile,
  Direction,
  Bonus,
  CropType,
  CropCode,
  crops,
  getCropFromCode,
  getCodeFromCrop,
  getCropFromType,
  Garden,
  Fertiliser,
  FertiliserType,
  fertilisers,
  getFertiliserFromType,
  getCodeFromFertiliser,
  getFertiliserFromCode,
  type ICalculateValueResult,
  type ISimulateYieldResult,
}
export type { PlotStat }
