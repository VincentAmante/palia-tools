/* eslint-disable no-self-assign */
/**
 * File contains methods for converting saves to the latest version
 */
import uniqid from 'uniqid'
import CropCode from './enums/cropCode'
import type { IHarvesterOptions } from './classes/harvester'
import type { ProcessorSetting, ProcessorSettings } from './classes/processor'
import { parseCropId, encodeCropId, ItemType } from './utils/garden-helpers'
import { Crop, getCodeFromFertiliser, getCropFromCode, getCropFromType, getFertiliserFromCode, getFertiliserFromType } from './imports'
import FertiliserCode from './enums/fertilisercode'
import { LATEST_VERSION } from './types/version'
import CropSize from './enums/crop-size'
import { GardenGridBasic, expandPlotCode, PLOT_DIMENSION_REGEX as V05_PLOT_DIMENSION_REGEX } from './saveHandlerGardenBasic'
import { FertiliserCostSource } from './classes/processor'

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
    convertedCropSettings = `Cr0.${convertedCropSettings.substring(0, convertedCropSettings.length - 1)}`
  }

  return `${convertedSettings}${convertedCropSettings}`
}

export function convertV_0_4SettingsToV_0_5Settings(settings: string): string {
  if (!settings)
    return 'Nfc'

  let convertedCropSettings = ''
  let convertedSettings = ''


  const settingsSplit = settings.split('Cr0')
  console.log('settingsSplit', settingsSplit)


  for (let setting of settingsSplit) {
    if (setting.startsWith('.')) {
      setting = setting.slice(1)
      convertedCropSettings = setting
    } else {
      convertedSettings = `${setting}Nfc`
    }
  }

  if (convertedCropSettings.length > 0) {
    convertedCropSettings = `Cr0.${convertedCropSettings.substring(0, convertedCropSettings.length - 1)}`
  }

  return `${convertedSettings}${convertedCropSettings}`
}

function convertV_0_4CodeToV_0_5Code(dimensionInfo: string, cropInfo: string) {
  // Makes sure this inconsistency never occurs from here on
  if (dimensionInfo.indexOf('DIM-') !== -1) {
    dimensionInfo = dimensionInfo.replace('DIM-', 'D-')
  }

  const convertedSave = new GardenGridBasic(dimensionInfo, cropInfo)

  return {
    dimensionInfo: convertedSave.dimensionInfoCode,
    cropInfo: convertedSave.cropInfoCode
  }
}

/**
 * Converts a save string to an object containing the save version, dimension info, and crop info of the latest version
  * @param save a save code for the garden planner
 */
export function parseSave(save: string) {
  // * This format makes it permanent that the first part of the save is the version number
  const [version, ...rest] = save.split('_')
  let dimensionInfo = rest[0] || ''
  let cropInfo = rest[1] || ''
  let settingsInfo = rest[2] || ''
  let strippedVersion = version?.replace('v', '');

  let convertedV_0_5Save = {
    cropInfo: '',
    dimensionInfo: ''
  }

  if (typeof strippedVersion !== 'string')
    throw new Error(`Provided save code does not appear to be in the right format`)

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
        break
      case '0.2':
        validatePlotMatrix(dimensionInfo)
        cropInfo = convertV_0_2Codesto_V_0_3(cropInfo)
        strippedVersion = '0.3'
        break
      case '0.3':
        validatePlotMatrix(dimensionInfo)
        cropInfo = convertV_0_3Codesto_V_0_4(cropInfo)
        settingsInfo = convertV_0_3SettingsToV_0_4Settings(settingsInfo)
        strippedVersion = '0.4'
        break
      case '0.4':
        convertedV_0_5Save = convertV_0_4CodeToV_0_5Code(dimensionInfo, cropInfo)
        cropInfo = convertedV_0_5Save.cropInfo
        dimensionInfo = convertedV_0_5Save.dimensionInfo
        validateNewPlotFormat(dimensionInfo, cropInfo)
        settingsInfo = convertV_0_4SettingsToV_0_5Settings(settingsInfo)
        strippedVersion = '0.5'
        break
      case '0.5':
        cropInfo = cropInfo
        dimensionInfo = dimensionInfo
        settingsInfo = settingsInfo
        validateNewPlotFormat(dimensionInfo, cropInfo)
        break
      default:
        throw new Error(`Invalid save version ${strippedVersion}`)
    }
  } while (strippedVersion !== '0.5')

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


export function saveSettings(harvesterOptions: IHarvesterOptions, processorSettings: ProcessorSettings): string {
  return encodeSettings(harvesterOptions, processorSettings)
}

export function loadSettings(settingsInfo: string): { harvesterOptions: IHarvesterOptions, processorSettings: ProcessorSettings } {
  return decodeSettings(settingsInfo)
}


