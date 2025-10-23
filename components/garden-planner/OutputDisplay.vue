<script setup lang="ts">
import { ref } from 'vue'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import NewSettings from './SettingsPanel.vue'
import LazyHCInfo from './HarvestCalculator/HCInfo.vue'
import CropDetailsDisplay from './OutputDisplay/CropDetailsDisplay.vue'
import OverallDisplay from './OutputDisplay/OverallDisplay.vue'
import { usePlannerDisplayConfig } from '~/stores/usePlannerDisplayConfig'

const isTakingScreenshot = useTakingScreenshot()
const plannerDisplayConfig = usePlannerDisplayConfig()
const activeTab = ref('display')
function setTab(tab: string) {
  activeTab.value = tab
}

defineProps({
  isMainOutputDisplay: {
    type: Boolean,
    default: false
  }
})
</script>

<template>
  <section class="p-2 ">
    <section v-if="!isTakingScreenshot.get"
      class="flex flex-row-reverse justify-between border-b border-b-palia-blue-light pb-1 px-1">
      <section class="flex justify-end gap-1">
        <button id="approximator-display-tab" aria-label="Display Tab"
          class="text-lg border-none btn-circle btn-sm btn btn-misc sm:tooltip" data-tip="Output Display"
          :class="activeTab === 'display' ? 'btn-active' : ''" @click="setTab('display')">
          <FontAwesomeIcon :icon="['fas', 'table-list']" />
        </button>
        <button id="approximator-crop-details-tab" aria-label="Crop Details Tab"
          class="text-lg border-none btn-circle btn-sm btn btn-misc sm:tooltip" data-tip="Crop Details"
          :class="activeTab === 'crop-details' ? 'btn-active' : ''" @click="setTab('crop-details')">
          <FontAwesomeIcon :icon="['fas', 'magnifying-glass']" />
        </button>
        <button id="approximator-options-tab" aria-label="Options Tab"
          class="text-lg border-none btn-circle btn-sm btn btn-misc sm:tooltip" data-tip="Harvest & Process Settings"
          :class="activeTab === 'options' ? 'btn-active' : ''" @click="setTab('options')">
          <FontAwesomeIcon :icon="['fas', 'sliders']" />
        </button>
        <button id="approximator-info-tab" aria-label="Info Tab" data-tip="Info"
          class="text-lg border-none btn-circle btn-sm btn btn-misc sm:tooltip"
          :class="activeTab === 'info' ? 'btn-active' : ''" @click="setTab('info')">
          <FontAwesomeIcon :icon="['fas', 'info']" />
        </button>
      </section>
      <section class="join" v-if="isMainOutputDisplay">
        <button class="btn join-item btn-sm gap-1 tooltip" aria-label="Show Garden + Output Display (default)" data-tip="
          Garden + Display (default)" @click="plannerDisplayConfig.set('garden+display')">
          <FontAwesomeIcon :icon="['fas', 'table-cells']" />
          <FontAwesomeIcon :icon="['fas', 'window-maximize']" />
        </button>
        <button class="btn join-item btn-sm gap-1 tooltip" aria-label="Show double Output Displays" data-tip=" Double Displays"
          @click="plannerDisplayConfig.set('display+display')">
          <FontAwesomeIcon :icon="['fas', 'window-maximize']" />
          <FontAwesomeIcon :icon="['fas', 'window-maximize']" />
        </button>
      </section>
    </section>
    <OverallDisplay v-show="activeTab === 'display'" id="display-tab" />
    <section v-show="activeTab === 'options'" id="settings-tab">
      <p class="sr-only">
        Settings
      </p>
      <NewSettings />
    </section>
    <CropDetailsDisplay v-show="activeTab === 'crop-details'" />
    <section v-show="activeTab === 'info'" id="info-tab" class="pt-2">
      <LazyHCInfo />
    </section>
  </section> 
</template>
