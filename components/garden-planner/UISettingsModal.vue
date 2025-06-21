<script setup lang="ts">
import { useUiSettings } from '~/stores/useUiSettings';
import PGPModal from '../PGPModal.vue';


// const { settings } = useUISettings();
const uiSettings = storeToRefs(useUiSettings());
const { settings } = uiSettings;

const closeModal = () => {
  settingsModalRef.value?.hideModal();
};

const settingsModalRef = ref<InstanceType<typeof PGPModal> | null>(null);
function openModal() {
  settingsModalRef.value?.showModal();
}

defineExpose({
  openModal,
});


</script>

<template>
  <PGPModal ref="settingsModalRef" useFullHeight @close="closeModal">
    <template #header>UI Settings</template>
    <template #body>
      <fieldset class="fieldset bg-base-200 p-2 rounded-sm">
        <legend class="legend">Widgets</legend>

        <label class="label">
          <span class="label-text">Float Component Location</span>
        </label>
        <select v-model="settings.floatComponentLocation" class="select select-bordered">
          <option value="top-left">Top Left</option>
          <option value="top-right">Top Right</option>
          <option value="bottom-left">Bottom Left</option>
          <option value="bottom-right">Bottom Right</option>
        </select>
        <p class="text-xxs label font-light pb-2">Location of Crop Modal on screen (Mobile)</p>


        <label class="label">
          <span class="label-text">Toasts Location</span>
        </label>
        <select v-model="settings.toastsLocation" class="select select-bordered">
          <option value="top-left">Top Left</option>
          <option value="top-center">Top Center</option>
          <option value="top-right">Top Right</option>
          <option value="bottom-left">Bottom Left</option>
          <option value="bottom-center">Bottom Center</option>
          <option value="bottom-right">Bottom Right</option>
        </select>
        <p class="text-xxs label font-light pb-2">Location of Toast alerts</p>

        <label class="label">
          <span class="label-text">Colour Scheme</span>
        </label>
        <select v-model="settings.colorScheme" class="select select-bordered">
          <option value="light">Light</option>
          <option value="dark">Dark</option>
          <option value="system">System</option>
        </select>
      </fieldset>
      <fieldset class="fieldset bg-base-200 p-2 rounded-sm gap-4">
        <legend class="fieldset-legend">Crop Tile settings</legend>
        <label class="flex gap-1 items-center cursor-pointer">
          <input v-model="settings.cropTile.showBonusIcons" type="checkbox" class="toggle" />
          <span class="label select-none">Show Bonus Icons</span>
        </label>

        <label class="flex gap-1 items-center cursor-pointer">
          <input v-model="settings.cropTile.showBonusBackground" type="checkbox" class="toggle" />
          <span class="label select-none">Show Bonus Background</span>
        </label>
      </fieldset>
    </template>
  </PGPModal>
</template>
