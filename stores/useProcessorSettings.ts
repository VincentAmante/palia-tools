import { defineStore } from 'pinia'
import { reactive } from 'vue'
import type { ProcessorSetting, ProcessorSettings, FertiliserCostSource } from '~/assets/scripts/garden-planner/classes/processor'
import type FertiliserType from '~/assets/scripts/garden-planner/enums/fertiliser'
import type { ICropName, ICropNameWithGrowthDiff } from '~/assets/scripts/garden-planner/types/gardenSimulatorTypes'

export const useProcessorSettings = defineStore('processorSettings', () => {
  const settings = reactive<ProcessorSettings>({
    cropSettings: new Map<ICropName, ProcessorSetting>(),
    crafterSetting: 0,
    goldAverageSetting: 'crafterTime',
    useFertilserCostSettings: true,
    fertiliserCostSettings: new Map()
  })

  function updateSettings(newSettings: ProcessorSettings) {
    settings.cropSettings = newSettings.cropSettings
    settings.goldAverageSetting = newSettings.goldAverageSetting
    settings.useFertilserCostSettings = newSettings.useFertilserCostSettings
    settings.fertiliserCostSettings = newSettings.fertiliserCostSettings
  }

  function setCropSetting(id: ICropNameWithGrowthDiff, setting: ProcessorSetting) {
    settings.cropSettings.set(id, setting)
  }

  function setFertiliserCostSetting(type: FertiliserType, costSource: FertiliserCostSource) {
    settings.fertiliserCostSettings.set(type, costSource)
  }

  function resetCropSettingsActive() {
    settings.cropSettings.forEach((setting, id) => {
      setting.isActive = false
      settings.cropSettings.set(id, setting)
    })
  }
  

  function setGoldAverageSetting(setting: ProcessorSettings['goldAverageSetting']) {
    settings.goldAverageSetting = setting
  }

  function toggleUseFertiliserCostSettings(setting: boolean) {
    settings.useFertilserCostSettings = setting
  }

  return {
    settings,
    updateSettings,
    setCropSetting,
    setFertiliserCostSetting,
    resetCropSettingsActive,
    setGoldAverageSetting,
    toggleUseFertiliserCostSettings
  }
})