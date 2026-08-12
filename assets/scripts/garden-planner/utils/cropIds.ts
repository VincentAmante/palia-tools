
import CropType from '../enums/crops';
import { getCropFromCode, getCropFromType  } from '../cropList';
import CropCode from '../enums/cropCode';
import type { ICropId, ICropNameWithGrowthDiff } from './gardenHelpers';


export function parseCropId(cropId: string): ICropId {
  const [type, star, growth] = cropId.split('-')

  if (!type || !star) {
    throw new Error(`Invalid cropId format: ${cropId}`)
  }

  const isStar = star === 'Star'
  const hasGrowthBoost = growth === 'Growth'
  const code = getCropFromType(type as CropType)?.cropCode
  if (!code) {
    throw new Error(`Invalid crop type: ${type}`)
  }

  if (type === 'none') {
    throw new Error('Cannot parse "none" cropId')
  }
  if (Object.values(CropType).includes(type as CropType) === false) {
    throw new Error(`Invalid crop type: ${type}`)
  }

  return {
    type: type as CropType,
    code: code as CropCode,
    isStar,
    hasGrowthBoost,
  }
}

export function encodeCropId(options: { type: CropType; isStar: boolean; hasGrowthBoost?: boolean }): ICropNameWithGrowthDiff {
  if (!Object.values(CropType).includes(options.type)) {
    throw new Error(`Invalid crop type: ${options.type}`)
  }
  const starPart = options.isStar ? 'Star' : 'Base'
  const growthPart = options.hasGrowthBoost ? '-Growth' : ''
  return `${options.type}-${starPart}${growthPart}`
}

export function encodeCropIdWithCode(options: { code: CropCode; isStar: boolean; hasGrowthBoost?: boolean }): ICropNameWithGrowthDiff {
  if (!Object.values(CropCode).includes(options.code)) {
    throw new Error(`Invalid crop code: ${options.code}`)
  }
  const starPart = options.isStar ? 'Star' : 'Base'
  const growthPart = options.hasGrowthBoost ? '-Growth' : ''
  return `${getCropFromCode(options.code).type}-${starPart}${growthPart}`
}
