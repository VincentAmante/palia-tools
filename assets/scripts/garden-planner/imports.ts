// File acts as a central import file for all classes and enums

import Crop from './classes/Crop'
import CropType from './enums/cropType'
import Plot from './classes/Plot'
import Tile from './classes/Tile'
import Direction from './enums/direction'
import Bonus from './enums/bonus'
import CropCode from './enums/cropCode'
import crops, { getCodeFromCrop, getCropFromCode, getCropFromType } from './cropList'
import Garden from './classes/Garden'
import Fertiliser from './classes/Fertiliser'
import FertiliserType from './enums/fertiliser'
import fertilisers, { getCodeFromFertiliser, getFertiliserFromCode, getFertiliserFromType } from './fertiliserList'
import type { ICalculateValueResult, ISimulateYieldResult } from './utils/gardenHelpers'
import { Jar } from './classes/Crafters/Jar'

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
  Jar,
}

export type { PlotStat }
