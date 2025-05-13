<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { deleteGardenCode, loadSavedGardenCodes, saveGardenCode, savedGardenCodes, updateGardenCodeTitle } from './SaveLoadUtils'
import PGPModal from '@/components/PGPModal.vue'
import { useSaveCode } from '~/stores/useSaveCode'

const saveCode = useSaveCode()
const gardenHandler = useGarden()
const { includeSettingsCode } = storeToRefs(useSettingsCode())
const title = ref('New Save')
const version = ref(1)


const toasts = useToasts()

onMounted(() => {
  loadSavedGardenCodes()
})

const modal = ref<InstanceType<typeof PGPModal> | null>(null)
function openModal() {
  modal.value?.showModal()
}
defineExpose({
  openModal,
})

const { text, copy } = useClipboard()

const useMarkdown = ref(false)

const activeTab = ref('clipboard-tab')

function addSuccessToast() {
  toasts.addToast({
    message: 'Save successful',
    type: 'alert-success',
    duration: 2000,
  })
}
function addDeleteToast() {
  toasts.addToast({
    message: 'Layout deleted',
    type: 'alert-success',
    duration: 2000,
  })
}



function saveAndClose() {
  saveGardenCode(title.value, saveCode.code, version.value)
  modal.value?.hideModal()

  addSuccessToast()
}
function saveWithoutClose() {
  saveGardenCode(title.value, saveCode.code, version.value)

  addSuccessToast()
}

function editTitle(index: number, newTitle: string) {
  updateGardenCodeTitle(index, newTitle)
}

function deleteCode(index: number) {
  deleteGardenCode(index)
}

watch(includeSettingsCode, () => {
  saveCode.set(gardenHandler.garden.saveLayout(useSettingsCode().code))
})

</script>

<template>
  <PGPModal ref="modal" useFullHeight>
    <template #header>
      Save Layout
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

      <!-- <fieldset class="fieldset items-end">
        <legend class="fieldset-legend">
          Include Settings
        </legend>

      </fieldset> -->

      <label class="flex items-center gap-1">
        <span class="label text-xs">Include Settings</span>
        <input class="toggle toggle-xs" type="checkbox" v-model="includeSettingsCode" />
      </label>
      <div v-if="activeTab === 'clipboard-tab'" id="clipboard-tab" class="flex flex-col gap-2">
        <div class="card card-compact">
          <div class="relative flex flex-col p-4 px-3 rounded-md card-body bg-palia-blue-dark">
            <p class="card-title">
              Code
            </p>
            <p class="w-full p-2 font-mono text-xs font-thin rounded-md cursor-pointer select-text text-secondary hover:text-white hover:bg-misc-secondary"
              @click="copy(saveCode.code)">
              {{ saveCode.code }}
            </p>
            <div class="card-actions">
              <button class="normal-case btn btn-sm btn-ghost"
                :class="(text === saveCode.code) ? 'btn-disabled font-lights' : ''" @click="copy(saveCode.code)">
                <font-awesome-icon :icon="['fas', 'copy']" />
                {{ (text === saveCode.code) ? 'Copied!' : 'Copy' }}
              </button>
            </div>
          </div>
        </div>
        <div class="card card-compact">
          <div class="relative flex flex-col p-4 px-3 rounded-md card-body bg-palia-blue-dark">
            <p class="card-title">
              Link
            </p>
            <p class="w-full p-2 font-mono text-xs font-thin rounded-md cursor-pointer select-text text-secondary hover:text-white hover:bg-misc-secondary"
              @click="copy((useMarkdown) ? saveCode.linkMarkdown : saveCode.link)">
              {{ (useMarkdown) ? saveCode.linkMarkdown : saveCode.link }}
            </p>
            <div class="card-actions">
              <button class="normal-case btn btn-sm btn-ghost"
                :class="(text === ((useMarkdown) ? saveCode.linkMarkdown : saveCode.link)) ? 'btn-disabled font-lights' : ''"
                @click="copy((useMarkdown) ? saveCode.linkMarkdown : saveCode.link)">
                {{ (text === ((useMarkdown) ? saveCode.linkMarkdown : saveCode.link)) ? 'Copied!' : 'Copy' }}
                <font-awesome-icon :icon="['fas', 'copy']" />
              </button>
              <label class="flex items-center gap-1 py-2 text-xs font-semibold">
                <div class="font-normal label">Markdown</div>
                <input v-model="useMarkdown" type="checkbox" class="toggle toggle-sm">
              </label>
              <!-- <p class="text-xs text-warning">
                <font-awesome-icon icon="exclamation-triangle" class="mr-1" />
                Planner links may get filtered by Reddit's site-wide filters, I'm working on resolving this.
              </p> -->
            </div>
          </div>
        </div>
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
                class="w-full max-w-xs input input-bordered input-sm">
              <p class="pt-1 font-mono text-justify opacity-50 text-xxs wrap-anywhere">
                {{ saveCode.code }}
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
                Saved Layouts
              </p>
              <div class="h-full overflow-hidden">
                <ul class="flex flex-col w-full gap-3 p-2 overflow-y-auto rounded-xs bg-base-100 max-h-50 md:max-h-72">
                  <li v-for="(code, index) in savedGardenCodes" :key="index" class="flex items-start justify-between">
                    <div class="flex flex-col gap-1">
                      <input v-model="code.title" class="w-full max-w-xs py-0 pl-0 input input-ghost input-xs"
                        @change="editTitle(index, code.title)">
                      <p class="font-mono leading-none opacity-50 text-xxs text-justify line-clamp-3 md:line-clamp-4">
                        {{ code.code }}
                      </p>
                    </div>
                    <button class="btn btn-xs btn-square btn-ghost" @click="deleteCode(index)">
                      <font-awesome-icon class="text-sm text-weed-prevention" icon="trash" />
                    </button>
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
