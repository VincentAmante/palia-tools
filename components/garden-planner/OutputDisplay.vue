<script setup lang="ts">
import { ref } from 'vue'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import NewSettings from './NewSettings.vue'
import LazyHCInfo from './HarvestCalculator/HCInfo.vue'
import useHarvester from '~/stores/useHarvester'
import useProcessor from '~/stores/useProcessor'
import CropDetailsDisplay from './OutputDisplay/CropDetailsDisplay.vue'
import OverallDisplay from './OutputDisplay/OverallDisplay.vue'

const activeTab = ref('display')
function setTab(tab: string) {
  activeTab.value = tab
}


</script>

<template>
  <section class="p-2 ">
    <section class="flex justify-end gap-2 pb-2 border-b border-b-misc">
      <!-- <p>
        Tab Select
      </p> -->
      <button id="approximator-display-tab" aria-label="Display Tab"
        class="text-lg border-none btn-circle btn-sm btn btn-misc" :class="activeTab === 'display' ? 'btn-active' : ''"
        @click="setTab('display')">
        <FontAwesomeIcon :icon="['fas', 'table-list']" />
      </button>

      <button id="approximator-crop-details-tab" aria-label="Crop Details Tab"
        class="text-lg border-none btn-circle btn-sm btn btn-misc"
        :class="activeTab === 'crop-details' ? 'btn-active' : ''" @click="setTab('crop-details')">
        <FontAwesomeIcon :icon="['fas', 'magnifying-glass']" />
      </button>
      <button id="approximator-options-tab" aria-label="Options Tab"
        class="text-lg border-none btn-circle btn-sm btn btn-misc" :class="activeTab === 'options' ? 'btn-active' : ''"
        @click="setTab('options')">
        <FontAwesomeIcon :icon="['fas', 'sliders']" />
      </button>
      <button id="approximator-info-tab" aria-label="Info Tab"
        class="text-lg border-none btn-circle btn-sm btn btn-misc" :class="activeTab === 'info' ? 'btn-active' : ''"
        @click="setTab('info')">
        <FontAwesomeIcon :icon="['fas', 'info']" />
      </button>
    </section>
    <OverallDisplay v-show="activeTab === 'display'" id="display-tab" />
    <section v-show="activeTab === 'options'" id="settings-tab">
      <p class="sr-only">
        Settings
      </p>
      <NewSettings />
    </section>
    <CropDetailsDisplay v-show="activeTab === 'crop-details'" />
    <section v-show="activeTab === 'info'" id="info-tab">
      <p>
        Info
      </p>
      <LazyHCInfo class="max-h-[26.5rem]" />
    </section>
  </section>
</template>
