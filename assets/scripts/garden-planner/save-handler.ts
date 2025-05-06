/**
 * File contains methods for converting saves to the latest version
 */

import CropCode from './enums/cropCode'
import type { IHarvesterOptions } from './classes/harvester'
import type { ProcessorSetting, ProcessorSettings } from './classes/processor'
import { parseCropId, type ICropNameWithGrowthDiff, encodeCropId, ItemType } from './utils/garden-helpers'
import { getCropFromCode } from './imports'


const v0_1CropCodes: { [key in CropCode]: string } = {
  [CropCode.None]: 'Na',
  [CropCode.Tomato]: 'To',
  [CropCode.Potato]: 'Po',
  [CropCode.Rice]: 'Ri',
  [CropCode.Wheat]: 'Wh',
  [CropCode.Carrot]: 'Ca',
  [CropCode.Onion]: 'On',
  [CropCode.Cotton]: 'Co',
  [CropCode.Blueberry]: 'Bl',
  [CropCode.Apple]: 'Ap',
  [CropCode.Corn]: 'Co',
  [CropCode.SpicyPepper]: 'Sp',
  [CropCode.NapaCabbage]: 'Cb',
  [CropCode.BokChoy]: 'Bk',
}

const v0_2CropCodes: { [key in CropCode]: string } = {
  [CropCode.None]: 'N',
  [CropCode.Tomato]: 'T',
  [CropCode.Potato]: 'P',
  [CropCode.Rice]: 'R',
  [CropCode.Wheat]: 'W',
  [CropCode.Carrot]: 'C',
  [CropCode.Onion]: 'O',
  [CropCode.Cotton]: 'Co',
  [CropCode.Blueberry]: 'B',
  [CropCode.Apple]: 'A',
  [CropCode.Corn]: 'Cr',
  [CropCode.SpicyPepper]: 'Sp',
  [CropCode.NapaCabbage]: 'Cb',
  [CropCode.BokChoy]: 'Bk',
}

function convertV0_1CodestoV0_2(save: string): string {
  let newSave = save
  for (const [key, value] of Object.entries(v0_1CropCodes))
    newSave = newSave.replaceAll(value, v0_2CropCodes[key as CropCode])

  return newSave
}

/**
 * Converts a save string to an object containing the save version, dimension info, and crop info of the latest version
  * @param save a save code for the garden planner
 */
function parseSave(save: string) {
  // * This format makes it permanent that the first part of the save is the version number
  const [version, ...rest] = save.split('_')
  let dimensionInfo = ''
  let cropInfo = ''
  let settingsInfo = ''

  const strippedVersion = version.replace('v', '')

  switch (strippedVersion) {
    case '0.1':
      validatePlotMatrix(rest[0])
      dimensionInfo = rest[0]
      cropInfo = convertV0_1CodestoV0_2(rest[1])
      return { version, dimensionInfo, cropInfo, settingsInfo }
    case '0.2':
      validatePlotMatrix(rest[0])
      dimensionInfo = rest[0]
      cropInfo = rest[1]
      return { version, dimensionInfo, cropInfo, settingsInfo }
    case '0.3':
      validatePlotMatrix(rest[0])
      dimensionInfo = rest[0]
      cropInfo = rest[1]
      settingsInfo = rest[2]
      return { version, dimensionInfo, cropInfo, settingsInfo }
    default:
      throw new Error('Invalid save version')
  }
}

/**
 * Validates dimension info for pre-rewrite saves
 * @param dimensionInfo a string containing a 2d array of 0s and 1s (e.g. 111-010-111)
 * @throws Error if the dimension info is invalid
 */
function validatePlotMatrix(dimensionInfo: string) {
  const dimensions = dimensionInfo.split('-').splice(1)
  const rowSize = dimensions.length
  const colSize = dimensions[0].length

  // Dimension info must be 0 or 1
  for (let i = 0; i < rowSize; i++) {
    for (let j = 0; j < colSize; j++) {
      if (dimensions[i][j] !== '0' && dimensions[i][j] !== '1')
        throw new Error('Invalid dimension info')
    }
  }

  // * Removed to allow illegal plot counts
  // // Count the number of active plots
  // const maxPlots = 9
  // const activePlots = dimensions.flat().map((row) => {
  //   return row.split('').filter(col => col === '1').length
  // }).reduce((acc, curr) => acc + curr)

  // if (activePlots > maxPlots)
  //   throw new Error(`Too many active plots: ${activePlots} > ${maxPlots}`)
}

