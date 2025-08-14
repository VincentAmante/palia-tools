<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { deleteSettingsCode, loadSavedSettingsCode, loadSavedSettingsCodes, saveSettingsCode, savedSettingsCodes, updateSettingsCodeTitle } from './SaveLoadUtils'
import PGPModal from '@/components/PGPModal.vue'
import { LATEST_VERSION } from '~/assets/scripts/garden-planner/types/version'

const settingsCode = useSettingsCode()
const emit = defineEmits<{
  (e: 'load', code: string): void
}>()


const title = ref('New Settings Preset')
const version = ref(1)

const { text, copy } = useClipboard()

const modal = ref<InstanceType<typeof PGPModal> | null>(null)
function openModal() {
  modal.value?.showModal()
  loadSavedSettingsCodes()
}
defineExpose({
  openModal,
})


function load(code: string) {
  emit('load', code)
  modal.value?.hideModal()
}

function loadSavedCode(code: string) {
  emit('load', code)
  modal.value?.hideModal()
}

const toasts = useToasts()

function addSuccessToast() {
  toasts.addToast({
    message: 'Settings saved',
    type: 'alert-success',
    duration: 2000,
  })
}
function addDeleteToast() {
  toasts.addToast({
    message: 'Settings deleted',
    type: 'alert-success',
    duration: 2000,
  })
}

function saveAndClose() {
  saveSettingsCode(title.value, `${LATEST_VERSION}_${settingsCode.code}`, version.value)
  modal.value?.hideModal()
  addSuccessToast()
}

function saveWithoutClose() {
  saveSettingsCode(title.value, `${LATEST_VERSION}_${settingsCode.code}`, version.value)
  addSuccessToast()
}

function editTitle(index: number, newTitle: string) {
  updateSettingsCodeTitle(index, newTitle)
}

function deleteCode(index: number) {
  deleteSettingsCode(index)
}

const loadCode = ref('')


watch(settingsCode, () => {

})


const activeTab = ref('browser-tab')
async function paste() {
  loadCode.value = await navigator.clipboard.readText()
}
</script>

<template>
  <PGPModal ref="modal" useFullHeight>
    <template #header>
      Settings Presets
    </template>
    <template #body>
      <div class="flex justify-between">
        <div class="tabs tabs-box w-fit">
          <a class="tab" :class="{ 'tab-active': activeTab === 'clipboard-tab' }"
            @click="activeTab = 'clipboard-tab'">Clipboard</a>
          <a class="tab" :class="{ 'tab-active': activeTab === 'browser-tab' }"
            @click="activeTab = 'browser-tab'">Browser</a>
        </div>
      </div>

      <div v-if="activeTab === 'clipboard-tab'" id="clipboard-tab" class="flex flex-col gap-2">
        <div class="card card-compact">
          <div class="relative flex flex-col p-4 px-3 rounded-md card-body bg-palia-blue-dark">
            <p class="card-title">
              Code
            </p>
            <p class="w-full p-2 font-mono text-xs font-thin rounded-md cursor-pointer select-text text-secondary hover:text-white hover:bg-misc-secondary"
              @click="copy(`${LATEST_VERSION}_${settingsCode.code}`)">
              {{ `${LATEST_VERSION}_${settingsCode.code}` }}
            </p>
            <div class="card-actions">
              <button class="normal-case btn btn-sm btn-ghost"
                :class="(text === settingsCode.code) ? 'btn-disabled font-lights' : ''"
                @click="copy(settingsCode.code)">
                <font-awesome-icon :icon="['fas', 'copy']" />
                {{ (text === settingsCode.code) ? 'Copied!' : 'Copy' }}
              </button>
            </div>
          </div>
        </div>
        <div class="card card-compact">
          <div class="relative flex flex-col p-4 px-3 rounded-md card-body bg-palia-blue-dark">
            <p class="card-title">
              Clipboard
            </p>
            <textarea v-model="loadCode" class="textarea h-fit font-mono min-h-[8rem]" />
            <div class="card-actions">
              <button class="normal-case btn btn-sm btn-ghost" @click="paste()">
                Paste Code
              </button>
            </div>
          </div>
        </div>
        <button class="normal-case btn btn-sm w-fit" @click="() => load(loadCode)">
          Load
        </button>
      </div>
      <div v-if="activeTab === 'browser-tab'" id="browser-tab" class="">
        <div class="gap-2 card card-compact">
          <div class="relative flex flex-col p-4 px-3 rounded-md card-body bg-palia-blue-dark">
            <p class="card-title">
              Save to Browser
            </p>
            <div class="w-full form-control">
              <label class="sr-only label">
                <span class="label-text">Title</span>
              </label>
              <input v-model="title" max="64" type="text" placeholder="Enter title"
                class="w-full input input-bordered input-sm">
              <p class="pt-1 font-mono text-justify opacity-50 text-xxs wrap-anywhere">
                {{ `${LATEST_VERSION}_${settingsCode.code}` }}
              </p>
            </div>
            <div class="flex gap-2">
              <button class="normal-case btn btn-sm btn-outline" @click="saveAndClose">
                Save
              </button>
              <button class="normal-case btn btn-sm btn-outline" @click="saveWithoutClose">
                Save (No Close)
              </button>
            </div>
          </div>

          <div class="relative card card-compact">
            <div class="relative flex flex-col p-4 px-3 rounded-md card-body bg-palia-blue-dark">
              <p class="card-title">
                Saved Settings Presets
              </p>
              <div class="h-full overflow-hidden">
                <ul class="flex flex-col w-full gap-3 p-2 overflow-y-auto rounded-xs bg-base-100 max-h-50 md:max-h-72">
                  <li v-for="(code, index) in savedSettingsCodes" :key="index" class="flex items-start justify-between">
                    <div class="flex flex-col gap-1 w-full">
                      <input v-model="code.title" class="w-full py-0 pl-0 input input-ghost input-xs"
                        @change="editTitle(index, code.title)">
                      <p class="font-mono leading-none opacity-50 text-xxs text-justify line-clamp-3 md:line-clamp-4">
                        {{ `${code.code}` }}
                      </p>
                    </div>
                    <div class="flex gap-1">
                      <button class="btn btn-xs btn-circle btn-ghost" @click="loadSavedCode(code.code)">
                        <font-awesome-icon class="text-sm" icon="download" />
                      </button>
                      <button class="btn btn-xs btn-circle btn-ghost" :class="{ 'btn-disabled': code.code === text }"
                        @click="copy(code.code)">
                        <font-awesome-icon class="text-sm" icon="copy" />
                      </button>
                      <button class="btn btn-xs btn-square btn-ghost" @click="deleteCode(index)">
                        <font-awesome-icon class="text-sm text-weed-prevention" icon="trash" />
                      </button>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </PGPModal>
</template>
