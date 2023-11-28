import { defineStore } from 'pinia'
import CropType from '~/assets/scripts/garden-planner/enums/cropType'

export type ProduceOption = 'crop' | 'seed' | 'preserve'

export enum GlobalSetting {
  level = 'level',
  useStarSeeds = 'useStarSeeds',
  includeReplant = 'includeReplant',
  includeReplantCost = 'includeReplantCost',
  days = 'days',
}

type CropOption = Record<CropType, { starType: ProduceOption; baseType: ProduceOption }>

export const useHarvestOptions = defineStore('harvestOptions', () => {
  const globalSettings = ref({
    level: 0,
    useStarSeeds: true,
    includeReplant: true,
    includeReplantCost: true,
    days: 0,
  }) as Ref<Record<GlobalSetting, boolean | number>>

  const cropOptions = ref<CropOption>({
    [CropType.Tomato]: {
      starType: 'crop' as ProduceOption,
      baseType: 'crop' as ProduceOption,
    },
    [CropType.Potato]: {
      starType: 'crop' as ProduceOption,
      baseType: 'crop' as ProduceOption,
    },
    [CropType.Wheat]: {
      starType: 'crop' as ProduceOption,
      baseType: 'crop' as ProduceOption,
    },
    [CropType.Rice]: {
      starType: 'crop' as ProduceOption,
      baseType: 'crop' as ProduceOption,
    },
    [CropType.Cotton]: {
      starType: 'crop' as ProduceOption,
      baseType: 'crop' as ProduceOption,
    },
    [CropType.Onion]: {
      starType: 'crop' as ProduceOption,
      baseType: 'crop' as ProduceOption,
    },
    [CropType.Carrot]: {
      starType: 'crop' as ProduceOption,
      baseType: 'crop' as ProduceOption,
    },
    [CropType.Blueberry]: {
      starType: 'crop' as ProduceOption,
      baseType: 'crop' as ProduceOption,
    },
    [CropType.Apple]: {
      starType: 'crop' as ProduceOption,
      baseType: 'crop' as ProduceOption,
    },
    [CropType.Corn]: {
      starType: 'crop' as ProduceOption,
      baseType: 'crop' as ProduceOption,
    },
    [CropType.SpicyPepper]: {
      starType: 'crop' as ProduceOption,
      baseType: 'crop' as ProduceOption,
    },
    [CropType.None]: {
      starType: 'crop' as ProduceOption,
      baseType: 'crop' as ProduceOption,
    },
  })

  return {
    cropOptions,
    globalSettings,
  }
})

export default useHarvestOptions
