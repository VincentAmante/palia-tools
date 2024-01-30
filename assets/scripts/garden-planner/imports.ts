// File acts as a central import file for all classes and enums

import Crop from './classes/crop'
import CropType from './enums/crops'
import Plot from './classes/plot'
import Tile from './classes/tile'
import Direction from './enums/direction'
import Bonus from './enums/bonus'
import CropCode from './enums/cropCode'
import crops, { getCodeFromCrop, getCropFromCode, getCropFromType } from './cropList'
import Garden from './classes/garden'
import Fertiliser from './classes/fertiliser'
import FertiliserType from './enums/fertiliser'
import fertilisers, { getCodeFromFertiliser, getFertiliserFromCode, getFertiliserFromType } from './fertiliserList'
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
  ICalculateValueResult,
  ISimulateYieldResult,
}
export type { PlotStat }
