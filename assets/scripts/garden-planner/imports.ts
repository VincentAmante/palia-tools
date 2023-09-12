// File acts as a central import file for all classes and enums for use outside of the scripts folder
import Direction from '../utils/enums/direction'
import Crop from './classes/crop'
import CropType from './enums/crops'
import Plot from './classes/plot'
import Tile from './classes/tile'
import Bonus from './enums/bonus'
import CropCode from './enums/cropcode'
import crops, { getCodeFromCrop, getCropFromCode, getCropFromType } from './crop-list'
import Garden from './classes/garden'
import Fertiliser from './classes/fertiliser'
import FertiliserType from './enums/fertiliser'
import fertilisers, { getCodeFromFertiliser, getFertiliserFromCode, getFertiliserFromType } from './fertiliser-list'

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
}
export type { PlotStat }
