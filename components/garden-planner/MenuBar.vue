<!--
 Menu Bar for the Garden Planner
    - Should contain buttons for saving, loading, sharing, editing layout, and clearing plot
 -->

<script setup lang="ts">
import useGarden from '~/stores/useGarden'
import { useSaveCode } from '~/stores/useSaveCode'
import { useSettingsCode } from '~/stores/useSettingsCode'
import { loadDefaultSettingsCode } from '~/components/garden-planner/SaveLoadUtils'
import SaveModal from '~/components/garden-planner/SaveModal.vue'
import LoadModal from '~/components/garden-planner/LoadModal.vue'
import LayoutCreator from '@/components/LayoutCreator.vue'
import ExportModal from '~/components/garden-planner/ExportModal.vue'
import { useToasts } from '~/stores/useToasts'
import UISettingsModal from './UISettingsModal.vue'

const toasts = useToasts()
const gardenHandler = useGarden()
const harvester = useHarvester()
const processor = useProcessor()
const { garden } = gardenHandler

function clearGarden() {
  garden.clearAllPlots()
  gardenHandler.update()
}


const saveCode = useSaveCode()
const settingsCode = useSettingsCode()

function loadLayoutFromCode(code: string, useDefaultSettings: boolean = false) {

  const hasLoadedSuccessfully = garden.loadLayout(code)
  settingsCode.set(garden.loadSettingsCode)
  settingsCode.requestUpdate()
  gardenHandler.update()
  gardenHandler.requestFullUpdate()

  if (hasLoadedSuccessfully) {
    toasts.addToast({
      message: 'Layout loaded successfully',
      type: 'alert-success',
      duration: 2000,
    })
  }

  if (useDefaultSettings) {

    const defaultCode = loadDefaultSettingsCode()?.code

    if (defaultCode) {

      settingsCode.set(defaultCode)
      const { harvesterOptions, processorSettings } = gardenHandler.garden.loadSettings(defaultCode)
      processor.updateSettings(processorSettings)
      harvester.updateSettings(harvesterOptions)
    }
  }
}

function saveLayout() {
  saveCode.set(garden.saveLayout(settingsCode.code))
}

const saveModal = ref<InstanceType<typeof SaveModal> | null>(null)
function openSaveModal() {
  saveLayout()
  saveModal.value?.openModal()
}

const loadModal = ref<InstanceType<typeof LoadModal> | null>(null)
function openLoadModal() {
  loadModal.value?.openModal()
}

const uiSettingsModal = ref<InstanceType<typeof UISettingsModal> | null>(null)
function openUISettingsModal() {
  uiSettingsModal.value?.openModal()
}


const exportModal = ref<InstanceType<typeof ExportModal> | null>(null)
function openExportModal() {
  saveCode.set(garden.saveLayout(settingsCode.code))
  exportModal.value?.openModal()
}

const createLayoutDialog = ref<InstanceType<typeof LayoutCreator> | null>()
function openNewLayoutModal() {
  createLayoutDialog.value?.openModal()
}

const urlParams = useUrlSearchParams('history')
onMounted(() => {

  // Load layout from URL parameter if available
  if (urlParams.layout) {
    loadLayoutFromCode(urlParams.layout as string)
  } else {
    const defaultSettings = loadDefaultSettingsCode()

    if (defaultSettings) {
      const { harvesterOptions, processorSettings: loadedProcessorSettings } = gardenHandler.garden.loadSettings(defaultSettings.code)
      harvester.updateSettings(Object.assign({}, harvesterOptions))
      processor.updateSettings(Object.assign({}, loadedProcessorSettings))
      settingsCode.set(defaultSettings.code)
    }
  }
})

</script>

<template>
  <section class="flex flex-wrap justify-between gap-1 p-2 sm:gap-2 bg-palia-blue-dark rounded-b-md">
    <div class="grid flex-wrap w-full grid-cols-3 gap-2 py-1 sm:py-0 xl:py-2 xl:flex xl:w-fit order-2 xl:order-1">
      <button class="xl:h-full normal-case btn bg-palia-blue" @click="openSaveModal">
        <font-awesome-icon class="text-lg" icon="floppy-disk" />
        Save
      </button>
      <button class="xl:h-full normal-case btn bg-palia-blue" @click="openLoadModal">
        <font-awesome-icon class="text-lg" icon="download" />
        Load
      </button>
      <button class="xl:h-full normal-case btn bg-palia-blue" @click="openExportModal">
        <font-awesome-icon class="text-lg" icon="share-from-square" />
        Export
      </button>
    </div>
    <div
      class="flex-col items-center w-full px-10 py-1 rounded-md sm:py-2 xl:w-fit xl:flex bg-palia-blue order-3 xl:order-2">
      <TimeDisplay />
    </div>
    <div
      class="grid flex-wrap w-full grid-cols-2 sm:grid-cols-3 gap-2 py-1 xl:w-fit xl:flex xl:py-2 order-2 xl:order-3 ">
      <button class="xl:h-full btn btn-soft" @click="openNewLayoutModal">
        <font-awesome-icon class="text-lg" icon="pen-to-square" />
        New Layout
      </button>
      <button class="xl:h-full btn btn-warning text-neutral" @click="clearGarden">
        <font-awesome-icon class="text-lg" icon="trash" />
        Clear Plot
      </button>

      <!-- UI Modal -->
      <button class="xl:h-full btn btn-info btn-soft" @click="openUISettingsModal">
        <font-awesome-icon class="text-lg" icon="cog" />
        UI Settings
      </button>
    </div>
    <Teleport to="body">
      <!-- Put all modals here -->
      <SaveModal ref="saveModal" @save-layout="saveLayout()" />
      <LoadModal ref="loadModal" @load="(loadCode) => loadLayoutFromCode(loadCode)" />
      <UISettingsModal ref="uiSettingsModal" />
      <LayoutCreator ref="createLayoutDialog" @create-new-layout="(code: string) => loadLayoutFromCode(code, true)" />
      <ClientOnly>
        <ExportModal ref="exportModal" />
      </ClientOnly>
    </Teleport>
  </section>
</template>
