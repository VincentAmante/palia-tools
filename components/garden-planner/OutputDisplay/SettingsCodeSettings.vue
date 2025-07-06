<script setup lang="ts">
import useHarvester from '~/stores/useHarvester'
import { saveDefaultSettingsCode, loadDefaultSettingsCode } from '~/components/garden-planner/SaveLoadUtils'
import useProcessor from '~/stores/useProcessor'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import SettingsModal from '../SettingsModal.vue'

const harvester = useHarvester()
const processor = useProcessor()
const settingsCode = useSettingsCode()
const defaultSettingsCode = ref<string>('')
const garden = useGarden()

const saveCode = useSaveCode()
const settingsModal = ref<InstanceType<typeof SettingsModal> | null>(null)
function openSettingsModal() {
  settingsModal.value?.openModal()
}


onMounted(() => {
  const defaultSettings = loadDefaultSettingsCode()
  if (defaultSettings) {
    defaultSettingsCode.value = defaultSettings.code
  }
})

function updateSettings() {
  processor.updateSettings(Object.assign({}, processor.settings))
  processor.simulateProcessing(harvester.totalHarvest)
}

function saveDefaultSettings() {
  saveDefaultSettingsCode(settingsCode.code)
  defaultSettingsCode.value = settingsCode.code
}

function loadSettings(code: string) {
  settingsCode.set(code)
  const { harvesterOptions, processorSettings } = garden.garden.loadSettings(code)
  processor.updateSettings(processorSettings)
  harvester.updateSettings(harvesterOptions)
  updateSettings()
}

function loadDefaultSettings() {
  const defaultSettings = loadDefaultSettingsCode()
  if (defaultSettings) {
    loadSettings(defaultSettings.code)
  }
}

function resetToDefaultSettings() {
  loadSettings('')
}

</script>
<template>
  <section class="relative h-full isolate flex flex-col gap-1 py-2 ">
    <div class="flex flex-col gap-1 bg-accent p-2 rounded-md dark:bg-palia-blue">
      <div class=" text-misc flex flex-col gap-1 dark:text-accent">
        <p class="font-bold text-palia-blue dark:text-accent">Default Setting Preset</p>
        <p class="text-sm">Configures your default settings on loading a new layout</p>
        <p class="text-xs bg-info p-1 rounded-sm w-fit text-palia-blue-dark">
          <FontAwesomeIcon :icon="['fas', 'info-circle']" class="" /> Will not trigger if a layout is loaded
        </p>
      </div>
      <div class="flex gap-1 flex-col">
        <p class="bg-palia-blue-dark p-1 text-sm px-2 rounded-sm">Default Settings: <span class="font-mono">{{
          defaultSettingsCode }}</span></p>
        <p class="bg-palia-blue-dark p-1 text-sm px-2 rounded-sm">Current Settings: <span class="font-mono">{{
          settingsCode.code
        }}</span></p>
      </div>

      <div class="flex gap-1 sm:gap-0 flex-col sm:join sm:flex-row">
        <button class="btn join-item" @click="saveDefaultSettings">Set as Default</button>
        <button class="btn join-item" @click="loadDefaultSettings">Load Default</button>
        <button class="btn join-item" @click="resetToDefaultSettings">Revert to Planner Default</button>
      </div>
    </div>

    <div class="flex flex-col gap-1 bg-accent p-2 rounded-md dark:bg-palia-blue">
      <p class="text-palia-blue dark:text-accent font-bold">Presets</p>
      <p class="text-sm text-misc dark:text-accent">Manage your presets here</p>
      <button class="normal-case btn bg-palia-blue gap-2 w-fit" @click="openSettingsModal">
        <font-awesome-icon class="text-lg" icon="floppy-disk" />
        Setting Code Presets
        <font-awesome-icon class="text-lg" icon="download" />
      </button>
    </div>
    <Teleport to="body">
      <SettingsModal @load="(loadCode) => loadSettings(loadCode)" ref="settingsModal"></SettingsModal>
    </Teleport>
  </section>
</template>