function encodeSettings(harvesterOptions: IHarvesterOptions, processorSettings: ProcessorSettings): string {
  let settings = ''

  if (harvesterOptions.level !== 0)
    settings += `L${harvesterOptions.level}`

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

  if (!processorSettings.useFertilserCostSettings)
    settings += 'Nfc'


  let cropSettings = ''

  for (const [cropId, setting] of processorSettings.cropSettings) {
    if (setting.processAs === 'crop')
      continue

    const cropIdData = parseCropId(cropId)
    cropSettings += cropIdData.code

    // `.` indicates that the crop is not a star seed.
    if (!setting.isStar)
      cropSettings += '.'

    if (cropIdData.hasGrowthBoost)
      cropSettings += '~'

    // P for preserve, S for seed
    cropSettings += `${setting.processAs[0]?.toUpperCase()}`

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

  if (processorSettings.useFertilserCostSettings) {
    const fertSaveString = ['Fr0.']

    for (const [type, source] of processorSettings.fertiliserCostSettings) {
      const fertiliser = getFertiliserFromType(type)

      if (!fertiliser) continue

      const code = getCodeFromFertiliser(fertiliser)

      fertSaveString.push(`${code}${source.toLowerCase()}`)
    }

    if (fertSaveString.length > 1)
      settings += fertSaveString.join('')
  }

  // check for trailing underscore or trailing dash
  if (settings[settings.length - 1] === '_' || settings[settings.length - 1] === '-')
    return settings.slice(0, -1)


  return settings
}

interface ParsedSettings {
  general: string;
  cropProcess: string;
  fertiliserSource: string;
}

/**
 * Parses the settings string into its segments
 */
function parseSettings(input: string): ParsedSettings {
  const cropIndex = input.indexOf('Cr0.');
  const fertIndex = input.indexOf('Fr0.');

  let general = '';
  let cropProcess = '';
  let fertiliserSource = '';

  if (cropIndex !== -1) {
    general = input.substring(0, cropIndex);

    if (fertIndex !== -1 && fertIndex > cropIndex) {
      cropProcess = input.substring(cropIndex, fertIndex);
      fertiliserSource = input.substring(fertIndex);
    } else {
      cropProcess = input.substring(cropIndex);
    }
  } else if (fertIndex !== -1) {
    general = input.substring(0, fertIndex);
    fertiliserSource = input.substring(fertIndex);
  } else {
    general = input;
  }

  return { general, cropProcess, fertiliserSource };
}

function decodeSettings(settingsInfo: string, version = LATEST_VERSION): { harvesterOptions: IHarvesterOptions, processorSettings: ProcessorSettings } {
  const harvesterOptions: IHarvesterOptions = {
    days: -1,
    includeReplant: true,
    includeReplantCost: true,
    level: 0,
    useGrowthBoost: false,
    useStarSeeds: true,
  };

  const processorSettings: ProcessorSettings = {
    cropSettings: new Map(),
    crafterSetting: 0,
    goldAverageSetting: 'crafterTime',
    useFertilserCostSettings: true,
    fertiliserCostSettings: new Map()
  };

  const { general: generalSettings, cropProcess: cropSettings, fertiliserSource: fertiliserSettings } = parseSettings(settingsInfo);

  if (generalSettings) {
    const harvesterSettings = (generalSettings.match(/[A-Z][a-z0-9]*/g) as string[]) || [];
    const exactHandlers: Record<string, () => void> = {
      Nr: () => { harvesterOptions.includeReplant = false; },
      Nrc: () => { harvesterOptions.includeReplantCost = false; },
      Nss: () => { harvesterOptions.useStarSeeds = false; },
      Gb: () => { harvesterOptions.useGrowthBoost = true; },
      Gt: () => { processorSettings.goldAverageSetting = 'growthTick'; },
      Nfc: () => { processorSettings.useFertilserCostSettings = false },
      // For if we change the default settings back to growthTick
      Cft: () => { processorSettings.goldAverageSetting = 'crafterTime' }
    };

    for (const setting of harvesterSettings) {
      if (exactHandlers[setting]) {
        exactHandlers[setting]();
        continue;
      }

      const match = setting.match(/^([A-Z])(\d+)$/);
      if (match) {
        const [, prefix, value] = match;
        if (!value) console.warn(`Setting ${prefix} lacks value, using '0' instead`)
        const number = parseInt(value || '0', 10);

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

  if (cropSettings) {
    const cropProcessSettingsContent = cropSettings.replace(/^Cr0\./, '');
    const cropProcessSettings = cropProcessSettingsContent.split('-');
    for (const cropSetting of cropProcessSettings) {
      if (cropSetting.length === 0) continue;

      const codeMatch = cropSetting.match(/^([A-Z][a-z]?)(\.?)(~?)([PS]?)(\d*)/);
      if (!codeMatch) {
        throw new Error(`Invalid crop setting format: ${cropSetting}`);
      }

      const code = codeMatch[1] as CropCode;
      const isStar = codeMatch[2] !== '.';
      const hasGrowthBoost = codeMatch[3] === '~';
      const processAs =
        codeMatch[4] === 'P' ? ItemType.Preserve :
          codeMatch[4] === 'S' ? ItemType.Seed :
            ItemType.Crop;
      const crafters = codeMatch[5] ? parseInt(codeMatch[5], 10) : 1;
      const type = getCropFromCode(code)!.type;

      const cropId = encodeCropId({ type, isStar, hasGrowthBoost });

      const setting: ProcessorSetting = {
        count: 0,
        cropType: type,
        isStar,
        processAs,
        crafters,
        targetTime: 0,
        isActive: true,
        hasPreserve: processAs === 'preserve',
      };

      processorSettings.cropSettings.set(cropId, setting);
    }
  }

  if (fertiliserSettings) {
    // TODO: Determine how best to set 'None'
    const fertiliserCostSourceContent = fertiliserSettings.replace(/^Fr0\./, '');
    const fertiliserMatches = fertiliserCostSourceContent.match(/[A-Z][a-z]/g)

    if (!fertiliserMatches) throw new Error(`No fertiliser cost source found, invalid format? ${fertiliserMatches}`)

    for (const fertiliserCostSource of fertiliserMatches) {
      const fertCode = fertiliserCostSource[0] as FertiliserCode
      const costSource = fertiliserCostSource[1] as FertiliserCostSource

      if (!fertCode || !costSource) throw new Error(`expected setting not found ${fertiliserCostSource}`)
      if (!Object.values(FertiliserCode).includes(fertCode)) throw new Error(`FertCode not valid: ${fertCode}`)
      if (!Object.values(FertiliserCostSource).includes(costSource)) throw new Error(`Cost Source not valid: ${costSource}`)

      const fertiliser = getFertiliserFromCode(fertCode)
      if (!fertiliser) throw new Error(`fertiliser not found somehow: ${fertCode}`)

      switch (costSource) {
        case FertiliserCostSource.ZEKI_STORE:
          // console.log(`${fertiliser.type}: Zeki`)
          if (fertiliser.costs.zekiBatchPrice <= 0) {
            console.warn(`COST SOURCE NOT FOUND: Planner lacks support for Zeki Store Prices for ${fertiliser.type}, skipping`)
            continue
          }
          break
        case FertiliserCostSource.GUILD_STORE:
          // console.log(`${fertiliser.type}: Guild Store`)
          if (fertiliser.costs.guildBatchPrice <= 0) {
            console.warn(`COST SOURCE NOT FOUND: Planner lacks support for Guild Store prices for ${fertiliser.type}, skipping`)
            continue
          }
          break
        case FertiliserCostSource.SELL_VALUE:
          // console.log(`${fertiliser.type}: Sell Value`)
          if (fertiliser.costs.goldSellValue <= 0) {
            console.warn(`COST SOURCE NOT FOUND: Planner lacks support for sell value prices for ${fertiliser.type}, skipping`)
            continue
          }
          break
        case FertiliserCostSource.NONE:
        default:
          break
      }

      processorSettings.fertiliserCostSettings?.set(fertiliser.type, costSource)
    }
  }

  return { harvesterOptions, processorSettings };
}

/**
 * Ensures the dimensions provided can support the plots of the new system
 * @param dimensionInfo 
 * @throws Error if any dimension info is invalid, does nothing otherwise
 */
export function validateNewPlotFormat(dimensionInfo: string, cropInfo: string) {
  const dimensionExtractMatch = dimensionInfo.replace('D-', '').match(V05_PLOT_DIMENSION_REGEX)

  if (!dimensionExtractMatch) throw new Error('Savecode does not match expected format')

  const [_, totalWidthInTiles, totalHeightInTiles] = dimensionExtractMatch

  if (!totalWidthInTiles || !totalHeightInTiles) throw new Error('Dimension Info does not match expected format')

  const plots = cropInfo.split('-')
  if (plots[0]?.includes('CR')) plots.shift()

  plots.forEach((plotCode) => {

    const plotExtractMatch = plotCode.match(V05_PLOT_DIMENSION_REGEX)

    if (!plotExtractMatch) {
      console.error(plotCode)
      throw new Error('Plot code does not match expected format')
    }

    const [_, plotStartX, plotStartY, cropInfo] = plotExtractMatch

    /**
     * Check if any plot goes beyond the stated bounds of the plot
     */

    if (!plotStartX || !plotStartY) throw new Error('Plot dimension info somehow missing')
    if ((parseInt(plotStartX) + 3) > parseInt(totalWidthInTiles)) throw new Error(`Plot Width goes beyond bounds ${plotStartX}, ${totalWidthInTiles}`)
    if ((parseInt(plotStartY) + 3) > parseInt(totalHeightInTiles)) throw new Error(`Plot Height goes beyond bounds ${plotStartY}, ${totalHeightInTiles}`)

    // All plots should have exactly 9 tiles
    const cropInfoExtracted = expandPlotCode(cropInfo || '')
    if (cropInfoExtracted.length !== 9) throw new Error('A plot does not have exactly 9 tiles')
  })
}

export { convertV0_1CodestoV0_2 as convertV_0_1_to_V_0_2, encodeSettings, decodeSettings }
