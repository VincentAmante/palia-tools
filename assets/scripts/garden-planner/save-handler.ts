/**
 * File contains methods for converting saves to the latest version
 */

import CropCode from './enums/_cropCode'

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

  const strippedVersion = version.replace('v', '')

  switch (strippedVersion) {
    case '0.1':
      validatePlotMatrix(rest[0])
      dimensionInfo = rest[0]
      cropInfo = convertV0_1CodestoV0_2(rest[1])
      return { version, dimensionInfo, cropInfo }
    case '0.2':
      validatePlotMatrix(rest[0])
      dimensionInfo = rest[0]
      cropInfo = rest[1]
      return { version, dimensionInfo, cropInfo }
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

export { convertV0_1CodestoV0_2 as convertV_0_1_to_V_0_2, parseSave }
