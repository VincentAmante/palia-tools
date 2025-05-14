<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { deleteGardenCode, loadSavedGardenCodes, savedGardenCodes } from './SaveLoadUtils'
import PGPModal from '@/components/PGPModal.vue'
import { useToasts } from '~/stores/useToasts'

const emit = defineEmits<{
  (e: 'load', code: string): void
}>()

const searchQuery = ref('')

const toasts = useToasts()

onMounted(() => {
  loadSavedGardenCodes()
})
const modal = ref<InstanceType<typeof PGPModal> | null>(null)
// const { confirm } = useConfirmDialog()

function openModal() {
  modal.value?.showModal()
  
  loadSavedGardenCodes()
}
defineExpose({
  openModal,
})

async function confirmDelete(index: number) {
  deleteGardenCode(index)
  toasts.addToast({
    message: 'Layout deleted',
    type: 'alert-success',
    duration: 2000,
  })
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
  return savedGardenCodes.value
    .filter(code => code.title.toLowerCase().includes(searchQuery.value.toLowerCase()))
    // .sort((codeA, codeB) => ((new Date(codeA.dateCreated).getTime() - new Date(codeB.dateCreated).getTime()) * -1))
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
      <div class="tabs tabs-box w-fit">
        <a class="px-2 tab" :class="{ 'tab-active': activeTab === 'clipboard-tab' }"
          @click="activeTab = 'clipboard-tab'">From Clipboard</a>
        <a class="px-2 tab" :class="{ 'tab-active': activeTab === 'browser-tab' }"
          @click="activeTab = 'browser-tab'">From Browser</a>
      </div>
      <div v-if="activeTab === 'clipboard-tab'" id="clipboard-tab" class="flex flex-col gap-2">
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
        <div class="card card-compact">
          <div class="relative flex flex-col p-4 px-3 rounded-md card-body bg-palia-blue-dark">
            <p class="card-title">
              Saved Layouts
            </p>
            <ul class="flex flex-col w-full gap-2 p-2 overflow-y-auto rounded-xs bg-base-100 max-h-90 md:max-h-[496px]">
              <li v-for="(code, index) in filteredSavedGardenCodes" :key="index"
                class="flex items-start justify-between w-full pb-2 border-b last:border-b-0 border-b-accent/20">
                <div class="max-w-2/3 md:max-w-3/4">
                  <p>{{ code.title }}</p>
                  <p class="font-mono leading-none opacity-50 text-xxs text-justify line-clamp-3 md:line-clamp-4">
                    {{ code.code }}
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
