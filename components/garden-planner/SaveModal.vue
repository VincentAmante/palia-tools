<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { deleteGardenCode, loadSavedGardenCodes, saveGardenCode, savedGardenCodes, updateGardenCodeTitle } from './SaveLoadUtils'
import PGPModal from '@/components/PGPModal.vue'
import { useSaveCode } from '~/stores/useSaveCode'

const saveCode = useSaveCode()
const title = ref('New Save')
const version = ref(1)

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

function saveAndClose() {
  saveGardenCode(title.value, saveCode.code, version.value)
  modal.value?.hideModal()
}
function saveWithoutClose() {
  saveGardenCode(title.value, saveCode.code, version.value)
}

function editTitle(index: number, newTitle: string) {
  updateGardenCodeTitle(index, newTitle)
}

function deleteCode(index: number) {
  deleteGardenCode(index)
}
</script>

<template>
  <PGPModal ref="modal">
    <template #header>
      Save Layout
    </template>
    <template #body>
      <div class="tabs">
        <a
          class="tab" :class="{ 'tab-active': activeTab === 'clipboard-tab' }"
          @click="activeTab = 'clipboard-tab'"
        >Clipboard</a>
        <a
          class="tab" :class="{ 'tab-active': activeTab === 'browser-tab' }"
          @click="activeTab = 'browser-tab'"
        >Browser</a>
      </div>
      <div v-if="activeTab === 'clipboard-tab'" id="clipboard-tab" class="flex flex-col gap-2 mt-4">
        <div class="card card-compact">
          <div class="relative flex flex-col p-4 px-3 rounded-md card-body bg-palia-blue-dark">
            <p class="card-title">
              Code
            </p>
            <p
              class="w-full p-2 font-mono text-xs font-thin rounded-md cursor-pointer select-text text-secondary hover:text-white hover:bg-misc-secondary"
              @click="copy(saveCode.code)"
            >
              {{ saveCode.code }}
            </p>
            <div class="card-actions">
              <button
                class="normal-case btn btn-sm btn-ghost"
                :class="(text === saveCode.code) ? 'btn-disabled font-lights' : ''" @click="copy(saveCode.code)"
              >
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
            <p
              class="w-full p-2 font-mono text-xs font-thin rounded-md cursor-pointer select-text text-secondary hover:text-white hover:bg-misc-secondary"
              @click="copy((useMarkdown) ? saveCode.linkMarkdown : saveCode.link)"
            >
              {{ (useMarkdown) ? saveCode.linkMarkdown : saveCode.link }}
            </p>
            <div class="card-actions">
              <button
                class="normal-case btn btn-sm btn-ghost"
                :class="(text === ((useMarkdown) ? saveCode.linkMarkdown : saveCode.link)) ? 'btn-disabled font-lights' : ''"
                @click="copy((useMarkdown) ? saveCode.linkMarkdown : saveCode.link)"
              >
                {{ (text === ((useMarkdown) ? saveCode.linkMarkdown : saveCode.link)) ? 'Copied!' : 'Copy' }}
                <font-awesome-icon :icon="['fas', 'copy']" />
              </button>
              <label class="grid items-center gap-2 py-2 text-xs font-semibold">
                <input v-model="useMarkdown" type="checkbox" class="rounded-sm toggle toggle-sm">
                <div class="font-normal">Markdown</div>
              </label>
              <!-- <p class="text-xs text-warning">
                <font-awesome-icon icon="exclamation-triangle" class="mr-1" />
                Planner links may get filtered by Reddit's site-wide filters, I'm working on resolving this.
              </p> -->
            </div>
          </div>
        </div>
      </div>
      <div v-if="activeTab === 'browser-tab'" id="browser-tab" class="mt-4">
        <div class="gap-2 card card-compact">
          <div class="relative flex flex-col p-4 px-3 rounded-md card-body bg-palia-blue-dark">
            <p class="card-title">
              Save to Browser
            </p>
            <div class="w-full form-control">
              <label class="sr-only label">
                <span class="label-text">Title</span>
              </label>
              <input
                v-model="title" type="text" placeholder="Enter title"
                class="w-full max-w-xs input input-bordered input-sm"
              >
              <p class="w-full pt-1 font-mono opacity-50 text-xxs">
                {{ saveCode.code }}
              </p>
            </div>
            <div class="flex gap-2">
              <button class="mt-4 normal-case btn btn-sm btn-outline" @click="saveWithoutClose">
                Save
              </button>
              <button class="mt-4 normal-case btn btn-sm btn-outline" @click="saveAndClose">
                Save and Close
              </button>
            </div>
          </div>

          <div class="card card-compact">
            <div class="relative flex flex-col p-4 px-3 rounded-md card-body bg-palia-blue-dark">
              <p class="card-title">
                Saved Layouts
              </p>
              <ul class="flex flex-col w-full gap-3 p-2 overflow-y-auto rounded-sm bg-base-100">
                <li v-for="(code, index) in savedGardenCodes" :key="index" class="flex justify-between">
                  <div class="flex flex-col gap-1">
                    <input
                      v-model="code.title" class="w-full max-w-xs py-0 pl-0 input input-ghost input-xs"
                      @change="editTitle(index, code.title)"
                    >
                    <p class="w-full pt-1 font-mono opacity-50 text-xxs leading-0">
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
    </template>
  </PGPModal>
</template>
