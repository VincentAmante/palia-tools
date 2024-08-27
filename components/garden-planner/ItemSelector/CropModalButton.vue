<script setup lang="ts">
import { useTakingScreenshot } from '~/stores/useIsTakingScreenshot'
import { SelectedItemType, useSelectedItem } from '~/stores/useSelectedItem'
import type { Crop, Fertiliser } from '~/assets/scripts/garden-planner/imports'

const isTakingScreenshot = useTakingScreenshot()
const selectedItem = useSelectedItem()

function onClick() {
  console.log('clicked')
}
</script>

<template>
  <div class="fixed bottom-0 right-0 z-50 mx-3 my-2 sm:hidden">
    <CropButton
      v-if="selectedItem.type === SelectedItemType.Crop"
      :crop="selectedItem.val as Crop"
      @click="onClick"
    />
    <FertiliserButton
      v-else-if="selectedItem.type === SelectedItemType.Fertiliser"
      :fertiliser="selectedItem.val as Fertiliser"
      @click="onClick"
    />
    <button
      v-else-if="selectedItem.type === SelectedItemType.CropErase"
      id="crop-eraser"
      class="relative border rounded-sm btn btn-square btn-secondary isolate border-misc" aria-label="Crop Eraser"
      :class="(selectedItem.val === 'crop-erase' && !isTakingScreenshot.get) ? 'bg-white' : (isTakingScreenshot.get) ? 'hidden' : ''"
      :in-picture-mode="isTakingScreenshot.get"
      @click="onClick"
    >
      <font-awesome-icon class="absolute -z-10 max-w-[45px] text-success text-2xl " :icon="['fas', 'eraser']" />
    </button>
    <button
      v-else-if="selectedItem.type === SelectedItemType.FertiliserErase"
      id="fertiliser-eraser" aria-label="Fertiliser Eraser"
      class="relative border rounded-sm btn btn-square btn-secondary isolate border-misc"
      :class="(selectedItem.val === 'crop-erase' && !isTakingScreenshot.get) ? 'bg-white' : (isTakingScreenshot.get) ? 'hidden' : ''"
      :in-picture-mode="isTakingScreenshot.get"
      @click="onClick"
    >
      <font-awesome-icon class="absolute -z-10 max-w-[42px] text-warning text-2xl " :icon="['fas', 'eraser']" />
    </button>
  </div>
</template>
