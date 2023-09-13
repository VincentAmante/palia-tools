import { defineStore } from 'pinia'
import CropType from '@/assets/scripts/garden-planner/enums/crops'

export type ProduceOptions = 'crop' | 'seed' | 'preserve'

export enum GlobalSetting {
  postLevel25 = 'postLevel25',
  allStarSeeds = 'allStarSeeds',
  includeReplant = 'includeReplant',
  includeReplantCost = 'includeReplantCost',
  baseChanceNormalSeed = 'baseChanceNormalSeed',
  baseChanceStarSeed = 'baseChanceStarSeed',
  days = 'days',
}

type CropOption = Record<CropType, { starType: ProduceOptions; baseType: ProduceOptions }>

export const useHarvestOptions = defineStore('harvestOptions', () => {
  const globalSettings = ref({
    postLevel25: false,
    allStarSeeds: true,
    includeReplant: true,
    includeReplantCost: true,
    baseChanceStarSeed: 66,
    baseChanceNormalSeed: 0,
    days: 0,
  }) as Ref<Record<GlobalSetting, boolean | number>>

  const cropOptions = ref<CropOption>({
    [CropType.Tomato]: {
      starType: 'crop' as ProduceOptions,
      baseType: 'crop' as ProduceOptions,
    },
    [CropType.Potato]: {
      starType: 'crop' as ProduceOptions,
      baseType: 'crop' as ProduceOptions,
    },
    [CropType.Wheat]: {
      starType: 'crop' as ProduceOptions,
      baseType: 'crop' as ProduceOptions,
    },
    [CropType.Rice]: {
      starType: 'crop' as ProduceOptions,
      baseType: 'crop' as ProduceOptions,
    },
    [CropType.Corn]: {
      starType: 'crop' as ProduceOptions,
      baseType: 'crop' as ProduceOptions,
    },
    [CropType.Cotton]: {
      starType: 'crop' as ProduceOptions,
      baseType: 'crop' as ProduceOptions,
    },
    [CropType.SpicyPepper]: {
      starType: 'crop' as ProduceOptions,
      baseType: 'crop' as ProduceOptions,
    },
    [CropType.Onion]: {
      starType: 'crop' as ProduceOptions,
      baseType: 'crop' as ProduceOptions,
    },
    [CropType.Carrot]: {
      starType: 'crop' as ProduceOptions,
      baseType: 'crop' as ProduceOptions,
    },
    [CropType.Blueberry]: {
      starType: 'crop' as ProduceOptions,
      baseType: 'crop' as ProduceOptions,
    },
    [CropType.Apple]: {
      starType: 'crop' as ProduceOptions,
      baseType: 'crop' as ProduceOptions,
    },
    [CropType.None]: {
      starType: 'crop' as ProduceOptions,
      baseType: 'crop' as ProduceOptions,
    },
  })

  function setGlobalSetting(setting: GlobalSetting, value: boolean | number) {
    globalSettings.value[setting] = value
  }

  const getGlobalSetting = computed((setting: GlobalSetting) => globalSettings.value[setting])

  function setCropOption(crop: CropType, option: 'starType' | 'baseType', value: ProduceOptions) {
    cropOptions.value[crop as CropType][option] = value
  }

  const getCropOption = computed((crop: CropType, option: 'starType' | 'baseType') => cropOptions.value[crop as CropType][option])

  function saveCropOptions() {
    localStorage.setItem('cropOptions', JSON.stringify(cropOptions.value))
  }
  function loadCropOptions() {
    const savedOptions = localStorage.getItem('cropOptions')
    if (savedOptions) {
      const parsedOptions = JSON.parse(savedOptions)
      for (const crop in parsedOptions)
        cropOptions.value[crop as CropType] = parsedOptions[crop]
    }
  }

  function saveGlobalSettings() {
    localStorage.setItem('globalSettings', JSON.stringify(globalSettings.value))
  }
  function loadGlobalSettings() {
    const savedSettings = localStorage.getItem('globalSettings')
    if (savedSettings) {
      const parsedSettings = JSON.parse(savedSettings)
      for (const setting in parsedSettings)
        globalSettings.value[setting as GlobalSetting] = parsedSettings[setting]
    }
  }

  function resetCropOptions() {
    localStorage.removeItem('cropOptions')
    for (const crop in cropOptions.value) {
      cropOptions.value[crop as CropType].starType = 'crop'
      cropOptions.value[crop as CropType].baseType = 'crop'
    }
  }

  function resetGlobalSettings() {
    localStorage.removeItem('globalSettings')

    globalSettings.value.postLevel25 = false
    globalSettings.value.allStarSeeds = true
    globalSettings.value.includeReplant = true
    globalSettings.value.includeReplantCost = true
    globalSettings.value.baseChanceStarSeed = 66
    globalSettings.value.baseChanceNormalSeed = 0
    globalSettings.value.days = 0
  }

  function resetAll() {
    resetCropOptions()
    resetGlobalSettings()
  }

  loadCropOptions()
  loadGlobalSettings()

  return {
    setGlobalSetting,
    getGlobalSetting,
    setCropOption,
    getCropOption,
    saveCropOptions,
    saveGlobalSettings,
    resetCropOptions,
    resetGlobalSettings,
    resetAll,
  }
})

export default useHarvestOptions
