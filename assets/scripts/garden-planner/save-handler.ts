/**
 * File contains methods for converting saves to the latest version
 */

import CropCode from './enums/cropCode'
import type { IHarvesterOptions } from './classes/harvester'
import type { ProcessorSetting, ProcessorSettings } from './classes/processor'
import { parseCropId, type ICropNameWithGrowthDiff, encodeCropId, ItemType } from './utils/garden-helpers'
import { Crop, getCropFromCode } from './imports'
import FertiliserCode from './enums/fertilisercode'


/**
 * Gets the latest set of cropCodes, to be overriden by past iterations
 * - This allows us to not have to update the whole thing everytime there's a new crop
 */
function getCropCodes() {
  return Object.fromEntries(
    Object.values(CropCode).map((cropCode) => [cropCode, cropCode])
  ) as { [key in CropCode]: string }
}

function getFertiliserCodes() {
  return Object.fromEntries(
    Object.values(FertiliserCode).map((cropCode) => [cropCode, cropCode])
  ) as { [key in FertiliserCode]: string }
}

const v0_1CropCodes: { [key in CropCode]: string } = {
  ...getCropCodes(),
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
}

const v0_2CropCodes: { [key in CropCode]: string } = {
  ...getCropCodes(),
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

const v0_2FertCodes: { [key in FertiliserCode]: string } = {
  ...getFertiliserCodes(),
  [FertiliserCode.None]: 'N',
  [FertiliserCode.SpeedyGro]: 'S',
  [FertiliserCode.QualityUp]: 'Q',
  [FertiliserCode.WeedBlock]: 'W',
  [FertiliserCode.HarvestBoost]: 'H',
  [FertiliserCode.HydratePro]: 'Hp',
}

const v0_3CropCodes: { [key in CropCode]: string } = {
  ...getCropCodes(),
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
  [CropCode.SpicyPepper]: 'S',
  [CropCode.NapaCabbage]: 'Cb',
  [CropCode.BokChoy]: 'Bk',
  [CropCode.RockhopperPumpkin]: 'Pm',
  [CropCode.BatterflyBean]: 'Bb'
}

const v0_3FertCodes: { [key in FertiliserCode]: string } = {
  ...getFertiliserCodes(),
  [FertiliserCode.None]: 'N',
  [FertiliserCode.SpeedyGro]: 'S',
  [FertiliserCode.QualityUp]: 'Q',
  [FertiliserCode.WeedBlock]: 'W',
  [FertiliserCode.HarvestBoost]: 'H',
  [FertiliserCode.HydratePro]: 'Y',
}

const v0_4CropCodes: { [key in CropCode]: string } = {
  ...getCropCodes(),
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
  [CropCode.SpicyPepper]: 'S',
  [CropCode.NapaCabbage]: 'Cb',
  [CropCode.BokChoy]: 'Bk',
  [CropCode.RockhopperPumpkin]: 'Pm',
  [CropCode.BatterflyBean]: 'Bt'
}

function getCropCode(codeList: typeof v0_2CropCodes, codeToFind: string) {
  return Object.keys(codeList).find(key => (codeList[key as CropCode] as string) === codeToFind);
}
function getFertCode(codeList: typeof v0_2FertCodes, codeToFind: string) {
  return Object.keys(codeList).find(key => (codeList[key as FertiliserCode] as string) === codeToFind);
}


export function convertV0_1CodestoV0_2(save: string): string {
  let newSave = save.replace("CROPS-", "");
  for (const [key, value] of Object.entries(v0_1CropCodes))
    newSave = newSave.replaceAll(value, v0_2CropCodes[key as CropCode])

  return `CROPS-${newSave}`
}

export function convertV_0_2Codesto_V_0_3(save: string) {

  // Remove the "CROPS-" prefix
  const cropSection = save.replace("CROPS-", "");

  const cropSections = cropSection.split('-')

  // Regex to capture crop and optional fertiliser
  const regex = /([A-Z][a-z]?)(?:\.([A-Z][a-z]?))?/g;

  let match: RegExpExecArray | null;

  let newCode = ''


  for (let i = 0; i < cropSections.length; i++) {
    let newSection = ''

    while ((match = regex.exec(cropSections[i])) !== null) {
      const crop = v0_3CropCodes[(getCropCode(v0_2CropCodes, match[1]) ?? CropCode.None) as CropCode];
      const fertiliser = v0_3FertCodes[(getFertCode(v0_2FertCodes, match[2]) ?? FertiliserCode.None) as FertiliserCode];

      newSection += `${crop}${(fertiliser && fertiliser !== FertiliserCode.None) ? '.' + fertiliser : ''}`;
    }

    if (i < cropSections.length - 1) {
      newSection += '-'
    }
    newCode += newSection
  }

  return `CR-${newCode}`
}

export function convertV_0_3Codesto_V_0_4(save: string) {
  // Remove the prefix
  const cropSections = save.split('-');
  if (["CR", "CROPS"].includes(cropSections[0])) cropSections.shift();

  // Regex to capture crop and optional fertiliser
  const regex = /([A-Z][a-z]?)(?:\.([A-Z][a-z]?))?/g;

  let match: RegExpExecArray | null;

  let newCode = ''


  for (let i = 0; i < cropSections.length; i++) {
    let newSection = ''

    while ((match = regex.exec(cropSections[i])) !== null) {
      const crop = v0_4CropCodes[(getCropCode(v0_3CropCodes, match[1]) ?? CropCode.None) as CropCode];
      const fertiliser = match[2] as FertiliserCode ?? FertiliserCode.None;

      newSection += `${crop}${(fertiliser && fertiliser !== FertiliserCode.None) ? '.' + fertiliser : ''}`;
    }

    if (i < cropSections.length - 1) {
      newSection += '-'
    }
    newCode += newSection
  }

  // console.log(newCode)
  return `CR-${newCode}`
}

export function convertV_0_3SettingsToV_0_4Settings(settings: string): string {
  if (!settings)
    return ''

  const settingsSplit = settings.split('Cr0')

  let convertedCropSettings = ''
  let convertedSettings = ''


  for (let setting of settingsSplit) {
    if (setting.startsWith('.')) {
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


        const cropConverted = v0_4CropCodes[(getCropCode(v0_3CropCodes, code) ?? CropCode.None) as CropCode];
        const newCode = `${cropConverted}${isStar ? '' : '.'}${hasGrowthBoost ? '~' : ''}${processAs === ItemType.Preserve ? 'P' : processAs === ItemType.Seed ? 'S' : ''}${crafters > 1 ? crafters : ''}`

        convertedCropSettings += `${newCode}-`
      }
    } else {
      convertedSettings = setting
    }
  }

  if (convertedCropSettings.length > 0) {
    // remove the trailing dash

    convertedCropSettings = `Cr0.${convertedCropSettings.substring(0, convertedCropSettings.length - 1)}`
    // console.log('convertedCropSettings:', convertedCropSettings)

  }

  return `${convertedSettings}${convertedCropSettings}`
}


