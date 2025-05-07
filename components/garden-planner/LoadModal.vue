<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { deleteGardenCode, loadSavedGardenCodes, savedGardenCodes } from './SaveLoadUtils'
import PGPModal from '@/components/PGPModal.vue'

const emit = defineEmits<{
  (e: 'load', code: string): void
}>()

const searchQuery = ref('')

onMounted(() => {
  loadSavedGardenCodes()
})
const modal = ref<InstanceType<typeof PGPModal> | null>(null)
// const { confirm } = useConfirmDialog()

function openModal() {
  modal.value?.showModal()
}
defineExpose({
  openModal,
})

async function confirmDelete(index: number) {
  // const isConfirmed = await confirm('Are you sure you want to delete this layout?', 'Delete Layout')
  // if (isConfirmed) {
  // }

  deleteGardenCode(index)
}

const { text, copy } = useClipboard()

const activeTab = ref('browser-tab')

function load(code: string) {
  emit('load', code)
  modal.value?.hideModal()
}

function loadSavedCode(code: string) {
  emit('load', code)
  modal.value?.hideModal()
}

const filteredSavedGardenCodes = computed(() => {
  return savedGardenCodes.value.filter(code => code.title.toLowerCase().includes(searchQuery.value.toLowerCase()))
})

const loadCode = ref(text.value)
async function paste() {
  loadCode.value = await navigator.clipboard.readText()
}
</script>

<template>
  <PGPModal ref="modal" useFullHeight>
    <template #header>
      Load Layout
    </template>
    <template #body>
      <div class="tabs tabs-boxed">
        <a
          class="px-0 tab" :class="{ 'tab-active': activeTab === 'clipboard-tab' }"
          @click="activeTab = 'clipboard-tab'"
        >From Clipboard</a>
        <a class="px-0 tab" :class="{ 'tab-active': activeTab === 'browser-tab' }" @click="activeTab = 'browser-tab'">From Browser</a>
      </div>
      <div v-if="activeTab === 'clipboard-tab'" id="clipboard-tab" class="flex flex-col gap-2 mt-4">
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
      <div v-if="activeTab === 'browser-tab'" id="browser-tab" class="mt-4">
        <div class="card card-compact">
          <div class="relative flex flex-col p-4 px-3 rounded-md card-body bg-palia-blue-dark">
            <p class="card-title">
              Saved Layouts
            </p>
            <ul class="flex flex-col w-full gap-2 p-2 overflow-y-auto rounded-xs bg-base-100 max-h-80 md:max-h-[508px]">
              <li v-for="(code, index) in filteredSavedGardenCodes" :key="index" class="flex items-center justify-between w-full pb-2 border-b last:border-b-0 border-b-accent border-opacity-20">
                <div>
                  <p>{{ code.title }}</p>
                  <p class="font-mono leading-none opacity-50 text-xxs">
                    {{ code.code }}
                  </p>
                </div>
                <div class="flex gap-1">
                  <button
                    class="btn btn-xs btn-circle btn-ghost" @click="loadSavedCode(code.code)"
                  >
                    <font-awesome-icon class="text-sm" icon="download" />
                  </button>
                  <button
                    class="btn btn-xs btn-circle btn-ghost"
                    :class="{ 'btn-disabled': code.code === text }"
                    @click="copy(code.code)"
                  >
                    <font-awesome-icon class="text-sm" icon="copy" />
                  </button>
                  <button class="btn btn-xs btn-circle btn-ghost text-weed-prevention" @click="confirmDelete(index)">
                    <font-awesome-icon class="text-sm" icon="trash" />
                  </button>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </template>
  </PGPModal>
</template>
