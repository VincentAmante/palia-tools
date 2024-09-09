<!--
 Menu Bar for the Garden Planner
    - Should contain buttons for saving, loading, sharing, editing layout, and clearing plot
 -->

<script setup lang="ts">
import useGarden from '~/stores/useGarden'
import { useSaveCode } from '~/stores/useSaveCode'
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

function loadLayoutFromCode(code: string) {
  garden.loadLayout(code)
  gardenHandler.update()
}

const saveCode = useSaveCode()

function saveLayout() {
  saveCode.set(garden.saveLayout())
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
</script>

<template>
  <section class="flex flex-wrap justify-between gap-2 p-2 bg-palia-blue-dark rounded-b-md">
    <div class="flex flex-wrap gap-2 py-2">
      <button
        class="h-full normal-case btn bg-palia-blue"
        @click="openSaveModal"
      >
        <font-awesome-icon class="text-lg" icon="floppy-disk" />
        Save
      </button>
      <button
        class="h-full normal-case btn bg-palia-blue"
        @click="openLoadModal"
      >
        <font-awesome-icon class="text-lg" icon="download" />
        Load
      </button>
      <button
        class="h-full normal-case btn bg-palia-blue"
      >
        <font-awesome-icon class="text-lg" icon="share-from-square" />
        Export
      </button>
    </div>
    <div class="flex flex-col items-center px-12 py-2 rounded-md bg-palia-blue">
      <p class="text-4xl">
        12:58 PM
      </p>
      <p class="text-xs">
        Palian Time
      </p>
    </div>
    <div class="flex flex-wrap gap-2 py-2">
      <button
        class="h-full normal-case btn btn-warning text-neutral"
        @click="openNewLayoutModal"
      >
        <font-awesome-icon class="text-lg" icon="pen-to-square" />
        Edit Layout
      </button>
      <button
        class="h-full normal-case btn btn-error"
        @click="clearGarden"
      >
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
