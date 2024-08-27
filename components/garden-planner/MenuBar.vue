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
  <section class="flex flex-wrap gap-2 p-2 pb-4 bg-palia-blue-dark rounded-t-md">
    <button
      class="normal-case btn btn-sm bg-palia-blue"
      @click="openSaveModal"
    >
      <font-awesome-icon icon="floppy-disk" />
      Save
    </button>
    <button
      class="normal-case btn btn-sm bg-palia-blue"
      @click="openLoadModal"
    >
      <font-awesome-icon icon="download" />
      Load
    </button>
    <button
      class="normal-case btn btn-sm bg-palia-blue"
    >
      <font-awesome-icon icon="share-from-square" />
      Share
    </button>

    <button
      class="normal-case btn btn-sm bg-palia-blue"
      @click="openNewLayoutModal"
    >
      <font-awesome-icon icon="pen-to-square" />
      Edit Layout
    </button>
    <button
      class="normal-case btn btn-sm bg-palia-blue"
      @click="clearGarden"
    >
      <font-awesome-icon icon="trash" />
      Clear Plot
    </button>
    <Teleport to="body">
      <!-- Put all modals here -->
      <SaveModal ref="saveModal" @save-layout="saveLayout()" />
      <LoadModal ref="loadModal" @load="(loadCode) => loadLayoutFromCode(loadCode)" />

      <LayoutCreator ref="createLayoutDialog" @create-new-layout="loadLayoutFromCode" />
      <!-- <ExportModal ref="exportModal" @download-image="async () => await saveAsImage()" /> -->
    </Teleport>
  </section>
</template>