function encodeSettings(harvesterOptions: IHarvesterOptions, processorSettings: ProcessorSettings): string {
  let settings = ''

  if (harvesterOptions.days !== -1)
    settings += `D${harvesterOptions.days}`

  if (!harvesterOptions.includeReplant)
    settings += 'Nr'

  if (!harvesterOptions.includeReplantCost)
    settings += 'Nrc'

  if (harvesterOptions.useGrowthBoost)
    settings += 'Gb'

  if (!harvesterOptions.useStarSeeds)
    settings += 'Nss'

  if (harvesterOptions.level !== 25)
    settings += `L${harvesterOptions.level}`

  let cropSettings = ''

  for (const [cropId, setting] of processorSettings.cropSettings) {
    if (setting.processAs === 'crop')
      continue

    const cropIdData = parseCropId(cropId)

    // TODO: Convert to cropCode from IGrowthBoost
    cropSettings += cropIdData.code

    // `.` indicates that the crop is not a star seed.
    if (!setting.isStar)
      cropSettings += '.'

    if (cropIdData.hasGrowthBoost)
      cropSettings += '~'

    // P for preserve, S for seed
    cropSettings += `${setting.processAs[0].toUpperCase()}`

    // Number of crafters (default is 1)
    if (setting.crafters !== 1)
      cropSettings += `${setting.crafters}`

    // // Commented out due to not being used
    // if (setting.targetTime !== 0)
    //   settings += `Tt${setting.targetTime}`
    cropSettings += '-'
  }

  if (cropSettings.length > 0) {
    settings += `Cr0${cropSettings}`
  }

  // check for trailing underscore or trailing dash
  if (settings[settings.length - 1] === '_' || settings[settings.length - 1] === '-')
    return settings.slice(0, -1)


  return settings
}
function decodeSettings(settingsInfo: string): { harvesterOptions: IHarvesterOptions, processorSettings: ProcessorSettings } {
  const harvesterOptions: IHarvesterOptions = {
    days: -1,
    includeReplant: true,
    includeReplantCost: true,
    level: 25,
    useGrowthBoost: false,
    useStarSeeds: true,
  }

  const processorSettings: ProcessorSettings = {
    cropSettings: new Map(),
    crafterSetting: 0,
  }

  const settings = settingsInfo.split('Cr')

  for (let setting of settings) {
    if (setting.startsWith('0')) {
      setting = setting.slice(1)
    
      const cropSettings = setting.split('-')
      for (const cropSetting of cropSettings) {

        if (cropSetting.length === 0) continue

        const codeMatch = cropSetting.match(/^([A-Z][a-z]?)(\.?)(~?)([PS]?)(\d*)/);


        if (!codeMatch) {
          throw new Error(`Invalid crop setting format: ${cropSetting}`)
        }

        const code = codeMatch[1] as CropCode
        const isStar = codeMatch[2] !== '.'
        const hasGrowthBoost = codeMatch[3] === '~'
        const processAs = codeMatch[4] === 'P' ? ItemType.Preserve : codeMatch[4] === 'S' ? ItemType.Seed : ItemType.Crop
        const crafters = codeMatch[5] ? parseInt(codeMatch[5], 10) : 1
        const type = getCropFromCode(code)!.type

        const cropId = encodeCropId({ type, isStar, hasGrowthBoost: hasGrowthBoost })

        const setting: ProcessorSetting = {
          count: 0,
          cropType: type,
          isStar,
          processAs,
          crafters,
          targetTime: 0,
          isActive: true,
          hasPreserve: processAs === 'preserve',
        }

        processorSettings.cropSettings.set(cropId, setting)
      }
    } else {
      const harvesterSettings = (setting.match(/[A-Z][a-z0-9]*/g) as string[]) || []
      const exactHandlers: Record<string, () => void> = {
        'Nr': () => { harvesterOptions.includeReplant = false; },
        'Nrc': () => { harvesterOptions.includeReplantCost = false; },
        'Nss': () => { harvesterOptions.useStarSeeds = false; },
        'Gb': () => { harvesterOptions.useGrowthBoost = true; },
      };
      
      for (const harvesterSetting of harvesterSettings) {
        if (exactHandlers[harvesterSetting]) {
          exactHandlers[harvesterSetting]();
          continue;
        }
      
        const match = harvesterSetting.match(/^([A-Z])(\d+)$/);
        if (match) {
          const [, prefix, value] = match;
          const number = parseInt(value);
      
          switch (prefix) {
            case 'D':
              harvesterOptions.days = number;
              break;
            case 'L':
              harvesterOptions.level = number;
              break;
          }
        }
      }
    }
  }

  // console.log('Processor Settings:', processorSettings)
  // console.log('Harvester Options:', harvesterOptions)

  return { harvesterOptions, processorSettings }
}

export { convertV0_1CodestoV0_2 as convertV_0_1_to_V_0_2, parseSave, encodeSettings, decodeSettings }
