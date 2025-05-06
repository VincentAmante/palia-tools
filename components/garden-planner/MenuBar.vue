<!--
 Menu Bar for the Garden Planner
    - Should contain buttons for saving, loading, sharing, editing layout, and clearing plot
 -->

<script setup lang="ts">
import useGarden from '~/stores/useGarden'
import { useSaveCode } from '~/stores/useSaveCode'
import { useSettingsCode } from '~/stores/useSettingsCode'
import SaveModal from '~/components/garden-planner/SaveModal.vue'
import LoadModal from '~/components/garden-planner/LoadModal.vue'
import LayoutCreator from '@/components/LayoutCreator.vue'
import type ExportModal from '~/components/garden-planner/ExportModal.vue'

const gardenHandler = useGarden()

const { garden } = gardenHandler

function clearGarden() {
  garden.clearAllPlots()
  gardenHandler.update()
}


const saveCode = useSaveCode()
const settingsCode = useSettingsCode()

function loadLayoutFromCode(code: string) {
  garden.loadLayout(code)
  settingsCode.set(garden.loadSettingsCode)
  settingsCode.requestUpdate()
  gardenHandler.update()
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

const exportModal = ref<InstanceType<typeof ExportModal> | null>(null)
function openExportModal() {
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
  }
})

</script>

<template>
  <section class="flex flex-wrap justify-between gap-1 p-2 sm:gap-2 bg-palia-blue-dark rounded-b-md">
    <div class="grid flex-wrap w-full grid-cols-3 gap-2 py-1 sm:py-0 lg:py-2 sm:flex sm:w-fit">
      <button class="h-full normal-case btn bg-palia-blue" @click="openSaveModal">
        <font-awesome-icon class="text-lg" icon="floppy-disk" />
        Save
      </button>
      <button class="h-full normal-case btn bg-palia-blue" @click="openLoadModal">
        <font-awesome-icon class="text-lg" icon="download" />
        Load
      </button>
      <button class="h-full normal-case btn bg-palia-blue">
        <font-awesome-icon class="text-lg" icon="share-from-square" />
        Export
      </button>
    </div>
    <div class="flex-col items-center w-full px-12 py-1 rounded-md sm:py-2 sm:w-fit sm:flex bg-palia-blue">
      <TimeDisplay />
    </div>
    <div class="grid flex-wrap w-full grid-cols-2 gap-2 py-1 sm:w-fit sm:flex sm:py-2">
      <button class="h-full normal-case btn btn-warning text-neutral" @click="openNewLayoutModal">
        <font-awesome-icon class="text-lg" icon="pen-to-square" />
        Edit Layout
      </button>
      <button class="h-full normal-case btn btn-error" @click="clearGarden">
        <font-awesome-icon class="text-lg" icon="trash" />
        Clear Plot
      </button>
    </div>
    <Teleport to="body">
      <!-- Put all modals here -->
      <SaveModal ref="saveModal" @save-layout="saveLayout()" />
      <LoadModal ref="loadModal" @load="(loadCode) => loadLayoutFromCode(loadCode)" />

      <LayoutCreator ref="createLayoutDialog" @create-new-layout="loadLayoutFromCode" />
      <!-- <ExportModal ref="exportModal" @download-image="async () => await saveAsImage()" /> -->
    </Teleport>
  </section>
</template>