/**
 * Converts a save string to an object containing the save version, dimension info, and crop info of the latest version
  * @param save a save code for the garden planner
 */
export function parseSave(save: string) {
  const LATEST_VERSION = '0.4';

  // console.log('Parsing save code...', save);

  // * This format makes it permanent that the first part of the save is the version number
  const [version, ...rest] = save.split('_')
  let dimensionInfo = rest[0] || ''
  let cropInfo = rest[1] || ''
  let settingsInfo = rest[2] || ''
  let strippedVersion = version.replace('v', '');

  // Update the save version iteratively based on the version number
  do {
    if (strippedVersion === '') {
      break
    }

    switch (strippedVersion) {
      case '0.1':
        validatePlotMatrix(dimensionInfo)
        cropInfo = convertV0_1CodestoV0_2(cropInfo)
        strippedVersion = '0.2'
        // console.log('0.1 -> 0.2', cropInfo)
        break
      case '0.2':
        validatePlotMatrix(dimensionInfo)
        cropInfo = convertV_0_2Codesto_V_0_3(cropInfo)
        strippedVersion = '0.3'
        // console.log('0.2 -> 0.3', cropInfo)
        break
      case '0.3':
        validatePlotMatrix(dimensionInfo)
        cropInfo = convertV_0_3Codesto_V_0_4(cropInfo)
        settingsInfo = convertV_0_3SettingsToV_0_4Settings(settingsInfo)
        strippedVersion = '0.4'
        // console.log('0.3 -> 0.4', cropInfo, settingsInfo)
        break
      case '0.4':
        validatePlotMatrix(dimensionInfo)
        cropInfo = cropInfo
        settingsInfo = settingsInfo
        // console.log('0.4 -> Final')
        break
      default:
        throw new Error('Invalid save version')
    }
  } while (strippedVersion !== LATEST_VERSION)

  // console.log('Final stripped version:', strippedVersion)
  // console.log('Final dimensionInfo:', dimensionInfo)
  // console.log('Final cropInfo:', cropInfo)
  // console.log('Final settingsInfo:', settingsInfo)


  return { version: strippedVersion, dimensionInfo, cropInfo, settingsInfo }
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

  if (processorSettings.goldAverageSetting === 'growthTick')
    settings += 'Gt'

  if (harvesterOptions.level !== 0)
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
    settings += `Cr0.${cropSettings}`
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
    level: 0,
    useGrowthBoost: false,
    useStarSeeds: true,
  }

  const processorSettings: ProcessorSettings = {
    cropSettings: new Map(),
    crafterSetting: 0,
    goldAverageSetting: 'crafterTime'
  }

  const settings = settingsInfo.split('Cr0')

  for (let setting of settings) {
    if (setting.startsWith('.')) {
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
        'Gt': () => { processorSettings.goldAverageSetting = 'growthTick' }
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

  return { harvesterOptions, processorSettings }
}

export { convertV0_1CodestoV0_2 as convertV_0_1_to_V_0_2, encodeSettings, decodeSettings }
