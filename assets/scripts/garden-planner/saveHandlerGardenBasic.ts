
import uniqid from 'uniqid'
import CropCode from './enums/cropCode'
import type { IHarvesterOptions } from './classes/harvester'
import type { ProcessorSetting, ProcessorSettings } from './classes/processor'
import { parseCropId, encodeCropId, ItemType } from './utils/garden-helpers'
import { Crop, getCropFromCode, getCropFromType, getFertiliserFromCode } from './imports'
import FertiliserCode from './enums/fertilisercode'
import { LATEST_VERSION } from './types/version'
import CropSize from './enums/crop-size'

interface GridTileBasic {
  crop: CropCode | null;
  fertiliser: FertiliserCode | null;
  plotId: string
}
interface PlotBasic {
  startCoords: { x: number, y: number }
  tiles: Map<string, GridTileBasic>
  id: string
  index: number
}

function getDimensions(size: CropSize) {
  switch (size) {
    case CropSize.Bush:
      return {
        width: 2,
        height: 2
      }

    case CropSize.Tree:
      return {
        width: 3,
        height: 3
      }

    case CropSize.Single:
    default:
      return {
        width: 1,
        height: 1
      }
  }
};

function compressPlotString(tiles: string[]) {

    if (tiles.length === 0) return '';

    const compressed = [];
    let current = tiles[0];
    let count = 0;

    for (const tile of tiles) {
        if (tile === current) {
            count++
        } else {
            compressed.push(`${current}${(count > 1 ? count : '')}`)
            current = tile
            count = 1
        }
    }

    compressed.push(`${current}${(count > 1 ? count : '')}`)

    return compressed.join('');
}


export function expandPlotCode(code: string): string[] {
  const tokens = code.match(/[A-Z][a-z]*(?:\.[A-Z][a-z]*)?\d*/g) || [];

  return tokens.flatMap(token => {
    const match = token.match(/^([A-Z][a-z]*(?:\.[A-Z][a-z]*)?)(\d*)$/);
    if (!match) return [];

    const base = match[1];
    const count = match[2] ? parseInt(match[2], 10) : 1;

    // Prevent memory overflow from malicious/accidental huge numbers
    return Array(Math.min(count, 1000)).fill(base);
  });
}

class GardenSaveConverterError extends Error {
  constructor(message: string){
    super(message)
    this.name = 'GardenSaveConverterError'
  }
}

export const PLOT_DIMENSION_REGEX = /^(\d+)x(\d+)(.*)/
export const CROP_FERTILISER_REGEX = /([A-Z][a-z]?)(?:\.([A-Z][a-z]?))?/
/**
 * A rough simulation of the GardenGrid class.
 * Made just to convert a 04 code, as I do not know a better way to go about it
 */
export class GardenGridBasic {
  private _tiles: Map<string, GridTileBasic> = new Map()
  private _plots: Map<string, PlotBasic> = new Map()
  private _dimensionCode: string;
  private _cropInfoCode: string;

  constructor(v04DimensionInfo: string, v04CropInfo: string) {

    const dimensionRows = (v04DimensionInfo.replace('D-', '').split('-'))
    const cropInfo = v04CropInfo.replace('CR-', '').split('-')

    let widthInTiles = 0
    let heightInTiles = 0
    let maxWidthInTiles = Number.NEGATIVE_INFINITY

    if (dimensionRows.length === 0) throw new GardenSaveConverterError('Invalid dimensions')
    let startY = 0
    let startX = 0
    const startCoords: { x: number, y: number }[] = []

    for (const y of dimensionRows) {
      for (const x of y) {
        if (x !== '1' && x !== '0') throw new GardenSaveConverterError('plot has invalid format')

        if (x === '1') {
          startCoords.push({ x: startX, y: startY })
        }

        startX += 3
        widthInTiles += 3
        continue
      }

      maxWidthInTiles = Math.max(maxWidthInTiles, widthInTiles)
      heightInTiles += 3
      widthInTiles = 0
      startY += 3
      startX = 0
    }

    if (startCoords.length !== cropInfo.length) throw new GardenSaveConverterError('number of plots dont match')

    // First, initialise all the tiles
    for (let p = 0; p < startCoords.length; p++) {
      const startCoordinates = startCoords[p]

      if (!startCoordinates) {
        continue
      }

      const newPlotId = uniqid()
      const newPlot = {
        startCoords: startCoordinates,
        tiles: new Map(),
        id: newPlotId,
        index: p
      } satisfies PlotBasic

      const newTiles: Map<string, GridTileBasic> = new Map()
      for (let y = 0; y < 3; y++) {
        for (let x = 0; x < 3; x++) {
          const newTile = {
            crop: null,
            fertiliser: null,
            plotId: newPlotId
          }

          const tileCoords = `${startCoordinates.x + x},${startCoordinates.y + y}`
          this._tiles.set(tileCoords, newTile)
          newTiles.set(tileCoords, newTile)
        }
      }

      newPlot.tiles = newTiles
      this._plots.set(`${startCoordinates.x}x${startCoordinates.y}`, newPlot)
    }


    // Begin placing crops
    for (const [plotCoords, plot] of this._plots) {
      const tileCodeString = cropInfo[plot.index]
      if (!tileCodeString) throw new GardenSaveConverterError('tileCode not found')
      const tileCode = expandPlotCode(tileCodeString)

      let tileIndex = 0

      if (tileCode.length !== 9) throw new GardenSaveConverterError(`Plot does not have exactly 9 tiles: ${tileCode.join(',')} (${tileCode.length})`)

      for (let y = 0; y < 3; y++) {
        for (let x = 0; x < 3; x++) {
          const code = tileCode[tileIndex]

          if (tileIndex >= 9 || !code) throw new GardenSaveConverterError('index invalid')

          const plotCoordsMatch = plotCoords.match(PLOT_DIMENSION_REGEX)
          if (!plotCoordsMatch) throw new GardenSaveConverterError(`plot coords does not meet regex format ${code}`)
          const [_, plotX, plotY] = plotCoordsMatch
          if (!plotX || !plotY) throw new GardenSaveConverterError(`plot coord invalid ${plotX},${plotY}`)

          const codeSplit = CROP_FERTILISER_REGEX.exec(code)

          if (!codeSplit || !codeSplit[1]) throw new GardenSaveConverterError(`CropCode not found ${codeSplit} ${codeSplit?.[1]}`)

          const newTileCoords = { x: x + parseInt(plotX), y: y + parseInt(plotY) }

          this.placeCrop(newTileCoords, codeSplit[1] as CropCode)
          if (codeSplit[2] && codeSplit[2] !== FertiliserCode.None) {
            this.placeFertiliser(newTileCoords, codeSplit[2] as FertiliserCode)
          }

          tileIndex++
        }
      }
    }
    
    // Finally, begin forming the saveCode

    const dimensionInfoCode = `D-${maxWidthInTiles}x${heightInTiles}`
    const cropInfoCode: string[] = ['CR']

    for (const [plotCoords, plot] of this._plots) {
      const plotString = []

      for (let y = 0; y < 3; y++) {
        for (let x = 0; x < 3; x++) {

          const plotCoordsMatch = plotCoords.match(PLOT_DIMENSION_REGEX)
          if (!plotCoordsMatch) throw new GardenSaveConverterError(`plot coords does not meet regex format: ${plotCoords}`)
          const [_, plotX, plotY] = plotCoordsMatch
          if (!plotX || !plotY) throw new GardenSaveConverterError(`plot coord invalid: ${plotX},${plotY}`)

          const tile = this._tiles.get(`${x + parseInt(plotX)},${y + parseInt(plotY)}`)
          if (!tile) throw new GardenSaveConverterError('Tile not found')
          if (!tile.crop) throw new GardenSaveConverterError('Even empty tiles must have NULL')
          const fertString = tile.fertiliser ? `.${tile.fertiliser}` : ''
          const tileString = `${tile.crop}${fertString}`

          plotString.push(tileString)
        }
      }

      cropInfoCode.push([plotCoords, compressPlotString(plotString)].join(''))
    }

    this._dimensionCode = dimensionInfoCode
    this._cropInfoCode = cropInfoCode.join('-')

    console.log('finished conversion')
  }

  private placeCrop(coordinates: { x: number, y: number }, cropCode: CropCode) {
    const tile = this._tiles.get(`${coordinates.x},${coordinates.y}`)
    if (!tile) throw new GardenSaveConverterError('Tile missing')

    // If there's already a CropCode, ignore it
    if (tile.crop) return

    const actualCrop = getCropFromCode(cropCode)
    const cropSize = actualCrop.size
    const { width, height } = getDimensions(cropSize)

    const tilesToPlace = this.getTiles(coordinates, cropSize)

    if (tilesToPlace.hasInvalid) throw new GardenSaveConverterError('tiles missing / invalid placement')
    if (!tilesToPlace.tiles[0]) throw new GardenSaveConverterError('start tile missing')

    const startTile = this._tiles.get(tilesToPlace.tiles[0])
    if (!startTile) throw new GardenSaveConverterError('invalid tile')

    startTile.crop = cropCode

    this._tiles.set(tilesToPlace.tiles[0], startTile)

    /**
     * For any non-starting tile, simply place CropCode.None
     */
    for (let i = 1; i < (width * height); i++) {
      const tileCoords = tilesToPlace.tiles[i]
      if (!tileCoords) throw new GardenSaveConverterError('invalid tile coords')
      const tile = this._tiles.get(tileCoords)
      if (!tile) throw new GardenSaveConverterError('invalid tile')

      tile.crop = CropCode.None

      this._tiles.set(tileCoords, tile)
    }
  }

  private placeFertiliser(coordinates: { x: number, y: number }, fertiliserCode: FertiliserCode) {
    const tile = this._tiles.get(`${coordinates.x},${coordinates.y}`)
    if (!tile) throw new GardenSaveConverterError('Tile missing')

    /**
     * Usually, only the starting crop of large crops would have a fertiliser, so no need to check for crop sizes and such
     */
    tile.fertiliser = fertiliserCode
    this._tiles.set(`${coordinates.x},${coordinates.y}`, tile)
  }

  private getTiles(coordinates: { x: number, y: number }, size: CropSize) {
    const fetchedTiles: string[] = []
    let hasInvalidTiles = false

    const { width, height } = getDimensions(size)

    for (let w = 0; w < width; w++) {
      for (let h = 0; h < height; h++) {
        const newTileCoordinates = `${coordinates.x + w},${coordinates.y + h}`

        const checkedTile = this._tiles.get(newTileCoordinates)

        if (checkedTile) {
          fetchedTiles.push(newTileCoordinates)
        } else {
          hasInvalidTiles = true
        }
      }
    }

    return {
      tiles: fetchedTiles,
      hasInvalid: hasInvalidTiles
    }
  }

  get dimensionInfoCode(){
    return this._dimensionCode
  }

  get cropInfoCode(){
    return this._cropInfoCode
  }
}